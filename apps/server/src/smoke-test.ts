import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { io, type Socket } from "socket.io-client";
import type { AckResponse, RoomPublicState } from "@mln122/shared";

const port = 4199;
const base = `http://127.0.0.1:${port}`;
const dataFile = path.resolve("./data/smoke-rooms.json");
try { fs.rmSync(dataFile, { force: true }); } catch {}

const child = spawn(process.execPath, ["dist/index.js"], {
  cwd: process.cwd(),
  env: { ...process.env, PORT: String(port), DATA_FILE: dataFile },
  stdio: ["ignore", "pipe", "pipe"]
});

child.stdout.on("data", (data) => process.stdout.write(`[server] ${data}`));
child.stderr.on("data", (data) => process.stderr.write(`[server] ${data}`));

function sleep(ms: number) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function waitHealth() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const response = await fetch(`${base}/health`);
      if (response.ok) return;
    } catch {}
    await sleep(100);
  }
  throw new Error("Server did not start");
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(`${base}${url}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json() as { ok: boolean; data?: T; error?: string };
  if (!response.ok || !payload.ok || !payload.data) throw new Error(payload.error || "Request failed");
  return payload.data;
}

function waitConnected(socket: Socket): Promise<void> {
  return new Promise((resolve, reject) => {
    socket.once("connect", () => resolve());
    socket.once("connect_error", reject);
  });
}

function waitUntil(getState: () => RoomPublicState | null, predicate: (state: RoomPublicState) => boolean, timeoutMs = 5000): Promise<RoomPublicState> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const timer = setInterval(() => {
      const state = getState();
      if (state && predicate(state)) {
        clearInterval(timer);
        resolve(state);
        return;
      }
      if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        reject(new Error("Timed out waiting for room state"));
      }
    }, 25);
  });
}

function emitAck<T>(socket: Socket, event: string, payload: unknown = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.emit(event, payload, (response: AckResponse<T>) => {
      if (!response?.ok) reject(new Error(response?.error || `${event} failed`));
      else resolve(response.data as T);
    });
  });
}

try {
  await waitHealth();
  const room = await post<{ roomCode: string; hostToken: string }>("/api/rooms", {
    title: "Smoke Test",
    className: "MLN122",
    maxTeams: 5,
    defaultTeamSize: 5
  });
  const team = await post<{ teamId: string; teamCode: string; playerToken: string }>(`/api/rooms/${room.roomCode}/teams`, {
    name: "Khát Vọng Việt",
    leaderName: "An",
    memberLimit: 5,
    color: "#7c3aed"
  });
  const winningTeam = await post<{ teamId: string; teamCode: string; playerToken: string }>(`/api/rooms/${room.roomCode}/teams`, {
    name: "Thăng Long",
    leaderName: "Bình",
    memberLimit: 5,
    color: "#0ea5e9"
  });

  const hostSocket = io(base, { transports: ["websocket"], auth: { roomCode: room.roomCode, role: "host", token: room.hostToken } });
  const playerSocket = io(base, { transports: ["websocket"], auth: { roomCode: room.roomCode, role: "player", token: team.playerToken, teamId: team.teamId } });
  const winningPlayerSocket = io(base, { transports: ["websocket"], auth: { roomCode: room.roomCode, role: "player", token: winningTeam.playerToken, teamId: winningTeam.teamId } });
  const screenSocket = io(base, { transports: ["websocket"], auth: { roomCode: room.roomCode, role: "screen" } });
  let latestHost: RoomPublicState | null = null;
  let latestPlayer: RoomPublicState | null = null;
  let latestWinningPlayer: RoomPublicState | null = null;
  let latestScreen: RoomPublicState | null = null;
  hostSocket.on("room:state", (state: RoomPublicState) => { latestHost = state; });
  playerSocket.on("room:state", (state: RoomPublicState) => { latestPlayer = state; });
  winningPlayerSocket.on("room:state", (state: RoomPublicState) => { latestWinningPlayer = state; });
  screenSocket.on("room:state", (state: RoomPublicState) => { latestScreen = state; });
  await Promise.all([waitConnected(hostSocket), waitConnected(playerSocket), waitConnected(winningPlayerSocket), waitConnected(screenSocket)]);
  hostSocket.emit("room:request-state");
  playerSocket.emit("room:request-state");
  winningPlayerSocket.emit("room:request-state");
  screenSocket.emit("room:request-state");
  await waitUntil(() => latestHost, () => true);

  await emitAck(hostSocket, "host:start-game");
  await emitAck(hostSocket, "host:quiz-open-buzz");
  await emitAck(playerSocket, "player:quiz-buzz");
  const hostAnswerState = await waitUntil(() => latestHost, (state) => state.quiz.status === "answering" && state.quiz.question?.correctIndex !== undefined);
  const correctIndex = hostAnswerState.quiz.question!.correctIndex!;
  const wrongIndex = (correctIndex + 1) % hostAnswerState.quiz.question!.options!.length;
  await emitAck(playerSocket, "player:quiz-answer", { answerIndex: wrongIndex });
  const wrongTeamState = await waitUntil(
    () => latestPlayer,
    (state) => state.quiz.status === "buzzing" && state.quiz.eliminatedTeamIds.includes(team.teamId)
  );
  if (wrongTeamState.blindBoxes.length !== 0) {
    throw new Error("Wrong-answer team can see blind boxes");
  }

  await emitAck(winningPlayerSocket, "player:quiz-buzz");
  await waitUntil(
    () => latestHost,
    (state) => state.quiz.status === "answering" && state.quiz.answeringTeamId === winningTeam.teamId
  );
  await emitAck(winningPlayerSocket, "player:quiz-answer", { answerIndex: correctIndex });
  const eligibleState = await waitUntil(
    () => latestWinningPlayer,
    (state) => state.quiz.status === "blindbox" && state.quiz.pendingBlindBoxTeamId === winningTeam.teamId
  );
  const ineligibleState = await waitUntil(() => latestPlayer, (state) => state.quiz.status === "blindbox");
  const selectingScreenState = await waitUntil(() => latestScreen, (state) => state.quiz.status === "blindbox");
  if (eligibleState.blindBoxes.length === 0) {
    throw new Error("Correct-answer team cannot see blind boxes");
  }
  if (ineligibleState.blindBoxes.length !== 0 || ineligibleState.quiz.pendingBlindBoxTeamId !== null) {
    throw new Error("Ineligible team received blind-box selection data");
  }
  let blockedIneligibleOpen = false;
  try {
    await emitAck(playerSocket, "player:blindbox-open", { boxIndex: 0 });
  } catch {
    blockedIneligibleOpen = true;
  }
  if (!blockedIneligibleOpen) {
    throw new Error("Ineligible team was allowed to open a blind box");
  }
  if (selectingScreenState.blindBoxes.length === 0 || selectingScreenState.quiz.lastOpenedBlindBoxIndex !== null) {
    throw new Error("Presentation screen cannot show the live blind-box selection");
  }

  await emitAck(winningPlayerSocket, "player:blindbox-open", { boxIndex: 0 });
  const finalState = await waitUntil(() => latestWinningPlayer, (state) => state.quiz.status === "resolved");
  const finalScreenState = await waitUntil(
    () => latestScreen,
    (state) => state.quiz.status === "resolved" && state.quiz.lastOpenedBlindBoxIndex === 0
  );
  const updatedTeam = finalState.teams.find((item) => item.id === winningTeam.teamId);
  if (!updatedTeam || updatedTeam.capital < 100 || updatedTeam.correctAnswers !== 1) {
    throw new Error("Quiz reward or state synchronization failed");
  }
  if (!finalScreenState.blindBoxes[0]?.rewardName) {
    throw new Error("Presentation screen did not receive the revealed blind-box reward");
  }

  await emitAck(hostSocket, "host:event-open", { eventIndex: 0 });
  await waitUntil(() => latestScreen, (state) => state.phase === "event" && state.event.status === "open");
  await emitAck(winningPlayerSocket, "player:event-choose", { optionId: "localize", cardId: null });
  await waitUntil(
    () => latestHost,
    (state) => state.event.choicesByTeam[winningTeam.teamId]?.optionId === "localize"
  );
  await emitAck(hostSocket, "host:event-resolve");
  const eventScreenState = await waitUntil(
    () => latestScreen,
    (state) => state.event.status === "resolved" && Object.keys(state.event.resultsByTeam).length === 2
  );
  const chosenResult = eventScreenState.event.resultsByTeam[winningTeam.teamId];
  const automaticResult = eventScreenState.event.resultsByTeam[team.teamId];
  if (!chosenResult || chosenResult.automatic || chosenResult.optionId !== "localize") {
    throw new Error("Chosen event option was not resolved correctly");
  }
  if (chosenResult.capitalBefore - chosenResult.capitalAfter !== 90 || chosenResult.appliedEffects.autonomy !== 16) {
    throw new Error("Event capital or indicator effects are incorrect");
  }
  if (!automaticResult?.automatic || automaticResult.optionId !== "wait") {
    throw new Error("Missing event choice did not use the documented fallback option");
  }
  if (eventScreenState.teams.some((item) => item.scoreBreakdown.total !== item.score)) {
    throw new Error("Score breakdown does not match the ranking score");
  }

  await emitAck(hostSocket, "host:finish");
  await waitUntil(() => latestScreen, (state) => state.phase === "results" && state.status === "finished");

  hostSocket.disconnect();
  playerSocket.disconnect();
  winningPlayerSocket.disconnect();
  screenSocket.disconnect();
  console.log("SMOKE TEST PASS: blind boxes, event resolution, score breakdowns and presentation sync are working.");
} finally {
  child.kill("SIGTERM");
  try { fs.rmSync(dataFile, { force: true }); } catch {}
}

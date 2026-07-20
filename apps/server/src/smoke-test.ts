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

  const hostSocket = io(base, { transports: ["websocket"], auth: { roomCode: room.roomCode, role: "host", token: room.hostToken } });
  const playerSocket = io(base, { transports: ["websocket"], auth: { roomCode: room.roomCode, role: "player", token: team.playerToken, teamId: team.teamId } });
  let latestHost: RoomPublicState | null = null;
  let latestPlayer: RoomPublicState | null = null;
  hostSocket.on("room:state", (state: RoomPublicState) => { latestHost = state; });
  playerSocket.on("room:state", (state: RoomPublicState) => { latestPlayer = state; });
  await Promise.all([waitConnected(hostSocket), waitConnected(playerSocket)]);
  hostSocket.emit("room:request-state");
  playerSocket.emit("room:request-state");
  await waitUntil(() => latestHost, () => true);

  await emitAck(hostSocket, "host:start-game");
  await emitAck(hostSocket, "host:quiz-open-buzz");
  await emitAck(playerSocket, "player:quiz-buzz");
  const hostAnswerState = await waitUntil(() => latestHost, (state) => state.quiz.status === "answering" && state.quiz.question?.correctIndex !== undefined);
  const correctIndex = hostAnswerState.quiz.question!.correctIndex!;
  await emitAck(playerSocket, "player:quiz-answer", { answerIndex: correctIndex });
  await waitUntil(() => latestPlayer, (state) => state.quiz.status === "blindbox");
  await emitAck(playerSocket, "player:blindbox-open", { boxIndex: 0 });
  const finalState = await waitUntil(() => latestPlayer, (state) => state.quiz.status === "resolved");
  const updatedTeam = finalState.teams.find((item) => item.id === team.teamId);
  if (!updatedTeam || updatedTeam.capital < 100 || updatedTeam.correctAnswers !== 1) {
    throw new Error("Quiz reward or state synchronization failed");
  }

  hostSocket.disconnect();
  playerSocket.disconnect();
  console.log("SMOKE TEST PASS: room, team, realtime quiz, reward and blind box are working.");
} finally {
  child.kill("SIGTERM");
  try { fs.rmSync(dataFile, { force: true }); } catch {}
}

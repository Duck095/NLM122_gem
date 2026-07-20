import "dotenv/config";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import express from "express";
import { Server, type Socket } from "socket.io";
import { z } from "zod";
import type { AckResponse, IndicatorKey, SocketAuthPayload } from "@mln122/shared";
import { GameEngine } from "./game-engine.js";
import { RoomStore } from "./store.js";
import { normalizeText } from "./utils.js";

const PORT = Number(process.env.PORT || 4000);
const WEB_ORIGIN = process.env.WEB_ORIGIN || "http://localhost:5173";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
  transports: ["websocket", "polling"]
});
const store = new RoomStore();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "200kb" }));

const roomSchema = z.object({
  title: z.string().trim().min(2).max(100),
  className: z.string().trim().min(1).max(100),
  maxTeams: z.coerce.number().int().min(2).max(10),
  defaultTeamSize: z.coerce.number().int().min(2).max(15)
});

const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(60),
  leaderName: z.string().trim().min(1).max(50),
  memberLimit: z.coerce.number().int().min(2).max(15),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/)
});

const joinTeamSchema = z.object({
  teamCode: z.string().trim().min(4).max(8),
  playerName: z.string().trim().min(1).max(50)
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "MLN122 realtime server", time: new Date().toISOString() });
});

app.post("/api/rooms", (req, res) => {
  const parsed = roomSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: "Thông tin tạo phòng không hợp lệ" });
  }
  const { room, hostToken } = store.createRoom({
    title: normalizeText(parsed.data.title),
    className: normalizeText(parsed.data.className),
    maxTeams: parsed.data.maxTeams,
    defaultTeamSize: parsed.data.defaultTeamSize
  });
  return res.status(201).json({
    ok: true,
    data: { roomCode: room.code, hostToken }
  });
});

app.get("/api/rooms/:code", (req, res) => {
  const room = store.get(String(req.params.code));
  if (!room) return res.status(404).json({ ok: false, error: "Mã phòng không tồn tại" });
  return res.json({
    ok: true,
    data: {
      roomCode: room.code,
      title: room.title,
      className: room.className,
      status: room.status,
      locked: room.locked,
      teamCount: room.teams.length,
      maxTeams: room.maxTeams,
      defaultTeamSize: room.defaultTeamSize,
      teams: room.teams.map((team) => ({
        id: team.id,
        code: team.code,
        name: team.name,
        members: team.members.length,
        memberLimit: team.memberLimit,
        color: team.color
      }))
    }
  });
});

app.post("/api/rooms/:code/teams", (req, res) => {
  const room = store.get(String(req.params.code));
  if (!room) return res.status(404).json({ ok: false, error: "Mã phòng không tồn tại" });
  const parsed = createTeamSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: "Thông tin tập đoàn không hợp lệ" });
  try {
    const result = store.createTeam(room, parsed.data);
    void emitRoomState(room.code);
    return res.status(201).json({
      ok: true,
      data: {
        teamId: result.team.id,
        teamCode: result.team.code,
        playerToken: result.playerToken
      }
    });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error instanceof Error ? error.message : "Không thể tạo tập đoàn" });
  }
});

app.post("/api/rooms/:code/teams/join", (req, res) => {
  const room = store.get(String(req.params.code));
  if (!room) return res.status(404).json({ ok: false, error: "Mã phòng không tồn tại" });
  const parsed = joinTeamSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false, error: "Thông tin tham gia không hợp lệ" });
  try {
    const result = store.joinTeam(room, parsed.data.teamCode, parsed.data.playerName);
    void emitRoomState(room.code);
    return res.status(201).json({
      ok: true,
      data: {
        teamId: result.team.id,
        teamCode: result.team.code,
        playerToken: result.playerToken
      }
    });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error instanceof Error ? error.message : "Không thể tham gia tập đoàn" });
  }
});

interface SocketData {
  roomCode: string;
  role: "host" | "player" | "screen";
  teamId?: string;
}

type GameSocket = Socket<any, any, any, SocketData>;

async function emitRoomState(roomCode: string): Promise<void> {
  const room = store.get(roomCode);
  if (!room) return;
  const sockets = await io.in(roomCode).fetchSockets();
  sockets.forEach((socket) => {
    const { role, teamId } = socket.data as SocketData;
    socket.emit("room:state", store.serialize(room, role, teamId));
  });
}

const engine = new GameEngine(store, emitRoomState);

io.use((socket, next) => {
  const auth = socket.handshake.auth as SocketAuthPayload;
  const roomCode = String(auth?.roomCode || "");
  const room = store.get(roomCode);
  if (!room) return next(new Error("Mã phòng không tồn tại"));
  if (auth.role === "host") {
    if (!store.validateHost(room, auth.token)) return next(new Error("Không có quyền giảng viên"));
    socket.data = { roomCode, role: "host" };
    return next();
  }
  if (auth.role === "player") {
    const team = store.validatePlayer(room, auth.teamId, auth.token);
    if (!team) return next(new Error("Phiên đội chơi không hợp lệ"));
    socket.data = { roomCode, role: "player", teamId: team.id };
    return next();
  }
  if (auth.role === "screen") {
    socket.data = { roomCode, role: "screen" };
    return next();
  }
  return next(new Error("Vai trò không hợp lệ"));
});

function acknowledge<T>(ack: ((response: AckResponse<T>) => void) | undefined, fn: () => T): void {
  try {
    const data = fn();
    ack?.({ ok: true, data });
  } catch (error) {
    ack?.({ ok: false, error: error instanceof Error ? error.message : "Thao tác thất bại" });
  }
}

function requireHost(socket: GameSocket): string {
  if (socket.data.role !== "host") throw new Error("Chỉ giảng viên được thực hiện thao tác này");
  return socket.data.roomCode;
}

function requirePlayer(socket: GameSocket): { roomCode: string; teamId: string } {
  if (socket.data.role !== "player" || !socket.data.teamId) throw new Error("Chỉ đội chơi được thực hiện thao tác này");
  return { roomCode: socket.data.roomCode, teamId: socket.data.teamId };
}

io.on("connection", (rawSocket) => {
  const socket = rawSocket as GameSocket;
  const { roomCode } = socket.data;
  socket.join(roomCode);
  const room = store.get(roomCode);
  if (room) socket.emit("room:state", store.serialize(room, socket.data.role, socket.data.teamId));

  socket.on("room:request-state", () => {
    const liveRoom = store.get(roomCode);
    if (liveRoom) socket.emit("room:state", store.serialize(liveRoom, socket.data.role, socket.data.teamId));
  });

  socket.on("host:set-locked", (payload: { locked: boolean }, ack) =>
    acknowledge(ack, () => engine.setLocked(requireHost(socket), Boolean(payload.locked)))
  );
  socket.on("host:start-game", (_payload, ack) =>
    acknowledge(ack, () => engine.startGame(requireHost(socket)))
  );
  socket.on("host:set-phase", (payload: { phase: "lobby" | "quiz" | "auction" | "event" | "strategy" | "results" }, ack) =>
    acknowledge(ack, () => engine.setPhase(requireHost(socket), payload.phase))
  );
  socket.on("host:quiz-preview", (payload: { questionIndex: number }, ack) =>
    acknowledge(ack, () => engine.previewQuestion(requireHost(socket), Number(payload.questionIndex)))
  );
  socket.on("host:quiz-open-buzz", (_payload, ack) =>
    acknowledge(ack, () => engine.openBuzz(requireHost(socket)))
  );
  socket.on("host:quiz-reveal", (_payload, ack) =>
    acknowledge(ack, () => engine.revealQuestion(requireHost(socket)))
  );
  socket.on("host:quiz-next", (_payload, ack) =>
    acknowledge(ack, () => engine.nextQuestion(requireHost(socket)))
  );
  socket.on("player:quiz-buzz", (_payload, ack) =>
    acknowledge(ack, () => {
      const auth = requirePlayer(socket);
      return engine.buzz(auth.roomCode, auth.teamId);
    })
  );
  socket.on("player:quiz-answer", (payload: { answerIndex: number }, ack) =>
    acknowledge(ack, () => {
      const auth = requirePlayer(socket);
      return engine.submitAnswer(auth.roomCode, auth.teamId, Number(payload.answerIndex));
    })
  );
  socket.on("player:blindbox-open", (payload: { boxIndex: number }, ack) =>
    acknowledge(ack, () => {
      const auth = requirePlayer(socket);
      return engine.openBlindBox(auth.roomCode, auth.teamId, Number(payload.boxIndex));
    })
  );
  socket.on("host:auction-open", (payload: { projectIndex: number }, ack) =>
    acknowledge(ack, () => engine.openAuction(requireHost(socket), Number(payload.projectIndex)))
  );
  socket.on("host:auction-close", (_payload, ack) =>
    acknowledge(ack, () => engine.closeAuction(requireHost(socket)))
  );
  socket.on("player:auction-bid", (payload: { amount: number }, ack) =>
    acknowledge(ack, () => {
      const auth = requirePlayer(socket);
      return engine.placeBid(auth.roomCode, auth.teamId, Number(payload.amount));
    })
  );
  socket.on("player:auction-select-discount", (payload: { cardId: string | null }, ack) =>
    acknowledge(ack, () => {
      const auth = requirePlayer(socket);
      return engine.selectAuctionDiscount(auth.roomCode, auth.teamId, payload.cardId || null);
    })
  );
  socket.on("host:event-open", (payload: { eventIndex: number }, ack) =>
    acknowledge(ack, () => engine.openEvent(requireHost(socket), Number(payload.eventIndex)))
  );
  socket.on("host:event-resolve", (_payload, ack) =>
    acknowledge(ack, () => engine.resolveEvent(requireHost(socket)))
  );
  socket.on("player:event-choose", (payload: { optionId: string; cardId: string | null }, ack) =>
    acknowledge(ack, () => {
      const auth = requirePlayer(socket);
      return engine.chooseEvent(auth.roomCode, auth.teamId, String(payload.optionId), payload.cardId || null);
    })
  );
  socket.on("host:strategy-open", (_payload, ack) =>
    acknowledge(ack, () => engine.openStrategy(requireHost(socket)))
  );
  socket.on("host:strategy-resolve", (_payload, ack) =>
    acknowledge(ack, () => engine.resolveStrategy(requireHost(socket)))
  );
  socket.on("player:strategy-choose", (payload: { packageId: string }, ack) =>
    acknowledge(ack, () => {
      const auth = requirePlayer(socket);
      return engine.chooseStrategy(auth.roomCode, auth.teamId, String(payload.packageId));
    })
  );
  socket.on("host:finish", (_payload, ack) =>
    acknowledge(ack, () => engine.finish(requireHost(socket)))
  );
  socket.on("host:adjust-capital", (payload: { teamId: string; delta: number }, ack) =>
    acknowledge(ack, () => engine.adjustCapital(requireHost(socket), String(payload.teamId), Number(payload.delta)))
  );
  socket.on("host:adjust-indicator", (payload: { teamId: string; key: IndicatorKey; delta: number }, ack) =>
    acknowledge(ack, () => engine.adjustIndicator(requireHost(socket), String(payload.teamId), payload.key, Number(payload.delta)))
  );
});

const webDist = path.resolve(__dirname, "../../web/dist");
if (process.env.NODE_ENV === "production" || process.env.SERVE_WEB === "true") {
  app.use(express.static(webDist));
  app.get("/{*splat}", (_req, res) => res.sendFile(path.join(webDist, "index.html")));
}

server.listen(PORT, "0.0.0.0", () => {
  console.log(`MLN122 server running at http://localhost:${PORT}`);
  console.log(`Allowed web origin: ${WEB_ORIGIN}`);
});

process.on("SIGINT", () => {
  store.saveNow();
  process.exit(0);
});
process.on("SIGTERM", () => {
  store.saveNow();
  process.exit(0);
});

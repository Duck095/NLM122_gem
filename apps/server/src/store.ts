import fs from "node:fs";
import path from "node:path";
import type {
  BlindBoxPublic,
  QuestionPublic,
  RoomPublicState,
  SocketRole,
  TeamPublic
} from "@mln122/shared";
import {
  BLIND_REWARDS,
  EVENTS,
  INITIAL_INDICATORS,
  PROJECTS,
  QUESTIONS,
  STRATEGY_PACKAGES
} from "./game-data.js";
import type { RoomInternal, TeamInternal } from "./types.js";
import {
  createId,
  createRoomCode,
  createTeamCode,
  createToken,
  shuffle,
  teamScore,
  teamScoreBreakdown
} from "./utils.js";

export class RoomStore {
  private rooms = new Map<string, RoomInternal>();
  private readonly dataFile: string;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(dataFile?: string) {
    this.dataFile = path.resolve(dataFile || process.env.DATA_FILE || "./data/rooms.json");
    this.load();
  }

  private load(): void {
    try {
      if (!fs.existsSync(this.dataFile)) return;
      const raw = fs.readFileSync(this.dataFile, "utf8");
      if (!raw.trim()) return;
      const parsed = JSON.parse(raw) as RoomInternal[];
      parsed.forEach((room) => {
        room.quiz.lastOpenedBlindBoxIndex ??= null;
        room.event.resultsByTeam ??= {};
        if (room.quiz.status === "answering" || room.quiz.status === "mandatory") {
          room.quiz.status = "buzzing";
          room.quiz.answeringTeamId = null;
          room.quiz.discussionDeadline = null;
          room.quiz.mandatoryDeadline = null;
          room.quiz.lastOutcome = {
            type: "info",
            message: "Máy chủ đã khởi động lại. Lượt giành quyền được mở lại."
          };
        }
        this.rooms.set(room.code, room);
      });
    } catch (error) {
      console.error("Không thể đọc dữ liệu phòng:", error);
    }
  }

  scheduleSave(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveNow(), 80);
  }

  saveNow(): void {
    try {
      fs.mkdirSync(path.dirname(this.dataFile), { recursive: true });
      const temp = `${this.dataFile}.tmp`;
      fs.writeFileSync(temp, JSON.stringify([...this.rooms.values()], null, 2), "utf8");
      fs.renameSync(temp, this.dataFile);
    } catch (error) {
      console.error("Không thể lưu dữ liệu phòng:", error);
    }
  }

  allRoomCodes(): Set<string> {
    return new Set(this.rooms.keys());
  }

  get(code: string): RoomInternal | undefined {
    return this.rooms.get(code);
  }

  createRoom(input: {
    title: string;
    className: string;
    maxTeams: number;
    defaultTeamSize: number;
  }): { room: RoomInternal; hostToken: string } {
    const code = createRoomCode(this.allRoomCodes());
    const hostToken = createToken();
    const now = Date.now();
    const room: RoomInternal = {
      code,
      title: input.title,
      className: input.className,
      hostToken,
      status: "waiting",
      locked: false,
      phase: "lobby",
      maxTeams: input.maxTeams,
      defaultTeamSize: input.defaultTeamSize,
      teams: [],
      quiz: {
        questionIndex: 0,
        question: null,
        status: "idle",
        answeringTeamId: null,
        eliminatedTeamIds: [],
        buzzRound: 0,
        discussionDeadline: null,
        mandatoryDeadline: null,
        pendingBlindBoxTeamId: null,
        lastOpenedBlindBoxIndex: null,
        lastOutcome: null
      },
      blindBoxes: shuffle(BLIND_REWARDS).map((reward, index) => ({
        index,
        opened: false,
        reward
      })),
      auction: {
        status: "idle",
        projectIndex: 0,
        project: PROJECTS[0],
        currentBid: PROJECTS[0].startPrice,
        leaderTeamId: null,
        minIncrement: 10,
        bids: [],
        selectedDiscountCardIdByTeam: {},
        lastResult: null
      },
      event: {
        status: "idle",
        eventIndex: 0,
        event: EVENTS[0],
        choicesByTeam: {},
        resolvedTeamIds: [],
        resultsByTeam: {}
      },
      strategy: {
        status: "idle",
        choicesByTeam: {},
        resolvedTeamIds: [],
        packages: STRATEGY_PACKAGES
      },
      logs: [],
      createdAt: now,
      updatedAt: now
    };
    this.rooms.set(code, room);
    this.addLog(room, `Phòng ${code} đã được tạo.`, "success");
    this.scheduleSave();
    return { room, hostToken };
  }

  createTeam(
    room: RoomInternal,
    input: { name: string; leaderName: string; memberLimit: number; color: string }
  ): { team: TeamInternal; playerToken: string } {
    if (room.locked || room.status !== "waiting") throw new Error("Phòng đã khóa hoặc đã bắt đầu");
    if (room.teams.length >= room.maxTeams) throw new Error("Phòng đã đủ số tập đoàn");
    if (room.teams.some((team) => team.name.toLowerCase() === input.name.toLowerCase())) {
      throw new Error("Tên tập đoàn đã được sử dụng");
    }
    const teamCode = createTeamCode(new Set(room.teams.map((team) => team.code)));
    const playerToken = createToken();
    const now = Date.now();
    const team: TeamInternal = {
      id: createId("team"),
      code: teamCode,
      name: input.name,
      leaderName: input.leaderName,
      memberLimit: input.memberLimit,
      members: [
        {
          id: createId("member"),
          name: input.leaderName,
          token: playerToken,
          joinedAt: now
        }
      ],
      color: input.color,
      capital: 0,
      indicators: { ...INITIAL_INDICATORS },
      cards: [],
      projects: [],
      correctAnswers: 0
    };
    room.teams.push(team);
    room.updatedAt = now;
    this.addLog(room, `${team.name} đã được thành lập.`, "success");
    this.scheduleSave();
    return { team, playerToken };
  }

  joinTeam(room: RoomInternal, teamCode: string, playerName: string): { team: TeamInternal; playerToken: string } {
    if (room.locked || room.status !== "waiting") throw new Error("Phòng đã khóa hoặc đã bắt đầu");
    const team = room.teams.find((item) => item.code.toUpperCase() === teamCode.toUpperCase());
    if (!team) throw new Error("Không tìm thấy mã tập đoàn");
    if (team.members.length >= team.memberLimit) throw new Error("Tập đoàn đã đủ thành viên");
    const playerToken = createToken();
    team.members.push({
      id: createId("member"),
      name: playerName,
      token: playerToken,
      joinedAt: Date.now()
    });
    room.updatedAt = Date.now();
    this.addLog(room, `${playerName} đã tham gia ${team.name}.`, "info");
    this.scheduleSave();
    return { team, playerToken };
  }

  validateHost(room: RoomInternal, token: string | undefined): boolean {
    return Boolean(token && token === room.hostToken);
  }

  validatePlayer(room: RoomInternal, teamId: string | undefined, token: string | undefined): TeamInternal | null {
    if (!teamId || !token) return null;
    const team = room.teams.find((item) => item.id === teamId);
    if (!team) return null;
    return team.members.some((member) => member.token === token) ? team : null;
  }

  addLog(room: RoomInternal, message: string, tone: "info" | "success" | "warning" = "info"): void {
    room.logs.unshift({ id: createId("log"), at: Date.now(), message, tone });
    room.logs = room.logs.slice(0, 60);
    room.updatedAt = Date.now();
  }

  serialize(room: RoomInternal, role: SocketRole, teamId?: string): RoomPublicState {
    const ranked = [...room.teams]
      .map((team) => ({ team, score: teamScore(team) }))
      .sort((a, b) => b.score - a.score || b.team.capital - a.team.capital);
    const rankMap = new Map(ranked.map((item, index) => [item.team.id, index + 1]));

    const teams: TeamPublic[] = room.teams.map((team) => ({
      id: team.id,
      code: role === "host" || team.id === teamId ? team.code : "••••",
      name: team.name,
      leaderName: team.leaderName,
      memberLimit: team.memberLimit,
      members: team.members.map(({ id, name, joinedAt }) => ({ id, name, joinedAt })),
      color: team.color,
      capital: team.capital,
      indicators: { ...team.indicators },
      cards:
        role === "host" || team.id === teamId
          ? team.cards.map((card) => ({ ...card }))
          : [],
      projects: team.projects.map((project) => ({ ...project, effects: { ...project.effects } })),
      correctAnswers: team.correctAnswers,
      scoreBreakdown: teamScoreBreakdown(team),
      score: teamScore(team),
      rank: rankMap.get(team.id) ?? room.teams.length
    }));

    const definition = QUESTIONS[room.quiz.questionIndex];
    let question: QuestionPublic | null = null;
    if (definition && room.quiz.status !== "idle") {
      const canSeeOptions =
        role === "host" ||
        role === "screen" ||
        room.quiz.status === "resolved" ||
        (role === "player" && teamId === room.quiz.answeringTeamId && ["answering", "mandatory"].includes(room.quiz.status));
      question = {
        id: definition.id,
        number: room.quiz.questionIndex + 1,
        prompt: definition.prompt,
        ...(canSeeOptions ? { options: [...definition.options] } : {}),
        ...(role === "host" || room.quiz.status === "resolved"
          ? { correctIndex: definition.correctIndex, explanation: definition.explanation }
          : {})
      };
    }

    const playerCanChooseBlindBox =
      role === "player" &&
      room.quiz.status === "blindbox" &&
      teamId === room.quiz.pendingBlindBoxTeamId;
    const canSeeBlindBoxes = role !== "player" || playerCanChooseBlindBox;
    const blindBoxes: BlindBoxPublic[] = canSeeBlindBoxes
      ? room.blindBoxes.map((box) => ({
          index: box.index,
          opened: box.opened,
          ...(box.opened
            ? {
                openedByTeamId: box.openedByTeamId,
                rewardName: box.reward.name,
                rewardDescription: box.reward.description
              }
            : {})
        }))
      : [];

    const eventChoices =
      role === "host" || room.event.status === "resolved"
        ? { ...room.event.choicesByTeam }
        : Object.fromEntries(
            Object.entries(room.event.choicesByTeam).filter(([id]) => id === teamId)
          );

    const strategyChoices =
      role === "host" || room.strategy.status === "resolved"
        ? { ...room.strategy.choicesByTeam }
        : Object.fromEntries(
            Object.entries(room.strategy.choicesByTeam).filter(([id]) => id === teamId)
          );

    return {
      code: room.code,
      title: room.title,
      className: room.className,
      status: room.status,
      locked: room.locked,
      phase: room.phase,
      maxTeams: room.maxTeams,
      defaultTeamSize: room.defaultTeamSize,
      teams,
      quiz: {
        ...room.quiz,
        pendingBlindBoxTeamId:
          role === "player" && !playerCanChooseBlindBox
            ? null
            : room.quiz.pendingBlindBoxTeamId,
        question
      },
      blindBoxes,
      auction: {
        ...room.auction,
        project: PROJECTS[room.auction.projectIndex] ?? null,
        bids: [...room.auction.bids],
        selectedDiscountCardIdByTeam:
          role === "host"
            ? { ...room.auction.selectedDiscountCardIdByTeam }
            : Object.fromEntries(
                Object.entries(room.auction.selectedDiscountCardIdByTeam).filter(([id]) => id === teamId)
              )
      },
      event: {
        ...room.event,
        event: EVENTS[room.event.eventIndex] ?? null,
        choicesByTeam: eventChoices
      },
      strategy: {
        ...room.strategy,
        choicesByTeam: strategyChoices,
        packages: STRATEGY_PACKAGES
      },
      logs: room.logs.slice(0, 30),
      createdAt: room.createdAt,
      updatedAt: room.updatedAt
    };
  }
}

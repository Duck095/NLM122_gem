import type { IndicatorKey } from "@mln122/shared";
import { EVENTS, PROJECTS, QUESTIONS, STRATEGY_PACKAGES } from "./game-data.js";
import { RoomStore } from "./store.js";
import type { RoomInternal, TeamInternal } from "./types.js";
import {
  addCard,
  applyIndicatorEffects,
  clampIndicator,
  findUsableCard,
  markCardUsed
} from "./utils.js";

export class GameEngine {
  private readonly timers = new Map<string, NodeJS.Timeout[]>();

  constructor(
    private readonly store: RoomStore,
    private readonly emitRoom: (roomCode: string) => Promise<void> | void
  ) {}

  private requireRoom(code: string): RoomInternal {
    const room = this.store.get(code);
    if (!room) throw new Error("Phòng không tồn tại");
    return room;
  }

  private requireTeam(room: RoomInternal, teamId: string): TeamInternal {
    const team = room.teams.find((item) => item.id === teamId);
    if (!team) throw new Error("Không tìm thấy tập đoàn");
    return team;
  }

  private changed(room: RoomInternal): void {
    room.updatedAt = Date.now();
    this.store.scheduleSave();
    void this.emitRoom(room.code);
  }

  private clearTimers(roomCode: string): void {
    const timers = this.timers.get(roomCode) ?? [];
    timers.forEach((timer) => clearTimeout(timer));
    this.timers.delete(roomCode);
  }

  private addTimer(roomCode: string, timer: NodeJS.Timeout): void {
    const timers = this.timers.get(roomCode) ?? [];
    timers.push(timer);
    this.timers.set(roomCode, timers);
  }

  setLocked(roomCode: string, locked: boolean): void {
    const room = this.requireRoom(roomCode);
    room.locked = locked;
    this.store.addLog(room, locked ? "Phòng đã được khóa." : "Phòng đã được mở lại.", "info");
    this.changed(room);
  }

  startGame(roomCode: string): void {
    const room = this.requireRoom(roomCode);
    if (room.teams.length < 1) throw new Error("Cần ít nhất một tập đoàn để bắt đầu");
    room.locked = true;
    room.status = "active";
    room.phase = "quiz";
    room.quiz.questionIndex = 0;
    room.quiz.status = "preview";
    room.quiz.answeringTeamId = null;
    room.quiz.eliminatedTeamIds = [];
    room.quiz.buzzRound = 0;
    room.quiz.lastOutcome = { type: "info", message: "Câu hỏi đầu tiên đã sẵn sàng." };
    this.store.addLog(room, "Trò chơi đã bắt đầu.", "success");
    this.changed(room);
  }

  setPhase(roomCode: string, phase: RoomInternal["phase"]): void {
    const room = this.requireRoom(roomCode);
    room.phase = phase;
    if (phase === "results") {
      room.status = "finished";
    }
    this.store.addLog(room, `Chuyển sang giai đoạn ${phase}.`, "info");
    this.changed(room);
  }

  previewQuestion(roomCode: string, questionIndex: number): void {
    const room = this.requireRoom(roomCode);
    if (!QUESTIONS[questionIndex]) throw new Error("Câu hỏi không hợp lệ");
    this.clearTimers(roomCode);
    room.phase = "quiz";
    room.quiz.questionIndex = questionIndex;
    room.quiz.status = "preview";
    room.quiz.answeringTeamId = null;
    room.quiz.eliminatedTeamIds = [];
    room.quiz.buzzRound = 0;
    room.quiz.discussionDeadline = null;
    room.quiz.mandatoryDeadline = null;
    room.quiz.pendingBlindBoxTeamId = null;
    room.quiz.lastOutcome = { type: "info", message: `Câu hỏi ${questionIndex + 1} đã được trình chiếu.` };
    this.store.addLog(room, `Đã mở câu hỏi ${questionIndex + 1}/15.`, "info");
    this.changed(room);
  }

  openBuzz(roomCode: string): void {
    const room = this.requireRoom(roomCode);
    if (room.phase !== "quiz") room.phase = "quiz";
    if (!["preview", "resolved", "buzzing"].includes(room.quiz.status)) {
      throw new Error("Chưa thể mở giành quyền ở trạng thái hiện tại");
    }
    this.clearTimers(roomCode);
    room.quiz.status = "buzzing";
    room.quiz.answeringTeamId = null;
    room.quiz.discussionDeadline = null;
    room.quiz.mandatoryDeadline = null;
    room.quiz.buzzRound = Math.max(1, room.quiz.buzzRound + 1);
    room.quiz.lastOutcome = {
      type: "info",
      message: `Lượt giành quyền ${room.quiz.buzzRound} đã mở.`
    };
    this.store.addLog(room, `Mở lượt giành quyền ${room.quiz.buzzRound}.`, "info");
    this.changed(room);
  }

  buzz(roomCode: string, teamId: string): void {
    const room = this.requireRoom(roomCode);
    const team = this.requireTeam(room, teamId);
    if (room.quiz.status !== "buzzing") throw new Error("Chưa mở quyền trả lời");
    if (room.quiz.eliminatedTeamIds.includes(teamId)) throw new Error("Tập đoàn đã hết quyền ở câu này");
    room.quiz.status = "answering";
    room.quiz.answeringTeamId = teamId;
    room.quiz.discussionDeadline = Date.now() + 15_000;
    room.quiz.mandatoryDeadline = null;
    room.quiz.lastOutcome = { type: "info", message: `${team.name} đang thảo luận.`, teamId };
    this.store.addLog(room, `${team.name} giành quyền trả lời.`, "success");
    this.changed(room);

    const discussionTimer = setTimeout(() => {
      const liveRoom = this.store.get(roomCode);
      if (!liveRoom || liveRoom.quiz.status !== "answering" || liveRoom.quiz.answeringTeamId !== teamId) return;
      liveRoom.quiz.status = "mandatory";
      liveRoom.quiz.mandatoryDeadline = Date.now() + 5_000;
      liveRoom.quiz.lastOutcome = {
        type: "info",
        message: `${team.name} phải chốt đáp án trong 5 giây.`,
        teamId
      };
      this.changed(liveRoom);

      const mandatoryTimer = setTimeout(() => {
        const current = this.store.get(roomCode);
        if (!current || current.quiz.status !== "mandatory" || current.quiz.answeringTeamId !== teamId) return;
        this.handleFailedAttempt(current, teamId, "timeout");
      }, 5_050);
      this.addTimer(roomCode, mandatoryTimer);
    }, 15_050);
    this.addTimer(roomCode, discussionTimer);
  }

  submitAnswer(roomCode: string, teamId: string, answerIndex: number): { correct: boolean } {
    const room = this.requireRoom(roomCode);
    const team = this.requireTeam(room, teamId);
    if (!["answering", "mandatory"].includes(room.quiz.status) || room.quiz.answeringTeamId !== teamId) {
      throw new Error("Tập đoàn không có quyền trả lời");
    }
    const question = QUESTIONS[room.quiz.questionIndex];
    if (!question || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex >= question.options.length) {
      throw new Error("Đáp án không hợp lệ");
    }
    this.clearTimers(roomCode);
    if (answerIndex === question.correctIndex) {
      team.capital += 100;
      team.correctAnswers += 1;
      room.quiz.status = "blindbox";
      room.quiz.pendingBlindBoxTeamId = teamId;
      room.quiz.answeringTeamId = teamId;
      room.quiz.discussionDeadline = null;
      room.quiz.mandatoryDeadline = null;
      room.quiz.lastOutcome = {
        type: "correct",
        message: `${team.name} trả lời chính xác và nhận 100 triệu cùng một lượt chọn túi mù.`,
        teamId
      };
      this.store.addLog(room, `${team.name} trả lời đúng, nhận 100 triệu.`, "success");
      this.changed(room);
      return { correct: true };
    }

    this.handleFailedAttempt(room, teamId, "wrong");
    return { correct: false };
  }

  private handleFailedAttempt(room: RoomInternal, teamId: string, reason: "wrong" | "timeout"): void {
    this.clearTimers(room.code);
    const team = this.requireTeam(room, teamId);
    if (!room.quiz.eliminatedTeamIds.includes(teamId)) room.quiz.eliminatedTeamIds.push(teamId);
    room.quiz.answeringTeamId = null;
    room.quiz.discussionDeadline = null;
    room.quiz.mandatoryDeadline = null;
    const remaining = room.teams.filter((item) => !room.quiz.eliminatedTeamIds.includes(item.id));
    if (remaining.length === 0) {
      room.quiz.status = "resolved";
      room.quiz.lastOutcome = {
        type: "no_answer",
        message: "Không còn tập đoàn nào có quyền trả lời. Đáp án đúng đã được công bố."
      };
      this.store.addLog(room, "Câu hỏi kết thúc mà không có đáp án đúng.", "warning");
    } else {
      room.quiz.status = "buzzing";
      room.quiz.buzzRound += 1;
      room.quiz.lastOutcome = {
        type: reason,
        message:
          reason === "wrong"
            ? `${team.name} trả lời chưa chính xác. Các tập đoàn còn lại tranh quyền lần ${room.quiz.buzzRound}.`
            : `${team.name} hết thời gian. Các tập đoàn còn lại tranh quyền lần ${room.quiz.buzzRound}.`,
        teamId
      };
      this.store.addLog(
        room,
        reason === "wrong" ? `${team.name} trả lời sai.` : `${team.name} hết thời gian trả lời.`,
        "warning"
      );
    }
    this.changed(room);
  }

  revealQuestion(roomCode: string): void {
    const room = this.requireRoom(roomCode);
    this.clearTimers(roomCode);
    room.quiz.status = "resolved";
    room.quiz.answeringTeamId = null;
    room.quiz.pendingBlindBoxTeamId = null;
    room.quiz.discussionDeadline = null;
    room.quiz.mandatoryDeadline = null;
    room.quiz.lastOutcome = { type: "info", message: "Đáp án đúng đã được công bố." };
    this.changed(room);
  }

  nextQuestion(roomCode: string): void {
    const room = this.requireRoom(roomCode);
    const nextIndex = room.quiz.questionIndex + 1;
    if (nextIndex >= QUESTIONS.length) {
      room.phase = "auction";
      room.quiz.status = "resolved";
      this.store.addLog(room, "Đã hoàn thành 15 câu hỏi. Chuyển sang đấu giá.", "success");
      this.changed(room);
      return;
    }
    this.previewQuestion(roomCode, nextIndex);
  }

  openBlindBox(roomCode: string, teamId: string, boxIndex: number): void {
    const room = this.requireRoom(roomCode);
    const team = this.requireTeam(room, teamId);
    if (room.quiz.status !== "blindbox" || room.quiz.pendingBlindBoxTeamId !== teamId) {
      throw new Error("Tập đoàn chưa có lượt chọn túi mù");
    }
    const box = room.blindBoxes.find((item) => item.index === boxIndex);
    if (!box) throw new Error("Túi mù không hợp lệ");
    if (box.opened) throw new Error("Túi mù đã được mở");

    box.opened = true;
    box.openedByTeamId = teamId;
    const reward = box.reward;
    if (reward.kind === "capital") {
      team.capital += reward.capital ?? 0;
    } else if (reward.kind === "indicator" && reward.indicator) {
      team.indicators[reward.indicator] = clampIndicator(
        team.indicators[reward.indicator] + (reward.points ?? 0)
      );
    } else if (reward.kind === "card" && reward.cardType) {
      addCard(team, reward.cardType, reward.name, reward.description);
    }

    room.quiz.status = "resolved";
    room.quiz.pendingBlindBoxTeamId = null;
    room.quiz.answeringTeamId = null;
    room.quiz.lastOutcome = {
      type: "correct",
      message: `${team.name} mở ô ${boxIndex + 1}: ${reward.name} — ${reward.description}`,
      teamId
    };
    this.store.addLog(room, `${team.name} nhận ${reward.name}.`, "success");
    this.changed(room);
  }

  openAuction(roomCode: string, projectIndex: number): void {
    const room = this.requireRoom(roomCode);
    const project = PROJECTS[projectIndex];
    if (!project) throw new Error("Dự án không hợp lệ");
    room.phase = "auction";
    room.auction.status = "open";
    room.auction.projectIndex = projectIndex;
    room.auction.project = project;
    room.auction.currentBid = project.startPrice;
    room.auction.leaderTeamId = null;
    room.auction.bids = [];
    room.auction.selectedDiscountCardIdByTeam = {};
    room.auction.lastResult = null;
    this.store.addLog(room, `Mở đấu giá ${project.name}.`, "info");
    this.changed(room);
  }

  placeBid(roomCode: string, teamId: string, amount: number): void {
    const room = this.requireRoom(roomCode);
    const team = this.requireTeam(room, teamId);
    if (room.auction.status !== "open") throw new Error("Phiên đấu giá chưa mở");
    const minimum = room.auction.currentBid + room.auction.minIncrement;
    if (!Number.isFinite(amount) || amount < minimum) throw new Error(`Giá phải từ ${minimum} triệu`);
    if (amount > team.capital) throw new Error("Tập đoàn không đủ vốn cho mức giá này");
    room.auction.currentBid = Math.round(amount);
    room.auction.leaderTeamId = teamId;
    room.auction.bids.push({ teamId, amount: Math.round(amount), at: Date.now() });
    this.store.addLog(room, `${team.name} đặt giá ${Math.round(amount)} triệu.`, "info");
    this.changed(room);
  }

  selectAuctionDiscount(roomCode: string, teamId: string, cardId: string | null): void {
    const room = this.requireRoom(roomCode);
    const team = this.requireTeam(room, teamId);
    if (room.auction.status !== "open") throw new Error("Phiên đấu giá chưa mở");
    if (cardId) {
      const card = findUsableCard(team, cardId);
      if (!card || !["auction_discount_50", "auction_discount_30"].includes(card.type)) {
        throw new Error("Thẻ giảm giá không hợp lệ");
      }
    }
    room.auction.selectedDiscountCardIdByTeam[teamId] = cardId;
    this.changed(room);
  }

  closeAuction(roomCode: string): void {
    const room = this.requireRoom(roomCode);
    if (room.auction.status !== "open") throw new Error("Phiên đấu giá chưa mở");
    room.auction.status = "closed";
    const project = PROJECTS[room.auction.projectIndex];
    const leaderId = room.auction.leaderTeamId;
    if (!leaderId || !project) {
      room.auction.lastResult = null;
      this.store.addLog(room, "Phiên đấu giá kết thúc không có người thắng.", "warning");
      this.changed(room);
      return;
    }
    const team = this.requireTeam(room, leaderId);
    let discountPercent = 0;
    const selectedCardId = room.auction.selectedDiscountCardIdByTeam[leaderId];
    const card = findUsableCard(team, selectedCardId);
    if (card?.type === "auction_discount_50") discountPercent = 50;
    if (card?.type === "auction_discount_30") discountPercent = 30;
    const paid = Math.round(room.auction.currentBid * (1 - discountPercent / 100));
    if (paid > team.capital) throw new Error("Đội thắng không đủ vốn thanh toán");
    if (card && discountPercent > 0) markCardUsed(card);
    team.capital -= paid;
    applyIndicatorEffects(team.indicators, project.effects);
    team.projects.push({
      id: project.id,
      name: project.name,
      acquiredPrice: room.auction.currentBid,
      paidPrice: paid,
      acquiredAt: Date.now(),
      effects: { ...project.effects }
    });
    room.auction.lastResult = {
      teamId: team.id,
      projectName: project.name,
      bid: room.auction.currentBid,
      paid,
      discountPercent
    };
    this.store.addLog(room, `${team.name} thắng ${project.name}, thanh toán ${paid} triệu.`, "success");
    this.changed(room);
  }

  openEvent(roomCode: string, eventIndex: number): void {
    const room = this.requireRoom(roomCode);
    const event = EVENTS[eventIndex];
    if (!event) throw new Error("Sự kiện không hợp lệ");
    room.phase = "event";
    room.event.status = "open";
    room.event.eventIndex = eventIndex;
    room.event.event = event;
    room.event.choicesByTeam = {};
    room.event.resolvedTeamIds = [];
    this.store.addLog(room, `Công bố sự kiện: ${event.name}.`, "warning");
    this.changed(room);
  }

  chooseEvent(roomCode: string, teamId: string, optionId: string, cardId: string | null): void {
    const room = this.requireRoom(roomCode);
    const team = this.requireTeam(room, teamId);
    if (room.event.status !== "open") throw new Error("Sự kiện chưa mở");
    const event = EVENTS[room.event.eventIndex];
    const option = event?.options.find((item) => item.id === optionId);
    if (!option) throw new Error("Phương án không hợp lệ");
    if (team.capital < option.capitalCost) throw new Error("Tập đoàn không đủ vốn cho phương án này");
    if (cardId) {
      const card = findUsableCard(team, cardId);
      if (!card || !["shield", "project_recovery"].includes(card.type)) {
        throw new Error("Thẻ phòng thủ không hợp lệ");
      }
    }
    room.event.choicesByTeam[teamId] = { optionId, cardId };
    this.store.addLog(room, `${team.name} đã khóa phương án sự kiện.`, "info");
    this.changed(room);
  }

  resolveEvent(roomCode: string): void {
    const room = this.requireRoom(roomCode);
    if (room.event.status !== "open") throw new Error("Sự kiện chưa mở");
    const event = EVENTS[room.event.eventIndex];
    if (!event) throw new Error("Sự kiện không hợp lệ");

    room.teams.forEach((team) => {
      const savedChoice = room.event.choicesByTeam[team.id];
      const option = event.options.find((item) => item.id === savedChoice?.optionId) ?? event.options[event.options.length - 1];
      const card = findUsableCard(team, savedChoice?.cardId);
      team.capital -= option.capitalCost;
      const effects = { ...option.effects };
      if (card?.type === "shield") {
        (Object.keys(effects) as IndicatorKey[]).forEach((key) => {
          if ((effects[key] ?? 0) < 0) effects[key] = 0;
        });
        markCardUsed(card);
      } else if (card?.type === "project_recovery") {
        (Object.keys(effects) as IndicatorKey[]).forEach((key) => {
          const value = effects[key] ?? 0;
          if (value < 0) effects[key] = Math.ceil(value / 2);
        });
        markCardUsed(card);
      }
      applyIndicatorEffects(team.indicators, effects);
      room.event.resolvedTeamIds.push(team.id);
    });
    room.event.status = "resolved";
    this.store.addLog(room, `Đã xử lý sự kiện ${event.name}.`, "success");
    this.changed(room);
  }

  openStrategy(roomCode: string): void {
    const room = this.requireRoom(roomCode);
    room.phase = "strategy";
    room.strategy.status = "open";
    room.strategy.choicesByTeam = {};
    room.strategy.resolvedTeamIds = [];
    this.store.addLog(room, "Mở vòng lựa chọn chiến lược dài hạn.", "info");
    this.changed(room);
  }

  chooseStrategy(roomCode: string, teamId: string, packageId: string): void {
    const room = this.requireRoom(roomCode);
    const team = this.requireTeam(room, teamId);
    if (room.strategy.status !== "open") throw new Error("Vòng chiến lược chưa mở");
    const strategy = STRATEGY_PACKAGES.find((item) => item.id === packageId);
    if (!strategy) throw new Error("Gói chiến lược không hợp lệ");
    if (team.capital < strategy.cost) throw new Error("Tập đoàn không đủ vốn");
    room.strategy.choicesByTeam[teamId] = packageId;
    this.store.addLog(room, `${team.name} đã chọn một gói chiến lược.`, "info");
    this.changed(room);
  }

  resolveStrategy(roomCode: string): void {
    const room = this.requireRoom(roomCode);
    if (room.strategy.status !== "open") throw new Error("Vòng chiến lược chưa mở");
    Object.entries(room.strategy.choicesByTeam).forEach(([teamId, packageId]) => {
      const team = room.teams.find((item) => item.id === teamId);
      const strategy = STRATEGY_PACKAGES.find((item) => item.id === packageId);
      if (!team || !strategy || team.capital < strategy.cost) return;
      team.capital -= strategy.cost;
      applyIndicatorEffects(team.indicators, strategy.effects);
      room.strategy.resolvedTeamIds.push(team.id);
    });
    room.strategy.status = "resolved";
    this.store.addLog(room, "Đã áp dụng các gói chiến lược.", "success");
    this.changed(room);
  }

  finish(roomCode: string): void {
    const room = this.requireRoom(roomCode);
    room.phase = "results";
    room.status = "finished";
    room.locked = true;
    this.store.addLog(room, "Trò chơi kết thúc. Bảng xếp hạng đã được công bố.", "success");
    this.changed(room);
  }

  adjustCapital(roomCode: string, teamId: string, delta: number): void {
    const room = this.requireRoom(roomCode);
    const team = this.requireTeam(room, teamId);
    if (!Number.isFinite(delta) || Math.abs(delta) > 1000) throw new Error("Mức điều chỉnh không hợp lệ");
    team.capital += Math.round(delta);
    this.store.addLog(room, `Điều chỉnh vốn ${team.name}: ${delta >= 0 ? "+" : ""}${Math.round(delta)} triệu.`, "info");
    this.changed(room);
  }

  adjustIndicator(roomCode: string, teamId: string, key: IndicatorKey, delta: number): void {
    const room = this.requireRoom(roomCode);
    const team = this.requireTeam(room, teamId);
    if (!Number.isFinite(delta) || Math.abs(delta) > 50) throw new Error("Mức điều chỉnh không hợp lệ");
    team.indicators[key] = clampIndicator(team.indicators[key] + delta);
    this.store.addLog(room, `Điều chỉnh chỉ số của ${team.name}.`, "info");
    this.changed(room);
  }
}

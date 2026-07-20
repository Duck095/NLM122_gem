import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { EventResolutionPublic, IndicatorKey, Indicators, RoomPublicState, TeamPublic } from "@mln122/shared";
import { INDICATOR_LABELS } from "@mln122/shared";
import { Badge, Button, Card, Metric } from "./Ui";

const indicatorIcons: Record<IndicatorKey, string> = {
  economy: "↗",
  technology: "⌘",
  autonomy: "◆",
  equality: "◎",
  sustainability: "♻"
};

export function ConnectionBadge({ connected }: { connected: boolean }) {
  return <Badge tone={connected ? "success" : "danger"}>{connected ? "● Đã kết nối" : "● Mất kết nối"}</Badge>;
}

export function IndicatorGrid({ indicators, compact = false }: { indicators: Indicators; compact?: boolean }) {
  return (
    <div className={`indicator-grid ${compact ? "compact" : ""}`}>
      {(Object.keys(INDICATOR_LABELS) as IndicatorKey[]).map((key) => (
        <div className="indicator-item" key={key}>
          <div className="indicator-label">
            <span>{indicatorIcons[key]}</span>
            <span>{INDICATOR_LABELS[key]}</span>
            <strong>{indicators[key]}</strong>
          </div>
          <div className="progress-track"><div className={`progress-fill progress-${key}`} style={{ width: `${Math.max(0, Math.min(100, indicators[key]))}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

export function TeamSummaryCard({ team, active = false, onClick }: { team: TeamPublic; active?: boolean; onClick?: () => void }) {
  return (
    <button type="button" className={`team-summary ${active ? "active" : ""}`} onClick={onClick} style={{ "--team-color": team.color } as React.CSSProperties}>
      <div className="team-color-dot" />
      <div className="team-summary-main">
        <strong>{team.name}</strong>
        <span>{team.members.length}/{team.memberLimit} thành viên · {team.projects.length} dự án</span>
      </div>
      <div className="team-summary-score">
        <span>#{team.rank}</span>
        <strong>{team.score}</strong>
      </div>
    </button>
  );
}

export function Leaderboard({ room, limit }: { room: RoomPublicState; limit?: number }) {
  const teams = [...room.teams].sort((a, b) => a.rank - b.rank).slice(0, limit || room.teams.length);
  return (
    <div className="leaderboard">
      {teams.map((team) => (
        <div className={`leader-row rank-${team.rank}`} key={team.id} style={{ "--team-color": team.color } as React.CSSProperties}>
          <div className="rank-number">{team.rank}</div>
          <div className="team-color-dot" />
          <div className="leader-name">
            <strong>{team.name}</strong>
            <span>{team.capital} triệu · {team.projects.length} dự án</span>
          </div>
          <strong className="leader-score">{team.score}</strong>
        </div>
      ))}
    </div>
  );
}

export function TimerBar({ deadline, totalMs, dangerAtMs = 5000 }: { deadline: number | null; totalMs: number; dangerAtMs?: number }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, []);
  const remaining = deadline ? Math.max(0, deadline - now) : 0;
  const percentage = Math.max(0, Math.min(100, (remaining / totalMs) * 100));
  return (
    <div className={`timer-wrap ${remaining <= dangerAtMs ? "danger" : ""}`}>
      <div className="timer-row"><span>Thời gian</span><strong>{(remaining / 1000).toFixed(1)}s</strong></div>
      <div className="timer-track"><div className="timer-fill" style={{ width: `${percentage}%` }} /></div>
    </div>
  );
}

export function PhaseRail({ phase }: { phase: RoomPublicState["phase"] }) {
  const phases: Array<{ key: RoomPublicState["phase"]; label: string }> = [
    { key: "lobby", label: "Chuẩn bị" },
    { key: "quiz", label: "Kiến thức" },
    { key: "auction", label: "Đấu giá" },
    { key: "event", label: "Sự kiện" },
    { key: "strategy", label: "Chiến lược" },
    { key: "results", label: "Kết quả" }
  ];
  const activeIndex = phases.findIndex((item) => item.key === phase);
  return (
    <div className="phase-rail">
      {phases.map((item, index) => (
        <div key={item.key} className={`phase-step ${index === activeIndex ? "active" : ""} ${index < activeIndex ? "done" : ""}`}>
          <span>{index + 1}</span><strong>{item.label}</strong>
        </div>
      ))}
    </div>
  );
}

export function TeamMetrics({ team }: { team: TeamPublic }) {
  return (
    <div className="metrics-grid four">
      <Metric label="Vốn khả dụng" value={`${team.capital} triệu`} />
      <Metric label="Thứ hạng" value={`#${team.rank}`} note={`${team.score} điểm`} />
      <Metric label="Dự án" value={team.projects.length} />
      <Metric label="Câu đúng" value={team.correctAnswers} />
    </div>
  );
}

export function TeamInventory({ team }: { team: TeamPublic }) {
  const usable = team.cards.filter((card) => !card.used);
  return (
    <Card>
      <div className="mini-heading"><h3>Kho thẻ chiến thuật</h3><Badge tone="info">{usable.length} thẻ khả dụng</Badge></div>
      {team.cards.length === 0 ? <p className="muted">Chưa có thẻ chiến thuật.</p> : (
        <div className="inventory-list">
          {team.cards.map((card) => (
            <div className={`inventory-card ${card.used ? "used" : ""}`} key={card.id}>
              <div><strong>{card.name}</strong><p>{card.description}</p></div>
              <Badge tone={card.used ? "neutral" : "success"}>{card.used ? "Đã dùng" : "Sẵn sàng"}</Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function RoomStats({ room }: { room: RoomPublicState }) {
  const members = room.teams.reduce((sum, team) => sum + team.members.length, 0);
  return (
    <div className="metrics-grid four">
      <Metric label="Tập đoàn" value={`${room.teams.length}/${room.maxTeams}`} />
      <Metric label="Người chơi" value={members} />
      <Metric label="Giai đoạn" value={room.phase.toUpperCase()} />
      <Metric label="Trạng thái" value={room.locked ? "Đã khóa" : "Đang mở"} />
    </div>
  );
}

export function QuestionPanel({
  room,
  audience,
  answerControl,
  children
}: {
  room: RoomPublicState;
  audience: "host" | "player" | "screen";
  answerControl?: {
    selectedIndex: number | null;
    description: string;
    onSelect: (index: number) => void;
    onSubmit: () => void;
  };
  children?: ReactNode;
}) {
  const question = room.quiz.question;
  const answering = room.teams.find((team) => team.id === room.quiz.answeringTeamId);
  const deadline = room.quiz.status === "mandatory" ? room.quiz.mandatoryDeadline : room.quiz.discussionDeadline;
  const total = room.quiz.status === "mandatory" ? 5000 : 15000;
  return (
    <Card className={`question-panel status-${room.quiz.status}`}>
      <div className="question-meta">
        <Badge tone="info">Câu {question?.number || room.quiz.questionIndex + 1}/15</Badge>
        <Badge tone={room.quiz.status === "buzzing" ? "warning" : room.quiz.status === "resolved" ? "success" : "neutral"}>
          {quizStatusLabel(room.quiz.status)}
        </Badge>
      </div>
      <h2 className="question-text">{question?.prompt || "Giảng viên chưa mở câu hỏi."}</h2>
      {answering ? <div className="answering-strip" style={{ "--team-color": answering.color } as React.CSSProperties}><span className="team-color-dot" /><strong>{answering.name}</strong><span>đang trả lời</span></div> : null}
      {["answering", "mandatory"].includes(room.quiz.status) && deadline ? <TimerBar deadline={deadline} totalMs={total} /> : null}
      {question?.options ? (
        <div className={answerControl ? "question-answer-control" : undefined}>
          {answerControl ? (
            <div className="question-answer-heading">
              <strong>Chọn một đáp án</strong>
              <span>{answerControl.description}</span>
            </div>
          ) : null}
          <div className={`answer-grid audience-${audience} ${answerControl ? "interactive" : ""}`}>
            {question.options.map((option, index) => {
              const className = `answer-option ${room.quiz.status === "resolved" && question.correctIndex === index ? "correct" : ""} ${answerControl?.selectedIndex === index ? "selected" : ""}`.trim();
              const content = <><span>{String.fromCharCode(65 + index)}</span><p>{option}</p></>;
              return answerControl ? (
                <button type="button" className={className} key={`${index}-${option}`} onClick={() => answerControl.onSelect(index)}>{content}</button>
              ) : (
                <div className={className} key={`${index}-${option}`}>{content}</div>
              );
            })}
          </div>
          {answerControl ? <Button className="wide" variant="success" disabled={answerControl.selectedIndex === null} onClick={answerControl.onSubmit}>Xác nhận đáp án</Button> : null}
        </div>
      ) : (
        <div className="hidden-options">Đáp án chỉ hiển thị cho tập đoàn đang có quyền trả lời.</div>
      )}
      {room.quiz.lastOutcome ? <div className={`outcome outcome-${room.quiz.lastOutcome.type}`}>{room.quiz.lastOutcome.message}</div> : null}
      {room.quiz.status === "resolved" && question?.explanation ? <div className="explanation"><strong>Giải thích:</strong> {question.explanation}</div> : null}
      {children ? <div className="question-panel-action">{children}</div> : null}
    </Card>
  );
}

function quizStatusLabel(status: RoomPublicState["quiz"]["status"]): string {
  const labels: Record<RoomPublicState["quiz"]["status"], string> = {
    idle: "Chưa bắt đầu",
    preview: "Đang trình chiếu",
    buzzing: "Đang giành quyền",
    answering: "Đang thảo luận",
    mandatory: "Bắt buộc chốt",
    blindbox: "Đang mở túi mù",
    resolved: "Đã kết thúc"
  };
  return labels[status];
}

export function ProjectEffects({ effects }: { effects: Partial<Indicators> }) {
  return <div className="effect-chips">{Object.entries(effects).map(([key, value]) => <span className={Number(value) >= 0 ? "positive" : "negative"} key={key}>{INDICATOR_LABELS[key as IndicatorKey]} {Number(value) >= 0 ? "+" : ""}{value}</span>)}</div>;
}

export function EventResolutionSummary({
  result,
  teamName
}: {
  result: EventResolutionPublic;
  teamName?: string;
}) {
  const cardExplanation = result.cardType === "shield"
    ? "Đã chặn toàn bộ điểm chỉ số âm; chi phí vốn vẫn được trừ."
    : result.cardType === "project_recovery"
      ? "Đã giảm 50% từng tác động chỉ số âm; chi phí vốn vẫn được trừ."
      : null;

  return (
    <div className="event-resolution-summary">
      <div className="event-resolution-heading">
        <div>{teamName ? <strong>{teamName}</strong> : null}<span>{result.optionTitle}</span></div>
        <Badge tone={result.automatic ? "warning" : "success"}>{result.automatic ? "Tự động áp dụng" : "Đã lựa chọn"}</Badge>
      </div>
      <div className="event-capital-flow">
        <span>Vốn</span>
        <strong>{result.capitalBefore} → {result.capitalAfter} triệu</strong>
        <small>Chi phí {result.capitalCost} triệu</small>
      </div>
      <ProjectEffects effects={result.appliedEffects} />
      {result.cardName ? <p className="event-card-result"><strong>{result.cardName}</strong> · {cardExplanation}</p> : null}
      {result.automatic ? <p className="event-auto-note">Đội không khóa phương án trước khi giảng viên xử lý, nên hệ thống áp dụng phương án cuối cùng của sự kiện.</p> : null}
    </div>
  );
}

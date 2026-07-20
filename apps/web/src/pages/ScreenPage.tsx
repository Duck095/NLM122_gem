import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import {
  INDICATOR_LABELS,
  type IndicatorKey,
  type RoomPublicState,
  type TeamPublic
} from "@mln122/shared";
import { PageShell } from "../components/Ui";
import { ProjectEffects } from "../components/GameWidgets";
import { useRoomSocket } from "../hooks/useRoomSocket";

const phaseItems: Array<{
  key: RoomPublicState["phase"];
  label: string;
  icon: string;
}> = [
  { key: "quiz", label: "Kiến thức", icon: "▤" },
  { key: "auction", label: "Đấu giá", icon: "⚖" },
  { key: "event", label: "Sự kiện", icon: "◫" },
  { key: "strategy", label: "Chiến lược", icon: "♞" },
  { key: "results", label: "Kết quả", icon: "♛" }
];

const indicatorMeta: Record<IndicatorKey, { icon: string; short: string }> = {
  economy: { icon: "↗", short: "Tăng trưởng kinh tế" },
  technology: { icon: "⌘", short: "Hiện đại hóa công nghệ" },
  autonomy: { icon: "◆", short: "Tự chủ nội địa" },
  equality: { icon: "◎", short: "Công bằng xã hội" },
  sustainability: { icon: "♻", short: "Phát triển bền vững" }
};

export function ScreenPage() {
  const { roomCode = "" } = useParams();
  const { room, connected, error } = useRoomSocket({ roomCode, role: "screen" });

  if (!room) {
    return (
      <PageShell tone="screen">
        <main className="classic-screen-loading">
          <div className="classic-loading-emblem">★</div>
          <p className="classic-eyebrow">LỘ TRÌNH VIỆT NAM 2045</p>
          <h1>Đang kết nối phòng {roomCode}</h1>
          <p>{error || "Vui lòng chờ máy chủ phản hồi…"}</p>
          <ConnectionPill connected={connected} />
        </main>
      </PageShell>
    );
  }

  const totalCapital = room.teams.reduce((sum, team) => sum + team.capital, 0);
  const totalMembers = room.teams.reduce((sum, team) => sum + team.members.length, 0);
  const indicators = averageIndicators(room);

  return (
    <PageShell tone="screen">
      <div className="classic-screen-root">
        <header className="classic-screen-header">
          <div className="classic-screen-brand">
            <div className="classic-emblem" aria-hidden="true">
              <span>★</span>
            </div>
            <div>
              <h1>{room.title || "Lộ trình Việt Nam 2045"}</h1>
              <p><span>◆</span> Hành trình kiến tạo <span>◆</span></p>
            </div>
          </div>
          <ConnectionPill connected={connected} />
        </header>

        <section className="classic-screen-toolbar">
          <ClassicPhaseRail phase={room.phase} />
          <div className="classic-summary-grid">
            <SummaryCard label="Mã phòng" value={room.code} icon="⌁" />
            <SummaryCard label="Tập đoàn" value={String(room.teams.length).padStart(2, "0")} note={`${totalMembers} người`} icon="♟" />
            <SummaryCard label="Tổng vốn hiện tại" value={formatNumber(totalCapital)} note="triệu đồng" icon="◉" />
            <SummaryCard label="Trạng thái" value={phaseStatus(room)} icon="⚑" compact />
          </div>
        </section>

        <main className="classic-screen-main">
          <section className="classic-stage-card">
            <ScreenStage room={room} />
          </section>

          <aside className="classic-ranking-card">
            <div className="classic-panel-heading">
              <div>
                <span>❧</span>
                <strong>BẢNG XẾP HẠNG</strong>
                <span>❧</span>
              </div>
              <b><i /> TRỰC TIẾP</b>
            </div>
            <ClassicLeaderboard teams={room.teams} />
          </aside>
        </main>

        <section className="classic-screen-bottom">
          <div className="classic-indicators-card">
            <div className="classic-section-label"><span>◆</span> 5 TRỤ CỘT PHÁT TRIỂN QUỐC GIA <span>◆</span></div>
            <div className="classic-indicator-grid">
              {(Object.keys(INDICATOR_LABELS) as IndicatorKey[]).map((key) => (
                <IndicatorTile key={key} indicatorKey={key} value={indicators[key]} />
              ))}
            </div>
          </div>

          <div className="classic-log-card">
            <div className="classic-panel-heading log-heading">
              <div><span>◆</span><strong>NHẬT KÝ TRỰC TIẾP</strong></div>
              <b><i /> TRỰC TIẾP</b>
            </div>
            <div className="classic-log-list">
              {room.logs.length ? room.logs.slice(0, 4).map((log) => (
                <div key={log.id}>
                  <time>{formatTime(log.at)}</time>
                  <p>{log.message}</p>
                </div>
              )) : (
                <div><time>--:--</time><p>Phiên chơi đang chờ hoạt động đầu tiên.</p></div>
              )}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function ClassicPhaseRail({ phase }: { phase: RoomPublicState["phase"] }) {
  const activeKey = phase === "lobby" ? "quiz" : phase;
  const activeIndex = phaseItems.findIndex((item) => item.key === activeKey);

  return (
    <nav className="classic-phase-rail" aria-label="Tiến trình trò chơi">
      {phaseItems.map((item, index) => (
        <div
          key={item.key}
          className={`classic-phase-step ${index === activeIndex ? "active" : ""} ${index < activeIndex ? "done" : ""}`}
        >
          <span className="classic-phase-number">{index + 1}</span>
          <span className="classic-phase-icon">{item.icon}</span>
          <strong>{item.label}</strong>
          {index === activeIndex ? <small>{phase === "lobby" ? "SẮP BẮT ĐẦU" : "ĐANG DIỄN RA"}</small> : null}
        </div>
      ))}
    </nav>
  );
}

function SummaryCard({
  label,
  value,
  note,
  icon,
  compact = false
}: {
  label: string;
  value: string;
  note?: string;
  icon: string;
  compact?: boolean;
}) {
  return (
    <div className={`classic-summary-card ${compact ? "compact" : ""}`}>
      <span>{label}</span>
      <div><i>{icon}</i><strong>{value}</strong></div>
      {note ? <small>{note}</small> : null}
    </div>
  );
}

function ScreenStage({ room }: { room: RoomPublicState }) {
  if (room.phase === "lobby") return <LobbyStage room={room} />;
  if (room.phase === "quiz") return <QuizStage room={room} />;
  if (room.phase === "auction") return <AuctionStage room={room} />;
  if (room.phase === "event") return <EventStage room={room} />;
  if (room.phase === "strategy") return <StrategyStage room={room} />;
  return <ResultsStage room={room} />;
}

function StageHeading({
  step,
  title,
  children
}: {
  step: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="classic-stage-heading">
      <p><span>◆</span> {step} <span>◆</span></p>
      <h2>{title}</h2>
      <div className="classic-ornament"><i /><b>◇</b><i /></div>
      {children}
    </div>
  );
}

function LobbyStage({ room }: { room: RoomPublicState }) {
  const members = room.teams.reduce((sum, team) => sum + team.members.length, 0);
  return (
    <div className="classic-stage-content lobby-stage-classic">
      <StageHeading step="PHÒNG CHỜ" title="Hành trình chuẩn bị khơi hành" />
      <p className="classic-lead">Mỗi nhóm cử đại diện lập tập đoàn, tự đặt tên và gửi mã tập đoàn cho các thành viên còn lại.</p>
      <div className="classic-room-code">{room.code}</div>
      <div className="classic-lobby-mini-stats">
        <div><strong>{room.teams.length}</strong><span>Tập đoàn</span></div>
        <div><strong>{members}</strong><span>Người chơi</span></div>
        <div><strong>{room.locked ? "ĐÃ KHÓA" : "ĐANG MỞ"}</strong><span>Trạng thái phòng</span></div>
      </div>
    </div>
  );
}

function QuizStage({ room }: { room: RoomPublicState }) {
  const question = room.quiz.question;
  const answering = room.teams.find((team) => team.id === room.quiz.answeringTeamId);
  const deadline = room.quiz.status === "mandatory" ? room.quiz.mandatoryDeadline : room.quiz.discussionDeadline;
  const totalMs = room.quiz.status === "mandatory" ? 5000 : 15000;
  const questionNumber = question?.number || room.quiz.questionIndex + 1;
  const options = question?.options || [];
  const showBlindBoxes =
    room.quiz.status === "blindbox" ||
    (room.quiz.status === "resolved" && room.quiz.lastOpenedBlindBoxIndex !== null);

  if (showBlindBoxes) return <ScreenBlindBoxStage room={room} />;

  return (
    <div className="classic-stage-content classic-quiz-stage">
      <StageHeading step="GIAI ĐOẠN 1 / 5" title="Khởi động tri thức" />
      <div className="classic-question-layout">
        <div className="classic-question-number">
          <span>CÂU HỎI</span>
          <strong>{String(questionNumber).padStart(2, "0")}</strong>
          <i>❧</i>
        </div>
        <div className="classic-question-body">
          <p className="classic-question-prompt">{question?.prompt || "Giảng viên đang chuẩn bị câu hỏi tiếp theo."}</p>
          {answering ? (
            <div className="classic-answering-team" style={{ "--team-color": answering.color } as CSSProperties}>
              <i /> <strong>{answering.name}</strong> đang trả lời
            </div>
          ) : (
            <div className="classic-quiz-status">{quizStatusText(room)}</div>
          )}
          <div className="classic-answer-grid">
            {[0, 1, 2, 3].map((index) => {
              const correct = room.quiz.status === "resolved" && question?.correctIndex === index;
              return (
                <div className={`classic-answer-option ${correct ? "correct" : ""}`} key={index}>
                  <span>{String.fromCharCode(65 + index)}</span>
                  <p>{options[index] || "Đáp án sẽ được mở khi bắt đầu trả lời"}</p>
                </div>
              );
            })}
          </div>
          {room.quiz.lastOutcome ? (
            <div className={`classic-outcome outcome-${room.quiz.lastOutcome.type}`}>{room.quiz.lastOutcome.message}</div>
          ) : null}
        </div>
      </div>
      <ClassicCountdown deadline={deadline} totalMs={totalMs} status={room.quiz.status} />
    </div>
  );
}

function ScreenBlindBoxStage({ room }: { room: RoomPublicState }) {
  const selectedIndex = room.quiz.lastOpenedBlindBoxIndex;
  const selectedBox = selectedIndex === null
    ? undefined
    : room.blindBoxes.find((box) => box.index === selectedIndex);
  const teamId = room.quiz.pendingBlindBoxTeamId || room.quiz.lastOutcome?.teamId;
  const team = room.teams.find((item) => item.id === teamId);
  const isSelecting = room.quiz.status === "blindbox";

  return (
    <div className="classic-stage-content classic-blindbox-stage">
      <StageHeading
        step="PHẦN THƯỞNG KIẾN THỨC"
        title={isSelecting ? "Chọn túi mù" : "Túi mù đã mở"}
      >
        <p className="classic-blindbox-team">
          {team ? <><i style={{ background: team.color }} /><strong>{team.name}</strong></> : null}
          <span>{isSelecting ? " đang lựa chọn một phần thưởng" : " đã nhận phần thưởng"}</span>
        </p>
      </StageHeading>

      <div className="classic-blindbox-grid" aria-label="Danh sách túi mù">
        {room.blindBoxes.map((box) => (
          <div
            className={`blindbox classic-screen-blindbox ${box.opened ? "opened" : ""} ${box.index === selectedIndex ? "revealed" : ""}`}
            key={box.index}
          >
            <span>{String(box.index + 1).padStart(2, "0")}</span>
            {box.opened ? <small>{box.rewardName}</small> : <strong>?</strong>}
          </div>
        ))}
      </div>

      {selectedBox ? (
        <div className="classic-blindbox-reward">
          <span>PHẦN THƯỞNG Ô {String(selectedBox.index + 1).padStart(2, "0")}</span>
          <strong>{selectedBox.rewardName}</strong>
          <p>{selectedBox.rewardDescription}</p>
        </div>
      ) : (
        <div className="classic-blindbox-waiting">Lựa chọn trên màn hình tập đoàn sẽ được cập nhật trực tiếp tại đây.</div>
      )}
    </div>
  );
}

function AuctionStage({ room }: { room: RoomPublicState }) {
  const leader = room.teams.find((team) => team.id === room.auction.leaderTeamId);
  return (
    <div className="classic-stage-content classic-auction-stage">
      <StageHeading step="GIAI ĐOẠN 2 / 5" title="Đấu giá dự án quốc gia" />
      <div className="classic-feature-panel">
        <span className="classic-kicker">{room.auction.status === "open" ? "PHIÊN ĐANG MỞ" : "THÔNG TIN DỰ ÁN"}</span>
        <h3>{room.auction.project?.name || "Giảng viên đang chuẩn bị dự án"}</h3>
        <p>{room.auction.project?.description || "Thông tin dự án sẽ xuất hiện tại đây."}</p>
        {room.auction.project ? <ProjectEffects effects={room.auction.project.effects} /> : null}
      </div>
      <div className="classic-auction-summary">
        <div className="classic-large-number"><span>GIÁ HIỆN TẠI</span><strong>{formatNumber(room.auction.currentBid)}</strong><small>triệu đồng</small></div>
        <div className="classic-leader-box">
          <span>TẬP ĐOÀN DẪN ĐẦU</span>
          {leader ? <><i style={{ background: leader.color }} /><strong>{leader.name}</strong></> : <strong>Chưa có lượt đặt giá</strong>}
        </div>
      </div>
      {room.auction.lastResult ? (
        <div className="classic-result-ribbon">{room.teams.find((team) => team.id === room.auction.lastResult?.teamId)?.name} giành dự án · Giá thực trả {formatNumber(room.auction.lastResult.paid)} triệu</div>
      ) : null}
    </div>
  );
}

function EventStage({ room }: { room: RoomPublicState }) {
  const answered = Object.keys(room.event.choicesByTeam).length;
  const percentage = room.teams.length ? (answered / room.teams.length) * 100 : 0;

  if (room.event.status === "resolved") {
    return (
      <div className="classic-stage-content classic-event-stage classic-event-results-stage">
        <StageHeading step="GIAI ĐOẠN 3 / 5" title="Kết quả ứng phó sự kiện" />
        <div className="classic-event-result-title">
          <strong>{room.event.event?.name}</strong>
          <span>Vốn và chỉ số dưới đây đã được áp dụng vào bảng xếp hạng.</span>
        </div>
        <div className="classic-event-results-grid">
          {room.teams.map((team) => {
            const result = room.event.resultsByTeam[team.id];
            if (!result) return null;
            return (
              <div className="classic-event-result" key={team.id} style={{ "--team-color": team.color } as CSSProperties}>
                <div className="classic-event-result-team">
                  <i>{teamInitials(team.name)}</i>
                  <div><strong>{team.name}</strong><span>{result.automatic ? "Tự động áp dụng" : "Đã lựa chọn"}</span></div>
                </div>
                <h3>{result.optionTitle}</h3>
                <p>Vốn {formatNumber(result.capitalBefore)} → {formatNumber(result.capitalAfter)} triệu</p>
                <ProjectEffects effects={result.appliedEffects} />
                {result.cardName ? <small>Dùng thẻ: {result.cardName}</small> : null}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="classic-stage-content classic-event-stage">
      <StageHeading step="GIAI ĐOẠN 3 / 5" title="Biến động và thích ứng" />
      <div className="classic-feature-panel event">
        <span className="classic-kicker">SỰ KIỆN VĨ MÔ</span>
        <h3>{room.event.event?.name || "Đang chờ công bố sự kiện"}</h3>
        <p>{room.event.event?.description || "Các tập đoàn hãy sẵn sàng đưa ra quyết định chiến lược."}</p>
      </div>
      <ResponseProgress label={`${answered}/${room.teams.length} tập đoàn đã đưa ra quyết định`} percentage={percentage} />
    </div>
  );
}

function StrategyStage({ room }: { room: RoomPublicState }) {
  const answered = Object.keys(room.strategy.choicesByTeam).length;
  const percentage = room.teams.length ? (answered / room.teams.length) * 100 : 0;
  return (
    <div className="classic-stage-content classic-strategy-stage">
      <StageHeading step="GIAI ĐOẠN 4 / 5" title="Kiến tạo chiến lược dài hạn" />
      <p className="classic-lead">Mỗi tập đoàn cân nhắc nguồn vốn còn lại và sự cân bằng của năm trụ cột phát triển.</p>
      <div className="classic-strategy-grid">
        {room.strategy.packages.map((item, index) => (
          <div key={item.id}>
            <span>0{index + 1}</span>
            <strong>{item.name}</strong>
            <small>{formatNumber(item.cost)} triệu</small>
          </div>
        ))}
      </div>
      <ResponseProgress label={`${answered}/${room.teams.length} tập đoàn đã chốt chiến lược`} percentage={percentage} />
    </div>
  );
}

function ResultsStage({ room }: { room: RoomPublicState }) {
  const ranked = [...room.teams].sort((a, b) => a.rank - b.rank);
  const podium = [ranked[1], ranked[0], ranked[2]];
  const winner = ranked[0];
  const runnerUp = ranked[1];
  const scoreMargin = winner && runnerUp ? Math.round((winner.score - runnerUp.score) * 10) / 10 : null;
  return (
    <div className="classic-stage-content classic-results-stage">
      <StageHeading step="GIAI ĐOẠN 5 / 5" title="Kết quả hành trình Việt Nam 2045" />
      {winner ? (
        <div className="classic-winner-reason">
          <div className="classic-winner-reason-copy">
            <span>VÌ SAO {winner.name.toLocaleUpperCase("vi-VN")} DẪN ĐẦU?</span>
            <strong>{winner.score} điểm tổng hợp</strong>
            <p>
              Điểm cao nhất được tạo từ năm trụ cột, khả năng giữ cân bằng, dự án, vốn còn lại và kiến thức.
              {scoreMargin !== null ? ` Cao hơn hạng nhì ${scoreMargin} điểm.` : ""}
            </p>
          </div>
          <div className="classic-score-breakdown">
            <div><span>TB trụ cột</span><strong>{winner.scoreBreakdown.indicatorAverage}</strong></div>
            <div><span>Cân bằng</span><strong>+{winner.scoreBreakdown.balanceBonus}</strong></div>
            <div><span>Dự án</span><strong>+{winner.scoreBreakdown.projectBonus}</strong></div>
            <div><span>Vốn</span><strong>+{winner.scoreBreakdown.capitalBonus}</strong></div>
            <div><span>Kiến thức</span><strong>+{winner.scoreBreakdown.knowledgeBonus}</strong></div>
          </div>
        </div>
      ) : null}
      <div className="classic-podium">
        {podium.map((team, index) => team ? (
          <div
            key={team.id}
            className={`classic-podium-place place-${index === 1 ? 1 : index === 0 ? 2 : 3}`}
            style={{ "--team-color": team.color } as CSSProperties}
          >
            <span>{index === 1 ? "I" : index === 0 ? "II" : "III"}</span>
            <i>{teamInitials(team.name)}</i>
            <strong>{team.name}</strong>
            <b>{team.score} điểm</b>
            <small>{formatNumber(team.capital)} triệu · {team.projects.length} dự án</small>
          </div>
        ) : <div key={index} />)}
      </div>
    </div>
  );
}

function ClassicLeaderboard({ teams }: { teams: TeamPublic[] }) {
  const ranked = [...teams].sort((a, b) => a.rank - b.rank);
  if (!ranked.length) return <div className="classic-empty-ranking">Chưa có tập đoàn tham gia.</div>;

  return (
    <div className="classic-leaderboard">
      {ranked.slice(0, 6).map((team) => (
        <div className={`classic-leader-row rank-${team.rank}`} key={team.id}>
          <div className="classic-medal">{team.rank}</div>
          <div className="classic-team-mark" style={{ "--team-color": team.color } as CSSProperties}>{teamInitials(team.name)}</div>
          <div className="classic-leader-name"><small>TẬP ĐOÀN</small><strong>{team.name}</strong></div>
          <div className="classic-leader-value"><small>VỐN</small><strong>{formatNumber(team.capital)}</strong><span>triệu</span></div>
        </div>
      ))}
    </div>
  );
}

function IndicatorTile({ indicatorKey, value }: { indicatorKey: IndicatorKey; value: number }) {
  const item = indicatorMeta[indicatorKey];
  return (
    <div className={`classic-indicator-tile indicator-${indicatorKey}`}>
      <div><i>{item.icon}</i><strong>{item.short}</strong></div>
      <div className="classic-indicator-track"><span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>
      <b>{value}%</b>
    </div>
  );
}

function ResponseProgress({ label, percentage }: { label: string; percentage: number }) {
  return (
    <div className="classic-response-progress">
      <div><span>{label}</span><strong>{Math.round(percentage)}%</strong></div>
      <div><i style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} /></div>
    </div>
  );
}

function ClassicCountdown({
  deadline,
  totalMs,
  status
}: {
  deadline: number | null;
  totalMs: number;
  status: RoomPublicState["quiz"]["status"];
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = deadline ? Math.max(0, deadline - now) : 0;
  const percentage = deadline ? Math.max(0, Math.min(100, (remaining / totalMs) * 100)) : 0;
  const seconds = Math.ceil(remaining / 1000);
  const label = status === "mandatory" ? "THỜI GIAN CHỐT ĐÁP ÁN" : status === "answering" ? "THỜI GIAN THẢO LUẬN" : "THỜI GIAN CÒN LẠI";

  return (
    <div className={`classic-timer ${remaining > 0 && remaining <= 5000 ? "danger" : ""}`}>
      <span>⌛</span>
      <small>{label}</small>
      <strong>{deadline ? `00:${String(seconds).padStart(2, "0")}` : "--:--"}</strong>
      <div className="classic-timer-track"><i style={{ width: `${percentage}%` }} /></div>
      <b>{deadline ? `${seconds} giây` : quizStatusShort(status)}</b>
    </div>
  );
}

function ConnectionPill({ connected }: { connected: boolean }) {
  return (
    <div className={`classic-connection ${connected ? "connected" : "disconnected"}`}>
      <i /> {connected ? "ĐÃ KẾT NỐI" : "MẤT KẾT NỐI"}
    </div>
  );
}

function averageIndicators(room: RoomPublicState): Record<IndicatorKey, number> {
  const keys = Object.keys(INDICATOR_LABELS) as IndicatorKey[];
  if (!room.teams.length) return Object.fromEntries(keys.map((key) => [key, 0])) as Record<IndicatorKey, number>;
  return Object.fromEntries(keys.map((key) => [
    key,
    Math.round(room.teams.reduce((sum, team) => sum + team.indicators[key], 0) / room.teams.length)
  ])) as Record<IndicatorKey, number>;
}

function phaseStatus(room: RoomPublicState): string {
  if (room.phase === "lobby") return room.locked ? "ĐÃ KHÓA" : "ĐANG CHỜ";
  if (room.phase === "results") return "HOÀN TẤT";
  return "ĐANG CHƠI";
}

function quizStatusText(room: RoomPublicState): string {
  if (room.quiz.status === "buzzing") return `Cơ hội trả lời lần ${room.quiz.buzzRound} đang mở`;
  if (room.quiz.status === "blindbox") return "Tập đoàn trả lời đúng đang chọn túi mù";
  if (room.quiz.status === "resolved") return "Câu hỏi đã kết thúc";
  if (room.quiz.status === "preview") return "Hãy thảo luận và sẵn sàng giành quyền";
  return "Đang chờ giảng viên điều khiển";
}

function quizStatusShort(status: RoomPublicState["quiz"]["status"]): string {
  const labels: Record<RoomPublicState["quiz"]["status"], string> = {
    idle: "Chưa bắt đầu",
    preview: "Đang trình chiếu",
    buzzing: "Đang giành quyền",
    answering: "Đang thảo luận",
    mandatory: "Chốt đáp án",
    blindbox: "Đang mở túi",
    resolved: "Đã kết thúc"
  };
  return labels[status];
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatTime(value: number): string {
  return new Date(value).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function teamInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "TG";
}

import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { GamePhase, IndicatorKey, RoomPublicState, TeamPublic } from "@mln122/shared";
import { INDICATOR_LABELS } from "@mln122/shared";
import { Badge, Button, Card, EmptyState, PageShell, SectionTitle, TopBar } from "../components/Ui";
import {
  ConnectionBadge,
  EventResolutionSummary,
  IndicatorGrid,
  Leaderboard,
  PhaseRail,
  ProjectEffects,
  QuestionPanel,
  RoomStats,
  TeamSummaryCard
} from "../components/GameWidgets";
import { useRoomSocket } from "../hooks/useRoomSocket";
import { readHostSession } from "../lib/session";

const projectNames = ["Trung tâm dữ liệu quốc gia", "Hành lang logistics thông minh", "Tổ hợp sản xuất công nghiệp xanh"];
const eventNames = ["Đứt gãy chuỗi cung ứng", "Khủng hoảng năng lượng", "Tự động hóa và dịch chuyển lao động"];

export function HostPage() {
  const { roomCode = "" } = useParams();
  const navigate = useNavigate();
  const token = readHostSession(roomCode);
  const { room, connected, error, emitAck } = useRoomSocket({ roomCode, role: "host", token });
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const selectedTeam = room?.teams.find((team) => team.id === selectedTeamId) ?? room?.teams[0] ?? null;

  async function act<T>(event: string, payload: unknown = {}, success?: string): Promise<T | undefined> {
    try {
      const result = await emitAck<T>(event, payload);
      if (success) setNotice(success);
      window.setTimeout(() => setNotice(null), 2500);
      return result;
    } catch (eventError) {
      setNotice(eventError instanceof Error ? eventError.message : "Thao tác thất bại");
      window.setTimeout(() => setNotice(null), 3500);
      return undefined;
    }
  }

  if (!token) {
    return (
      <PageShell tone="host">
        <main className="center-message">
          <Card><h1>Không tìm thấy phiên giảng viên</h1><p>Hãy tạo phòng từ trang chủ trên trình duyệt này.</p><Button onClick={() => navigate("/")}>Về trang chủ</Button></Card>
        </main>
      </PageShell>
    );
  }

  if (!room) {
    return (
      <PageShell tone="host">
        <main className="center-message"><Card><h1>Đang kết nối phòng {roomCode}</h1><p>{error || "Vui lòng chờ máy chủ phản hồi..."}</p><ConnectionBadge connected={connected} /></Card></main>
      </PageShell>
    );
  }

  return (
    <PageShell tone="host">
      <TopBar
        title="Trung tâm điều hành"
        subtitle={`${room.title} · ${room.className}`}
        status={<ConnectionBadge connected={connected} />}
        actions={
          <>
            <Badge tone="info">Mã phòng: <strong>{room.code}</strong></Badge>
            <Button variant="ghost" onClick={() => window.open(`/screen/${room.code}`, "_blank")}>Mở trình chiếu</Button>
            <Button variant="ghost" onClick={() => navigate("/")}>Trang chủ</Button>
          </>
        }
      />
      {notice ? <div className="floating-notice">{notice}</div> : null}
      <PhaseRail phase={room.phase} />
      <main className="dashboard-layout">
        <aside className="host-sidebar">
          <Card>
            <SectionTitle title="Điều hướng giai đoạn" description="Giảng viên có thể chuyển thủ công khi cần." />
            <div className="vertical-actions">
              {(["lobby", "quiz", "auction", "event", "strategy", "results"] as GamePhase[]).map((phase) => (
                <Button key={phase} variant={room.phase === phase ? "primary" : "ghost"} onClick={() => act("host:set-phase", { phase })}>
                  {phaseLabel(phase)}
                </Button>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle title="Tập đoàn" description="Chọn đội để xem và điều chỉnh." />
            <div className="team-list-compact">
              {room.teams.map((team) => <TeamSummaryCard key={team.id} team={team} active={selectedTeam?.id === team.id} onClick={() => setSelectedTeamId(team.id)} />)}
            </div>
          </Card>
          {selectedTeam ? <HostTeamInspector team={selectedTeam} act={act} /> : null}
        </aside>

        <section className="host-main">
          <RoomStats room={room} />
          <HostStage room={room} act={act} />
          <div className="two-column">
            <Card>
              <SectionTitle title="Bảng xếp hạng trực tiếp" description="Điểm được tính từ năm chỉ số, độ cân bằng, dự án, vốn và câu trả lời đúng." />
              {room.teams.length ? <Leaderboard room={room} /> : <EmptyState title="Chưa có tập đoàn" text="Hãy gửi mã phòng cho lớp để các nhóm lập tập đoàn." />}
            </Card>
            <Card>
              <SectionTitle title="Nhật ký hoạt động" description="Các thao tác mới nhất trong phòng." />
              <div className="log-list">
                {room.logs.map((log) => <div className={`log-item log-${log.tone}`} key={log.id}><span>{new Date(log.at).toLocaleTimeString("vi-VN")}</span><p>{log.message}</p></div>)}
              </div>
            </Card>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

function HostStage({ room, act }: { room: RoomPublicState; act: <T>(event: string, payload?: unknown, success?: string) => Promise<T | undefined> }) {
  if (room.phase === "lobby") {
    return (
      <Card>
        <SectionTitle title="Phòng chờ" description="Người chơi nhập mã phòng, tự lập tập đoàn rồi gửi mã đội cho thành viên." action={<Badge tone={room.locked ? "warning" : "success"}>{room.locked ? "Đã khóa" : "Đang mở"}</Badge>} />
        <div className="stage-actions">
          <Button variant={room.locked ? "secondary" : "danger"} onClick={() => act("host:set-locked", { locked: !room.locked }, room.locked ? "Đã mở lại phòng" : "Đã khóa phòng")}>{room.locked ? "Mở lại phòng" : "Khóa phòng"}</Button>
          <Button variant="success" disabled={!room.teams.length} onClick={() => act("host:start-game", {}, "Trò chơi đã bắt đầu")}>Khóa phòng và bắt đầu</Button>
        </div>
        <div className="join-code-display"><span>Mã phòng</span><strong>{room.code}</strong><p>Người chơi mở trang chủ và nhập mã này.</p></div>
      </Card>
    );
  }

  if (room.phase === "quiz") {
    return (
      <>
        <QuestionPanel room={room} audience="host" />
        <Card>
          <SectionTitle title="Điều khiển 15 câu hỏi" description="Sai hoặc hết thời gian: đội bị loại khỏi câu và các đội còn lại tranh quyền lại." />
          <div className="question-selector">
            {Array.from({ length: 15 }, (_, index) => <button key={index} type="button" className={room.quiz.questionIndex === index ? "active" : ""} onClick={() => act("host:quiz-preview", { questionIndex: index })}>{index + 1}</button>)}
          </div>
          <div className="stage-actions wrap">
            <Button onClick={() => act("host:quiz-open-buzz", {}, "Đã mở giành quyền")}>Mở giành quyền</Button>
            <Button variant="secondary" onClick={() => act("host:quiz-reveal")}>Công bố đáp án</Button>
            <Button variant="success" disabled={room.quiz.status === "blindbox"} onClick={() => act("host:quiz-next")}>Câu tiếp theo</Button>
          </div>
          <div className="eliminated-line">
            <strong>Đã hết quyền ở câu này:</strong>{" "}
            {room.quiz.eliminatedTeamIds.length ? room.quiz.eliminatedTeamIds.map((id) => room.teams.find((team) => team.id === id)?.name).filter(Boolean).join(", ") : "Chưa có"}
          </div>
        </Card>
      </>
    );
  }

  if (room.phase === "auction") {
    return (
      <Card>
        <SectionTitle title="Đấu giá dự án" description="Mức tăng tối thiểu 10 triệu. Thẻ giảm giá chỉ áp dụng khi đội sở hữu thẻ thắng phiên." />
        <div className="choice-cards three">
          {projectNames.map((name, index) => (
            <button type="button" key={name} className={`choice-card ${room.auction.projectIndex === index ? "selected" : ""}`} onClick={() => act("host:auction-open", { projectIndex: index })}>
              <span>Dự án {index + 1}</span><strong>{name}</strong><small>Mở phiên đấu giá mới</small>
            </button>
          ))}
        </div>
        {room.auction.project ? <div className="auction-stage"><div><Badge tone={room.auction.status === "open" ? "success" : "neutral"}>{room.auction.status === "open" ? "Đang đấu giá" : "Chưa mở/đã đóng"}</Badge><h2>{room.auction.project.name}</h2><p>{room.auction.project.description}</p><ProjectEffects effects={room.auction.project.effects} /></div><div className="bid-display"><span>Giá hiện tại</span><strong>{room.auction.currentBid} triệu</strong><p>Dẫn đầu: {room.teams.find((team) => team.id === room.auction.leaderTeamId)?.name || "Chưa có"}</p></div></div> : null}
        <div className="stage-actions"><Button onClick={() => act("host:auction-open", { projectIndex: room.auction.projectIndex })}>Mở lại phiên</Button><Button variant="danger" disabled={room.auction.status !== "open"} onClick={() => act("host:auction-close", {}, "Đã chốt phiên đấu giá")}>Chốt phiên</Button></div>
        {room.auction.lastResult ? <div className="outcome outcome-correct">{room.teams.find((team) => team.id === room.auction.lastResult?.teamId)?.name} thắng {room.auction.lastResult.projectName}, giá chốt {room.auction.lastResult.bid} triệu, thực trả {room.auction.lastResult.paid} triệu.</div> : null}
      </Card>
    );
  }

  if (room.phase === "event") {
    return (
      <Card>
        <SectionTitle title="Sự kiện vĩ mô" description="Các đội chọn phương án và có thể dùng Lá chắn hoặc Phục hồi dự án." />
        <div className="choice-cards three">
          {eventNames.map((name, index) => <button type="button" key={name} className={`choice-card ${room.event.eventIndex === index ? "selected" : ""}`} onClick={() => act("host:event-open", { eventIndex: index })}><span>Sự kiện {index + 1}</span><strong>{name}</strong><small>Công bố cho toàn bộ lớp</small></button>)}
        </div>
        {room.event.event ? <div className="event-stage"><Badge tone={room.event.status === "open" ? "warning" : "neutral"}>{room.event.status === "open" ? "Đang nhận quyết định" : "Chưa mở/đã xử lý"}</Badge><h2>{room.event.event.name}</h2><p>{room.event.event.description}</p><div className="response-count">{Object.keys(room.event.choicesByTeam).length}/{room.teams.length} tập đoàn đã khóa phương án</div></div> : null}
        <div className="stage-actions"><Button onClick={() => act("host:event-open", { eventIndex: room.event.eventIndex })}>Mở sự kiện</Button><Button variant="success" disabled={room.event.status !== "open"} onClick={() => act("host:event-resolve", {}, "Đã áp dụng kết quả sự kiện")}>Xử lý kết quả</Button></div>
        {room.event.status === "resolved" ? (
          <div className="event-resolution-grid">
            {room.teams.map((team) => {
              const result = room.event.resultsByTeam[team.id];
              return result ? <EventResolutionSummary key={team.id} result={result} teamName={team.name} /> : null;
            })}
          </div>
        ) : null}
      </Card>
    );
  }

  if (room.phase === "strategy") {
    return (
      <Card>
        <SectionTitle title="Chiến lược dài hạn" description="Mỗi tập đoàn chọn tối đa một gói. Chi phí và chỉ số được áp dụng khi giảng viên chốt." />
        <div className="strategy-grid">{room.strategy.packages.map((item) => <div className="strategy-card" key={item.id}><span>{item.cost} triệu</span><h3>{item.name}</h3><p>{item.description}</p><ProjectEffects effects={item.effects} /></div>)}</div>
        <div className="response-count">{Object.keys(room.strategy.choicesByTeam).length}/{room.teams.length} tập đoàn đã chọn</div>
        <div className="stage-actions"><Button onClick={() => act("host:strategy-open")}>Mở lựa chọn</Button><Button variant="success" disabled={room.strategy.status !== "open"} onClick={() => act("host:strategy-resolve", {}, "Đã áp dụng chiến lược")}>Chốt chiến lược</Button><Button variant="danger" onClick={() => act("host:finish", {}, "Đã công bố kết quả")}>Kết thúc trò chơi</Button></div>
      </Card>
    );
  }

  return (
    <Card>
      <SectionTitle title="Kết quả chung cuộc" description="Màn hình trình chiếu sẽ hiển thị bục xếp hạng và chỉ số của các tập đoàn." />
      <Leaderboard room={room} />
      <div className="stage-actions"><Button variant="ghost" onClick={() => window.open(`/screen/${room.code}`, "_blank")}>Mở kết quả toàn màn hình</Button></div>
    </Card>
  );
}

function HostTeamInspector({ team, act }: { team: TeamPublic; act: <T>(event: string, payload?: unknown, success?: string) => Promise<T | undefined> }) {
  const [indicator, setIndicator] = useState<IndicatorKey>("economy");
  return (
    <Card>
      <SectionTitle title={team.name} description={`${team.members.length}/${team.memberLimit} thành viên · Mã ${team.code}`} />
      <div className="mini-stats"><span>Vốn <strong>{team.capital}</strong></span><span>Điểm <strong>{team.score}</strong></span><span>Thẻ <strong>{team.cards.filter((card) => !card.used).length}</strong></span></div>
      <IndicatorGrid indicators={team.indicators} compact />
      <div className="adjust-controls">
        <div><Button variant="ghost" onClick={() => act("host:adjust-capital", { teamId: team.id, delta: -50 })}>−50 vốn</Button><Button variant="ghost" onClick={() => act("host:adjust-capital", { teamId: team.id, delta: 50 })}>+50 vốn</Button></div>
        <select value={indicator} onChange={(event) => setIndicator(event.target.value as IndicatorKey)}>{(Object.keys(INDICATOR_LABELS) as IndicatorKey[]).map((key) => <option value={key} key={key}>{INDICATOR_LABELS[key]}</option>)}</select>
        <div><Button variant="ghost" onClick={() => act("host:adjust-indicator", { teamId: team.id, key: indicator, delta: -5 })}>−5 điểm</Button><Button variant="ghost" onClick={() => act("host:adjust-indicator", { teamId: team.id, key: indicator, delta: 5 })}>+5 điểm</Button></div>
      </div>
    </Card>
  );
}

function phaseLabel(phase: GamePhase): string {
  return { lobby: "Phòng chờ", quiz: "Kiến thức", auction: "Đấu giá", event: "Sự kiện", strategy: "Chiến lược", results: "Kết quả" }[phase];
}

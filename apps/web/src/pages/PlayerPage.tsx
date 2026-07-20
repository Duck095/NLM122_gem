import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { RoomPublicState, TacticalCard, TeamPublic } from "@mln122/shared";
import { Badge, Button, Card, EmptyState, PageShell, SectionTitle, TopBar } from "../components/Ui";
import {
  ConnectionBadge,
  IndicatorGrid,
  ProjectEffects,
  QuestionPanel,
  TeamInventory,
  TeamMetrics
} from "../components/GameWidgets";
import { useRoomSocket } from "../hooks/useRoomSocket";
import { readPlayerSession } from "../lib/session";

export function PlayerPage() {
  const { roomCode = "" } = useParams();
  const navigate = useNavigate();
  const session = readPlayerSession(roomCode);
  const { room, connected, error, emitAck } = useRoomSocket({
    roomCode,
    role: "player",
    token: session?.playerToken,
    teamId: session?.teamId
  });
  const [notice, setNotice] = useState<string | null>(null);

  async function act<T>(event: string, payload: unknown = {}, success?: string): Promise<T | undefined> {
    try {
      const data = await emitAck<T>(event, payload);
      if (success) setNotice(success);
      window.setTimeout(() => setNotice(null), 2500);
      return data;
    } catch (eventError) {
      setNotice(eventError instanceof Error ? eventError.message : "Thao tác thất bại");
      window.setTimeout(() => setNotice(null), 3500);
      return undefined;
    }
  }

  if (!session) {
    return <PageShell tone="player"><main className="center-message"><Card><h1>Chưa tham gia tập đoàn</h1><p>Hãy trở lại trang chủ, nhập mã phòng và tham gia một tập đoàn.</p><Button onClick={() => navigate("/")}>Về trang chủ</Button></Card></main></PageShell>;
  }
  if (!room) {
    return <PageShell tone="player"><main className="center-message"><Card><h1>Đang kết nối phòng {roomCode}</h1><p>{error || "Vui lòng chờ..."}</p><ConnectionBadge connected={connected} /></Card></main></PageShell>;
  }
  const team = room.teams.find((item) => item.id === session.teamId);
  if (!team) {
    return <PageShell tone="player"><main className="center-message"><Card><h1>Không tìm thấy tập đoàn</h1><p>Phiên người chơi không còn hợp lệ.</p><Button onClick={() => navigate("/")}>Về trang chủ</Button></Card></main></PageShell>;
  }

  return (
    <PageShell tone="player">
      <TopBar
        title={team.name}
        subtitle={`${room.title} · Mã tập đoàn ${team.code}`}
        status={<ConnectionBadge connected={connected} />}
        actions={<><Badge tone="info">Phòng {room.code}</Badge><Button variant="ghost" onClick={() => navigate("/")}>Trang chủ</Button></>}
      />
      {notice ? <div className="floating-notice">{notice}</div> : null}
      <main className="player-layout">
        <section className="player-main">
          <TeamMetrics team={team} />
          <PlayerStage room={room} team={team} act={act} />
          <Card>
            <SectionTitle title="Năm chỉ số phát triển" description="Duy trì cân bằng giữa các chỉ số để nhận điểm tổng hợp cao hơn." />
            <IndicatorGrid indicators={team.indicators} />
          </Card>
        </section>
        <aside className="player-sidebar">
          <Card>
            <SectionTitle title="Thành viên tập đoàn" description={`${team.members.length}/${team.memberLimit} người`} />
            <div className="member-list">{team.members.map((member, index) => <div key={member.id}><span>{index + 1}</span><strong>{member.name}</strong>{index === 0 ? <Badge tone="info">Trưởng nhóm</Badge> : null}</div>)}</div>
          </Card>
          <TeamInventory team={team} />
          <Card>
            <SectionTitle title="Dự án sở hữu" />
            {team.projects.length ? <div className="project-owned-list">{team.projects.map((project) => <div key={`${project.id}-${project.acquiredAt}`}><strong>{project.name}</strong><p>Thanh toán {project.paidPrice} triệu</p><ProjectEffects effects={project.effects} /></div>)}</div> : <p className="muted">Chưa sở hữu dự án.</p>}
          </Card>
        </aside>
      </main>
    </PageShell>
  );
}

function PlayerStage({ room, team, act }: { room: RoomPublicState; team: TeamPublic; act: <T>(event: string, payload?: unknown, success?: string) => Promise<T | undefined> }) {
  if (room.phase === "lobby") {
    return (
      <Card className="player-waiting">
        <Badge tone={room.locked ? "warning" : "success"}>{room.locked ? "Phòng đã khóa" : "Đang chờ thành viên"}</Badge>
        <h2>Tập đoàn đã sẵn sàng</h2>
        <p>Gửi mã tập đoàn cho các thành viên còn lại để họ vào đúng nhóm.</p>
        <div className="team-code-big">{team.code}</div>
        <small>Trò chơi bắt đầu khi giảng viên khóa phòng.</small>
      </Card>
    );
  }
  if (room.phase === "quiz") return <PlayerQuiz room={room} team={team} act={act} />;
  if (room.phase === "auction") return <PlayerAuction room={room} team={team} act={act} />;
  if (room.phase === "event") return <PlayerEvent room={room} team={team} act={act} />;
  if (room.phase === "strategy") return <PlayerStrategy room={room} team={team} act={act} />;
  return (
    <Card className="result-card-player"><Badge tone="success">KẾT QUẢ CHUNG CUỘC</Badge><div className="result-rank">#{team.rank}</div><h2>{team.name}</h2><p>{team.score} điểm tổng hợp · {team.capital} triệu vốn còn lại</p></Card>
  );
}

function PlayerQuiz({ room, team, act }: { room: RoomPublicState; team: TeamPublic; act: <T>(event: string, payload?: unknown, success?: string) => Promise<T | undefined> }) {
  const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => setSelected(null), [room.quiz.questionIndex, room.quiz.buzzRound, room.quiz.answeringTeamId]);
  const isEliminated = room.quiz.eliminatedTeamIds.includes(team.id);
  const hasRight = room.quiz.answeringTeamId === team.id && ["answering", "mandatory"].includes(room.quiz.status);
  const canOpenBox = room.quiz.status === "blindbox" && room.quiz.pendingBlindBoxTeamId === team.id;

  return (
    <>
      <QuestionPanel
        room={room}
        audience="player"
        answerControl={hasRight && room.quiz.question?.options ? {
          selectedIndex: selected,
          description: room.quiz.status === "mandatory" ? "Hết thời gian thảo luận — hãy chốt ngay." : "Có thể gửi trước khi hết thời gian.",
          onSelect: setSelected,
          onSubmit: () => {
            if (selected !== null) void act("player:quiz-answer", { answerIndex: selected });
          }
        } : undefined}
      >
        {room.quiz.status === "buzzing" ? (
          isEliminated
            ? <EmptyState title="Tập đoàn đã hết quyền ở câu này" text="Hãy theo dõi và chuẩn bị cho câu tiếp theo." />
            : <div className="buzz-inline"><p>Lượt {room.quiz.buzzRound}: tập đoàn nhanh nhất sẽ được xem đáp án.</p><button type="button" className="buzz-button" onClick={() => act("player:quiz-buzz")}>GIÀNH QUYỀN TRẢ LỜI</button></div>
        ) : room.quiz.status === "preview" ? (
          <EmptyState title="Hãy thảo luận câu hỏi" text="Đáp án và nút giành quyền sẽ xuất hiện khi giảng viên mở lượt." />
        ) : null}
      </QuestionPanel>
      {canOpenBox ? <BlindBoxGrid room={room} team={team} act={act} /> : null}
    </>
  );
}

function BlindBoxGrid({ room, team, act }: { room: RoomPublicState; team: TeamPublic; act: <T>(event: string, payload?: unknown, success?: string) => Promise<T | undefined> }) {
  return (
    <Card className="blindbox-card">
      <SectionTitle title="Chọn một túi mù" description="Chọn một trong 15 ô. Phần thưởng được áp dụng trực tiếp vào tập đoàn." />
      <div className="blindbox-grid">{room.blindBoxes.map((box) => <button type="button" key={box.index} disabled={box.opened} className={`blindbox ${box.opened ? "opened" : ""} ${box.openedByTeamId === team.id ? "mine" : ""}`} onClick={() => act("player:blindbox-open", { boxIndex: box.index })}><span>{String(box.index + 1).padStart(2, "0")}</span>{box.opened ? <small>{box.rewardName}</small> : <strong>?</strong>}</button>)}</div>
    </Card>
  );
}

function PlayerAuction({ room, team, act }: { room: RoomPublicState; team: TeamPublic; act: <T>(event: string, payload?: unknown, success?: string) => Promise<T | undefined> }) {
  const [amount, setAmount] = useState(room.auction.currentBid + room.auction.minIncrement);
  useEffect(() => setAmount(room.auction.currentBid + room.auction.minIncrement), [room.auction.currentBid, room.auction.minIncrement]);
  const discountCards = team.cards.filter((card) => !card.used && ["auction_discount_50", "auction_discount_30"].includes(card.type));
  const selectedCard = room.auction.selectedDiscountCardIdByTeam[team.id] || "";
  return (
    <Card>
      <SectionTitle title={room.auction.project?.name || "Đấu giá dự án"} description={room.auction.project?.description} action={<Badge tone={room.auction.status === "open" ? "success" : "neutral"}>{room.auction.status === "open" ? "Đang mở" : "Đã đóng/chưa mở"}</Badge>} />
      {room.auction.project ? <ProjectEffects effects={room.auction.project.effects} /> : null}
      <div className="auction-player-grid"><div className="bid-display"><span>Giá hiện tại</span><strong>{room.auction.currentBid} triệu</strong><p>Dẫn đầu: {room.teams.find((item) => item.id === room.auction.leaderTeamId)?.name || "Chưa có"}</p></div><div className="bid-controls"><label>Mức giá của bạn<input type="number" min={room.auction.currentBid + room.auction.minIncrement} step={10} value={amount} onChange={(event) => setAmount(Number(event.target.value))} /></label><div className="quick-bids"><button type="button" onClick={() => setAmount(room.auction.currentBid + 10)}>+10</button><button type="button" onClick={() => setAmount(room.auction.currentBid + 30)}>+30</button><button type="button" onClick={() => setAmount(room.auction.currentBid + 50)}>+50</button></div><Button disabled={room.auction.status !== "open" || amount > team.capital} onClick={() => act("player:auction-bid", { amount })}>Đặt giá {amount} triệu</Button></div></div>
      <label className="field"><span>Thẻ giảm giá nếu thắng</span><select value={selectedCard} onChange={(event) => act("player:auction-select-discount", { cardId: event.target.value || null })}><option value="">Không dùng thẻ</option>{discountCards.map((card) => <option key={card.id} value={card.id}>{card.name}</option>)}</select></label>
      {room.auction.lastResult ? <div className="outcome outcome-correct">{room.teams.find((item) => item.id === room.auction.lastResult?.teamId)?.name} thắng dự án và thanh toán {room.auction.lastResult.paid} triệu.</div> : null}
    </Card>
  );
}

function PlayerEvent({ room, team, act }: { room: RoomPublicState; team: TeamPublic; act: <T>(event: string, payload?: unknown, success?: string) => Promise<T | undefined> }) {
  const current = room.event.choicesByTeam[team.id];
  const [optionId, setOptionId] = useState(current?.optionId || "");
  const [cardId, setCardId] = useState(current?.cardId || "");
  useEffect(() => { setOptionId(current?.optionId || ""); setCardId(current?.cardId || ""); }, [current?.optionId, current?.cardId, room.event.eventIndex]);
  const defenseCards = team.cards.filter((card) => !card.used && ["shield", "project_recovery"].includes(card.type));
  return (
    <Card>
      <SectionTitle title={room.event.event?.name || "Sự kiện"} description={room.event.event?.description} action={<Badge tone={room.event.status === "open" ? "warning" : "neutral"}>{room.event.status === "open" ? "Đang quyết định" : "Đã xử lý/chưa mở"}</Badge>} />
      <div className="event-options">{room.event.event?.options.map((option) => <button type="button" key={option.id} className={`event-option ${optionId === option.id ? "selected" : ""}`} onClick={() => setOptionId(option.id)}><div><span>{option.capitalCost} triệu</span><strong>{option.title}</strong></div><p>{option.description}</p><ProjectEffects effects={option.effects} /></button>)}</div>
      <label className="field"><span>Thẻ phòng thủ tùy chọn</span><select value={cardId} onChange={(event) => setCardId(event.target.value)}><option value="">Không dùng thẻ</option>{defenseCards.map((card) => <option key={card.id} value={card.id}>{card.name}</option>)}</select></label>
      <Button className="wide" disabled={room.event.status !== "open" || !optionId} onClick={() => act("player:event-choose", { optionId, cardId: cardId || null }, "Đã khóa phương án")}>Xác nhận phương án</Button>
    </Card>
  );
}

function PlayerStrategy({ room, team, act }: { room: RoomPublicState; team: TeamPublic; act: <T>(event: string, payload?: unknown, success?: string) => Promise<T | undefined> }) {
  const selected = room.strategy.choicesByTeam[team.id];
  return (
    <Card>
      <SectionTitle title="Chọn chiến lược dài hạn" description="Mỗi tập đoàn chọn tối đa một gói; hệ thống áp dụng khi giảng viên chốt." />
      <div className="strategy-grid">{room.strategy.packages.map((item) => <button type="button" key={item.id} className={`strategy-card interactive ${selected === item.id ? "selected" : ""}`} disabled={room.strategy.status !== "open" || team.capital < item.cost} onClick={() => act("player:strategy-choose", { packageId: item.id }, "Đã chọn chiến lược")}><span>{item.cost} triệu</span><h3>{item.name}</h3><p>{item.description}</p><ProjectEffects effects={item.effects} /></button>)}</div>
      {selected ? <div className="outcome outcome-info">Đã khóa lựa chọn: {room.strategy.packages.find((item) => item.id === selected)?.name}</div> : null}
    </Card>
  );
}

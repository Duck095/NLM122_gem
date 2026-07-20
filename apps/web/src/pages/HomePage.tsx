import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, createTeam, getRoom, joinTeam } from "../lib/api";
import { saveHostSession, savePlayerSession } from "../lib/session";
import { Badge, Button, Card, Field, Modal, PageShell } from "../components/Ui";

const colors = ["#7c3aed", "#0ea5e9", "#10b981", "#f97316", "#ef4444", "#eab308"];

export function HomePage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [roomInfo, setRoomInfo] = useState<Awaited<ReturnType<typeof getRoom>> | null>(null);
  const [joinMode, setJoinMode] = useState<"create" | "join">("create");

  async function handleCreateRoom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const result = await createRoom({
        title: String(form.get("title") || "Lộ trình Việt Nam 2045"),
        className: String(form.get("className") || "MLN122"),
        maxTeams: Number(form.get("maxTeams") || 5),
        defaultTeamSize: Number(form.get("defaultTeamSize") || 5)
      });
      saveHostSession(result.roomCode, result.hostToken);
      navigate(`/host/${result.roomCode}`);
    } catch (eventError) {
      setError(eventError instanceof Error ? eventError.message : "Không thể tạo phòng");
    } finally {
      setBusy(false);
    }
  }

  async function inspectRoom(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const code = joinRoomCode.trim();
      const info = await getRoom(code);
      setRoomInfo(info);
    } catch (eventError) {
      setError(eventError instanceof Error ? eventError.message : "Không tìm thấy phòng");
    } finally {
      setBusy(false);
    }
  }

  async function handleTeamCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roomInfo) return;
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const result = await createTeam(roomInfo.roomCode, {
        name: String(form.get("name") || ""),
        leaderName: String(form.get("leaderName") || ""),
        memberLimit: Number(form.get("memberLimit") || roomInfo.defaultTeamSize),
        color: String(form.get("color") || colors[0])
      });
      savePlayerSession(roomInfo.roomCode, {
        teamId: result.teamId,
        playerToken: result.playerToken
      });
      navigate(`/player/${roomInfo.roomCode}`);
    } catch (eventError) {
      setError(eventError instanceof Error ? eventError.message : "Không thể tạo tập đoàn");
    } finally {
      setBusy(false);
    }
  }

  async function handleTeamJoin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roomInfo) return;
    setBusy(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      const result = await joinTeam(roomInfo.roomCode, {
        teamCode: String(form.get("teamCode") || "").toUpperCase(),
        playerName: String(form.get("playerName") || "")
      });
      savePlayerSession(roomInfo.roomCode, {
        teamId: result.teamId,
        playerToken: result.playerToken
      });
      navigate(`/player/${roomInfo.roomCode}`);
    } catch (eventError) {
      setError(eventError instanceof Error ? eventError.message : "Không thể tham gia tập đoàn");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <main className="home-page">
        <section className="hero-section">
          <div className="hero-copy">
            <Badge tone="info">GAMIFICATION REALTIME</Badge>
            <h1>Lộ trình Việt Nam 2045</h1>
            <p>Trò chơi mô phỏng công nghiệp hóa – hiện đại hóa, nơi các tập đoàn cạnh tranh bằng kiến thức, đầu tư, đấu giá và chiến lược phát triển cân bằng.</p>
            <div className="hero-features">
              <span>15 câu hỏi</span><span>15 túi mù</span><span>Đấu giá realtime</span><span>5 chỉ số phát triển</span>
            </div>
          </div>
          <div className="hero-orbit" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="country-mark">VN<br /><small>2045</small></div>
          </div>
        </section>

        {error ? <div className="global-error">{error}</div> : null}

        <section className="home-grid">
          <Card className="role-card host-role">
            <div className="role-icon">▦</div>
            <h2>Tạo phòng giảng viên</h2>
            <p>Điều khiển toàn bộ vòng chơi, theo dõi đội, mở câu hỏi và công bố kết quả.</p>
            <form className="form-stack" onSubmit={handleCreateRoom}>
              <Field label="Tên phiên chơi"><input name="title" defaultValue="Lộ trình Việt Nam 2045" required /></Field>
              <Field label="Lớp học"><input name="className" defaultValue="MLN122" required /></Field>
              <div className="form-row">
                <Field label="Số tập đoàn"><input name="maxTeams" type="number" min="2" max="10" defaultValue="5" required /></Field>
                <Field label="Thành viên/đội"><input name="defaultTeamSize" type="number" min="2" max="15" defaultValue="5" required /></Field>
              </div>
              <Button type="submit" disabled={busy}>{busy ? "Đang tạo..." : "Tạo phòng và điều khiển"}</Button>
            </form>
          </Card>

          <Card className="role-card player-role">
            <div className="role-icon">✦</div>
            <h2>Tham gia trò chơi</h2>
            <p>Lập tập đoàn mới hoặc nhập mã tập đoàn do trưởng nhóm gửi.</p>
            <form className="form-stack" onSubmit={inspectRoom}>
              <Field label="Mã phòng 6 số"><input value={joinRoomCode} onChange={(event) => setJoinRoomCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Ví dụ: 238800" inputMode="numeric" required /></Field>
              <Button type="submit" variant="secondary" disabled={busy || joinRoomCode.length !== 6}>Kiểm tra phòng</Button>
            </form>
          </Card>

          <Card className="role-card screen-role">
            <div className="role-icon">◫</div>
            <h2>Màn hình trình chiếu</h2>
            <p>Mở giao diện dành cho máy chiếu để hiển thị câu hỏi, đồng hồ, đấu giá và bảng xếp hạng.</p>
            <Field label="Mã phòng"><input id="screen-room" placeholder="Nhập mã phòng" inputMode="numeric" maxLength={6} /></Field>
            <Button variant="ghost" onClick={() => {
              const input = document.querySelector<HTMLInputElement>("#screen-room");
              if (input?.value.length === 6) navigate(`/screen/${input.value}`);
            }}>Mở trang trình chiếu</Button>
          </Card>
        </section>

        <GameGuide />
      </main>

      {roomInfo ? (
        <Modal title={`Phòng ${roomInfo.roomCode} · ${roomInfo.title}`} onClose={() => setRoomInfo(null)}>
          <div className="room-preview">
            <div><Badge tone={roomInfo.locked ? "warning" : "success"}>{roomInfo.locked ? "Phòng đã khóa" : "Đang nhận người chơi"}</Badge></div>
            <p>{roomInfo.className} · {roomInfo.teamCount}/{roomInfo.maxTeams} tập đoàn</p>
          </div>
          <div className="segmented">
            <button type="button" className={joinMode === "create" ? "active" : ""} onClick={() => setJoinMode("create")}>Lập tập đoàn mới</button>
            <button type="button" className={joinMode === "join" ? "active" : ""} onClick={() => setJoinMode("join")}>Vào tập đoàn đã có</button>
          </div>
          {joinMode === "create" ? (
            <form className="form-stack" onSubmit={handleTeamCreate}>
              <Field label="Tên tập đoàn"><input name="name" placeholder="Ví dụ: Khát Vọng Việt" required /></Field>
              <Field label="Tên trưởng nhóm"><input name="leaderName" required /></Field>
              <Field label="Số thành viên tối đa"><input name="memberLimit" type="number" min="2" max="15" defaultValue={roomInfo.defaultTeamSize} required /></Field>
              <Field label="Màu nhận diện">
                <div className="color-picker">{colors.map((color, index) => <label key={color}><input type="radio" name="color" value={color} defaultChecked={index === 0} /><span style={{ background: color }} /></label>)}</div>
              </Field>
              <Button type="submit" disabled={busy}>Tạo tập đoàn</Button>
            </form>
          ) : (
            <form className="form-stack" onSubmit={handleTeamJoin}>
              <Field label="Mã tập đoàn"><input name="teamCode" placeholder="Ví dụ: KVV5" maxLength={8} required /></Field>
              <Field label="Tên người chơi"><input name="playerName" required /></Field>
              <Button type="submit" disabled={busy}>Vào tập đoàn</Button>
            </form>
          )}
        </Modal>
      ) : null}
    </PageShell>
  );
}

type GuideTab = "start" | "stages" | "events" | "scoring";

function GameGuide() {
  const [activeTab, setActiveTab] = useState<GuideTab>("start");
  const tabs: Array<{ id: GuideTab; label: string }> = [
    { id: "start", label: "Bắt đầu" },
    { id: "stages", label: "5 giai đoạn" },
    { id: "events", label: "Sự kiện & thẻ" },
    { id: "scoring", label: "Chấm điểm" }
  ];

  return (
    <section className="game-guide" aria-labelledby="game-guide-title">
      <header className="game-guide-header">
        <div>
          <span>HƯỚNG DẪN VẬN HÀNH</span>
          <h2 id="game-guide-title">Cách chơi và tiêu chí xếp hạng</h2>
        </div>
        <p>Đọc nhanh trước khi tạo phòng hoặc dùng làm tài liệu phổ biến luật cho lớp.</p>
      </header>

      <div className="guide-tabs" role="tablist" aria-label="Nội dung hướng dẫn">
        {tabs.map((tab) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? "active" : ""}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="guide-panel" role="tabpanel">
        {activeTab === "start" ? <StartGuide /> : null}
        {activeTab === "stages" ? <StageGuide /> : null}
        {activeTab === "events" ? <EventAndCardGuide /> : null}
        {activeTab === "scoring" ? <ScoringGuide /> : null}
      </div>
    </section>
  );
}

function StartGuide() {
  return (
    <div className="guide-start-grid">
      <article>
        <span>01</span>
        <h3>Giảng viên tạo phòng</h3>
        <p>Nhập tên phiên, lớp, số tập đoàn và giới hạn thành viên. Gửi mã phòng 6 số cho lớp, theo dõi số đội rồi khóa phòng để bắt đầu.</p>
      </article>
      <article>
        <span>02</span>
        <h3>Trưởng nhóm lập tập đoàn</h3>
        <p>Nhập mã phòng, chọn “Lập tập đoàn mới”, đặt tên và màu nhận diện. Sau khi tạo, gửi mã tập đoàn cho các thành viên cùng nhóm.</p>
      </article>
      <article>
        <span>03</span>
        <h3>Thành viên và máy chiếu vào phòng</h3>
        <p>Thành viên nhập mã phòng và mã tập đoàn. Máy chiếu chỉ cần mã phòng, không có quyền điều khiển và luôn cập nhật theo thời gian thực.</p>
      </article>
      <div className="guide-operation-note">
        <strong>Quy ước vận hành</strong>
        <p>Giảng viên điều khiển thứ tự giai đoạn. Mỗi nhóm nên dùng một thiết bị đại diện để giành quyền, trả lời và ra quyết định; các thành viên còn lại cùng theo dõi và thảo luận.</p>
      </div>
    </div>
  );
}

function StageGuide() {
  const stages = [
    ["1", "Kiến thức", "Có 15 câu hỏi. Khi mở giành quyền, đội nhanh nhất có 15 giây thảo luận và 5 giây bắt buộc chốt. Trả lời sai hoặc hết giờ sẽ mất quyền ở câu đó; các đội còn lại tiếp tục tranh quyền. Đội trả lời đúng nhận 100 triệu và một lượt chọn túi mù."],
    ["2", "Đấu giá dự án", "Giảng viên mở một dự án. Các đội đặt giá tăng tối thiểu 10 triệu và không được vượt vốn hiện có. Đội dẫn đầu khi chốt sẽ thanh toán, nhận dự án và toàn bộ tác động chỉ số của dự án."],
    ["3", "Sự kiện vĩ mô", "Mỗi đội chọn một phương án ứng phó, trả chi phí vốn và nhận các tác động chỉ số. Có thể gắn Lá chắn khủng hoảng hoặc Phục hồi dự án trước khi khóa lựa chọn."],
    ["4", "Chiến lược dài hạn", "Mỗi đội chọn tối đa một gói đủ khả năng chi trả. Khi giảng viên xử lý, hệ thống trừ vốn và cộng các chỉ số của gói; đội không chọn sẽ không nhận gói nào."],
    ["5", "Kết quả", "Hệ thống xếp hạng theo điểm tổng hợp, không chỉ theo vốn. Đội phát triển cân bằng, có dự án, giữ vốn hợp lý và trả lời đúng sẽ có lợi thế." ]
  ];
  return (
    <div className="guide-stage-list">
      {stages.map(([number, title, text]) => (
        <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>
      ))}
    </div>
  );
}

function EventAndCardGuide() {
  return (
    <div className="guide-events-layout">
      <section>
        <h3>Logic xử lý sự kiện</h3>
        <ol>
          <li>Đội chọn một phương án và thẻ phòng thủ tùy chọn, sau đó khóa quyết định.</li>
          <li>Khi giảng viên bấm “Xử lý kết quả”, hệ thống trừ đúng chi phí vốn của phương án.</li>
          <li>Thẻ phòng thủ, nếu hợp lệ, điều chỉnh các tác động âm trước khi cộng/trừ vào năm chỉ số.</li>
          <li>Đội không khóa phương án sẽ tự động nhận phương án cuối cùng trong danh sách sự kiện và được đánh dấu rõ trong kết quả.</li>
          <li>Vốn trước/sau, tác động thực nhận và thẻ đã dùng được hiển thị cho đội, giảng viên và màn trình chiếu.</li>
        </ol>
      </section>
      <section className="guide-card-list">
        <article><strong>Lá chắn khủng hoảng</strong><p>Xóa toàn bộ tác động chỉ số âm của một sự kiện. Điểm dương và chi phí vốn vẫn giữ nguyên.</p></article>
        <article><strong>Phục hồi dự án</strong><p>Giảm 50% từng tác động chỉ số âm của sự kiện, làm tròn theo hướng giảm thiệt hại. Chi phí vốn vẫn giữ nguyên.</p></article>
        <article><strong>Đặc quyền đầu tư 50%</strong><p>Nếu đội thắng đấu giá, chỉ thanh toán 50% giá chốt. Thẻ chỉ tiêu hao khi đội thực sự thắng.</p></article>
        <article><strong>Ưu đãi đầu tư 30%</strong><p>Nếu đội thắng đấu giá, giảm 30% giá chốt. Không có tác dụng nếu đội không thắng.</p></article>
        <article><strong>Thưởng trực tiếp từ túi mù</strong><p>Các túi còn lại có thể cộng 60–75 triệu vốn hoặc cộng 7 điểm vào một trong năm trụ cột; hiệu lực áp dụng ngay khi mở.</p></article>
      </section>
    </div>
  );
}

function ScoringGuide() {
  return (
    <div className="guide-scoring-layout">
      <div className="guide-formula">
        <span>ĐIỂM TỔNG HỢP</span>
        <strong>
          <span>Trung bình 5 trụ cột</span> + <span>Cân bằng</span> + <span>Dự án</span> + <span>Vốn</span> + <span>Kiến thức</span>
        </strong>
        <p>Điểm cuối cùng được làm tròn đến một chữ số thập phân. Nếu bằng điểm, đội còn nhiều vốn hơn được xếp trên.</p>
      </div>
      <div className="guide-score-parts">
        <article><span>01</span><div><strong>Trung bình trụ cột</strong><p>Trung bình cộng của Kinh tế, Công nghệ, Tự chủ, Công bằng và Bền vững.</p></div></article>
        <article><span>02</span><div><strong>Thưởng cân bằng</strong><p>Tối đa 20 điểm. Công thức: 20 − 0,5 × chênh lệch giữa chỉ số cao nhất và thấp nhất; tối thiểu bằng 0.</p></div></article>
        <article><span>03</span><div><strong>Thưởng dự án</strong><p>Mỗi dự án sở hữu cộng 8 điểm.</p></div></article>
        <article><span>04</span><div><strong>Thưởng vốn</strong><p>Mỗi 100 triệu vốn còn lại cộng 1 điểm; vốn âm không tạo điểm thưởng.</p></div></article>
        <article><span>05</span><div><strong>Thưởng kiến thức</strong><p>Mỗi câu trả lời đúng cộng 2 điểm, ngoài 100 triệu và lượt túi mù đã nhận.</p></div></article>
      </div>
    </div>
  );
}

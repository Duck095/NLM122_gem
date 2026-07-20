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

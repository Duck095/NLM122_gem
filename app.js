const INDICATORS = [
  { key: "growth", label: "Tăng trưởng", full: "Tăng trưởng kinh tế", color: "var(--growth)", icon: "↗" },
  { key: "tech", label: "Công nghệ", full: "Hiện đại hóa công nghệ", color: "var(--tech)", icon: "◇" },
  { key: "autonomy", label: "Tự chủ", full: "Tự chủ nội địa", color: "var(--autonomy)", icon: "◎" },
  { key: "equity", label: "Công bằng", full: "Công bằng xã hội", color: "var(--equity)", icon: "=" },
  { key: "green", label: "Bền vững", full: "Phát triển bền vững", color: "var(--green)", icon: "⌁" },
];

const PHASES = [
  { id: "quiz", short: "Kiến thức", title: "Khởi động tri thức" },
  { id: "auction", short: "Đấu giá I", title: "Kiến tạo hạ tầng" },
  { id: "event", short: "Sự kiện", title: "Dịch chuyển chuỗi cung ứng" },
  { id: "strategy", short: "Chiến lược", title: "Điều chỉnh tầm nhìn 2045" },
  { id: "results", short: "Kết quả", title: "Việt Nam 2045" },
];

const TEAM_COLORS = ["#a7352d", "#7458a8", "#367cb3", "#3e8064", "#d47c37", "#9a6a32", "#426b6f", "#8a4f67"];

const BLIND_BOX_REWARDS = [
  { id: "shield-1", type: "inventory", name: "Lá chắn khủng hoảng", effect: "Hủy toàn bộ tác động tiêu cực của một sự kiện.", icon: "◈" },
  { id: "shield-2", type: "inventory", name: "Lá chắn khủng hoảng", effect: "Hủy toàn bộ tác động tiêu cực của một sự kiện.", icon: "◈" },
  { id: "project-recovery", type: "inventory", name: "Phục hồi dự án", effect: "Giảm 50% số điểm bị trừ đối với một dự án đang sở hữu.", icon: "↺" },
  { id: "auction-50", type: "inventory", name: "Đặc quyền đầu tư 50%", effect: "Giảm 50% số tiền phải thanh toán khi thắng một phiên đấu giá.", icon: "%" },
  { id: "auction-30", type: "inventory", name: "Ưu đãi đầu tư 30%", effect: "Giảm 30% số tiền phải thanh toán khi thắng một phiên đấu giá.", icon: "%" },
  { id: "growth-7", type: "indicator", indicator: "growth", name: "Bứt phá kinh tế", effect: "+7 điểm Tăng trưởng kinh tế.", value: 7, icon: "↗" },
  { id: "tech-7", type: "indicator", indicator: "tech", name: "Đột phá công nghệ", effect: "+7 điểm Hiện đại hóa công nghệ.", value: 7, icon: "◇" },
  { id: "autonomy-7", type: "indicator", indicator: "autonomy", name: "Sức mạnh nội địa", effect: "+7 điểm Tự chủ nội địa.", value: 7, icon: "◎" },
  { id: "equity-7", type: "indicator", indicator: "equity", name: "Thịnh vượng sẻ chia", effect: "+7 điểm Công bằng xã hội.", value: 7, icon: "=" },
  { id: "green-7", type: "indicator", indicator: "green", name: "Tương lai xanh", effect: "+7 điểm Phát triển bền vững.", value: 7, icon: "⌁" },
  { id: "capital-60-a", type: "capital", name: "Nguồn vốn khởi sắc", effect: "+60 triệu vốn.", value: 60, icon: "+" },
  { id: "capital-60-b", type: "capital", name: "Nguồn vốn khởi sắc", effect: "+60 triệu vốn.", value: 60, icon: "+" },
  { id: "capital-65-a", type: "capital", name: "Gói đầu tư tăng tốc", effect: "+65 triệu vốn.", value: 65, icon: "+" },
  { id: "capital-65-b", type: "capital", name: "Gói đầu tư tăng tốc", effect: "+65 triệu vốn.", value: 65, icon: "+" },
  { id: "capital-75", type: "capital", name: "Quỹ đầu tư chiến lược", effect: "+75 triệu vốn.", value: 75, icon: "+" },
];

function buildBlindBoxes() {
  const shuffled = BLIND_BOX_REWARDS.map((reward) => ({ ...reward })).sort(() => Math.random() - 0.5);
  return shuffled.map((reward, index) => ({ ...reward, boxNumber: index + 1, usedBy: null, usedByName: null }));
}
const teams = [];

const state = {
  view: "home",
  roomCode: "204586",
  className: "MLN122 · Kinh tế chính trị",
  sessionName: "Lộ trình CNH–HĐH Việt Nam",
  phaseIndex: 0,
  sound: true,
  currentTeam: null,
  currentPlayer: null,
  currentBid: 80,
  bidLeader: null,
  maxTeams: 5,
  defaultTeamSize: 5,
  blindBoxes: buildBlindBoxes(),
  activities: [
    { text: "Phòng đã mở · chờ người chơi lập tập đoàn", time: "--:--:--" },
  ],
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const app = $("#app");

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" })[char]);
}


function normalizeName(value) { return String(value || "").trim().replace(/\s+/g, " "); }
function initials(value) {
  const parts = normalizeName(value).split(" ").filter(Boolean);
  return (parts.slice(0, 2).map((part) => part[0]).join("") || "TG").toUpperCase();
}
function shortName(value) {
  const clean = normalizeName(value);
  return clean.length > 18 ? `${clean.slice(0, 17)}…` : clean;
}
function generateTeamCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  do {
    code = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  } while (teams.some((team) => team.code === code));
  return code;
}
function createTeamRecord(name, leader, maxMembers = state.defaultTeamSize) {
  const index = teams.length;
  return {
    id: `team-${Date.now()}-${index}`,
    code: generateTeamCode(),
    name: normalizeName(name),
    short: shortName(name),
    mark: initials(name),
    color: TEAM_COLORS[index % TEAM_COLORS.length],
    leader: normalizeName(leader),
    members: [normalizeName(leader)],
    maxMembers,
    capital: 300,
    inventory: [],
    blindBoxHistory: [],
    pendingBlindBox: false,
    lastReward: null,
    projects: 0,
    indicators: { growth: 50, tech: 50, autonomy: 50, equity: 50, green: 50 },
    quizAnswer: null,
    quizLocked: false,
    quizCorrect: false,
    eventChoice: null,
    eventLocked: false,
    strategyPackage: null,
  };
}
function participantCount() { return teams.reduce((total, team) => total + team.members.length, 0); }
function currentTeamRecord() { return Number.isInteger(state.currentTeam) ? teams[state.currentTeam] : null; }

function phase() { return PHASES[state.phaseIndex]; }
function average(team) { return Math.round(Object.values(team.indicators).reduce((a, b) => a + b, 0) / 5); }
function score(team) {
  const values = Object.values(team.indicators);
  const spread = Math.max(...values) - Math.min(...values);
  return Math.round(average(team) + Math.max(0, 15 - spread / 3) + team.projects * 2 + team.capital / 100);
}
function ranking() { return teams.map((team, index) => ({ team, index, score: score(team) })).sort((a, b) => b.score - a.score); }
function rankOf(index) { return ranking().findIndex((item) => item.index === index) + 1; }

function beep(frequency = 520, duration = 0.08) {
  if (!state.sound) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.045, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
  } catch (_) { /* Trình duyệt có thể chặn WebAudio. */ }
}

function icon(name) {
  const icons = { home: "⌂", host: "◉", team: "◎", display: "▣", sound: state.sound ? "♪" : "∅", next: "→", expand: "⛶", close: "×" };
  return icons[name] || "•";
}

function topbar(active = state.view) {
  return `
    <header class="topbar">
      <div class="container topbar-inner">
        <div class="brand" data-view="home" role="button" tabindex="0" aria-label="Về trang chủ">
          <span class="brand-mark">V</span>
          <span class="brand-copy"><strong>Việt Nam 2045</strong><span>Hành trình kiến tạo</span></span>
        </div>
        <nav class="nav" aria-label="Chuyển chế độ">
          <button class="nav-btn ${active === "host" ? "active" : ""}" data-view="host">${icon("host")} &nbsp;Giảng viên</button>
          <button class="nav-btn ${active === "team" ? "active" : ""}" data-view="team">${icon("team")} &nbsp;Đội chơi</button>
          <button class="nav-btn ${active === "display" ? "active" : ""}" data-view="display">${icon("display")} &nbsp;Trình chiếu</button>
        </nav>
        <span class="room-pill">PHÒNG ${state.roomCode}</span>
        <button class="icon-btn" data-action="sound" aria-label="Bật tắt âm thanh">${icon("sound")}</button>
      </div>
    </header>`;
}

function mapVisual() {
  return `
    <div class="vietnam-visual" aria-label="Minh họa hành trình Việt Nam 1986 đến 2045">
      <div class="map-rings"></div>
      <svg class="map-svg" viewBox="0 0 360 700" role="img" aria-label="Bản đồ cách điệu Việt Nam">
        <defs>
          <linearGradient id="mapFill" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stop-color="#244756"/><stop offset="1" stop-color="#18313b"/>
          </linearGradient>
          <pattern id="grid" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M18 0H0V18" fill="none" stroke="#d0ad72" stroke-opacity=".1"/></pattern>
        </defs>
        <path d="M171 18c-18 9-32 30-27 50 3 15 18 26 17 43-2 22-31 28-37 49-7 25 14 48 11 73-3 28-33 44-38 72-5 31 22 55 21 86-1 32-31 56-29 88 2 31 33 49 43 78 8 24 1 50 10 73 12 31 45 47 73 64 15 9 32-5 25-20-12-26-43-36-53-64-10-29 5-60 13-88 9-31 11-66-6-94-14-24-43-36-49-63-5-24 12-47 21-68 12-28 19-59 8-88-7-19-25-31-26-52-1-17 14-32 16-49 3-23-13-44-34-42z" fill="url(#mapFill)" stroke="#d0ad72" stroke-width="2"/>
        <path d="M171 18c-18 9-32 30-27 50 3 15 18 26 17 43-2 22-31 28-37 49-7 25 14 48 11 73-3 28-33 44-38 72-5 31 22 55 21 86-1 32-31 56-29 88 2 31 33 49 43 78 8 24 1 50 10 73 12 31 45 47 73 64 15 9 32-5 25-20-12-26-43-36-53-64-10-29 5-60 13-88 9-31 11-66-6-94-14-24-43-36-49-63-5-24 12-47 21-68 12-28 19-59 8-88-7-19-25-31-26-52-1-17 14-32 16-49 3-23-13-44-34-42z" fill="url(#grid)"/>
        <g fill="#d0ad72"><circle cx="150" cy="102" r="6"/><circle cx="118" cy="359" r="6"/><circle cx="173" cy="585" r="6"/></g>
        <g stroke="#d0ad72" stroke-width="1" stroke-dasharray="5 6" opacity=".7"><path d="M150 102L285 80"/><path d="M118 359L35 333"/><path d="M173 585L300 610"/></g>
        <g fill="#a7352d"><circle cx="285" cy="80" r="4"/><circle cx="35" cy="333" r="4"/><circle cx="300" cy="610" r="4"/></g>
      </svg>
      <div class="map-caption"><small>Tầm nhìn quốc gia</small><strong>Cân bằng để bứt phá</strong></div>
      <div class="map-stat"><b>59</b><span>Năm<br/>chuyển mình</span></div>
    </div>`;
}

function homeView() {
  return `
    <div class="app-shell">
      ${topbar("home")}
      <main class="hero">
        <div class="container">
          <div class="hero-grid">
            <section>
              <div class="eyebrow">Mô phỏng chiến lược kinh tế · Dành cho lớp học</div>
              <h1 class="display-title">Lộ trình<br/><em>Việt Nam 2045</em></h1>
              <p class="lead">Từ Đổi mới 1986 đến một nền kinh tế tự chủ, công bằng và bền vững. Người chơi tự thành lập tập đoàn, đặt tên và cùng đồng đội đưa ra các quyết định chiến lược.</p>
              <div class="hero-actions">
                <button class="btn btn-primary" data-action="open-create">Tạo phòng giảng viên <span>→</span></button>
                <button class="btn btn-ghost" data-action="open-join">Lập hoặc tham gia tập đoàn</button>
                <button class="btn btn-ghost" data-action="guide">Xem cách chơi</button>
              </div>
              <div class="era-line"><span>ĐỔI MỚI · 1986</span><span>TẦM NHÌN · 2045</span></div>
            </section>
            ${mapVisual()}
          </div>
          <section class="indicator-strip" aria-label="Năm chỉ số phát triển">
            ${INDICATORS.map((item, index) => `<div class="indicator-mini"><span class="indicator-number">0${index + 1}</span><span><strong>${item.full}</strong><span>Chỉ số trọng tâm</span></span></div>`).join("")}
          </section>
        </div>
      </main>
    </div>`;
}

function phaseTrack() {
  return `<div class="card phase-track">${PHASES.map((item, index) => `
    <div class="phase-item ${index < state.phaseIndex ? "done" : ""} ${index === state.phaseIndex ? "active" : ""}">
      <span class="phase-dot">${index < state.phaseIndex ? "✓" : index + 1}</span><span>${item.short}</span>
    </div>`).join("")}</div>`;
}

function microBars(team) {
  return `<div class="micro-bars" title="Năm chỉ số">${INDICATORS.map((item) => `<i style="background:${item.color};opacity:${Math.max(.25, team.indicators[item.key] / 100)}"></i>`).join("")}</div>`;
}

function teamTable() {
  if (!teams.length) {
    return `<div class="empty-state"><span class="empty-icon">◎</span><h3>Chưa có tập đoàn nào</h3><p>Người chơi sẽ tự lập tập đoàn, đặt tên và gửi mã mời cho các thành viên.</p></div>`;
  }
  return `<div class="table-scroll"><table class="team-table">
    <thead><tr><th>Tập đoàn</th><th>Thành viên</th><th>Mã đội</th><th>Vốn</th><th>Chỉ số</th><th>Xếp hạng</th><th>Trạng thái</th><th></th></tr></thead>
    <tbody>${teams.map((team, index) => `<tr>
      <td><div class="team-name"><span class="team-emblem" style="background:${team.color}">${team.mark}</span><div><strong>${escapeHtml(team.short)}</strong><small>${escapeHtml(team.leader)} · Trưởng nhóm</small></div></div></td>
      <td class="mono">${team.members.length}/${team.maxMembers}</td><td><span class="code-pill">${team.code}</span></td>
      <td class="mono">${team.capital} tr</td><td>${microBars(team)}</td><td>#${rankOf(index)}</td>
      <td><span class="status-dot"></span>${team.members.length >= team.maxMembers ? "Đã đủ đội" : "Đang nhận thành viên"}</td>
      <td><button class="chip" data-action="add-capital" data-team="${index}">+5 vốn</button></td>
    </tr>`).join("")}</tbody>
  </table></div>`;
}

function hostView() {
  const answered = teams.filter((team) => team.quizLocked).length;
  const leader = state.bidLeader === null ? null : teams[state.bidLeader];
  return `
    <div class="app-shell host-mode">
      ${topbar("host")}
      <main class="page"><div class="container">
        <header class="page-header">
          <div><span class="eyebrow">Bảng điều phối · ${escapeHtml(state.className)}</span><h1>Trung tâm điều hành</h1></div>
          <div class="page-meta"><button class="btn btn-ghost btn-sm" data-view="display">Mở màn hình lớp</button><button class="btn btn-primary btn-sm" data-action="next-phase">Giai đoạn tiếp theo →</button></div>
        </header>
        <div class="dashboard-grid">
          <section class="main-stack">
            ${phaseTrack()}
            <div class="control-panel">
              <span class="team-emblem" style="background:var(--red)">${state.phaseIndex + 1}</span>
              <div class="control-copy"><small>GIAI ĐOẠN ${state.phaseIndex + 1} / ${PHASES.length} · ĐANG DIỄN RA</small><strong>${phase().title}</strong></div>
              <button class="btn btn-gold btn-sm" data-action="next-phase">Chuyển giai đoạn →</button>
            </div>
            <div class="stats-row">
              <div class="card stat-card"><span class="label">Người tham gia</span><div class="stat-value">${participantCount()}</div><span class="stat-trend">${teams.length} tập đoàn đã lập</span></div>
              <div class="card stat-card"><span class="label">Đã phản hồi</span><div class="stat-value">${answered}/${teams.length || 0}</div><span class="stat-trend">Theo từng tập đoàn</span></div>
              <div class="card stat-card"><span class="label">Giá hiện tại</span><div class="stat-value">${state.currentBid} tr</div><span class="stat-trend">${leader ? `${escapeHtml(leader.short)} dẫn đầu` : "Chưa có lượt đặt giá"}</span></div>
              <div class="card stat-card"><span class="label">Sức chứa</span><div class="stat-value">${teams.length}/${state.maxTeams}</div><span class="stat-trend">Tập đoàn tối đa</span></div>
            </div>
            <div class="card card-pad">
              <div class="card-title"><div><h2>Các tập đoàn do người chơi thành lập</h2><p>Tên đội, thành viên, vốn và chỉ số được cập nhật tại đây</p></div><button class="btn btn-ghost btn-sm" data-action="show-results">Xem xếp hạng</button></div>
              ${teamTable()}
            </div>
          </section>
          <aside class="side-stack">
            <div class="card card-pad">
              <div class="card-title"><div><h3>Phòng tham gia</h3><p>Gửi mã này cho cả lớp</p></div><span class="team-emblem" style="background:var(--gold)">#</span></div>
              <div class="room-code-large">${state.roomCode}</div>
              <p class="muted" style="font-size:11px">Mỗi nhóm chọn một đại diện lập tập đoàn. Sau đó đại diện gửi mã tập đoàn cho các thành viên còn lại.</p>
              <button class="btn btn-dark btn-block" data-action="copy-room">Sao chép mã phòng</button>
            </div>
            <div class="card card-pad">
              <div class="card-title"><div><h3>Nhật ký trực tiếp</h3><p>Mọi điều chỉnh đều được lưu</p></div></div>
              <div class="activity-list">${state.activities.slice(0, 8).map((item) => `<div class="activity-item">${escapeHtml(item.text)}<time>${item.time}</time></div>`).join("")}</div>
            </div>
          </aside>
        </div>
      </div></main>
    </div>`;
}

function indicatorCards(team) {
  return INDICATORS.map((item) => `<div class="card indicator-card">
    <div class="indicator-head"><strong>${item.icon} ${item.label}</strong><b>${team.indicators[item.key]}</b></div>
    <div class="progress"><span style="width:${team.indicators[item.key]}%;background:${item.color}"></span></div>
  </div>`).join("");
}

function quizFeature(team) {
  const options = ["1986", "1995", "2007", "2011"];
  const rewardState = team.quizCorrect
    ? `<div class="quiz-reward-strip"><div><strong>Đáp án chính xác · +100 triệu vốn</strong><span>${team.pendingBlindBox ? "Bạn còn 1 lượt chọn túi mù." : team.lastReward ? `Đã nhận: ${escapeHtml(team.lastReward.name)}` : "Phần thưởng đã được ghi nhận."}</span></div>${team.pendingBlindBox ? '<button class="btn btn-gold btn-sm" data-action="open-blind-box">Chọn túi mù →</button>' : ""}</div>`
    : "";
  return `<div class="card feature-card">
    <span class="feature-kicker">Câu hỏi 03 / 15</span>
    <h2>Việt Nam chính thức gia nhập ASEAN vào năm nào?</h2>
    <p>Thảo luận trong nhóm và chọn một đáp án đại diện cho tập đoàn.</p>
    ${rewardState}
    <div class="question-options">${options.map((option, index) => `<button class="option ${team.quizAnswer === index ? "selected" : ""}" data-action="select-answer" data-value="${index}" ${team.quizLocked ? "disabled" : ""}><span class="option-key">${String.fromCharCode(65 + index)}</span><strong>${option}</strong></button>`).join("")}</div>
    <button class="btn btn-primary" data-action="confirm-answer" ${team.quizAnswer === null || team.quizLocked ? "disabled" : ""}>${team.quizLocked ? (team.quizCorrect ? "Đã trả lời đúng" : "Đã gửi đáp án") : "Xác nhận đáp án"}</button>
  </div>`;
}

function auctionFeature(team) {
  return `<div class="card feature-card">
    <span class="feature-kicker">Dự án 01 · Hạ tầng số</span>
    <h2>Trung tâm dữ liệu quốc gia</h2>
    <p>Nền tảng dữ liệu dùng chung phục vụ chính phủ số, doanh nghiệp và hệ sinh thái AI. Dự án tạo lợi thế lớn về công nghệ nhưng cần bảo đảm năng lực tự chủ.</p>
    <div class="project-meta">
      <div class="meta-box"><span class="label">Tác động</span><strong style="color:var(--tech)">+18 Công nghệ</strong></div>
      <div class="meta-box"><span class="label">Tự chủ</span><strong style="color:var(--autonomy)">+8 Nội địa</strong></div>
      <div class="meta-box"><span class="label">Giá khởi điểm</span><strong>80 triệu</strong></div>
    </div>
    <div class="bid-stage">
      <div class="bid-head"><div class="current-bid"><span class="label">Giá hiện tại</span><strong>${state.currentBid} triệu</strong></div><div class="bid-leader">Dẫn đầu bởi<b>${state.bidLeader === null ? "Chưa có" : escapeHtml(teams[state.bidLeader].short)}</b></div></div>
      <div class="bid-form"><input id="bid-input" class="input mono" type="number" min="${state.currentBid + 5}" max="${team.capital}" value="${Math.min(state.currentBid + 5, team.capital)}"/><button class="btn btn-primary" data-action="place-bid">Đặt giá</button></div>
      <div class="bid-shortcuts"><button class="chip" data-action="quick-bid" data-value="5">+5</button><button class="chip" data-action="quick-bid" data-value="10">+10</button><button class="chip" data-action="quick-bid" data-value="20">+20</button><span class="muted" style="margin-left:auto;font-size:9px;align-self:center">Tối đa ${team.capital} triệu</span></div>
    </div>
  </div>`;
}

function eventFeature(team) {
  const choices = [
    { title: "Nội địa hóa chuỗi cung ứng", text: "Chi 45 triệu · tăng tự chủ và khả năng chống chịu." },
    { title: "Mở rộng nhập khẩu chiến lược", text: "Tăng trưởng nhanh, chi phí thấp nhưng rủi ro phụ thuộc." },
    { title: "Liên minh nghiên cứu khu vực", text: "Cân bằng công nghệ và tự chủ trong trung hạn." },
  ];
  return `<div class="card feature-card">
    <span class="feature-kicker">Tin khẩn · Quyết định bí mật</span><h2>Dịch chuyển chuỗi cung ứng toàn cầu</h2>
    <p>Các thành viên cần thống nhất một lựa chọn trước khi trưởng nhóm gửi quyết định của tập đoàn.</p>
    <div class="choice-list">${choices.map((choice, index) => `<div class="choice-card ${team.eventChoice === index ? "selected" : ""}" data-action="select-event" data-value="${index}"><strong>${choice.title}</strong><p>${choice.text}</p></div>`).join("")}</div>
    <button class="btn btn-primary" style="margin-top:16px" data-action="confirm-event" ${team.eventChoice === null || team.eventLocked ? "disabled" : ""}>${team.eventLocked ? "Quyết định đã được niêm phong" : "Xác nhận quyết định"}</button>
  </div>`;
}

function strategyFeature(team) {
  const packages = [
    { title: "Đào tạo lại lao động", text: "+14 Công bằng · +6 Công nghệ", price: 55, effects: { equity: 14, tech: 6 } },
    { title: "Xanh hóa sản xuất", text: "+16 Bền vững · +4 Tăng trưởng", price: 60, effects: { green: 16, growth: 4 } },
    { title: "Nâng cấp doanh nghiệp nội địa", text: "+15 Tự chủ · +5 Tăng trưởng", price: 65, effects: { autonomy: 15, growth: 5 } },
  ];
  return `<div class="card feature-card">
    <span class="feature-kicker">Vòng 3 · Giá cố định</span><h2>Điều chỉnh chiến lược 2045</h2>
    <p>Cả tập đoàn chọn một gói đầu tư để củng cố điểm yếu trước khi hệ thống đánh giá.</p>
    <div class="package-list">${packages.map((item, index) => `<div class="package-card ${team.strategyPackage === index ? "selected" : ""}" data-action="select-package" data-value="${index}"><div><strong>${item.title}</strong><p>${item.text}</p></div><span class="package-price">${item.price} tr</span></div>`).join("")}</div>
    <button class="btn btn-primary" style="margin-top:16px" data-action="buy-package" ${team.strategyPackage === null ? "disabled" : ""}>Xác nhận đầu tư</button>
  </div>`;
}

function resultsFeature() {
  const top = ranking().slice(0, 3);
  if (!top.length) return `<div class="card feature-card"><span class="feature-kicker">Kết quả</span><h2>Chưa có tập đoàn tham gia</h2><p>Hãy lập ít nhất một tập đoàn trước khi công bố kết quả.</p></div>`;
  return `<div class="card results-hero"><div class="trophy">✦</div><span class="eyebrow">Tầm nhìn Việt Nam 2045</span><h1>Hành trình đã hoàn thành</h1><p class="muted">Kết quả ghi nhận cả thành tựu, mức cân bằng và khả năng chống chịu của từng mô hình.</p><div class="podium dynamic-podium">${top.map((item, index) => `<div class="podium-item ${index === 0 ? "first" : ""}"><span class="podium-place">0${index + 1}</span><strong>${escapeHtml(item.team.short)}</strong><span class="mono">${item.score} điểm</span></div>`).join("")}</div></div>`;
}

function activeFeature(team) {
  return ({ quiz: () => quizFeature(team), auction: () => auctionFeature(team), event: () => eventFeature(team), strategy: () => strategyFeature(team), results: resultsFeature })[phase().id]();
}

function inventoryPanel(team) {
  if (!team.inventory.length) {
    return `<div class="inventory-empty">Chưa có thẻ chiến thuật. Thẻ nhận từ túi mù sẽ xuất hiện tại đây.</div>`;
  }
  return `<div class="inventory-list">${team.inventory.map((card, index) => `<div class="inventory-card"><span class="inventory-icon">${card.icon || "✦"}</span><div><strong>${escapeHtml(card.name)}</strong><p>${escapeHtml(card.effect)}</p></div><span class="inventory-count">#${String(index + 1).padStart(2, "0")}</span></div>`).join("")}</div>`;
}

function recentRewardsPanel(team) {
  if (!team.blindBoxHistory.length) return "";
  return `<div class="recent-reward"><span>Phần thưởng gần nhất</span><strong>${escapeHtml(team.blindBoxHistory.at(-1).name)}</strong><small>${escapeHtml(team.blindBoxHistory.at(-1).effect)}</small></div>`;
}

function teamView() {
  const team = currentTeamRecord();
  if (!team) {
    return `<div class="app-shell team-mode" style="--role-accent:#6f4bd8">${topbar("team")}<main class="page"><div class="container narrow-container">
      <section class="card team-entry-hero"><span class="eyebrow">Phòng ${state.roomCode}</span><h1>Bắt đầu bằng cách lập tập đoàn</h1><p>Mỗi nhóm cử một đại diện đặt tên tập đoàn và tạo mã mời. Các thành viên còn lại dùng mã đó để vào đúng đội.</p><div class="hero-actions"><button class="btn btn-primary" data-action="open-team-create">Lập tập đoàn mới →</button><button class="btn btn-ghost" data-action="open-team-join">Vào tập đoàn đã có</button></div></section>
    </div></main></div>`;
  }
  const ranks = ranking();
  return `<div class="app-shell team-mode" style="--role-accent:${team.color}">
    ${topbar("team")}
    <main class="page"><div class="container">
      <header class="page-header"><div><span class="eyebrow">Bảng chiến lược tập đoàn</span><h1>Phòng ${state.roomCode}</h1></div><div class="page-meta"><span class="player-pill">${escapeHtml(state.currentPlayer || team.leader)}</span><button class="btn btn-ghost btn-sm" data-action="open-join">Đổi tài khoản đội</button></div></header>
      <section class="card team-hero"><div><span class="label" style="color:rgba(255,255,255,.55)">Tập đoàn do người chơi thành lập · Mã ${team.code}</span><h1>${escapeHtml(team.name)}</h1><span style="color:rgba(255,255,255,.55)">${team.members.length}/${team.maxMembers} thành viên · Hạng #${rankOf(state.currentTeam)} · ${team.projects} dự án · ${team.inventory.length} thẻ chiến thuật</span></div><div class="capital"><span>Vốn khả dụng</span><strong>${team.capital} triệu</strong></div></section>
      <div style="height:14px"></div>${phaseTrack()}<div style="height:14px"></div>
      <section class="indicator-grid">${indicatorCards(team)}</section>
      <div style="height:18px"></div>
      <div class="play-grid"><div>${activeFeature(team)}</div><aside class="side-stack">
        <div class="card card-pad"><div class="card-title"><div><h3>Thành viên tập đoàn</h3><p>${team.members.length}/${team.maxMembers} vị trí đã có người</p></div><span class="code-pill">${team.code}</span></div><div class="member-list">${team.members.map((member, index) => `<div class="member-item"><span>${index + 1}</span><strong>${escapeHtml(member)}</strong>${member === team.leader ? "<small>Trưởng nhóm</small>" : ""}</div>`).join("")}</div><button class="btn btn-ghost btn-block" style="margin-top:14px" data-action="copy-invite">Sao chép lời mời</button></div>
        <div class="card card-pad"><div class="card-title"><div><h3>Vị thế hiện tại</h3><p>Xếp theo điểm cân bằng</p></div><span class="mono">#${rankOf(state.currentTeam)}</span></div><div class="rank-list">${ranks.map((item, index) => `<div class="rank-item"><span class="rank-number">${index + 1}</span><span class="rank-name">${escapeHtml(item.team.short)}</span><span class="rank-score">${item.score} đ</span></div>`).join("")}</div></div>
        <div class="card card-pad"><div class="card-title"><div><h3>Kho thẻ chiến thuật</h3><p>Thẻ đặc biệt nhận từ túi mù</p></div><span class="mono">${team.inventory.length}</span></div>${inventoryPanel(team)}${recentRewardsPanel(team)}</div>
      </aside></div>
    </div></main>
  </div>`;
}

function displayView() {
  const ranks = ranking();
  const leader = state.bidLeader === null ? null : teams[state.bidLeader];
  const scenes = {
    quiz: {
      icon: "?",
      kicker: "Vòng kiến thức · 15 câu hỏi",
      title: "Khởi động tri thức",
      description: "Các tập đoàn tranh quyền trả lời để tích lũy vốn, mở túi mù và xây dựng lợi thế cho những vòng chiến lược tiếp theo.",
      statusLabel: "Trạng thái câu hỏi",
      statusValue: "Sẵn sàng",
      statusNote: `${participantCount()} người chơi đang tham gia`,
    },
    auction: {
      icon: "◆",
      kicker: "Đấu giá dự án quốc gia",
      title: "Trung tâm dữ liệu quốc gia",
      description: "Hạ tầng dữ liệu dùng chung phục vụ chính phủ số, doanh nghiệp và hệ sinh thái trí tuệ nhân tạo Việt Nam.",
      statusLabel: "Giá đấu hiện tại",
      statusValue: `${state.currentBid} triệu`,
      statusNote: leader ? `${escapeHtml(leader.short)} đang dẫn đầu` : "Chưa có lượt đặt giá",
    },
    event: {
      icon: "!",
      kicker: "Biến động kinh tế toàn cầu",
      title: "Dịch chuyển chuỗi cung ứng",
      description: "Mỗi tập đoàn phải phản ứng trước thay đổi của thương mại, công nghệ và năng lực tự chủ trong nước.",
      statusLabel: "Trạng thái sự kiện",
      statusValue: "Đang ứng phó",
      statusNote: `${teams.filter((team) => team.eventLocked).length}/${teams.length || 0} tập đoàn đã chốt`,
    },
    strategy: {
      icon: "✦",
      kicker: "Chặng tăng tốc 2045",
      title: "Điều chỉnh chiến lược",
      description: "Các tập đoàn đầu tư nguồn lực cuối cùng để cân bằng tăng trưởng, công nghệ, tự chủ, công bằng và bền vững.",
      statusLabel: "Trạng thái phiên",
      statusValue: "Đang lựa chọn",
      statusNote: `${teams.filter((team) => team.strategyPackage !== null).length}/${teams.length || 0} tập đoàn đã đầu tư`,
    },
    results: {
      icon: "★",
      kicker: "Đích đến Việt Nam 2045",
      title: "Bảng xếp hạng chung cuộc",
      description: "Thành tích được đánh giá từ mức phát triển, khả năng cân bằng, dự án sở hữu và nguồn lực còn lại.",
      statusLabel: "Tập đoàn dẫn đầu",
      statusValue: ranks[0] ? escapeHtml(ranks[0].team.short) : "Đang cập nhật",
      statusNote: ranks[0] ? `${ranks[0].score} điểm tổng hợp` : "Chưa có dữ liệu xếp hạng",
    },
  };
  const scene = scenes[phase().id];
  const phaseProgress = Math.round(((state.phaseIndex + 1) / PHASES.length) * 100);

  return `<div class="display-mode display-phase-${phase().id}">
    <div class="display-aurora display-aurora-one"></div>
    <div class="display-aurora display-aurora-two"></div>
    <div class="display-grid-glow"></div>
    <header class="display-topbar">
      <div class="display-brand"><span class="display-brand-mark">V</span><span><strong>Việt Nam 2045</strong><small>Phòng ${state.roomCode}</small></span></div>
      <div class="display-phase-nav">${PHASES.map((item, index) => `<div class="display-phase-step ${index < state.phaseIndex ? "done" : ""} ${index === state.phaseIndex ? "active" : ""}"><i>${index < state.phaseIndex ? "✓" : index + 1}</i><span>${item.short}</span></div>`).join("")}</div>
      <div class="display-live"><i></i><span>ĐANG TRỰC TIẾP</span></div>
      <button class="icon-btn display-fullscreen" data-action="fullscreen" aria-label="Toàn màn hình">${icon("expand")}</button>
      <button class="icon-btn display-close" data-view="home" aria-label="Đóng">${icon("close")}</button>
    </header>

    <main class="display-content">
      <section class="display-hero-panel">
        <div class="display-project">
          <div class="display-kicker"><span class="display-kicker-icon">${scene.icon}</span><span>${scene.kicker}</span></div>
          <h1>${scene.title}</h1>
          <p>${scene.description}</p>
          <div class="display-facts">
            <div><span>Tập đoàn</span><strong>${teams.length}/${state.maxTeams}</strong></div>
            <div><span>Người chơi</span><strong>${participantCount()}</strong></div>
            <div><span>Tiến độ</span><strong>${phaseProgress}%</strong></div>
          </div>
        </div>

        <section class="display-status-wrap">
          <div class="display-orbit orbit-a"></div><div class="display-orbit orbit-b"></div>
          <div class="display-stage-card">
            <span class="display-stage-label">${scene.statusLabel}</span>
            <strong>${scene.statusValue}</strong>
            <small>${scene.statusNote}</small>
            <div class="display-progress-ring"><span style="--progress:${phaseProgress * 3.6}deg"></span><b>${state.phaseIndex + 1}/${PHASES.length}</b></div>
          </div>
        </section>
      </section>

      <section class="display-ranking-section">
        <div class="display-section-head"><div><span>BẢNG XẾP HẠNG TRỰC TIẾP</span><h2>Vị thế các tập đoàn</h2></div><div class="display-section-note">Cập nhật theo vốn, dự án và 5 chỉ số phát triển</div></div>
        <div class="display-ranks">${ranks.length ? ranks.map((item, index) => `<article class="display-rank podium-${index + 1} ${item.index === state.bidLeader ? "active" : ""}" style="--rank-accent:${item.team.color}">
          <div class="display-rank-top"><span class="place">${String(index + 1).padStart(2, "0")}</span><span class="display-rank-emblem">${escapeHtml(item.team.mark)}</span></div>
          <h3>${escapeHtml(item.team.short)}</h3>
          <div class="display-rank-metrics"><span>${item.team.capital} tr vốn</span><strong>${item.score} điểm</strong></div>
          <div class="display-rank-bar"><i style="width:${Math.min(100, item.score)}%"></i></div>
        </article>`).join("") : `<div class="display-empty">Đang chờ các nhóm lập tập đoàn…</div>`}</div>
      </section>

      <footer class="display-ticker"><span class="display-ticker-label">VIỆT NAM 2045</span><div><b>Giai đoạn ${state.phaseIndex + 1}:</b> ${phase().title}</div><span class="display-ticker-room">MÃ PHÒNG ${state.roomCode}</span></footer>
    </main>
  </div>`;
}

function render() {
  app.innerHTML = ({ home: homeView, host: hostView, team: teamView, display: displayView })[state.view]();
  document.title = `${state.view === "home" ? "Lộ trình" : state.view === "host" ? "Điều hành" : state.view === "team" ? "Đội chơi" : "Trình chiếu"} · Việt Nam 2045`;
}

function toast(message, type = "") {
  const item = document.createElement("div");
  item.className = `toast ${type}`;
  item.textContent = message;
  $("#toast-region").appendChild(item);
  setTimeout(() => item.remove(), 3200);
}

function now() { return new Date().toLocaleTimeString("vi-VN", { hour12: false }); }
function logActivity(text) { state.activities.unshift({ text, time: now() }); }

function openModal(content) {
  $("#modal-root").innerHTML = `<div class="modal-backdrop" data-modal-backdrop><section class="modal" role="dialog" aria-modal="true">${content}</section></div>`;
}
function closeModal() { $("#modal-root").innerHTML = ""; }

function blindBoxGrid() {
  return `<div class="blind-box-grid">${state.blindBoxes.map((box) => `<button class="blind-box ${box.usedBy ? "opened" : ""}" data-action="pick-blind-box" data-box="${box.boxNumber}" ${box.usedBy ? "disabled" : ""} aria-label="Túi mù số ${box.boxNumber}"><span class="blind-box-number">${String(box.boxNumber).padStart(2, "0")}</span><span class="blind-box-symbol">${box.usedBy ? "✓" : "?"}</span><small>${box.usedBy ? "Đã mở" : "Chọn túi"}</small></button>`).join("")}</div>`;
}

function openBlindBoxModal(team) {
  if (!team?.pendingBlindBox) return toast("Tập đoàn chưa có lượt chọn túi mù", "alert");
  const remaining = state.blindBoxes.filter((box) => !box.usedBy).length;
  openModal(`<div class="modal-head"><div><span class="eyebrow">Phần thưởng câu hỏi</span><h2>Chọn một túi mù</h2></div><button class="icon-btn" data-action="close-modal">×</button></div><p class="modal-intro">Có 15 ô, mỗi hàng 3 ô. Chọn một ô chưa mở để nhận phần thưởng cho ${escapeHtml(team.name)}.</p><div class="blind-box-meta"><span>Còn lại</span><strong>${remaining}/15 túi</strong></div>${blindBoxGrid()}`);
}

function rewardSummary(team, box, beforeValue, afterValue) {
  if (box.type === "capital") return `Vốn của tập đoàn: ${beforeValue} → ${afterValue} triệu.`;
  if (box.type === "indicator") {
    const label = INDICATORS.find((item) => item.key === box.indicator)?.full || "Chỉ số";
    return `${label}: ${beforeValue} → ${afterValue} điểm.`;
  }
  return `Thẻ đã được thêm vào Kho thẻ chiến thuật của ${team.name}.`;
}

function applyBlindBoxReward(team, box) {
  let beforeValue = null;
  let afterValue = null;
  if (box.type === "capital") {
    beforeValue = team.capital;
    team.capital += box.value;
    afterValue = team.capital;
  } else if (box.type === "indicator") {
    beforeValue = team.indicators[box.indicator];
    team.indicators[box.indicator] = Math.min(100, beforeValue + box.value);
    afterValue = team.indicators[box.indicator];
  } else {
    team.inventory.push({ id: box.id, name: box.name, effect: box.effect, icon: box.icon, sourceBox: box.boxNumber });
  }
  box.usedBy = team.id;
  box.usedByName = team.name;
  team.pendingBlindBox = false;
  team.lastReward = { name: box.name, effect: box.effect, boxNumber: box.boxNumber };
  team.blindBoxHistory.push({ name: box.name, effect: box.effect, boxNumber: box.boxNumber, type: box.type });
  logActivity(`${team.short} mở túi số ${String(box.boxNumber).padStart(2, "0")} và nhận ${box.name}`);
  return rewardSummary(team, box, beforeValue, afterValue);
}

function rewardRevealModal(team, box, summary) {
  openModal(`<div class="reward-reveal"><span class="reward-badge">TÚI SỐ ${String(box.boxNumber).padStart(2, "0")}</span><div class="reward-icon">${box.icon || "✦"}</div><span class="eyebrow">Phần thưởng đã mở</span><h2>${escapeHtml(box.name)}</h2><p class="reward-effect">${escapeHtml(box.effect)}</p><div class="reward-applied">${escapeHtml(summary)}</div><button class="btn btn-primary btn-block" data-action="close-modal">Xem trang tập đoàn →</button></div>`);
}

function createModal() {
  openModal(`<div class="modal-head"><div><span class="eyebrow">Dành cho giảng viên</span><h2>Tạo phòng mới</h2></div><button class="icon-btn" data-action="close-modal">×</button></div>
    <form id="create-form"><div class="form-grid"><div class="field full"><label>Tên lớp</label><input class="input" name="className" value="${escapeHtml(state.className)}" required/></div><div class="field full"><label>Tên buổi học</label><input class="input" name="sessionName" value="${escapeHtml(state.sessionName)}" required/></div><div class="field"><label>Số tập đoàn tối đa</label><input class="input" name="maxTeams" type="number" value="5" min="2" max="12" required/></div><div class="field"><label>Thành viên mỗi tập đoàn</label><input class="input" name="teamSize" type="number" value="5" min="2" max="15" required/></div></div><div class="form-actions"><button type="button" class="btn btn-ghost" data-action="close-modal">Hủy</button><button class="btn btn-primary" type="submit">Tạo phòng →</button></div></form>`);
}

function joinModal() {
  openModal(`<div class="modal-head"><div><span class="eyebrow">Dành cho người chơi</span><h2>Lập hoặc tham gia tập đoàn</h2></div><button class="icon-btn" data-action="close-modal">×</button></div>
    <p class="modal-intro">Nhóm chưa có tập đoàn thì cử một đại diện tạo mới. Các thành viên còn lại dùng mã tập đoàn do đại diện gửi.</p>
    <div class="entry-options">
      <button class="entry-option" data-action="open-team-create"><span class="entry-number">01</span><strong>Lập tập đoàn mới</strong><p>Đặt tên tập đoàn, tạo mã mời và trở thành trưởng nhóm.</p><b>Tiếp tục →</b></button>
      <button class="entry-option" data-action="open-team-join"><span class="entry-number">02</span><strong>Vào tập đoàn đã có</strong><p>Nhập mã tập đoàn được trưởng nhóm gửi để tham gia.</p><b>Tiếp tục →</b></button>
    </div>`);
}

function createTeamModal() {
  openModal(`<div class="modal-head"><div><span class="eyebrow">Đại diện nhóm</span><h2>Lập tập đoàn mới</h2></div><button class="icon-btn" data-action="close-modal">×</button></div>
    <form id="team-create-form"><div class="form-grid"><div class="field full"><label>Mã phòng</label><input class="input mono" name="roomCode" maxlength="6" value="${state.roomCode}" required/></div><div class="field full"><label>Tên tập đoàn của nhóm</label><input class="input" name="corporationName" maxlength="40" placeholder="Ví dụ: Khát Vọng Việt" required/></div><div class="field full"><label>Họ tên hoặc biệt danh trưởng nhóm</label><input class="input" name="leaderName" maxlength="40" placeholder="Ví dụ: Minh Anh" required/></div><div class="field full"><label>Số thành viên của tập đoàn</label><input class="input" name="maxMembers" type="number" value="${state.defaultTeamSize}" min="2" max="15" required/><small>Tính cả trưởng nhóm. Ví dụ nhóm bạn có 5 người thì nhập 5.</small></div></div><div class="form-actions"><button type="button" class="btn btn-ghost" data-action="open-join">Quay lại</button><button class="btn btn-primary" type="submit">Tạo tập đoàn →</button></div></form>`);
}

function joinTeamModal() {
  openModal(`<div class="modal-head"><div><span class="eyebrow">Thành viên nhóm</span><h2>Vào tập đoàn đã có</h2></div><button class="icon-btn" data-action="close-modal">×</button></div>
    <form id="team-join-form"><div class="form-grid"><div class="field full"><label>Mã phòng</label><input class="input mono" name="roomCode" maxlength="6" value="${state.roomCode}" required/></div><div class="field full"><label>Mã tập đoàn 4 ký tự</label><input class="input mono uppercase-input" name="teamCode" maxlength="4" placeholder="Ví dụ: K9VN" required/></div><div class="field full"><label>Họ tên hoặc biệt danh</label><input class="input" name="playerName" maxlength="40" placeholder="Ví dụ: Hoàng Nam" required/></div></div><div class="form-actions"><button type="button" class="btn btn-ghost" data-action="open-join">Quay lại</button><button class="btn btn-primary" type="submit">Vào tập đoàn →</button></div></form>`);
}

function teamCreatedModal(team) {
  openModal(`<div class="modal-head"><div><span class="eyebrow">Tạo thành công</span><h2>${escapeHtml(team.name)}</h2></div><button class="icon-btn" data-action="close-modal">×</button></div><div class="success-panel"><span>Mã tập đoàn</span><strong>${team.code}</strong><p>Gửi mã này cùng mã phòng <b>${state.roomCode}</b> cho ${Math.max(0, team.maxMembers - 1)} thành viên còn lại.</p></div><div class="form-actions"><button class="btn btn-ghost" data-action="copy-invite">Sao chép lời mời</button><button class="btn btn-primary" data-action="close-modal">Vào bảng đội →</button></div>`);
}

function guideModal() {
  const steps = [
    ["Tự thành lập tập đoàn", "Mỗi nhóm cử một đại diện đặt tên tập đoàn và gửi mã mời cho các thành viên."],
    ["Tích lũy nguồn lực", "Cả đội thảo luận câu hỏi kiến thức để nhận vốn và quyền ưu tiên."],
    ["Đầu tư và ứng phó", "Đấu giá dự án, xử lý sự kiện và thống nhất các quyết định chiến lược."],
    ["Cân bằng năm chỉ số", "Tập đoàn mạnh nhất chưa chắc chiến thắng nếu để lại rủi ro phát triển lớn."],
  ];
  openModal(`<div class="modal-head"><div><span class="eyebrow">Luật chơi tóm tắt</span><h2>Kiến tạo đến 2045</h2></div><button class="icon-btn" data-action="close-modal">×</button></div><div class="guide-list">${steps.map(([title, text]) => `<div class="guide-item"><div><strong>${title}</strong><p>${text}</p></div></div>`).join("")}</div><div class="form-actions"><button class="btn btn-primary" data-action="close-modal">Đã hiểu</button></div>`);
}

function confetti() {
  const colors = ["#a7352d", "#a88045", "#3e8064", "#367cb3", "#f3efe5"];
  for (let i = 0; i < 70; i += 1) {
    const bit = document.createElement("i");
    bit.className = "confetti";
    bit.style.left = `${Math.random() * 100}vw`;
    bit.style.background = colors[i % colors.length];
    bit.style.setProperty("--drift", `${Math.random() * 180 - 90}px`);
    bit.style.animationDelay = `${Math.random() * .8}s`;
    document.body.appendChild(bit);
    setTimeout(() => bit.remove(), 4000);
  }
}

async function copyText(text, successMessage) {
  try {
    await navigator.clipboard.writeText(text);
    toast(successMessage, "success");
  } catch (_) {
    const area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    toast(successMessage, "success");
  }
}

function invitationText(team) {
  return `Mời bạn tham gia tập đoàn "${team.name}" trong game Việt Nam 2045. Mã phòng: ${state.roomCode}. Mã tập đoàn: ${team.code}.`;
}

document.addEventListener("click", (event) => {
  const backdrop = event.target.closest("[data-modal-backdrop]");
  if (backdrop && event.target === backdrop) {
    closeModal();
    return;
  }
  const viewTarget = event.target.closest("[data-view]");
  if (viewTarget) {
    state.view = viewTarget.dataset.view;
    render();
    return;
  }
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  const team = currentTeamRecord();

  if (action === "open-create") createModal();
  if (action === "open-join") joinModal();
  if (action === "open-team-create") createTeamModal();
  if (action === "open-team-join") joinTeamModal();
  if (action === "guide") guideModal();
  if (action === "close-modal") closeModal();
  if (action === "sound") { state.sound = !state.sound; beep(); render(); toast(state.sound ? "Đã bật âm thanh" : "Đã tắt âm thanh"); }
  if (action === "copy-room") copyText(state.roomCode, "Đã sao chép mã phòng");
  if (action === "copy-invite") {
    if (!team) return toast("Chưa có tập đoàn để tạo lời mời", "alert");
    copyText(invitationText(team), "Đã sao chép lời mời cho thành viên");
  }
  if (action === "next-phase") {
    if (!teams.length) return toast("Chưa có tập đoàn nào tham gia", "alert");
    state.phaseIndex = Math.min(state.phaseIndex + 1, PHASES.length - 1);
    logActivity(`Giảng viên mở giai đoạn: ${phase().title}`);
    beep(660, .13); render();
    if (phase().id === "results") confetti();
  }
  if (action === "show-results") {
    if (!teams.length) return toast("Chưa có dữ liệu xếp hạng", "alert");
    state.phaseIndex = 4;
    state.view = state.currentTeam === null ? "display" : "team";
    render(); confetti();
  }
  if (action === "add-capital") {
    const selected = teams[Number(target.dataset.team)];
    if (!selected) return;
    selected.capital += 5;
    logActivity(`Giảng viên cộng 5 vốn cho ${selected.short}`);
    render(); toast(`Đã cộng 5 triệu cho ${selected.short}`, "success");
  }
  if (action === "select-answer" && team && !team.quizLocked) { team.quizAnswer = Number(target.dataset.value); render(); }
  if (action === "confirm-answer" && team && !team.quizLocked) {
    team.quizLocked = true;
    const correct = team.quizAnswer === 1;
    team.quizCorrect = correct;
    if (correct) {
      team.capital += 100;
      team.pendingBlindBox = true;
    }
    logActivity(`${team.short} đã gửi đáp án${correct ? " chính xác" : ""}`);
    render();
    toast(correct ? "Chính xác · +100 triệu và 1 lượt chọn túi mù" : "Đáp án chưa chính xác", correct ? "success" : "alert");
    beep(correct ? 720 : 360);
    if (correct) setTimeout(() => openBlindBoxModal(team), 180);
  }
  if (action === "open-blind-box" && team) openBlindBoxModal(team);
  if (action === "pick-blind-box" && team) {
    if (!team.pendingBlindBox) return toast("Lượt chọn túi mù đã được sử dụng", "alert");
    const box = state.blindBoxes.find((item) => item.boxNumber === Number(target.dataset.box));
    if (!box || box.usedBy) return toast("Túi này đã được mở, hãy chọn ô khác", "alert");
    const summary = applyBlindBoxReward(team, box);
    render();
    rewardRevealModal(team, box, summary);
    confetti();
    beep(820, .16);
  }
  if (action === "quick-bid" && team) {
    const input = $("#bid-input");
    if (input) input.value = Math.min(team.capital, state.currentBid + Number(target.dataset.value));
  }
  if (action === "place-bid" && team) {
    const input = $("#bid-input");
    const amount = Number(input?.value);
    if (!amount || amount < state.currentBid + 5) return toast(`Mức giá phải cao hơn ít nhất 5 triệu`, "alert");
    if (amount > team.capital) return toast("Mức giá vượt quá vốn hiện có", "alert");
    state.currentBid = amount;
    state.bidLeader = state.currentTeam;
    logActivity(`${team.short} đặt giá ${amount} triệu vốn`);
    beep(600); render(); toast("Đặt giá thành công", "success");
  }
  if (action === "select-event" && team && !team.eventLocked) { team.eventChoice = Number(target.dataset.value); render(); }
  if (action === "confirm-event" && team) {
    team.eventLocked = true;
    logActivity(`${team.short} đã niêm phong quyết định sự kiện`);
    render(); toast("Quyết định đã được bảo mật", "success");
  }
  if (action === "select-package" && team) { team.strategyPackage = Number(target.dataset.value); render(); }
  if (action === "buy-package" && team) {
    const packages = [{ price: 55, effects: { equity: 14, tech: 6 } }, { price: 60, effects: { green: 16, growth: 4 } }, { price: 65, effects: { autonomy: 15, growth: 5 } }];
    const item = packages[team.strategyPackage];
    if (!item) return;
    if (team.capital < item.price) return toast("Tập đoàn không đủ vốn cho gói này", "alert");
    team.capital -= item.price;
    Object.entries(item.effects).forEach(([key, value]) => { team.indicators[key] = Math.min(100, team.indicators[key] + value); });
    logActivity(`${team.short} hoàn tất gói điều chỉnh chiến lược`);
    team.strategyPackage = null;
    render(); toast("Đầu tư chiến lược thành công", "success"); beep(700);
  }
  if (action === "fullscreen") document.documentElement.requestFullscreen?.();
});

document.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.target);

  if (event.target.id === "create-form") {
    state.roomCode = String(Math.floor(100000 + Math.random() * 900000));
    state.className = normalizeName(data.get("className"));
    state.sessionName = normalizeName(data.get("sessionName"));
    state.maxTeams = Number(data.get("maxTeams")) || 5;
    state.defaultTeamSize = Number(data.get("teamSize")) || 5;
    state.phaseIndex = 0;
    state.currentTeam = null;
    state.currentPlayer = null;
    state.currentBid = 80;
    state.bidLeader = null;
    state.blindBoxes = buildBlindBoxes();
    teams.splice(0, teams.length);
    state.activities = [{ text: "Phòng đã mở · chờ người chơi lập tập đoàn", time: now() }];
    closeModal(); state.view = "host"; render(); toast(`Đã tạo phòng ${state.roomCode}`, "success");
  }

  if (event.target.id === "team-create-form") {
    const room = String(data.get("roomCode") || "").trim();
    const corporationName = normalizeName(data.get("corporationName"));
    const leaderName = normalizeName(data.get("leaderName"));
    const maxMembers = Number(data.get("maxMembers")) || state.defaultTeamSize;
    if (room.length !== 6 || room !== state.roomCode) return toast("Mã phòng không đúng", "alert");
    if (teams.length >= state.maxTeams) return toast("Phòng đã đủ số tập đoàn", "alert");
    if (corporationName.length < 3) return toast("Tên tập đoàn cần ít nhất 3 ký tự", "alert");
    if (teams.some((item) => item.name.toLowerCase() === corporationName.toLowerCase())) return toast("Tên tập đoàn này đã được sử dụng", "alert");
    const created = createTeamRecord(corporationName, leaderName, maxMembers);
    teams.push(created);
    state.currentTeam = teams.length - 1;
    state.currentPlayer = leaderName;
    logActivity(`${created.name} được thành lập bởi ${leaderName}`);
    closeModal(); state.view = "team"; render(); teamCreatedModal(created); beep(720, .14);
  }

  if (event.target.id === "team-join-form") {
    const room = String(data.get("roomCode") || "").trim();
    const code = String(data.get("teamCode") || "").trim().toUpperCase();
    const playerName = normalizeName(data.get("playerName"));
    if (room.length !== 6 || room !== state.roomCode) return toast("Mã phòng không đúng", "alert");
    const index = teams.findIndex((item) => item.code === code);
    if (index < 0) return toast("Không tìm thấy mã tập đoàn", "alert");
    const selected = teams[index];
    if (selected.members.length >= selected.maxMembers) return toast("Tập đoàn này đã đủ thành viên", "alert");
    if (selected.members.some((member) => member.toLowerCase() === playerName.toLowerCase())) return toast("Tên này đã có trong tập đoàn", "alert");
    selected.members.push(playerName);
    state.currentTeam = index;
    state.currentPlayer = playerName;
    logActivity(`${playerName} tham gia ${selected.short}`);
    closeModal(); state.view = "team"; render(); toast(`Đã vào tập đoàn ${selected.name}`, "success"); beep(620);
  }
});

render();

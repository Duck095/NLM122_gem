# MLN122 — Lộ trình Việt Nam 2045

Ứng dụng gamification realtime dành cho lớp học, mô phỏng quá trình công nghiệp hóa – hiện đại hóa Việt Nam qua 5 trụ cột:

- Tăng trưởng kinh tế
- Hiện đại hóa công nghệ
- Tự chủ nội địa
- Công bằng xã hội
- Phát triển bền vững

Hệ thống có ba giao diện hoạt động đồng thời:

1. **Trang giảng viên**: tạo phòng, điều khiển trò chơi và xử lý kết quả.
2. **Trang đội chơi**: lập tập đoàn, tham gia đội, bấm giành quyền, trả lời, mở túi mù, đấu giá và ra quyết định.
3. **Trang trình chiếu**: hiển thị câu hỏi, đồng hồ, giá đấu, sự kiện và bảng xếp hạng trên máy chiếu.

Dữ liệu được đồng bộ tức thời bằng Socket.IO. Phiên chơi được lưu vào file JSON ở backend nên tải lại trang hoặc khởi động lại server vẫn có thể giữ dữ liệu.

---

## 1. Chức năng đã có

### Phòng chơi và tập đoàn

- Giảng viên tạo phòng, hệ thống sinh mã 6 số.
- Người chơi nhập mã phòng từ điện thoại hoặc laptop.
- Một thành viên đại diện tự lập tập đoàn và tự đặt tên.
- Hệ thống sinh mã tập đoàn 4 ký tự.
- Các thành viên còn lại nhập mã tập đoàn để vào đúng nhóm.
- Giảng viên theo dõi số tập đoàn và số thành viên theo thời gian thực.
- Có thể khóa/mở phòng trước khi bắt đầu.

### Vòng 15 câu hỏi

- Có sẵn 15 câu hỏi về công nghiệp hóa – hiện đại hóa.
- Câu hỏi được trình chiếu nhưng đáp án chưa hiện cho toàn bộ lớp.
- Giảng viên mở lượt giành quyền.
- Tập đoàn bấm nhanh nhất được xem 4 đáp án.
- Đội có 15 giây thảo luận.
- Hết 15 giây, đội có thêm 5 giây bắt buộc chốt đáp án.
- Đội có thể trả lời sớm trước khi hết thời gian.
- Trả lời sai hoặc không chốt: đội bị loại khỏi câu hiện tại.
- Các đội còn lại tranh quyền lại từ đầu.
- Trả lời đúng: nhận **100 triệu vốn** và **1 lượt chọn túi mù**.

### 15 túi mù

Bảng túi mù hiển thị 3 cột × 5 hàng. Các ô đã mở không thể chọn lại.

Bộ phần thưởng gồm:

| Số lượng | Phần thưởng | Tác dụng |
|---:|---|---|
| 2 | Lá chắn khủng hoảng | Hủy toàn bộ phần trừ điểm chỉ số của một sự kiện |
| 1 | Phục hồi dự án | Giảm 50% số điểm chỉ số bị trừ trong sự kiện |
| 1 | Giảm giá đấu giá 50% | Đội thắng chỉ trả 50% giá chốt |
| 1 | Giảm giá đấu giá 30% | Đội thắng được giảm 30% giá chốt |
| 5 | Thẻ cộng chỉ số | Mỗi chỉ số được cộng 7 điểm |
| 2 | Vốn khởi sắc | +60 triệu |
| 2 | Vốn tăng tốc | +65 triệu |
| 1 | Quỹ chiến lược | +75 triệu |

Vốn và chỉ số được cộng ngay. Các thẻ chiến thuật được lưu vào kho thẻ của tập đoàn.

### Đấu giá dự án

Có 3 dự án:

1. Trung tâm dữ liệu quốc gia
2. Hành lang logistics thông minh
3. Tổ hợp sản xuất công nghiệp xanh

Tính năng:

- Giảng viên chọn dự án và mở phiên.
- Các đội đặt giá realtime.
- Mức tăng tối thiểu 10 triệu.
- Không thể đặt giá cao hơn vốn đang có.
- Đội có thẻ giảm giá được chọn thẻ trước khi chốt phiên.
- Khi giảng viên đóng phiên, hệ thống tự trừ vốn, đánh dấu thẻ đã dùng và cộng chỉ số dự án.

### Sự kiện vĩ mô

Có 3 sự kiện:

1. Đứt gãy chuỗi cung ứng toàn cầu
2. Khủng hoảng năng lượng
3. Tự động hóa và dịch chuyển lao động

Mỗi đội chọn một phương án. Hệ thống tự:

- Trừ chi phí vốn.
- Cộng hoặc trừ các chỉ số.
- Áp dụng Lá chắn khủng hoảng.
- Áp dụng Phục hồi dự án.
- Cập nhật bảng xếp hạng.

### Chiến lược dài hạn

Có 4 gói:

- Nhân lực cho kỷ nguyên số
- Hạ tầng số quốc gia
- Công nghiệp nội địa vững mạnh
- Chuyển đổi xanh bao trùm

Mỗi tập đoàn chọn tối đa một gói. Hệ thống kiểm tra vốn trước khi cho phép chọn.

### Kết quả cuối

Điểm tổng hợp được tính từ:

- Trung bình 5 chỉ số.
- Điểm thưởng phát triển cân bằng.
- Số dự án sở hữu.
- Vốn còn lại.
- Số câu trả lời đúng.

Trang trình chiếu hiển thị bục hạng nhất, nhì, ba và bảng xếp hạng toàn bộ tập đoàn.

---

## 2. Công nghệ sử dụng

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- Socket.IO Client

### Backend

- Node.js
- Express 5
- Socket.IO
- Zod kiểm tra dữ liệu
- File JSON để lưu phiên chơi

### Công cụ phát triển

- Visual Studio Code
- Node.js 22 LTS trở lên
- npm
- Git và GitHub

**Không cần Docker, Firebase hoặc PostgreSQL để chạy phiên bản này.**

---

## 3. Cấu trúc thư mục

```text
mln122-realtime-complete/
├── apps/
│   ├── web/                         # Frontend React
│   │   ├── src/
│   │   │   ├── components/          # Thành phần giao diện dùng chung
│   │   │   ├── hooks/               # Kết nối Socket.IO
│   │   │   ├── lib/                 # API, cấu hình, phiên đăng nhập
│   │   │   ├── pages/
│   │   │   │   ├── HomePage.tsx     # Trang chủ, tạo/vào phòng
│   │   │   │   ├── HostPage.tsx     # Trang giảng viên
│   │   │   │   ├── PlayerPage.tsx   # Trang đội chơi
│   │   │   │   └── ScreenPage.tsx   # Trang trình chiếu
│   │   │   ├── main.tsx
│   │   │   └── styles.css
│   │   └── vite.config.ts
│   │
│   └── server/                      # Backend Node.js
│       ├── src/
│       │   ├── game-data.ts         # 15 câu hỏi, dự án, sự kiện, thẻ
│       │   ├── game-engine.ts       # Toàn bộ luật chơi
│       │   ├── store.ts             # Quản lý phòng và lưu JSON
│       │   ├── index.ts             # REST API + Socket.IO
│       │   └── smoke-test.ts        # Kiểm thử tự động
│       └── data/                    # File dữ liệu phiên chơi
│
├── packages/
│   └── shared/                      # Kiểu dữ liệu dùng chung frontend/backend
├── package.json
└── README.md
```

---

## 4. Cài đặt trên Windows

### Bước 1: Cài Node.js

Cài Node.js 22 LTS trở lên.

Mở PowerShell hoặc Git Bash và kiểm tra:

```bash
node -v
npm -v
```

Kết quả nên tương tự:

```text
v22.x.x
10.x.x
```

### Bước 2: Giải nén dự án

Ví dụ:

```text
D:\MLN122\mln122-realtime-complete
```

### Bước 3: Mở dự án bằng VS Code

Trong VS Code:

```text
File → Open Folder → chọn mln122-realtime-complete
```

### Bước 4: Cài thư viện

Mở Terminal trong VS Code:

```bash
npm install
```

Chỉ cần chạy một lần sau khi tải dự án.

---

## 5. Chạy ở chế độ phát triển

Trong thư mục gốc dự án:

```bash
npm run dev
```

Hệ thống sẽ chạy:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Kiểm tra backend: `http://localhost:4000/health`

Mở trình duyệt:

```text
http://localhost:5173
```

Dừng ứng dụng:

```text
Ctrl + C
```

---

## 6. Test bằng nhiều tab trên cùng máy

1. Tab 1: mở trang chủ và tạo phòng giảng viên.
2. Tab 2 hoặc cửa sổ ẩn danh: nhập mã phòng và lập tập đoàn thứ nhất.
3. Tab 3: nhập mã phòng và mã tập đoàn để thêm thành viên.
4. Tab 4: lập tập đoàn thứ hai.
5. Tab 5: mở đường dẫn trình chiếu.

Đường dẫn thường có dạng:

```text
/host/238800
/player/238800
/screen/238800
```

Mọi thay đổi sẽ đồng bộ realtime.

---

## 7. Test bằng điện thoại trong cùng Wi-Fi

### Bước 1: Tìm IP của laptop

Mở Command Prompt:

```cmd
ipconfig
```

Tìm dòng `IPv4 Address`, ví dụ:

```text
192.168.1.25
```

### Bước 2: Chạy ứng dụng

```bash
npm run dev
```

### Bước 3: Mở trên điện thoại

Điện thoại và laptop phải cùng Wi-Fi.

Trên điện thoại mở:

```text
http://192.168.1.25:5173
```

Thay `192.168.1.25` bằng IP của máy bạn.

### Nếu điện thoại không mở được

- Cho phép Node.js qua Windows Firewall.
- Kiểm tra hai thiết bị cùng mạng Wi-Fi.
- Không dùng mạng khách có chặn thiết bị nội bộ.
- Thử tắt VPN.

---

## 8. Cách vận hành từng trang

### Trang chủ `/`

Dành cho cả giảng viên và người chơi.

#### Giảng viên

1. Nhập tên phiên chơi.
2. Nhập tên lớp.
3. Chọn số tập đoàn và số thành viên mặc định.
4. Bấm **Tạo phòng và điều khiển**.
5. Hệ thống chuyển đến trang giảng viên.

#### Trưởng nhóm

1. Nhập mã phòng.
2. Chọn **Lập tập đoàn mới**.
3. Nhập tên tập đoàn, tên trưởng nhóm, số thành viên và màu nhận diện.
4. Hệ thống cấp mã tập đoàn.
5. Gửi mã này cho thành viên.

#### Thành viên

1. Nhập mã phòng.
2. Chọn **Vào tập đoàn đã có**.
3. Nhập mã tập đoàn và tên người chơi.
4. Hệ thống chuyển đến trang đội chơi.

#### Trình chiếu

Nhập mã phòng và bấm **Mở trang trình chiếu**.

### Trang giảng viên `/host/:roomCode`

Các khu vực chính:

- Thanh giai đoạn: phòng chờ, kiến thức, đấu giá, sự kiện, chiến lược, kết quả.
- Danh sách tập đoàn.
- Bảng điều khiển giai đoạn hiện tại.
- Bảng xếp hạng.
- Nhật ký hoạt động.
- Điều chỉnh vốn và chỉ số khi cần xử lý tình huống đặc biệt.

### Trang đội chơi `/player/:roomCode`

Hiển thị:

- Vốn.
- Thứ hạng.
- Năm chỉ số.
- Thành viên.
- Kho thẻ.
- Dự án.
- Nội dung tương tác theo từng vòng.

Chỉ tập đoàn đang có quyền trả lời mới thấy đáp án.

### Trang trình chiếu `/screen/:roomCode`

Chỉ đọc dữ liệu, không có nút quản trị.

Hiển thị tự động theo giai đoạn:

- Mã phòng và số người tham gia.
- Câu hỏi và đồng hồ.
- Tập đoàn đang trả lời.
- Giá đấu và đội dẫn đầu.
- Tiến độ quyết định sự kiện.
- Tiến độ chọn chiến lược.
- Bảng xếp hạng và bục chiến thắng.

---

## 9. Quy trình vận hành một buổi chơi

### Giai đoạn 1: Chuẩn bị

1. Giảng viên tạo phòng.
2. Chiếu mã phòng.
3. Các trưởng nhóm lập tập đoàn.
4. Thành viên nhập mã tập đoàn.
5. Giảng viên kiểm tra danh sách.
6. Bấm **Khóa phòng và bắt đầu**.

### Giai đoạn 2: 15 câu hỏi

Cho mỗi câu:

1. Giảng viên chọn số câu.
2. Câu hỏi xuất hiện trên màn hình trình chiếu.
3. Giảng viên bấm **Mở giành quyền**.
4. Các đội bấm nút trên điện thoại.
5. Đội nhanh nhất trả lời.
6. Sai hoặc hết giờ: các đội còn lại tranh lại.
7. Đúng: nhận 100 triệu và mở túi mù.
8. Giảng viên bấm **Câu tiếp theo**.

### Giai đoạn 3: Đấu giá

1. Giảng viên chọn dự án.
2. Bấm mở phiên.
3. Các đội đặt giá.
4. Đội có thẻ giảm giá chọn thẻ trước khi đóng phiên.
5. Giảng viên bấm **Chốt phiên**.

### Giai đoạn 4: Sự kiện

1. Giảng viên chọn sự kiện.
2. Mở sự kiện.
3. Các đội chọn phương án và thẻ phòng thủ.
4. Giảng viên chờ đủ phản hồi.
5. Bấm **Xử lý kết quả**.

### Giai đoạn 5: Chiến lược

1. Giảng viên mở lựa chọn.
2. Mỗi đội chọn một gói.
3. Giảng viên bấm **Chốt chiến lược**.
4. Bấm **Kết thúc trò chơi**.

---

## 10. Build bản production

Kiểm tra kiểu dữ liệu:

```bash
npm run typecheck
```

Build frontend và backend:

```bash
npm run build
```

Chạy bản production trên Windows PowerShell:

```powershell
$env:NODE_ENV="production"
$env:SERVE_WEB="true"
npm start
```

Mở:

```text
http://localhost:4000
```

Trong production, backend phục vụ luôn frontend nên chỉ cần một cổng 4000.

### Windows Command Prompt

```cmd
set NODE_ENV=production
set SERVE_WEB=true
npm start
```

### Git Bash

```bash
NODE_ENV=production SERVE_WEB=true npm start
```

---

## 11. Kiểm thử tự động

Dự án có smoke test kiểm tra:

- Tạo phòng.
- Tạo tập đoàn.
- Kết nối Socket.IO.
- Bắt đầu câu hỏi.
- Giành quyền.
- Trả lời đúng.
- Nhận 100 triệu.
- Mở túi mù.
- Đồng bộ trạng thái.

Chạy:

```bash
npm run test:smoke
```

Kết quả đúng:

```text
SMOKE TEST PASS
```

---

## 12. Dữ liệu được lưu ở đâu?

Mặc định backend lưu phòng vào:

```text
apps/server/data/rooms.json
```

File này không được đẩy lên GitHub vì nằm trong `.gitignore`.

### Xóa toàn bộ dữ liệu thử nghiệm

1. Dừng server.
2. Xóa file:

```text
apps/server/data/rooms.json
```

3. Chạy lại ứng dụng.

### Đổi vị trí file dữ liệu

Tạo file:

```text
apps/server/.env
```

Nội dung:

```env
PORT=4000
WEB_ORIGIN=http://localhost:5173
DATA_FILE=./data/rooms.json
```

---

## 13. Tùy chỉnh nội dung game

Chỉnh file:

```text
apps/server/src/game-data.ts
```

Trong đó có:

- `QUESTIONS`: 15 câu hỏi.
- `BLIND_REWARDS`: 15 phần thưởng túi mù.
- `PROJECTS`: dự án đấu giá.
- `EVENTS`: sự kiện và các phương án.
- `STRATEGY_PACKAGES`: gói chiến lược.

Sau khi sửa:

```bash
npm run typecheck
npm run dev
```

---

## 14. Cách tính điểm

Backend tính điểm theo công thức:

```text
Điểm tổng =
Trung bình 5 chỉ số
+ thưởng cân bằng
+ số dự án × 8
+ vốn còn lại / 100
+ số câu đúng × 2
```

Thưởng cân bằng giảm dần khi khoảng cách giữa chỉ số cao nhất và thấp nhất tăng lên.

Bạn có thể đổi công thức trong:

```text
apps/server/src/utils.ts
```

Hàm:

```text
teamScore()
```

---

## 15. Đưa mã nguồn lên GitHub

Trong thư mục dự án:

```bash
git init
git add .
git commit -m "Initial MLN122 realtime game"
git branch -M main
git remote add origin https://github.com/TEN_GITHUB/TEN_REPO.git
git push -u origin main
```

GitHub Pages không phù hợp cho bản này vì GitHub Pages chỉ chạy frontend tĩnh, không chạy Node.js và Socket.IO.

---

## 16. Deploy lên internet

Có thể deploy toàn bộ ứng dụng lên một dịch vụ chạy Node.js như:

- Render
- Railway
- Fly.io
- VPS

Lệnh build:

```bash
npm install
npm run build
```

Lệnh chạy:

```bash
NODE_ENV=production SERVE_WEB=true npm start
```

Biến môi trường:

```env
NODE_ENV=production
SERVE_WEB=true
PORT=4000
DATA_FILE=./data/rooms.json
```

### Lưu ý khi dùng dịch vụ cloud

Một số dịch vụ có ổ đĩa tạm thời. Nếu server khởi động lại, file JSON có thể mất. Khi triển khai chính thức lâu dài, nên thay `RoomStore` bằng PostgreSQL, Supabase hoặc Neon.

Phiên bản hiện tại phù hợp để:

- Chạy trong lớp bằng một laptop làm server.
- Test nhiều điện thoại trong cùng Wi-Fi.
- Demo và nghiệm thu đầy đủ luồng realtime.
- Build và deploy thử lên dịch vụ Node.js.

---

## 17. Lỗi thường gặp

### `npm` không chạy

Cài Node.js LTS rồi mở lại VS Code.

### Port 4000 đang được dùng

Tạo `apps/server/.env`:

```env
PORT=4100
```

Sau đó cần đặt frontend:

```env
VITE_API_URL=http://localhost:4100
```

ở file:

```text
apps/web/.env
```

### Điện thoại không vào được

- Dùng IP LAN của laptop, không dùng `localhost`.
- Cho phép Node.js qua Firewall.
- Bảo đảm cùng Wi-Fi.

### Báo mất phiên giảng viên hoặc đội chơi

Token được lưu trong `localStorage` của trình duyệt. Hãy dùng đúng trình duyệt đã tạo phòng/tham gia đội.

### Server khởi động lại khi đang có đội trả lời

Hệ thống tự hủy đồng hồ cũ và mở lại lượt giành quyền để tránh trạng thái bị kẹt.

---

## 18. Các lệnh quan trọng

| Lệnh | Tác dụng |
|---|---|
| `npm install` | Cài thư viện |
| `npm run dev` | Chạy frontend và backend để phát triển |
| `npm run typecheck` | Kiểm tra lỗi TypeScript |
| `npm run build` | Build production |
| `npm start` | Chạy backend đã build |
| `npm run test:smoke` | Kiểm thử luồng realtime chính |

---

## 19. Phiên bản hiện tại

- Frontend build: đạt
- Backend build: đạt
- TypeScript typecheck: đạt
- Smoke test realtime: đạt
- Lưu dữ liệu JSON: có
- Nhiều tab/thiết bị: có
- Backend xác định đội bấm nhanh nhất: có
- Đáp án đúng được giữ ở backend: có
- Túi mù được xáo trộn ở backend: có

---

## Giao diện trang trình chiếu cổ điển – hiện đại

Bản cập nhật này thay đổi riêng trang:

```text
/screen/:roomCode
```

Trang giảng viên và trang đội chơi giữ nguyên giao diện. Chi tiết các file được sửa và cách chép vào dự án hiện tại nằm trong:

```text
SCREEN_PAGE_GUIDE.md
```

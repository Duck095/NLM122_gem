# Lộ trình Việt Nam 2045

Prototype tương tác cho hệ thống Gamification CNH–HĐH Việt Nam.

## Luồng lập tập đoàn mới

1. Giảng viên tạo phòng và gửi mã phòng cho lớp.
2. Mỗi nhóm cử một người đại diện chọn **Lập tập đoàn mới**.
3. Đại diện nhập tên tập đoàn, tên trưởng nhóm và số thành viên của nhóm.
4. Hệ thống sinh mã tập đoàn gồm 4 ký tự.
5. Trưởng nhóm sao chép lời mời và gửi mã phòng + mã tập đoàn cho các thành viên còn lại.
6. Các thành viên chọn **Vào tập đoàn đã có**, nhập mã tập đoàn và tên của mình.
7. Dashboard giảng viên tự cập nhật tên tập đoàn và số thành viên đã tham gia.

Không còn danh sách năm tên tập đoàn cố định. Số tập đoàn tối đa và số thành viên mặc định của mỗi tập đoàn được giảng viên thiết lập khi tạo phòng.

## Ba chế độ

- **Giảng viên:** tạo phòng, theo dõi các tập đoàn do người chơi thành lập, số thành viên, vốn, chỉ số và tiến độ.
- **Đội chơi:** xem tên tập đoàn, mã mời, danh sách thành viên, trả lời câu hỏi, đấu giá và ra quyết định chiến lược.
- **Trình chiếu:** hiển thị diễn biến và bảng xếp hạng cho cả lớp.

## Chạy dự án

Mở trực tiếp `index.html` trong trình duyệt, hoặc chạy static server:

```powershell
python -m http.server 8080
```

Sau đó truy cập `http://localhost:8080`.

## Lưu ý kỹ thuật

Đây vẫn là prototype front-end chạy trong trình duyệt. Dữ liệu giữa nhiều máy chưa đồng bộ thật và sẽ mất khi tải lại trang. Để cả lớp tham gia bằng nhiều thiết bị, cần kết nối backend, cơ sở dữ liệu và WebSocket hoặc dịch vụ realtime.

## Cập nhật hệ màu theo vai trò

- **Trang giảng viên:** chuyển sang hệ xanh lam/cyan, tạo cảm giác bảng điều hành và quản trị.
- **Trang đội chơi:** dùng màu nhận diện riêng của tập đoàn làm màu nhấn cho nút, thanh tiến trình và khối thông tin đội.
- **Trang trình chiếu:** thiết kế lại bằng nền tím điện – xanh cyan, hiệu ứng aurora, quỹ đạo chuyển động, trạng thái trực tiếp, tiến độ 5 giai đoạn và bảng xếp hạng sinh động.
- Màu trình chiếu thay đổi nhẹ theo từng giai đoạn: kiến thức, đấu giá, sự kiện, chiến lược và kết quả.

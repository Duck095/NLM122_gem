# Hướng dẫn giao diện trang trình chiếu cổ điển – hiện đại

Trang trình chiếu nằm tại:

```text
/screen/:roomCode
```

Ví dụ:

```text
http://localhost:5173/screen/142100
```

## File đã thay đổi

1. `apps/web/src/pages/ScreenPage.tsx`
   - Thay toàn bộ bố cục trang trình chiếu.
   - Bổ sung header cổ điển, tiến trình 5 vòng, thẻ thống kê, nội dung động theo từng vòng, bảng xếp hạng, 5 chỉ số và nhật ký trực tiếp.
   - Giữ nguyên kết nối Socket.IO và dữ liệu realtime từ backend.

2. `apps/web/src/styles.css`
   - Bổ sung nhóm CSS bắt đầu bằng `classic-...`.
   - Chỉ tác động đến trang trình chiếu, không đổi giao diện trang giảng viên và đội chơi.

3. `apps/server/src/store.ts`
   - Cho phép trang trình chiếu nhận 4 lựa chọn A/B/C/D khi câu hỏi được mở.
   - Đáp án đúng vẫn chỉ được gửi sau khi câu hỏi đã kết thúc.

4. `apps/web/src/hooks/useRoomSocket.ts`
   - Sửa cách khởi tạo Socket.IO để kết nối ổn định khi React StrictMode chạy trong môi trường phát triển.

## File được thêm

1. `apps/web/public/screen-heritage-bg.svg`
   - Họa tiết nền cổ điển: trống đồng, đô thị, đường nét Việt Nam và công nghiệp hiện đại.
   - Được CSS sử dụng tự động trên trang trình chiếu.

2. `SCREEN_PAGE_GUIDE.md`
   - Chính là tài liệu này.

## Cách áp dụng vào dự án hiện tại

Có thể chép đè các file tương ứng từ bản ZIP mới vào dự án cũ. Sau đó chạy:

```bash
npm run dev
```

Mở trang chủ tại:

```text
http://localhost:5173
```

Tạo phòng mới rồi bấm mở trang trình chiếu.

## Kiểm tra build

```bash
npm run typecheck
npm run build
```

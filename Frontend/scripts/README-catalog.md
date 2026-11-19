# Bộ sản phẩm tham khảo Zentro Store

Bộ dữ liệu gồm **300 sản phẩm thuộc 15 danh mục**, mỗi danh mục 20 sản phẩm. Tên, giá mua công khai và ảnh được tham khảo từ CellphoneS, khu vực TP. Hồ Chí Minh, ngày **19/11/2026**. Không lấy giá thành viên/giá thu cũ làm giá bán mặc định.

- Dữ liệu: `public/data/reference-catalog.json`.
- Ảnh: `public/images/catalog/` — 300 tệp, khoảng 4,6 MB.
- Mỗi sản phẩm giữ đường dẫn trang nguồn và ảnh nguồn để kiểm tra lại.
- Mô tả sản phẩm được viết ngắn riêng; không sao chép bài đánh giá, thông tin người dùng hay nội dung quảng cáo.

## Nhập vào DB qua giao diện admin

1. Chạy BE và FE, đăng nhập tài khoản admin.
2. Vào **Quản lý sản phẩm → Nhập bộ sản phẩm mẫu**.
3. Xem danh mục và sản phẩm; bỏ chọn nhóm không muốn nhập.
4. Chọn tồn kho khởi tạo (mặc định **20**, là dữ liệu kiểm thử, không phải tồn kho của CellphoneS).
5. Bấm **Nhập … sản phẩm**.
6. Khi hoàn tất, bấm **Đóng và tải lại sản phẩm**.

Sản phẩm mới được tạo ở trạng thái **Đang mở bán**. Chức năng sử dụng API và phiên admin hiện có; không sửa mã BE, không chạy SQL, không cần dán mật khẩu/token vào mã nguồn.

Hệ thống hiện có 3 danh mục thì bộ đầy đủ dự kiến tạo thêm 12 danh mục. ID danh mục do API trả về, không được điền cố định.

## Chống trùng và xử lý gián đoạn

- Kiểm tra toàn bộ trang sản phẩm admin trước khi nhập.
- Bỏ qua sản phẩm đã có cùng slug hoặc tên chuẩn hóa.
- Giữ nguyên giá, tồn kho và trạng thái của sản phẩm cũ.
- Nhập lại lần hai sẽ bỏ qua những mục đã tồn tại.
- Nếu mất mạng hoặc lỗi server, dừng thay vì tự gửi lại yêu cầu tạo.
- Bấm **Kiểm tra lại dữ liệu** để đọc trạng thái server rồi nhập phần còn thiếu.
- Có thể dừng sau mục đang xử lý; dữ liệu đã tạo được giữ lại.
- Giá trị thành công chỉ tăng khi server xác nhận đúng sản phẩm, giá và danh mục.

Các danh mục được nhập xen kẽ để trang chủ và danh sách mới nhất có nhiều loại sản phẩm.

## Danh mục

Điện thoại; Laptop; Tai nghe & Âm thanh; Đồng hồ thông minh; Phụ kiện; Gia dụng & Smart Home; Máy tính bảng; Camera; Micro thu âm; PC; Màn hình; Máy in; Tivi; Sức khỏe & Làm đẹp; Điện máy.

Các danh mục mới có menu, biểu tượng và banner riêng. Bộ lọc trang chủ tải sản phẩm đúng danh mục từ API.

## Giá và dữ liệu kiểm thử

Giá chỉ là ảnh chụp tham khảo tại ngày nêu trên, có thể thay đổi. Không tự cộng thêm 10% để tạo giá gạch ngang khi API không có giá gốc. Dữ liệu mô phỏng trong kiểm tra trình duyệt được cách ly; không ghi vào DB thật của người dùng.

## Nguồn và công cụ thu thập

Nguồn tổng quan: https://cellphones.com.vn/?version=2

`scripts/collect-reference-catalog.py` sử dụng Python standard library, đọc thẻ sản phẩm công khai và lưu HTML tạm trong thư mục temp. Danh sách đồng hồ tải bằng JavaScript được ghi thành bản tham khảo sạch `scripts/watch-reference.json`, chỉ gồm tên, giá và URL sản phẩm/ảnh; không chứa phiên đăng nhập hoặc dữ liệu khách hàng.

Các bước xây dựng lại đúng bộ tham khảo đã ghi ngày:

```text
python scripts/collect-reference-catalog.py
python scripts/collect-reference-catalog.py --complete
python scripts/collect-reference-catalog.py --download
```

Nếu cập nhật dữ liệu vào ngày khác, cần đối chiếu lại nguồn và cập nhật ngày tham khảo, bao gồm bản dữ liệu đồng hồ. Không gắn nhãn giá mới cho bản dữ liệu cũ.

# Phiên bản, màu sắc và thông số

Chỉ bổ sung Frontend và dữ liệu tham khảo. Không đổi Backend hoặc tự ghi DB.

## Bật các lựa chọn để mua thử

1. Chạy BE, FE và đăng nhập admin.
2. Vào Quản lý sản phẩm, bấm **Nhập phiên bản & màu**.
3. Xem số sản phẩm sẽ thêm, chọn danh mục cần nhập và tồn kho test.
4. Bấm Nhập, đợi hoàn tất, rồi Đóng và tải lại sản phẩm.
5. Mở chi tiết một sản phẩm. Chọn phiên bản, màu; giá, tồn kho, ảnh và bảng thông số đổi theo lựa chọn.
6. Thêm vào giỏ. Tên hàng có phiên bản/màu, giá do API trả về. Có thể đặt thử COD để kiểm tra ảnh chụp tên/giá trong đơn hàng.

SKU mới là sản phẩm riêng dùng API hiện có: ví dụ iPhone 18 Pro 512GB - Bạc.
Không có biến thể giả chỉ cộng giá trên trình duyệt. API giỏ hàng chỉ nhận productId, quantity.

Trước khi nhập, các SKU chưa tồn tại sẽ hiện Chưa mở bán và không mua được.
Giá của SKU đã nhập lấy từ API Zentro; giá nguồn chỉ dùng cho SKU chưa nhập.
Chạy lại trình nhập sẽ bỏ qua sản phẩm đã có, giữ nguyên giá/tồn kho đã chỉnh.
SKU riêng cũng xuất hiện trong danh sách sản phẩm và được quản lý như sản phẩm thường.

## Dữ liệu và giới hạn

- 300 sản phẩm tham khảo và 4 sản phẩm test cũ đều có thông số.
- Nguồn chính: các trang chi tiết CellphoneS, liên kết nguồn nằm ngay dưới bảng thông số.
- MacBook Pro M3 Max test cũ không ghi kích thước màn hình, nên chỉ hiện chip, RAM, SSD xác định được từ tên, đối chiếu Apple Support.
- Tồn kho là dữ liệu khởi tạo để test Zentro, không phải tồn kho của nguồn.
- Giá theo ảnh chụp dữ liệu ngày 19/11/2026, không đồng bộ giá tự động.
- Chỉ hiển thị các phiên bản/màu và giá đọc được rõ ràng; không tự tạo bản 128/256GB cho sản phẩm không có bản đó.
- Sản phẩm người dùng tạo thêm sau này chưa có nguồn sẽ hiện thông báo chưa có thông số xác minh. Có thể bổ sung vào bộ metadata hoặc triển khai thuộc tính sản phẩm riêng ở BE về sau.
- Không sao chép đánh giá hoặc nội dung quảng cáo dài từ trang nguồn.

Chạy lại thu thập bằng:
`python Frontend/scripts/collect-product-options.py`

Dữ liệu: public/data/product-options.json, public/data/reference-options.json.
Báo cáo độ phủ: scripts/product-options-report.json.

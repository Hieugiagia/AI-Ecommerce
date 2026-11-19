# Danh mục địa chỉ hai cấp

Nguồn: [Địa Chỉ Việt](https://diachiviet.com/du-lieu-mo/), CC BY 4.0.
Bản dựng nguồn ngày 05/11/2026, theo văn bản đến 20/09/2026; lấy ngày 19/11/2026.
Bộ dữ liệu hiện có 34 tỉnh/thành, 3.321 xã/phường/đặc khu.

Dữ liệu được rút gọn thành mã, tên tỉnh và mã, tên phường/xã thuộc tỉnh:
`public/data/vietnam-divisions.json`.
Giữ thông tin nguồn, ngày dữ liệu, giấy phép và mô tả thay đổi trong JSON.
Giấy phép nguồn đầy đủ: `public/data/vietnam-divisions-LICENSE.txt`.
Form có liên kết ghi công nguồn và giấy phép.

Form tải JSON cùng ứng dụng, không gọi dịch vụ địa danh bên ngoài ở runtime.
Tìm kiếm hỗ trợ có dấu, không dấu, đ/d; chọn tỉnh sẽ xóa phường đã chọn.
Không tự chuyển địa chỉ cũ sang địa danh mới.

Tương thích hợp đồng API hiện có:
- Với địa chỉ mới hai cấp, city là tỉnh/thành; ward và district cùng chứa tên phường/xã.
- district là trường khu vực giao hàng đang bắt buộc trong API hiện tại.
- Khi chuyển sang checkout, phường chỉ nằm ở district; address chỉ có số nhà/tên đường.
- Hiển thị sổ địa chỉ bỏ mục district trùng ward.
- Với dữ liệu cũ có district khác ward, giữ nguyên tất cả thành phần.
- Người dùng có thể bấm Chọn tỉnh/phường mới để cập nhật, không tự đoán chuyển đổi.
- Không thay đổi cấu trúc DB, API hoặc dữ liệu đơn hàng đã đặt.

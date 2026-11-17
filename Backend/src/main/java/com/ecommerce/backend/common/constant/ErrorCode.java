package com.ecommerce.backend.common.constant;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(999,"Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid message key", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1002, "User not existed", HttpStatus.NOT_FOUND),
    TEST_ERROR(1003, "This is a custom test exception!", HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_FOUND(2001, "Không tìm thấy sản phẩm", HttpStatus.NOT_FOUND),
    CATEGORY_NOT_FOUND(2002, "Không tìm thấy danh mục", HttpStatus.NOT_FOUND),
    PRODUCT_SLUG_EXISTED(2003, "Slug sản phẩm đã được sử dụng", HttpStatus.CONFLICT),
    CATEGORY_INACTIVE(2004, "Danh mục đã ngừng hoạt động", HttpStatus.BAD_REQUEST),
    PRODUCT_VERSION_CONFLICT(2005, "Sản phẩm đã được thay đổi. Vui lòng tải lại trước khi sửa", HttpStatus.CONFLICT),
    PRODUCT_VERSION_REQUIRED(2006, "Bạn cần gửi version khi cập nhật sản phẩm", HttpStatus.BAD_REQUEST),
    INVALID_PRODUCT_PAGINATION(2007, "Page phải từ 1 và limit phải từ 1 đến 100", HttpStatus.BAD_REQUEST),
    INVALID_PRODUCT_FILTER(2008, "Bộ lọc không hợp lệ: kiểm tra khoảng giá, trạng thái hoặc kiểu sắp xếp", HttpStatus.BAD_REQUEST),
    PRODUCT_BRAND_NOT_SUPPORTED(2009, "Bộ lọc thương hiệu chưa được hỗ trợ", HttpStatus.BAD_REQUEST),
    CART_ITEM_NOT_FOUND(3001, "Không tìm thấy mục trong giỏ hàng", HttpStatus.NOT_FOUND),
    PRODUCT_NOT_AVAILABLE(3002, "Sản phẩm hiện không được mở bán", HttpStatus.BAD_REQUEST),
    CART_STOCK_EXCEEDED(3003, "Số lượng yêu cầu vượt quá tồn kho", HttpStatus.CONFLICT),
    CART_EMPTY(4001, "Giỏ hàng đang trống", HttpStatus.BAD_REQUEST),
    CHECKOUT_PAYMENT_NOT_SUPPORTED(4002, "Hiện chỉ hỗ trợ thanh toán COD", HttpStatus.BAD_REQUEST),
    CHECKOUT_TOTAL_CHANGED(4003, "Tổng tiền đã thay đổi. Vui lòng tải lại giỏ hàng và xác nhận lại", HttpStatus.CONFLICT),
    CHECKOUT_AMOUNT_INVALID(4004, "Tổng tiền đơn hàng vượt giới hạn cho phép", HttpStatus.BAD_REQUEST),
    RESET_TOKEN_INVALID(5001, "Liên kết khôi phục không hợp lệ, đã hết hạn hoặc đã được sử dụng", HttpStatus.BAD_REQUEST),
    RESET_PASSWORD_INVALID(5002, "Mật khẩu phải từ 8 ký tự và không vượt quá 72 byte", HttpStatus.BAD_REQUEST),
    ORDER_NOT_FOUND(6001, "Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND),
    ORDER_CANNOT_CANCEL(6002, "Chỉ được hủy đơn đang chờ xác nhận", HttpStatus.CONFLICT),
    ORDER_PAYMENT_CANNOT_CANCEL(6003, "Đơn không có thanh toán COD đang chờ thu tiền để tự hủy", HttpStatus.CONFLICT),
    ORDER_FILTER_INVALID(6004, "Bộ lọc không hợp lệ: page từ 1, limit từ 1 đến 50 và trạng thái hợp lệ", HttpStatus.BAD_REQUEST),
    ORDER_RESTOCK_INVALID(6005, "Không thể hoàn tồn kho. Vui lòng liên hệ quản trị viên", HttpStatus.CONFLICT),
    ADMIN_ORDER_TRANSITION_INVALID(7001, "Không được chuyển đơn sang trạng thái này", HttpStatus.CONFLICT),
    ADMIN_ORDER_STATUS_CHANGED(7002, "Trạng thái đơn đã thay đổi. Vui lòng tải lại trước khi cập nhật", HttpStatus.CONFLICT),
    ADMIN_ORDER_PAYMENT_INVALID(7003, "Thanh toán không phù hợp để xử lý đơn COD", HttpStatus.CONFLICT),
    COD_COLLECTION_REQUIRED(7004, "Bạn phải xác nhận đã giao hàng và thu đủ tiền COD", HttpStatus.BAD_REQUEST)
    ;

    ErrorCode(int code, String message, HttpStatusCode httpStatusCode) {
        this.code = code;
        this.message = message;
        this.httpStatusCode = httpStatusCode;
    }

    int code;
    String message;
    HttpStatusCode httpStatusCode;
}

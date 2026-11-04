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
    CART_STOCK_EXCEEDED(3003, "Số lượng yêu cầu vượt quá tồn kho", HttpStatus.CONFLICT)
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

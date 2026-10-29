package com.ecommerce.backend.common.exception;

import com.ecommerce.backend.common.api.ApiResponse;
import com.ecommerce.backend.common.constant.ErrorCode;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Xử lý AppException custom (Nếu dùng ErrorCode enum)
    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ApiResponse<Object>> handlingAppException(AppException appException) {
        ErrorCode errorCode = appException.getErrorCode();
        ApiResponse<Object> apiResponse = ApiResponse.builder()
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
        return ResponseEntity.status(errorCode.getHttpStatusCode()).body(apiResponse);
    }

    // 2. Xử lý RuntimeException thông thường (Ví dụ: "Email đã được sử dụng!", "Không tìm thấy người dùng!")
    @ExceptionHandler(value = RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handlingRuntimeException(RuntimeException exception) {
        ApiResponse<Object> apiResponse = ApiResponse.builder()
                .code(HttpStatus.BAD_REQUEST.value()) // Mã 400
                .message(exception.getMessage())       // Nội dung lỗi chi tiết truyền từ Service
                .build();
        return ResponseEntity.badRequest().body(apiResponse);
    }

    // 3. Xử lý các lỗi hệ thống không lường trước khác (Mã 500)
    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ApiResponse<Object>> handlingException(Exception exception) {
        ApiResponse<Object> apiResponse = ApiResponse.builder()
                .code(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode())
                .message(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage())
                .build();
        return ResponseEntity.internalServerError().body(apiResponse);
    }
}
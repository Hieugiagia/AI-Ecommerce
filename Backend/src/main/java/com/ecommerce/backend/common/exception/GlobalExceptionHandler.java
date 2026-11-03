package com.ecommerce.backend.common.exception;

import com.ecommerce.backend.common.api.ApiResponse;
import com.ecommerce.backend.common.constant.ErrorCode;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
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

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handlingAccessDeniedException(AccessDeniedException exception) {
        ApiResponse<Object> response = ApiResponse.builder()
                .code(HttpStatus.FORBIDDEN.value())
                .message("Bạn không có quyền thực hiện thao tác này")
                .build();

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(response);
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handlingValidationException(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error ->
                        error.getField() + ": " + error.getDefaultMessage()
                )
                .collect(java.util.stream.Collectors.joining("; "));

        ApiResponse<Object> response = ApiResponse.builder()
                .code(400)
                .message(message)
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handlingInvalidJson(HttpMessageNotReadableException exception) {
        ApiResponse<Object> response = ApiResponse.builder()
                .code(400)
                .message("Dữ liệu JSON không hợp lệ. Kiểm tra kiểu dữ liệu và trạng thái sản phẩm")
                .build();

        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiResponse<Object>> handlingOptimisticLock(ObjectOptimisticLockingFailureException exception) {
        ApiResponse<Object> response = ApiResponse.builder()
                .code(409)
                .message("Dữ liệu đã được thay đổi. Vui lòng tải lại trước khi sửa")
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handlingDataIntegrity(DataIntegrityViolationException exception) {
        ApiResponse<Object> response = ApiResponse.builder()
                .code(409)
                .message("Dữ liệu bị trùng hoặc đang được dữ liệu khác tham chiếu")
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }
}
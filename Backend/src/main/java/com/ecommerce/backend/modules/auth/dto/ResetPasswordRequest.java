package com.ecommerce.backend.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(@NotBlank(message = "Thiếu mã khôi phục")
        @Pattern(regexp = "[A-Za-z0-9_-]{43}", message = "Mã khôi phục không hợp lệ")
        String token,

        @NotBlank(message = "Bạn phải nhập mật khẩu mới")
        @Size(min = 8, max = 72, message = "Mật khẩu cần từ 8 đến 72 ký tự")
        String newPassword
) {
}
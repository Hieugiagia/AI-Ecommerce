package com.ecommerce.backend.modules.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ForgotPasswordRequest(@NotBlank(message = "Bạn phải nhập email")
                                    @Email(message = "Email không hợp lệ") @Size(max = 150)
        String email
) {
}
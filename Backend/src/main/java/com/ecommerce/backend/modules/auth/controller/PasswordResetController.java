package com.ecommerce.backend.modules.auth.controller;

import com.ecommerce.backend.modules.auth.dto.ForgotPasswordRequest;
import com.ecommerce.backend.modules.auth.dto.ResetPasswordRequest;
import com.ecommerce.backend.modules.auth.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.forgotPassword(request);

        return ResponseEntity.ok(Map.of("message",
                        "Nếu email thuộc tài khoản đang hoạt động, bạn sẽ nhận được liên kết khôi phục."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);

        return ResponseEntity.ok(Map.of("message",
                        "Đã đổi mật khẩu. Hãy đăng nhập bằng mật khẩu mới."));
    }
}
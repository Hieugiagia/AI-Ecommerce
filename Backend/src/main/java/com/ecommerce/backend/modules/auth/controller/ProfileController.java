package com.ecommerce.backend.modules.auth.controller;

import com.ecommerce.backend.modules.auth.dto.AuthResponse;
import com.ecommerce.backend.modules.auth.dto.UserResponse;
import com.ecommerce.backend.modules.user.entity.User;
import com.ecommerce.backend.modules.user.entity.UserStatus;
import com.ecommerce.backend.modules.user.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class ProfileController {
    private final UserRepository userRepository;

    @PutMapping("/profile")
    @Transactional
    public AuthResponse updateProfile(@AuthenticationPrincipal String email, @Valid @RequestBody UpdateProfileRequest request) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Vui lòng đăng nhập lại");
        }

        User user = userRepository.findByEmailForCart(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không tìm thấy tài khoản"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tài khoản không hoạt động");
        }

        user.setFullName(request.fullName());
        user.setPhoneNumber(request.phone());

        User saved = userRepository.save(user);

        UserResponse profile = UserResponse.builder()
                .id(saved.getId())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .phone(saved.getPhoneNumber())
                .role(saved.getRole().name())
                .build();

        return AuthResponse.builder()
                .success(true)
                .user(profile)
                .message("Cập nhật thông tin thành công")
                .build();
    }

    public record UpdateProfileRequest(
            @NotBlank(message = "Vui lòng nhập họ tên")
            @Size(max = 255, message = "Họ tên tối đa 255 ký tự")
            String fullName,

            @NotBlank(message = "Vui lòng nhập số điện thoại")
            @Pattern(
                    regexp = "(?:0[0-9]{9}|\\+84[0-9]{9})",
                    message = "Số điện thoại không hợp lệ"
            )
            String phone
    ) {
        public UpdateProfileRequest {
            fullName = fullName == null ? null : fullName.strip().replaceAll("\\s+", " ");
            phone = phone == null ? null : phone.strip();
        }
    }
}
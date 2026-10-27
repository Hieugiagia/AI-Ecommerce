package com.ecommerce.backend.modules.auth.service.impl;

import com.ecommerce.backend.common.util.JwtUtils;
import com.ecommerce.backend.modules.auth.dto.AuthResponse;
import com.ecommerce.backend.modules.auth.dto.LoginRequest;
import com.ecommerce.backend.modules.auth.dto.RegisterRequest;
import com.ecommerce.backend.modules.auth.dto.UserResponse;
import com.ecommerce.backend.modules.auth.service.AuthService;
import com.ecommerce.backend.modules.user.entity.Role;
import com.ecommerce.backend.modules.user.entity.User;
import com.ecommerce.backend.modules.user.entity.UserStatus;
import com.ecommerce.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phoneNumber(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_USER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        String accessToken = jwtUtils.generateAccessToken(savedUser.getEmail(), savedUser.getRole().name());
        String refreshToken = jwtUtils.generateRefreshToken(savedUser.getEmail());

        return buildAuthResponse(savedUser, accessToken, refreshToken, "Đăng ký tài khoản thành công");
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không chính xác!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Email hoặc mật khẩu không chính xác!");
        }

        String accessToken = jwtUtils.generateAccessToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        return buildAuthResponse(user, accessToken, refreshToken, "Đăng nhập thành công");
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtUtils.validateToken(refreshToken)) {
            throw new RuntimeException("Refresh Token không hợp lệ hoặc đã hết hạn!");
        }

        String email = jwtUtils.getEmailFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        String newAccessToken = jwtUtils.generateAccessToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .success(true)
                .token(newAccessToken)
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .message("Làm mới token thành công")
                .build();
    }

    @Override
    public AuthResponse getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));

        return buildAuthResponse(user, null, null, null);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken, String message) {
        UserResponse userDto = UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhoneNumber())
                .role(user.getRole().name())
                .build();

        return AuthResponse.builder()
                .success(true)
                .token(accessToken)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userDto)
                .message(message)
                .build();
    }
}
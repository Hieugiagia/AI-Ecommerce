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

        String accessToken = jwtUtils.generateAccessToken(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getAuthVersion());
        String refreshToken = jwtUtils.generateRefreshToken(savedUser.getEmail(), savedUser.getAuthVersion());

        return buildAuthResponse(savedUser, accessToken, refreshToken, "Đăng ký tài khoản thành công");
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không chính xác!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Email hoặc mật khẩu không chính xác!");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException(
                    "Tài khoản đã bị khóa hoặc chưa được kích hoạt!"
            );
        }
        String accessToken = jwtUtils.generateAccessToken(user.getEmail(), user.getRole().name(),user.getAuthVersion());
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail(),user.getAuthVersion());

        return buildAuthResponse(user, accessToken, refreshToken, "Đăng nhập thành công");
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        // 1. Kiểm tra loại token, chữ ký và hạn sử dụng.
        if (!jwtUtils.validateRefreshToken(refreshToken)) {
            throw new RuntimeException(
                    "Refresh Token không hợp lệ hoặc đã hết hạn!"
            );
        }

        // 2. Lấy email và tìm user trước.
        String email = jwtUtils.getEmailFromToken(refreshToken);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy người dùng!")
                );

        // 3. Sau khi có user mới kiểm tra phiên đăng nhập.
        if (!jwtUtils.matchesAuthVersion(
                refreshToken,
                user.getAuthVersion()
        )) {
            throw new RuntimeException(
                    "Phiên đăng nhập đã hết hiệu lực. Vui lòng đăng nhập lại."
            );
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new RuntimeException(
                    "Tài khoản đã bị khóa hoặc chưa được kích hoạt!"
            );
        }

        // 4. Cấp access token mới với phiên bản hiện tại.
        String newAccessToken = jwtUtils.generateAccessToken(
                user.getEmail(),
                user.getRole().name(),
                user.getAuthVersion()
        );

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
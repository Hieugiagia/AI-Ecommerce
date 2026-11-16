package com.ecommerce.backend.modules.auth.service;

import com.ecommerce.backend.common.constant.ErrorCode;
import com.ecommerce.backend.common.exception.AppException;
import com.ecommerce.backend.modules.auth.dto.ForgotPasswordRequest;
import com.ecommerce.backend.modules.auth.dto.ResetPasswordRequest;
import com.ecommerce.backend.modules.auth.entity.PasswordResetToken;
import com.ecommerce.backend.modules.auth.repository.PasswordResetTokenRepository;
import com.ecommerce.backend.modules.user.entity.User;
import com.ecommerce.backend.modules.user.entity.UserStatus;
import com.ecommerce.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        var result = userRepository.findByEmailForCart(request.email().trim());

        if (result.isEmpty()) {
            return;
        }

        User user = result.get();

        if (user.getStatus() != UserStatus.ACTIVE) {
            return;
        }

        Instant now = Instant.now();

        PasswordResetToken reset = tokenRepository.findById(user.getId()).orElse(null);

        if (reset != null && now.isBefore(reset.getRequestedAt().plusSeconds(60))) {
            return;
        }

        if (reset == null) {
            reset = new PasswordResetToken();
            reset.setUserId(user.getId());
            reset.setWindowStartedAt(now);
            reset.setRequestCount(0);
        }

        if (!now.isBefore(reset.getWindowStartedAt().plusSeconds(3600))) {
            reset.setWindowStartedAt(now);
            reset.setRequestCount(0);
        }

        // Tối đa 5 email trong một giờ cho một tài khoản.
        if (reset.getRequestCount() >= 5) {
            return;
        }

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);

        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        reset.setTokenHash(hash(rawToken));
        reset.setRequestedAt(now);
        reset.setExpiresAt(now.plusSeconds(15 * 60));
        reset.setRequestCount(reset.getRequestCount() + 1);

        tokenRepository.saveAndFlush(reset);

        // Fragment không được gửi tới server khi trình duyệt mở trang.
        String link = frontendUrl.replaceAll("/+$", "")
                + "/reset-password#token="
                + rawToken;

        eventPublisher.publishEvent(new PasswordResetMailSender.ResetEmail(user.getEmail(), link));
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String newPassword = request.newPassword();

        if (newPassword.length() < 8 || newPassword.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new AppException(ErrorCode.RESET_PASSWORD_INVALID);
        }

        String tokenHash = hash(request.token());

        // Chỉ đọc userId trước, chưa tải entity token.
        Long userId = tokenRepository.findUserIdByTokenHash(tokenHash)
                .orElseThrow(() ->
                        new AppException(ErrorCode.RESET_TOKEN_INVALID));

        User user = userRepository.findByIdForPasswordReset(userId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.RESET_TOKEN_INVALID));

        // Đọc token sau khi khóa tài khoản để chống dùng đồng thời.
        PasswordResetToken reset = tokenRepository.findById(userId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.RESET_TOKEN_INVALID));

        boolean correctHash = MessageDigest.isEqual(
                reset.getTokenHash().getBytes(
                        StandardCharsets.UTF_8), tokenHash.getBytes(StandardCharsets.UTF_8));

        if (!correctHash || !reset.getExpiresAt().isAfter(Instant.now()) || user.getStatus() != UserStatus.ACTIVE) {
            throw new AppException(ErrorCode.RESET_TOKEN_INVALID);
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));

        user.setAuthVersion(user.getAuthVersion() + 1);

        userRepository.saveAndFlush(user);

        // Token đã dùng thì xóa, không thể dùng lần hai.
        tokenRepository.delete(reset);
        tokenRepository.flush();
    }

    private String hash(String value) {
        try {
            byte[] digest = MessageDigest
                    .getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));

            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Không hỗ trợ SHA-256", exception);
        }
    }
}
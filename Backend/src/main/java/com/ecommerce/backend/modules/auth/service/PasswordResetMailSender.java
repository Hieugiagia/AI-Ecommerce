package com.ecommerce.backend.modules.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class PasswordResetMailSender {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    public record ResetEmail(String to, String link) {
    }

    @Async
    @TransactionalEventListener
    public void send(ResetEmail event) {
        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromAddress);
        message.setTo(event.to());
        message.setSubject("Đặt lại mật khẩu AI Ecommerce");
        message.setText("""
                Bạn vừa yêu cầu đặt lại mật khẩu.

                Mở liên kết dưới đây để tạo mật khẩu mới:
                %s

                Liên kết có hiệu lực trong 15 phút và chỉ dùng một lần.

                Nếu bạn không yêu cầu, hãy bỏ qua email này.
                """.formatted(event.link()));

        try {
            mailSender.send(message);
        } catch (MailException exception) {
            // Không ghi token hoặc thông tin đăng nhập SMTP vào log.
            log.warn("Không gửi được email khôi phục: {}",
                    exception.getClass().getSimpleName());
        }
    }
}
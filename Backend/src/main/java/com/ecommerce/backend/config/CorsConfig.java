package com.ecommerce.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // 1. Cấp quyền truy cập cho Domain/Cổng phía Frontend (React/Vite)
        config.setAllowedOrigins(List.of(
                "http://localhost:5173", // Cổng mặc định khi dev Vite
                "http://localhost:5174", // Cổng dự phòng Vite
                "http://localhost:3000"  // Cổng mặc định nếu dùng Create React App
        ));

        // 2. Cho phép các HTTP Methods giao tiếp
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // 3. Cho phép tất cả các Headers (bao gồm Authorization: Bearer, Content-Type, v.v.)
        config.setAllowedHeaders(List.of("*"));

        // 4. Cho phép gửi thông tin xác thực (Cookies, Authorization Headers)
        config.setAllowCredentials(true);

        // 5. Áp dụng cấu hình CORS cho tất cả đường dẫn API bắt đầu bằng /api hoặc /
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}
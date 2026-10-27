package com.ecommerce.backend.modules.auth.dto;

import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private boolean success;
    private String token;
    private String refreshToken;
    private UserResponse user;
    private String message;
    private String accessToken;

}

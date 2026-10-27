package com.ecommerce.backend.modules.auth.service;

import com.ecommerce.backend.modules.auth.dto.AuthResponse;
import com.ecommerce.backend.modules.auth.dto.LoginRequest;
import com.ecommerce.backend.modules.auth.dto.RefreshTokenRequest;
import com.ecommerce.backend.modules.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(String refreshToken);
    AuthResponse getProfile(String email);
}

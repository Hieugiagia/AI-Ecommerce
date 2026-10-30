package com.ecommerce.backend.modules.auth.controller;

import com.ecommerce.backend.modules.auth.dto.AuthResponse;
import com.ecommerce.backend.modules.auth.dto.LoginRequest;
import com.ecommerce.backend.modules.auth.dto.RefreshTokenRequest;
import com.ecommerce.backend.modules.auth.dto.RegisterRequest;
import com.ecommerce.backend.modules.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    //POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request){
        return ResponseEntity.ok(authService.register(request));
    }

    //POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request){
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request){
        return ResponseEntity.ok(authService.refreshToken(request.getRefreshToken()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(){
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<AuthResponse> getProfile(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(authService.getProfile(email));
    }

}

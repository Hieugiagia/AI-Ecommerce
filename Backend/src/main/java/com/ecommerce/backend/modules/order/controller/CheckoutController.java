package com.ecommerce.backend.modules.order.controller;

import com.ecommerce.backend.modules.order.dto.CheckoutRequest;
import com.ecommerce.backend.modules.order.dto.CheckoutResponse;
import com.ecommerce.backend.modules.order.service.CheckoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class CheckoutController {

    private final CheckoutService checkoutService;

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(@AuthenticationPrincipal String email, @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(checkoutService.checkout(email, request));
    }
}
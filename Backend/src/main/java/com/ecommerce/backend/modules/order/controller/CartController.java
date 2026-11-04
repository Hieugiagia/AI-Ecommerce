package com.ecommerce.backend.modules.order.controller;

import com.ecommerce.backend.modules.order.dto.AddCartItemRequest;
import com.ecommerce.backend.modules.order.dto.CartResponse;
import com.ecommerce.backend.modules.order.dto.UpdateCartItemRequest;
import com.ecommerce.backend.modules.order.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(cartService.getCart(email));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(@AuthenticationPrincipal String email, @Valid @RequestBody AddCartItemRequest request) {
        return ResponseEntity.ok(cartService.addItem(email, request));
    }

    @PatchMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateQuantity(@AuthenticationPrincipal String email, @PathVariable Long itemId, @Valid @RequestBody UpdateCartItemRequest request) {
        return ResponseEntity.ok(cartService.updateQuantity(
                email,
                itemId,
                request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> removeItem(@AuthenticationPrincipal String email, @PathVariable Long itemId) {
        cartService.removeItem(email, itemId);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal String email) {
        cartService.clearCart(email);

        return ResponseEntity.noContent().build();
    }
}
package com.ecommerce.backend.modules.order.controller;

import com.ecommerce.backend.modules.order.dto.CancelOrderRequest;
import com.ecommerce.backend.modules.order.dto.OrderListResponse;
import com.ecommerce.backend.modules.order.dto.OrderResponse;
import com.ecommerce.backend.modules.order.service.CustomerOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class CustomerOrderController {

    private final CustomerOrderService customerOrderService;

    @GetMapping("/my-orders")
    public ResponseEntity<OrderListResponse> getMyOrders(@AuthenticationPrincipal String email, @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(customerOrderService.getMyOrders(email, page, limit, status));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<OrderResponse> getMyOrder(@AuthenticationPrincipal String email, @PathVariable String orderCode) {
        return ResponseEntity.ok(customerOrderService.getMyOrder(email, orderCode));
    }

    @PostMapping("/{orderCode}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@AuthenticationPrincipal String email, @PathVariable String orderCode, @Valid @RequestBody CancelOrderRequest request) {
        return ResponseEntity.ok(customerOrderService.cancelOrder(email, orderCode, request));
    }
}
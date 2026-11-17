package com.ecommerce.backend.modules.order.controller;

import com.ecommerce.backend.modules.order.dto.AdminOrderListResponse;
import com.ecommerce.backend.modules.order.dto.AdminOrderResponse;
import com.ecommerce.backend.modules.order.dto.UpdateOrderStatusRequest;
import com.ecommerce.backend.modules.order.service.AdminOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    @GetMapping
    public ResponseEntity<AdminOrderListResponse> getOrders(@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String q) {
        return ResponseEntity.ok(adminOrderService.getOrders(page, limit, status, q));
    }

    @GetMapping("/{orderCode}")
    public ResponseEntity<AdminOrderResponse> getOrder(@PathVariable String orderCode) {
        return ResponseEntity.ok(adminOrderService.getOrder(orderCode));
    }

    @PatchMapping("/{orderCode}/status")
    public ResponseEntity<AdminOrderResponse> updateStatus(@PathVariable String orderCode, @Valid @RequestBody UpdateOrderStatusRequest request) {
        return ResponseEntity.ok(adminOrderService.updateStatus(orderCode, request));
    }
}
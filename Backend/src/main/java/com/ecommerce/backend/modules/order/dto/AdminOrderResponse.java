package com.ecommerce.backend.modules.order.dto;

import com.ecommerce.backend.modules.order.entity.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public record AdminOrderResponse(
        OrderResponse order,
        Long customerId,
        String customerName,
        String customerEmail,
        LocalDateTime updatedAt,
        List<OrderStatus> allowedNextStatuses
) {
}
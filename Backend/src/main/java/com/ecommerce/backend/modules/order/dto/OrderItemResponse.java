package com.ecommerce.backend.modules.order.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long productId,
        String name,
        BigDecimal price,
        Integer quantity,
        BigDecimal lineTotal
) {
}
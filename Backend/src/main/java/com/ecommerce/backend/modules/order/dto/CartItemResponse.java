package com.ecommerce.backend.modules.order.dto;

import java.math.BigDecimal;

public record CartItemResponse(
        Long itemId,
        Long productId,
        String name,
        String slug,
        String thumbnailUrl,
        BigDecimal unitPrice,
        Integer quantity,
        Integer stock,
        boolean available,
        BigDecimal lineTotal
) {
}
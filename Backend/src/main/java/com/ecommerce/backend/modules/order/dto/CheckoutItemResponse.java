package com.ecommerce.backend.modules.order.dto;

import java.math.BigDecimal;

public record CheckoutItemResponse(
        Long productId,
        String productName,
        BigDecimal priceAtPurchase,
        Integer quantity,
        BigDecimal subtotal
) {
}
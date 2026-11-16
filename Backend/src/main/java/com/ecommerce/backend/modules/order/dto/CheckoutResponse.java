package com.ecommerce.backend.modules.order.dto;

import com.ecommerce.backend.modules.order.entity.OrderStatus;
import com.ecommerce.backend.modules.payment.entity.PaymentMethod;

import java.math.BigDecimal;
import java.util.List;

public record CheckoutResponse(
        Long id,
        String orderCode,
        OrderStatus status,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal total,
        PaymentMethod paymentMethod,
        List<CheckoutItemResponse> items
) {
}
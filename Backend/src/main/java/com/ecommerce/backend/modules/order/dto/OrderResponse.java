package com.ecommerce.backend.modules.order.dto;

import com.ecommerce.backend.modules.order.entity.OrderStatus;
import com.ecommerce.backend.modules.payment.entity.PaymentMethod;
import com.ecommerce.backend.modules.payment.entity.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderCode,
        OrderStatus status,
        LocalDateTime createdAt,
        BigDecimal subtotal,
        BigDecimal shippingFee,
        BigDecimal total,
        String receiverName,
        String receiverPhone,
        String shippingAddress,
        String note,
        String cancelReason,
        LocalDateTime cancelledAt,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        boolean canCancel,
        List<OrderItemResponse> items
) {
}
package com.ecommerce.backend.modules.order.mapper;

import com.ecommerce.backend.modules.order.dto.OrderItemResponse;
import com.ecommerce.backend.modules.order.dto.OrderResponse;
import com.ecommerce.backend.modules.order.entity.Order;
import com.ecommerce.backend.modules.order.entity.OrderStatus;
import com.ecommerce.backend.modules.payment.entity.Payment;
import com.ecommerce.backend.modules.payment.entity.PaymentMethod;
import com.ecommerce.backend.modules.payment.entity.PaymentStatus;
import com.ecommerce.backend.modules.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderResponseMapper {

    private final PaymentRepository paymentRepository;

    public OrderResponse toResponse(Order order) {
        Payment payment = paymentRepository.findByOrderId(order.getId()).orElse(null);

        List<OrderItemResponse> items = order.getItems()
                .stream()
                .map(item ->
                        new OrderItemResponse(
                                item.getProduct().getId(),
                                item.getProductName(),
                                item.getPriceAtPurchase(),
                                item.getQuantity(),
                                item.getSubtotal()
                        )
                )
                .toList();

        BigDecimal subtotal = order.getSubtotalAmount();

        if (subtotal == null) {
            subtotal = items.stream()
                    .map(OrderItemResponse::lineTotal)
                    .reduce(
                            BigDecimal.ZERO,
                            BigDecimal::add);
        }

        boolean canCancel = order.getStatus() == OrderStatus.PENDING && payment != null
                        && payment.getPaymentMethod() == PaymentMethod.COD
                        && payment.getStatus() == PaymentStatus.PENDING;

        return new OrderResponse(
                order.getId(),
                order.getOrderCode(),
                order.getStatus(),
                order.getCreatedAt(),
                subtotal,
                order.getShippingFee(),
                order.getTotalAmount(),
                order.getReceiverName(),
                order.getReceiverPhone(),
                order.getShippingAddress(),
                order.getNote(),
                order.getCancelReason(),
                order.getCancelledAt(),
                payment == null
                        ? null
                        : payment.getPaymentMethod(),
                payment == null
                        ? null
                        : payment.getStatus(),
                canCancel,
                items);
    }
}
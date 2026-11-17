package com.ecommerce.backend.modules.order.service.impl;

import com.ecommerce.backend.common.constant.ErrorCode;
import com.ecommerce.backend.common.exception.AppException;
import com.ecommerce.backend.modules.order.dto.CancelOrderRequest;
import com.ecommerce.backend.modules.order.dto.OrderItemResponse;
import com.ecommerce.backend.modules.order.dto.OrderListResponse;
import com.ecommerce.backend.modules.order.dto.OrderResponse;
import com.ecommerce.backend.modules.order.entity.Order;
import com.ecommerce.backend.modules.order.entity.OrderItem;
import com.ecommerce.backend.modules.order.entity.OrderStatus;
import com.ecommerce.backend.modules.order.repository.OrderRepository;
import com.ecommerce.backend.modules.order.service.CustomerOrderService;
import com.ecommerce.backend.modules.payment.entity.Payment;
import com.ecommerce.backend.modules.payment.entity.PaymentMethod;
import com.ecommerce.backend.modules.payment.entity.PaymentStatus;
import com.ecommerce.backend.modules.payment.repository.PaymentRepository;
import com.ecommerce.backend.modules.product.entity.Product;
import com.ecommerce.backend.modules.product.entity.ProductStatus;
import com.ecommerce.backend.modules.product.repository.ProductRepository;
import com.ecommerce.backend.modules.user.entity.User;
import com.ecommerce.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import com.ecommerce.backend.modules.order.mapper.OrderResponseMapper;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerOrderServiceImpl implements CustomerOrderService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final ProductRepository productRepository;
    private final OrderResponseMapper orderResponseMapper;
    @Override
    public OrderListResponse getMyOrders(String email, int page, int limit, String status) {
        if (page < 1 || limit < 1 || limit > 50) {
            throw new AppException(ErrorCode.ORDER_FILTER_INVALID);
        }

        User user = getUser(email);

        var pageable = PageRequest.of(
                page - 1,
                limit,
                Sort.by(Sort.Direction.DESC, "id"));

        Page<Order> result;

        if (status == null || status.isBlank() || "all".equalsIgnoreCase(status.trim())) {
            result = orderRepository.findByUserId(user.getId(), pageable);
        } else {
            OrderStatus orderStatus;
            try {
                orderStatus = OrderStatus.valueOf(status.trim());
            } catch (IllegalArgumentException exception) {
                throw new AppException(ErrorCode.ORDER_FILTER_INVALID);
            }

            result = orderRepository.findByUserIdAndStatus(user.getId(), orderStatus, pageable);
        }

        List<OrderResponse> orders = result.getContent()
                .stream()
                .map(this::toResponse)
                .toList();

        return new OrderListResponse(orders, result.getTotalElements(), page, limit, result.getTotalPages());
    }

    @Override
    public OrderResponse getMyOrder(String email, String orderCode) {
        User user = getUser(email);

        Order order = orderRepository.findByOrderCodeAndUserId(
                        orderCode,
                        user.getId()).orElseThrow(() ->
                        new AppException(ErrorCode.ORDER_NOT_FOUND));

        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(String email, String orderCode, CancelOrderRequest request) {
        // Cùng thứ tự khóa tài khoản với checkout.
        User user = userRepository.findByEmailForCart(email)
                .orElseThrow(() ->
                        new AppException(ErrorCode.USER_NOT_EXISTED));

        Order order = orderRepository.findOwnedOrderForUpdate(
                        orderCode,
                        user.getId())
                .orElseThrow(() ->
                        new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Request hủy gửi lại không được hoàn kho lần hai.
        if (order.getStatus() == OrderStatus.CANCELLED) {
            return toResponse(order);
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.ORDER_CANNOT_CANCEL);
        }

        Payment payment = paymentRepository.findByOrderIdForUpdate(order.getId())
                .orElseThrow(() ->
                        new AppException(ErrorCode.ORDER_PAYMENT_CANNOT_CANCEL));

        if (payment.getPaymentMethod() != PaymentMethod.COD || payment.getStatus() != PaymentStatus.PENDING) {
            throw new AppException(ErrorCode.ORDER_PAYMENT_CANNOT_CANCEL);
        }

        List<OrderItem> items = new ArrayList<>(order.getItems());

        // Khóa sản phẩm theo cùng thứ tự như checkout.
        items.sort(Comparator.comparing(
                        item -> item.getProduct().getId()));

        for (OrderItem item : items) {
            Product product = productRepository.findByIdForCheckout(item.getProduct().getId())
                    .orElseThrow(() ->
                            new AppException(ErrorCode.PRODUCT_NOT_FOUND));

            if (item.getQuantity() == null || item.getQuantity() < 1) {
                throw new AppException(ErrorCode.ORDER_RESTOCK_INVALID);
            }

            int restoredStock;

            try {
                restoredStock = Math.addExact(
                        product.getStock(),
                        item.getQuantity());
            } catch (ArithmeticException exception) {
                throw new AppException(ErrorCode.ORDER_RESTOCK_INVALID);
            }

            product.setStock(restoredStock);

            // Không tự công khai lại sản phẩm DRAFT/ARCHIVED.
            if (product.getStatus() == ProductStatus.OUT_OF_STOCK && restoredStock > 0) {
                product.setStatus(ProductStatus.PUBLISHED);
            }
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(request.reason().trim());
        order.setCancelledAt(LocalDateTime.now());

        payment.setStatus(PaymentStatus.CANCELLED);

        orderRepository.saveAndFlush(order);
        paymentRepository.saveAndFlush(payment);

        return toResponse(order);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private OrderResponse toResponse(Order order) {
        return orderResponseMapper.toResponse(order);
    }
}
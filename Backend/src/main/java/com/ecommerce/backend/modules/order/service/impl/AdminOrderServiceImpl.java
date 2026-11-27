package com.ecommerce.backend.modules.order.service.impl;

import com.ecommerce.backend.common.constant.ErrorCode;
import com.ecommerce.backend.common.exception.AppException;
import com.ecommerce.backend.modules.order.dto.AdminOrderListResponse;
import com.ecommerce.backend.modules.order.dto.AdminOrderResponse;
import com.ecommerce.backend.modules.order.dto.UpdateOrderStatusRequest;
import com.ecommerce.backend.modules.order.entity.Order;
import com.ecommerce.backend.modules.order.entity.OrderStatus;
import com.ecommerce.backend.modules.order.mapper.OrderResponseMapper;
import com.ecommerce.backend.modules.order.repository.OrderRepository;
import com.ecommerce.backend.modules.order.service.AdminOrderService;
import com.ecommerce.backend.modules.payment.entity.Payment;
import com.ecommerce.backend.modules.payment.entity.PaymentMethod;
import com.ecommerce.backend.modules.payment.entity.PaymentStatus;
import com.ecommerce.backend.modules.payment.repository.PaymentRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Transactional(readOnly = true)
public class AdminOrderServiceImpl implements AdminOrderService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final OrderResponseMapper orderResponseMapper;

    @Override
    public AdminOrderListResponse getOrders(int page, int limit, String status, String q) {
        if (page < 1 || limit < 1 || limit > 50) {
            throw new AppException(ErrorCode.ORDER_FILTER_INVALID);
        }

        OrderStatus statusFilter = parseStatus(status);

        Specification<Order> specification = (root, query, cb) -> {
            List<Predicate> conditions = new ArrayList<>();

            if (statusFilter != null) {
                conditions.add(cb.equal(root.get("status"), statusFilter));
            }

            if (q != null && !q.isBlank()) {
                String keyword = q.trim()
                        .toLowerCase(Locale.ROOT)
                        .replace("\\", "\\\\")
                        .replace("%", "\\%")
                        .replace("_", "\\_");

                String pattern = "%" + keyword + "%";

                conditions.add(
                        cb.or(
                                cb.like(
                                        cb.lower(
                                                root.<String>get("orderCode")
                                        ),
                                        pattern,
                                        '\\'
                                ),
                                cb.like(
                                        cb.lower(
                                                root.<String>get("receiverName")
                                        ),
                                        pattern,
                                        '\\'
                                ),
                                cb.like(
                                        root.<String>get("receiverPhone"),
                                        pattern,
                                        '\\'
                                ),
                                cb.like(
                                        cb.lower(
                                                root.get("user")
                                                        .<String>get("email")
                                        ),
                                        pattern,
                                        '\\'
                                )
                        ));
            }

            return cb.and(conditions.toArray(new Predicate[0]));
        };

        var pageable = PageRequest.of(
                page - 1,
                limit,
                Sort.by(Sort.Direction.DESC, "id")
        );

        var result = orderRepository.findAll(specification, pageable);

        return new AdminOrderListResponse(
                result.getContent()
                        .stream()
                        .map(this::toResponse)
                        .toList(),
                result.getTotalElements(),
                page,
                limit,
                result.getTotalPages()
        );
    }

    @Override
    public AdminOrderResponse getOrder(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() ->
                        new AppException(ErrorCode.ORDER_NOT_FOUND));

        return toResponse(order);
    }

    @Override
    @Transactional
    public AdminOrderResponse updateStatus(String orderCode, UpdateOrderStatusRequest request) {
        // Chỉ chấp nhận chuyển tiếp đúng một bước.
        if (!nextStatuses(request.expectedStatus()).contains(request.status())) {
            throw new AppException(ErrorCode.ADMIN_ORDER_TRANSITION_INVALID);
        }


        if (request.status() != OrderStatus.DELIVERED
                && Boolean.TRUE.equals(request.codCollected())) {
            throw new AppException(ErrorCode.ADMIN_ORDER_TRANSITION_INVALID);
        }

        Order order = orderRepository
                .findByOrderCodeForUpdate(orderCode)
                .orElseThrow(() ->
                        new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Gửi lại cùng một bước đã hoàn thành:
        // trả kết quả hiện tại, không ghi thanh toán lần hai.
        if (order.getStatus() == request.status()) {
            return toResponse(order);
        }

        if (order.getStatus() != request.expectedStatus()) {
            throw new AppException(ErrorCode.ADMIN_ORDER_STATUS_CHANGED);
        }

        Payment payment = paymentRepository
                .findByOrderIdForUpdate(order.getId())
                .orElseThrow(() ->
                        new AppException(ErrorCode.ADMIN_ORDER_PAYMENT_INVALID));

        if (payment.getPaymentMethod() == PaymentMethod.COD
                && request.status() == OrderStatus.DELIVERED
                && !Boolean.TRUE.equals(request.codCollected())) {
            throw new AppException(ErrorCode.COD_COLLECTION_REQUIRED);
        }

        if (payment.getPaymentMethod() == PaymentMethod.MOMO
                && Boolean.TRUE.equals(request.codCollected())) {
            throw new AppException(ErrorCode.ADMIN_ORDER_TRANSITION_INVALID);
        }

        if (!isProcessable(payment) || payment.getAmount().compareTo(order.getTotalAmount()) != 0) {
            throw new AppException(ErrorCode.ADMIN_ORDER_PAYMENT_INVALID);
        }

        order.setStatus(request.status());

        if (request.status() == OrderStatus.DELIVERED
                && payment.getPaymentMethod() == PaymentMethod.COD) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
        }

        orderRepository.saveAndFlush(order);
        paymentRepository.saveAndFlush(payment);

        return toResponse(order);
    }

    private OrderStatus parseStatus(String status) {
        if (status == null || status.isBlank() || "all".equalsIgnoreCase(status.trim())) {
            return null;
        }

        try {
            return OrderStatus.valueOf(status.trim());
        } catch (IllegalArgumentException exception) {
            throw new AppException(ErrorCode.ORDER_FILTER_INVALID);
        }
    }

    private boolean isProcessable(Payment payment) {
        if (payment == null) {
            return false;
        }

        boolean pendingCod =
                payment.getPaymentMethod() == PaymentMethod.COD
                        && payment.getStatus() == PaymentStatus.PENDING;

        boolean paidMomo =
                payment.getPaymentMethod() == PaymentMethod.MOMO
                        && payment.getStatus() == PaymentStatus.SUCCESS;

        return pendingCod || paidMomo;
    }

    private List<OrderStatus> nextStatuses(OrderStatus status) {
        return switch (status) {
            case PENDING ->
                    List.of(OrderStatus.CONFIRMED);
            case CONFIRMED ->
                    List.of(OrderStatus.PROCESSING);
            case PROCESSING ->
                    List.of(OrderStatus.SHIPPED);
            case SHIPPED ->
                    List.of(OrderStatus.DELIVERED);
            case DELIVERED, CANCELLED ->
                    List.of();
        };
    }

    private AdminOrderResponse toResponse(Order order) {
        Payment payment = paymentRepository
                .findByOrderId(order.getId())
                .orElse(null);

        List<OrderStatus> allowed = isProcessable(payment) && payment.getAmount().compareTo(order.getTotalAmount()) == 0 ? nextStatuses(order.getStatus()) : List.of();

        return new AdminOrderResponse(
                orderResponseMapper.toResponse(order),
                order.getUser().getId(),
                order.getUser().getFullName(),
                order.getUser().getEmail(),
                order.getUpdatedAt(),
                allowed);
    }
}
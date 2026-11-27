package com.ecommerce.backend.modules.order.service.impl;

import com.ecommerce.backend.common.constant.ErrorCode;
import com.ecommerce.backend.common.exception.AppException;
import com.ecommerce.backend.modules.order.dto.CheckoutItemResponse;
import com.ecommerce.backend.modules.order.dto.CheckoutRequest;
import com.ecommerce.backend.modules.order.dto.CheckoutResponse;
import com.ecommerce.backend.modules.order.dto.ShippingInfoRequest;
import com.ecommerce.backend.modules.order.entity.CartItem;
import com.ecommerce.backend.modules.order.entity.Order;
import com.ecommerce.backend.modules.order.entity.OrderItem;
import com.ecommerce.backend.modules.order.entity.OrderStatus;
import com.ecommerce.backend.modules.order.repository.CartItemRepository;
import com.ecommerce.backend.modules.order.repository.OrderRepository;
import com.ecommerce.backend.modules.order.service.CheckoutService;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.backend.modules.payment.service.MomoPaymentService;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CheckoutServiceImpl implements CheckoutService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = new BigDecimal("500000");
    private static final BigDecimal SHIPPING_FEE = new BigDecimal("30000");
    private static final BigDecimal MAX_AMOUNT = new BigDecimal("9999999999999.99");

    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final MomoPaymentService momoPaymentService;

    @Override
    @Transactional
    public CheckoutResponse checkout(String email, CheckoutRequest request) {
        if (request.paymentMethod() != PaymentMethod.COD
                && request.paymentMethod() != PaymentMethod.MOMO) {
            throw new AppException(ErrorCode.CHECKOUT_PAYMENT_NOT_SUPPORTED);
        }

        // Dùng cùng khóa với các thao tác sửa giỏ hàng.
        User user = userRepository.findByEmailForCart(email).orElseThrow(() ->
                        new AppException(ErrorCode.USER_NOT_EXISTED));

        // Kiểm tra trước khi đọc giỏ:
        // request gửi lại vẫn nhận được đơn dù giỏ đã bị xóa.
        var existingOrder = orderRepository.findByUserIdAndCheckoutKey(user.getId(), request.checkoutKey());

        if (existingOrder.isPresent()) {
            return toResponse(existingOrder.get());
        }

        List<CartItem> cartItems = new ArrayList<>(cartItemRepository.findByUserId(user.getId()));

        if (cartItems.isEmpty()) {
            throw new AppException(ErrorCode.CART_EMPTY);
        }

        // Khóa sản phẩm theo cùng thứ tự để giảm nguy cơ deadlock.
        cartItems.sort(Comparator.comparing(item -> item.getProduct().getId()));

        List<Product> lockedProducts = new ArrayList<>();
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Product product = productRepository.findByIdForCheckout(
                    cartItem.getProduct().getId()).orElseThrow(() -> new AppException(
                                    ErrorCode.PRODUCT_NOT_FOUND));

            validateProduct(product, cartItem.getQuantity());

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .priceAtPurchase(product.getPrice())
                    .quantity(cartItem.getQuantity())
                    .subtotal(lineTotal)
                    .build();

            lockedProducts.add(product);
            orderItems.add(orderItem);

            subtotal = subtotal.add(lineTotal);
        }

        BigDecimal shippingFee = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : SHIPPING_FEE;

        BigDecimal total = subtotal.add(shippingFee);

        if (total.compareTo(MAX_AMOUNT) > 0) {
            throw new AppException(ErrorCode.CHECKOUT_AMOUNT_INVALID);
        }

        if (total.compareTo(request.expectedTotal()) != 0) {
            throw new AppException(ErrorCode.CHECKOUT_TOTAL_CHANGED);
        }
        if (request.paymentMethod() == PaymentMethod.MOMO) {
            momoPaymentService.validateCheckout(total);
        }

        ShippingInfoRequest shipping = request.shippingInfo();

        String shippingAddress = String.join(
                ", ",
                shipping.address().trim(),
                shipping.district().trim(),
                shipping.province().trim());

        Order order = Order.builder()
                .orderCode(
                        "ORD-" + UUID.randomUUID()
                                .toString()
                                .replace("-", "")
                                .toUpperCase(java.util.Locale.ROOT)
                )
                .checkoutKey(request.checkoutKey())
                .user(user)
                .subtotalAmount(subtotal)
                .shippingFee(shippingFee)
                .totalAmount(total)
                .status(OrderStatus.PENDING)
                .receiverName(shipping.fullName().trim())
                .receiverPhone(shipping.phone().trim())
                .shippingAddress(shippingAddress)
                .note(
                        shipping.notes() == null
                                ? null
                                : shipping.notes().trim()
                )
                .build();

        for (OrderItem item : orderItems) {
            item.setOrder(order);
            order.getItems().add(item);
        }

        // Chỉ trừ kho sau khi đã kiểm tra toàn bộ giỏ và tổng tiền.
        for (int index = 0; index < lockedProducts.size(); index++) {
            Product product = lockedProducts.get(index);
            OrderItem item = orderItems.get(index);

            int remainingStock = product.getStock() - item.getQuantity();

            product.setStock(remainingStock);

            if (remainingStock == 0) {
                product.setStatus(ProductStatus.OUT_OF_STOCK);
            }
        }

        // Order có cascade ALL nên OrderItem được lưu cùng.
        Order savedOrder = orderRepository.saveAndFlush(order);

        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentMethod(request.paymentMethod())
                .amount(total)
                .status(PaymentStatus.PENDING)
                .build();

        if (request.paymentMethod() == PaymentMethod.MOMO) {
            payment.setMomoRequestId(UUID.randomUUID().toString());

            payment.setMomoRedirectUrl(
                    momoPaymentService.redirectUrl()
            );

            payment.setMomoIpnUrl(
                    momoPaymentService.ipnUrl()
            );
        }

        paymentRepository.saveAndFlush(payment);

        // Chỉ xóa giỏ sau khi đã tạo đơn và bản ghi thanh toán.
        cartItemRepository.deleteByUserId(user.getId());
        cartItemRepository.flush();

        return toResponse(savedOrder);
    }

    private void validateProduct(
            Product product,
            int quantity
    ) {
        if (product.getStatus() != ProductStatus.PUBLISHED || !Boolean.TRUE.equals(product.getCategory().getIsActive())) {
            throw new AppException(ErrorCode.PRODUCT_NOT_AVAILABLE);
        }

        if (quantity < 1 || quantity > product.getStock()) {
            throw new AppException(ErrorCode.CART_STOCK_EXCEEDED);
        }
    }

    private CheckoutResponse toResponse(Order order) {
        List<CheckoutItemResponse> items = order.getItems()
                .stream()
                .map(item ->
                        new CheckoutItemResponse(
                                item.getProduct().getId(),
                                item.getProductName(),
                                item.getPriceAtPurchase(),
                                item.getQuantity(),
                                item.getSubtotal()
                        )
                )
                .toList();
        PaymentMethod paymentMethod = paymentRepository
                .findByOrderId(order.getId())
                .orElseThrow(() ->
                        new IllegalStateException(
                                "Không tìm thấy thanh toán của đơn hàng."
                        )
                )
                .getPaymentMethod();

        return new CheckoutResponse(
                order.getId(),
                order.getOrderCode(),
                order.getStatus(),
                order.getSubtotalAmount(),
                order.getShippingFee(),
                order.getTotalAmount(),
                paymentMethod,
                items
        );
    }
}
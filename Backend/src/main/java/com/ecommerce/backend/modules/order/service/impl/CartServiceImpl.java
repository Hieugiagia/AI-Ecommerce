package com.ecommerce.backend.modules.order.service.impl;

import com.ecommerce.backend.common.constant.ErrorCode;
import com.ecommerce.backend.common.exception.AppException;
import com.ecommerce.backend.modules.order.dto.AddCartItemRequest;
import com.ecommerce.backend.modules.order.dto.CartItemResponse;
import com.ecommerce.backend.modules.order.dto.CartResponse;
import com.ecommerce.backend.modules.order.dto.UpdateCartItemRequest;
import com.ecommerce.backend.modules.order.entity.CartItem;
import com.ecommerce.backend.modules.order.repository.CartItemRepository;
import com.ecommerce.backend.modules.order.service.CartService;
import com.ecommerce.backend.modules.product.entity.Product;
import com.ecommerce.backend.modules.product.entity.ProductStatus;
import com.ecommerce.backend.modules.product.repository.ProductRepository;
import com.ecommerce.backend.modules.user.entity.User;
import com.ecommerce.backend.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    public CartResponse getCart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return buildCart(user.getId());
    }

    @Override
    @Transactional
    public CartResponse addItem(String email, AddCartItemRequest request) {
        User user = lockUser(email);

        Product product = productRepository
                .findById(request.productId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        CartItem item = cartItemRepository
                .findByUserIdAndProductId(user.getId(), product.getId())
                .orElseGet(() -> CartItem.builder()
                                .user(user)
                                .product(product)
                                .quantity(0)
                                .build()
                );

        // Dùng long để tránh tràn số khi cộng.
        long newQuantity = (long) item.getQuantity() + request.quantity();

        validateQuantity(product, newQuantity);

        item.setQuantity((int) newQuantity);
        cartItemRepository.saveAndFlush(item);

        return buildCart(user.getId());
    }

    @Override
    @Transactional
    public CartResponse updateQuantity(String email, Long itemId, UpdateCartItemRequest request) {
        User user = lockUser(email);

        CartItem item = findOwnedItem(user.getId(), itemId);

        validateQuantity(item.getProduct(), request.quantity());

        item.setQuantity(request.quantity());
        cartItemRepository.saveAndFlush(item);

        return buildCart(user.getId());
    }

    @Override
    @Transactional
    public void removeItem(String email, Long itemId) {
        User user = lockUser(email);

        CartItem item = findOwnedItem(user.getId(), itemId);

        cartItemRepository.delete(item);
        cartItemRepository.flush();
    }

    @Override
    @Transactional
    public void clearCart(String email) {
        User user = lockUser(email);

        cartItemRepository.deleteByUserId(user.getId());
        cartItemRepository.flush();
    }

    private User lockUser(String email) {
        return userRepository.findByEmailForCart(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    private CartItem findOwnedItem(Long userId, Long itemId) {
        return cartItemRepository
                .findByIdAndUserId(itemId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
    }

    private boolean isOnSale(Product product) {
        return product.getStatus() == ProductStatus.PUBLISHED
                && Boolean.TRUE.equals(product.getCategory().getIsActive());
    }

    private void validateQuantity(Product product, long quantity) {
        if (!isOnSale(product)) {
            throw new AppException(ErrorCode.PRODUCT_NOT_AVAILABLE);
        }

        if (quantity > product.getStock()) {
            throw new AppException(ErrorCode.CART_STOCK_EXCEEDED);
        }
    }

    private CartResponse buildCart(Long userId) {
        List<CartItemResponse> items = cartItemRepository
                .findByUserId(userId)
                .stream()
                .sorted(Comparator.comparing(CartItem::getId))
                .map(this::toResponse)
                .toList();

        long itemCount = items.stream()
                .mapToLong(CartItemResponse::quantity)
                .sum();

        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(items, itemCount, subtotal);
    }

    private CartItemResponse toResponse(CartItem item) {
        Product product = item.getProduct();

        BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

        boolean available = isOnSale(product)
                && item.getQuantity() <= product.getStock();

        return new CartItemResponse(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getThumbnailUrl(),
                product.getPrice(),
                item.getQuantity(),
                product.getStock(),
                available,
                lineTotal
        );
    }
}
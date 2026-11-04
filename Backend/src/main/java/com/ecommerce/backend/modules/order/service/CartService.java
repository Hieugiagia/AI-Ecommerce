package com.ecommerce.backend.modules.order.service;

import com.ecommerce.backend.modules.order.dto.AddCartItemRequest;
import com.ecommerce.backend.modules.order.dto.CartResponse;
import com.ecommerce.backend.modules.order.dto.UpdateCartItemRequest;

public interface CartService {

    CartResponse getCart(String email);

    CartResponse addItem(String email, AddCartItemRequest request);

    CartResponse updateQuantity(String email, Long itemId, UpdateCartItemRequest request);

    void removeItem(String email, Long itemId);

    void clearCart(String email);
}
package com.ecommerce.backend.modules.order.service;

import com.ecommerce.backend.modules.order.dto.CancelOrderRequest;
import com.ecommerce.backend.modules.order.dto.OrderListResponse;
import com.ecommerce.backend.modules.order.dto.OrderResponse;

public interface CustomerOrderService {

    OrderListResponse getMyOrders(String email, int page, int limit, String status);

    OrderResponse getMyOrder(String email, String orderCode);

    OrderResponse cancelOrder(String email, String orderCode, CancelOrderRequest request);
}
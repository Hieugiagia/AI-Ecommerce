package com.ecommerce.backend.modules.order.service;

import com.ecommerce.backend.modules.order.dto.AdminOrderListResponse;
import com.ecommerce.backend.modules.order.dto.AdminOrderResponse;
import com.ecommerce.backend.modules.order.dto.UpdateOrderStatusRequest;

public interface AdminOrderService {

    AdminOrderListResponse getOrders(int page, int limit, String status, String q);

    AdminOrderResponse getOrder(String orderCode);

    AdminOrderResponse updateStatus(String orderCode, UpdateOrderStatusRequest request);
}
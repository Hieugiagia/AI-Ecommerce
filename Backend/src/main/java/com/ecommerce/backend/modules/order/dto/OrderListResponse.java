package com.ecommerce.backend.modules.order.dto;

import java.util.List;

public record OrderListResponse(
        List<OrderResponse> orders,
        long total,
        int page,
        int limit,
        int totalPages
) {
}
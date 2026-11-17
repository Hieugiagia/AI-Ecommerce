package com.ecommerce.backend.modules.order.dto;

import java.util.List;

public record AdminOrderListResponse(
        List<AdminOrderResponse> orders,
        long total,
        int page,
        int limit,
        int totalPages
) {
}
package com.ecommerce.backend.modules.order.dto;

import com.ecommerce.backend.modules.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(

        @NotNull(message = "Thiếu trạng thái hiện tại")
        OrderStatus expectedStatus,

        @NotNull(message = "Thiếu trạng thái muốn chuyển")
        OrderStatus status,

        Boolean codCollected
) {
}
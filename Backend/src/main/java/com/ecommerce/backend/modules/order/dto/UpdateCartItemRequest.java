package com.ecommerce.backend.modules.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateCartItemRequest(

        @NotNull(message = "Bạn phải nhập số lượng")
        @Min(value = 1, message = "Số lượng phải từ 1")
        Integer quantity
) {
}
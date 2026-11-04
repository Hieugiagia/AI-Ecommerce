package com.ecommerce.backend.modules.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddCartItemRequest(

        @NotNull(message = "Bạn phải chọn sản phẩm")
        @Positive(message = "ID sản phẩm phải lớn hơn 0")
        Long productId,

        @NotNull(message = "Bạn phải nhập số lượng")
        @Min(value = 1, message = "Số lượng phải từ 1")
        Integer quantity
) {
}
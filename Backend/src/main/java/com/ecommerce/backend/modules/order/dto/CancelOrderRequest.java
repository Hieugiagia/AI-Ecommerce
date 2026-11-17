package com.ecommerce.backend.modules.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CancelOrderRequest(
        @NotBlank(message = "Bạn phải nhập lý do hủy")
        @Size(max = 500, message = "Lý do hủy tối đa 500 ký tự")
        String reason
) {
}
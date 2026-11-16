package com.ecommerce.backend.modules.order.dto;

import com.ecommerce.backend.modules.payment.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CheckoutRequest(

        @NotBlank(message = "Thiếu mã checkout")
        @Pattern(regexp = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", message = "Mã checkout phải đúng định dạng UUID chữ thường")
        String checkoutKey,

        @NotNull(message = "Bạn phải chọn phương thức thanh toán")
        PaymentMethod paymentMethod,

        @NotNull(message = "Thiếu tổng tiền cần xác nhận")
        @DecimalMin(value = "0", message = "Tổng tiền không được âm")
        @Digits(integer = 13, fraction = 2)
        BigDecimal expectedTotal,

        @NotNull(message = "Thiếu thông tin giao hàng")
        @Valid
        ShippingInfoRequest shippingInfo
) {
}
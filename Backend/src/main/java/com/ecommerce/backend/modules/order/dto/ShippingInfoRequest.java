package com.ecommerce.backend.modules.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ShippingInfoRequest(

        @NotBlank(message = "Bạn phải nhập tên người nhận")
        @Size(max = 100, message = "Tên người nhận tối đa 100 ký tự")
        String fullName,

        @NotBlank(message = "Bạn phải nhập số điện thoại")
        @Pattern(regexp = "\\+?[0-9]{8,15}", message = "Số điện thoại gồm 8–15 chữ số, có thể bắt đầu bằng +")
        String phone,

        @NotBlank(message = "Bạn phải nhập tỉnh/thành phố")
        @Size(max = 100)
        String province,

        @NotBlank(message = "Bạn phải nhập quận/huyện hoặc khu vực giao hàng")
        @Size(max = 100)
        String district,

        @NotBlank(message = "Bạn phải nhập địa chỉ cụ thể")
        @Size(max = 500)
        String address,

        @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
        String notes
) {
}
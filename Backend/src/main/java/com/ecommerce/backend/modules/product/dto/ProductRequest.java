package com.ecommerce.backend.modules.product.dto;

import com.ecommerce.backend.modules.product.entity.ProductStatus;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductRequest {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 255, message = "Tên sản phẩm tối đa 255 ký tự")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    @Size(max = 280, message = "Slug tối đa 280 ký tự")
    @Pattern(
            regexp = "[a-z0-9]+(?:-[a-z0-9]+)*",
            message = "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang"
    )
    private String slug;

    private String description;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @DecimalMin(value = "0", message = "Giá không được âm")
    @Digits(
            integer = 13,
            fraction = 2,
            message = "Giá tối đa 13 chữ số nguyên và 2 chữ số thập phân"
    )
    private BigDecimal price;

    @NotNull(message = "Tồn kho không được để trống")
    @Min(value = 0, message = "Tồn kho không được âm")
    private Integer stock;

    @NotNull(message = "Bạn phải chọn danh mục")
    @Positive(message = "ID danh mục phải lớn hơn 0")
    private Long categoryId;

    @Size(max = 500, message = "Đường dẫn ảnh tối đa 500 ký tự")
    private String thumbnailUrl;

    @NotNull(message = "Trạng thái sản phẩm không được để trống")
    private ProductStatus status;

    @PositiveOrZero(message = "Version không hợp lệ")
    private Long version;
}
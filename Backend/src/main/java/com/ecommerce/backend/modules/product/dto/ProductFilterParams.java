package com.ecommerce.backend.modules.product.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductFilterParams {
    private String q;            // Từ khóa tìm kiếm tên sản phẩm
    private String category;     // Slug hoặc tên danh mục
    private String brand;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer page = 1;    // Mặc định trang 1 từ Frontend
    private Integer limit = 12;  // Số sản phẩm mỗi trang
    private String sort;         // Sắp xếp: price-asc, price-desc, newest
}
package com.ecommerce.backend.modules.product.entity;

public enum ProductStatus {
    DRAFT,          // Bản nháp, chưa công khai
    PUBLISHED,      // Đang mở bán trên web
    OUT_OF_STOCK,   // Tạm hết hàng
    ARCHIVED        // Ngừng kinh doanh
}

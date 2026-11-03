package com.ecommerce.backend.modules.product.dto;

import com.ecommerce.backend.modules.product.entity.Product;
import com.ecommerce.backend.modules.product.entity.ProductStatus;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String name,
        String slug,
        String description,
        BigDecimal price,
        Integer stock,
        Long categoryId,
        String categorySlug,
        String categoryName,
        String thumbnailUrl,
        ProductStatus status,
        Long version
) {

    public static ProductResponse from(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getName(),
                product.getSlug(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getCategory().getId(),
                product.getCategory().getSlug(),
                product.getCategory().getName(),
                product.getThumbnailUrl(),
                product.getStatus(),
                product.getVersion()
        );
    }
}
package com.ecommerce.backend.modules.product.service;

import com.ecommerce.backend.modules.product.dto.ProductFilterParams;
import com.ecommerce.backend.modules.product.dto.ProductListResponse;
import com.ecommerce.backend.modules.product.dto.ProductRequest;
import com.ecommerce.backend.modules.product.dto.ProductResponse;
import com.ecommerce.backend.modules.product.entity.Product;

public interface ProductService {
    ProductListResponse getProducts(ProductFilterParams params);
    ProductResponse getByIdOrSlug(String idOrSlug);
    ProductResponse createProduct(ProductRequest request);
    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    ProductListResponse getAdminProducts(ProductFilterParams params);

    ProductResponse getAdminProductById(Long id);
}
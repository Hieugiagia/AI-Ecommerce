package com.ecommerce.backend.modules.product.service;

import com.ecommerce.backend.modules.product.dto.ProductFilterParams;
import com.ecommerce.backend.modules.product.dto.ProductListResponse;
import com.ecommerce.backend.modules.product.entity.Product;

public interface ProductService {
    ProductListResponse getProducts(ProductFilterParams params);
    Product getByIdOrSlug(String idOrSlug);
    Product createProduct(Product product);
    Product updateProduct(Long id, Product product);
    void deleteProduct(Long id);
}
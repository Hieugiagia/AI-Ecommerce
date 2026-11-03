package com.ecommerce.backend.modules.product.controller;

import com.ecommerce.backend.modules.product.dto.ProductFilterParams;
import com.ecommerce.backend.modules.product.dto.ProductListResponse;
import com.ecommerce.backend.modules.product.dto.ProductResponse;
import com.ecommerce.backend.modules.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ProductListResponse> getProducts(ProductFilterParams params) {
        return ResponseEntity.ok(productService.getAdminProducts(params));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, ProductResponse>> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("product", productService.getAdminProductById(id)));
    }
}
package com.ecommerce.backend.modules.product.controller;

import com.ecommerce.backend.modules.product.dto.ProductFilterParams;
import com.ecommerce.backend.modules.product.dto.ProductListResponse;
import com.ecommerce.backend.modules.product.dto.ProductRequest;
import com.ecommerce.backend.modules.product.dto.ProductResponse;
import com.ecommerce.backend.modules.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<ProductListResponse> getProducts(ProductFilterParams params) {
        return ResponseEntity.ok(productService.getProducts(params));
    }

    @GetMapping("/{idOrSlug}")
    public ResponseEntity<Map<String, ProductResponse>> getProductByIdOrSlug(@PathVariable String idOrSlug) {
        return ResponseEntity.ok(Map.of("product", productService.getByIdOrSlug(idOrSlug)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
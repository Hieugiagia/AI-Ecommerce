package com.ecommerce.backend.modules.product.service.impl;

import com.ecommerce.backend.common.exception.AppException;
import com.ecommerce.backend.common.constant.ErrorCode;
import com.ecommerce.backend.modules.product.dto.ProductFilterParams;
import com.ecommerce.backend.modules.product.dto.ProductListResponse;
import com.ecommerce.backend.modules.product.entity.Product;
import com.ecommerce.backend.modules.product.repository.ProductRepository;
import com.ecommerce.backend.modules.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public ProductListResponse getProducts(ProductFilterParams params) {
        // Xử lý sắp xếp
        Sort sort = Sort.by(Sort.Direction.DESC, "id");
        if ("price-asc".equals(params.getSort())) {
            sort = Sort.by(Sort.Direction.ASC, "price");
        } else if ("price-desc".equals(params.getSort())) {
            sort = Sort.by(Sort.Direction.DESC, "price");
        }

        // Tạo Pageable (Trừ 1 vì Spring Data JPA tính trang từ 0)
        int pageIndex = Math.max(0, params.getPage() - 1);
        Pageable pageable = PageRequest.of(pageIndex, params.getLimit(), sort);

        Page<Product> productPage = productRepository.findAll(pageable);

        return ProductListResponse.builder()
                .products(productPage.getContent())
                .total(productPage.getTotalElements())
                .build();
    }

    @Override
    public Product getByIdOrSlug(String idOrSlug) {
        try {
            Long id = Long.parseLong(idOrSlug);
            return productRepository.findById(id)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)); // Đổi thành PRODUCT_NOT_FOUND khi có ErrorCode
        } catch (NumberFormatException e) {
            // Tìm theo slug
            return productRepository.findAll().stream()
                    .filter(p -> idOrSlug.equals(p.getSlug()))
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        }
    }

    @Override
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    @Override
    public Product updateProduct(Long id, Product product) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        existing.setName(product.getName());
        existing.setPrice(product.getPrice());
        existing.setDescription(product.getDescription());
        return productRepository.save(existing);
    }

    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
}
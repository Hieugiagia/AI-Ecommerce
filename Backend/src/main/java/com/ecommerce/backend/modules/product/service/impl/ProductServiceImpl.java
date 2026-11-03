package com.ecommerce.backend.modules.product.service.impl;

import com.ecommerce.backend.common.constant.ErrorCode;
import com.ecommerce.backend.common.exception.AppException;
import com.ecommerce.backend.modules.product.dto.ProductFilterParams;
import com.ecommerce.backend.modules.product.dto.ProductListResponse;
import com.ecommerce.backend.modules.product.dto.ProductRequest;
import com.ecommerce.backend.modules.product.dto.ProductResponse;
import com.ecommerce.backend.modules.product.entity.Category;
import com.ecommerce.backend.modules.product.entity.Product;
import com.ecommerce.backend.modules.product.repository.CategoryRepository;
import com.ecommerce.backend.modules.product.repository.ProductRepository;
import com.ecommerce.backend.modules.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.backend.modules.product.entity.ProductStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public ProductListResponse getProducts(ProductFilterParams params) {
        return findProducts(params, false);
    }

    @Override
    public ProductResponse getByIdOrSlug(String idOrSlug) {
        Product product;

        try {
            Long id = Long.parseLong(idOrSlug);

            product = productRepository.findById(id)
                    .orElseThrow(() ->
                            new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        } catch (NumberFormatException exception) {
            product = productRepository.findBySlug(idOrSlug)
                    .orElseThrow(() ->
                            new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        }

        if (!isPublicProduct(product)) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }

        return ProductResponse.from(product);
    }

    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        if (productRepository.findBySlug(request.getSlug()).isPresent()) {
            throw new AppException(ErrorCode.PRODUCT_SLUG_EXISTED);
        }

        Category category = getActiveCategory(request.getCategoryId());

        Product product = new Product();
        applyRequest(product, request, category);

        Product saved = productRepository.saveAndFlush(product);

        return ProductResponse.from(saved);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(
            Long id,
            ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (request.getVersion() == null) {
            throw new AppException(ErrorCode.PRODUCT_VERSION_REQUIRED);
        }

        if (!request.getVersion().equals(product.getVersion())) {
            throw new AppException(ErrorCode.PRODUCT_VERSION_CONFLICT);
        }

        if (productRepository.existsBySlugAndIdNot(
                request.getSlug(),
                id)) {
            throw new AppException(ErrorCode.PRODUCT_SLUG_EXISTED);
        }

        Category category = getActiveCategory(request.getCategoryId());

        applyRequest(product, request, category);

        Product saved = productRepository.saveAndFlush(product);

        return ProductResponse.from(saved);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        productRepository.delete(product);
        productRepository.flush();
    }

    private Category getActiveCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (!Boolean.TRUE.equals(category.getIsActive())) {
            throw new AppException(ErrorCode.CATEGORY_INACTIVE);
        }

        return category;
    }

    private void applyRequest(
            Product product,
            ProductRequest request,
            Category category
    ) {
        product.setName(request.getName().trim());
        product.setSlug(request.getSlug());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(category);
        product.setThumbnailUrl(request.getThumbnailUrl());
        product.setStatus(request.getStatus());
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ProductListResponse getAdminProducts(ProductFilterParams params) {
        return findProducts(params, true);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse getAdminProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                        new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        return ProductResponse.from(product);
    }

    private boolean isPublicProduct(Product product) {
        boolean visibleStatus =
                product.getStatus() == ProductStatus.PUBLISHED
                        || product.getStatus() == ProductStatus.OUT_OF_STOCK;

        return visibleStatus
                && Boolean.TRUE.equals(
                product.getCategory().getIsActive());
    }

    private ProductListResponse findProducts(ProductFilterParams params, boolean admin) {
        validateFilters(params, admin);

        ProductStatus requestedStatus = null;

        if (admin && hasValue(params.getStatus())) {
            try {
                requestedStatus = ProductStatus.valueOf(
                        params.getStatus().trim());
            } catch (IllegalArgumentException exception) {
                throw new AppException(ErrorCode.INVALID_PRODUCT_FILTER);
            }
        }

        ProductStatus statusFilter = requestedStatus;

        Specification<Product> specification = (root, query, cb) -> {
            List<Predicate> conditions = new ArrayList<>();

            if (!admin) {
                conditions.add(root.get("status").in(ProductStatus.PUBLISHED, ProductStatus.OUT_OF_STOCK));
                conditions.add(cb.isTrue(root.get("category").get("isActive")));
            } else if (statusFilter != null) {
                conditions.add(cb.equal(root.get("status"), statusFilter));
            }

            if (hasValue(params.getQ())) {
                String keyword = params.getQ()
                        .trim()
                        .toLowerCase(Locale.ROOT);

                // Escape các ký tự đặc biệt của SQL LIKE.
                keyword = keyword
                        .replace("\\", "\\\\")
                        .replace("%", "\\%")
                        .replace("_", "\\_");

                conditions.add(
                        cb.like(cb.lower(root.<String>get("name")),
                                "%" + keyword + "%",
                                '\\'));
            }

            if (hasValue(params.getCategory())
                    && !"all".equalsIgnoreCase(
                    params.getCategory().trim())) {

                String category = params.getCategory().trim();

                List<Predicate> categoryConditions = new ArrayList<>();

                categoryConditions.add(
                        cb.equal(
                                root.get("category").get("slug"),
                                category));

                try {
                    Long categoryId = Long.valueOf(category);

                    categoryConditions.add(
                            cb.equal(root.get("category").get("id"), categoryId));
                } catch (NumberFormatException ignored) {
                    // Giá trị là slug, không phải ID.
                }

                conditions.add(
                        cb.or(categoryConditions.toArray(new Predicate[0])));
            }

            if (params.getMinPrice() != null) {
                conditions.add(
                        cb.greaterThanOrEqualTo(root.get("price"), params.getMinPrice()));
            }

            if (params.getMaxPrice() != null) {
                conditions.add(cb.lessThanOrEqualTo(root.get("price"), params.getMaxPrice()));
            }

            return cb.and(conditions.toArray(new Predicate[0]));
        };

        Sort sort = buildSort(params.getSort());

        var pageable = PageRequest.of(
                params.getPage() - 1,
                params.getLimit(),
                sort);

        var page = productRepository.findAll(
                specification,
                pageable);

        return ProductListResponse.builder()
                .products(
                        page.getContent()
                                .stream()
                                .map(ProductResponse::from)
                                .toList()
                )
                .total(page.getTotalElements())
                .build();
    }

    private void validateFilters(
            ProductFilterParams params,
            boolean admin
    ) {
        if (params.getPage() == null || params.getPage() < 1 || params.getLimit() == null || params.getLimit() < 1
                || params.getLimit() > 100) {

            throw new AppException(ErrorCode.INVALID_PRODUCT_PAGINATION);
        }

        if (params.getMinPrice() != null
                && params.getMinPrice().signum() < 0) {
            throw new AppException(ErrorCode.INVALID_PRODUCT_FILTER);
        }

        if (params.getMaxPrice() != null
                && params.getMaxPrice().signum() < 0) {
            throw new AppException(ErrorCode.INVALID_PRODUCT_FILTER);
        }

        if (params.getMinPrice() != null
                && params.getMaxPrice() != null
                && params.getMinPrice()
                .compareTo(params.getMaxPrice()) > 0) {
            throw new AppException(ErrorCode.INVALID_PRODUCT_FILTER);
        }

        if (hasValue(params.getBrand())
                && !"all".equalsIgnoreCase(
                params.getBrand().trim())) {
            throw new AppException(ErrorCode.PRODUCT_BRAND_NOT_SUPPORTED);
        }

        // API công khai không cho client tự chọn trạng thái.
        if (!admin && hasValue(params.getStatus())) {
            throw new AppException(ErrorCode.INVALID_PRODUCT_FILTER);
        }
    }

    private Sort buildSort(String requestedSort) {
        String sort = hasValue(requestedSort)
                ? requestedSort.trim()
                : "newest";

        return switch (sort) {
            case "price-asc" ->
                    Sort.by(Sort.Direction.ASC, "price").and(Sort.by(Sort.Direction.DESC, "id"));

            case "price-desc" ->
                    Sort.by(Sort.Direction.DESC, "price").and(Sort.by(Sort.Direction.DESC, "id"));

            // FE hiện có giá trị mặc định "featured".
            // Tạm dùng thứ tự ID mới nhất cho cả hai.
            case "newest", "featured" ->
                    Sort.by(Sort.Direction.DESC, "id");
            default ->
                    throw new AppException(ErrorCode.INVALID_PRODUCT_FILTER);
        };
    }

    private boolean hasValue(String value) {
        return value != null && !value.isBlank();
    }
}
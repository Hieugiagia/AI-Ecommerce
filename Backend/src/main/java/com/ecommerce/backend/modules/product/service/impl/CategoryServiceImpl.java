package com.ecommerce.backend.modules.product.service.impl;

import com.ecommerce.backend.modules.product.dto.CategoryRequest;
import com.ecommerce.backend.modules.product.entity.Category;
import com.ecommerce.backend.modules.product.repository.CategoryRepository;
import com.ecommerce.backend.modules.product.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Category createCategory(CategoryRequest request) {
        Category category = Category.builder()
                .name(request.getName())
                .slug(request.getSlug() != null ? request.getSlug() : request.getName().toLowerCase().replace(" ", "-"))
                .parentId(request.getParentId())
                .isActive(true)
                .build();
        return categoryRepository.save(category);
    }
}
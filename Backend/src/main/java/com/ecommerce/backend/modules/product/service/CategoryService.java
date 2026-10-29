package com.ecommerce.backend.modules.product.service;

import com.ecommerce.backend.modules.product.dto.CategoryRequest;
import com.ecommerce.backend.modules.product.entity.Category;

import java.util.List;

public interface CategoryService {
    List<Category> getAllCategories();
    Category createCategory(CategoryRequest request);
}
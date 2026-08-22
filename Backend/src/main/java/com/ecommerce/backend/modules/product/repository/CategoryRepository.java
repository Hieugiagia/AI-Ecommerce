package com.ecommerce.backend.modules.product.repository;

import com.ecommerce.backend.modules.product.entity.Category;
import com.ecommerce.backend.modules.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findBySlug(String slug);

    List<Category> findByParentIdIsNullAndIsActiveTrue();

    List<Category> findByParentIdAndIsActiveTrue(Long parentId);

}

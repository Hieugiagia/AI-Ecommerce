package com.ecommerce.backend.modules.product.entity;

import com.ecommerce.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "parent_id")
    private long parentId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "slug",nullable = false,unique = true,length = 120)
    private String slug;

    @Column(name = "image_url",length = 500)
    private String imageUrl;

    @Column(name = "is_active",nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}

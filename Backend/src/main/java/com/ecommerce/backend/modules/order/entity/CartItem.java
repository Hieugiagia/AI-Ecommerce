package com.ecommerce.backend.modules.order.entity;

import com.ecommerce.backend.common.entity.BaseEntity;
import com.ecommerce.backend.modules.product.entity.Product;
import com.ecommerce.backend.modules.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.*;

@Entity
@Table(name = "cart_items",uniqueConstraints = {
        @UniqueConstraint(name = "uq_cart_user_product", columnNames = {"user_id", "product_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    private User user;

    //san pham duoc chon
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id",nullable = false)
    private Product product;

    @Column(name = "quantity",nullable = false)
    @Builder.Default
    private Integer quantity = 1;
}

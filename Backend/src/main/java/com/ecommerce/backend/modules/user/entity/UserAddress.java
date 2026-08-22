package com.ecommerce.backend.modules.user.entity;

import com.ecommerce.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_address")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAddress extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    private User user;

    @Column(name = "receiver_name",nullable = false,length = 100)
    private String receiver_name;

    @Column(name = "receiver_phone",nullable = false,length = 20)
    private String receiver_phone;

    @Column(name = "street_address",nullable = false,length = 100)
    private String street_address;

    @Column(name = "ward",nullable = false,length = 100)
    private String ward;

    @Column(name = "district", nullable = false, length = 100)
    private String district;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = false;
}

package com.ecommerce.backend.modules.user.entity;

import com.ecommerce.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email",nullable = false,unique = true,length = 150)
    @Email(message = "Email không hợp lệ")
    private String email;

    @Column(name = "password_hash",nullable = false,length = 255)
    @NotBlank(message = "Password không được để trống")

    private String passwordHash;

    @Column(name = "full_name",nullable = false,length = 255)
    private String fullName;

    @Column(name = "phone_number",length = 100)
    @NotBlank(message = "SĐT không được để trống")
    @Size(min = 8, max = 10, message = "SĐT không hợp lệ")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 30)
    @Builder.Default
    private Role role = Role.ROLE_USER;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<UserAddress> addresses = new ArrayList<>();

}

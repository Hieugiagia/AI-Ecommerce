package com.ecommerce.backend.modules.order.entity;

import com.ecommerce.backend.common.entity.BaseEntity;
import com.ecommerce.backend.modules.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders", uniqueConstraints = {@UniqueConstraint(name = "uq_order_user_checkout",
                        columnNames = {"user_id", "checkout_key"})})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code",nullable = false,unique = true,length = 60)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",nullable = false)
    private User user;

    @Column(name = "total_amount",nullable = false,precision = 15,scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status",nullable = false,length = 30)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    // Lưu snapshot thông tin giao hàng tại thời điểm đặt
    @Column(name = "shipping_address", nullable = false, columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "receiver_name", nullable = false, length = 100)
    private String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 20)
    private String receiverPhone;

    @Column(name = "note", length = 500)
    private String note;

    // Mã đại diện cho một lần checkout.
    // Gửi lại cùng mã sẽ trả đơn đã tạo, không tạo đơn mới.
    @Column(name = "checkout_key", length = 36)
    private String checkoutKey;

    // Snapshot tiền hàng tại thời điểm đặt.
    @Column(name = "subtotal_amount", precision = 15, scale = 2)
    private BigDecimal subtotalAmount;

    // Snapshot phí giao hàng tại thời điểm đặt.
    @Column(name = "shipping_fee", precision = 15, scale = 2)
    private BigDecimal shippingFee;

    // Quan hệ 1 Order có nhiều OrderItem con
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}

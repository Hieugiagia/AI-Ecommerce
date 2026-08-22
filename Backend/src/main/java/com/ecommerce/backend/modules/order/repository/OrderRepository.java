package com.ecommerce.backend.modules.order.repository;

import com.ecommerce.backend.modules.order.entity.Order;
import com.ecommerce.backend.modules.order.entity.OrderItem;
import com.ecommerce.backend.modules.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderCode(String orderCode);
    //lay lich su mua hang cua user (co phan trang)
    Page<Order> findByUserId(Long userId, Pageable pageable);
    //loc danh sach don hang cho admin theo trang thai
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
}

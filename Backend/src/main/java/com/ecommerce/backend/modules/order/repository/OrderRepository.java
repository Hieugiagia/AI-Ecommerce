package com.ecommerce.backend.modules.order.repository;

import com.ecommerce.backend.modules.order.entity.Order;
import com.ecommerce.backend.modules.order.entity.OrderItem;
import com.ecommerce.backend.modules.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Optional<Order> findByOrderCode(String orderCode);
    //lay lich su mua hang cua user (co phan trang)
    Page<Order> findByUserId(Long userId, Pageable pageable);
    //loc danh sach don hang cho admin theo trang thai
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    Optional<Order> findByUserIdAndCheckoutKey(Long userId, String checkoutKey);

    Optional<Order> findByOrderCodeAndUserId(String orderCode, Long userId);

    Page<Order> findByUserIdAndStatus(Long userId, OrderStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select o
        from Order o
        where o.orderCode = :orderCode
          and o.user.id = :userId
        """)
    Optional<Order> findOwnedOrderForUpdate(@Param("orderCode") String orderCode, @Param("userId") Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        select o
        from Order o
        where o.orderCode = :orderCode
        """)
    Optional<Order> findByOrderCodeForUpdate(@Param("orderCode") String orderCode);
}

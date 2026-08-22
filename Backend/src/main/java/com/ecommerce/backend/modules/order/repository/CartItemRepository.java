package com.ecommerce.backend.modules.order.repository;

import com.ecommerce.backend.modules.order.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    // lay toan bo gio hang cua 1 user
    List<CartItem> findByUserId(Long userId);
    //tim xem user da them mon nay vao trc do chua
    Optional<CartItem> findByUserIdAndProductId(Long userId, Long productId);
    //xoa sach gio sau khi dat hang thanh cong
    void deleteByUserId(Long userId);

}

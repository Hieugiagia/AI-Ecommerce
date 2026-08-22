package com.ecommerce.backend.modules.payment.repository;

import com.ecommerce.backend.modules.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    //tim thong tin thanh toan theo ma don hang
    Optional<Payment> findByOrderId(Long orderId);

    //dung khi webhook / ipn cua VNPay goi ve de tra cuu theo ma giao dich
    Optional<Payment> findByTransactionCode(String transactionCode);
}

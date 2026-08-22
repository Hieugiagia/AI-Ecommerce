package com.ecommerce.backend.modules.payment.entity;

public enum PaymentStatus {
    PENDING,     // Chờ thanh toán
    SUCCESS,     // Thanh toán thành công
    FAILED,      // Giao dịch thất bại
    REFUNDED     // Đã hoàn tiền
}

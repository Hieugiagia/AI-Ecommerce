package com.ecommerce.backend.modules.order.entity;

public enum OrderStatus {
    PENDING,       // Chờ xác nhận / Chờ thanh toán
    CONFIRMED,     // Đã xác nhận đơn
    PROCESSING,    // Đang đóng gói
    SHIPPED,       // Đang giao hàng
    DELIVERED,     // Giao thành công
    CANCELLED      // Đã hủy
}

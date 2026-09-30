import { apiRequest } from './api';

/**
 * Order Service
 * Khớp chuẩn 100% với Router /orders của Backend:
 * - POST  /orders/checkout            : Đặt hàng từ giỏ
 * - GET   /orders/my-orders           : Xem danh sách đơn đã mua của khách hàng
 * - GET   /orders/{orderCode}         : Xem chi tiết 1 đơn hàng
 * - POST  /orders/{orderCode}/cancel  : Hủy 1 đơn hàng
 * - PATCH /orders/{orderCode}/status  : Cập nhật trạng thái đơn hàng (Admin)
 * - GET   /orders                     : Xem toàn bộ đơn hàng hệ thống (Admin)
 */

export const orderService = {
  /**
   * Đặt hàng từ giỏ hàng hiện tại
   * POST /orders/checkout
   * @param {Object} checkoutData
   */
  async checkout(checkoutData) {
    return await apiRequest('/orders/checkout', {
      method: 'POST',
      body: checkoutData,
    });
  },

  /**
   * Lấy danh sách đơn hàng của tôi
   * GET /orders/my-orders
   */
  async getMyOrders() {
    return await apiRequest('/orders/my-orders', {
      method: 'GET',
    });
  },

  /**
   * Xem chi tiết 1 đơn hàng theo mã đơn
   * GET /orders/{orderCode}
   * @param {string} orderCode
   */
  async getOrderByCode(orderCode) {
    return await apiRequest(`/orders/${orderCode}`, {
      method: 'GET',
    });
  },

  /**
   * Hủy 1 đơn hàng
   * POST /orders/{orderCode}/cancel
   * @param {string} orderCode
   * @param {string} reason
   */
  async cancelOrder(orderCode, reason = '') {
    return await apiRequest(`/orders/${orderCode}/cancel`, {
      method: 'POST',
      body: { reason },
    });
  },

  /**
   * Cập nhật trạng thái của đơn hàng (Dành cho Admin)
   * PATCH /orders/{orderCode}/status
   * @param {string} orderCode
   * @param {string} status - 'pending' | 'processing' | 'shipping' | 'delivered' | 'cancelled'
   */
  async updateOrderStatus(orderCode, status) {
    return await apiRequest(`/orders/${orderCode}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  /**
   * Lấy toàn bộ đơn hàng (Dành cho Admin)
   * GET /orders
   */
  async getAllOrders() {
    return await apiRequest('/orders', {
      method: 'GET',
    });
  },
};

export default orderService;

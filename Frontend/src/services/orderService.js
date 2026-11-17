import { apiRequest } from './api';
import { checkoutPayload, normalizeCheckout } from './checkoutModel';
import { normalizeOrder, normalizeOrderList, orderListQuery, cancellationReason } from './orderModel';

/**
 * Order Service
 * API đơn hàng khách hàng và quản trị:
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
    const payload = checkoutPayload(checkoutData.checkoutKey, checkoutData.expectedTotal, checkoutData.shippingInfo);
    const data = await apiRequest('/orders/checkout', {
      method: 'POST',
      body: payload,
    });
    return normalizeCheckout(data);
  },

  /**
   * Lấy danh sách đơn hàng của tôi
   * GET /orders/my-orders
   */
  async getMyOrders(params = {}) {
    const query = orderListQuery(params);
    const data = await apiRequest('/orders/my-orders?' + query, { method: 'GET' });
    return normalizeOrderList(data);
  },

  /**
   * Xem chi tiết 1 đơn hàng theo mã đơn
   * GET /orders/{orderCode}
   * @param {string} orderCode
   */
  async getOrderByCode(orderCode) {
    const data = await apiRequest(`/orders/${encodeURIComponent(orderCode)}`, { method: 'GET' });
    return normalizeOrder(data);
  },

  /**
   * Hủy 1 đơn hàng
   * POST /orders/{orderCode}/cancel
   * @param {string} orderCode
   * @param {string} reason
   */
  async cancelOrder(orderCode, reason = '') {
    const data = await apiRequest(`/orders/${encodeURIComponent(orderCode)}/cancel`, {
      method: 'POST',
      body: { reason: cancellationReason(reason) },
    });
    const order = normalizeOrder(data);
    if (order.status !== 'CANCELLED') throw new Error('Máy chủ chưa xác nhận hủy đơn. Vui lòng tải lại để kiểm tra.');
    return order;
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

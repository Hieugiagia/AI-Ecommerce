import { apiRequest } from './api';
import { checkoutPayload, normalizeCheckout } from './checkoutModel';
import { normalizeOrder, normalizeOrderList, orderListQuery, cancellationReason, normalizeAdminOrder, normalizeAdminOrderList, adminOrderListQuery, adminStatusPayload } from './orderModel';

/**
 * Order Service
 * API đơn hàng khách hàng và quản trị:
 * - POST  /orders/checkout            : Đặt hàng từ giỏ
 * - GET   /orders/my-orders           : Xem danh sách đơn đã mua của khách hàng
 * - GET   /orders/{orderCode}         : Xem chi tiết 1 đơn hàng
 * - POST  /orders/{orderCode}/cancel  : Hủy 1 đơn hàng
 * - PATCH /admin/orders/{orderCode}/status  : Cập nhật trạng thái đơn hàng (Admin)
 * - GET   /admin/orders               : Xem toàn bộ đơn hàng hệ thống (Admin)
 */

export const orderService = {
  /**
   * Đặt hàng từ giỏ hàng hiện tại
   * POST /orders/checkout
   * @param {Object} checkoutData
   */
  async checkout(checkoutData) {
    const payload = checkoutPayload(checkoutData.checkoutKey, checkoutData.expectedTotal, checkoutData.shippingInfo, checkoutData.paymentMethod);
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

  async getAllOrders(params = {}) {
    const query = adminOrderListQuery(params);
    const data = await apiRequest('/admin/orders?' + query, { method: 'GET' });
    return normalizeAdminOrderList(data);
  },

  async getAdminOrderByCode(orderCode) {
    const data = await apiRequest(`/admin/orders/${encodeURIComponent(orderCode)}`, { method: 'GET' });
    return normalizeAdminOrder(data);
  },

  async updateOrderStatus(orderCode, request) {
    const payload = adminStatusPayload(request);
    const data = await apiRequest(`/admin/orders/${encodeURIComponent(orderCode)}/status`, {
      method: 'PATCH',
      body: payload,
    });
    const confirmed = normalizeAdminOrder(data);
    if (confirmed.order.status !== payload.status
        || (payload.status === 'DELIVERED' && confirmed.order.paymentStatus !== 'SUCCESS')) {
      throw new Error('Chưa nhận được xác nhận trạng thái phù hợp. Vui lòng tải lại đơn để kiểm tra.');
    }
    return confirmed;
  },

};

export default orderService;

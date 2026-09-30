import { apiRequest } from './api';

/**
 * Payment Service
 * Khớp chuẩn 100% với Router /payments của Backend:
 * - POST /payments/process : Giả lập xử lý thanh toán
 */

export const paymentService = {
  /**
   * Giả lập xử lý thanh toán
   * POST /payments/process
   * @param {Object} paymentData - { orderCode, amount, paymentMethod, paymentDetails }
   */
  async processPayment(paymentData) {
    return await apiRequest('/payments/process', {
      method: 'POST',
      body: paymentData,
    });
  },
};

export default paymentService;

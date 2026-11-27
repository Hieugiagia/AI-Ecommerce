import { apiRequest } from './api';
import { normalizePaymentMethods, normalizePayment, momoPayUrl } from './paymentModel';

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 40000);
  try { return await apiRequest(path, { ...options, signal: controller.signal }); }
  catch (error) {
    if (error.name === 'AbortError') throw new Error('Chưa nhận được kết quả thanh toán. Hãy kiểm tra lại cùng đơn hàng.');
    throw error;
  } finally { clearTimeout(timer); }
}

export const paymentService = {
  async methods() { return normalizePaymentMethods(await request('/payments/methods')); },
  async status(orderCode) {
    return normalizePayment(await request('/payments/momo/' + encodeURIComponent(orderCode)), orderCode);
  },
  async start(orderCode) {
    const data = await request('/payments/momo/' + encodeURIComponent(orderCode), { method: 'POST' });
    const payment = normalizePayment(data, orderCode);
    return { ...payment, payUrl: payment.status === 'PENDING' ? momoPayUrl(data.payUrl) : null };
  },
  async refresh(orderCode) {
    return normalizePayment(await request('/payments/momo/' + encodeURIComponent(orderCode) + '/refresh', { method: 'POST' }), orderCode);
  },
  async cancel(orderCode) {
    return normalizePayment(await request('/payments/momo/' + encodeURIComponent(orderCode) + '/cancel', { method: 'POST' }), orderCode);
  },
};
export default paymentService;

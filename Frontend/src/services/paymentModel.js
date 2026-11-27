export function normalizePaymentMethods(data) {
  if (!data || !Array.isArray(data.methods)) throw new Error('Chưa đọc được phương thức thanh toán.');
  const momo = data.methods.find(row => row.code === 'MOMO');
  return { momoEnabled: momo?.enabled === true && momo.environment === 'sandbox', environment: 'sandbox' };
}

export function normalizePayment(data, orderCode) {
  if (!data || data.orderCode !== orderCode || data.paymentMethod !== 'MOMO'
    || !['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'].includes(data.status)
    || data.amount == null || data.amount === '' || !Number.isSafeInteger(Number(data.amount)) || Number(data.amount) < 1
    || data.environment !== 'sandbox') throw new Error('Chưa xác minh được thông tin thanh toán của đơn hàng.');
  return { ...data, amount: Number(data.amount) };
}

export function momoPayUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('Đường dẫn thanh toán MoMo không hợp lệ.'); }
  if (url.protocol !== 'https:' || url.hostname !== 'test-payment.momo.vn' || url.port || url.username || url.password)
    throw new Error('Đường dẫn thanh toán không thuộc MoMo Sandbox.');
  return url.href;
}

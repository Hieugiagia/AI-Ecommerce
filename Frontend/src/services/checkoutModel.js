const keyPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const fields = { fullName: 100, phone: 16, province: 100, district: 100, address: 500, notes: 500 };

export function checkoutStorageKey(account) {
  return 'ai_ecommerce_checkout:' + account;
}

export function checkoutPayload(checkoutKey, expectedTotal, form, paymentMethod = 'COD') {
  if (!['COD', 'MOMO'].includes(paymentMethod)) throw new Error('Phương thức thanh toán chưa được hỗ trợ.');
  if (!keyPattern.test(checkoutKey)) throw new Error('Mã đặt hàng không hợp lệ.');
  if (expectedTotal === null || expectedTotal === '' || !Number.isFinite(Number(expectedTotal)) || Number(expectedTotal) < 0) {
    throw new Error('Tổng tiền không hợp lệ. Vui lòng tải lại giỏ hàng.');
  }
  const shippingInfo = {};
  for (const [field, maxLength] of Object.entries(fields)) {
    const value = String(form[field] ?? '').trim();
    if ((field !== 'notes' && !value) || value.length > maxLength) {
      throw new Error('Vui lòng điền đầy đủ thông tin nhận hàng và kiểm tra độ dài.');
    }
    shippingInfo[field] = value;
  }
  if (!/^\+?[0-9]{8,15}$/.test(shippingInfo.phone)) {
    throw new Error('Số điện thoại gồm 8–15 chữ số, có thể bắt đầu bằng +.');
  }
  return { checkoutKey, paymentMethod, expectedTotal: Number(expectedTotal), shippingInfo };
}

export function readCheckoutAttempt(storage, account) {
  if (!account) return null;
  try {
    const raw = JSON.parse(storage.getItem(checkoutStorageKey(account)) || 'null');
    if (!raw || !['COD', 'MOMO'].includes(raw.paymentMethod)) return null;
    return checkoutPayload(raw.checkoutKey, raw.expectedTotal, raw.shippingInfo, raw.paymentMethod);
  } catch {
    return null;
  }
}

export function saveCheckoutAttempt(storage, account, payload) {
  const validated = checkoutPayload(payload.checkoutKey, payload.expectedTotal, payload.shippingInfo, payload.paymentMethod);
  storage.setItem(checkoutStorageKey(account), JSON.stringify(validated));
  return validated;
}

export function checkoutRejected(error) {
  // Explicit client/business rejections mean this request did not create an order.
  // A timeout, network error, server error or malformed success remains uncertain.
  return [400, 401, 403, 404, 409, 422].includes(error.status);
}

export function normalizeCheckout(data) {
  if (!data || !Number.isInteger(data.id) || typeof data.orderCode !== 'string' || !data.orderCode
      || !Array.isArray(data.items) || !data.items.length || !['COD', 'MOMO'].includes(data.paymentMethod)) {
    throw new Error('Chưa đọc được xác nhận đơn hàng. Vui lòng kiểm tra lại kết quả.');
  }
  const result = { ...data };
  for (const key of ['subtotal', 'shippingFee', 'total']) {
    if (data[key] === null || data[key] === undefined || data[key] === '' || !Number.isFinite(Number(data[key])) || Number(data[key]) < 0) {
      throw new Error('Thông tin số tiền đơn hàng không hợp lệ. Vui lòng kiểm tra lại kết quả.');
    }
    result[key] = Number(data[key]);
  }
  result.items = data.items.map((item) => {
    if (!Number.isInteger(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1
        || item.priceAtPurchase == null || item.subtotal == null
        || !Number.isFinite(Number(item.priceAtPurchase)) || Number(item.priceAtPurchase) < 0
        || !Number.isFinite(Number(item.subtotal)) || Number(item.subtotal) < 0) {
      throw new Error('Chi tiết xác nhận đơn hàng không hợp lệ.');
    }
    return { ...item, priceAtPurchase: Number(item.priceAtPurchase), subtotal: Number(item.subtotal) };
  });
  if (Math.round(result.total * 100) !== Math.round((result.subtotal + result.shippingFee) * 100)
      || Math.round(result.subtotal * 100) !== Math.round(result.items.reduce((sum, item) => sum + item.subtotal, 0) * 100)) {
    throw new Error('Số tiền xác nhận không khớp. Vui lòng kiểm tra lại kết quả.');
  }
  return result;
}

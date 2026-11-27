import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePaymentMethods, normalizePayment, momoPayUrl } from '../src/services/paymentModel.js';
import { checkoutPayload, readCheckoutAttempt, saveCheckoutAttempt, normalizeCheckout } from '../src/services/checkoutModel.js';
import { normalizeAdminOrder, adminStatusPayload } from '../src/services/orderModel.js';

const code = 'ORD-ABC123';
const payment = { orderCode: code, paymentMethod: 'MOMO', amount: '1000000', status: 'PENDING', environment: 'sandbox' };
test('MoMo requires explicit sandbox capability; unavailable gateways stay disabled', () => {
  for (const methods of [[], [{ code: 'MOMO', enabled: false, environment: 'sandbox' }], [{ code: 'MOMO', enabled: true, environment: 'production' }]])
    assert.equal(normalizePaymentMethods({ methods }).momoEnabled, false);
  assert.equal(normalizePaymentMethods({ methods: [{ code: 'MOMO', enabled: true, environment: 'sandbox' }] }).momoEnabled, true);
  assert.throws(() => normalizePaymentMethods({}));
});
test('checkout retry retains the chosen method and original checkout key', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const payload = checkoutPayload('6d580e69-25d6-4615-a2c9-843a0f94db01', 1000000,
    { fullName: 'Test', phone: '0901234567', province: 'City', district: 'Ward', address: 'Street', notes: '' }, 'MOMO');
  saveCheckoutAttempt(storage, 'A', payload);
  assert.deepEqual(readCheckoutAttempt(storage, 'A'), payload);
  assert.equal(readCheckoutAttempt(storage, 'B'), null);
  assert.throws(() => checkoutPayload(payload.checkoutKey, 1, payload.shippingInfo, 'VNPAY'));
  assert.equal(normalizeCheckout({ id: 1, orderCode: code, paymentMethod: 'MOMO', subtotal: 1000000, shippingFee: 0, total: 1000000,
    items: [{ productId: 1, quantity: 1, priceAtPurchase: 1000000, subtotal: 1000000 }] }).paymentMethod, 'MOMO');
});
test('payment response must match order, amount, provider and environment', () => {
  assert.equal(normalizePayment(payment, code).amount, 1000000);
  for (const changes of [{ orderCode: 'OTHER' }, { status: 'PAID' }, { amount: null }, { amount: 1.1 }, { environment: 'production' }, { paymentMethod: 'COD' }])
    assert.throws(() => normalizePayment({ ...payment, ...changes }, code));
});
test('redirect allows only the exact HTTPS MoMo sandbox host', () => {
  assert.equal(momoPayUrl('https://test-payment.momo.vn/v2/gateway/pay?t=abc'), 'https://test-payment.momo.vn/v2/gateway/pay?t=abc');
  for (const url of ['javascript:alert(1)', 'http://test-payment.momo.vn/pay', 'https://test-payment.momo.vn.evil.com/pay',
    'https://test-payment.momo.vn@evil.com', 'https://evil.com', 'https://user@test-payment.momo.vn/pay', 'https://test-payment.momo.vn:444/pay']) assert.throws(() => momoPayUrl(url));
});
test('paid MoMo can advance only when approved by server, without COD collection', () => {
  const order = { id: 1, orderCode: code, status: 'SHIPPED', total: 1000000, paymentMethod: 'MOMO', paymentStatus: 'SUCCESS', items: [] };
  const entry = { customerId: 1, order, allowedNextStatuses: ['DELIVERED'] };
  assert.deepEqual(normalizeAdminOrder(entry).allowedNextStatuses, ['DELIVERED']);
  assert.deepEqual(normalizeAdminOrder({ ...entry, order: { ...order, paymentStatus: 'PENDING' } }).allowedNextStatuses, []);
  assert.deepEqual(normalizeAdminOrder({ ...entry, allowedNextStatuses: [] }).allowedNextStatuses, []);
  assert.deepEqual(adminStatusPayload({ expectedStatus: 'SHIPPED', status: 'DELIVERED', paymentMethod: 'MOMO' }), { expectedStatus: 'SHIPPED', status: 'DELIVERED', codCollected: false });
  assert.throws(() => adminStatusPayload({ expectedStatus: 'SHIPPED', status: 'DELIVERED', paymentMethod: 'MOMO', codCollected: true }));
});

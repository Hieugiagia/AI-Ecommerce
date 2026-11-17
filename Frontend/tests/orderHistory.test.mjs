import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ORDER_STATUSES, normalizeOrder, normalizeOrderList, orderListQuery, cancellationReason } from '../src/services/orderModel.js';

const pending = {
  id: 12, orderCode: 'ORD-TEST', status: 'PENDING', createdAt: '2026-11-17T12:00:00',
  subtotal: '100000.00', shippingFee: '30000.00', total: '130000.00',
  receiverName: 'Original receiver', receiverPhone: '0901234567', shippingAddress: 'Original address',
  note: '', cancelReason: null, cancelledAt: null, paymentMethod: 'COD', paymentStatus: 'PENDING', canCancel: true,
  items: [{ productId: 4, name: 'Name at purchase', price: '100000.00', quantity: 1, lineTotal: '100000.00' }],
};
const cancelled = { ...pending, status: 'CANCELLED', paymentStatus: 'CANCELLED', canCancel: false, cancelReason: 'Original reason', cancelledAt: '2026-11-17T13:00:00' };
let importCount = 0;
async function service(api) {
  globalThis.__orderHistoryTestApi = api;
  let source = (await readFile(new URL('../src/services/orderService.js', import.meta.url), 'utf8'))
    .replace("import { apiRequest } from './api';", 'const apiRequest = globalThis.__orderHistoryTestApi;');
  for (const name of ['checkoutModel', 'orderModel']) {
    source = source.replace("from './" + name + "'", 'from ' + JSON.stringify(new URL('../src/services/' + name + '.js', import.meta.url).href));
  }
  return (await import('data:text/javascript;base64,' + Buffer.from(source + '\n// ' + (++importCount)).toString('base64'))).orderService;
}
test('purchase-time names, prices, receiver and monetary zero survive normalization', () => {
  const order = normalizeOrder(pending);
  assert.equal(order.items[0].name, 'Name at purchase');
  assert.equal(order.items[0].price, 100000);
  assert.equal(order.receiverName, 'Original receiver');
  assert.equal(order.shippingAddress, 'Original address');
  assert.equal(normalizeOrder({ ...pending, total: 0, subtotal: 0, shippingFee: 0 }).total, 0);
  assert.equal(normalizeOrder({ ...pending, shippingFee: null }).shippingFee, null);
});
test('cancel permission requires explicit server permission and eligible COD state', () => {
  assert.equal(normalizeOrder(pending).canCancel, true);
  for (const patch of [{ canCancel: false }, { canCancel: 'true' }, { status: 'CONFIRMED' }, { paymentMethod: 'MOMO' }, { paymentStatus: 'SUCCESS' }, { status: 'CANCELLED' }]) {
    assert.equal(normalizeOrder({ ...pending, ...patch }).canCancel, false);
  }
});
test('all six canonical states produce exact server-side filters', () => {
  for (const status of Object.keys(ORDER_STATUSES)) {
    const params = new URLSearchParams(orderListQuery({ page: 2, limit: 5, status }));
    assert.equal(params.get('status'), status);
    assert.equal(params.get('page'), '2');
  }
  assert.equal(new URLSearchParams(orderListQuery()).has('status'), false);
  assert.throws(() => orderListQuery({ page: 0 }));
  assert.throws(() => orderListQuery({ limit: 51 }));
  assert.throws(() => orderListQuery({ status: 'INVALID' }));
});
test('empty response stays empty and pagination uses server totals', async () => {
  let path;
  const orders = await service(async (endpoint) => { path = endpoint; return { orders: [], total: 25, page: 4, limit: 10, totalPages: 3 }; });
  const result = await orders.getMyOrders({ page: 4, status: 'CANCELLED' });
  assert.deepEqual(result.orders, []);
  assert.equal(result.total, 25);
  assert.equal(result.totalPages, 3);
  assert.equal(new URLSearchParams(path.split('?')[1]).get('status'), 'CANCELLED');
  assert.deepEqual(normalizeOrderList({ orders: [], total: 0, page: 1, limit: 10, totalPages: 0 }).orders, []);
});
test('detail encodes order code and returns server data', async () => {
  let path;
  const orders = await service(async (endpoint) => { path = endpoint; return pending; });
  const result = await orders.getOrderByCode('ORD /#test');
  assert.equal(path, '/orders/ORD%20%2F%23test');
  assert.equal(result.orderCode, pending.orderCode);
});
test('cancellation validates reason before transport and uses server cancellation result', async () => {
  const calls = [];
  const orders = await service(async (path, options) => { calls.push({ path, options }); return cancelled; });
  await assert.rejects(orders.cancelOrder('ORD-TEST', '   '));
  assert.equal(calls.length, 0);
  assert.throws(() => cancellationReason('x'.repeat(501)));
  const first = await orders.cancelOrder('ORD-TEST', ' Reason ');
  const second = await orders.cancelOrder('ORD-TEST', 'Another reason');
  assert.deepEqual(calls[0].options.body, { reason: 'Reason' });
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].path, '/orders/ORD-TEST/cancel');
  assert.equal(first.status, 'CANCELLED');
  assert.equal(second.cancelReason, 'Original reason');
});
test('401, 404, 409 and network errors are never replaced by cached orders', async () => {
  for (const status of [401, 404, 409, undefined]) {
    const failure = Object.assign(new Error('API failed'), { status });
    const orders = await service(async () => { throw failure; });
    await assert.rejects(orders.getMyOrders(), (error) => error === failure);
    await assert.rejects(orders.getOrderByCode('ORD-TEST'), (error) => error === failure);
    await assert.rejects(orders.cancelOrder('ORD-TEST', 'Reason'), (error) => error === failure);
  }
});
test('malformed success and unconfirmed cancellation are rejected', async () => {
  assert.throws(() => normalizeOrder({ ...pending, total: null }));
  assert.throws(() => normalizeOrderList({ orders: [] }));
  const orders = await service(async () => pending);
  await assert.rejects(orders.cancelOrder('ORD-TEST', 'Reason'));
});

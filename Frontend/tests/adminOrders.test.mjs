import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { normalizeAdminOrder, normalizeAdminOrderList, adminOrderListQuery, adminStatusPayload } from '../src/services/orderModel.js';

const pending = {
  id: 9, orderCode: 'ORD-ADMIN-TEST', status: 'PENDING', createdAt: '2026-11-17T10:00:00',
  subtotal: '500000.00', shippingFee: '0.00', total: '500000.00', receiverName: 'Receiver',
  receiverPhone: '0901234567', shippingAddress: 'Address at purchase', note: null, cancelReason: null, cancelledAt: null,
  paymentMethod: 'COD', paymentStatus: 'PENDING', canCancel: true,
  items: [{ productId: 4, name: 'Product at purchase', quantity: 1, price: '500000.00', lineTotal: '500000.00' }],
};
const entry = { order: pending, customerId: 3, customerName: 'Account name', customerEmail: 'customer@example.com', updatedAt: null, allowedNextStatuses: ['CONFIRMED'] };
const delivered = { ...entry, order: { ...pending, status: 'DELIVERED', paymentStatus: 'SUCCESS', canCancel: false }, allowedNextStatuses: [] };

let imports = 0;
async function service(api) {
  globalThis.__adminOrderTestApi = api;
  let source = (await readFile(new URL('../src/services/orderService.js', import.meta.url), 'utf8'))
    .replace("import { apiRequest } from './api';", 'const apiRequest = globalThis.__adminOrderTestApi;');
  for (const name of ['checkoutModel', 'orderModel']) {
    source = source.replace("from './" + name + "'", 'from ' + JSON.stringify(new URL('../src/services/' + name + '.js', import.meta.url).href));
  }
  return (await import('data:text/javascript;base64,' + Buffer.from(source + '\n// ' + (++imports)).toString('base64'))).orderService;
}

test('admin list uses correct endpoint, search, status and pagination', async () => {
  let path;
  const orders = await service(async (endpoint) => { path = endpoint; return { orders: [entry], total: 23, page: 2, limit: 10, totalPages: 3 }; });
  const result = await orders.getAllOrders({ page: 2, status: 'PENDING', q: ' customer@example.com ', userId: 999 });
  assert.equal(path.split('?')[0], '/admin/orders');
  const params = new URLSearchParams(path.split('?')[1]);
  assert.equal(params.get('q'), 'customer@example.com');
  assert.equal(params.get('page'), '2');
  assert.equal(params.get('status'), 'PENDING');
  assert.equal(params.has('userId'), false);
  assert.equal(result.total, 23);
  assert.equal(result.orders[0].order.total, 500000);
});

test('admin detail URL-encodes the order code and preserves snapshot/contact fields', async () => {
  let path;
  const orders = await service(async (endpoint) => { path = endpoint; return entry; });
  const result = await orders.getAdminOrderByCode('ORD /#test');
  assert.equal(path, '/admin/orders/ORD%20%2F%23test');
  assert.equal(result.customerName, 'Account name');
  assert.equal(result.order.receiverName, 'Receiver');
  assert.equal(result.order.items[0].name, 'Product at purchase');
  assert.equal(result.order.shippingFee, 0);
});

test('only the server-approved immediate next status becomes an action', () => {
  assert.deepEqual(normalizeAdminOrder(entry).allowedNextStatuses, ['CONFIRMED']);
  assert.deepEqual(normalizeAdminOrder({ ...entry, allowedNextStatuses: [] }).allowedNextStatuses, []);
  assert.deepEqual(normalizeAdminOrder({ ...entry, allowedNextStatuses: ['SHIPPED', 'CANCELLED'] }).allowedNextStatuses, []);
  assert.deepEqual(normalizeAdminOrder({ ...entry, order: { ...pending, paymentStatus: 'SUCCESS' } }).allowedNextStatuses, []);
  assert.deepEqual(normalizeAdminOrder({ ...entry, order: { ...pending, paymentMethod: 'MOMO' } }).allowedNextStatuses, []);
  assert.deepEqual(normalizeAdminOrder({ ...entry, order: { ...pending, status: 'CANCELLED' } }).allowedNextStatuses, []);
  assert.deepEqual(normalizeAdminOrder(delivered).allowedNextStatuses, []);
});

test('all four transitions are allowed, jumps and terminal transitions are rejected', () => {
  for (const [expectedStatus, status] of [['PENDING', 'CONFIRMED'], ['CONFIRMED', 'PROCESSING'], ['PROCESSING', 'SHIPPED'], ['SHIPPED', 'DELIVERED']]) {
    const payload = adminStatusPayload({ expectedStatus, status, codCollected: status === 'DELIVERED' });
    assert.equal(payload.expectedStatus, expectedStatus);
    assert.equal(payload.status, status);
  }
  for (const request of [{ expectedStatus: 'PENDING', status: 'SHIPPED' }, { expectedStatus: 'DELIVERED', status: 'PROCESSING' }, { expectedStatus: 'CANCELLED', status: 'CONFIRMED' }]) {
    assert.throws(() => adminStatusPayload(request));
  }
});

test('delivery requires explicit COD confirmation before making any request', async () => {
  let calls = 0;
  const orders = await service(async () => { calls++; return delivered; });
  await assert.rejects(orders.updateOrderStatus('ORD', { expectedStatus: 'SHIPPED', status: 'DELIVERED' }));
  await assert.rejects(orders.updateOrderStatus('ORD', { expectedStatus: 'SHIPPED', status: 'DELIVERED', codCollected: 'true' }));
  assert.equal(calls, 0);
  assert.throws(() => adminStatusPayload({ expectedStatus: 'PENDING', status: 'CONFIRMED', codCollected: true }));
});

test('status update sends exact DTO and validates paid delivery from server', async () => {
  let sent;
  const orders = await service(async (path, options) => { sent = { path, ...options }; return delivered; });
  const result = await orders.updateOrderStatus('ORD /#test', { expectedStatus: 'SHIPPED', status: 'DELIVERED', codCollected: true, total: 1, paidAt: 'forged' });
  assert.equal(sent.path, '/admin/orders/ORD%20%2F%23test/status');
  assert.equal(sent.method, 'PATCH');
  assert.deepEqual(sent.body, { expectedStatus: 'SHIPPED', status: 'DELIVERED', codCollected: true });
  assert.equal(result.order.paymentStatus, 'SUCCESS');
  const unconfirmed = await service(async () => ({ ...delivered, order: { ...delivered.order, paymentStatus: 'PENDING' } }));
  await assert.rejects(unconfirmed.updateOrderStatus('ORD', { expectedStatus: 'SHIPPED', status: 'DELIVERED', codCollected: true }));
});

test('lost response is retried with the same step, not the next step', async () => {
  const requests = [];
  let completed = false, charged = 0, dropResponse = true;
  const orders = await service(async (_path, { body }) => {
    requests.push(body);
    if (!completed) { completed = true; charged++; }
    if (dropResponse) { dropResponse = false; throw new TypeError('Failed to fetch'); }
    return delivered;
  });
  const request = { expectedStatus: 'SHIPPED', status: 'DELIVERED', codCollected: true };
  await assert.rejects(orders.updateOrderStatus('ORD', request));
  await orders.updateOrderStatus('ORD', request);
  assert.equal(charged, 1);
  assert.deepEqual(requests, [request, request]);
});

test('permission, stale-state and network errors propagate without fake success', async () => {
  for (const status of [401, 403, 404, 409, undefined]) {
    const failure = Object.assign(new Error('API error'), { status });
    const orders = await service(async () => { throw failure; });
    await assert.rejects(orders.getAllOrders(), (error) => error === failure);
    await assert.rejects(orders.getAdminOrderByCode('ORD'), (error) => error === failure);
    await assert.rejects(orders.updateOrderStatus('ORD', { expectedStatus: 'PENDING', status: 'CONFIRMED' }), (error) => error === failure);
  }
});

test('empty results stay empty; malformed responses and filters are rejected', () => {
  assert.deepEqual(normalizeAdminOrderList({ orders: [], total: 0, page: 1, limit: 10, totalPages: 0 }).orders, []);
  assert.throws(() => normalizeAdminOrderList({ orders: [] }));
  assert.throws(() => normalizeAdminOrder({ ...entry, allowedNextStatuses: null }));
  assert.throws(() => adminOrderListQuery({ page: 0 }));
  assert.throws(() => adminOrderListQuery({ status: 'invalid' }));
});

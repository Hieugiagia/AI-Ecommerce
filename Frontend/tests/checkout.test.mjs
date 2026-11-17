import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { checkoutPayload, normalizeCheckout, checkoutRejected, checkoutStorageKey, readCheckoutAttempt, saveCheckoutAttempt } from '../src/services/checkoutModel.js';

const key = '6d580e69-25d6-4615-a2c9-843a0f94db01';
const shipping = { fullName: ' Test User ', phone: '0901234567', province: 'City', district: 'District', address: '123 Street', notes: '' };
const response = {
  id: 7, orderCode: 'ORD-TEST', status: 'PENDING', paymentMethod: 'COD',
  subtotal: '500000.00', shippingFee: '0.00', total: '500000.00',
  items: [{ productId: 4, productName: 'Test phone', quantity: 1, priceAtPurchase: '500000.00', subtotal: '500000.00' }],
};
function storage() {
  const values = new Map();
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: (key) => values.delete(key) };
}
let count = 0;
async function service(api) {
  globalThis.__checkoutTestApi = api;
  const modelUrl = new URL('../src/services/checkoutModel.js', import.meta.url).href;
  const source = (await readFile(new URL('../src/services/orderService.js', import.meta.url), 'utf8'))
    .replace("import { apiRequest } from './api';", 'const apiRequest = globalThis.__checkoutTestApi;')
    .replace("from './checkoutModel'", 'from ' + JSON.stringify(modelUrl))
    .replace("from './orderModel'", 'from ' + JSON.stringify(new URL('../src/services/orderModel.js', import.meta.url).href));
  return (await import('data:text/javascript;base64,' + Buffer.from(source + '\n// ' + (++count)).toString('base64'))).orderService;
}
test('only supported COD fields are sent, preserving the checkout key', async () => {
  let sent;
  const orders = await service(async (path, options) => { sent = { path, ...options }; return response; });
  await orders.checkout({ ...checkoutPayload(key, 500000, { ...shipping, email: 'ignored' }), items: [], userId: 999 });
  assert.equal(sent.path, '/orders/checkout');
  assert.equal(sent.method, 'POST');
  assert.deepEqual(Object.keys(sent.body).sort(), ['checkoutKey', 'expectedTotal', 'paymentMethod', 'shippingInfo']);
  assert.equal(sent.body.checkoutKey, key);
  assert.equal(sent.body.shippingInfo.fullName, 'Test User');
  assert.equal(sent.body.shippingInfo.email, undefined);
});
test('invalid form data never reaches the API', async () => {
  let requests = 0;
  const orders = await service(async () => { requests++; return response; });
  await assert.rejects(orders.checkout({ checkoutKey: key, expectedTotal: 500000, shippingInfo: { ...shipping, phone: 'bad' } }));
  assert.equal(requests, 0);
  assert.throws(() => checkoutPayload(key, -1, shipping));
  assert.throws(() => checkoutPayload('bad', 500000, shipping));
  assert.throws(() => checkoutPayload(key, 500000, { ...shipping, fullName: ' ' }));
});
test('pending attempt persists through reload and is isolated by account', () => {
  const store = storage(), payload = checkoutPayload(key, 500000, shipping);
  saveCheckoutAttempt(store, 'A', payload);
  assert.deepEqual(readCheckoutAttempt(store, 'A'), payload);
  assert.equal(readCheckoutAttempt(store, 'B'), null);
  store.removeItem(checkoutStorageKey('A'));
  assert.equal(readCheckoutAttempt(store, 'A'), null);
  store.setItem(checkoutStorageKey('A'), '{broken');
  assert.equal(readCheckoutAttempt(store, 'A'), null);
});
test('lost response then retry returns the same single order', async () => {
  const store = storage(), pending = saveCheckoutAttempt(store, 'A', checkoutPayload(key, 500000, shipping));
  const created = new Map(), sentKeys = [];
  let drop = true;
  const orders = await service(async (_path, { body }) => {
    sentKeys.push(body.checkoutKey);
    if (!created.has(body.checkoutKey)) created.set(body.checkoutKey, response);
    if (drop) { drop = false; throw new TypeError('Failed to fetch'); }
    return created.get(body.checkoutKey);
  });
  await assert.rejects(orders.checkout(pending), (error) => !checkoutRejected(error));
  const confirmed = await orders.checkout(readCheckoutAttempt(store, 'A'));
  assert.equal(confirmed.orderCode, 'ORD-TEST');
  assert.equal(created.size, 1);
  assert.deepEqual(sentKeys, [key, key]);
});
test('server failures remain uncertain; explicit business rejections can be released', () => {
  for (const status of [400, 401, 403, 404, 409, 422]) assert.equal(checkoutRejected({ status }), true);
  for (const status of [408, 429, 500, 502, 503, 504]) assert.equal(checkoutRejected({ status }), false);
  assert.equal(checkoutRejected(new TypeError('Failed to fetch')), false);
});
test('receipt uses server amounts and rejects malformed/inconsistent success', () => {
  assert.equal(normalizeCheckout(response).total, 500000);
  assert.throws(() => normalizeCheckout(null));
  assert.throws(() => normalizeCheckout({ ...response, items: [] }));
  assert.throws(() => normalizeCheckout({ ...response, total: null }));
  assert.throws(() => normalizeCheckout({ ...response, total: 1 }));
  assert.throws(() => normalizeCheckout({ ...response, items: [{ ...response.items[0], priceAtPurchase: null }] }));
});
test('API error metadata survives to the checkout handler', async () => {
  const conflict = Object.assign(new Error('Total changed'), { status: 409, data: { code: 4003 } });
  const orders = await service(async () => { throw conflict; });
  await assert.rejects(orders.checkout(checkoutPayload(key, 500000, shipping)), (error) => error === conflict);
});

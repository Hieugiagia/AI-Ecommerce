import test from 'node:test';
import assert from 'node:assert/strict';
import { collectedCod, orderActivity } from '../src/services/adminOverviewModel.js';

test('collected COD includes only confirmed successful COD receipts', () => {
  const entries = [
    { order: { paymentMethod: 'COD', paymentStatus: 'SUCCESS', total: 15030000 } },
    { order: { paymentMethod: 'COD', paymentStatus: 'PENDING', total: 90000000 } },
    { order: { paymentMethod: 'VNPAY', paymentStatus: 'SUCCESS', total: 70000000 } },
    { order: { paymentMethod: 'COD', paymentStatus: 'CANCELLED', total: 20000000 } },
  ];
  assert.equal(collectedCod(entries), 15030000);
  assert.equal(collectedCod([]), 0);
});

test('daily activity uses Vietnam current day and includes zero-order days', () => {
  const entries = ['2026-11-16T12:00:00','2026-11-17T00:01:00','2026-11-17T09:00:00','2026-11-01T09:00:00']
    .map(createdAt => ({ order: { createdAt } }));
  const buckets = orderActivity(entries, 3, new Date('2026-11-16T18:00:00Z'));
  assert.deepEqual(buckets.map(({key,count}) => ({key,count})), [
    {key:'2026-11-15',count:0},{key:'2026-11-16',count:1},{key:'2026-11-17',count:2},
  ]);
});

test('14-day activity crosses month boundary without changing loaded order scope', () => {
  const buckets = orderActivity([{order:{createdAt:'2026-10-31T15:00:00'}}],14,new Date('2026-11-05T12:00:00Z'));
  assert.equal(buckets.length,14);
  assert.equal(buckets[0].key,'2026-10-23');
  assert.equal(buckets.at(-1).key,'2026-11-05');
  assert.equal(buckets.reduce((sum,day)=>sum+day.count,0),1);
});

import { salesOverview } from '../src/services/adminOverviewModel.js';

const snapshotOrder = (overrides = {}) => ({ order: {
  status: 'DELIVERED', paymentMethod: 'COD', paymentStatus: 'SUCCESS',
  subtotal: 1000000, shippingFee: 30000, total: 1030000,
  items: [{ quantity: 2 }], ...overrides,
} });

test('sales revenue recognizes only delivered and paid merchandise, excluding shipping', () => {
  const summary = salesOverview([
    snapshotOrder(), snapshotOrder({ subtotal: 2000000, total: 2030000, paymentMethod: 'VNPAY' }),
    snapshotOrder({ status: 'PENDING', paymentStatus: 'PENDING' }),
    snapshotOrder({ status: 'CANCELLED' }),
    snapshotOrder({ paymentStatus: 'REFUNDED' }),
    snapshotOrder({ status: 'PROCESSING' }),
  ]);
  assert.equal(summary.revenue, 3000000);
  assert.equal(summary.completedOrders, 2);
  assert.equal(summary.averageOrder, 1500000);
  assert.equal(summary.unitsSold, 4);
});

test('pending collection includes only open unpaid COD orders including shipping', () => {
  const summary = salesOverview([
    ...['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].map(status =>
      snapshotOrder({ status, paymentStatus: 'PENDING' })),
    snapshotOrder({ status: 'CANCELLED', paymentStatus: 'PENDING' }),
    snapshotOrder({ status: 'SHIPPED', paymentMethod: 'VNPAY', paymentStatus: 'PENDING' }),
    snapshotOrder(),
  ]);
  assert.equal(summary.pendingCollection, 4120000);
  assert.equal(summary.pendingOrders, 4);
});

test('empty or no completed orders has no average sale instead of a fabricated value', () => {
  const summary = salesOverview([]);
  assert.equal(summary.revenue, 0);
  assert.equal(summary.pendingCollection, 0);
  assert.equal(summary.completedOrders, 0);
  assert.equal(summary.averageOrder, null);
});

test('revenue derives merchandise from total minus shipping, but never guesses missing fees', () => {
  assert.equal(salesOverview([snapshotOrder({ subtotal: null })]).revenue, 1000000);
  const unknown = salesOverview([snapshotOrder({ subtotal: null, shippingFee: null })]);
  assert.equal(unknown.revenue, null);
  assert.equal(unknown.averageOrder, null);
});

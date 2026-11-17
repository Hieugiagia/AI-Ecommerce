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

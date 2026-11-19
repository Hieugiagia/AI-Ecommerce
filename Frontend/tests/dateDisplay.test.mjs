import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDisplayDate, formatDisplayDateTime } from '../src/services/dateDisplay.js';
import { orderActivity } from '../src/services/adminOverviewModel.js';

test('short and full calendar dates always use explicit slash separators', () => {
  const date = new Date('2026-11-13T10:20:30Z');
  assert.equal(formatDisplayDate(date, { includeYear: false, timeZone: 'UTC' }), '13/11');
  assert.equal(formatDisplayDate(date, { timeZone: 'UTC' }), '13/11/2026');
});

test('chart labels use slashes while ISO keys stay unchanged for order aggregation', () => {
  const buckets = orderActivity([{ order: { createdAt: '2026-11-13T10:00:00' } }], 2, new Date('2026-11-13T12:00:00Z'));
  assert.deepEqual(buckets.map(({ key, label, count }) => ({ key, label, count })), [
    { key: '2026-11-12', label: '12/11', count: 0 },
    { key: '2026-11-13', label: '13/11', count: 1 },
  ]);
});

test('date-time keeps the clock and respects the requested calendar time zone', () => {
  const value = '2026-11-13T20:21:22Z';
  assert.equal(formatDisplayDateTime(value, { timeZone: 'UTC' }), '20:21:22 13/11/2026');
  assert.equal(formatDisplayDate(value, { timeZone: 'Asia/Ho_Chi_Minh' }), '14/11/2026');
});

test('missing or invalid timestamps show fallback text instead of Invalid Date', () => {
  for (const value of [null, undefined, '', 'not-a-date']) {
    assert.equal(formatDisplayDate(value), 'Chưa có thông tin');
    assert.equal(formatDisplayDateTime(value), 'Chưa có thông tin');
  }
  assert.equal(formatDisplayDate(null, { fallback: 'Chưa có ngày đặt' }), 'Chưa có ngày đặt');
});

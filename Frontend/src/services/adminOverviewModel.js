import { formatDisplayDate } from './dateDisplay.js';

export function orderActivity(entries, days = 7, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (name) => parts.find((item) => item.type === name).value;
  const today = Date.UTC(Number(part('year')), Number(part('month')) - 1, Number(part('day')));
  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date(today - (days - 1 - index) * 86400000);
    return { key: date.toISOString().slice(0, 10), label: formatDisplayDate(date, { timeZone: 'UTC', includeYear: false }), count: 0 };
  });
  const byDay = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  for (const entry of entries) {
    const key = entry.order.createdAt?.slice(0, 10);
    if (byDay.has(key)) byDay.get(key).count++;
  }
  return buckets;
}

export function collectedCod(entries) {
  return entries.reduce((sum, entry) => entry.order.paymentMethod === 'COD' && entry.order.paymentStatus === 'SUCCESS'
    ? sum + entry.order.total : sum, 0);
}

/**
 * A snapshot of the orders actually supplied by the API, not an all-time report.
 * Revenue excludes delivery fees and is recognized only after delivery and payment.
 */
export function salesOverview(entries) {
  const completed = entries.map(entry => entry.order).filter(order =>
    order.status === 'DELIVERED' && order.paymentStatus === 'SUCCESS');
  const openCod = entries.map(entry => entry.order).filter(order =>
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(order.status)
      && order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING');
  const merchandiseValue = order => {
    if (order.subtotal != null) return order.subtotal;
    if (order.total != null && order.shippingFee != null) return Math.max(0, order.total - order.shippingFee);
    return null;
  };
  const values = completed.map(merchandiseValue);
  const revenue = values.some(value => value == null) ? null : values.reduce((sum, value) => sum + value, 0);
  return {
    revenue,
    pendingCollection: openCod.reduce((sum, order) => sum + order.total, 0),
    pendingOrders: openCod.length,
    completedOrders: completed.length,
    unitsSold: completed.reduce((sum, order) => sum + order.items.reduce((units, item) => units + item.quantity, 0), 0),
    averageOrder: completed.length && revenue != null ? revenue / completed.length : null,
  };
}

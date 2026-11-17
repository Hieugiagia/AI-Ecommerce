export function orderActivity(entries, days = 7, now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (name) => parts.find((item) => item.type === name).value;
  const today = Date.UTC(Number(part('year')), Number(part('month')) - 1, Number(part('day')));
  const buckets = Array.from({ length: days }, (_, index) => {
    const date = new Date(today - (days - 1 - index) * 86400000);
    return { key: date.toISOString().slice(0, 10), label: date.toLocaleDateString('vi-VN', { timeZone: 'UTC', day: '2-digit', month: '2-digit' }), count: 0 };
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

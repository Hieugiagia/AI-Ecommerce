const fallbackText = 'Chưa có thông tin';

function readDate(value) {
  if (value == null || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Assemble calendar fields explicitly: vi-VN separators differ between browsers.
export function formatDisplayDate(value, { includeYear = true, timeZone, fallback = fallbackText } = {}) {
  const date = readDate(value);
  if (!date) return fallback;
  const parts = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    ...(includeYear ? { year: 'numeric' } : {}),
    ...(timeZone ? { timeZone } : {}),
  }).formatToParts(date);
  const field = type => parts.find(part => part.type === type).value;
  return [field('day'), field('month'), ...(includeYear ? [field('year')] : [])].join('/');
}

export function formatDisplayDateTime(value, { timeZone, fallback = fallbackText } = {}) {
  const date = readDate(value);
  if (!date) return fallback;
  const time = date.toLocaleTimeString('vi-VN', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    ...(timeZone ? { timeZone } : {}),
  });
  return time + ' ' + formatDisplayDate(date, { timeZone });
}

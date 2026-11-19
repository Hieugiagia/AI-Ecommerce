const textFields = ['receiverName', 'receiverPhone', 'streetAddress', 'ward', 'district', 'city'];
export function addressPayload(form) {
  const payload = {};
  for (const field of textFields) {
    const value = String(form[field] ?? '').trim();
    if (!value || value.length > (field === 'receiverPhone' ? 16 : 100)) throw new Error('Vui lòng điền đầy đủ địa chỉ. Mỗi mục tối đa 100 ký tự.');
    payload[field] = value;
  }
  if (!/^\+?[0-9]{8,15}$/.test(payload.receiverPhone)) throw new Error('Số điện thoại gồm 8–15 chữ số, có thể bắt đầu bằng +.');
  payload.isDefault = form.isDefault === true;
  return payload;
}
export function normalizeAddress(row) {
  if (!Number.isInteger(row?.id) || row.id < 1 || typeof row.isDefault !== 'boolean'
    || textFields.some(field => typeof row[field] !== 'string' || !row[field].trim())) throw new Error('Dữ liệu địa chỉ không hợp lệ.');
  addressPayload(row);
  return { id: row.id, ...addressPayload(row) };
}
export function normalizeAddresses(data) {
  if (!Array.isArray(data)) throw new Error('Chưa tải được sổ địa chỉ.');
  const rows = data.map(normalizeAddress);
  if (new Set(rows.map(row => row.id)).size !== rows.length || rows.filter(row => row.isDefault).length > 1) throw new Error('Sổ địa chỉ chưa nhất quán. Vui lòng tải lại.');
  return rows.sort((a,b) => Number(b.isDefault)-Number(a.isDefault) || a.id-b.id);
}
export function shippingFromAddress(address, current = {}) {
  const row = normalizeAddress(address);
  return { ...current, fullName: row.receiverName, phone: row.receiverPhone,
    province: row.city, district: row.district, address: row.district === row.ward ? row.streetAddress : row.streetAddress + ', ' + row.ward };
}

export function addressLine(row) {
  return [row.streetAddress, row.ward, row.district === row.ward ? '' : row.district, row.city].filter(Boolean).join(', ');
}

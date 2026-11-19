export function profilePayload(form) {
  const fullName = String(form.fullName || '').trim().replace(/\s+/g, ' ');
  const phone = String(form.phone || '').trim();
  if (!fullName || fullName.length > 255) throw new Error('Họ tên cần từ 1 đến 255 ký tự.');
  if (!/^(?:0[0-9]{9}|\+84[0-9]{9})$/.test(phone)) throw new Error('Nhập số điện thoại gồm 10 chữ số bắt đầu bằng 0, hoặc dạng +84.');
  return { fullName, phone };
}

export function confirmedProfile(response, expected) {
  const updated = response?.user;
  if (response?.success !== true || !updated || String(updated.id) !== String(expected.id)
    || updated.email !== expected.email || updated.role !== expected.role
    || typeof updated.fullName !== 'string' || !updated.fullName.trim()
    || typeof updated.phone !== 'string') {
    throw new Error('Máy chủ chưa xác nhận thông tin tài khoản. Vui lòng tải lại để kiểm tra.');
  }
  return updated;
}

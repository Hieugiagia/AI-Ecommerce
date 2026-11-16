export function resetPasswordError(password, confirmation) {
  if (!password.trim() || password.length < 8) return 'Mật khẩu cần ít nhất 8 ký tự.';
  if (new TextEncoder().encode(password).length > 72) return 'Mật khẩu tối đa 72 byte; chữ có dấu có thể chiếm nhiều byte.';
  if (password !== confirmation) return 'Hai mật khẩu chưa trùng nhau.';
  return '';
}

export function readResetToken(hash) {
  const token = new URLSearchParams(hash.replace(/^#/, '')).get('token') || '';
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : '';
}

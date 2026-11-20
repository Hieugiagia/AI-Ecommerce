// Accept only a complete session confirmed by the authentication endpoint.
export function confirmedAuth(response) {
  const token = response?.accessToken || response?.token;
  const user = response?.user;
  if (response?.success !== true || typeof token !== 'string' || !token.trim()
    || typeof response.refreshToken !== 'string' || !response.refreshToken.trim()
    || !Number.isSafeInteger(user?.id) || user.id < 1
    || typeof user.email !== 'string' || !user.email.trim()
    || typeof user.fullName !== 'string' || !user.fullName.trim()
    || !['ROLE_USER', 'ROLE_ADMIN'].includes(user.role)) {
    throw new Error('Máy chủ chưa xác nhận đầy đủ phiên đăng nhập. Vui lòng thử lại.');
  }
  return { token, refreshToken: response.refreshToken, user };
}

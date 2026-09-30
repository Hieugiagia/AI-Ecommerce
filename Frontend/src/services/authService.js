import { apiRequest } from './api';

/**
 * Authentication Service
 * Khớp chuẩn 100% với Router /auth của Backend:
 * - POST /auth/register      : Đăng ký tài khoản mới
 * - POST /auth/login         : Đăng Nhập
 * - POST /auth/logout        : Đăng xuất
 * - POST /auth/refresh-token : Làm mới access token
 * - GET  /auth/profile       : Xem thông tin cá nhân
 * - PUT  /auth/profile       : Cập nhật thông tin
 * - POST /auth/forgot-password : Khôi phục mật khẩu qua email
 */

export const authService = {
  /**
   * Đăng ký tài khoản mới
   * POST /auth/register
   * @param {Object} userData - { fullName, email, phone, password }
   */
  async register(userData) {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },

  /**
   * Đăng nhập người dùng
   * POST /auth/login
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  /**
   * Đăng xuất khỏi hệ thống
   * POST /auth/logout
   */
  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Bỏ qua lỗi mạng khi logout
    }
  },

  /**
   * Làm mới access token
   * POST /auth/refresh-token
   * @param {string} refreshToken
   */
  async refreshToken(refreshToken) {
    return await apiRequest('/auth/refresh-token', {
      method: 'POST',
      body: { refreshToken },
    });
  },

  /**
   * Xem thông tin cá nhân của tài khoản hiện tại
   * GET /auth/profile
   */
  async getProfile() {
    return await apiRequest('/auth/profile', {
      method: 'GET',
    });
  },

  /**
   * Cập nhật thông tin tài khoản cá nhân
   * PUT /auth/profile
   * @param {Object} profileData
   */
  async updateProfile(profileData) {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: profileData,
    });
  },

  /**
   * Yêu cầu khôi phục mật khẩu qua Email
   * POST /auth/forgot-password
   * @param {string} email
   */
  async forgotPassword(email) {
    return await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },
};

export default authService;

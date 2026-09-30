import { apiRequest } from './api';

/**
 * Authentication Service
 * Chứa toàn bộ các hàm gọi API Xác thực (Auth) để kết nối Backend
 * 
 * Chuẩn định dạng Backend cần trả về:
 * - Đăng nhập: POST /api/auth/login -> Trả về: { success: true, token: "jwt_token", user: { id, fullName, email, phone, role, avatar } }
 * - Đăng ký:   POST /api/auth/register -> Trả về: { success: true, token: "jwt_token", user: { id, fullName, email, phone, role } }
 * - Lấy info:  GET  /api/auth/me -> Trả về: { success: true, user: { ... } }
 */

export const authService = {
  /**
   * Đăng nhập người dùng
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
   * Đăng ký tài khoản mới
   * @param {Object} userData - { fullName, email, phone, password }
   */
  async register(userData) {
    return await apiRequest('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },

  /**
   * Lấy thông tin tài khoản hiện tại bằng JWT Token
   */
  async getProfile() {
    return await apiRequest('/auth/me', {
      method: 'GET',
    });
  },

  /**
   * Cập nhật thông tin tài khoản cá nhân
   */
  async updateProfile(profileData) {
    return await apiRequest('/auth/profile', {
      method: 'PUT',
      body: profileData,
    });
  },

  /**
   * Yêu cầu khôi phục mật khẩu qua Email
   */
  async forgotPassword(email) {
    return await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  /**
   * Đăng xuất khỏi hệ thống
   */
  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Bỏ qua lỗi mạng khi logout
    }
  },
};

export default authService;

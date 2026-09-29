/**
 * API Client Configuration
 * Cấu hình đường dẫn kết nối Backend API chuẩn RESTful
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Hàm gọi API tổng quát (Fetch Wrapper)
 * - Tự động đính kèm Token xác thực Bearer nếu người dùng đã đăng nhập
 * - Tự động parse JSON Request & Response
 * - Bắt lỗi HTTP status code và xử lý thông điệp từ Backend trả về
 */
export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const token = localStorage.getItem('auth_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    // Xử lý status 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `Lỗi yêu cầu (Mã lỗi ${response.status})`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Nếu không kết nối được đến máy chủ (Server chưa bật hoặc CORS)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const netError = new Error(`Không thể kết nối đến máy chủ Backend tại ${API_BASE_URL}. Vui lòng kiểm tra server Backend đã khởi động chưa.`);
      netError.isNetworkError = true;
      throw netError;
    }
    throw error;
  }
}

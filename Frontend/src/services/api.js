/**
 * API Client Configuration
 * Cấu hình đường dẫn kết nối Backend API chuẩn RESTful
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Hàm gọi API tổng quát (Fetch Wrapper)
 * - Tự động đính kèm Token xác thực Bearer nếu người dùng đã đăng nhập
 * - Hỗ trợ tự động làm mới Access Token khi hết hạn (401) qua POST /auth/refresh-token
 * - Tự động parse JSON Request & Response
 * - Bắt lỗi HTTP status code và xử lý thông điệp từ Backend trả về
 */
export async function apiRequest(endpoint, options = {}, isRetry = false) {
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

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

    // Xử lý Token hết hạn (401) -> Tự động gọi Refresh Token nếu có
    if (response.status === 401 && !isRetry && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh-token')) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              const newToken = refreshData?.token || refreshData?.accessToken;
              if (newToken) {
                localStorage.setItem('auth_token', newToken);
                if (refreshData?.refreshToken) {
                  localStorage.setItem('refresh_token', refreshData.refreshToken);
                }
                processQueue(null, newToken);
                isRefreshing = false;
                return apiRequest(endpoint, options, true);
              }
            }
            throw new Error('Refresh token expired');
          } catch (refreshErr) {
            processQueue(refreshErr, null);
            isRefreshing = false;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('ai_ecommerce_user');
            window.dispatchEvent(new Event('auth:unauthorized'));
          }
        } else {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: () => resolve(apiRequest(endpoint, options, true)),
              reject: (err) => reject(err),
            });
          });
        }
      }
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

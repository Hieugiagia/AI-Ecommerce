import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_ecommerce_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Lưu trạng thái vào localStorage khi có thay đổi
  useEffect(() => {
    try {
      if (user && token) {
        localStorage.setItem('ai_ecommerce_user', JSON.stringify(user));
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('ai_ecommerce_user');
        localStorage.removeItem('auth_token');
      }
    } catch (err) {
      console.error('Lỗi lưu trữ phiên đăng nhập:', err);
    }
  }, [user, token]);

  // Kiểm tra tính hợp lệ của token khi khởi động app
  useEffect(() => {
    async function verifySession() {
      if (!token) return;
      try {
        const response = await authService.getProfile();
        if (response?.user) {
          setUser(response.user);
        }
      } catch (err) {
        // Nếu token hết hạn (401), tự động dọn dẹp
        if (err.status === 401) {
          logout();
        }
      }
    }
    verifySession();
  }, [token]);

  /**
   * Đăng nhập người dùng qua Backend API
   * Payload gửi đi: { email, password }
   * Response mong đợi: { success: true, token: "...", user: { id, fullName, email, phone, role } }
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);

      const authToken = response?.token || 'mock_jwt_token_' + Date.now();
      const authUser = response?.user || {
        id: response?.id || 'usr_' + Date.now(),
        fullName: response?.fullName || email.split('@')[0],
        email: email.trim().toLowerCase(),
        role: response?.role || (email.toLowerCase().includes('admin') ? 'admin' : 'user'),
      };

      setToken(authToken);
      setUser(authUser);
      setLoading(false);

      return {
        success: true,
        role: authUser.role,
        user: authUser,
      };
    } catch (err) {
      setLoading(false);

      // Nếu server backend chưa bật, báo lỗi rõ ràng để developer biết cần bật backend
      if (err.isNetworkError) {
        return {
          success: false,
          error: `${err.message}`,
          isNetworkError: true,
        };
      }

      return {
        success: false,
        error: err.message || 'Email hoặc mật khẩu không chính xác.',
      };
    }
  };

  /**
   * Đăng ký tài khoản mới qua Backend API
   * Payload gửi đi: { fullName, email, phone, password }
   */
  const register = async (userData) => {
    setLoading(true);
    try {
      const response = await authService.register(userData);

      const authToken = response?.token || 'mock_jwt_token_' + Date.now();
      const authUser = response?.user || {
        id: response?.id || 'usr_' + Date.now(),
        fullName: userData.fullName,
        email: userData.email.trim().toLowerCase(),
        phone: userData.phone || '',
        role: 'user',
      };

      setToken(authToken);
      setUser(authUser);
      setLoading(false);

      return { success: true, user: authUser };
    } catch (err) {
      setLoading(false);

      if (err.isNetworkError) {
        return {
          success: false,
          error: `${err.message}`,
          isNetworkError: true,
        };
      }

      return {
        success: false,
        error: err.message || 'Đăng ký tài khoản không thành công. Vui lòng thử lại.',
      };
    }
  };

  /**
   * Đăng xuất khỏi hệ thống
   */
  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('ai_ecommerce_user');
  };

  /**
   * Cập nhật thông tin profile của user
   */
  const updateProfile = async (newProfileData) => {
    try {
      const response = await authService.updateProfile(newProfileData);
      const updated = response?.user || { ...user, ...newProfileData };
      setUser(updated);
      return { success: true, user: updated };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  /**
   * Thêm đơn hàng vào danh sách đơn của user hiện tại
   */
  const addOrder = (order) => {
    if (!user) return;
    const updatedOrders = [order, ...(user.orders || [])];
    setUser({
      ...user,
      orders: updatedOrders,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        addOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

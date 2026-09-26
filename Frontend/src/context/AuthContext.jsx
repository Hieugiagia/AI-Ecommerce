import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Danh sách tài khoản Quản trị viên (Admin) được cấp quyền trong hệ thống
const ADMIN_ACCOUNTS = [
  {
    email: 'admin@alibabastore.vn',
    password: 'admin123',
    fullName: 'Quản trị viên Alibaba-Store',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '091234567',
    address: 'Trung tâm Điều hành Alibaba-Store, TP. Hồ Chí Minh',
  },
  {
    email: 'admin@hstore.vn',
    password: 'admin123',
    fullName: 'Quản trị viên Hệ thống',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '091234567',
    address: 'Trung tâm Điều hành Alibaba-Store, TP. Hồ Chí Minh',
  },
  {
    email: 'admin@gmail.com',
    password: 'admin',
    fullName: 'Admin Quản trị',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phone: '091234567',
    address: 'Văn phòng Quản trị Alibaba-Store, Hà Nội',
  },
];

// Dữ liệu khách hàng mẫu khi dùng tài khoản demo
const DEMO_CUSTOMER_DATA = {
  id: 'usr_demo_01',
  fullName: 'Nguyễn Văn An',
  email: 'khachhang@alibabastore.vn',
  phone: '091234567',
  role: 'user',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  address: 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh',
  orders: [
    {
      id: 'ORD-98214',
      date: '2026-09-15',
      items: [
        {
          id: 1,
          name: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên',
          price: 29490000,
          quantity: 1,
          variant: '256GB',
          image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=300&auto=format&fit=crop&q=80',
        },
      ],
      total: 29490000,
      status: 'Đã giao hàng',
      paymentMethod: 'Chuyển khoản VietQR',
    },
  ],
};

export function AuthProvider({ children }) {
  // Mặc định khi web chạy: Trạng thái là CHƯA ĐĂNG NHẬP (user = null), khách lướt web bình thường
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_ecommerce_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Nếu là tài khoản mẫu cũ tự động lưu trước đây -> xóa để reset về trạng thái chưa đăng nhập
        if (parsed?.id === 'usr_01') {
          localStorage.removeItem('ai_ecommerce_user');
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('ai_ecommerce_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('ai_ecommerce_user');
      }
    } catch (err) {
      console.error('Error persisting user state', err);
    }
  }, [user]);

  // Luồng Đăng nhập phân quyền chính xác:
  // - Chỉ khi đăng nhập ĐÚNG tài khoản Quản trị (Admin) và ĐÚNG mật khẩu thì mới là 'admin'
  // - Nếu nhập tài khoản admin nhưng sai mật khẩu -> Báo lỗi
  // - Tất cả các tài khoản khác đều mang quyền 'user' (Khách hàng)
  const login = (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // 1. Kiểm tra tài khoản Quản trị Admin
    const matchedAdmin = ADMIN_ACCOUNTS.find((acc) => acc.email.toLowerCase() === cleanEmail);
    if (matchedAdmin) {
      if (matchedAdmin.password === cleanPassword) {
        const loggedAdmin = {
          id: 'adm_' + Date.now().toString().slice(-4),
          fullName: matchedAdmin.fullName,
          email: matchedAdmin.email,
          phone: matchedAdmin.phone,
          role: 'admin',
          avatar: matchedAdmin.avatar,
          address: matchedAdmin.address,
          orders: [],
        };
        setUser(loggedAdmin);
        return { success: true, role: 'admin' };
      } else {
        return {
          success: false,
          error: 'Mật khẩu tài khoản Quản trị viên không chính xác! (Mật khẩu mẫu: admin123)',
        };
      }
    }

    // Nếu email có chữ "admin" mà không thuộc danh sách hoặc sai mật khẩu
    if (cleanEmail.includes('admin') && cleanPassword !== 'admin123' && cleanPassword !== 'admin') {
      return {
        success: false,
        error: 'Tài khoản quản trị yêu cầu mật khẩu bảo mật (Mật khẩu mẫu: admin123)',
      };
    }

    // 2. Tài khoản Khách hàng thông thường (User)
    const isDemo = cleanEmail === 'khachhang@alibabastore.vn' || cleanEmail === 'khachhang@hstore.vn' || cleanEmail === 'khachhang@nextstore.ai' || cleanEmail === 'an.nguyen@example.com';
    const loggedUser = {
      id: isDemo ? DEMO_CUSTOMER_DATA.id : 'usr_' + Date.now().toString().slice(-4),
      fullName: isDemo ? DEMO_CUSTOMER_DATA.fullName : (cleanEmail.split('@')[0] || 'Khách hàng'),
      email: cleanEmail,
      phone: isDemo ? DEMO_CUSTOMER_DATA.phone : '091234567',
      role: 'user', // Bắt buộc là user
      avatar: isDemo
        ? DEMO_CUSTOMER_DATA.avatar
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      address: isDemo ? DEMO_CUSTOMER_DATA.address : 'Hà Nội, Việt Nam',
      orders: isDemo ? DEMO_CUSTOMER_DATA.orders : [],
    };

    setUser(loggedUser);
    return { success: true, role: 'user' };
  };

  const register = (userData) => {
    const newUser = {
      id: 'usr_' + Date.now().toString().slice(-4),
      fullName: userData.fullName || 'Khách hàng mới',
      email: userData.email.trim(),
      phone: userData.phone || '',
      role: 'user', // Đăng ký tài khoản luôn là khách hàng thông thường
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      address: userData.address || '',
      orders: [],
    };
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

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
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
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

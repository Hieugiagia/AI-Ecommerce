import React from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu đã đăng nhập nhưng tài khoản là Khách hàng (User) chứ không phải Admin
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="max-w-md w-full p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-900/5 text-center space-y-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Lỗi 403: Quyền truy cập bị từ chối
            </span>
            <h2 className="text-xl font-bold text-slate-900">Khu vực dành riêng cho Quản trị viên</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Bạn đang đăng nhập bằng tài khoản <span className="font-semibold text-slate-800">{user.email}</span> (vai trò: <span className="font-bold text-slate-700">Khách hàng</span>). Vui lòng đăng nhập với tài khoản có quyền Quản trị (Admin) để tiếp tục.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                logout();
                navigate('/login', { state: { from: location } });
              }}
              className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập tài khoản Quản trị</span>
            </motion.button>

            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Cửa hàng</span>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return children;
}

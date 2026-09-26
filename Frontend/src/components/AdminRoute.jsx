import React from 'react';
import { Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
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
        <div className="max-w-md w-full p-8 bg-white border border-slate-200/90 rounded-3xl shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Lỗi 403: Quyền truy cập bị từ chối
            </span>
            <h2 className="text-xl font-bold text-slate-900">Khu vực dành riêng cho Quản trị viên</h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Bạn đang đăng nhập bằng tài khoản <span className="font-semibold text-slate-800">{user.email}</span> (vai trò: <span className="font-bold text-slate-700">Khách hàng</span>). Vui lòng đăng nhập với tài khoản có quyền Quản trị (Admin) để tiếp tục.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              onClick={() => {
                logout();
                navigate('/login', { state: { from: location } });
              }}
              className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập tài khoản Quản trị</span>
            </button>

            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại Cửa hàng</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

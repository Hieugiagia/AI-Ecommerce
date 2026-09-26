import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from?.pathname || '/profile';

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setLoading(false);

      if (!res?.success) {
        setError(res?.error || 'Đăng nhập không thành công.');
        return;
      }

      // Nếu đăng nhập đúng tài khoản Quản trị Admin -> Chuyển thẳng vào Bảng Quản trị /admin/dashboard
      if (res.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Tài khoản khách hàng thông thường -> Không cho vào /admin, chuyển đến /profile hoặc trang trước đó
        const target = redirectPath.startsWith('/admin') ? '/profile' : redirectPath;
        navigate(target, { replace: true });
      }
    }, 500);
  };

  const handleFillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/60">
      <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Đăng nhập hệ thống
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Khách hàng mua sắm hoặc Quản trị viên đăng nhập điều hành
          </p>
        </div>

        {/* Bảng chọn tài khoản Demo nhanh để kiểm tra phân quyền */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            Chọn tài khoản Demo để kiểm tra phân quyền:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('khachhang@alibabastore.vn', '123456')}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 group-hover:text-indigo-600">
                <span>👤 Khách hàng</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">khachhang@alibabastore.vn</p>
              <span className="inline-block text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1">
                Quyền User
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleFillDemo('admin@alibabastore.vn', 'admin123')}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 group-hover:text-indigo-600">
                <span>🛡️ Quản trị viên</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">admin@alibabastore.vn</p>
              <span className="inline-block text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-1">
                Quyền Admin
              </span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Form đăng nhập */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email đăng ký
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@email.com"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Mật khẩu</label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm pl-10 pr-10 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-slate-600 font-medium">Ghi nhớ đăng nhập</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-slate-900/10 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Social Login */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400 font-medium">Hoặc tiếp tục với</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                login('google.user@gmail.com', 'google123');
                navigate('/profile');
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Google
            </button>

            <button
              onClick={() => {
                login('apple.id@icloud.com', 'apple123');
                navigate('/profile');
              }}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current text-slate-900" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.44-6.19-9.5-11.19-20.76-15-33.78-3.8-13.02-5.71-25.26-5.71-36.72 0-14.03 3.42-25.68 10.26-34.95 6.84-9.27 15.42-13.98 25.75-14.13 4.58 0 9.77 1.25 15.58 3.75 5.8 2.5 9.77 3.75 11.9 3.75 1.9 0 6.03-1.37 12.38-4.11 6.35-2.74 11.83-3.95 16.44-3.63 12.51.64 22.56 5.4 30.15 14.28-10.9 6.64-16.24 15.77-16.02 27.39.22 9.07 3.65 16.79 10.29 23.16 6.63 6.38 14.46 10.02 23.49 10.94-2.24 6.75-4.85 13.57-7.85 20.47zM119.22 33.02c0-7.39 2.65-14.35 7.95-20.88 5.3-6.53 11.75-10.59 19.35-12.14.78 7.6-1.74 14.72-7.56 21.36-5.82 6.64-12.4 10.54-19.74 11.66z" />
              </svg>
              Apple ID
            </button>
          </div>
        </div>

        {/* Footer chuyển sang Register */}
        <p className="text-center text-xs text-slate-500 pt-2">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-indigo-600 hover:underline">
            Đăng ký miễn phí
          </Link>
        </p>
      </div>
    </div>
  );
}

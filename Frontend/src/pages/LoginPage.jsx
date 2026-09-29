import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email, password);
      setLoading(false);

      if (!res?.success) {
        setError(res?.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
        return;
      }

      // Điều hướng dựa theo quyền người dùng trả về từ Backend
      if (res.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const target = redirectPath.startsWith('/admin') ? '/profile' : redirectPath;
        navigate(target, { replace: true });
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Đã xảy ra lỗi trong quá trình kết nối.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-900/5 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-50 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 mb-2 shadow-xs">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Đăng nhập hệ thống
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Nhập email và mật khẩu của bạn để truy cập tài khoản
          </p>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </motion.div>
        )}

        {/* Form đăng nhập */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Địa chỉ Email *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Mật khẩu *</label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-indigo-600 hover:underline"
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
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm pl-10 pr-10 py-2.5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <span className="text-xs text-slate-600 font-medium">Ghi nhớ đăng nhập</span>
            </label>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-500/25 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Đăng nhập nhanh bằng mạng xã hội */}
        <div className="relative z-10 pt-2">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-medium uppercase tracking-wider">
              Hoặc tiếp tục với
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              type="button"
              onClick={() => setError('Tính năng đăng nhập Google sẽ kích hoạt khi tích hợp OAuth2 trên Backend.')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
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
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => setError('Tính năng đăng nhập Apple sẽ kích hoạt khi tích hợp OAuth2 trên Backend.')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4 fill-current text-slate-900" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.67-.82 1.13-1.96.99-3.11-1 .04-2.17.67-2.85 1.48-.6.7-1.12 1.83-.98 2.94 1.11.08 2.19-.53 2.84-1.31z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>
        </div>

        {/* Footer chuyển sang đăng ký */}
        <div className="text-center pt-2 relative z-10">
          <p className="text-xs text-slate-500">
            Chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

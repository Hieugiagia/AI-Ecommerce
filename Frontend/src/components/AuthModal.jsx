import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  // mode: 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'
  const [mode, setMode] = useState('LOGIN');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (mode === 'FORGOT_PASSWORD') {
      setIsSubmitted(true);
      return;
    }
    
    setLoading(true);
    try {
      if (mode === 'LOGIN') {
        const res = await login(formData.email, formData.password);
        if (!res?.success) {
          setError(res?.error || 'Đăng nhập không thành công.');
          setLoading(false);
          return;
        }
      } else if (mode === 'REGISTER') {
        const res = await register({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phoneNumber,
          password: formData.password,
        });
        if (!res?.success) {
          setError(res?.error || 'Đăng ký không thành công.');
          setLoading(false);
          return;
        }
      }
      setLoading(false);
      onClose();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Lỗi kết nối.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          {/* Modal Container with Spring Transition */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white border border-slate-200/90 rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden p-6 sm:p-8 z-10"
          >
            {/* Ambient decorative blur */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-indigo-200/40 to-violet-200/40 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

            {/* Nút đóng */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Tiêu đề & Logo */}
            <div className="text-center mb-6 relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-50 to-violet-50 text-indigo-600 border border-indigo-200/60 mb-3 shadow-xs">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {mode === 'LOGIN' && 'Chào mừng trở lại!'}
                {mode === 'REGISTER' && 'Tạo tài khoản mới'}
                {mode === 'FORGOT_PASSWORD' && 'Khôi phục mật khẩu'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {mode === 'LOGIN' && 'Đăng nhập để nhận đề xuất công nghệ thông minh từ AI'}
                {mode === 'REGISTER' && 'Trải nghiệm mua sắm mượt mà cùng hệ sinh thái AI SaaS'}
                {mode === 'FORGOT_PASSWORD' && 'Nhập email đã đăng ký để nhận mã xác thực'}
              </p>
            </div>

            {/* Form xử lý with smooth tab switch animation */}
            <AnimatePresence mode="wait">
              {mode === 'FORGOT_PASSWORD' && isSubmitted ? (
                <motion.div
                  key="forgot-submitted"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center py-6 space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Mã xác nhận khôi phục mật khẩu đã được gửi đến{' '}
                    <span className="font-semibold text-indigo-600">{formData.email}</span>. Vui lòng kiểm tra hộp thư.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setMode('LOGIN');
                    }}
                    className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-xs sm:text-sm font-semibold transition-all shadow-md cursor-pointer"
                  >
                    Quay lại Đăng nhập
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key={mode}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit}
                  className="space-y-3.5 relative z-10"
                >
                  {/* Họ tên (Chỉ hiện khi Đăng ký) */}
                  {mode === 'REGISTER' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="Nguyễn Văn A"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        />
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Số điện thoại (Chỉ hiện khi Đăng ký) */}
                  {mode === 'REGISTER' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          placeholder="0987654321"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  )}

                  {/* Password (Hiện ở Đăng nhập & Đăng ký) */}
                  {mode !== 'FORGOT_PASSWORD' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Mật khẩu</label>
                        {mode === 'LOGIN' && (
                          <button
                            type="button"
                            onClick={() => setMode('FORGOT_PASSWORD')}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                          >
                            Quên mật khẩu?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-10 py-2.5 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
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
                  )}

                  {/* Nút Submit */}
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-4"
                  >
                    <span>
                      {mode === 'LOGIN' && 'Đăng Nhập'}
                      {mode === 'REGISTER' && 'Đăng Ký Tài Khoản'}
                      {mode === 'FORGOT_PASSWORD' && 'Gửi mã khôi phục'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Chuyển đổi tab */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              {mode === 'LOGIN' && (
                <p>
                  Chưa có tài khoản?{' '}
                  <button
                    onClick={() => setMode('REGISTER')}
                    className="font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              )}
              {mode === 'REGISTER' && (
                <p>
                  Đã có tài khoản?{' '}
                  <button
                    onClick={() => setMode('LOGIN')}
                    className="font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Đăng nhập
                  </button>
                </p>
              )}
              {mode === 'FORGOT_PASSWORD' && !isSubmitted && (
                <button
                  onClick={() => setMode('LOGIN')}
                  className="font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  Quay lại Đăng nhập
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
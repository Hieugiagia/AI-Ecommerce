import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'FORGOT_PASSWORD') {
      setIsSubmitted(true);
      return;
    }
    // Chuẩn bị payload để gọi API Backend sau này:
    // LOGIN -> POST /auth/login
    // REGISTER -> POST /auth/register
    console.log(`Submitting ${mode} payload:`, formData);
    alert(`Đã gửi dữ liệu ${mode}: ${JSON.stringify(formData)}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-100 p-1.5 rounded-full hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề & Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mb-3">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">
            {mode === 'LOGIN' && 'Chào mừng trở lại!'}
            {mode === 'REGISTER' && 'Tạo tài khoản mới'}
            {mode === 'FORGOT_PASSWORD' && 'Khôi phục mật khẩu'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {mode === 'LOGIN' && 'Đăng nhập để trải nghiệm mua sắm cùng AI Assistant'}
            {mode === 'REGISTER' && 'Nhận ngay ưu đãi thành viên và gợi ý thông minh'}
            {mode === 'FORGOT_PASSWORD' && 'Nhập email đã đăng ký để nhận mã xác thực'}
          </p>
        </div>

        {/* Form xử lý */}
        {mode === 'FORGOT_PASSWORD' && isSubmitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <p className="text-sm text-slate-300">
              Mã xác nhận khôi phục mật khẩu đã được gửi đến <span className="font-semibold text-indigo-400">{formData.email}</span>. Vui lòng kiểm tra hộp thư.
            </p>
            <button
              onClick={() => { setIsSubmitted(false); setMode('LOGIN'); }}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all"
            >
              Quay lại Đăng nhập
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Họ tên (Chỉ hiện khi Đăng ký) */}
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Họ và tên</label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Số điện thoại (Chỉ hiện khi Đăng ký) */}
            {mode === 'REGISTER' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Số điện thoại</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="0987654321"
                    className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            )}

            {/* Password (Hiện ở Đăng nhập & Đăng ký) */}
            {mode !== 'FORGOT_PASSWORD' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">Mật khẩu</label>
                  {mode === 'LOGIN' && (
                    <button
                      type="button"
                      onClick={() => setMode('FORGOT_PASSWORD')}
                      className="text-xs text-indigo-400 hover:underline"
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
                    className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 pl-10 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Nút Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              <span>
                {mode === 'LOGIN' && 'Đăng Nhập'}
                {mode === 'REGISTER' && 'Đăng Ký Ngay'}
                {mode === 'FORGOT_PASSWORD' && 'Gửi mã khôi phục'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Chuyển đổi tab */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          {mode === 'LOGIN' && (
            <p>
              Chưa có tài khoản?{' '}
              <button
                onClick={() => setMode('REGISTER')}
                className="font-semibold text-indigo-400 hover:underline"
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
                className="font-semibold text-indigo-400 hover:underline"
              >
                Đăng nhập
              </button>
            </p>
          )}
          {mode === 'FORGOT_PASSWORD' && !isSubmitted && (
            <button
              onClick={() => setMode('LOGIN')}
              className="font-semibold text-indigo-400 hover:underline"
            >
              Quay lại Đăng nhập
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
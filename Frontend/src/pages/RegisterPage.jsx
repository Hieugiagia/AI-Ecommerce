import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (!formData.agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản dịch vụ.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      register(formData);
      setLoading(false);
      navigate('/profile');
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/60">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tạo tài khoản mới
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Gia nhập thành viên Alibaba-Store để nhận ngập tràn đặc quyền cùng voucher 50k
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Form đăng ký */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên *
            </label>
            <div className="relative">
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Địa chỉ Email *
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="tenban@email.com"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số điện thoại
            </label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0901234567"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mật khẩu *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Tối thiểu 6 ký tự"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Xác nhận mật khẩu *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Nhập lại mật khẩu"
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-[11px] text-slate-600 leading-tight">
                Tôi đồng ý với <a href="#terms" className="text-indigo-600 underline">Điều khoản sử dụng</a> và{' '}
                <a href="#privacy" className="text-indigo-600 underline">Chính sách quyền riêng tư</a> của Alibaba-Store.
              </span>
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
                <span>Đăng ký tài khoản</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer chuyển sang Login */}
        <p className="text-center text-xs text-slate-500 pt-2">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-indigo-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

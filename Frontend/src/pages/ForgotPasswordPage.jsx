import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50/60">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 border border-slate-200/90 rounded-3xl shadow-xl shadow-slate-200/50">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Khôi phục mật khẩu
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Nhập địa chỉ email liên kết với tài khoản để nhận mã OTP hoặc đường dẫn khôi phục
          </p>
        </div>

        {isSubmitted ? (
          <div className="text-center space-y-5 py-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-3xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Kiểm tra hộp thư của bạn</h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{' '}
                <span className="font-semibold text-slate-900">{email}</span>.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
              >
                <span>Quay lại trang Đăng nhập</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
            >
              Chưa nhận được email? Gửi lại
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email đã đăng ký *
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-slate-900/10 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <span>Gửi mã khôi phục</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Đăng nhập
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import AuthFrame from '../components/AuthFrame';
import AuthField from '../components/AuthField';
import { Mail, AlertCircle, CheckCircle2, LoaderCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const submitting = useRef(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || submitting.current) return;
    submitting.current = true;

    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setLoading(false);
      setIsSubmitted(true);
    } catch (err) {
      setLoading(false);
      if (err.isNetworkError) {
        setError(err.message);
      } else {
        setError(err.message || 'Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau.');
      }
    } finally {
      submitting.current = false;
    }
  };

  return <AuthFrame eyebrow="LẤY LẠI KẾT NỐI" title={isSubmitted ? 'Kiểm tra hộp thư của bạn.' : 'Quên mật khẩu? Không sao.'} description={isSubmitted ? 'Nếu email thuộc tài khoản đang hoạt động, bạn sẽ nhận được liên kết đặt lại mật khẩu.' : 'Nhập email đã đăng ký. Chúng tôi sẽ gửi liên kết giúp bạn đặt lại mật khẩu.'}>
    {isSubmitted ? <div className="space-y-5"><div className="auth-success" role="status"><CheckCircle2 size={22} className="mb-2" />Liên kết khôi phục sẽ được gửi đến <strong className="break-all">{email}</strong>. Hãy kiểm tra cả thư rác.</div><Link className="auth-submit" to="/login">Quay lại đăng nhập</Link><button className="text-sm text-indigo-600 underline" onClick={() => setIsSubmitted(false)}>Dùng email khác hoặc gửi lại yêu cầu</button></div> : <><div role="alert">{error && <p className="auth-error"><AlertCircle size={17} className="shrink-0" />{error}</p>}</div><form onSubmit={handleSubmit} className="auth-form"><AuthField id="forgot-email" label="Email đã đăng ký" icon={Mail} type="email" required maxLength={150} autoComplete="email" value={email} disabled={loading} onChange={event => setEmail(event.target.value)} placeholder="ban@example.com" /><button type="submit" disabled={loading} className="auth-submit">{loading && <LoaderCircle className="animate-spin" size={17} />}{loading ? 'Đang gửi yêu cầu...' : 'Gửi liên kết khôi phục'}</button></form></>}
    <p className="auth-switch">Nhớ mật khẩu rồi? <Link to="/login">Đăng nhập</Link></p>
  </AuthFrame>;
}

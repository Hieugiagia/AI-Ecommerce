import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthFrame from '../components/AuthFrame';
import AuthField from '../components/AuthField';
import { Mail, Lock, AlertCircle, ShieldCheck, LoaderCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      if (res.role === 'admin' || res.role === 'ROLE_ADMIN' || res.isAdmin) {
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

  return <AuthFrame productShowcase title="Đăng nhập" description="Nhập email và mật khẩu để truy cập tài khoản.">
    {new URLSearchParams(location.search).get('passwordReset') === 'success' && <p role="status" className="auth-success">Đã đổi mật khẩu. Hãy đăng nhập bằng mật khẩu mới.</p>}
    {error && <div role="alert" className="auth-error"><AlertCircle size={17} className="shrink-0 mt-0.5" /><span>{error}</span></div>}
    <form className="auth-form" onSubmit={handleSubmit}>
      <AuthField id="login-email" label="Địa chỉ email" icon={Mail} type="email" required autoComplete="email" maxLength={150} disabled={loading} value={email} onChange={event => setEmail(event.target.value)} placeholder="ban@example.com" />
      <AuthField id="login-password" label="Mật khẩu" icon={Lock} type={showPassword ? 'text' : 'password'} required autoComplete="current-password" disabled={loading} value={password} onChange={event => setPassword(event.target.value)} placeholder="Nhập mật khẩu của bạn" reveal={showPassword} onReveal={() => setShowPassword(!showPassword)} trailing={<Link to="/forgot-password">Quên mật khẩu?</Link>} />
      <button type="submit" className="auth-submit" disabled={loading}>{loading && <LoaderCircle className="animate-spin" size={17} />}{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
    </form>
    <p className="auth-note"><ShieldCheck />Đăng nhập bằng tài khoản email của bạn.</p>
    <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
  </AuthFrame>;
}

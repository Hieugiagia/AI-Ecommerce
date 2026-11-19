import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthFrame from '../components/AuthFrame';
import AuthField from '../components/AuthField';
import { Mail, Lock, User, Phone, AlertCircle, LoaderCircle } from 'lucide-react';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu và xác nhận mật khẩu không khớp.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (!formData.agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
      return;
    }

    setLoading(true);

    try {
      const res = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      setLoading(false);

      if (!res?.success) {
        setError(res?.error || 'Đăng ký tài khoản không thành công. Vui lòng thử lại.');
        return;
      }

      // Đăng ký thành công, chuyển hướng vào trang tài khoản cá nhân
      navigate('/profile', { replace: true });
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Đã xảy ra lỗi trong quá trình kết nối đến máy chủ.');
    }
  };

  return <AuthFrame register productShowcase title="Đăng ký" description="Điền thông tin bên dưới để tạo tài khoản mới.">
    {error && <div className="auth-error" role="alert"><AlertCircle size={17} className="shrink-0 mt-0.5" /><span>{error}</span></div>}
    <form onSubmit={handleSubmit} className="auth-form">
      <AuthField id="register-name" label="Họ và tên" icon={User} name="fullName" type="text" autoComplete="name" required disabled={loading} value={formData.fullName} onChange={handleChange} placeholder="Nguyễn Văn An" />
      <AuthField id="register-email" label="Địa chỉ email" icon={Mail} name="email" type="email" autoComplete="email" maxLength={150} required disabled={loading} value={formData.email} onChange={handleChange} placeholder="ban@example.com" />
      <AuthField id="register-phone" label="Số điện thoại" icon={Phone} name="phone" type="tel" autoComplete="tel" required disabled={loading} value={formData.phone} onChange={handleChange} placeholder="Nhập số điện thoại" />
      <div className="auth-two-fields"><AuthField id="register-password" label="Mật khẩu" icon={Lock} name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={6} required disabled={loading} value={formData.password} onChange={handleChange} placeholder="Ít nhất 6 ký tự" reveal={showPassword} onReveal={() => setShowPassword(!showPassword)} /><AuthField id="register-confirm" label="Nhập lại mật khẩu" icon={Lock} name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required disabled={loading} value={formData.confirmPassword} onChange={handleChange} placeholder="Xác nhận mật khẩu" /></div>
      <label className="auth-checkbox"><input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} disabled={loading} /><span>Tôi đồng ý tạo và sử dụng tài khoản tại Zentro Store.</span></label>
      <button type="submit" className="auth-submit" disabled={loading}>{loading && <LoaderCircle className="animate-spin" size={17} />}{loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}</button>
    </form>
    <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
  </AuthFrame>;
}

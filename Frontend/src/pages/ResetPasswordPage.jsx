import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { readResetToken, resetPasswordError } from '../services/passwordReset';
import AuthFrame from '../components/AuthFrame';
import AuthField from '../components/AuthField';
import { Lock, LoaderCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const [token] = useState(() => readResetToken(location.hash));
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);

  useEffect(() => {
    // Keep the secret in memory, remove it from the address bar/history entry.
    if (location.hash) navigate('/reset-password', { replace: true });
  }, [location.hash, navigate]);

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    const validation = resetPasswordError(password, confirmation);
    if (validation) { setError(validation); return; }
    submitting.current = true;
    setLoading(true);
    setError('');
    try {
      await authService.resetPassword(token, password);
      if (isAuthenticated) logout();
      navigate('/login?passwordReset=success', { replace: true });
    } catch (err) {
      setError(err.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      submitting.current = false;
      setLoading(false);
    }
  }

  return <AuthFrame eyebrow="BẮT ĐẦU LẠI THẬT AN TÂM" title="Tạo mật khẩu mới." description="Đặt mật khẩu từ 8 ký tự. Liên kết khôi phục chỉ sử dụng được một lần.">
    {!token ? <div role="alert" className="space-y-4"><p className="auth-error">Liên kết không hợp lệ hoặc thiếu mã khôi phục. Hãy mở lại liên kết trong email hoặc yêu cầu liên kết mới.</p><Link to="/forgot-password" className="auth-submit">Yêu cầu liên kết mới</Link></div> : <form onSubmit={submit} className="auth-form">
      <AuthField id="new-password" label="Mật khẩu mới" icon={Lock} type={visible ? 'text' : 'password'} required minLength={8} maxLength={72} autoComplete="new-password" disabled={loading} value={password} onChange={event => setPassword(event.target.value)} placeholder="Ít nhất 8 ký tự" reveal={visible} onReveal={() => setVisible(!visible)} />
      <AuthField id="confirm-password" label="Nhập lại mật khẩu mới" icon={Lock} type={visible ? 'text' : 'password'} required minLength={8} maxLength={72} autoComplete="new-password" disabled={loading} value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder="Xác nhận mật khẩu" />
      {error && <div role="alert"><p className="auth-error">{error}</p><Link className="text-sm text-indigo-600 underline" to="/forgot-password">Yêu cầu liên kết mới</Link></div>}
      <button type="submit" disabled={loading} className="auth-submit">{loading && <LoaderCircle size={17} className="animate-spin" />}{loading ? 'Đang cập nhật...' : 'Lưu mật khẩu mới'}</button>
    </form>}
    <p className="auth-switch"><Link to="/login">Quay lại đăng nhập</Link></p>
  </AuthFrame>;
}

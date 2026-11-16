import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { readResetToken, resetPasswordError } from '../services/passwordReset';
import BrandLogo from '../components/BrandLogo';

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

  return <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
    <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm space-y-5">
      <BrandLogo size="md" />
      <h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1>
      {!token ? <div role="alert" className="space-y-3">
        <p>Liên kết không hợp lệ hoặc thiếu mã khôi phục. Hãy mở lại liên kết trong email hoặc yêu cầu liên kết mới.</p>
        <Link to="/forgot-password" className="text-indigo-600 underline">Yêu cầu liên kết mới</Link>
      </div> : <form onSubmit={submit} className="space-y-4">
        <p className="text-sm text-slate-500">Tạo mật khẩu từ 8 ký tự. Liên kết chỉ dùng được một lần.</p>
        <label className="block text-sm font-medium" htmlFor="new-password">Mật khẩu mới</label>
        <input id="new-password" type={visible ? 'text' : 'password'} required minLength={8} maxLength={72} autoComplete="new-password" disabled={loading} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border px-3 py-2" />
        <label className="block text-sm font-medium" htmlFor="confirm-password">Nhập lại mật khẩu mới</label>
        <input id="confirm-password" type={visible ? 'text' : 'password'} required minLength={8} maxLength={72} autoComplete="new-password" disabled={loading} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-xl border px-3 py-2" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={visible} onChange={(event) => setVisible(event.target.checked)} />Hiện mật khẩu</label>
        {error && <div role="alert" className="space-y-2 text-sm text-rose-700"><p>{error}</p><Link className="underline" to="/forgot-password">Yêu cầu liên kết mới</Link></div>}
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white disabled:opacity-50">{loading ? 'Đang cập nhật...' : 'Lưu mật khẩu mới'}</button>
      </form>}
      <Link to="/login" className="inline-block text-sm text-indigo-600 underline">Quay lại đăng nhập</Link>
    </section>
  </div>;
}

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';
import { PAYMENT_STATUSES } from '../services/orderModel';

export default function MomoPaymentPage() {
  const { user, isAuthenticated } = useAuth();
  const [params] = useSearchParams();
  // Only the order identifier is read from the return URL. Result codes are untrusted.
  const code = params.get('orderCode') || params.get('orderId') || '';
  return <Payment key={(user?.id || 'guest') + ':' + code} code={code} authorized={isAuthenticated} />;
}

function Payment({ code, authorized }) {
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const alive = useRef(false);
  const sending = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const valid = /^ORD-[A-Z0-9]{1,60}$/.test(code);
  useEffect(() => {
    alive.current = true;
    if (authorized && valid) {
      paymentService.status(code).then(data => { if (alive.current) setPayment(data); })
        .catch(err => { if (alive.current) setError(err.message); })
        .finally(() => { if (alive.current) setLoading(false); });
    } else setLoading(false);
    return () => { alive.current = false; };
  }, [authorized, code, valid]);

  async function action(start) {
    if (sending.current) return;
    sending.current = true;
    setBusy(true); setError('');
    try {
      const data = start === 'cancel' ? await paymentService.cancel(code) : start ? await paymentService.start(code) : await paymentService.refresh(code);
      if (!alive.current) return;
      setPayment(data);
      if (start === true && data.status === 'PENDING' && data.payUrl) window.location.assign(data.payUrl);
    } catch (err) { if (alive.current) setError(err.message || 'Chưa kiểm tra được thanh toán.'); }
    finally { sending.current = false; if (alive.current) setBusy(false); }
  }

  return <section className="mx-auto max-w-xl px-4 py-12"><div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
    <span className="rounded-lg bg-orange-50 px-3 py-1 text-sm text-orange-700">MoMo Sandbox · Thanh toán thử nghiệm</span>
    <h1 className="text-2xl font-bold">Thanh toán đơn hàng</h1>
    {!authorized ? <><p>Đăng nhập bằng tài khoản đã đặt đơn để kiểm tra thanh toán.</p><button className="rounded-xl bg-orange-700 px-5 py-3 text-white" onClick={() => navigate('/login', { state: { from: { pathname: location.pathname, search: location.search } } })}>Đăng nhập</button></>
      : !valid ? <p role="alert">Thiếu hoặc sai mã đơn hàng. Mở lại đơn từ lịch sử mua hàng.</p>
      : <>
        <p className="break-all text-sm">Mã đơn: <strong>{code}</strong></p>
        {loading && <p role="status">Đang kiểm tra thanh toán...</p>}
        {payment && <><p className="text-2xl font-bold">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(payment.amount)}</p>
          <p role="status" className={payment.status === 'SUCCESS' ? 'font-semibold text-emerald-700' : 'font-semibold'}>{PAYMENT_STATUSES[payment.status]}</p>
          <p className="text-sm leading-6 text-slate-600">{payment.status === 'SUCCESS' ? 'Hệ thống đã xác minh thanh toán MoMo. Bạn không cần thanh toán COD khi nhận hàng.' : payment.status === 'PENDING' ? 'Đơn đã được tạo. Nếu bạn vừa thanh toán, hãy kiểm tra kết quả trước khi mở lại MoMo. Không cần đặt thêm đơn.' : 'Giao dịch đã kết thúc. Xem chi tiết đơn hàng trước khi đặt đơn mới.'}</p>
        </>}
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <div className="flex flex-wrap gap-3">
          {payment?.status === 'PENDING' && <button disabled={busy || loading} onClick={() => action(true)} className="rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white disabled:opacity-50">Mở thanh toán MoMo</button>}
          {(!payment || payment.status === 'PENDING') && <button disabled={busy || loading} onClick={() => action(false)} className="rounded-xl border border-slate-200 px-5 py-3 disabled:opacity-50">{busy ? 'Đang xử lý...' : 'Kiểm tra kết quả'}</button>}
          {payment?.status === 'PENDING' && payment.canCancel === true && <button disabled={busy || loading} onClick={() => { if (window.confirm('Hủy đơn chưa mở thanh toán MoMo?')) void action('cancel'); }} className="rounded-xl border border-slate-200 px-5 py-3 text-rose-700 disabled:opacity-50">Hủy đơn chưa thanh toán</button>}
        </div>
      </>}
    <Link className="block text-sm underline" to={'/orders' + (valid ? '?orderCode=' + encodeURIComponent(code) : '')}>Xem đơn hàng</Link>
  </div></section>;
}

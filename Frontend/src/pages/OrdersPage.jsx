import { formatDisplayDateTime } from '../services/dateDisplay';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, Eye, Ban, X, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../services/orderModel';

const button = 'rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-50';
const money = (value) => value == null ? 'Chưa có thông tin' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const date = formatDisplayDateTime;
const progressSteps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

function OrderProgress({ status }) {
  if (status === 'CANCELLED') return null;
  const current = progressSteps.indexOf(status);
  return <ol aria-label="Tiến độ đơn hàng" className="grid grid-cols-5 gap-2">
    {progressSteps.map((step, index) => <li key={step} aria-current={step === status ? 'step' : undefined} className="text-center">
      <span className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs ${index <= current ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{index <= current ? <Check size={14} /> : index + 1}</span>
      <span className={`mt-2 block text-[10px] sm:text-xs ${index <= current ? 'text-indigo-700' : 'text-slate-400'}`}>{ORDER_STATUSES[step]}</span>
    </li>)}
  </ol>;
}

function OrderItems({ items }) {
  return <div className="divide-y divide-slate-100">{items.map((item, index) => <div key={item.productId + ':' + index} className="flex items-start justify-between gap-4 py-3">
    <div className="flex gap-3"><Package className="mt-1 h-5 w-5 shrink-0 text-indigo-400" /><div><p className="text-sm font-semibold">{item.name}</p><p className="mt-1 text-xs text-slate-500">{money(item.price)} × {item.quantity}</p></div></div>
    <strong className="shrink-0 text-sm">{money(item.lineTotal)}</strong>
  </div>)}</div>;
}

export default function OrdersPage({ embedded = false }) {
  const { user, isAuthenticated } = useAuth();
  return <CustomerOrders key={user?.id || user?.email || 'guest'} authenticated={isAuthenticated} embedded={embedded} />;
}

function CustomerOrders({ authenticated, embedded }) {
  const [params, setParams] = useSearchParams();
  const requestedStatus = params.get('status') || 'all';
  const status = Object.hasOwn(ORDER_STATUSES, requestedStatus) ? requestedStatus : 'all';
  const requestedPage = Number(params.get('page') || 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const code = params.get('orderCode') || '';
  const [refresh, setRefresh] = useState(0);
  const [list, setList] = useState({ key: '', data: null, error: '' });
  const [detail, setDetail] = useState({ key: '', data: null, error: '' });
  const [cancelling, setCancelling] = useState(null);
  const [reason, setReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelBlocked, setCancelBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const mounted = useRef(false);
  const submitting = useRef(false);
  const listKey = JSON.stringify([status, page, refresh]);
  const detailKey = JSON.stringify([code, refresh]);
  const loading = list.key !== listKey;
  const data = loading ? null : list.data;
  const error = loading ? '' : list.error;
  const detailLoading = detail.key !== detailKey;
  const selected = detailLoading ? null : detail.data;

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    orderService.getMyOrders({ page, limit: 10, status }).then((result) => {
      if (!active) return;
      const lastPage = Math.max(1, result.totalPages);
      if (page > lastPage) {
        setParams((previous) => { const next = new URLSearchParams(previous); next.set('page', lastPage); return next; }, { replace: true });
        return;
      }
      setList({ key: listKey, data: result, error: '' });
    }).catch((err) => { if (active) setList({ key: listKey, data: null, error: err.message }); });
    return () => { active = false; };
  }, [authenticated, status, page, listKey, setParams]);

  useEffect(() => {
    if (!authenticated || !code) return;
    let active = true;
    orderService.getOrderByCode(code).then((result) => {
      if (active) setDetail({ key: detailKey, data: result, error: '' });
    }).catch((err) => { if (active) setDetail({ key: detailKey, data: null, error: err.message }); });
    return () => { active = false; };
  }, [authenticated, code, detailKey]);

  function changeParam(name, value) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (!value || value === 'all') next.delete(name);
      else next.set(name, String(value));
      if (name === 'status') next.delete('page');
      return next;
    });
  }
  function openCancel(order) {
    if (busy) return;
    setCancelling(order);
    setReason('');
    setCancelError('');
    setCancelBlocked(false);
  }

  async function cancel(event) {
    event.preventDefault();
    if (!cancelling || submitting.current || cancelBlocked) return;
    submitting.current = true;
    setBusy(true);
    setCancelError('');
    try {
      const confirmed = await orderService.cancelOrder(cancelling.orderCode, reason);
      if (!mounted.current) return;
      setNotice('Đã hủy đơn ' + confirmed.orderCode + '. Tồn kho đã được xử lý tại máy chủ.');
      setCancelling(null);
      setRefresh((value) => value + 1);
    } catch (err) {
      if (!mounted.current) return;
      const uncertain = !err.status || err.status >= 500;
      setCancelError(uncertain
        ? 'Chưa nhận được xác nhận hủy. Bạn có thể đóng để tải lại đơn hoặc gửi lại yêu cầu. ' + (err.message || '')
        : err.message || 'Không thể hủy đơn. Vui lòng kiểm tra lại.');
      if (err.status === 404 || err.status === 409) {
        setCancelBlocked(true);
        setRefresh((value) => value + 1);
      }
    } finally {
      submitting.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  if (!authenticated) return <div className="p-12 text-center space-y-4"><h1 className="text-xl font-bold">Đăng nhập để xem đơn hàng</h1><Link className="text-indigo-600 underline" to="/login" state={{ from: { pathname: '/orders' } }}>Đăng nhập</Link></div>;

  return <div className={embedded ? 'space-y-6' : 'max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-6'}>
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold">Đơn hàng của tôi</h1><p className="mt-1 text-sm text-slate-500">Xem thông tin, theo dõi trạng thái và quản lý đơn đã đặt.</p></div>
      <button disabled={busy} className={button} onClick={() => setRefresh((value) => value + 1)}>Tải lại</button>
    </header>
    {notice && <p role="status" className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
    <div className="flex flex-wrap gap-2" aria-label="Lọc trạng thái đơn hàng">
      {[['all', 'Tất cả'], ...Object.entries(ORDER_STATUSES)].map(([value, label]) => <button key={value} disabled={busy} aria-pressed={status === value} onClick={() => changeParam('status', value)} className={`${button} ${status === value ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}>{label}</button>)}
    </div>
    {loading ? <p role="status" className="py-12 text-center">Đang tải đơn hàng...</p> : error ? <div role="alert" className="rounded-3xl bg-rose-50 p-6 text-rose-700"><p>{error}</p><button className="mt-3 underline" onClick={() => setRefresh((value) => value + 1)}>Thử lại</button></div> : !data.orders.length ? <div className="rounded-3xl border bg-white p-12 text-center space-y-4"><Package className="mx-auto text-indigo-500" size={36} /><p>Không có đơn hàng trong mục này.</p><Link className="text-indigo-600 underline" to="/products">Tiếp tục mua sắm</Link></div> : <div className="space-y-5">
      {data.orders.map((order) => <article key={order.id} className="rounded-3xl border border-slate-200 bg-white overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-slate-50 px-5 py-4"><div><h2 className="break-all text-sm font-bold">{order.orderCode}</h2><p className="mt-1 text-xs text-slate-500">Ngày đặt: {date(order.createdAt)}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${order.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700' : order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>{ORDER_STATUSES[order.status]}</span></div>
        <div className="p-5 space-y-4"><OrderProgress status={order.status} /><OrderItems items={order.items} />{order.status === 'CANCELLED' && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">Đã hủy: {order.cancelReason || 'Chưa có lý do'} · {date(order.cancelledAt)}</p>}</div>
        <footer className="flex flex-wrap items-center justify-between gap-4 border-t bg-slate-50 px-5 py-4"><div className="text-xs text-slate-500"><p>{PAYMENT_METHODS[order.paymentMethod] || 'Chưa có thông tin thanh toán'} · {PAYMENT_STATUSES[order.paymentStatus] || 'Chưa có thông tin'}</p><p className="mt-1">Tổng tiền: <strong className="text-base text-indigo-600">{money(order.total)}</strong></p></div><div className="flex flex-wrap gap-2">{order.paymentMethod === 'MOMO' && order.paymentStatus === 'PENDING' && <Link className={button} to={'/payments/momo?orderCode=' + encodeURIComponent(order.orderCode)}>MoMo</Link>}<button disabled={busy} className={button} onClick={() => changeParam('orderCode', order.orderCode)}><Eye className="inline mr-1" size={15} />Chi tiết</button>{order.canCancel && <button disabled={busy} className={`${button} text-rose-600`} onClick={() => openCancel(order)}><Ban className="inline mr-1" size={15} />Hủy đơn</button>}</div></footer>
      </article>)}
    </div>}
    {!loading && !error && data && data.total > 0 && <nav aria-label="Phân trang đơn hàng" className="flex flex-wrap items-center justify-between gap-3 text-sm"><span>{data.total} đơn khớp bộ lọc · Trang {page}/{Math.max(1, data.totalPages)}</span><div className="flex gap-2"><button disabled={busy || page <= 1} className={button} onClick={() => changeParam('page', page - 1)}>Trước</button><button disabled={busy || page >= data.totalPages} className={button} onClick={() => changeParam('page', page + 1)}>Sau</button></div></nav>}

    {code && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><section role="dialog" aria-modal="true" aria-labelledby="order-detail-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 space-y-5">
      <header className="flex items-start justify-between gap-4"><h2 id="order-detail-title" className="break-all font-bold text-lg">Chi tiết đơn {code}</h2><button aria-label="Đóng chi tiết" disabled={busy} onClick={() => changeParam('orderCode', '')}><X /></button></header>
      {detailLoading ? <p role="status">Đang tải chi tiết...</p> : detail.error ? <div role="alert" className="space-y-3 text-rose-700"><p>{detail.error}</p><button className="underline" onClick={() => setRefresh((value) => value + 1)}>Thử lại</button></div> : selected && <>
        <p className="text-sm font-semibold text-indigo-700">{ORDER_STATUSES[selected.status]} · {date(selected.createdAt)}</p>
        <OrderProgress status={selected.status} /><OrderItems items={selected.items} />
        <div className="rounded-2xl bg-slate-50 p-4 text-sm space-y-2">
          <p><strong>Người nhận:</strong> {selected.receiverName || 'Chưa có thông tin'}</p><p><strong>Điện thoại:</strong> {selected.receiverPhone || 'Chưa có thông tin'}</p><p><strong>Địa chỉ:</strong> {selected.shippingAddress || 'Chưa có thông tin'}</p>
          {selected.note && <p><strong>Ghi chú:</strong> {selected.note}</p>}
          <p>{PAYMENT_METHODS[selected.paymentMethod] || 'Chưa có phương thức thanh toán'} · {PAYMENT_STATUSES[selected.paymentStatus] || 'Chưa có thông tin'}</p>
          <div className="flex justify-between border-t pt-3"><span>Tiền hàng</span><span>{money(selected.subtotal)}</span></div><div className="flex justify-between"><span>Phí giao hàng</span><span>{money(selected.shippingFee)}</span></div><div className="flex justify-between font-bold"><span>Tổng tiền</span><span>{money(selected.total)}</span></div>
        </div>
        {selected.status === 'CANCELLED' && <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">Lý do: {selected.cancelReason || 'Chưa có thông tin'}<br />Thời điểm hủy: {date(selected.cancelledAt)}</p>}
        {selected.canCancel && <button disabled={busy} className={`${button} text-rose-600`} onClick={() => openCancel(selected)}>Hủy đơn này</button>}
      </>}
    </section></div>}

    {cancelling && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4"><section role="dialog" aria-modal="true" aria-labelledby="order-cancel-title" className="w-full max-w-lg rounded-3xl bg-white p-6 space-y-4">
      <h2 id="order-cancel-title" className="break-all text-lg font-bold">Hủy đơn {cancelling.orderCode}?</h2><p className="text-sm text-slate-500">Đơn sau khi hủy không thể khôi phục. Sản phẩm sẽ được hoàn kho tại máy chủ.</p>
      <form onSubmit={cancel} className="space-y-4"><label htmlFor="cancel-reason" className="block text-sm font-semibold">Lý do hủy</label><textarea id="cancel-reason" required maxLength={500} rows={3} disabled={busy || cancelBlocked} value={reason} onChange={(event) => setReason(event.target.value)} className="w-full rounded-xl border p-3 text-sm" />
        {cancelError && <p role="alert" className="text-sm text-rose-700">{cancelError}</p>}
        {cancelBlocked && <p className="text-sm text-slate-500">Dữ liệu đơn đã được yêu cầu tải lại. Đóng hộp thoại để kiểm tra trạng thái mới.</p>}
        <div className="flex justify-end gap-3"><button type="button" disabled={busy} className={button} onClick={() => setCancelling(null)}>Giữ lại / Đóng</button><button type="submit" disabled={busy || cancelBlocked || !reason.trim()} className={`${button} bg-rose-600 text-white`}>{busy ? 'Đang hủy...' : 'Xác nhận hủy'}</button></div>
      </form>
    </section></div>}
  </div>;
}

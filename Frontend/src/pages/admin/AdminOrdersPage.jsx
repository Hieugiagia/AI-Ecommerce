import { useEffect, useId, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { ORDER_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../../services/orderModel';

const button = 'rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold disabled:opacity-50';
const input = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm';
const money = (value) => value == null ? 'Chưa có thông tin' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const date = (value) => !value || Number.isNaN(new Date(value).getTime()) ? 'Chưa có thông tin' : new Date(value).toLocaleString('vi-VN');
const actionLabels = { CONFIRMED: 'Xác nhận đơn', PROCESSING: 'Bắt đầu đóng gói', SHIPPED: 'Bàn giao vận chuyển', DELIVERED: 'Hoàn tất giao hàng và thu COD' };

function Modal({ title, busy, onClose, children }) {
  const dialog = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return <dialog ref={dialog} aria-labelledby={titleId} onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} className="m-auto max-h-[90vh] w-[calc(100%_-_2rem)] max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 text-slate-800 shadow-2xl backdrop:bg-slate-950/50">
    <header className="mb-5 flex items-start justify-between gap-4"><h2 id={titleId} className="break-all text-lg font-bold">{title}</h2><button type="button" aria-label="Đóng" disabled={busy} onClick={onClose} className="shrink-0"><X /></button></header>
    {children}
  </dialog>;
}

function Actions({ entry, busy, onSelect }) {
  return <div className="flex flex-wrap gap-2">{entry.allowedNextStatuses.map((next) => <button key={next} disabled={busy} className={`${button} bg-indigo-600 text-white`} onClick={() => onSelect(entry, next)}>{actionLabels[next]}</button>)}</div>;
}

function OrderDetail({ entry }) {
  const order = entry.order;
  return <div className="space-y-5">
    <p className="font-semibold text-indigo-700">{ORDER_STATUSES[order.status]} · {date(order.createdAt)}</p>
    <div className="rounded-2xl bg-slate-50 p-4 text-sm space-y-2">
      <p><strong>Tài khoản:</strong> {entry.customerName || 'Chưa có thông tin'} (#{entry.customerId})</p>
      <p><strong>Email tài khoản:</strong> {entry.customerEmail || 'Chưa có thông tin'}</p>
      <p><strong>Người nhận:</strong> {order.receiverName || 'Chưa có thông tin'}</p>
      <p><strong>Điện thoại:</strong> {order.receiverPhone || 'Chưa có thông tin'}</p>
      <p><strong>Địa chỉ giao hàng:</strong> {order.shippingAddress || 'Chưa có thông tin'}</p>
      {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>}
    </div>
    <div className="divide-y divide-slate-100">{order.items.map((item, index) => <div key={item.productId + ':' + index} className="flex justify-between gap-4 py-3 text-sm"><div><p className="font-semibold">{item.name}</p><p className="mt-1 text-slate-500">{money(item.price)} × {item.quantity}</p></div><strong className="shrink-0">{money(item.lineTotal)}</strong></div>)}</div>
    <div className="rounded-2xl border border-slate-200 p-4 text-sm space-y-2">
      <p>{PAYMENT_METHODS[order.paymentMethod] || 'Chưa có phương thức thanh toán'} · <strong>{PAYMENT_STATUSES[order.paymentStatus] || 'Chưa có thông tin'}</strong></p>
      <div className="flex justify-between"><span>Tiền hàng</span><span>{money(order.subtotal)}</span></div>
      <div className="flex justify-between"><span>Phí giao hàng</span><span>{money(order.shippingFee)}</span></div>
      <div className="flex justify-between border-t pt-2 font-bold"><span>Tổng tiền</span><span>{money(order.total)}</span></div>
    </div>
    {order.status === 'CANCELLED' && <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700"><p>Lý do hủy: {order.cancelReason || 'Chưa có thông tin'}</p><p>Thời điểm: {date(order.cancelledAt)}</p></div>}
    <p className="text-xs text-slate-500">Cập nhật gần nhất: {date(entry.updatedAt)}</p>
  </div>;
}

export default function AdminOrdersPage() {
  const { user, isAdmin } = useAuth();
  return <AdminOrders key={user?.id || user?.email || 'guest'} authorized={isAdmin} />;
}

function AdminOrders({ authorized }) {
  const [params, setParams] = useSearchParams();
  const customersTab = params.get('tab') === 'customers';
  const rawStatus = params.get('status') || 'all';
  const status = Object.hasOwn(ORDER_STATUSES, rawStatus) ? rawStatus : 'all';
  const q = params.get('q') || '';
  const rawPage = Number(params.get('page') || 1);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const code = params.get('orderCode') || '';
  const [refresh, setRefresh] = useState(0);
  const [list, setList] = useState({ key: '', data: null, error: '' });
  const [detail, setDetail] = useState({ key: '', data: null, error: '' });
  const [transition, setTransition] = useState(null);
  const [codCollected, setCodCollected] = useState(false);
  const [transitionError, setTransitionError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const submitting = useRef(false);
  const mounted = useRef(false);
  const listKey = JSON.stringify([q, status, page, refresh]);
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
    if (!authorized || customersTab) return;
    let active = true;
    const timer = setTimeout(() => {
      orderService.getAllOrders({ q, status, page, limit: 10 }).then((result) => {
        if (!active) return;
        const lastPage = Math.max(1, result.totalPages);
        if (page > lastPage) {
          setParams((previous) => { const next = new URLSearchParams(previous); next.set('page', lastPage); return next; }, { replace: true });
          return;
        }
        setList({ key: listKey, data: result, error: '' });
      }).catch((err) => { if (active) setList({ key: listKey, data: null, error: err.message || 'Không tải được đơn hàng.' }); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [authorized, customersTab, q, status, page, listKey, setParams]);

  useEffect(() => {
    if (!authorized || customersTab || !code) return;
    let active = true;
    orderService.getAdminOrderByCode(code).then((result) => {
      if (active) setDetail({ key: detailKey, data: result, error: '' });
    }).catch((err) => { if (active) setDetail({ key: detailKey, data: null, error: err.message || 'Không tải được chi tiết đơn.' }); });
    return () => { active = false; };
  }, [authorized, customersTab, code, detailKey]);

  function changeParam(name, value) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (!value || value === 'all') next.delete(name);
      else next.set(name, String(value));
      if (name === 'q' || name === 'status') next.delete('page');
      return next;
    }, { replace: name === 'q' });
  }

  function chooseTransition(entry, nextStatus) {
    if (busy) return;
    setTransition({ entry, expectedStatus: entry.order.status, status: nextStatus });
    setCodCollected(false);
    setTransitionError('');
    setBlocked(false);
  }

  async function confirmTransition(event) {
    event.preventDefault();
    if (!transition || submitting.current || blocked) return;
    submitting.current = true;
    setBusy(true);
    setTransitionError('');
    try {
      const confirmed = await orderService.updateOrderStatus(transition.entry.order.orderCode, {
        expectedStatus: transition.expectedStatus,
        status: transition.status,
        codCollected,
      });
      if (!mounted.current) return;
      setNotice('Đã cập nhật ' + confirmed.order.orderCode + ': ' + ORDER_STATUSES[confirmed.order.status] + '. Thanh toán: ' + (PAYMENT_STATUSES[confirmed.order.paymentStatus] || 'Chưa có thông tin') + '.');
      setTransition(null);
      setRefresh((value) => value + 1);
    } catch (err) {
      if (!mounted.current) return;
      setTransitionError(!err.status || err.status >= 500
        ? 'Chưa nhận được xác nhận cập nhật. Bạn có thể gửi lại cùng bước hoặc đóng hộp thoại và tải lại đơn để kiểm tra. ' + (err.message || '')
        : err.message || 'Không thể cập nhật đơn.');
      if ([403, 404, 409].includes(err.status)) {
        setBlocked(true);
        setRefresh((value) => value + 1);
      }
    } finally {
      submitting.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  if (!authorized) return <p role="alert" className="rounded-xl bg-rose-50 p-6 text-rose-700">Bạn không có quyền quản lý đơn hàng.</p>;
  if (customersTab) return <section className="rounded-3xl border bg-white p-6 space-y-4"><h1 className="text-xl font-bold">Khách hàng &amp; Hội viên</h1><p className="text-sm text-slate-500">Chức năng quản lý khách hàng riêng đang được hoàn thiện. Thông tin tài khoản và người nhận hiện có trong chi tiết từng đơn hàng.</p><button className={button} onClick={() => setParams({})}>Xem đơn hàng</button></section>;

  return <div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-6">
      <div><h1 className="text-2xl font-bold">Quản lý đơn hàng</h1><p className="mt-1 text-sm text-slate-500">Xác nhận, đóng gói, giao hàng và hoàn tất thanh toán COD.</p></div>
      <button disabled={busy} className={button} onClick={() => setRefresh((value) => value + 1)}>Tải lại</button>
    </header>
    {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
    <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_15rem]"><input aria-label="Tìm đơn hàng" disabled={busy} maxLength={200} className={input} placeholder="Mã đơn, người nhận, điện thoại hoặc email..." value={q} onChange={(event) => changeParam('q', event.target.value)} /><select aria-label="Trạng thái đơn hàng" disabled={busy} className={input} value={status} onChange={(event) => changeParam('status', event.target.value)}><option value="all">Tất cả trạng thái</option>{Object.entries(ORDER_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      {loading ? <p role="status" className="py-12 text-center">Đang tải đơn hàng...</p> : error ? <div role="alert" className="rounded-xl bg-rose-50 p-4 text-rose-700"><p>{error}</p><button className="mt-3 underline" onClick={() => setRefresh((value) => value + 1)}>Thử lại</button></div> : !data.orders.length ? <p className="py-12 text-center text-slate-500">Không có đơn phù hợp.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-400">{['Đơn hàng', 'Người nhận', 'Tổng tiền', 'Trạng thái / Thanh toán', 'Thao tác'].map((label) => <th key={label} className="px-2 py-3">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{data.orders.map((entry) => <tr key={entry.order.id}>
        <td className="px-2 py-4"><p className="max-w-64 break-all font-semibold">{entry.order.orderCode}</p><p className="mt-1 text-xs text-slate-500">{date(entry.order.createdAt)}</p></td>
        <td className="px-2 py-4"><p>{entry.order.receiverName || 'Chưa có thông tin'}</p><p className="mt-1 text-xs text-slate-500">{entry.order.receiverPhone}</p></td>
        <td className="px-2 py-4 font-bold">{money(entry.order.total)}</td>
        <td className="px-2 py-4"><span className="font-semibold text-indigo-700">{ORDER_STATUSES[entry.order.status]}</span><p className="mt-1 text-xs text-slate-500">{PAYMENT_STATUSES[entry.order.paymentStatus] || 'Chưa có thông tin'}</p></td>
        <td className="px-2 py-4 space-y-2"><button disabled={busy} className={button} onClick={() => changeParam('orderCode', entry.order.orderCode)}><Eye size={15} className="mr-1 inline" />Chi tiết</button><Actions entry={entry} busy={busy} onSelect={chooseTransition} /></td>
      </tr>)}</tbody></table></div>}
      {!loading && !error && data && <nav aria-label="Phân trang đơn admin" className="flex flex-wrap items-center justify-between gap-3 text-sm"><span>{data.total} đơn khớp bộ lọc · Trang {page}/{Math.max(1, data.totalPages)}</span><div className="flex gap-2"><button disabled={busy || page <= 1} className={button} onClick={() => changeParam('page', page - 1)}>Trước</button><button disabled={busy || page >= data.totalPages} className={button} onClick={() => changeParam('page', page + 1)}>Sau</button></div></nav>}
    </section>
    {code && <Modal title={'Chi tiết đơn ' + code} busy={busy} onClose={() => changeParam('orderCode', '')}>
      {detailLoading ? <p role="status">Đang tải chi tiết...</p> : detail.error ? <div role="alert" className="space-y-3 text-rose-700"><p>{detail.error}</p><button className="underline" onClick={() => setRefresh((value) => value + 1)}>Thử lại</button></div> : selected && <div className="space-y-5"><OrderDetail entry={selected} /><Actions entry={selected} busy={busy} onSelect={chooseTransition} />{!selected.allowedNextStatuses.length && <p className="text-sm text-slate-500">Đơn hiện không có bước xử lý tiếp theo được phép.</p>}</div>}
    </Modal>}
    {transition && <Modal title={actionLabels[transition.status]} busy={busy} onClose={() => setTransition(null)}>
      <form onSubmit={confirmTransition} className="space-y-5">
        <p className="break-all text-sm font-semibold">{transition.entry.order.orderCode}</p><p className="text-sm">{ORDER_STATUSES[transition.expectedStatus]} → <strong>{ORDER_STATUSES[transition.status]}</strong></p>
        {transition.status === 'DELIVERED' && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 space-y-3"><p className="text-sm font-semibold">Số tiền COD cần thu: {money(transition.entry.order.total)}</p><label className="flex items-start gap-3 text-sm"><input type="checkbox" required disabled={busy || blocked} checked={codCollected} onChange={(event) => setCodCollected(event.target.checked)} className="mt-1" /><span>Tôi xác nhận đã giao hàng thành công và thu đủ tiền COD. Thanh toán sẽ được ghi nhận là đã thanh toán.</span></label></div>}
        {transitionError && <p role="alert" className="text-sm text-rose-700">{transitionError}</p>}
        {blocked && <p className="text-sm text-slate-500">Dữ liệu đã được yêu cầu tải lại. Đóng hộp thoại để xem trạng thái mới trước khi thao tác tiếp.</p>}
        <div className="flex justify-end gap-3"><button type="button" disabled={busy} className={button} onClick={() => setTransition(null)}>Đóng</button><button type="submit" disabled={busy || blocked || (transition.status === 'DELIVERED' && !codCollected)} className={`${button} bg-indigo-600 text-white`}>{busy ? 'Đang cập nhật...' : 'Xác nhận'}</button></div>
      </form>
    </Modal>}
  </div>;
}

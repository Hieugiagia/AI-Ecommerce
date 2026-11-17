import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, RefreshCw, ShoppingBag, Clock3, Wallet, Package, MapPin, UserRound, CalendarDays } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loadStoreOverview } from '../../services/storeOverviewService';
import { collectedCod, orderActivity } from '../../services/adminOverviewModel';
import { ORDER_STATUSES } from '../../services/orderModel';

const money = (value) => value == null ? '—' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
const count = (value) => value == null ? '—' : new Intl.NumberFormat('vi-VN').format(value);
const initials = (name) => (name || 'KH').trim().split(/\s+/).map((word) => word[0]).slice(-2).join('').toUpperCase();
const shortCode = (value) => value.length > 17 ? value.slice(0, 8) + '…' + value.slice(-5) : value;
const date = (value) => value ? new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'Chưa có ngày đặt';

function Metric({ title, icon: Icon, value, note, loading, children, currency = false }) {
  return <article className="admin-metric"><div className="admin-metric-label"><span>{title}</span><span className="admin-metric-icon"><Icon size={13} /></span></div>
    <div className={'admin-metric-value' + (currency ? ' is-money' : '')}>{loading ? <div className="admin-skeleton" /> : value}</div><p className="admin-metric-note">{note}</p>{children}
  </article>;
}
function Sparkline({ points }) {
  const gradientId = useId().replace(/:/g, '');
  const max = Math.max(1, ...points.map((point) => point.count));
  const coordinates = points.map((point, index) => [index * 200 / Math.max(1, points.length - 1), 46 - point.count / max * 35]);
  const path = coordinates.map(([x, y], index) => (index ? 'L' : 'M') + x + ',' + y).join(' ');
  return <svg className="admin-mini-line" viewBox="0 0 200 50" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#a38bdf" stopOpacity=".16" /><stop offset="1" stopColor="#a38bdf" stopOpacity="0" /></linearGradient></defs><path d={path + ' L200,50 L0,50 Z'} fill={'url(#' + gradientId + ')'} /><path d={path} fill="none" stroke="#9d83d6" strokeWidth="1.6" />{coordinates.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="1.8" fill="#faf8ff" stroke="#8f73c8" strokeWidth="1" />)}</svg>;
}

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(0);
  const [result, setResult] = useState({ version: -1, data: null, error: '' });
  const [period, setPeriod] = useState(7);
  const [group, setGroup] = useState('recent');
  const [selectedCode, setSelectedCode] = useState('');
  useEffect(() => {
    let active = true;
    loadStoreOverview().then((data) => { if (active) setResult({ version: refresh, data, error: '' }); })
      .catch((error) => { if (active) setResult({ version: refresh, data: null, error: error.message }); });
    return () => { active = false; };
  }, [refresh]);

  const loading = result.version !== refresh;
  const data = loading ? null : result.data;
  const recent = data?.recent?.orders || [];
  const activity = orderActivity(recent, period);
  const maxActivity = Math.max(1, ...activity.map((day) => day.count));
  const groupData = data?.[group];
  const visible = groupData?.orders.slice(0, 5) || [];
  const selected = visible.find((entry) => entry.order.orderCode === selectedCode) || visible[0];
  const now = new Date();
  const displayName = user?.fullName?.trim().split(/\s+/).slice(-1)[0] || 'bạn';
  const products = data?.products?.products || [];
  const cod = data?.recent ? collectedCod(recent) : null;

  return <div className="admin-overview">
    <div className="admin-overview-heading"><div><div className="admin-eyebrow"><i /> ALIBABA STORE / TỔNG QUAN</div><h1>Một góc nhìn. Cả cửa hàng.</h1><p>Chào {displayName}, cùng theo dõi đơn hàng và những việc cần xử lý hôm nay.</p></div><div className="admin-heading-actions"><button disabled={loading} className="admin-soft-button" onClick={() => setRefresh((value) => value + 1)}><RefreshCw size={13} className={loading ? 'animate-spin' : ''} /><span>Làm mới</span></button><Link className="admin-primary" to="/admin/orders?status=PENDING">Xử lý đơn hàng <ArrowUpRight size={15} /></Link></div></div>
    {loading && <span className="sr-only" role="status">Đang tải tổng quan cửa hàng</span>}
    {!loading && (result.error || data?.errors.length > 0) && <div role="alert" className="admin-error-strip"><span>{result.error || 'Chưa tải được một số dữ liệu: ' + data.errors.join(', ') + '.'}</span><button onClick={() => setRefresh((value) => value + 1)}>Thử lại</button></div>}
    <div className="admin-metric-grid">
      <Metric title="Tổng đơn hàng" icon={ShoppingBag} value={count(data?.recent?.total)} note="Đơn đã ghi nhận trong hệ thống" loading={loading}><Sparkline points={activity} /></Metric>
      <Metric title="Chờ xác nhận" icon={Clock3} value={count(data?.pending?.total)} note="Sẵn sàng cho bước xử lý tiếp theo" loading={loading}><div className="admin-metric-art" aria-hidden="true">{activity.slice(-7).map((day) => <span key={day.key} style={{ height: Math.max(3, day.count / maxActivity * 44) }} />)}</div></Metric>
      <Metric title="COD đã thu" icon={Wallet} value={money(cod)} note={'Trong ' + (data?.recent ? recent.length : '—') + ' đơn gần nhất được tải'} loading={loading} currency><Sparkline points={orderActivity(recent.filter((entry) => entry.order.paymentMethod === 'COD' && entry.order.paymentStatus === 'SUCCESS'), period)} /></Metric>
      <Metric title="Sản phẩm trong kho" icon={Package} value={count(data?.products?.total)} note={data?.categories ? data.categories.length + ' danh mục · Quản lý toàn bộ trạng thái' : 'Quản lý danh mục hàng hóa'} loading={loading}><div className="admin-metric-product-art">{products.slice(0, 3).map((product) => <img key={product.id} src={product.image} alt="" />)}</div></Metric>
    </div>
    <div className="admin-status-strip"><div><h2>Nhịp vận hành cửa hàng</h2><p>{data?.recent ? 'Dựa trên ' + recent.length + ' đơn gần nhất được tải' : 'Dữ liệu đơn hàng và tiến độ xử lý'}</p></div><div className="admin-period-switch" aria-label="Khoảng thời gian biểu đồ">{[7, 14].map((days) => <button key={days} aria-pressed={period === days} className={period === days ? 'is-active' : ''} onClick={() => setPeriod(days)}>{days} ngày</button>)}</div></div>
    <div className="admin-chart-and-actions">
      <section className="admin-chart-card"><div className="admin-chart-title"><strong>Đơn hàng theo ngày</strong><span><CalendarDays size={11} className="inline mr-1" />{now.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
        {loading ? <div className="admin-chart-empty">Đang tải dữ liệu…</div> : !data?.recent ? <div className="admin-chart-empty">Chưa tải được dữ liệu biểu đồ</div> : <div className="admin-activity-chart" role="img" aria-label={'Số đơn theo ngày: ' + activity.map((day) => day.label + ': ' + day.count).join(', ')}>{activity.map((day) => <div key={day.key} className="admin-chart-column" title={day.label + ': ' + day.count + ' đơn'}><b>{day.count || ''}</b><i style={{ height: day.count ? Math.max(8, day.count / maxActivity * 72) : 2 }} /><span>{day.label}</span></div>)}</div>}
      </section>
      <section className="admin-quick-card"><small>GIỮ MỌI THỨ TRONG TẦM TAY</small><h3>Kho hàng gọn gàng.<br />Vận hành nhẹ nhàng.</h3><p>Cập nhật sản phẩm, giá bán và tồn kho trong cùng một không gian làm việc.</p><Link to="/admin/products">Quản lý sản phẩm <ArrowUpRight size={13} /></Link></section>
    </div>
    <section className="admin-operations">
      <div className="admin-operations-head"><div><h2>Đơn hàng cần bạn quan tâm</h2><p>Chọn một đơn để xem nhanh thông tin</p></div><nav className="admin-order-tabs" aria-label="Nhóm đơn tổng quan">{[['recent', 'Gần đây'], ['pending', 'Chờ xác nhận'], ['shipping', 'Đang giao']].map(([value, label]) => <button key={value} className={group === value ? 'is-active' : ''} aria-pressed={group === value} onClick={() => { setGroup(value); setSelectedCode(''); }}>{label}{value !== 'recent' && <b>{count(data?.[value]?.total)}</b>}</button>)}</nav></div>
      {loading ? <div className="admin-operations-empty" role="status">Đang tải danh sách đơn hàng…</div> : !visible.length ? <div className="admin-operations-empty">{groupData ? 'Chưa có đơn hàng trong mục này.' : 'Chưa tải được danh sách. Hãy thử làm mới dữ liệu.'}</div> : <div className="admin-order-workspace">
        <div className="admin-order-list">{visible.map((entry) => <button className={'admin-order-row' + (entry.order.orderCode === selected?.order.orderCode ? ' is-active' : '')} key={entry.order.id} aria-pressed={entry.order.orderCode === selected?.order.orderCode} onClick={() => setSelectedCode(entry.order.orderCode)}><span className="admin-order-initials">{initials(entry.order.receiverName)}</span><span className="admin-order-row-text"><strong title={entry.order.orderCode}>{shortCode(entry.order.orderCode)}</strong><small>{date(entry.order.createdAt)} · {entry.order.receiverName || 'Khách hàng'}</small></span><em>{money(entry.order.total)}</em></button>)}</div>
        {selected && <article className="admin-order-selected"><div><div className="admin-selected-heading"><div><small>CHI TIẾT ĐƠN HÀNG</small><h3 title={selected.order.orderCode}>{shortCode(selected.order.orderCode)}</h3></div><span className="admin-selected-status">{ORDER_STATUSES[selected.order.status]}</span></div><p className="admin-selected-person"><UserRound size={12} />{selected.order.receiverName || 'Chưa có người nhận'}<span>·</span>{selected.order.receiverPhone}</p></div>
          <div className="admin-selected-values"><div><small>TIỀN HÀNG</small><strong>{money(selected.order.subtotal)}</strong></div><div><small>PHÍ GIAO HÀNG</small><strong>{money(selected.order.shippingFee)}</strong></div><div><small>TỔNG THANH TOÁN</small><strong>{money(selected.order.total)}</strong></div></div>
          <footer className="admin-selected-footer"><p className="admin-selected-address"><MapPin size={12} /><span>{selected.order.shippingAddress || 'Chưa có địa chỉ nhận hàng'}</span></p><Link to={'/admin/orders?orderCode=' + encodeURIComponent(selected.order.orderCode)}>Mở chi tiết đơn <ArrowUpRight size={13} /></Link></footer>
        </article>}
      </div>}
    </section>
    <section className="admin-products-strip"><div className="admin-strip-heading"><h2>Mới trong danh mục sản phẩm</h2><Link to="/admin/products">Xem tất cả <ArrowRight size={12} /></Link></div>
      {loading ? <div className="admin-skeleton" /> : !products.length ? <p className="admin-overview-subtle">{data?.products ? 'Chưa có sản phẩm. Bắt đầu xây dựng danh mục của cửa hàng.' : 'Chưa tải được danh mục sản phẩm.'}</p> : <div className="admin-preview-products">{products.map((product) => <Link className="admin-preview-product" key={product.id} to="/admin/products"><img src={product.image} alt="" /><div><strong title={product.name}>{product.name}</strong><span>{money(product.price)}</span><small>{product.stock === 0 ? 'Hết hàng' : 'Tồn kho: ' + product.stock} · {product.status === 'DRAFT' ? 'Bản nháp' : product.status === 'ARCHIVED' ? 'Ngừng bán' : 'Trong danh mục'}</small></div></Link>)}</div>}
    </section>
    {data && <p className="admin-overview-subtle">Lần tải dữ liệu gần nhất: {new Date(data.updatedAt).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })} · Số liệu đơn hàng lấy từ hệ thống cửa hàng.</p>}
  </div>;
}

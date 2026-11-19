import { formatDisplayDate } from '../../services/dateDisplay';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Wallet, Banknote, BadgeCheck, ChartNoAxesCombined, Info, MapPin, UserRound, CalendarDays } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { loadStoreOverview } from '../../services/storeOverviewService';
import { salesOverview, orderActivity } from '../../services/adminOverviewModel';
import { ORDER_STATUSES } from '../../services/orderModel';

const money = (value) => value == null ? '—' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value);
const count = (value) => value == null ? '—' : new Intl.NumberFormat('vi-VN').format(value);
const initials = (name) => (name || 'KH').trim().split(/\s+/).map((word) => word[0]).slice(-2).join('').toUpperCase();
const shortCode = (value) => value.length > 17 ? value.slice(0, 8) + '…' + value.slice(-5) : value;
const date = (value) => formatDisplayDate(value, { includeYear: false, fallback: 'Chưa có ngày đặt' });

function Metric({ title, icon: Icon, value, note, loading, children, currency = false }) {
  return <article className="admin-metric"><div className="admin-metric-label"><span>{title}</span><span className="admin-metric-icon"><Icon size={13} /></span></div>
    <div className={'admin-metric-value' + (currency ? ' is-money' : '')}>{loading ? <div className="admin-skeleton" /> : value}</div><p className="admin-metric-note">{note}</p>{children}
  </article>;
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
  const sales = data?.recent ? salesOverview(recent) : null;

  return <div className="admin-overview">
    <div className="admin-overview-heading"><div><div className="admin-eyebrow"><i /> ZENTRO STORE / TỔNG QUAN</div><h1>Tổng quan cửa hàng</h1><p>Chào {displayName}, cùng theo dõi đơn hàng và những việc cần xử lý hôm nay.</p></div><div className="admin-heading-actions"><button disabled={loading} className="admin-soft-button" onClick={() => setRefresh((value) => value + 1)}><RefreshCw size={13} className={loading ? 'animate-spin' : ''} /><span>Làm mới</span></button><Link className="admin-primary" to="/admin/orders?status=PENDING">Xử lý đơn hàng </Link></div></div>
    {loading && <span className="sr-only" role="status">Đang tải tổng quan cửa hàng</span>}
    {!loading && (result.error || data?.errors.length > 0) && <div role="alert" className="admin-error-strip"><span>{result.error || 'Chưa tải được một số dữ liệu: ' + data.errors.join(', ') + '.'}</span><button onClick={() => setRefresh((value) => value + 1)}>Thử lại</button></div>}
    <div className="admin-stats-scope"><Info size={16}/><span>{data?.recent ? 'Thống kê trên ' + recent.length + ' đơn gần nhất được tải' + (data.recent.total > recent.length ? ' trong ' + data.recent.total + ' đơn của cửa hàng' : '') + '. Doanh thu chỉ tính đơn đã giao và thanh toán, không gồm phí giao hàng.' : 'Đang chờ dữ liệu đơn hàng để tổng hợp chỉ số bán hàng.'}</span></div>
    <div className="admin-overview-top">
    <div className="admin-metric-grid">
      <Metric title="Tổng doanh thu" icon={Wallet} value={money(sales?.revenue)} note="Tiền sản phẩm từ đơn đã hoàn tất" loading={loading} currency><span className="metric-explanation">{sales ? count(sales.completedOrders) + ' đơn đã giao và thanh toán' : 'Chưa có dữ liệu doanh thu'}</span></Metric>
      <Metric title="COD chờ thu" icon={Banknote} value={money(sales?.pendingCollection)} note="Tổng thanh toán của đơn COD đang mở" loading={loading} currency><span className="metric-explanation">{sales ? count(sales.pendingOrders) + ' đơn, đã gồm phí giao hàng' : 'Chưa có dữ liệu thanh toán'}</span></Metric>
      <Metric title="Đơn hoàn tất" icon={BadgeCheck} value={count(sales?.completedOrders)} note="Đã giao thành công và nhận thanh toán" loading={loading}><span className="metric-explanation">{sales ? count(sales.unitsSold) + ' sản phẩm đã bán' : 'Chưa có dữ liệu giao hàng'}</span></Metric>
      <Metric title="Giá trị đơn trung bình" icon={ChartNoAxesCombined} value={money(sales?.averageOrder)} note="Trung bình tiền sản phẩm trên đơn hoàn tất" loading={loading} currency><span className="metric-explanation">{sales?.completedOrders ? 'Không bao gồm phí giao hàng' : 'Chưa có đơn hoàn tất để tính'}</span></Metric>
    </div>
    <section className="admin-performance">
      <div className="admin-performance-head"><div><h2>Hoạt động đơn hàng</h2><p>{data?.recent ? 'Trong ' + recent.length + ' đơn gần nhất được tải' : 'Theo dõi số đơn được tạo mỗi ngày'}</p></div><div className="admin-period-switch" aria-label="Khoảng thời gian biểu đồ">{[7,14].map(days => <button key={days} aria-pressed={period === days} className={period === days ? 'is-active' : ''} onClick={() => setPeriod(days)}>{days} ngày</button>)}</div></div>
      <p className="admin-performance-date"><CalendarDays size={12}/>{formatDisplayDate(now, { timeZone: 'Asia/Ho_Chi_Minh' })}</p>
      {loading ? <div className="admin-chart-empty">Đang tải dữ liệu…</div> : !data?.recent ? <div className="admin-chart-empty">Chưa tải được dữ liệu biểu đồ</div> : <div className="admin-activity-chart" role="img" aria-label={'Số đơn theo ngày: ' + activity.map(day => day.label + ': ' + day.count).join(', ')}>{activity.map(day => <div key={day.key} className="admin-chart-column" title={day.label + ': ' + day.count + ' đơn'}><b>{day.count || ''}</b><i style={{height: day.count ? Math.max(7,day.count/maxActivity*136) : 2}}/><span>{day.label}</span></div>)}</div>}
      <div className="admin-chart-legend"><span><i/>Số đơn được tạo</span></div>
    </section>
    </div>
    <section className="admin-operations">
      <div className="admin-operations-head"><div><h2>Đơn hàng cần bạn quan tâm</h2><p>Chọn một đơn để xem nhanh thông tin</p></div><nav className="admin-order-tabs" aria-label="Nhóm đơn tổng quan">{[['recent', 'Gần đây'], ['pending', 'Chờ xác nhận'], ['shipping', 'Đang giao']].map(([value, label]) => <button key={value} className={group === value ? 'is-active' : ''} aria-pressed={group === value} onClick={() => { setGroup(value); setSelectedCode(''); }}>{label}{value !== 'recent' && <b>{count(data?.[value]?.total)}</b>}</button>)}</nav></div>
      {loading ? <div className="admin-operations-empty" role="status">Đang tải danh sách đơn hàng…</div> : !visible.length ? <div className="admin-operations-empty">{groupData ? 'Chưa có đơn hàng trong mục này.' : 'Chưa tải được danh sách. Hãy thử làm mới dữ liệu.'}</div> : <div className="admin-order-workspace">
        <div className="admin-order-list">{visible.map((entry) => <button className={'admin-order-row' + (entry.order.orderCode === selected?.order.orderCode ? ' is-active' : '')} key={entry.order.id} aria-pressed={entry.order.orderCode === selected?.order.orderCode} onClick={() => setSelectedCode(entry.order.orderCode)}><span className="admin-order-initials">{initials(entry.order.receiverName)}</span><span className="admin-order-row-text"><strong title={entry.order.orderCode}>{shortCode(entry.order.orderCode)}</strong><small>{date(entry.order.createdAt)} · {entry.order.receiverName || 'Khách hàng'}</small></span><em>{money(entry.order.total)}</em></button>)}</div>
        {selected && <article className="admin-order-selected"><div><div className="admin-selected-heading"><div><small>CHI TIẾT ĐƠN HÀNG</small><h3 title={selected.order.orderCode}>{shortCode(selected.order.orderCode)}</h3></div><span className="admin-selected-status">{ORDER_STATUSES[selected.order.status]}</span></div><p className="admin-selected-person"><UserRound size={12} />{selected.order.receiverName || 'Chưa có người nhận'}<span>·</span>{selected.order.receiverPhone}</p></div>
          <div className="admin-selected-values"><div><small>TIỀN HÀNG</small><strong>{money(selected.order.subtotal)}</strong></div><div><small>PHÍ GIAO HÀNG</small><strong>{money(selected.order.shippingFee)}</strong></div><div><small>TỔNG THANH TOÁN</small><strong>{money(selected.order.total)}</strong></div></div>
          <footer className="admin-selected-footer"><p className="admin-selected-address"><MapPin size={12} /><span>{selected.order.shippingAddress || 'Chưa có địa chỉ nhận hàng'}</span></p><Link to={'/admin/orders?orderCode=' + encodeURIComponent(selected.order.orderCode)}>Mở chi tiết đơn </Link></footer>
        </article>}
      </div>}
    </section>
    <section className="admin-products-strip"><div className="admin-strip-heading"><h2>Mới trong danh mục sản phẩm</h2><Link to="/admin/products">Xem tất cả </Link></div>
      {loading ? <div className="admin-skeleton" /> : !products.length ? <p className="admin-overview-subtle">{data?.products ? 'Chưa có sản phẩm. Bắt đầu xây dựng danh mục của cửa hàng.' : 'Chưa tải được danh mục sản phẩm.'}</p> : <div className="admin-preview-products">{products.map((product) => <Link className="admin-preview-product" key={product.id} to="/admin/products"><img src={product.image} alt="" /><div><strong title={product.name}>{product.name}</strong><span>{money(product.price)}</span><small>{product.stock === 0 ? 'Hết hàng' : 'Tồn kho: ' + product.stock} · {product.status === 'DRAFT' ? 'Bản nháp' : product.status === 'ARCHIVED' ? 'Ngừng bán' : 'Trong danh mục'}</small></div></Link>)}</div>}
    </section>
    {data && <p className="admin-overview-subtle">Lần tải dữ liệu gần nhất: {new Date(data.updatedAt).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' })} · Số liệu đơn hàng lấy từ hệ thống cửa hàng.</p>}
  </div>;
}

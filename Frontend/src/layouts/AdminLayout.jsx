import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronDown, LayoutGrid, ShoppingBag, Package, FolderTree, Search, LogOut, Store, SlidersHorizontal, Users, Tag, Sparkles, CircleHelp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import NotificationDropdown from '../components/NotificationDropdown';
import '../styles/admin.css';

const mainLinks = [
  { label: 'Tổng quan', path: '/admin/dashboard', icon: LayoutGrid },
  { label: 'Đơn hàng', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Sản phẩm', path: '/admin/products', icon: Package },
  { label: 'Danh mục', path: '/admin/categories', icon: FolderTree },
];
const secondaryLinks = [
  { label: 'Cảnh báo tồn kho', path: '/admin/products?tab=low_stock', icon: Package },
  { label: 'Khách hàng', path: '/admin/orders?tab=customers', icon: Users },
  { label: 'Khuyến mãi', path: '/admin/dashboard?tab=promotions', icon: Tag },
  { label: 'Trợ lý & phân tích AI', path: '/admin/dashboard?tab=ai_forecast', icon: Sparkles },
  { label: 'Cài đặt cửa hàng', path: '/admin/categories?tab=settings', icon: SlidersHorizontal },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const currentTab = new URLSearchParams(location.search).get('tab');
  const pageLabel = [...secondaryLinks, ...mainLinks].find((item) =>
    item.path.includes('?') ? item.path === location.pathname + '?tab=' + currentTab : item.path === location.pathname
  )?.label || 'Không gian quản trị';
  const initials = (user?.fullName || 'Admin').trim().split(/\s+/).map((word) => word[0]).slice(-2).join('').toUpperCase();
  function closeMenu(event) { event.currentTarget.closest('details')?.removeAttribute('open'); }
  function findOrders(event) {
    event.preventDefault();
    navigate('/admin/orders' + (search.trim() ? '?q=' + encodeURIComponent(search.trim()) : ''));
  }

  return <div className="admin-shell">
    <div className="admin-ambient admin-ambient-one" aria-hidden="true" /><div className="admin-ambient admin-ambient-two" aria-hidden="true" />
    <div className="admin-frame">
      <header className="admin-header">
        <div className="admin-brand"><BrandLogo size="sm" variant="admin" to="/admin/dashboard" /><span className="admin-brand-note">STORE MANAGEMENT</span></div>
        <nav className="admin-main-nav" aria-label="Điều hướng quản trị">
          {mainLinks.map(({ label, path, icon: Icon }) => <Link key={path} to={path} aria-current={location.pathname === path ? 'page' : undefined} className={location.pathname === path ? 'is-active' : ''}><Icon size={15} /><span>{label}</span></Link>)}
        </nav>
        <div className="admin-header-actions">
          <Link className="admin-icon-button admin-store-link" to="/" title="Xem cửa hàng" aria-label="Xem cửa hàng"><Store size={18} /></Link>
          <NotificationDropdown iconClassName="w-[18px] h-[18px] text-slate-600" />
          <details className="admin-menu admin-account-menu">
            <summary aria-label="Tài khoản quản trị"><span className="admin-avatar">{initials}</span><span className="admin-account-name"><strong>{user?.fullName || 'Admin'}</strong><small>Quản trị viên</small></span><ChevronDown size={13} /></summary>
            <div className="admin-menu-popover"><p>{user?.email}</p><Link to="/profile" onClick={closeMenu}>Thông tin tài khoản <ArrowUpRight size={14} /></Link><Link to="/" onClick={closeMenu}>Xem cửa hàng <Store size={14} /></Link><button onClick={() => { logout(); navigate('/login'); }}>Đăng xuất <LogOut size={14} /></button></div>
          </details>
        </div>
      </header>
      <div className="admin-toolbar">
        <div className="admin-breadcrumb"><span>Không gian làm việc</span><span>/</span><strong>{pageLabel}</strong></div>
        <form className="admin-global-search" onSubmit={findOrders}><Search size={15} /><input aria-label="Tìm kiếm đơn hàng trong hệ thống" value={search} maxLength={200} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm đơn hàng, người nhận..." /><button type="submit" aria-label="Tìm đơn"><ArrowUpRight size={16} /></button></form>
        <details className="admin-menu admin-tools-menu">
          <summary><SlidersHorizontal size={15} /><span>Công cụ</span><ChevronDown size={12} /></summary>
          <div className="admin-menu-popover">{secondaryLinks.map(({ label, path, icon: Icon }) => <Link key={path} to={path} onClick={closeMenu}><span>{label}</span><Icon size={15} /></Link>)}</div>
        </details>
      </div>
      <main className="admin-content admin-page"><Outlet /></main>
      <footer className="admin-footer"><span>Alibaba Store <i /> Không gian quản trị</span><span><CircleHelp size={13} /> Quản lý cửa hàng theo cách của bạn</span></footer>
    </div>
  </div>;
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, UserRound, Sparkles, Menu, X, LogOut, Package, ChevronDown, Phone, ShieldCheck, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import BrandLogo from './BrandLogo';
import NotificationDropdown from './NotificationDropdown';
import ProductSearch from './ProductSearch';
import { STORE_CONFIG } from '../config/storeConfig';
import { categoryService } from '../services/categoryService';
import { categoryIcon } from '../data/categoryUi';

const links = [
  ['Tất cả sản phẩm', '/products'], ['Điện thoại', '/products?category=dien-thoai'],
  ['Laptop', '/products?category=laptop'], ['Âm thanh', '/products?category=am-thanh'],
  ['Đồng hồ', '/products?category=dong-ho'], ['Thu cũ đổi mới', '/thu-cu-doi-moi'], ['Khuyến mãi', '/khuyen-mai'],
];
export default function Navbar({ onOpenAiChat }) {
  const { cartCount } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [catalogCategories, setCatalogCategories] = useState([]);
  useEffect(() => { let active = true; categoryService.getCategories().then(rows => { if (active) setCatalogCategories(rows.filter(row => row.slug !== 'all' && row.isActive !== false)); }); return () => { active = false; }; }, []);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  function closeAccount(event) { event.currentTarget.closest('details')?.removeAttribute('open'); }
  return <header className="store-header commerce-theme">
    <div className="store-utility"><div className="store-container store-utility-inner"><div className="utility-left"><span><ShieldCheck size={13} /> Công nghệ cho cuộc sống, lựa chọn theo cách của bạn.</span><span><Phone size={12} /> {STORE_CONFIG.hotlineFormatted}</span></div><div className="utility-right"><span>Chào mừng đến Zentro Store</span><Link to="/orders">Tra cứu đơn hàng</Link></div></div></div>
    <div className="store-container store-header-main">
      <BrandLogo variant="modern" showSlogan />
      <ProductSearch onNavigate={() => setMobileOpen(false)} />
      <div className="store-header-actions">
        <Link to="/cart" className="store-header-action" aria-label={'Giỏ hàng: ' + cartCount + ' sản phẩm'}><ShoppingBag /><span><small>Mua sắm</small>Giỏ hàng</span>{cartCount > 0 && <b className="store-cart-count">{cartCount}</b>}</Link>
        {isAuthenticated && <NotificationDropdown iconClassName="w-5 h-5 text-slate-600" />}
        {isAuthenticated ? <details className="store-account-menu"><summary className="store-header-action"><UserRound /><span><small>Xin chào,</small>{user?.fullName?.trim().split(/\s+/).slice(-1)[0] || 'Tài khoản'}</span><ChevronDown size={12} /></summary><div className="store-account-popover"><p>{user?.email}</p><Link to="/profile" onClick={closeAccount}><UserRound size={16} />Tài khoản của tôi</Link><Link to="/orders" onClick={closeAccount}><Package size={16} />Đơn mua của tôi</Link>{isAdmin && <Link to="/admin/dashboard" onClick={closeAccount}><LayoutGrid size={16} />Quản trị cửa hàng</Link>}<button onClick={() => { logout(); navigate('/login'); }}><LogOut size={16} />Đăng xuất</button></div></details> : <Link to="/login" className="store-header-action" aria-label="Đăng nhập"><UserRound /><span><small>Thành viên</small>Đăng nhập</span></Link>}
        <button className="store-mobile-trigger" aria-label={mobileOpen ? 'Đóng danh mục' : 'Mở danh mục'} aria-expanded={mobileOpen} aria-controls="store-categories-nav" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </div>
    <div className={'store-navline' + (mobileOpen ? ' is-mobile-open' : '')}><div className="store-container store-nav-inner"><details className="store-catalog-menu"><summary aria-label="Tất cả danh mục sản phẩm"><LayoutGrid size={17}/><span>Danh mục</span><ChevronDown size={13}/></summary><div className="store-catalog-panel"><nav aria-label="Tất cả danh mục">{catalogCategories.map(category => { const Icon = categoryIcon(category.slug); return <Link key={category.id} to={'/products?category=' + encodeURIComponent(category.slug)} onClick={closeAccount}><Icon size={19}/>{category.name}</Link>; })}</nav>{!catalogCategories.length && <p>Khám phá sản phẩm trong danh mục cửa hàng.</p>}<Link className="store-catalog-all" to="/products" onClick={closeAccount}>Xem toàn bộ sản phẩm</Link></div></details><nav id="store-categories-nav" className="store-navlinks" aria-label="Danh mục mua sắm">{links.map(([name,path]) => <Link key={path} to={path} onClick={() => setMobileOpen(false)} aria-current={location.pathname + location.search === path ? 'page' : undefined}>{name}</Link>)}</nav><button className="store-ai-button" onClick={onOpenAiChat}><Sparkles size={16} /><span>Tư vấn AI</span></button></div></div>
  </header>;
}

import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutGrid, ShoppingBag, Package, FolderTree, Search, LogOut, Store, SlidersHorizontal, Users, Tag, Sparkles, CircleHelp, Menu, X, PanelLeftClose, PanelLeftOpen, Boxes } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import NotificationDropdown from '../components/NotificationDropdown';
import '../styles/admin.css';

const groups = [
 { label:'QUẢN LÝ CỬA HÀNG', links:[
  {label:'Tổng quan',path:'/admin/dashboard',icon:LayoutGrid},
  {label:'Sản phẩm',path:'/admin/products',icon:Package},
  {label:'Danh mục',path:'/admin/categories',icon:FolderTree},
  {label:'Tồn kho',path:'/admin/products?tab=low_stock',icon:Boxes},
  {label:'Đơn hàng',path:'/admin/orders',icon:ShoppingBag},
  {label:'Khách hàng',path:'/admin/orders?tab=customers',icon:Users},
 ]},
 { label:'CÔNG CỤ', links:[
  {label:'Khuyến mãi',path:'/admin/dashboard?tab=promotions',icon:Tag},
  {label:'Trợ lý AI',path:'/admin/dashboard?tab=ai_forecast',icon:Sparkles},
  {label:'Cài đặt cửa hàng',path:'/admin/categories?tab=settings',icon:SlidersHorizontal},
 ]},
];
export default function AdminLayout() {
 const {user,logout}=useAuth();
 const location=useLocation();const navigate=useNavigate();
 const [search,setSearch]=useState('');const [mobileOpen,setMobileOpen]=useState(false);const [collapsed,setCollapsed]=useState(false);
 const tab=new URLSearchParams(location.search).get('tab');
 function active(path){const [pathname,query]=path.split('?');return pathname===location.pathname && (query ? new URLSearchParams(query).get('tab')===tab : !tab);}
 const pageLabel=groups.flatMap(group=>group.links).find(item=>active(item.path))?.label||'Quản trị cửa hàng';
 const initials=(user?.fullName||'Admin').trim().split(/\s+/).map(word=>word[0]).slice(-2).join('').toUpperCase();
 function findOrders(event){event.preventDefault();navigate('/admin/orders'+(search.trim()?'?q='+encodeURIComponent(search.trim()):''));}
 return <div className={'admin-shell'+(collapsed?' is-collapsed':'')+(mobileOpen?' is-menu-open':'')}>
  {mobileOpen && <button className="admin-drawer-backdrop" aria-label="Đóng menu quản trị" onClick={()=>setMobileOpen(false)} />}
  <aside className="admin-sidebar" id="admin-sidebar">
   <div className="admin-sidebar-brand"><BrandLogo size="sm" variant="admin" to="/admin/dashboard" /><button className="admin-sidebar-close" aria-label="Đóng menu" onClick={()=>setMobileOpen(false)}><X size={20} /></button></div>
   <nav aria-label="Điều hướng quản trị">{groups.map(group=><div className="admin-sidebar-group" key={group.label}><p>{group.label}</p>{group.links.map(({label,path,icon:Icon})=><Link title={collapsed?label:undefined} key={path} to={path} aria-current={active(path)?'page':undefined} className={active(path)?'is-active':''} onClick={()=>setMobileOpen(false)}><Icon size={19} /><span>{label}</span></Link>)}</div>)}</nav>
   <div className="admin-sidebar-bottom"><Link to="/"><Store size={18} /><span>Xem cửa hàng</span></Link><button onClick={()=>{logout();navigate('/login');}}><LogOut size={18} /><span>Đăng xuất</span></button></div>
  </aside>
  <div className="admin-frame">
   <header className="admin-header"><div className="admin-header-title"><button className="admin-mobile-trigger" aria-label="Mở menu quản trị" aria-expanded={mobileOpen} aria-controls="admin-sidebar" onClick={()=>setMobileOpen(!mobileOpen)}><Menu size={22} /></button><button className="admin-collapse-trigger" aria-label={collapsed?'Mở rộng thanh bên':'Thu gọn thanh bên'} onClick={()=>setCollapsed(!collapsed)}>{collapsed?<PanelLeftOpen size={20}/>:<PanelLeftClose size={20}/>}</button><div><small>KHÔNG GIAN QUẢN TRỊ</small><strong>{pageLabel}</strong></div></div>
    <div className="admin-header-actions"><form className="admin-global-search" role="search" onSubmit={findOrders}><Search size={17}/><input aria-label="Tìm đơn hàng trong hệ thống" placeholder="Tìm đơn hàng..." value={search} maxLength={200} onChange={event=>setSearch(event.target.value)}/><button type="submit" aria-label="Tìm đơn"><Search size={16}/></button></form><NotificationDropdown iconClassName="w-5 h-5 text-slate-500"/><details className="admin-menu"><summary aria-label="Tài khoản quản trị"><span className="admin-avatar">{initials}</span><span className="admin-account-name"><strong>{user?.fullName||'Admin'}</strong><small>Quản trị viên</small></span><ChevronDown size={13}/></summary><div className="admin-menu-popover"><p>{user?.email}</p><Link to="/profile">Thông tin tài khoản</Link><Link to="/">Xem cửa hàng</Link><button onClick={()=>{logout();navigate('/login');}}>Đăng xuất</button></div></details></div>
   </header>
   <main className="admin-content admin-page"><Outlet/></main>
   <footer className="admin-footer"><span>Zentro Store <i/> Không gian quản trị</span><span><CircleHelp size={13}/> Quản lý cửa hàng theo cách của bạn</span></footer>
  </div>
 </div>;
}

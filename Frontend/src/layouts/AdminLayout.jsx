import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  FolderTree,
  Store,
  LogOut,
  Menu,
  X,
  Bell,
  Sparkles,
  Crown,
  ChevronDown,
  Tag,
  Users,
  Settings,
  AlertCircle,
  Gift,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';
import NotificationDropdown from '../components/NotificationDropdown';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isItemActive = (targetPath) => {
    const currentFullPath = location.pathname + (location.search || '');
    if (targetPath.includes('?')) {
      return currentFullPath === targetPath;
    }
    return location.pathname === targetPath && (!location.search || location.search === '');
  };

  const navSections = [
    {
      title: 'TỔNG QUAN',
      items: [
        {
          name: 'Dashboard',
          path: '/admin/dashboard',
          icon: LayoutDashboard,
          badge: 'Real-time',
        },
      ],
    },
    {
      title: 'QUẢN LÝ BÁN HÀNG',
      items: [
        {
          name: 'Quản lý Đơn hàng',
          path: '/admin/orders',
          icon: ShoppingBag,
          badge: '5 mới',
        },
        {
          name: 'Khách hàng & Hội viên',
          path: '/admin/orders?tab=customers',
          icon: Users,
        },
        {
          name: 'Khuyến mãi & Flash Sale',
          path: '/admin/dashboard?tab=promotions',
          icon: Tag,
        },
      ],
    },
    {
      title: 'KHO & SẢN PHẨM',
      items: [
        {
          name: 'Quản lý Sản phẩm',
          path: '/admin/products',
          icon: Package,
        },
        {
          name: 'Quản lý Danh mục',
          path: '/admin/categories',
          icon: FolderTree,
        },
        {
          name: 'Cảnh báo tồn kho',
          path: '/admin/products?tab=low_stock',
          icon: AlertCircle,
          badge: '2 cảnh báo',
        },
      ],
    },
    {
      title: 'CÔNG CỤ & AI',
      items: [
        {
          name: 'Trợ lý AI & Dự báo',
          path: '/admin/dashboard?tab=ai_forecast',
          icon: Sparkles,
        },
        {
          name: 'Cài đặt hệ thống',
          path: '/admin/categories?tab=settings',
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* ================= SIDEBAR DESKTOP (STYLE YUPVOX LIGHT) ================= */}
      <aside className="hidden lg:flex w-72 bg-white text-slate-700 flex-col justify-between shrink-0 border-r border-slate-200/80 sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 space-y-6">
          {/* Logo Header */}
          <div className="px-1">
            <BrandLogo size="md" variant="admin" to="/admin/dashboard" />
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-5">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isItemActive(item.path);

                  return (
                    <motion.div
                      key={item.name}
                      whileHover={{ x: 2 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <Link
                        to={item.path}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Sidebar: Card Nâng Cấp Pro & User info */}
        <div className="p-5 border-t border-slate-100 space-y-4">
          {/* Card Premium Style YupVox */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-violet-50/60 to-purple-50/90 border border-indigo-100 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                Gói Quản Trị Pro
              </span>
              <span className="text-[9px] font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                Active
              </span>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span> AI Phân tích doanh thu 24/7
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span> Đồng bộ kho thời gian thực
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-500 font-bold">✓</span> Không giới hạn đơn hàng
              </li>
            </ul>
            <Link
              to="/"
              className="w-full py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Xem Cửa hàng Khách</span>
            </Link>
          </div>

          {/* User profile capsule */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80'
                }
                alt="admin"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.fullName || 'Quản trị viên'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@alibabastore.vn'}</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= HEADER MOBILE ================= */}
      <header className="lg:hidden bg-white text-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <BrandLogo size="sm" variant="admin" to="/admin/dashboard" />
        </div>

        <Link
          to="/"
          className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full hover:bg-slate-200"
        >
          <Store className="w-3.5 h-3.5 text-indigo-600" />
          <span>Về Shop</span>
        </Link>
      </header>

      {/* ================= MOBILE DRAWER with Framer Motion ================= */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-72 bg-white text-slate-700 p-5 flex flex-col justify-between h-full shadow-2xl z-10"
            >
              <div className="space-y-5 overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-bold text-sm text-slate-900">Bảng Quản Trị</span>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {navSections.map((section, sIdx) => (
                  <div key={sIdx} className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                      {section.title}
                    </p>
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = isItemActive(item.path);
                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={() => setIsMobileSidebarOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <Link
                  to="/"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 py-1.5"
                >
                  <Store className="w-4 h-4 text-emerald-500" />
                  <span>Xem Cửa hàng Khách</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="flex items-center gap-2 text-xs font-semibold text-rose-600 py-1.5 cursor-pointer w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Topbar Desktop chuẩn YupVox Style */}
        <header className="hidden lg:flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-8 py-3.5 sticky top-0 z-30 shadow-2xs">
          {/* Left: Heading Welcome */}
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              Chào mừng bạn trở lại, <span className="font-bold text-slate-800">{user?.fullName || 'EngageX'}</span>! 👋
            </p>
          </div>

          {/* Center: Search pill input */}
          <div className="relative max-w-md w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm đơn hàng, sản phẩm, khách hàng..."
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 text-slate-800 text-xs px-4 py-2.5 rounded-full outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Right: Credits Chip, Gift, Bell, Profile Capsule */}
          <div className="flex items-center gap-3">
            {/* Pill Chip */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
              <span>12.500 Credits AI</span>
            </div>

            {/* Gift Button */}
            <button
              className="p-2 rounded-full bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 hover:text-amber-600 transition-colors shadow-2xs cursor-pointer"
              title="Ưu đãi & Quà tặng"
            >
              <Gift className="w-4 h-4 text-amber-500" />
            </button>

            {/* Notification Bell */}
            <NotificationDropdown iconClassName="w-4 h-4 text-slate-600" />

            <div className="h-5 w-px bg-slate-200" />

            {/* Profile Capsule */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs">
              <img
                src={
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop&q=80'
                }
                alt="user"
                className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/20"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-none">
                  {user?.fullName?.split(' ')[0] || 'EngageX'}
                </p>
                <span className="text-[10px] font-semibold text-indigo-600">Premium</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </header>

        {/* Nội dung sub-pages admin */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

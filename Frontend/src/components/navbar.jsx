import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  User,
  Sparkles,
  Menu,
  X,
  LogOut,
  Package,
  ChevronDown,
  ShieldCheck,
  MapPin,
  Phone,
  Store,
  Flame,
  LayoutGrid,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import BrandLogo from './BrandLogo';
import { STORE_CONFIG } from '../config/storeConfig';

export default function Navbar({ onOpenAiChat }) {
  const { cartCount } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('TP. Hồ Chí Minh');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const hotKeywords = ['iPhone 15 Pro Max', 'MacBook Air M3', 'Galaxy S24 Ultra', 'Rabbit R1'];

  const navCategories = [
    { name: 'Điện thoại', path: '/products?category=dien-thoai' },
    { name: 'Laptop', path: '/products?category=laptop' },
    { name: 'Âm thanh', path: '/products?category=am-thanh' },
    { name: 'Đồng hồ', path: '/products?category=dong-ho' },
    { name: 'Phụ kiện công nghệ', path: '/products?category=phu-kien-ai' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
      {/* 1. TOP UTILITY BAR (Phong cách Bán lẻ Chuyên nghiệp CellphoneS) */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap">
            {/* Location selector */}
            <div className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              <span>Xem giá tại:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer"
              >
                <option value="TP. Hồ Chí Minh" className="text-slate-900">TP. Hồ Chí Minh</option>
                <option value="Hà Nội" className="text-slate-900">Hà Nội</option>
                <option value="Đà Nẵng" className="text-slate-900">Đà Nẵng</option>
                <option value="Cần Thơ" className="text-slate-900">Cần Thơ</option>
              </select>
            </div>

            <div className="hidden md:flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>Hotline tư vấn: <strong className="text-white font-bold">{STORE_CONFIG.hotlineFormatted}</strong> (Miễn phí)</span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5">
              <Store className="w-3 h-3 text-amber-400" />
              <span>Hệ thống <strong>120 cửa hàng</strong> trên toàn quốc</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400 shrink-0">
            <Link to="/orders" className="hover:text-white transition-colors">
              Tra cứu đơn hàng
            </Link>
            <span className="text-slate-700">|</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <Flame className="w-3 h-3 fill-amber-400" />
              Alibaba-Club: Tích 1% điểm
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Logo Alibaba-Store sang trọng & hiện đại */}
        <BrandLogo size="md" showSlogan={true} />

        {/* Nút Danh mục sản phẩm (CellphoneS Category Trigger) */}
        <Link
          to="/products"
          className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-bold text-slate-800 transition-colors shrink-0"
        >
          <LayoutGrid className="w-4 h-4 text-red-600" />
          <span>Danh mục</span>
        </Link>

        {/* Thanh tìm kiếm phong cách CellphoneS với Hot Tags */}
        <div className="flex-1 max-w-xl hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bạn muốn tìm iPhone 16, MacBook, Galaxy S24 Ultra, Loa Marshall..."
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-red-500 text-slate-800 pl-10 pr-24 py-2.5 rounded-xl text-xs sm:text-sm transition-all outline-none placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Tìm kiếm
            </button>
          </form>

          {/* Hot search tags */}
          <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 truncate">
            <span className="font-semibold text-slate-500">Tìm kiếm nhiều:</span>
            {hotKeywords.map((kw, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSearchQuery(kw);
                  navigate(`/products?search=${encodeURIComponent(kw)}`);
                }}
                className="hover:text-red-600 cursor-pointer transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons Phía Phải */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Nút Trợ lý AI */}
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-50 to-indigo-50 hover:from-red-100 hover:to-indigo-100 text-red-700 border border-red-200/80 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Mở Trợ lý ảo AI tư vấn cấu hình"
          >
            <Sparkles className="w-4 h-4 text-red-600 animate-pulse" />
            <span className="hidden sm:inline">Hỏi AI</span>
          </button>

          {/* Giỏ hàng */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl text-slate-700 hover:text-red-600 hover:bg-red-50/50 transition-colors"
            title="Giỏ hàng"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Tài khoản Người dùng */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-red-500/30"
                />
                <span className="text-xs font-bold text-slate-800 hidden xl:inline max-w-[100px] truncate">
                  {user.fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:inline" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Tài khoản của tôi
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors"
                  >
                    <Package className="w-4 h-4" />
                    Đơn hàng của tôi
                  </Link>

                  {isAdmin && (
                    <div className="pt-1 border-t border-slate-100">
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        Trang Quản trị (Admin)
                      </Link>
                    </div>
                  )}

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-bold text-slate-700 hover:text-red-600 px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Toggle Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm điện thoại, laptop..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 pl-10 pr-4 py-2 rounded-xl text-xs outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </form>

          <nav className="flex flex-col space-y-1">
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 flex items-center gap-2"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Tất cả sản phẩm</span>
            </Link>
            {navCategories.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-800 hover:bg-slate-50"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-red-600 text-white text-center"
                  >
                    Đăng ký tài khoản
                  </Link>
                </>
              ) : (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50"
                    >
                      🛡️ Trang Quản trị (Admin)
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                  >
                    Đăng xuất ({user?.fullName})
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
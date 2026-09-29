import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
  LayoutGrid,
  Zap,
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  const hotKeywords = ['iPhone 15 Pro Max', 'MacBook Air M3', 'Galaxy S24 Ultra', 'AirPods Pro 2'];

  const navCategories = [
    { name: 'Tất cả sản phẩm', path: '/products' },
    { name: 'Điện thoại', path: '/products?category=dien-thoai' },
    { name: 'Laptop', path: '/products?category=laptop' },
    { name: 'Tai nghe', path: '/products?category=am-thanh' },
    { name: 'Đồng hồ', path: '/products?category=dong-ho' },
    { name: 'Thu cũ đổi mới', path: '/thu-cu-doi-moi' },
    { name: 'Khuyến mãi', path: '/khuyen-mai' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-xs transition-all">
      {/* 1. TOP UTILITY STRIP (Modern Clean Tech Bar) */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto whitespace-nowrap">
            {/* Location selector */}
            <div className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer transition-colors">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>Giao tại:</span>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-transparent text-white font-semibold outline-none cursor-pointer text-[11px]"
              >
                <option value="TP. Hồ Chí Minh" className="text-slate-900">TP. Hồ Chí Minh</option>
                <option value="Hà Nội" className="text-slate-900">Hà Nội</option>
                <option value="Đà Nẵng" className="text-slate-900">Đà Nẵng</option>
                <option value="Cần Thơ" className="text-slate-900">Cần Thơ</option>
              </select>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-slate-300">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>Hotline 24/7: <strong className="text-white font-medium">{STORE_CONFIG.hotlineFormatted}</strong></span>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-slate-300">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Giao siêu tốc <strong>2H</strong> toàn quốc</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400 shrink-0">
            <Link to="/orders" className="hover:text-white transition-colors text-[11px]">
              Tra cứu đơn hàng
            </Link>
            <span className="text-slate-700">|</span>
            <span className="inline-flex items-center gap-1 text-violet-300 font-medium">
              <Sparkles className="w-3 h-3 text-violet-400" />
              Alibaba AI Assistant Live
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <BrandLogo size="md" showSlogan={false} />

        {/* Category Trigger Pill */}
        <Link
          to="/products"
          className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 rounded-full text-xs font-semibold transition-all border border-slate-200/60 shrink-0 group"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-indigo-600 transition-transform group-hover:rotate-90 duration-300" />
          <span>Danh mục</span>
        </Link>

        {/* Modern Pill Searchbar */}
        <div className="flex-1 max-w-xl hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center rounded-full bg-slate-100/90 hover:bg-slate-100 focus-within:bg-white border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all overflow-hidden">
              <Search className="w-4 h-4 text-slate-400 ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm iPhone 16, MacBook M3, AI gadgets, phụ kiện..."
                className="w-full bg-transparent text-slate-900 text-xs sm:text-sm px-3 py-2.5 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="mr-1.5 px-4 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs"
              >
                Tìm
              </button>
            </div>
          </form>

          {/* Hot search tags */}
          <div className="flex items-center gap-3 pt-1.5 px-2 text-[11px] text-slate-400 truncate">
            <span className="font-medium text-slate-500">Gợi ý:</span>
            {hotKeywords.map((kw, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setSearchQuery(kw);
                  navigate(`/products?search=${encodeURIComponent(kw)}`);
                }}
                className="hover:text-indigo-600 cursor-pointer transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Right Action Icons & User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* AI Advisor Button */}
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenAiChat}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-full shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all cursor-pointer"
            title="Mở Trợ lý ảo AI tư vấn cấu hình"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
            <span className="hidden sm:inline">Hỏi AI</span>
          </motion.button>

          {/* Cart Icon Button */}
          <Link
            to="/cart"
            className="relative p-2.5 rounded-full text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/70 border border-transparent hover:border-indigo-100 transition-all"
            title="Giỏ hàng"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md shadow-indigo-500/30"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>

          {/* User Profile / Auth */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100/80 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                />
                <span className="text-xs font-semibold text-slate-800 hidden xl:inline max-w-[100px] truncate">
                  {user.fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:inline" />
              </button>

              {/* User Dropdown with Framer Motion spring */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 py-2 z-50 overflow-hidden"
                    onMouseLeave={() => setIsUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Tài khoản của tôi
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      Đơn hàng của tôi
                    </Link>

                    {isAdmin && (
                      <div className="pt-1 border-t border-slate-100">
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
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
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        Đăng xuất
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="hidden sm:inline-flex text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-indigo-600 text-white px-4 py-2 rounded-full transition-all shadow-xs"
              >
                Đăng ký
              </Link>
            </div>
          )}

          {/* Toggle Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 3. MOBILE MENU with Framer Motion */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 overflow-hidden"
          >
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm điện thoại, laptop, AI..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-10 pr-4 py-2 rounded-full text-xs outline-none focus:border-indigo-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </form>

            <nav className="flex flex-col space-y-1">
              {navCategories.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 bg-slate-100 text-center"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center shadow-xs"
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
                        className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Trang Quản trị (Admin)</span>
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                    >
                      Đăng xuất ({user?.fullName})
                    </button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
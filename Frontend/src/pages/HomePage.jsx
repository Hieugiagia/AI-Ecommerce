import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Cpu,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Star,
  CheckCircle2,
  Flame,
  ChevronRight,
  ChevronLeft,
  Truck,
  RotateCcw,
  CreditCard,
  Layers,
  Gift,
  Timer,
} from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';

export default function HomePage({ onOpenAiChat }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [flashSaleCategory, setFlashSaleCategory] = useState('all');
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });

  // Hero carousel banners
  const heroSlides = [
    {
      title: 'iPhone 15 Pro Max Titan Tự Nhiên',
      subtitle: 'Khung viền Titan hàng không vũ trụ • Chip A17 Pro đỉnh cao',
      badge: 'GIÁ SỐC CUỐI TUẦN',
      price: 'Từ 29.490.000 ₫',
      oldPrice: '34.990.000 ₫',
      tag: 'Thu cũ trợ giá đến 4.000.000đ',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000&auto=format&fit=crop&q=80',
      bgColor: 'from-slate-950 via-slate-900 to-indigo-950',
      link: '/product/1',
    },
    {
      title: 'Galaxy S24 Ultra - Kỷ Nguyên Galaxy AI',
      subtitle: 'Khoanh tròn tìm kiếm đa năng • Phiên dịch cuộc gọi trực tiếp',
      badge: 'MỞ BÁN CHÍNH THỨC',
      price: 'Từ 26.990.000 ₫',
      oldPrice: '31.990.000 ₫',
      tag: 'Tặng củ sạc 45W & Bao da chính hãng',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1000&auto=format&fit=crop&q=80',
      bgColor: 'from-blue-950 via-indigo-950 to-slate-900',
      link: '/product/3',
    },
    {
      title: 'MacBook Pro 16 M3 Max - Cỗ Máy Cho AI',
      subtitle: '36GB Unified Memory • GPU 30 lõi • Pin 22 giờ liên tục',
      badge: 'ƯU ĐÃI LẬP TRÌNH VIÊN',
      price: 'Từ 68.990.000 ₫',
      oldPrice: '74.990.000 ₫',
      tag: 'Hỗ trợ trả góp 0% qua 25 ngân hàng',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&auto=format&fit=crop&q=80',
      bgColor: 'from-purple-950 via-slate-900 to-indigo-950',
      link: '/product/2',
    },
  ];

  // Auto carousel rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Flash sale countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter flash sale products
  const flashSaleProducts = PRODUCTS.filter((p) => {
    if (flashSaleCategory === 'all') return true;
    return p.category === flashSaleCategory;
  }).slice(0, 4);

  const sidebarCategories = [
    { name: 'Điện thoại, Tablet', slug: 'dien-thoai', icon: Smartphone, highlight: 'iPhone 15, S24' },
    { name: 'Laptop, Máy tính', slug: 'laptop', icon: Laptop, highlight: 'MacBook, Dell, ROG' },
    { name: 'Âm thanh, Tai nghe', slug: 'am-thanh', icon: Headphones, highlight: 'Sony, Marshall' },
    { name: 'Đồng hồ thông minh', slug: 'dong-ho', icon: Watch, highlight: 'Apple Watch, Garmin' },
    { name: 'Thiết bị & Phụ kiện AI', slug: 'phu-kien-ai', icon: Sparkles, highlight: 'Rabbit R1, Meta Glass' },
    { name: 'Thu cũ đổi mới', slug: 'dien-thoai', icon: RotateCcw, highlight: 'Trợ giá đến 4 triệu' },
    { name: 'Trả góp 0% duyệt 5p', slug: 'all', icon: CreditCard, highlight: 'Không phí chuyển đổi' },
  ];

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      {/* ================= 1. HERO COMBO CHUẨN CELLPHONES ================= */}
      {/* Layout 3 cột: Menu danh mục trái + Banner Carousel giữa + 3 Banners phụ phải */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* CỘT 1: Category Sidebar (CellphoneS Style) */}
          <div className="hidden lg:block lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-2 shadow-xs space-y-1">
            {sidebarCategories.map((item, idx) => {
              const Icon = item.icon;
              return (
                <Link
                  key={idx}
                  to={`/products?category=${item.slug}`}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                        {item.highlight}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
              );
            })}
          </div>

          {/* CỘT 2: Main Banner Carousel (Large Banner) */}
          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden shadow-md flex flex-col justify-between min-h-[320px] sm:min-h-[380px]">
            {heroSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out bg-gradient-to-r ${slide.bgColor} ${
                  idx === currentSlide ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <div className="relative h-full p-6 sm:p-8 flex flex-col justify-between text-white">
                  {/* Top slide badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-red-600 text-white font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-md shadow-xs">
                      {slide.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-300 bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full">
                      {slide.tag}
                    </span>
                  </div>

                  {/* Center slide text */}
                  <div className="space-y-2 max-w-sm">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                      {slide.title}
                    </h2>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {slide.subtitle}
                    </p>
                    <div className="pt-2 flex items-baseline gap-2">
                      <span className="text-lg sm:text-xl font-black text-amber-300">
                        {slide.price}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        {slide.oldPrice}
                      </span>
                    </div>
                  </div>

                  {/* Bottom slide CTA */}
                  <div className="pt-4">
                    <Link
                      to={slide.link}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all shadow-md group"
                    >
                      <span>Xem chi tiết & Mua ngay</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Floating product preview image */}
                  <div className="absolute right-4 bottom-4 w-36 sm:w-48 aspect-square rounded-2xl overflow-hidden border border-white/20 shadow-2xl hidden sm:block">
                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            ))}

            {/* Carousel navigation controls */}
            <div className="absolute bottom-3 left-6 z-20 flex items-center gap-1.5">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CỘT 3: 3 Banners Phụ Khuyến Mãi Phải (CellphoneS Style) */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
            {/* Banner 1: Thu cũ đổi mới */}
            <Link
              to="/products"
              className="p-4 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white flex items-center justify-between hover:shadow-md transition-all group"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded">
                  Thu cũ đổi mới
                </span>
                <p className="text-xs font-black leading-tight">Trợ giá lên đời đến 4 triệu</p>
                <p className="text-[10px] text-white/80">Thủ tục nhanh 15 phút</p>
              </div>
              <RotateCcw className="w-6 h-6 text-white/90 group-hover:rotate-45 transition-transform shrink-0" />
            </Link>

            {/* Banner 2: Mở bán Galaxy AI */}
            <Link
              to="/product/3"
              className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between hover:shadow-md transition-all group"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded">
                  Kỷ nguyên AI
                </span>
                <p className="text-xs font-black leading-tight">Galaxy S24 Series</p>
                <p className="text-[10px] text-white/80">Tặng thêm voucher 1 triệu</p>
              </div>
              <Sparkles className="w-6 h-6 text-amber-300 group-hover:scale-110 transition-transform shrink-0" />
            </Link>

            {/* Banner 3: Thanh toán VietQR */}
            <Link
              to="/products"
              className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white flex items-center justify-between hover:shadow-md transition-all group"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase bg-white/20 px-2 py-0.5 rounded">
                  Ưu đãi thanh toán
                </span>
                <p className="text-xs font-black leading-tight">VietQR / MoMo giảm 500k</p>
                <p className="text-[10px] text-white/80">Áp dụng đơn từ 10 triệu</p>
              </div>
              <CreditCard className="w-6 h-6 text-white/90 group-hover:scale-110 transition-transform shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 2. 4 CAM KẾT VÀNG (TRUST BADGES ROW) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">100% Chính hãng</p>
              <p className="text-[10px] text-slate-500">Bảo hành 12-24 tháng ủy quyền</p>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Giao siêu tốc 2h</p>
              <p className="text-[10px] text-slate-500">Miễn phí giao hàng đơn từ 500k</p>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">1 Đổi 1 trong 30 ngày</p>
              <p className="text-[10px] text-slate-500">Nếu phát sinh lỗi từ nhà sản xuất</p>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Trả góp 0% lãi suất</p>
              <p className="text-[10px] text-slate-500">Duyệt hồ sơ nhanh qua CCCD</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 3. FLASH SALE GIỜ VÀNG GIÁ SỐC (CELLPHONES ICONIC) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-red-900/10 space-y-5">
          {/* Header Flash Sale */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white text-red-600 flex items-center justify-center shadow-md">
                <Flame className="w-6 h-6 fill-red-600 text-red-600 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase">
                    Giờ Vàng Giá Sốc
                  </h2>
                  <span className="bg-amber-400 text-slate-900 text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs">
                    FLASH SALE
                  </span>
                </div>
                <p className="text-xs text-white/80 font-medium">Số lượng có hạn • Cập nhật mỗi ngày</p>
              </div>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-2 bg-black/25 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <Timer className="w-3.5 h-3.5" /> Kết thúc sau:
              </span>
              <div className="flex items-center gap-1 font-mono font-black text-sm">
                <span className="bg-white text-slate-900 px-2 py-0.5 rounded-lg">
                  {timeLeft.hours < 10 ? `0${timeLeft.hours}` : timeLeft.hours}
                </span>
                <span>:</span>
                <span className="bg-white text-slate-900 px-2 py-0.5 rounded-lg">
                  {timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes}
                </span>
                <span>:</span>
                <span className="bg-white text-slate-900 px-2 py-0.5 rounded-lg">
                  {timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}
                </span>
              </div>
            </div>
          </div>

          {/* Flash sale category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: 'all', name: '🔥 Tất cả giá sốc' },
              { id: 'dien-thoai', name: '📱 Điện thoại' },
              { id: 'laptop', name: '💻 Laptop' },
              { id: 'am-thanh', name: '🎧 Âm thanh' },
              { id: 'phu-kien-ai', name: '✨ Thiết bị AI' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFlashSaleCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  flashSaleCategory === tab.id
                    ? 'bg-white text-red-600 shadow-md'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Flash Sale Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {flashSaleProducts.map((p, idx) => (
              <ProductCard
                key={p.id}
                product={p}
                isFlashSale={true}
                soldCount={75 + idx * 6}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ================= 4. DANH MỤC NỔI BẬT (CHUYÊN TRANG CÔNG NGHỆ) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Danh mục nổi bật
            </h2>
            <p className="text-xs text-slate-500">Khám phá các ngành hàng công nghệ đỉnh cao</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>Xem tất cả danh mục</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.filter((c) => c.slug !== 'all').map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="p-4 bg-white border border-slate-200/80 hover:border-red-300 rounded-2xl shadow-2xs hover:shadow-md transition-all text-center space-y-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-red-50 text-slate-700 group-hover:text-red-600 flex items-center justify-center mx-auto transition-colors">
                {cat.slug === 'dien-thoai' && <Smartphone className="w-6 h-6" />}
                {cat.slug === 'laptop' && <Laptop className="w-6 h-6" />}
                {cat.slug === 'am-thanh' && <Headphones className="w-6 h-6" />}
                {cat.slug === 'dong-ho' && <Watch className="w-6 h-6" />}
                {cat.slug === 'phu-kien-ai' && <Sparkles className="w-6 h-6" />}
              </div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 5. HỆ SINH THÁI THƯƠNG HIỆU (APPLE & SAMSUNG GALAXY AI) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Apple Authorized Showcase */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white flex flex-col justify-between space-y-4 shadow-lg">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full text-slate-300">
                Apple Authorised Reseller
              </span>
              <h3 className="text-2xl font-black">Hệ sinh thái Apple Chính Hãng</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Đầy đủ iPhone, MacBook, iPad, Apple Watch với chính sách bảo hành chính hãng 1 đổi 1 tiêu chuẩn Apple Care.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                to="/products?category=dien-thoai"
                className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors"
              >
                Khám phá iPhone
              </Link>
              <Link
                to="/products?category=laptop"
                className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold border border-white/20 transition-colors"
              >
                MacBook M3
              </Link>
            </div>
          </div>

          {/* Samsung Galaxy AI Showcase */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 text-white flex flex-col justify-between space-y-4 shadow-lg">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full text-cyan-300">
                Samsung Galaxy AI
              </span>
              <h3 className="text-2xl font-black">Kỷ Nguyên Trí Tuệ Nhân Tạo</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Trải nghiệm tính năng tìm kiếm thông minh, trợ lý ghi chú và camera zoom đêm 100x với Galaxy S24 Ultra.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Link
                to="/products?category=dien-thoai"
                className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl text-xs font-bold transition-colors"
              >
                Mua Galaxy S24
              </Link>
              <button
                onClick={onOpenAiChat}
                className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold border border-white/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Hỏi AI tư vấn</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. TẤT CẢ THIẾT BỊ CÔNG NGHỆ BÁN CHẠY ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sản phẩm gợi ý hôm nay
            </h2>
            <p className="text-xs text-slate-500">Được khách hàng lựa chọn nhiều nhất trong tuần</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <span>Xem thêm tất cả</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PRODUCTS.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

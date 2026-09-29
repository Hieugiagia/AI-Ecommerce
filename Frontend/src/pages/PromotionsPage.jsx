import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Tag,
  Copy,
  Check,
  Clock,
  Sparkles,
  Zap,
  CreditCard,
  Truck,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  Gift,
  ArrowRight,
} from 'lucide-react';
import { PRODUCTS, VOUCHERS } from '../data/mockData';
import ProductCard from '../components/ProductCard';

export default function PromotionsPage({ onOpenAiChat }) {
  // Extended vouchers list
  const promotionVouchers = [
    {
      code: 'ALIBABA10',
      title: 'Giảm 10% Tối Đa 1 Triệu',
      desc: 'Áp dụng cho mọi đơn hàng điện thoại, laptop, đồng hồ tại Alibaba Store',
      expiry: 'Còn 3 ngày',
      minSpend: 'Không giới hạn',
      badge: 'HOT NHẤT',
      color: 'from-rose-500 to-pink-600',
    },
    {
      code: 'FREESHIP',
      title: 'Miễn Phí Vận Chuyển 50K',
      desc: 'Miễn phí giao hàng hỏa tốc 2H toàn quốc cho đơn từ 500.000đ',
      expiry: 'Áp dụng cả tháng',
      minSpend: 'Đơn từ 500.000đ',
      badge: 'FREESHIP',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      code: 'WELCOME50K',
      title: 'Giảm 50.000đ Bạn Mới',
      desc: 'Dành riêng cho khách hàng lần đầu đặt hàng qua website hoặc ứng dụng',
      expiry: 'Vĩnh viễn',
      minSpend: 'Đơn từ 300.000đ',
      badge: 'BẠN MỚI',
      color: 'from-indigo-500 to-violet-600',
    },
    {
      code: 'VNPAY500K',
      title: 'Giảm 500K Qua VietQR / VNPAY',
      desc: 'Nhập mã khi thanh toán qua ứng dụng ngân hàng hoặc ví VNPAY',
      expiry: 'Còn 5 ngày',
      minSpend: 'Đơn từ 10.000.000đ',
      badge: 'NGÂN HÀNG',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      code: 'TRADEIN4TR',
      title: 'Trợ Giá Thu Cũ Đến 4 Triệu',
      desc: 'Cộng thêm tiền mặt khi mang máy cũ đổi lên iPhone 15 hoặc S24 Ultra',
      expiry: 'Đang diễn ra',
      minSpend: 'Lên đời flagship',
      badge: 'THU CŨ',
      color: 'from-amber-500 to-orange-600',
    },
    {
      code: 'STUDENT300',
      title: 'Học Sinh - Sinh Viên Giảm 300K',
      desc: 'Áp dụng khi mua Laptop, iPad phục vụ học tập (có thẻ HSSV)',
      expiry: 'Hết kỳ học',
      minSpend: 'Đơn từ 8.000.000đ',
      badge: 'HSSV',
      color: 'from-purple-500 to-indigo-600',
    },
  ];

  // Copied state
  const [copiedCode, setCopiedCode] = useState(null);
  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Live countdown timer for Flash sale
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 8, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter tabs
  const [activeTab, setActiveTab] = useState('all');

  // Filtered promotion products
  const promoProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const discountPercent = p.originalPrice
        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
        : 0;

      if (activeTab === 'deep-discount') {
        return discountPercent >= 20 || (p.originalPrice && p.originalPrice - p.price >= 3000000);
      }
      if (activeTab === 'under5m') {
        return p.price < 5000000;
      }
      if (activeTab === 'likenew') {
        return p.category === 'dien-thoai' || p.category === 'laptop';
      }
      if (activeTab === 'accessories') {
        return p.category === 'am-thanh' || p.category === 'phu-kien';
      }
      return true;
    }).sort((a, b) => {
      const discA = a.originalPrice ? a.originalPrice - a.price : 0;
      const discB = b.originalPrice ? b.originalPrice - b.price : 0;
      return discB - discA;
    });
  }, [activeTab]);

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 antialiased text-slate-800">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-950 via-slate-900 to-indigo-950 text-white pt-12 pb-16 sm:py-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4 text-center sm:text-left">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              ALIBABA PROMO FESTIVAL • SIÊU SALE CÔNG NGHỆ
            </span>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Kho Khuyến Mãi &amp; Voucher{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300">
                Giảm Đến 50%
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Tổng hợp toàn bộ mã giảm giá độc quyền, voucher miễn phí vận chuyển, quà tặng thanh toán ngân hàng và hàng ngàn deal xả kho công nghệ chính hãng.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <Gift className="w-4 h-4 text-pink-400" />
                Voucher tặng mỗi ngày
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <Truck className="w-4 h-4 text-emerald-400" />
                Freeship đơn từ 500K
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                Trả góp 0% duyệt 5 phút
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KHO MÃ GIẢM GIÁ (VOUCHER WALLET HUB) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-rose-600" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  Kho Voucher Độc Quyền (Nhấp Để Sao Chép Mã)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mã sẽ được tự động lưu vào bộ nhớ tạm để bạn dán vào trang thanh toán
              </p>
            </div>

            {copiedCode && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Đã sao chép mã "{copiedCode}"!</span>
              </motion.div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotionVouchers.map((v, idx) => {
              const isCopied = copiedCode === v.code;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-rose-300 hover:shadow-md transition-all p-4 space-y-3 relative overflow-hidden group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                        {v.badge}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{v.expiry}</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900">{v.title}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{v.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                    <div className="font-mono text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                      {v.code}
                    </div>

                    <button
                      onClick={() => handleCopy(v.code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isCopied
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-900 hover:bg-rose-600 text-white shadow-2xs'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. FLASH SALE GIỜ VÀNG COUNTDOWN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-amber-300 animate-bounce" />
                <h2 className="text-xl sm:text-2xl font-black">Flash Sale Giờ Vàng Giá Sốc</h2>
              </div>
              <p className="text-xs sm:text-sm text-rose-100">
                Số lượng có hạn • Tự động kết thúc khi hết thời gian đếm ngược
              </p>
            </div>

            {/* Countdown Box */}
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shrink-0">
              <Clock className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-medium text-slate-200 mr-1">Kết thúc sau:</span>
              <div className="flex items-center gap-1 text-sm font-black font-mono">
                <span className="px-2 py-1 rounded-lg bg-white/20">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span>:</span>
                <span className="px-2 py-1 rounded-lg bg-white/20">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span>:</span>
                <span className="px-2 py-1 rounded-lg bg-white/20">{String(timeLeft.seconds).padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          {/* Flash sale cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {PRODUCTS.slice(0, 4).map((p) => {
              const discountPercent = p.originalPrice
                ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                : 20;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-3 sm:p-4 text-slate-800 space-y-3 shadow-md relative overflow-hidden group flex flex-col justify-between"
                >
                  <div className="relative">
                    <span className="absolute top-2 left-2 z-10 text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-600 text-white shadow-xs">
                      GIẢM {discountPercent}%
                    </span>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full aspect-square object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                      {p.name}
                    </h4>
                    <div>
                      <p className="text-sm font-black text-rose-600">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price)}
                      </p>
                      {p.originalPrice && (
                        <p className="text-[11px] text-slate-400 line-through">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.originalPrice)}
                        </p>
                      )}
                    </div>

                    {/* Progress bar giả lập */}
                    <div className="space-y-1 pt-1">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full w-[78%]" />
                      </div>
                      <p className="text-[10px] font-semibold text-rose-600 flex items-center justify-between">
                        <span>Đã bán 78%</span>
                        <span>Sắp hết</span>
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/product/${p.id}`}
                    className="w-full py-2 bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold rounded-xl text-center transition-all block mt-2 shadow-2xs"
                  >
                    Săn Deal Ngay
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. BỘ LỌC TABS & LƯỚI SẢN PHẨM KHUYẾN MÃI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Danh Mục Sản Phẩm Đang Khuyến Mãi
            </h2>
            <p className="text-xs text-slate-500">
              Tìm thấy <strong className="text-slate-900">{promoProducts.length}</strong> sản phẩm ưu đãi hấp dẫn
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1">
            {[
              { id: 'all', label: 'Tất cả khuyến mãi' },
              { id: 'deep-discount', label: 'Giảm sâu > 3 Tr' },
              { id: 'likenew', label: 'Like New 99%' },
              { id: 'under5m', label: 'Dưới 5 triệu' },
              { id: 'accessories', label: 'Tai nghe & Phụ kiện' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {promoProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 5. CÁC ĐỐI TÁC NGÂN HÀNG & THANH TOÁN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
              THANH TOÁN THÔNG MINH
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Ưu Đãi Độc Quyền Từ Đối Tác Ngân Hàng
            </h3>
            <p className="text-xs text-slate-500">
              Giảm thêm trực tiếp khi quét VietQR, thanh toán qua cổng VNPAY hoặc thẻ tín dụng
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/70 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                VietQR
              </div>
              <h4 className="text-xs font-bold text-slate-900">Giảm ngay 200.000đ</h4>
              <p className="text-[11px] text-slate-500">
                Quét mã VietQR chuyển khoản tự động, xác nhận đơn hàng sau 3 giây.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/70 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                0%
              </div>
              <h4 className="text-xs font-bold text-slate-900">Trả Góp 0% Thẻ Tín Dụng</h4>
              <p className="text-[11px] text-slate-500">
                Hỗ trợ hơn 25 ngân hàng lớn: Techcombank, VPBank, Vietcombank, TPBank, v.v.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200/70 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                VNPAY
              </div>
              <h4 className="text-xs font-bold text-slate-900">Mã VNPAY500K</h4>
              <p className="text-[11px] text-slate-500">
                Nhập mã trên cổng VNPAY-QR để nhận ngay ưu đãi giảm 500K cho đơn từ 10Tr.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

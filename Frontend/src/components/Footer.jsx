import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  ArrowRight,
  Sparkles,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
  Copy,
  Check,
  ChevronRight,
  Zap,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { STORE_CONFIG } from '../config/storeConfig';

export default function Footer() {
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [copiedVoucher, setCopiedVoucher] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsSubscribed(true);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucher(true);
    setTimeout(() => setCopiedVoucher(false), 2000);
  };

  // 5 Cam kết dịch vụ chuẩn công nghệ cao cấp
  const commitments = [
    {
      icon: Truck,
      title: 'Giao siêu tốc 2 Giờ',
      desc: 'Miễn phí nội thành từ 500k',
      badge: '2H EXPRESS',
      color: 'from-blue-500/10 to-indigo-500/10 text-indigo-600 border-indigo-200/60',
    },
    {
      icon: ShieldCheck,
      title: 'Chính hãng 100%',
      desc: 'Bảo hành ủy quyền Apple/Samsung',
      badge: 'CHÍNH HÃNG',
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200/60',
    },
    {
      icon: RotateCcw,
      title: '1 Đổi 1 trong 30 ngày',
      desc: 'Lỗi NSX đổi mới lập tức',
      badge: '30 NGÀY',
      color: 'from-violet-500/10 to-purple-500/10 text-violet-600 border-violet-200/60',
    },
    {
      icon: Headphones,
      title: 'Tư vấn chuyên sâu AI 24/7',
      desc: 'So sánh cấu hình & chọn máy tối ưu',
      badge: '24/7 CSKH',
      color: 'from-indigo-500/10 to-violet-500/10 text-indigo-600 border-indigo-200/60',
    },
    {
      icon: CreditCard,
      title: 'Trả góp 0% lãi suất',
      desc: 'Duyệt hồ sơ nhanh qua CCCD/Thẻ',
      badge: '0% LÃI',
      color: 'from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-200/60',
    },
  ];

  return (
    <footer className="bg-white border-t border-slate-200/80 mt-20 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-50/60 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-50/50 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* ================= 1. DẢI CAM KẾT CHẤT LƯỢNG 5 SAO ================= */}
      <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {commitments.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 group flex flex-col justify-between space-y-3 cursor-default"
                >
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${item.color} border flex items-center justify-center transition-transform group-hover:scale-105 duration-200`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-700 group-hover:border-indigo-200 transition-colors">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= 2. BANNER ĐĂNG KÝ VOUCHER ĐỘC QUYỀN ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl shadow-slate-900/10 relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-slate-800">
          {/* Glowing particle accents */}
          <div className="absolute top-0 right-1/3 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-violet-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2 relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Ưu Đãi Độc Quyền Thành Viên Alibaba Store</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Nhận ngay Voucher <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-400 bg-clip-text text-transparent">50.000 ₫</span> cho đơn đầu tiên
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Đăng ký email để nhận thông báo sớm nhất về các đợt Flash Sale cùng các cập nhật thiết bị công nghệ AI mới nhất.
            </p>
          </div>

          <div className="relative z-10 w-full lg:w-auto shrink-0">
            {!isSubscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md w-full">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Nhập địa chỉ email của bạn..."
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-full text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none focus:border-indigo-400 transition-all backdrop-blur-sm"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs sm:text-sm rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
                >
                  <span>Nhận Mã Ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>
            ) : (
              <div className="p-4 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Đăng ký thành công! Mã ưu đãi của bạn:</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono font-black text-amber-300 text-sm bg-black/30 px-2 py-0.5 rounded border border-amber-300/30">
                      WELCOME50K
                    </span>
                    <button
                      onClick={() => handleCopyCode('WELCOME50K')}
                      className="px-2.5 py-0.5 bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold rounded-full cursor-pointer transition-colors inline-flex items-center gap-1"
                    >
                      {copiedVoucher ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedVoucher ? 'Đã sao chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= 3. NỘI DUNG FOOTER CHÍNH ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Cột 1: Thông tin thương hiệu & Hotline */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo size="md" showSlogan={true} />

            <p className="text-xs text-slate-600 leading-relaxed">
              Alibaba-Store là nền tảng thương mại thiết bị công nghệ chính hãng hàng đầu.
              Cam kết 100% sản phẩm nguồn gốc rõ ràng, bảo hành ủy quyền chuẩn quốc tế cùng trải nghiệm mua sắm tích hợp AI thông minh.
            </p>

            {/* Hotline box */}
            <div className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Tư vấn mua hàng (Miễn phí):</span>
                <a href={`tel:${STORE_CONFIG.hotline}`} className="font-bold text-indigo-600 hover:underline">
                  {STORE_CONFIG.hotlineFormatted}
                </a>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Hotline CSKH:</span>
                <a href={`tel:${STORE_CONFIG.hotline}`} className="font-bold text-slate-800 hover:underline">
                  {STORE_CONFIG.hotlineFormatted}
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Giờ làm việc:</span>
                <span className="font-semibold text-slate-700">{STORE_CONFIG.supportHours}</span>
              </div>
            </div>

            {/* Địa chỉ & Email */}
            <div className="text-[11px] text-slate-500 space-y-1">
              <p className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                <span>{STORE_CONFIG.address}</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Email hỗ trợ: <strong className="text-slate-700">{STORE_CONFIG.email}</strong></span>
              </p>
            </div>
          </div>

          {/* Cột 2: Thông tin & Chính sách */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider border-l-3 border-indigo-600 pl-2.5">
              Thông Tin &amp; Chính Sách
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link to="/products" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                  <span>Mua hàng và thanh toán Online</span>
                </Link>
              </li>
              <li>
                <a href="#installment" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                  <span>Mua hàng trả góp 0% lãi suất qua thẻ</span>
                </a>
              </li>
              <li>
                <a href="#warranty" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                  <span>Chính sách bảo hành &amp; 1 đổi 1 trong 30 ngày</span>
                </a>
              </li>
              <li>
                <a href="#tradein" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                  <span>Thu cũ đổi mới - Trợ giá đến 2.500.000 ₫</span>
                </a>
              </li>
              <li>
                <a href="#shipping" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                  <span>Chính sách giao hàng siêu tốc 2H</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 3: Danh mục nổi bật & Dịch vụ AI */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider border-l-3 border-violet-600 pl-2.5">
              Hệ Sinh Thái
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li>
                <Link to="/products?category=dien-thoai" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                  <span>Điện thoại Flagship</span>
                </Link>
              </li>
              <li>
                <Link to="/products?category=laptop" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                  <span>MacBook &amp; Laptop</span>
                </Link>
              </li>
              <li>
                <Link to="/products?category=am-thanh" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                  <span>Tai nghe chính hãng</span>
                </Link>
              </li>
              <li>
                <Link to="/products?category=dong-ho" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                  <span>Smartwatch theo dõi sức khỏe</span>
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                  <span>Tra cứu đơn hàng</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Phương thức thanh toán */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider border-l-3 border-emerald-600 pl-2.5">
              Thanh Toán An Toàn
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hỗ trợ đa dạng phương thức thanh toán bảo mật PCI-DSS tiêu chuẩn ngân hàng:
            </p>

            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 rounded-2xl text-center text-[10px] font-bold text-slate-800 transition-colors">
                <span className="text-blue-600 block text-xs font-black">VietQR</span>
                <span>Quét mã 24/7</span>
              </div>
              <div className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 rounded-2xl text-center text-[10px] font-bold text-slate-800 transition-colors">
                <span className="text-pink-600 block text-xs font-black">MoMo</span>
                <span>Ví điện tử</span>
              </div>
              <div className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 rounded-2xl text-center text-[10px] font-bold text-slate-800 transition-colors">
                <span className="text-blue-700 block text-xs font-black">ZaloPay</span>
                <span>Giảm đến 100k</span>
              </div>
              <div className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 rounded-2xl text-center text-[10px] font-bold text-slate-800 transition-colors">
                <span className="text-amber-600 block text-xs font-black">VNPAY</span>
                <span>QR Ngân hàng</span>
              </div>
              <div className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 rounded-2xl text-center text-[10px] font-bold text-slate-800 transition-colors">
                <span className="text-slate-900 block text-xs font-black">Apple Pay</span>
                <span>Chạm một chạm</span>
              </div>
              <div className="p-2.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 rounded-2xl text-center text-[10px] font-bold text-slate-800 transition-colors">
                <span className="text-indigo-600 block text-xs font-black">VISA/Master</span>
                <span>Thẻ quốc tế</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 4. BẢN QUYỀN & TRẠNG THÁI HỆ THỐNG ================= */}
        <div className="border-t border-slate-200/80 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700">Alibaba AI Engine:</span>
            <span>Hệ thống hoạt động ổn định 99.99% • Bảo mật đa lớp</span>
          </div>

          <p className="text-center">
            &copy; 2026 Alibaba Store. All rights reserved.
          </p>

          <div className="flex items-center gap-4 text-[11px]">
            <a href="#terms" className="hover:text-indigo-600 transition-colors">Điều khoản dịch vụ</a>
            <span>•</span>
            <a href="#privacy" className="hover:text-indigo-600 transition-colors">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Home as HomeIcon,
  Banknote,
  Smartphone,
  Laptop,
  Watch,
  Tablet,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  PhoneCall,
  Check,
  Calendar,
  X,
} from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import ProductCard from '../components/ProductCard';

export default function TradeInPage({ onOpenAiChat }) {
  // Device categories for trade-in
  const deviceTypes = [
    { id: 'iphone', name: 'iPhone', icon: Smartphone },
    { id: 'samsung', name: 'Samsung Galaxy', icon: Smartphone },
    { id: 'macbook', name: 'MacBook', icon: Laptop },
    { id: 'ipad', name: 'iPad / Tablet', icon: Tablet },
    { id: 'watch', name: 'Apple Watch', icon: Watch },
  ];

  // Old models database with base price (Loại 1) and Alibaba subsidy
  const oldModelsData = {
    iphone: [
      { name: 'iPhone 14 Pro Max 128GB', basePrice: 17500000, subsidy: 3000000 },
      { name: 'iPhone 14 Pro 128GB', basePrice: 15000000, subsidy: 2500000 },
      { name: 'iPhone 14 Plus / 14 128GB', basePrice: 11500000, subsidy: 2000000 },
      { name: 'iPhone 13 Pro Max 128GB', basePrice: 14000000, subsidy: 2500000 },
      { name: 'iPhone 13 Pro 128GB', basePrice: 11800000, subsidy: 2000000 },
      { name: 'iPhone 13 128GB', basePrice: 9500000, subsidy: 1500000 },
      { name: 'iPhone 12 Pro Max 128GB', basePrice: 10500000, subsidy: 2000000 },
      { name: 'iPhone 12 64GB/128GB', basePrice: 6800000, subsidy: 1500000 },
      { name: 'iPhone 11 Pro Max 64GB', basePrice: 7200000, subsidy: 1500000 },
      { name: 'iPhone 11 64GB', basePrice: 4800000, subsidy: 1000000 },
    ],
    samsung: [
      { name: 'Galaxy S23 Ultra 5G 256GB', basePrice: 15500000, subsidy: 3000000 },
      { name: 'Galaxy S23 Plus / S23', basePrice: 10500000, subsidy: 2500000 },
      { name: 'Galaxy Z Fold 4 256GB', basePrice: 13500000, subsidy: 3500000 },
      { name: 'Galaxy Z Flip 4 128GB', basePrice: 7200000, subsidy: 2000000 },
      { name: 'Galaxy S22 Ultra 5G 128GB', basePrice: 10800000, subsidy: 2500000 },
      { name: 'Galaxy S21 Ultra 5G', basePrice: 7800000, subsidy: 2000000 },
      { name: 'Galaxy Note 20 Ultra 5G', basePrice: 6500000, subsidy: 1500000 },
    ],
    macbook: [
      { name: 'MacBook Pro 14 inch M2 Pro 16GB/512GB', basePrice: 28500000, subsidy: 4000000 },
      { name: 'MacBook Pro 14 inch M1 Pro 16GB/512GB', basePrice: 22000000, subsidy: 3500000 },
      { name: 'MacBook Air M2 13 inch 8GB/256GB', basePrice: 15000000, subsidy: 2500000 },
      { name: 'MacBook Air M1 13 inch 8GB/256GB', basePrice: 11000000, subsidy: 2000000 },
      { name: 'MacBook Pro 13 inch M1 8GB/256GB', basePrice: 13500000, subsidy: 2000000 },
    ],
    ipad: [
      { name: 'iPad Pro 11 inch M2 Wi-Fi 128GB', basePrice: 14500000, subsidy: 2000000 },
      { name: 'iPad Pro 11 inch M1 Wi-Fi 128GB', basePrice: 11500000, subsidy: 2000000 },
      { name: 'iPad Air 5 M1 Wi-Fi 64GB', basePrice: 9000000, subsidy: 1500000 },
      { name: 'iPad Gen 10 10.9 inch 64GB', basePrice: 6500000, subsidy: 1000000 },
      { name: 'iPad Gen 9 10.2 inch 64GB', basePrice: 4200000, subsidy: 800000 },
    ],
    watch: [
      { name: 'Apple Watch Ultra 49mm Titanium', basePrice: 11500000, subsidy: 2000000 },
      { name: 'Apple Watch Series 8 45mm Nhôm GPS', basePrice: 5200000, subsidy: 1000000 },
      { name: 'Apple Watch Series 7 45mm GPS', basePrice: 4000000, subsidy: 800000 },
      { name: 'Galaxy Watch 5 Pro 45mm', basePrice: 3500000, subsidy: 800000 },
    ],
  };

  // Conditions
  const conditions = [
    {
      id: 'type1',
      title: 'Loại 1 (Máy đẹp 99%)',
      desc: 'Màn hình & thân máy đẹp, không trầy xước, pin > 85%, đầy đủ tính năng hoạt động hoàn hảo.',
      multiplier: 1.0,
      badge: 'Định giá tối đa',
    },
    {
      id: 'type2',
      title: 'Loại 2 (Máy đẹp 95%)',
      desc: 'Màn hình đẹp, thân máy xước dăm nhẹ viền, pin 80 - 85%, đầy đủ tính năng.',
      multiplier: 0.85,
      badge: 'Phổ biến nhất',
    },
    {
      id: 'type3',
      title: 'Loại 3 (Máy 90%)',
      desc: 'Thân máy cấn móp hoặc xước nhiều, pin < 80%, màn hình hiển thị tốt, chức năng bình thường.',
      multiplier: 0.70,
      badge: 'Vẫn thu giá tốt',
    },
  ];

  // Upgrades list (target products)
  const upgradeTargets = useMemo(() => {
    return PRODUCTS.filter((p) => p.isFeatured || p.price > 20000000).slice(0, 8);
  }, []);

  // State
  const [selectedType, setSelectedType] = useState('iphone');
  const [selectedModelIndex, setSelectedModelIndex] = useState(0);
  const [selectedCondition, setSelectedCondition] = useState('type1');
  const [selectedTargetId, setSelectedTargetId] = useState(upgradeTargets[0]?.id || 1);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    address: '',
    note: '',
  });

  // Active calculations
  const currentModelList = oldModelsData[selectedType] || oldModelsData.iphone;
  const currentModel = currentModelList[selectedModelIndex] || currentModelList[0];
  const currentConditionObj = conditions.find((c) => c.id === selectedCondition) || conditions[0];
  const currentTargetProduct = upgradeTargets.find((p) => p.id === selectedTargetId) || upgradeTargets[0];

  const estimatedBaseValue = Math.round(currentModel.basePrice * currentConditionObj.multiplier);
  const subsidyAmount = currentModel.subsidy;
  const totalTradeInCredit = estimatedBaseValue + subsidyAmount;
  const targetPrice = currentTargetProduct ? currentTargetProduct.price : 29490000;
  const payDifference = Math.max(0, targetPrice - totalTradeInCredit);
  const installmentPerMonth = Math.round(payDifference / 6);

  const formatPrice = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setIsBookingModalOpen(false);
      setBookingSuccess(false);
      setBookingForm({ name: '', phone: '', address: '', note: '' });
    }, 2500);
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-20 antialiased text-slate-800">
      {/* 1. HERO HEADER */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white pt-12 pb-16 sm:py-20">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4 text-center sm:text-left">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md">
              <RotateCcw className="w-3.5 h-3.5 text-rose-400 animate-spin-slow" />
              CHƯƠNG TRÌNH THU CŨ ĐỔI MỚI 2024 - 2025
            </span>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Thu Cũ Giá Hời • Lên Đời Trợ Giá Đến{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300">
                4.000.000đ
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Định giá online minh bạch 2 phút. Thu đổi mọi dòng máy iPhone, Samsung, MacBook, iPad, Apple Watch. 
              Máy cấn xước vẫn thu giá tốt — Trừ tiền trực tiếp vào máy mới hoặc nhận chuyển khoản ngay.
            </p>

            <div className="pt-4 flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <Clock className="w-4 h-4 text-amber-400" />
                Định giá 2 phút
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <HomeIcon className="w-4 h-4 text-indigo-400" />
                Thu tận nhà miễn phí
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <Banknote className="w-4 h-4 text-emerald-400" />
                Trợ giá 4.000.000đ
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                Bảo mật dữ liệu tuyệt đối
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BỘ CÔNG CỤ ĐỊNH GIÁ TRỰC TUYẾN 2 PHÚT (ONLINE ESTIMATOR) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 lg:p-10 space-y-8">
          {/* Header công cụ */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Bảng Tính Định Giá &amp; Khoản Tiền Cần Bù
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Chọn thiết bị cũ bạn đang dùng và thiết bị muốn lên đời để xem số tiền tiết kiệm
              </p>
            </div>

            <button
              onClick={onOpenAiChat}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all border border-indigo-200 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Nhờ Trợ lý AI thẩm định ảnh máy</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* CỘT TRÁI (7 CỘT): CÁC BƯỚC CHỌN MÁY CŨ */}
            <div className="lg:col-span-7 space-y-6">
              {/* BƯỚC 1: Chọn dòng thiết bị */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                  Loại thiết bị cũ của bạn
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {deviceTypes.map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedType(item.id);
                          setSelectedModelIndex(0);
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25 font-bold'
                            : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BƯỚC 2: Chọn model máy */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                  Model máy cũ của bạn
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {currentModelList.map((m, idx) => {
                    const isSelected = selectedModelIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedModelIndex(idx)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-rose-50 border-rose-300 text-rose-950 font-bold shadow-2xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{m.name}</p>
                          <p className="text-[11px] text-slate-500">
                            Giá thu tối đa: <strong className="text-slate-900">{formatPrice(m.basePrice)}</strong>
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BƯỚC 3: Chọn tình trạng máy */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                  Tình trạng ngoại quan thực tế
                </label>
                <div className="space-y-2">
                  {conditions.map((cond) => {
                    const isSelected = selectedCondition === cond.id;
                    return (
                      <div
                        key={cond.id}
                        onClick={() => setSelectedCondition(cond.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-2xs'
                            : 'bg-white hover:bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{cond.title}</span>
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">
                              {cond.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{cond.desc}</p>
                        </div>

                        <div className="shrink-0 pt-0.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BƯỚC 4: Chọn máy muốn lên đời */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">4</span>
                  Chọn thiết bị mới muốn lên đời
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {upgradeTargets.map((p) => {
                    const isSelected = selectedTargetId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedTargetId(p.id)}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                          isSelected
                            ? 'bg-violet-50 border-violet-400 ring-2 ring-violet-500/20 font-bold'
                            : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-800'
                        }`}
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-14 h-14 object-cover rounded-xl"
                        />
                        <div>
                          <p className="text-[11px] font-bold text-slate-900 line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-indigo-600 font-extrabold mt-0.5">
                            {formatPrice(p.price)}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CỘT PHẢI (5 CỘT): KẾT QUẢ TÍNH TOÁN & CÁC LỰA CHỌN */}
            <div className="lg:col-span-5 sticky top-24">
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl border border-indigo-900/50">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    BẢNG THẨM ĐỊNH TỨC THÌ
                  </span>
                  <span className="text-[11px] text-slate-400">Giữ giá 48 giờ</span>
                </div>

                {/* Máy cũ và máy mới tóm tắt */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <p className="text-[11px] text-slate-400">Máy cũ của bạn:</p>
                    <p className="text-sm font-bold text-white">{currentModel.name}</p>
                    <p className="text-[11px] text-indigo-300 font-medium">{currentConditionObj.title}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                    <p className="text-[11px] text-slate-400">Lên đời máy mới:</p>
                    <p className="text-sm font-bold text-emerald-300">
                      {currentTargetProduct ? currentTargetProduct.name : 'iPhone 15 Pro Max'}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Giá niêm yết: <strong className="text-white">{formatPrice(targetPrice)}</strong>
                    </p>
                  </div>
                </div>

                {/* Chi tiết khấu trừ */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>1. Định giá máy cũ ({currentConditionObj.badge}):</span>
                    <strong className="text-white font-bold">{formatPrice(estimatedBaseValue)}</strong>
                  </div>

                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-1">
                      <Banknote className="w-3.5 h-3.5" />
                      2. Trợ giá độc quyền Alibaba Store:
                    </span>
                    <strong className="font-bold">+{formatPrice(subsidyAmount)}</strong>
                  </div>

                  <div className="flex items-center justify-between text-indigo-300 font-semibold pt-1 border-t border-white/5">
                    <span>Tổng tiền thu lại cho máy cũ:</span>
                    <strong className="text-sm text-indigo-200">{formatPrice(totalTradeInCredit)}</strong>
                  </div>
                </div>

                {/* SỐ TIỀN CẦN BÙ CUỐI CÙNG */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/20 via-pink-500/20 to-indigo-500/20 border border-rose-500/30 text-center space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                    Số tiền cần bù thêm để nhận máy mới
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-white">
                    {formatPrice(payDifference)}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Hoặc trả góp 0% lãi suất: <strong className="text-amber-300">{formatPrice(installmentPerMonth)}/tháng</strong> (kỳ hạn 6 tháng)
                  </p>
                </div>

                {/* Nút hành động */}
                <div className="space-y-2.5 pt-2">
                  <button
                    onClick={() => setIsBookingModalOpen(true)}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 group"
                  >
                    <span>Đăng ký giữ giá &amp; Đặt lịch thẩm định</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={onOpenAiChat}
                    className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-all border border-white/10 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Chat với AI tư vấn kỹ thuật miễn phí</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. QUY TRÌNH THU CŨ 4 BƯỚC ĐƠN GIẢN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
            MINH BẠCH &amp; NHANH GỌN
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Quy Trình Thu Cũ Đổi Mới 4 Bước
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Không cần chờ đợi hàng giờ, bạn có thể thực hiện tại cửa hàng hoặc kỹ thuật viên phục vụ tận nhà
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              step: '01',
              title: 'Định giá online 2 phút',
              desc: 'Chọn dòng máy cũ và kiểm tra tình trạng máy sơ bộ qua công cụ trên website để biết ngay mức giá dự kiến.',
              icon: Clock,
              color: 'text-rose-600 bg-rose-50 border-rose-200',
            },
            {
              step: '02',
              title: 'Đặt lịch tại shop hoặc tại nhà',
              desc: 'Mang máy đến cửa hàng gần nhất hoặc chọn dịch vụ kỹ thuật viên kiểm tra tận nhà hoàn toàn miễn phí.',
              icon: HomeIcon,
              color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
            },
            {
              step: '03',
              title: 'Kiểm tra máy 10 phút',
              desc: 'Kỹ thuật viên kiểm tra ngoại quan, pin, camera và chức năng trước mặt khách hàng, cam kết báo giá chuẩn.',
              icon: ShieldCheck,
              color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
            },
            {
              step: '04',
              title: 'Trừ tiền nhận máy mới',
              desc: 'Khấu trừ trực tiếp tiền máy cũ vào hóa đơn máy mới bóc seal hoặc nhận tiền chuyển khoản ngay trong 5 phút.',
              icon: Banknote,
              color: 'text-amber-600 bg-amber-50 border-amber-200',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-4 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${item.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-200 group-hover:text-indigo-200 transition-colors">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. TOP SẢN PHẨM TRỢ GIÁ LÊN ĐỜI CAO NHẤT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-rose-600">
              CƠ HỘI LÊN ĐỜI FLAGSHIP
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Sản Phẩm Trợ Giá Lên Đời Nhiều Nhất
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>Xem tất cả sản phẩm mới</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          {upgradeTargets.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 5. CÂU HỎI THƯỜNG GẶP (FAQ) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
            GIẢI ĐÁP THẮC MẮC
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Câu Hỏi Thường Gặp Về Thu Cũ Đổi Mới
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Máy cũ xách tay, không mua tại Alibaba Store có được thu đổi không?',
              a: 'Có. Chúng tôi thu mua TẤT CẢ các dòng máy chính hãng, xách tay quốc tế (Mỹ LL/A, Nhật J/A, Hàn KH/A...) không phân biệt nơi mua ban đầu.',
            },
            {
              q: 'Máy mất hộp hoặc phụ kiện thì có bị trừ tiền định giá không?',
              a: 'Không. Mức giá thu mua chỉ căn cứ trên tình trạng hoạt động và ngoại quan của thân máy. Bạn không cần mang theo củ sạc, dây cáp hay vỏ hộp cũ.',
            },
            {
              q: 'Tôi chỉ muốn bán máy cũ lấy tiền mặt chứ không mua máy mới có được không?',
              a: 'Được. Chúng tôi hỗ trợ thu mua lấy tiền mặt hoặc nhận chuyển khoản ngân hàng ngay trong 5 phút mà không bắt buộc bạn phải mua thiết bị mới.',
            },
            {
              q: 'Chương trình trợ giá thu cũ có được áp dụng chung với Trả góp 0% không?',
              a: 'Có. Bạn vẫn được hưởng trọn vẹn trợ giá lên đời đến 4.000.000đ và số tiền chênh lệch còn lại có thể trả góp 0% qua thẻ tín dụng hoặc CCCD.',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-2 shadow-2xs"
            >
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                {faq.q}
              </h4>
              <p className="text-xs text-slate-600 pl-6 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL ĐẶT LỊCH THU CŨ */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBookingModalOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 z-10 border border-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Đăng Ký Thu Cũ Giữ Giá 48H</h3>
                  <p className="text-xs text-slate-500">Giữ nguyên mức định giá {formatPrice(totalTradeInCredit)}</p>
                </div>
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {bookingSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Đăng Ký Thành Công!</h4>
                  <p className="text-xs text-slate-500">
                    Chuyên viên thẩm định Alibaba Store sẽ liên hệ qua số {bookingForm.phone} trong 15 phút để xác nhận lịch hẹn.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1">
                    <p className="text-slate-600">
                      Thu máy cũ: <strong className="text-slate-900">{currentModel.name}</strong> ({currentConditionObj.title})
                    </p>
                    <p className="text-slate-600">
                      Lên đời: <strong className="text-indigo-600">{currentTargetProduct?.name}</strong> • Bù thêm:{' '}
                      <strong className="text-rose-600">{formatPrice(payDifference)}</strong>
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Họ và tên khách hàng *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Số điện thoại liên hệ *</label>
                    <input
                      type="tel"
                      required
                      placeholder="0912 345 678"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Địa chỉ hẹn (nếu chọn thẩm định tại nhà)</label>
                    <input
                      type="text"
                      placeholder="Số nhà, đường, phường/xã, quận/huyện..."
                      value={bookingForm.address}
                      onChange={(e) => setBookingForm({ ...bookingForm, address: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    Xác nhận đặt lịch giữ giá
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

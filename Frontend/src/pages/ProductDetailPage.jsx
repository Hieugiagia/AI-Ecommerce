import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Check,
  Heart,
  Gift,
  MapPin,
  Phone,
  CreditCard,
  Box,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const product = PRODUCTS.find((p) => p.id === Number(id)) || PRODUCTS[0];

  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs', 'desc', 'reviews'
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlist, setIsWishlist] = useState(false);

  // Review state
  const [reviews, setReviews] = useState([
    {
      id: 1,
      author: 'Nguyễn Tiến Đạt',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80',
      rating: 5,
      date: '2 ngày trước',
      verified: true,
      comment: 'Máy cầm rất đầm tay, viền titan nhẹ hơn hẳn bản tiền nhiệm. Màu Titan Tự Nhiên ở ngoài đẹp sang trọng, giao hàng Alibaba-Store nhanh trong 1 giờ!',
      likes: 14,
    },
    {
      id: 2,
      author: 'Hoàng Mai Phương',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
      rating: 5,
      date: '5 ngày trước',
      verified: true,
      comment: 'Chip cực kỳ mượt, chạy các tác vụ AI và render video không bị nóng. Được trợ giá thu cũ 2 triệu rất tiết kiệm.',
      likes: 9,
    },
    {
      id: 3,
      author: 'Lê Quốc Bảo',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=80&auto=format&fit=crop&q=80',
      rating: 5,
      date: '1 tuần trước',
      verified: true,
      comment: 'Camera zoom nét từng chi tiết. Nhân viên tư vấn nhiệt tình, hỗ trợ chuyển dữ liệu máy cũ qua máy mới miễn phí.',
      likes: 21,
    },
  ]);

  const [newReviewText, setNewReviewText] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    const newRev = {
      id: Date.now(),
      author: isAuthenticated ? 'Khách hàng thân thiết' : 'Khách hàng Alibaba-Store',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80',
      rating: newRating,
      date: 'Vừa xong',
      verified: true,
      comment: newReviewText.trim(),
      likes: 1,
    };
    setReviews([newRev, ...reviews]);
    setNewReviewText('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  const currentPrice = product.price + (selectedVariant?.priceDelta || 0);
  const currentOriginalPrice = product.originalPrice + (selectedVariant?.priceDelta || 0);

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const discountPercent = currentOriginalPrice > currentPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant, selectedColor);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedVariant, selectedColor);
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  const relatedProducts = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 antialiased text-slate-800">
      {/* 1. BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap pb-1">
        <Link to="/" className="hover:text-indigo-600 transition-colors font-medium">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link
          to={`/products?category=${product.category}`}
          className="hover:text-indigo-600 transition-colors font-medium"
        >
          {product.categoryName}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-semibold text-slate-700">{product.brand}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
          {product.name}
        </span>
      </nav>

      {/* 2. HEADER SẢN PHẨM */}
      <div className="border-b border-slate-200/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="bg-slate-900 text-white text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
              Chính Hãng VN/A
            </span>
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
              Trả góp 0%
            </span>
            {product.tag && (
              <span className="bg-gradient-to-r from-violet-50 to-indigo-50 text-violet-700 border border-violet-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-violet-500" />
                {product.tag}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
            {product.name}
          </h1>
        </div>

        {/* Rating & Hotline */}
        <div className="flex items-center gap-3 text-xs shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-full">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-extrabold text-slate-900">{product.rating}</span>
            <span className="text-slate-400">({product.ratingCount || 128} đánh giá)</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-600 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-full">
            <Phone className="w-3.5 h-3.5 text-indigo-600" />
            <span>Hotline: <strong className="text-indigo-600 font-bold">1800.2097</strong></span>
          </div>
        </div>
      </div>

      {/* 3. KHỐI CHI TIẾT SẢN PHẨM: 2 CỘT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* ================= CỘT TRÁI: HÌNH ẢNH + CAM KẾT + AI PROS ================= */}
        <div className="lg:col-span-6 space-y-6">
          {/* Khung ảnh chính */}
          <div className="relative aspect-square bg-white border border-slate-200/80 rounded-3xl overflow-hidden p-6 flex items-center justify-center shadow-xs group">
            <motion.img
              key={activeImage}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
            />

            {/* Badges góc trên */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              {discountPercent > 0 && (
                <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                  Tiết kiệm {discountPercent}%
                </span>
              )}
              <span className="bg-white/90 backdrop-blur-xs text-slate-700 border border-slate-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                Bảo hành 12 Tháng
              </span>
            </div>

            {/* Wishlist button */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => setIsWishlist(!isWishlist)}
                className="p-2.5 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 hover:bg-white text-slate-600 hover:text-rose-500 transition-all cursor-pointer shadow-xs"
                title="Yêu thích"
              >
                <Heart
                  className={`w-5 h-5 ${isWishlist ? 'fill-rose-500 text-rose-500' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Dải ảnh Thumbnails */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white cursor-pointer shrink-0 ${
                    activeImage === img
                      ? 'border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover rounded-xl" />
                </button>
              ))}
            </div>
          )}

          {/* HỘP CAM KẾT CHUẨN SAAS */}
          <div className="p-5 bg-white border border-slate-200/80 rounded-3xl space-y-3.5 shadow-xs">
            <h3 className="font-extrabold text-xs text-slate-900 flex items-center gap-2 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Chính Sách Bán Hàng &amp; Dịch Vụ Hậu Mãi</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Bảo hành 12 tháng</strong>
                  <span>Chính hãng tại các TTBH ủy quyền</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <RotateCcw className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">1 đổi 1 trong 30 ngày</strong>
                  <span>Nếu phát sinh lỗi từ nhà sản xuất</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Giao nhanh 2 giờ</strong>
                  <span>Nội thành hoặc nhận tại 120 cửa hàng</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <Box className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Hộp phụ kiện đầy đủ</strong>
                  <span>Thân máy, cáp sạc USB-C, sách HDSD</span>
                </div>
              </div>
            </div>
          </div>

          {/* HỘP AI SMART INSIGHTS */}
          {product.aiPros && product.aiPros.length > 0 && (
            <div className="p-5 bg-gradient-to-br from-indigo-50/90 via-violet-50/50 to-purple-50/90 border border-indigo-200/80 rounded-3xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span>AI Insight: Đánh Giá &amp; Điểm Nổi Bật</span>
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-indigo-200">
                  AI Verified
                </span>
              </div>
              <ul className="space-y-2">
                {product.aiPros.map((pro, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ================= CỘT PHẢI: GIÁ + CẤU HÌNH + KHUYẾN MÃI + NÚT MUA ================= */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. KHỐI GIÁ NỔI BẬT */}
          <div className="p-6 bg-slate-50/90 border border-slate-200/80 rounded-3xl space-y-3.5">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {formatVND(currentPrice)}
              </span>
              {currentOriginalPrice > currentPrice && (
                <span className="text-sm sm:text-base text-slate-400 line-through font-semibold">
                  {formatVND(currentOriginalPrice)}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100/80 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  Tiết kiệm {formatVND(currentOriginalPrice - currentPrice)}
                </span>
              )}
            </div>

            {/* AI Club rebate badge */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200/80 p-3 rounded-2xl shadow-2xs">
              <Sparkles className="w-4 h-4 text-violet-600 shrink-0" />
              <span>
                <strong>Hội viên AI Club:</strong> Tích luỹ thêm 1% điểm (tương đương{' '}
                <strong className="text-indigo-600">{formatVND(Math.round(currentPrice * 0.01))}</strong>) cho lần mua kế tiếp.
              </span>
            </div>
          </div>

          {/* 2. CHỌN PHIÊN BẢN / DUNG LƯỢNG */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Chọn Phiên bản / Bộ nhớ:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedVariant?.name === v.name;
                  const vPrice = product.price + (v.priceDelta || 0);
                  return (
                    <motion.button
                      key={v.name}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 text-slate-900 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs sm:text-sm">{v.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 font-bold" />}
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-600 mt-1">
                        {formatVND(vPrice)}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. CHỌN MÀU SẮC */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                Chọn Màu sắc: <span className="text-indigo-600 font-bold ml-1">{selectedColor?.name}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => {
                  const isSelected = selectedColor?.name === c.name;
                  return (
                    <motion.button
                      key={c.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedColor(c)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                        style={{ backgroundColor: c.code }}
                      />
                      <span>{c.name}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. HỘP KHUYẾN MÃI ĐẶC QUYỀN */}
          <div className="border border-indigo-200/80 bg-indigo-50/20 rounded-3xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs sm:text-sm uppercase tracking-wide">
              <Gift className="w-4 h-4 text-indigo-600" />
              <span>Khuyến Mãi Đặc Biệt Khi Mua Hôm Nay</span>
            </div>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  <strong>Thu cũ đổi mới:</strong> Trợ giá ngay đến <strong>2.000.000đ</strong> khi lên đời thiết bị mới.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  <strong>Ưu đãi thanh toán:</strong> Giảm thêm <strong>500.000đ</strong> khi thanh toán qua VietQR / Ví MoMo / Thẻ tín dụng.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  <strong>Bảo hành VIP:</strong> 1 đổi 1 trong 12 tháng tại hệ thống ủy quyền chính hãng.
                </span>
              </div>
            </div>
          </div>

          {/* 5. CỬA HÀNG CÒN HÀNG */}
          <div className="p-4 bg-white border border-slate-200/80 rounded-3xl space-y-2 text-xs text-slate-600 shadow-2xs">
            <div className="flex items-center justify-between text-slate-900 font-bold">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Có 8 cửa hàng sẵn hàng giao ngay:</span>
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">Còn {product.stock} máy</span>
            </div>
            <ul className="space-y-1 pl-5 list-disc text-[11px] text-slate-500">
              <li>136 Nguyễn Thái Học, Quận 1, TP.HCM</li>
              <li>288 Đường 3/2, Quận 10, TP.HCM</li>
              <li>Toà Keangnam Landmark 72, Nam Từ Liêm, Hà Nội</li>
            </ul>
          </div>

          {/* 6. CHỌN SỐ LƯỢNG */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Số lượng:
            </span>
            <div className="flex items-center border border-slate-200 rounded-full bg-white overflow-hidden shadow-xs">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors font-bold cursor-pointer"
              >
                -
              </button>
              <span className="px-4 py-2 text-sm font-bold text-slate-900 min-w-10 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors font-bold cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* 7. CỤM NÚT MUA HÀNG (SaaS MotionSites Style) */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* NÚT 1: MUA NGAY (Indigo/Violet Gradient) */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-black text-sm uppercase transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 cursor-pointer flex flex-col items-center justify-center"
              >
                <span className="flex items-center gap-1.5 text-base tracking-wide">
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                  MUA NGAY
                </span>
                <span className="text-[10px] font-medium opacity-90 lowercase first-letter:uppercase">
                  Giao tận nơi 2h hoặc nhận tại cửa hàng
                </span>
              </motion.button>

              {/* NÚT 2: TRẢ GÓP 0% */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                className="w-full py-4 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm uppercase transition-all shadow-md shadow-slate-900/10 cursor-pointer flex flex-col items-center justify-center"
              >
                <span className="flex items-center gap-1.5 text-base tracking-wide">
                  <CreditCard className="w-4 h-4 text-indigo-400" />
                  TRẢ GÓP 0%
                </span>
                <span className="text-[10px] font-medium opacity-90 lowercase first-letter:uppercase">
                  Duyệt hồ sơ nhanh 5 phút qua thẻ / CCCD
                </span>
              </motion.button>
            </div>

            {/* NÚT 3: THÊM VÀO GIỎ HÀNG */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              className={`w-full py-3.5 px-6 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                isAdded
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
                  : 'bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-600 border-slate-200 hover:border-indigo-300 shadow-xs'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" /> Đã thêm vào giỏ hàng thành công!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 text-indigo-600" />
                  <span>Thêm vào giỏ hàng (Để mua sau hoặc gom đơn)</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* 4. TABS THÔNG TIN CHI TIẾT & ĐÁNH GIÁ */}
      <div className="pt-8 border-t border-slate-200/80">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('specs')}
            className={`text-xs sm:text-sm font-bold pb-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Thông số kỹ thuật chi tiết
          </button>
          <button
            onClick={() => setActiveTab('desc')}
            className={`text-xs sm:text-sm font-bold pb-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'desc'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Đặc điểm nổi bật &amp; Bài viết đánh giá
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`text-xs sm:text-sm font-bold pb-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Đánh giá của khách hàng ({reviews.length})
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="py-6">
          {/* TAB 1: BẢNG THÔNG SỐ KỸ THUẬT */}
          {activeTab === 'specs' && product.specs && (
            <div className="max-w-3xl bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  Cấu hình phần cứng &amp; Thông số kỹ thuật {product.name}
                </span>
                <span className="text-[11px] text-slate-400">Nguồn: Nhà sản xuất</span>
              </div>
              <table className="w-full text-xs sm:text-sm">
                <tbody>
                  {Object.entries(product.specs).map(([key, value], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                    >
                      <td className="py-3.5 px-5 font-semibold text-slate-700 w-1/3 border-b border-slate-100">
                        {key}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 border-b border-slate-100">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: MÔ TẢ & BÀI ĐÁNH GIÁ CHI TIẾT */}
          {activeTab === 'desc' && (
            <div className="max-w-4xl space-y-6 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Trải nghiệm công nghệ thế hệ mới cùng {product.name}
                </h3>
                <p className="whitespace-pre-line">{product.description}</p>
                <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 text-slate-700">
                  <h4 className="font-bold text-sm text-indigo-900 mb-1">
                    Vì sao nên chọn mua tại Alibaba-Store?
                  </h4>
                  <p className="text-xs text-slate-600">
                    Alibaba-Store cam kết 100% sản phẩm là hàng chính hãng được phân phối chính thức tại thị trường Việt Nam. Hệ thống hỗ trợ khách hàng kiểm tra máy trực tiếp, cài đặt ứng dụng miễn phí và chế độ bảo hành chuẩn ủy quyền.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ĐÁNH GIÁ KHÁCH HÀNG & FORM BÌNH LUẬN */}
          {activeTab === 'reviews' && (
            <div className="max-w-3xl space-y-6">
              {/* Thống kê sao */}
              <div className="p-6 bg-white border border-slate-200/80 rounded-3xl flex flex-col sm:flex-row items-center gap-6 shadow-xs">
                <div className="text-center sm:border-r sm:border-slate-100 sm:pr-8">
                  <div className="text-4xl font-black text-indigo-600">{product.rating}/5</div>
                  <div className="flex items-center gap-1 justify-center text-amber-400 my-1.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <div className="text-xs text-slate-400">{reviews.length} lượt đánh giá thực tế</div>
                </div>

                <div className="flex-1 space-y-2 w-full text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="w-10 font-semibold">5 sao</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-[90%] h-full bg-indigo-500 rounded-full" />
                    </div>
                    <span className="w-8 text-right text-slate-400">90%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-10 font-semibold">4 sao</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-[10%] h-full bg-indigo-500 rounded-full" />
                    </div>
                    <span className="w-8 text-right text-slate-400">10%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-10 font-semibold">3 sao</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="w-0 h-full bg-indigo-500 rounded-full" />
                    </div>
                    <span className="w-8 text-right text-slate-400">0%</span>
                  </div>
                </div>
              </div>

              {/* Form gửi đánh giá */}
              <form onSubmit={handleAddReview} className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-600" />
                  <span>Gửi nhận xét của bạn về sản phẩm</span>
                </h4>
                <div>
                  <label className="text-xs text-slate-500 block mb-1.5 font-medium">Đánh giá số sao:</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewRating(star)}
                        className="cursor-pointer transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {newRating === 5 ? 'Tuyệt vời, rất hài lòng' : `${newRating} sao`}
                    </span>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={3}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm sử dụng, cảm nhận về chất lượng máy, nhân viên tư vấn..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between">
                  {reviewSubmitted ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Cảm ơn bạn! Đánh giá đã được ghi nhận.
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Đánh giá sẽ được hiển thị ngay sau khi gửi.
                    </span>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-full text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    Gửi nhận xét
                  </motion.button>
                </div>
              </form>

              {/* Danh sách đánh giá đã có */}
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 bg-white border border-slate-200/80 rounded-3xl space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.avatar}
                          alt={rev.author}
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {rev.author}
                            </span>
                            {rev.verified && (
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Đã mua tại Alibaba-Store
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">{rev.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center text-amber-400 gap-0.5">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-12">
                      {rev.comment}
                    </p>

                    <div className="pl-12 flex items-center gap-2 text-[11px] text-slate-400">
                      <button className="flex items-center gap-1 hover:text-indigo-600 transition-colors cursor-pointer">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Hữu ích ({rev.likes})</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. SẢN PHẨM LIÊN QUAN */}
      {relatedProducts.length > 0 && (
        <section className="pt-10 border-t border-slate-200/80 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                Gợi ý cùng phân khúc
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Sản phẩm tương tự được khách hàng quan tâm
              </h2>
            </div>
            <Link
              to={`/products?category=${product.category}`}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
            >
              <span>Xem tất cả {product.categoryName}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Check, Sparkles, Flame } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, isFlashSale = false, soldCount = 45 }) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.variants?.[0] || null, product.colors?.[0] || null);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-indigo-300/80 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between"
    >
      <Link to={`/product/${product.id}`} className="block flex-1 flex flex-col">
        {/* Ảnh sản phẩm */}
        <div className="relative aspect-square overflow-hidden bg-slate-50/70 p-4 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-106 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Badges góc trái */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {discountPercent > 0 && (
              <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                -{discountPercent}%
              </span>
            )}
            <span className="bg-white/90 backdrop-blur-xs text-slate-700 border border-slate-200/80 text-[10px] font-medium px-2 py-0.5 rounded-full shadow-xs">
              0% Trả góp
            </span>
          </div>

          {/* Tag AI hoặc Best Seller góc phải */}
          {product.tag && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200/60 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                <Sparkles className="w-2.5 h-2.5 text-indigo-500 animate-pulse" />
                {product.tag}
              </span>
            </div>
          )}
        </div>

        {/* Nội dung thông tin sản phẩm */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Tên thương hiệu nhỏ */}
            {product.brand && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                {product.brand}
              </p>
            )}

            {/* Tên sản phẩm */}
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors leading-snug">
              {product.name}
            </h3>

            {/* Giá bán */}
            <div className="flex items-baseline gap-2 mb-2.5">
              <span className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                {formatVND(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-[11px] text-slate-400 line-through font-medium">
                  {formatVND(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Khuyến mãi nổi bật (Hộp promo phong cách SaaS tinh tế) */}
            <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-2 mb-2.5 text-[10px] text-slate-600 space-y-1">
              <p className="flex items-center gap-1 font-medium text-slate-700 truncate">
                <span className="text-indigo-500 font-bold">•</span> Trợ giá thu cũ đến 2.000.000đ
              </p>
              <p className="flex items-center gap-1 text-slate-500 truncate">
                <span className="text-violet-500 font-bold">•</span> Tích 1% điểm hội viên AI Club
              </p>
            </div>

            {/* Flash Sale Stock Bar (nếu là mục Flash Sale) */}
            {isFlashSale && (
              <div className="space-y-1 my-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-indigo-600">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    Đã bán {soldCount}/100
                  </span>
                  <span className="text-slate-500">Sắp hết</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (soldCount / 100) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Rating & Sold count */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1 font-medium text-slate-700">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 text-[10px]">({product.ratingCount || 100})</span>
            </div>
            <span className="text-[10px] text-slate-400">Đã bán {product.sold || 50}</span>
          </div>
        </div>
      </Link>

      {/* Nút hành động */}
      <div className="p-4 pt-0">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`w-full py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            isAdded
              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
              : 'bg-slate-100 hover:bg-slate-900 text-slate-800 hover:text-white border border-slate-200/80 hover:border-slate-900'
          }`}
          title="Thêm vào giỏ hàng"
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Đã thêm vào giỏ</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Thêm vào giỏ</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

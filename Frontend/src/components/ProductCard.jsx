import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Check, Sparkles, Flame, ShieldCheck } from 'lucide-react';
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
    <div className="group relative bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-red-300 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 flex flex-col justify-between">
      <Link to={`/product/${product.id}`} className="block">
        {/* Ảnh sản phẩm */}
        <div className="relative aspect-square overflow-hidden bg-slate-50/80 p-3 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Badges góc trái */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {discountPercent > 0 && (
              <span className="bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs">
                Giảm {discountPercent}%
              </span>
            )}
            <span className="bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              Trả góp 0%
            </span>
          </div>

          {/* Tag AI hoặc Best Seller góc phải */}
          {product.tag && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-500" />
                {product.tag}
              </span>
            </div>
          )}
        </div>

        {/* Nội dung thông tin sản phẩm phong cách bán lẻ CellphoneS */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col">
          {/* Tên sản phẩm */}
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Giá bán nổi bật */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-sm sm:text-base font-extrabold text-red-600">
              {formatVND(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[11px] text-slate-400 line-through font-medium">
                {formatVND(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Khuyến mãi nổi bật (Hộp promo phong cách CellphoneS) */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-2 mb-2.5 text-[10px] text-slate-600 space-y-1">
            <p className="flex items-center gap-1 font-semibold text-slate-800 truncate">
              <span className="text-red-500 font-bold">•</span> Thu cũ trợ giá đến 2.000.000đ
            </p>
            <p className="flex items-center gap-1 text-slate-500 truncate">
              <span className="text-red-500 font-bold">•</span> NextClub giảm thêm 1%
            </p>
          </div>

          {/* Flash Sale Stock Bar (nếu là mục Flash Sale) */}
          {isFlashSale && (
            <div className="space-y-1 my-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-red-600">
                <span className="flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-red-500 text-red-500 animate-bounce" />
                  Đã bán {soldCount}/100
                </span>
                <span>Cháy hàng</span>
              </div>
              <div className="w-full bg-red-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 to-amber-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, (soldCount / 100) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Rating & Sold count */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-auto pt-1">
            <div className="flex items-center gap-1 font-medium text-slate-700">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400">({product.ratingCount || 100})</span>
            </div>
            <span className="text-[10px] text-slate-400">Đã bán {product.sold || 50}</span>
          </div>
        </div>
      </Link>

      {/* Nút hành động */}
      <div className="p-3.5 sm:p-4 pt-0">
        <button
          onClick={handleAddToCart}
          disabled={isAdded}
          className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            isAdded
              ? 'bg-emerald-600 text-white shadow-emerald-200'
              : 'bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 hover:border-red-600'
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
        </button>
      </div>
    </div>
  );
}

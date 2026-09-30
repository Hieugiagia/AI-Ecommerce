import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Tag,
  ShieldCheck,
  Check,
  ChevronLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { VOUCHERS } from '../data/mockData';

export default function CartPage() {
  const {
    cart,
    subtotal,
    discountAmount,
    shippingFee,
    total,
    appliedVoucher,
    voucherError,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyVoucher,
    removeVoucher,
  } = useCart();
  const { isAuthenticated } = useAuth();

  const [couponCode, setCouponCode] = useState('');
  const navigate = useNavigate();

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleApplyVoucher = (e) => {
    e.preventDefault();
    if (applyVoucher(couponCode)) {
      setCouponCode('');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-20 h-20 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto text-indigo-500 shadow-sm"
        >
          <ShoppingBag className="w-10 h-10" />
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Giỏ hàng của bạn đang trống</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Hãy dạo quanh các sản phẩm công nghệ AI hot nhất và chọn cho mình thiết bị ưng ý nhé!
        </p>
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all"
          >
            <span>Tiếp tục mua sắm</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const freeShippingThreshold = 500000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Tiêu đề & Nút quay lại */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Tiếp tục xem sản phẩm
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Giỏ hàng của bạn ({cart.length} sản phẩm)
          </h1>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-500 hover:text-rose-700 cursor-pointer"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* CỘT TRÁI: Danh sách sản phẩm (7 cột) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Thanh Freeship Progress */}
          <div className="p-4 bg-white border border-slate-200/80 rounded-3xl shadow-xs">
            {subtotal >= freeShippingThreshold ? (
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Chúc mừng! Đơn hàng của bạn đã đủ điều kiện{' '}
                <span className="font-bold underline">Miễn phí vận chuyển</span> toàn quốc.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-600">
                  Mua thêm{' '}
                  <span className="font-bold text-indigo-600">
                    {formatVND(freeShippingThreshold - subtotal)}
                  </span>{' '}
                  để được <span className="font-bold">Freeship</span>
                </p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-violet-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Danh sách items with AnimatePresence */}
          <div className="space-y-3">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={item.key}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col sm:flex-row items-center gap-4 hover:border-indigo-200 transition-all"
                >
                  {/* Ảnh */}
                  <Link
                    to={`/product/${item.id}`}
                    className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-50 p-2 shrink-0 border border-slate-100"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </Link>

                  {/* Thông tin */}
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <Link
                      to={`/product/${item.id}`}
                      className="font-semibold text-sm text-slate-900 hover:text-indigo-600 line-clamp-1 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-1 text-[11px] text-slate-500">
                      {item.variant && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full font-medium text-slate-700">
                          {item.variant}
                        </span>
                      )}
                      {item.color && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded-full font-medium text-slate-700 flex items-center gap-1">
                          {item.colorCode && (
                            <span
                              className="w-2 h-2 rounded-full inline-block border border-slate-300"
                              style={{ backgroundColor: item.colorCode }}
                            />
                          )}
                          {item.color}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-slate-900 mt-2">
                      {formatVND(item.unitPrice)}
                    </div>
                  </div>

                  {/* Bộ đếm số lượng */}
                  <div className="flex items-center border border-slate-200 rounded-full overflow-hidden bg-slate-50 shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.key, -1)}
                      className="px-3 py-1 text-slate-600 hover:bg-slate-200 transition-colors font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-slate-900 min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.key, 1)}
                      className="px-3 py-1 text-slate-600 hover:bg-slate-200 transition-colors font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Nút xóa */}
                  <button
                    onClick={() => removeFromCart(item.key)}
                    className="p-2.5 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa khỏi giỏ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* CỘT PHẢI: Tóm tắt đơn hàng (5 cột) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
              Tóm tắt đơn hàng
            </h2>

            {/* Voucher input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Mã giảm giá / Voucher AI
              </label>
              <form onSubmit={handleApplyVoucher} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="VD: AITECH10, FREESHIP"
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-full uppercase outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                  />
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  Áp dụng
                </button>
              </form>

              {/* Thông báo lỗi hoặc mã thành công */}
              {voucherError && (
                <p className="text-xs text-rose-500 mt-1.5 font-medium">{voucherError}</p>
              )}

              {appliedVoucher && (
                <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
                  <div>
                    <span className="font-bold">{appliedVoucher.code}</span>: {appliedVoucher.description}
                  </div>
                  <button
                    onClick={removeVoucher}
                    className="text-emerald-700 hover:text-rose-600 font-bold ml-2 cursor-pointer"
                  >
                    Xóa
                  </button>
                </div>
              )}

              {/* Gợi ý mã có sẵn */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-[11px] text-slate-400 self-center">Mã gợi ý:</span>
                {VOUCHERS.map((v) => (
                  <button
                    key={v.code}
                    onClick={() => applyVoucher(v.code)}
                    className="text-[10px] font-bold bg-slate-100 hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-200 px-2.5 py-0.5 rounded-full cursor-pointer transition-colors"
                  >
                    {v.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Chi tiết tính tiền */}
            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span className="font-semibold text-slate-900">{formatVND(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Giảm giá voucher</span>
                  <span>-{formatVND(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển</span>
                <span>{shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline text-base sm:text-lg font-extrabold text-slate-900">
                <span>Tổng thanh toán</span>
                <span className="text-xl sm:text-2xl text-indigo-600">{formatVND(total)}</span>
              </div>
            </div>

            {/* Nút Đặt hàng */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login', { state: { from: { pathname: '/checkout' } } });
                } else {
                  navigate('/checkout');
                }
              }}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isAuthenticated ? 'Tiến hành đặt hàng' : 'Đăng nhập để đặt hàng'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            {!isAuthenticated && (
              <p className="text-[11px] text-center text-amber-700 font-medium bg-amber-50 py-2 px-3 rounded-xl border border-amber-200">
                🔒 Vui lòng đăng nhập tài khoản để tiến hành thanh toán &amp; lưu đơn hàng.
              </p>
            )}

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Thanh toán bảo mật chuẩn mã hóa SSL 256-bit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

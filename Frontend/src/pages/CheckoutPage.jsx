import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const { cart, subtotal, discountAmount, shippingFee, total, clearCart } = useCart();
  const { user, isAuthenticated, addOrder } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    province: 'Hồ Chí Minh',
    district: 'Quận Bình Thạnh',
    address: user?.address || '',
    notes: 'Giao giờ hành chính giúp mình nhé.',
  });

  const [paymentMethod, setPaymentMethod] = useState('vietqr');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-18 h-18 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto shadow-sm"
        >
          <ShieldCheck className="w-10 h-10" />
        </motion.div>
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Yêu cầu tài khoản
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Vui lòng đăng nhập để thanh toán</h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Bạn cần đăng nhập tài khoản để lưu thông tin đơn hàng, tra cứu tiến độ vận chuyển và nhận ưu đãi tích điểm.
          </p>
        </div>
        <div className="pt-2 space-y-3">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login', { state: { from: { pathname: '/checkout' } } })}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full text-sm font-semibold transition-all shadow-md shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Đăng nhập ngay để thanh toán</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          <div className="flex items-center justify-center gap-4 text-xs">
            <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
              Chưa có tài khoản? Đăng ký
            </Link>
            <span className="text-slate-300">•</span>
            <Link to="/cart" className="text-slate-500 hover:text-slate-700">
              Quay lại Giỏ hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      id: orderId,
      date: new Date().toISOString().split('T')[0],
      items: cart,
      subtotal,
      discountAmount,
      shippingFee,
      total,
      shippingInfo: formData,
      paymentMethod:
        paymentMethod === 'vietqr'
          ? 'Chuyển khoản VietQR'
          : paymentMethod === 'cod'
          ? 'Thanh toán khi nhận hàng (COD)'
          : paymentMethod === 'momo'
          ? 'Ví điện tử MoMo'
          : 'Thẻ tín dụng / Ghi nợ',
      status: 'Chờ xác nhận',
    };

    addOrder(newOrder);
    setCreatedOrderId(orderId);
    clearCart();
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-20 h-20 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-3xl flex items-center justify-center mx-auto shadow-sm"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Đặt hàng thành công!
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Cảm ơn bạn đã mua hàng tại Alibaba-Store
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Mã đơn hàng của bạn là <span className="font-bold text-slate-900">#{createdOrderId}</span>.
            Thông tin chi tiết đã được gửi tới email <span className="font-medium text-slate-900">{formData.email}</span>.
          </p>
        </div>

        {paymentMethod === 'vietqr' && (
          <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-3xl max-w-sm mx-auto space-y-4 text-center">
            <p className="text-xs font-semibold text-slate-700">Quét mã VietQR để hoàn tất thanh toán</p>
            <div className="p-3 bg-white rounded-2xl border border-slate-200 inline-block shadow-xs">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=ALIBABA-${createdOrderId}-${total}`}
                alt="VietQR"
                className="w-44 h-44 object-contain"
              />
            </div>
            <div className="text-[11px] text-slate-500 space-y-0.5">
              <p>Ngân hàng: <span className="font-bold text-slate-800">MB Bank</span></p>
              <p>Số TK: <span className="font-bold text-slate-800">09012345688</span></p>
              <p>Số tiền: <span className="font-bold text-indigo-600">{formatVND(total)}</span></p>
              <p>Nội dung: <span className="font-bold text-slate-800">{createdOrderId}</span></p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/profile"
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-full text-sm font-semibold transition-all shadow-md"
          >
            Quản lý đơn hàng
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full text-sm font-semibold transition-all"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Không có sản phẩm nào để thanh toán</h2>
        <p className="text-xs sm:text-sm text-slate-500">Giỏ hàng của bạn đang trống.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full text-sm font-semibold shadow-md"
        >
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Thanh toán đơn hàng</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Vui lòng kiểm tra lại thông tin nhận hàng và phương thức thanh toán.
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* CỘT TRÁI: Form Địa chỉ & Phương thức thanh toán (7 cột) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Thông tin người nhận */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              1. Địa chỉ giao hàng
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên người nhận *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại liên hệ *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ email nhận hóa đơn *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tỉnh / Thành phố *
                </label>
                <input
                  type="text"
                  name="province"
                  required
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quận / Huyện *
                </label>
                <input
                  type="text"
                  name="district"
                  required
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ chi tiết (Số nhà, tên đường) *
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú cho shipper (Tùy chọn)
              </label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="VD: Giao trước 17h, gọi điện trước khi tới..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
              />
            </div>
          </div>

          {/* Phương thức thanh toán */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              2. Phương thức thanh toán
            </h2>

            <div className="space-y-3">
              {/* VietQR */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === 'vietqr'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="vietqr"
                    checked={paymentMethod === 'vietqr'}
                    onChange={() => setPaymentMethod('vietqr')}
                    className="text-indigo-600"
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      Chuyển khoản VietQR tức thì
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Khuyên dùng
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Tự động quét QR qua app ngân hàng, xác nhận ngay trong 3 giây
                    </p>
                  </div>
                </div>
                <QrCode className="w-6 h-6 text-indigo-600" />
              </label>

              {/* COD */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === 'cod'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-indigo-600"
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      Thanh toán khi nhận hàng (COD)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Kiểm tra sản phẩm đồng kiểm rồi mới thanh toán tiền mặt cho shipper
                    </p>
                  </div>
                </div>
                <Banknote className="w-6 h-6 text-slate-600" />
              </label>

              {/* MoMo */}
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  paymentMethod === 'momo'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="momo"
                    checked={paymentMethod === 'momo'}
                    onChange={() => setPaymentMethod('momo')}
                    className="text-indigo-600"
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">
                      Ví MoMo / ZaloPay
                    </p>
                    <p className="text-[11px] text-slate-500">Thanh toán qua ví điện tử liên kết</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-pink-600">MoMo</span>
              </label>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Tóm tắt đơn hàng (5 cột) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-sm space-y-6 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Đơn hàng của bạn</span>
              <span className="text-xs font-semibold text-slate-500">{cart.length} món</span>
            </h2>

            {/* List sản phẩm tóm tắt */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.key} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-contain bg-slate-50 p-1 border border-slate-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400">
                      SL: {item.quantity} {item.variant ? `• ${item.variant}` : ''}
                    </p>
                  </div>
                  <div className="font-bold text-slate-800">
                    {formatVND(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Bảng giá */}
            <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span className="font-semibold text-slate-900">{formatVND(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Giảm giá</span>
                  <span>-{formatVND(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Phí vận chuyển</span>
                <span>{shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline text-base sm:text-lg font-extrabold text-slate-900">
                <span>Tổng cộng</span>
                <span className="text-xl sm:text-2xl text-indigo-600">{formatVND(total)}</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Xác nhận đặt hàng</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Bảo vệ quyền lợi người mua &amp; Bảo hành chính hãng</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

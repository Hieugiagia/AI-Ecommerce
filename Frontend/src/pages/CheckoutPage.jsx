import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import SavedAddressPicker from '../components/SavedAddressPicker';
import LocationFields from '../components/LocationFields';
import { shippingFromAddress } from '../services/addressModel';
import { checkoutPayload, checkoutRejected } from '../services/checkoutModel';
import PaymentMethods from '../components/PaymentMethods';

export default function CheckoutPage() {
  const {
    cart, subtotal, shippingFee, total, cartLoading, cartBusy, cartError, canCheckout,
    reloadCart, pendingCheckout, beginCheckout, finishCheckout,
  } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => pendingCheckout?.shippingInfo || ({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    province: '',
    district: '',
    address: user?.address || '',
    notes: '',
  }));
  const [legacyLocation, setLegacyLocation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [receipt, setReceipt] = useState(null);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const submitting = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

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

  const formatVND = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const handleChange = (event) => setFormData({ ...formData, [event.target.name]: event.target.value });

  async function submitCheckout(payload) {
    if (submitting.current) return;
    submitting.current = true;
    setPlacingOrder(true);
    setOrderError('');
    try {
      const confirmed = await orderService.checkout(payload);
      if (!mounted.current) return;
      setReceipt(confirmed);
      finishCheckout();
      // The backend has already cleared the cart transactionally.
      // Only GET it again; a separate DELETE could remove newly added items.
      await reloadCart();
    } catch (error) {
      if (!mounted.current) return;
      if (checkoutRejected(error)) {
        finishCheckout();
        setOrderError(error.message || 'Máy chủ từ chối đơn hàng. Vui lòng kiểm tra lại.');
        await reloadCart();
      } else {
        setOrderError('Chưa nhận được kết quả chắc chắn. Hãy kiểm tra lại bên dưới để tránh đặt trùng đơn. ' + (error.message || ''));
      }
    } finally {
      submitting.current = false;
      if (mounted.current) setPlacingOrder(false);
    }
  }

  function handlePlaceOrder(event) {
    event.preventDefault();
    if (submitting.current || !canCheckout) return;
    try {
      const payload = checkoutPayload(crypto.randomUUID(), total, formData, paymentMethod);
      const attempt = beginCheckout(payload);
      if (!attempt.success) { setOrderError(attempt.error); return; }
      void submitCheckout(attempt.payload);
    } catch (error) {
      setOrderError(error.message);
    }
  }

  if (receipt) {
    return <section className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <CheckCircle2 className="w-14 h-14 text-emerald-600" />
      <h1 className="text-2xl font-bold">Đặt hàng thành công</h1>
      <p>Mã đơn hàng: <strong className="break-all">{receipt.orderCode}</strong></p>
      <p className="text-sm text-slate-600">{receipt.paymentMethod === 'MOMO' ? 'Đơn đã được tạo và đang chờ thanh toán MoMo.' : 'Đơn đã được ghi nhận. Bạn thanh toán khi nhận hàng (COD).'}</p>
      {receipt.paymentMethod === 'MOMO' && <Link to={'/payments/momo?orderCode=' + encodeURIComponent(receipt.orderCode)} className="inline-block rounded-xl bg-orange-700 px-5 py-3 font-semibold text-white">Tiếp tục thanh toán MoMo</Link>}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
        {receipt.items.map((item) => <div key={item.productId} className="flex justify-between gap-4 text-sm"><span>{item.productName} × {item.quantity}</span><strong>{formatVND(item.subtotal)}</strong></div>)}
        <div className="flex justify-between border-t pt-4"><span>Tiền hàng</span><span>{formatVND(receipt.subtotal)}</span></div>
        <div className="flex justify-between"><span>Phí giao hàng</span><span>{formatVND(receipt.shippingFee)}</span></div>
        <div className="flex justify-between font-bold text-lg"><span>Tổng thanh toán</span><span>{formatVND(receipt.total)}</span></div>
      </div>
      {cartError && <p role="alert" className="text-sm text-amber-800">Đơn đã tạo thành công nhưng chưa tải lại được giỏ hàng. Bạn có thể mở giỏ và tải lại; không cần đặt lại đơn.</p>}
      <div className="flex flex-wrap gap-4"><Link className="text-indigo-600 underline" to={`/orders?orderCode=${encodeURIComponent(receipt.orderCode)}`}>Xem đơn hàng</Link><Link className="text-indigo-600 underline" to="/products">Tiếp tục mua sắm</Link><Link className="text-indigo-600 underline" to="/">Về trang chủ</Link></div>
    </section>;
  }

  if (pendingCheckout) {
    return <section className="max-w-xl mx-auto px-4 py-12 space-y-5">
      <h1 className="text-2xl font-bold">Kiểm tra kết quả đặt hàng</h1>
      <p>Yêu cầu trước đang chờ xác nhận kết quả. Dùng nút bên dưới để nhận kết quả của cùng lần đặt hàng.</p>
      <p className="text-sm text-slate-600">Người nhận: {pendingCheckout.shippingInfo.fullName} · {pendingCheckout.shippingInfo.phone}</p>
      <p className="font-semibold">Tổng tiền đã xác nhận: {formatVND(pendingCheckout.expectedTotal)}</p>
      {orderError && <p role="alert" className="text-rose-700">{orderError}</p>}
      <button disabled={placingOrder} onClick={() => submitCheckout(pendingCheckout)} className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-50">{placingOrder ? 'Đang xác nhận...' : 'Kiểm tra và nhận kết quả'}</button>
      <p className="text-xs text-slate-500">Thông tin của lần đặt này được giữ trong tab trình duyệt. Giỏ tạm khóa chỉnh sửa cho đến khi có kết quả.</p>
    </section>;
  }

  if (cartLoading) return <p role="status" className="p-12 text-center">Đang tải giỏ hàng...</p>;
  if (cartError) return <div role="alert" className="p-12 text-center"><p>{cartError}</p><Link to="/cart" className="text-indigo-600 underline">Quay lại giỏ hàng để tải lại</Link></div>;

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

      {orderError && <p role="alert" className="mb-4 text-rose-700">{orderError}</p>}
      {!canCheckout && <p className="mb-4 text-amber-700">Giỏ hàng có sản phẩm không khả dụng hoặc đang cập nhật. Vui lòng kiểm tra lại.</p>}
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <fieldset disabled={placingOrder} className="contents">
        {/* CỘT TRÁI: Form Địa chỉ & Phương thức thanh toán (7 cột) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Thông tin người nhận */}
          <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              1. Địa chỉ giao hàng
            </h2>
            <SavedAddressPicker key={user.id} onSelect={row => { setFormData(previous => shippingFromAddress(row, previous)); setLegacyLocation(row.district !== row.ward ? row : null); }}/>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên người nhận *
                </label>
                <input
                  type="text"
                  name="fullName"
                  maxLength={100}
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
                  pattern="[+]?[0-9]{8,15}"
                  maxLength={16}
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            {legacyLocation ? <div className="location-legacy"><p>Địa chỉ đã lưu: {legacyLocation.ward}, {legacyLocation.district}, {legacyLocation.city}</p><button type="button" onClick={()=>{setFormData(previous=>({...previous,province:'',district:'',address:legacyLocation.streetAddress}));setLegacyLocation(null);}}>Chọn tỉnh/phường mới</button></div> : <LocationFields province={formData.province} ward={formData.district} disabled={placingOrder} onChange={({province,ward})=>setFormData(previous=>({...previous,province,district:ward}))}/>}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ chi tiết (Số nhà, tên đường) *
              </label>
              <input
                type="text"
                name="address"
                maxLength={500}
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
                maxLength={500}
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

            <PaymentMethods value={paymentMethod} onChange={setPaymentMethod} />
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
              disabled={placingOrder || cartBusy || !canCheckout}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{placingOrder ? 'Đang đặt hàng...' : 'Xác nhận đặt hàng'}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Bảo vệ quyền lợi người mua &amp; Bảo hành chính hãng</span>
            </div>
          </div>
        </div>
        </fieldset>
      </form>
    </div>
  );
}

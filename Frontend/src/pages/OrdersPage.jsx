import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  MapPin,
  Check,
  X,
  AlertCircle,
  Eye,
  Ban,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [activeFilter, setActiveFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Đổi ý / Không còn nhu cầu');
  const [actionLoading, setActionLoading] = useState(false);

  // Lấy danh sách đơn hàng thực tế qua GET /orders/my-orders
  useEffect(() => {
    async function loadOrders() {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const res = await orderService.getMyOrders();
        const serverOrders = Array.isArray(res) ? res : res?.orders || [];
        if (serverOrders.length > 0) {
          setOrders(serverOrders);
        } else if (user?.orders && user.orders.length > 0) {
          setOrders(user.orders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách đơn hàng:', err);
        setOrders(user?.orders || []);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [isAuthenticated, user]);

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Xem chi tiết đơn hàng GET /orders/{orderCode}
  const handleViewDetail = async (order) => {
    const code = order.orderCode || order.id;
    try {
      const res = await orderService.getOrderByCode(code);
      setSelectedOrder(res?.order || res || order);
    } catch {
      setSelectedOrder(order);
    }
  };

  // Hủy đơn hàng POST /orders/{orderCode}/cancel
  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    const code = cancellingOrder.orderCode || cancellingOrder.id;
    setActionLoading(true);
    try {
      await orderService.cancelOrder(code, cancelReason);
      setOrders((prev) =>
        prev.map((o) =>
          (o.orderCode || o.id) === code ? { ...o, status: 'Đã hủy' } : o
        )
      );
      setCancellingOrder(null);
    } catch (err) {
      alert(err.message || 'Không thể hủy đơn hàng.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-16 h-16 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto shadow-sm"
        >
          <Package className="w-8 h-8" />
        </motion.div>
        <h2 className="text-xl font-bold text-slate-900">Vui lòng đăng nhập để xem đơn hàng</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Đăng nhập giúp bạn tra cứu hành trình vận chuyển và lịch sử mua sắm chi tiết.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full text-sm font-semibold transition-all shadow-md shadow-indigo-500/25"
        >
          <span>Đăng nhập ngay</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'completed') return o.status === 'Đã giao hàng' || o.status === 'Đã hoàn thành';
    if (activeFilter === 'shipping') return o.status === 'Đang giao hàng' || o.status === 'Đang xử lý';
    if (activeFilter === 'pending') return o.status === 'Chờ xác nhận';
    if (activeFilter === 'cancelled') return o.status === 'Đã hủy';
    return true;
  });

  // Timeline step helper
  const getTimelineStep = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('giao hàng') && !s.includes('đang')) return 4; // Delivered
    if (s.includes('đang giao')) return 3; // Shipping
    if (s.includes('đang xử lý') || s.includes('chuẩn bị')) return 2; // Processing
    return 1; // Pending
  };

  const timelineSteps = [
    { title: 'Chờ xác nhận', desc: 'Đã nhận đơn' },
    { title: 'Đang chuẩn bị', desc: 'Kiểm tra & đóng gói' },
    { title: 'Đang giao hàng', desc: 'Shipper đang giao' },
    { title: 'Giao thành công', desc: 'Hoàn tất đơn hàng' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lịch sử đơn hàng của bạn
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi hành trình vận chuyển theo thời gian thực và quản lý đơn hàng
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: `Tất cả (${orders.length})` },
            { id: 'shipping', label: 'Đang giao' },
            { id: 'completed', label: 'Đã giao' },
            { id: 'pending', label: 'Chờ xử lý' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                activeFilter === tab.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 sm:p-16 bg-white border border-slate-200/80 rounded-3xl text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto border border-indigo-100">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Không có đơn hàng nào trong mục này</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Bạn chưa đặt đơn hàng nào hoặc các đơn đã được lọc. Khám phá các siêu phẩm công nghệ AI ngay!
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-500/25"
            >
              <span>Dạo cửa hàng ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const currentStep = getTimelineStep(order.status);
            const isDelivered = currentStep === 4;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden transition-all hover:border-indigo-200"
              >
                {/* Header đơn */}
                <div className="p-5 sm:p-6 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">
                      Mã đơn: #{order.id}
                    </span>
                    <span className="text-xs text-slate-400">Ngày đặt: {order.date}</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      isDelivered
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : currentStep === 3
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isDelivered && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {currentStep === 3 && <Truck className="w-3.5 h-3.5" />}
                    {currentStep < 3 && <Clock className="w-3.5 h-3.5" />}
                    {order.status}
                  </span>
                </div>

                {/* VISUAL TIMELINE: PENDING -> DELIVERED */}
                <div className="p-5 sm:p-6 bg-slate-50/40 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-indigo-600" />
                    Tiến độ đơn hàng
                  </p>
                  <div className="relative flex items-center justify-between">
                    {/* Connecting background line */}
                    <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0" />
                    {/* Active progress line */}
                    <div
                      className="absolute top-4 left-6 h-1 bg-gradient-to-r from-indigo-500 to-violet-600 -z-0 transition-all duration-500"
                      style={{
                        width: `${((currentStep - 1) / (timelineSteps.length - 1)) * 100}%`,
                      }}
                    />

                    {timelineSteps.map((step, idx) => {
                      const stepNum = idx + 1;
                      const isPassed = stepNum <= currentStep;
                      const isCurrent = stepNum === currentStep;

                      return (
                        <div key={idx} className="flex flex-col items-center relative z-10 text-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                              isPassed
                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/30'
                                : 'bg-white border-2 border-slate-300 text-slate-400'
                            }`}
                          >
                            {isPassed ? <Check className="w-4 h-4" /> : stepNum}
                          </div>
                          <span
                            className={`text-xs font-bold mt-2 ${
                              isCurrent ? 'text-indigo-600' : isPassed ? 'text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {step.title}
                          </span>
                          <span className="text-[10px] text-slate-400 hidden sm:inline">
                            {step.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Danh sách sản phẩm trong đơn */}
                <div className="p-5 sm:p-6 space-y-4">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-2xl object-contain bg-slate-50 p-2 border border-slate-100 shrink-0"
                        />
                        <div>
                          <h4 className="font-semibold text-sm text-slate-900">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            {item.variant && (
                              <span className="bg-slate-100 px-2 py-0.5 rounded-full font-medium text-slate-700">
                                {item.variant}
                              </span>
                            )}
                            <span>Số lượng: {item.quantity}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-sm font-bold text-slate-900">
                          {formatVND(item.unitPrice ? item.unitPrice * item.quantity : item.price * (item.quantity || 1))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer thông tin đơn & Actions */}
                <div className="p-5 sm:p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p>
                      Thanh toán: <span className="font-semibold text-slate-800">{order.paymentMethod}</span>
                    </p>
                    <p>
                      Tổng thanh toán:{' '}
                      <span className="text-base font-extrabold text-indigo-600">
                        {formatVND(order.total)}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleViewDetail(order)}
                      className="flex-1 sm:flex-none px-3.5 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Chi tiết</span>
                    </button>

                    {order.status === 'Chờ xác nhận' && (
                      <button
                        onClick={() => setCancellingOrder(order)}
                        className="flex-1 sm:flex-none px-3.5 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Hủy đơn</span>
                      </button>
                    )}

                    <Link
                      to="/"
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-full text-xs font-semibold transition-all shadow-xs text-center"
                    >
                      Mua lại
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal Chi tiết đơn hàng (GET /orders/{orderCode}) */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    Chi tiết đơn #{selectedOrder.orderCode || selectedOrder.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Trạng thái: <span className="font-bold text-indigo-600">{selectedOrder.status}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Danh sách món */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sản phẩm</p>
                {(selectedOrder.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 text-xs">
                    <div className="flex items-center gap-3">
                      <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-100 p-1" />
                      <div>
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <p className="text-slate-400">SL: {item.quantity} {item.variant ? `• ${item.variant}` : ''}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">{formatVND(item.unitPrice || item.price || 0)}</span>
                  </div>
                ))}
              </div>

              {/* Thông tin giao hàng */}
              <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-1 text-slate-600">
                <p><span className="font-semibold text-slate-800">Người nhận:</span> {selectedOrder.customerName || selectedOrder.fullName || user.fullName}</p>
                <p><span className="font-semibold text-slate-800">Số điện thoại:</span> {selectedOrder.phone || user.phone || 'Chưa cung cấp'}</p>
                <p><span className="font-semibold text-slate-800">Địa chỉ:</span> {selectedOrder.shippingAddress || selectedOrder.address || 'Tại cửa hàng'}</p>
                <p><span className="font-semibold text-slate-800">Thanh toán:</span> {selectedOrder.paymentMethod || 'COD'}</p>
                <p className="pt-2 text-sm font-bold text-slate-900">
                  Tổng tiền: <span className="text-indigo-600">{formatVND(selectedOrder.total || selectedOrder.totalAmount || 0)}</span>
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-full text-xs font-semibold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Hủy đơn hàng (POST /orders/{orderCode}/cancel) */}
      <AnimatePresence>
        {cancellingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <AlertCircle className="w-6 h-6" />
                <h3 className="font-bold text-slate-900 text-base">
                  Xác nhận hủy đơn #{cancellingOrder.orderCode || cancellingOrder.id}?
                </h3>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Đơn hàng sau khi hủy sẽ không thể khôi phục. Vui lòng chọn lý do hủy:
              </p>

              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl p-3 outline-none focus:border-rose-500"
              >
                <option value="Đổi ý / Không còn nhu cầu">Đổi ý / Không còn nhu cầu</option>
                <option value="Tìm thấy giá rẻ hơn ở nơi khác">Tìm thấy giá rẻ hơn ở nơi khác</option>
                <option value="Muốn thay đổi địa chỉ nhận hàng">Muốn thay đổi địa chỉ nhận hàng</option>
                <option value="Muốn đặt lại sản phẩm khác">Muốn đặt lại sản phẩm khác</option>
              </select>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-full text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Không, giữ lại đơn
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleConfirmCancel}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-xs font-semibold shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {actionLoading ? 'Đang xử lý...' : 'Xác nhận hủy'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

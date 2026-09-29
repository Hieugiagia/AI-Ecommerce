import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [activeFilter, setActiveFilter] = useState('all');

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
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

  const orders = user.orders || [];

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'completed') return o.status === 'Đã giao hàng' || o.status === 'Đã hoàn thành';
    if (activeFilter === 'shipping') return o.status === 'Đang giao hàng' || o.status === 'Đang xử lý';
    if (activeFilter === 'pending') return o.status === 'Chờ xác nhận';
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
                      onClick={() => alert(`Đang kết nối với CSKH & Trợ lý AI cho đơn #${order.id}`)}
                      className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Hỗ trợ đơn hàng
                    </button>
                    <Link
                      to="/"
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-full text-xs font-semibold transition-all shadow-xs text-center"
                    >
                      Mua sắm tiếp
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  ShoppingBag,
  ArrowRight,
  ExternalLink,
  Sparkles,
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
        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Vui lòng đăng nhập để xem đơn hàng</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Đăng nhập giúp bạn tra cứu hành trình vận chuyển và lịch sử mua sắm chi tiết.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lịch sử đơn hàng của bạn
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Theo dõi hành trình vận chuyển, kiểm tra hóa đơn và mua lại sản phẩm yêu thích
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 sm:p-16 bg-white border border-slate-200/80 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Không có đơn hàng nào trong mục này</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            Bạn chưa đặt đơn hàng nào hoặc các đơn đã được lọc. Khám phá các siêu phẩm công nghệ ngay!
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md"
            >
              <span>Dạo cửa hàng ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isDelivered = order.status === 'Đã giao hàng' || order.status === 'Đã hoàn thành';
            const isShipping = order.status === 'Đang giao hàng';

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden transition-all hover:border-slate-300"
              >
                {/* Header đơn */}
                <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-slate-900">
                      Mã đơn: #{order.id}
                    </span>
                    <span className="text-xs text-slate-400">Ngày đặt: {order.date}</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      isDelivered
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isShipping
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isDelivered && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {isShipping && <Truck className="w-3.5 h-3.5" />}
                    {!isDelivered && !isShipping && <Clock className="w-3.5 h-3.5" />}
                    {order.status}
                  </span>
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
                          className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shrink-0"
                        />
                        <div>
                          <h4 className="font-semibold text-sm text-slate-900">{item.name}</h4>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            {item.variant && (
                              <span className="bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
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
                      onClick={() => alert(`Đang liên hệ với bộ phận CSKH & AI Support cho đơn #${order.id}`)}
                      className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Hỗ trợ đơn hàng
                    </button>
                    <Link
                      to="/"
                      className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-all shadow-xs text-center"
                    >
                      Mua sắm tiếp
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

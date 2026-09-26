import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Package,
  MapPin,
  Phone,
  Mail,
  LogOut,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'info'
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
  });
  const [isSaved, setIsSaved] = useState(false);

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Vui lòng đăng nhập</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Đăng nhập tài khoản để theo dõi lịch sử đơn hàng và cập nhật địa chỉ giao hàng.
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

  const handleSaveInfo = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const orders = user.orders || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Profile Card Header */}
      <div className="p-6 sm:p-8 bg-white border border-slate-200/80 rounded-3xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={
              user.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
            alt={user.fullName}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-sm"
          />
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user.fullName}</h1>
              {user.role === 'admin' ? (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  🛡️ Quản trị viên
                </span>
              ) : (
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Thành viên VIP
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{user.email}</p>
            <p className="text-xs text-slate-400">
              {user.role === 'admin'
                ? 'Đang có toàn quyền quản lý cửa hàng và phân tích doanh thu'
                : 'Đã tích lũy 1.250 điểm NextClub'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {user.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Vào Trang Quản trị (Admin)</span>
            </Link>
          )}

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Lịch sử đơn hàng ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 pb-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'info'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Thông tin tài khoản</span>
        </button>
      </div>

      {/* Tab 1: Đơn hàng */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200/80 rounded-3xl text-center space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Bạn chưa có đơn hàng nào</h3>
              <p className="text-xs text-slate-500">
                Hãy lựa chọn những thiết bị công nghệ đỉnh cao ngay hôm nay!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Khám phá sản phẩm
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-4"
              >
                {/* Header đơn */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-extrabold text-slate-900">
                      Mã: #{order.id}
                    </span>
                    <span className="text-xs text-slate-400">Ngày đặt: {order.date}</span>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                      order.status === 'Đã giao hàng'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {order.status === 'Đã giao hàng' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Clock className="w-3.5 h-3.5" />
                    )}
                    {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          SL: {item.quantity} {item.variant ? `• ${item.variant}` : ''}
                        </p>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        {formatVND(item.unitPrice ? item.unitPrice * item.quantity : item.price)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tổng thanh toán & Phương thức */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
                  <p>
                    Thanh toán: <span className="font-semibold text-slate-800">{order.paymentMethod}</span>
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    Tổng tiền: <span className="text-indigo-600">{formatVND(order.total)}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Cập nhật thông tin */}
      {activeTab === 'info' && (
        <form
          onSubmit={handleSaveInfo}
          className="p-6 sm:p-8 bg-white border border-slate-200/80 rounded-3xl shadow-xs max-w-2xl space-y-4"
        >
          <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
            Thông tin cá nhân & Địa chỉ nhận hàng
          </h2>

          {isSaved && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
              Đã cập nhật thông tin thành công!
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
            <input
              type="text"
              value={profileData.fullName}
              onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                disabled
                value={profileData.email}
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Địa chỉ nhận hàng mặc định
            </label>
            <textarea
              rows={3}
              value={profileData.address}
              onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
          >
            Lưu thay đổi
          </button>
        </form>
      )}
    </div>
  );
}

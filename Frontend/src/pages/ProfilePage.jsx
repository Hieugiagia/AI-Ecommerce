import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Check,
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
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto text-indigo-600 shadow-sm"
        >
          <User className="w-8 h-8" />
        </motion.div>
        <h2 className="text-xl font-bold text-slate-900">Vui lòng đăng nhập</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Đăng nhập tài khoản để theo dõi lịch sử đơn hàng và cập nhật địa chỉ giao hàng.
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

  const handleSaveInfo = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const orders = user.orders || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Profile Card Header with Ambient Tech Glow */}
      <div className="p-6 sm:p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/70 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10" />

        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left relative z-10">
          <img
            src={
              user.avatar ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
            }
            alt={user.fullName}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/20 shadow-md"
          />
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user.fullName}</h1>
              {user.role === 'admin' ? (
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  🛡️ Quản trị viên
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-violet-500" /> AI Member
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">{user.email}</p>
            <p className="text-xs text-slate-400">
              {user.role === 'admin'
                ? 'Toàn quyền quản trị hệ thống và cấu hình sản phẩm'
                : 'Đã tích lũy 1.250 điểm thành viên Alibaba Club'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto relative z-10">
          {user.role === 'admin' && (
            <Link
              to="/admin/dashboard"
              className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Bảng Quản Trị</span>
            </Link>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-full text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </motion.button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Đơn hàng của tôi ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'info'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Thông tin tài khoản</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 bg-white border border-slate-200/80 rounded-3xl text-center space-y-4 shadow-sm">
              <p className="text-sm text-slate-500">Bạn chưa có đơn hàng nào.</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full text-xs font-semibold shadow-md"
              >
                <span>Khám phá sản phẩm</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="p-5 sm:p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Mã đơn: #{o.id}</span>
                    <span className="text-xs text-slate-400">• {o.date}</span>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {o.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Tổng tiền:{' '}
                  <strong className="text-indigo-600 font-extrabold text-sm">
                    {formatVND(o.total)}
                  </strong>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'info' && (
        <div className="p-6 sm:p-8 bg-white border border-slate-200/80 rounded-3xl shadow-sm max-w-2xl space-y-6">
          <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">
            Cập nhật thông tin cá nhân
          </h2>

          <form onSubmit={handleSaveInfo} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm px-4 py-2.5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                disabled
                value={profileData.email}
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 text-xs sm:text-sm px-4 py-2.5 rounded-2xl cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm px-4 py-2.5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ giao hàng mặc định</label>
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm px-4 py-2.5 rounded-2xl outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {isSaved ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Đã lưu thông tin thành công!
                </span>
              ) : <div />}

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full text-xs font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
              >
                Lưu thay đổi
              </motion.button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

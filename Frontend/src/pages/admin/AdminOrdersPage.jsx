import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Eye,
  X,
  ShoppingBag,
  Users,
  Crown,
  Mail,
  Phone,
  Calendar,
  Sparkles,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([
    {
      id: 'ORD-98421',
      customer: 'Trần Minh Hoàng',
      email: 'hoang.tran@gmail.com',
      phone: '0912345678',
      address: 'Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      product: 'MacBook Pro 16 M3 Max',
      itemsCount: 1,
      total: 68990000,
      payment: 'VietQR (Đã thanh toán)',
      status: 'Đã hoàn thành',
      date: '2026-09-26 18:30',
      items: [
        {
          name: 'MacBook Pro 16 M3 Max',
          variant: '36GB / 1TB',
          price: 68990000,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      id: 'ORD-98420',
      customer: 'Nguyễn Thị Bích Ngọc',
      email: 'bichngoc.design@gmail.com',
      phone: '0987654321',
      address: 'Toà Keangnam Landmark 72, Nam Từ Liêm, Hà Nội',
      product: 'iPhone 15 Pro Max 256GB',
      itemsCount: 1,
      total: 29490000,
      payment: 'VietQR (Đã thanh toán)',
      status: 'Đang giao hàng',
      date: '2026-09-26 17:15',
      items: [
        {
          name: 'iPhone 15 Pro Max 256GB',
          variant: 'Titan Tự Nhiên',
          price: 29490000,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      id: 'ORD-98419',
      customer: 'Lê Tuấn Anh',
      email: 'tuananh.dev@yahoo.com',
      phone: '0903334455',
      address: '124 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh',
      product: 'Tai nghe Sony WH-1000XM5',
      itemsCount: 1,
      total: 6990000,
      payment: 'COD (Chưa thanh toán)',
      status: 'Chờ xác nhận',
      date: '2026-09-26 16:40',
      items: [
        {
          name: 'Tai nghe Sony WH-1000XM5 Chống ồn',
          variant: 'Đen nhám',
          price: 6990000,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      id: 'ORD-98418',
      customer: 'Phạm Đức Dũng',
      email: 'dung.pham@gmail.com',
      phone: '0934567890',
      address: '228 Lê Duẩn, TP. Đà Nẵng',
      product: 'Rabbit R1 + Keychron Q1 Pro',
      itemsCount: 2,
      total: 9850000,
      payment: 'MoMo (Đã thanh toán)',
      status: 'Đã hoàn thành',
      date: '2026-09-26 14:10',
      items: [
        {
          name: 'Rabbit R1 Trợ lý AI',
          variant: 'Cam Luminous',
          price: 5200000,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&auto=format&fit=crop&q=80',
        },
        {
          name: 'Bàn phím cơ Keychron Q1 Pro',
          variant: 'Red Switch',
          price: 4650000,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&auto=format&fit=crop&q=80',
        },
      ],
    },
    {
      id: 'ORD-98417',
      customer: 'Vũ Hải Yến',
      email: 'haiyen.vu@outlook.com',
      phone: '0966778899',
      address: 'Thảo Điền, Thành phố Thủ Đức, TP. Hồ Chí Minh',
      product: 'Galaxy S24 Ultra 256GB',
      itemsCount: 1,
      total: 27990000,
      payment: 'Visa Card (Đã thanh toán)',
      status: 'Đang xử lý',
      date: '2026-09-26 11:20',
      items: [
        {
          name: 'Galaxy S24 Ultra 256GB Galaxy AI',
          variant: 'Xám Titan',
          price: 27990000,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=200&auto=format&fit=crop&q=80',
        },
      ],
    },
  ]);

  const [searchParams, setSearchParams] = useSearchParams();
  const isCustomersTab = searchParams.get('tab') === 'customers';

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingOrder, setViewingOrder] = useState(null);

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleStatusChange = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (
      searchQuery.trim() &&
      !o.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !o.customer.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !o.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const customersList = [
    {
      id: 1,
      name: 'Trần Minh Hoàng',
      email: 'hoang.tran@gmail.com',
      phone: '0912345678',
      tier: 'VIP Platinum',
      tierColor: 'bg-purple-50 text-purple-700 border-purple-200',
      totalSpent: 68990000,
      points: 6890,
      ordersCount: 3,
      joinDate: '15/01/2026',
    },
    {
      id: 2,
      name: 'Nguyễn Thị Bích Ngọc',
      email: 'bichngoc.design@gmail.com',
      phone: '0987654321',
      tier: 'VIP Gold',
      tierColor: 'bg-amber-50 text-amber-700 border-amber-200',
      totalSpent: 29490000,
      points: 2940,
      ordersCount: 2,
      joinDate: '02/02/2026',
    },
    {
      id: 3,
      name: 'Lê Văn Dũng',
      email: 'dung.le@techcorp.vn',
      phone: '0903112233',
      tier: 'VIP Silver',
      tierColor: 'bg-blue-50 text-blue-700 border-blue-200',
      totalSpent: 7990000,
      points: 790,
      ordersCount: 1,
      joinDate: '10/03/2026',
    },
    {
      id: 4,
      name: 'Phạm Thuỳ Trang',
      email: 'thuytrang.pham@gmail.com',
      phone: '0934567890',
      tier: 'Thành viên',
      tierColor: 'bg-slate-100 text-slate-700 border-slate-200',
      totalSpent: 2490000,
      points: 240,
      ordersCount: 1,
      joinDate: '20/03/2026',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isCustomersTab ? 'Quản lý Khách hàng & Hội viên NextClub' : 'Quản lý Đơn hàng'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isCustomersTab
              ? 'Hồ sơ khách hàng, phân hạng thành viên, tích lũy điểm thưởng NextClub 1%'
              : 'Theo dõi tiến độ đơn, chuyển trạng thái xử lý và điều phối giao vận'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200/60">
          <button
            onClick={() => setSearchParams({})}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isCustomersTab
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đơn hàng ({orders.length})
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'customers' })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isCustomersTab
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Hội viên NextClub</span>
          </button>
        </div>
      </div>

      {isCustomersTab ? (
        /* ================= BẢNG HỘI VIÊN & KHÁCH HÀNG ================= */
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-sm font-bold text-slate-900">
              Danh sách hội viên ({customersList.length} khách hàng VIP)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Chính sách:</span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/60">
                Tích luỹ 1% điểm cho mọi đơn hàng
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-slate-50/75 text-slate-400 font-bold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Khách hàng</th>
                  <th className="py-3.5 px-6">Hạng thành viên</th>
                  <th className="py-3.5 px-6">Tổng chi tiêu</th>
                  <th className="py-3.5 px-6">Điểm tích luỹ</th>
                  <th className="py-3.5 px-6">Số đơn</th>
                  <th className="py-3.5 px-6">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customersList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{c.email}</span>
                        <span>•</span>
                        <span>{c.phone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${c.tierColor}`}>
                        {c.tier}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-slate-900">
                      {formatVND(c.totalSpent)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        ⭐ {c.points.toLocaleString('vi-VN')} điểm
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {c.ordersCount} đơn
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs font-medium">
                      {c.joinDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ================= BẢNG ĐƠN HÀNG THƯỜNG ================= */
        <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo mã đơn, tên khách, email..."
                className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-2xl outline-none focus:border-indigo-600 focus:bg-white text-slate-800 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Filter Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'Chờ xác nhận', label: 'Chờ xác nhận' },
                { id: 'Đang xử lý', label: 'Đang xử lý' },
                { id: 'Đang giao hàng', label: 'Đang giao' },
                { id: 'Đã hoàn thành', label: 'Hoàn thành' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-3">Mã đơn</th>
                  <th className="py-3.5 px-3">Khách hàng</th>
                  <th className="py-3.5 px-3">Sản phẩm</th>
                  <th className="py-3.5 px-3">Số tiền</th>
                  <th className="py-3.5 px-3">Phương thức</th>
                  <th className="py-3.5 px-3">Trạng thái hiện tại</th>
                  <th className="py-3.5 px-3 text-right">Đổi trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-3">
                      <span className="font-bold text-slate-900">{ord.id}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{ord.date}</p>
                    </td>
                    <td className="py-4 px-3">
                      <p className="font-semibold text-slate-900">{ord.customer}</p>
                      <p className="text-[11px] text-slate-400">{ord.phone}</p>
                    </td>
                    <td className="py-4 px-3">
                      <p className="text-slate-800 line-clamp-1">{ord.product}</p>
                      <span className="text-[10px] text-slate-400">{ord.itemsCount} món</span>
                    </td>
                    <td className="py-4 px-3 font-bold text-slate-900">{formatVND(ord.total)}</td>
                    <td className="py-4 px-3 text-slate-600 text-xs">{ord.payment}</td>
                    <td className="py-4 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          ord.status === 'Đã hoàn thành'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ord.status === 'Đang giao hàng'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : ord.status === 'Đang xử lý'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {ord.status === 'Đã hoàn thành' && <CheckCircle2 className="w-3 h-3" />}
                        {ord.status === 'Đang giao hàng' && <Truck className="w-3 h-3" />}
                        {ord.status === 'Chờ xác nhận' && <Clock className="w-3 h-3" />}
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-xs text-slate-700 py-1.5 px-3 rounded-xl outline-none cursor-pointer focus:border-indigo-600 font-semibold transition-all"
                        >
                          <option value="Chờ xác nhận">Chờ xác nhận</option>
                          <option value="Đang xử lý">Đang xử lý</option>
                          <option value="Đang giao hàng">Đang giao hàng</option>
                          <option value="Đã hoàn thành">Đã hoàn thành</option>
                          <option value="Đã hủy">Đã hủy</option>
                        </select>

                        <button
                          onClick={() => setViewingOrder(ord)}
                          className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
                          title="Xem chi tiết đơn"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== MODAL XEM CHI TIẾT ĐƠN HÀNG ===================== */}
      <AnimatePresence>
        {viewingOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 overflow-y-auto max-h-[90vh] space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Chi tiết đơn hàng #{viewingOrder.id}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Thời gian tạo: {viewingOrder.date}</p>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Thông tin khách hàng */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2 text-xs text-slate-600">
                <p><span className="font-bold text-slate-800">Người nhận:</span> {viewingOrder.customer}</p>
                <p><span className="font-bold text-slate-800">Điện thoại:</span> {viewingOrder.phone}</p>
                <p><span className="font-bold text-slate-800">Email:</span> {viewingOrder.email}</p>
                <p><span className="font-bold text-slate-800">Địa chỉ:</span> {viewingOrder.address}</p>
                <p><span className="font-bold text-slate-800">Phương thức:</span> {viewingOrder.payment}</p>
              </div>

              {/* Danh sách items */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sản phẩm trong đơn ({viewingOrder.items?.length || 1})
                </h4>
                <div className="divide-y divide-slate-100">
                  {viewingOrder.items?.map((item, index) => (
                    <div key={index} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-slate-400 mt-0.5">{item.variant ? `Phân loại: ${item.variant} • ` : ''}SL: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-black text-slate-900">{formatVND(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng tiền & Nút đóng */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-medium">Tổng thanh toán:</span>
                  <p className="text-xl font-black text-indigo-600">{formatVND(viewingOrder.total)}</p>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

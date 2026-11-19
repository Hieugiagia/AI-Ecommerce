import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Tag, Clock, Flame, Copy, Plus, Bot, BarChart3, Check, Send, X } from 'lucide-react';
import AdminOverviewPage from './AdminOverviewPage';

export default function AdminDashboardPage() {
  const [params] = useSearchParams();
  const tab = params.get('tab');
  if (tab === 'promotions' || tab === 'ai_forecast') {
    return <div><div className="admin-demo-note">Chế độ mô phỏng · Dữ liệu và các thao tác trong khu vực này dùng để xem trước, chưa áp dụng vào hoạt động bán hàng.</div><AdminDashboardTools key={tab} /></div>;
  }
  return <AdminOverviewPage />;
}

function AdminDashboardTools() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab');


  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Dataset dòng tiền 6 tháng gần nhất cho 1 biểu đồ tài chính trung tâm
  const [copiedCode, setCopiedCode] = useState(null);
  const [voucherList, setVoucherList] = useState([
    {
      id: 1,
      code: 'AITECH10',
      discountText: 'Giảm 10% (tối đa 1.000.000 ₫)',
      minOrder: 1000000,
      usedCount: 450,
      totalLimit: 500,
      expiry: '31/12/2026',
      isActive: true,
      tag: 'HOT',
    },
    {
      id: 2,
      code: 'FREESHIP',
      discountText: 'Miễn phí giao hàng (50.000 ₫)',
      minOrder: 500000,
      usedCount: 820,
      totalLimit: 1000,
      expiry: '30/11/2026',
      isActive: true,
      tag: 'TOÀN QUỐC',
    },
    {
      id: 3,
      code: 'WELCOME50K',
      discountText: 'Giảm ngay 50.000 ₫',
      minOrder: 300000,
      usedCount: 155,
      totalLimit: 300,
      expiry: '31/10/2026',
      isActive: true,
      tag: 'KHÁCH MỚI',
    },
    {
      id: 4,
      code: 'VIPNEXT500',
      discountText: 'Giảm trực tiếp 500.000 ₫',
      minOrder: 10000000,
      usedCount: 68,
      totalLimit: 100,
      expiry: '15/12/2026',
      isActive: false,
      tag: 'VIP ONLY',
    },
  ]);

  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    code: '',
    discountText: '',
    minOrder: '',
    totalLimit: '',
    expiry: '31/12/2026',
  });

  const [flashSaleProducts] = useState([
    {
      id: 1,
      name: 'iPhone 15 Pro Max 256GB Titan Tự Nhiên',
      originalPrice: 34990000,
      salePrice: 29490000,
      discountPercent: 16,
      sold: 45,
      total: 50,
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=160&auto=format&fit=crop&q=80',
      isActive: true,
    },
    {
      id: 2,
      name: 'Sony WH-1000XM5 Silver Edition',
      originalPrice: 8490000,
      salePrice: 6490000,
      discountPercent: 24,
      sold: 68,
      total: 80,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&auto=format&fit=crop&q=80',
      isActive: true,
    },
    {
      id: 3,
      name: 'Galaxy S24 Ultra 512GB Gray AI',
      originalPrice: 31990000,
      salePrice: 26990000,
      discountPercent: 16,
      sold: 72,
      total: 100,
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=160&auto=format&fit=crop&q=80',
      isActive: true,
    },
  ]);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleVoucher = (id) => {
    setVoucherList(prev =>
      prev.map(v => (v.id === id ? { ...v, isActive: !v.isActive } : v))
    );
  };

  const handleCreateVoucher = (e) => {
    e.preventDefault();
    if (!newVoucher.code || !newVoucher.discountText) return;
    const created = {
      id: Date.now(),
      code: newVoucher.code.toUpperCase(),
      discountText: newVoucher.discountText,
      minOrder: Number(newVoucher.minOrder) || 500000,
      usedCount: 0,
      totalLimit: Number(newVoucher.totalLimit) || 100,
      expiry: newVoucher.expiry,
      isActive: true,
      tag: 'NEW',
    };
    setVoucherList([created, ...voucherList]);
    setIsVoucherModalOpen(false);
    setNewVoucher({ code: '', discountText: '', minOrder: '', totalLimit: '', expiry: '31/12/2026' });
  };

  // ================= STATE TRỢ LÝ AI & DỰ BÁO =================
  const [simBudget, setSimBudget] = useState(25); // Triệu VNĐ
  const [actionStatus, setActionStatus] = useState({});
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: 'Xin chào Admin! Tôi là trợ lý phân tích dữ liệu Zentro Store. Dựa trên thống kê 1.245 đơn hàng tuần qua, tỷ suất lợi nhuận điện thoại đang duy trì 28.5%, trong khi phụ kiện đạt 42%. Bạn cần kiểm tra chỉ số nào?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleApplyAction = (actionId) => {
    setActionStatus(prev => ({ ...prev, [actionId]: true }));
  };

  const handleSendChat = (questionText) => {
    const q = questionText || chatInput;
    if (!q.trim()) return;

    const newMsgs = [...chatMessages, { sender: 'user', text: q }];
    setChatMessages(newMsgs);
    if (!questionText) setChatInput('');

    setTimeout(() => {
      let aiReply = 'AI đã phân tích dữ liệu: ';
      if (q.includes('lợi nhuận') || q.includes('cao nhất')) {
        aiReply += 'Sản phẩm có tỷ suất lợi nhuận cao nhất là Phụ kiện & Âm thanh (Sony WH-1000XM5 biên lãi 38%), tiếp theo là MacBook M3 Max (lợi nhuận ròng 9.2 triệu/máy).';
      } else if (q.includes('iPhone') || q.includes('tuần tới')) {
        aiReply += 'Dự báo doanh số iPhone tuần tới tăng +24.8% nhờ kỳ lương cuối tháng. Khuyến nghị nhập thêm 25 máy iPhone 15 Pro Max màu Titan Tự Nhiên để tránh hết hàng cục bộ.';
      } else {
        aiReply += 'Dữ liệu thời gian thực cho thấy giỏ hàng đang có 68 khách hàng tiềm năng đang chờ mã giảm giá vận chuyển. Kích hoạt voucher Freeship có thể chốt thêm ~45 đơn trong 24h.';
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    }, 600);
  };

  // Quick features (5 cards như YupVox)
  // VIEW 1: TRANG KHUYẾN MÃI & FLASH SALE (KHI TAB === 'promotions')
  // =========================================================================
  if (currentTab === 'promotions') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header điều hướng */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
              <Link to="/admin/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">Khuyến mãi & Flash Sale</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Quản lý Khuyến Mãi & Flash Sale</span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Thiết lập giờ vàng Flash Sale, mã voucher chiết khấu và kiểm soát ngân sách ưu đãi bán lẻ
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsVoucherModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Voucher mới</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSearchParams({})}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              ← Về Dashboard
            </motion.button>
          </div>
        </div>

        {/* 4 Thống kê khuyến mãi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div whileHover={{ y: -3 }} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-medium text-slate-400">Voucher đang hoạt động</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{voucherList.filter(v => v.isActive).length} mã</span>
              <span className="text-[11px] font-bold text-emerald-600">Sẵn sàng áp dụng</span>
            </div>
            <p className="text-[10px] text-slate-400">Tổng cộng {voucherList.length} mã trong hệ thống</p>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-medium text-slate-400">Doanh số Flash Sale</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600">485.6M ₫</span>
              <span className="text-[11px] font-bold text-rose-600">+28.4%</span>
            </div>
            <p className="text-[10px] text-slate-400">Ghi nhận từ chiến dịch tháng này</p>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-medium text-slate-400">Lượt khách đã dùng</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">1.493</span>
              <span className="text-[11px] font-bold text-indigo-600">Lượt</span>
            </div>
            <p className="text-[10px] text-slate-400">Tỷ lệ chuyển đổi đạt 74.8%</p>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-medium text-slate-400">Chiết khấu đã cấp</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">46.5M ₫</span>
              <span className="text-[11px] font-bold text-slate-400">9.5% doanh số</span>
            </div>
            <p className="text-[10px] text-slate-400">Nằm trong hạn mức cho phép (50M)</p>
          </motion.div>
        </div>

        {/* Khối 1: Flash Sale Giờ Vàng Đang Chạy */}
        <div className="p-6 sm:p-7 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 rounded-3xl text-white border border-slate-800 shadow-xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
                <Flame className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight text-white">Flash Sale Giờ Vàng Đang Diễn Ra</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    LIVE NOW
                  </span>
                </div>
                <p className="text-xs text-slate-400">Khung giờ 12:00 - 24:00 • Giảm sâu đến 24% cho thiết bị công nghệ</p>
              </div>
            </div>

            {/* Bộ đếm ngược thời gian thực */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-700/80 shadow-inner">
              <Clock className="w-4 h-4 text-rose-400" />
              <span className="text-xs text-slate-300 font-medium">Kết thúc sau:</span>
              <div className="flex items-center gap-1 font-mono font-black text-sm text-rose-400">
                <span className="bg-rose-500/20 px-2 py-0.5 rounded-lg border border-rose-500/30">03</span>:
                <span className="bg-rose-500/20 px-2 py-0.5 rounded-lg border border-rose-500/30">45</span>:
                <span className="bg-rose-500/20 px-2 py-0.5 rounded-lg border border-rose-500/30">18</span>
              </div>
            </div>
          </div>

          {/* Danh sách 3 thiết bị tham gia Flash Sale */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            {flashSaleProducts.map((p) => {
              const percentSold = Math.round((p.sold / p.total) * 100);
              return (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 relative overflow-hidden backdrop-blur-md"
                >
                  <div className="flex gap-3">
                    <img src={p.image} alt={p.name} className="w-16 h-16 rounded-2xl object-cover shrink-0 bg-slate-800" />
                    <div className="min-w-0 flex-1">
                      <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider">
                        Giảm -{p.discountPercent}%
                      </span>
                      <p className="text-xs font-bold text-white truncate mt-1.5">{p.name}</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-black text-rose-400">{formatVND(p.salePrice)}</span>
                        <span className="text-[10px] text-slate-500 line-through">{formatVND(p.originalPrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tiến độ bán */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Đã bán: <strong className="text-white">{p.sold}/{p.total} suất</strong></span>
                      <span className="text-rose-400 font-bold">{percentSold}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentSold}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Khối 2: Bảng Kho Mã Giảm Giá & Voucher Hệ Thống */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Kho Mã Voucher & Khuyến Mãi
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Danh sách các mã ưu đãi khách hàng có thể nhập tại trang Giỏ hàng và Thanh toán
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                {voucherList.length} voucher trong hệ thống
              </span>
            </div>
          </div>

          {/* Bảng voucher */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3.5 pl-3">Mã Voucher</th>
                  <th className="pb-3.5">Mức chiết khấu</th>
                  <th className="pb-3.5">Đơn tối thiểu</th>
                  <th className="pb-3.5">Đã dùng / Giới hạn</th>
                  <th className="pb-3.5">Hạn sử dụng</th>
                  <th className="pb-3.5 text-center">Trạng thái</th>
                  <th className="pb-3.5 text-right pr-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {voucherList.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 pl-3 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-indigo-50/80 text-indigo-700 border border-indigo-200/60 font-black tracking-wide">
                          {v.code}
                        </span>
                        <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/50">
                          {v.tag}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 font-semibold text-slate-800">{v.discountText}</td>
                    <td className="py-4 text-slate-600 font-medium">{formatVND(v.minOrder)}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-slate-900">{v.usedCount}</span>
                        <span className="text-slate-400">/ {v.totalLimit}</span>
                        <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden hidden sm:block">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                            style={{ width: `${Math.min(100, (v.usedCount / v.totalLimit) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 font-medium">{v.expiry}</td>
                    <td className="py-4 text-center">
                      <button
                        onClick={() => handleToggleVoucher(v.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          v.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {v.isActive ? '● Đang kích hoạt' : '○ Tạm dừng'}
                      </button>
                    </td>
                    <td className="py-4 text-right pr-3">
                      <button
                        onClick={() => handleCopyCode(v.code)}
                        className="px-3 py-1.5 text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors border border-slate-200/60"
                      >
                        {copiedCode === v.code ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal tạo Voucher mới */}
        <AnimatePresence>
          {isVoucherModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-100"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Tag className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-black text-slate-900">Tạo Voucher Mới</h3>
                  </div>
                  <button
                    onClick={() => setIsVoucherModalOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Mã Voucher (Code):</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: MEGA2026, FREESHIP100"
                      value={newVoucher.code}
                      onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 font-mono font-bold text-slate-900 uppercase focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Mô tả mức giảm:</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Giảm 100.000 ₫ hoặc Giảm 15% tối đa 500k"
                      value={newVoucher.discountText}
                      onChange={(e) => setNewVoucher({ ...newVoucher, discountText: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Đơn tối thiểu (VNĐ):</label>
                      <input
                        type="number"
                        placeholder="500000"
                        value={newVoucher.minOrder}
                        onChange={(e) => setNewVoucher({ ...newVoucher, minOrder: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Số lượt giới hạn:</label>
                      <input
                        type="number"
                        placeholder="100"
                        value={newVoucher.totalLimit}
                        onChange={(e) => setNewVoucher({ ...newVoucher, totalLimit: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Hạn sử dụng:</label>
                    <input
                      type="text"
                      placeholder="31/12/2026"
                      value={newVoucher.expiry}
                      onChange={(e) => setNewVoucher({ ...newVoucher, expiry: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsVoucherModalOpen(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold cursor-pointer transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-bold shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
                    >
                      Kích hoạt Voucher
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // =========================================================================
  // VIEW 2: TRANG TRỢ LÝ AI & DỰ BÁO (KHI TAB === 'ai_forecast')
  // =========================================================================
  if (currentTab === 'ai_forecast') {
    const projectedRevenue = (simBudget * 6.8).toFixed(1);
    const projectedOrders = Math.round((simBudget * 1000000) / 185000);
    const projectedRoi = '+580%';

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header điều hướng */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
              <Link to="/admin/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">Công cụ & AI</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Trung Tâm Trợ Lý AI & Dự Báo Bán Lẻ</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                Gemini 2.0 Flash
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Dự báo nhu cầu kho, tối ưu giá bán động (Dynamic Pricing) và phân tích hành vi giỏ hàng theo thời gian thực
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSendChat('Dự báo doanh số tuần tới?')}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Chạy phân tích AI ngay</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSearchParams({})}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
            >
              ← Về Dashboard
            </motion.button>
          </div>
        </div>

        {/* 4 Thẻ KPI AI */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div whileHover={{ y: -3 }} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-medium text-slate-400">Độ chính xác mô hình</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-600">98.6%</span>
              <span className="text-[11px] font-bold text-emerald-600">Đã kiểm chứng</span>
            </div>
            <p className="text-[10px] text-slate-400">Dựa trên 1.245 đơn hàng tuần qua</p>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-medium text-slate-400">Doanh thu dự báo tuần 40</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">315.0M ₫</span>
              <span className="text-[11px] font-bold text-emerald-600">+22.4%</span>
            </div>
            <p className="text-[10px] text-slate-400">Kỳ vọng tăng trưởng cuối tháng</p>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-medium text-slate-400">Đề xuất tối ưu giá</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">3 gợi ý</span>
              <span className="text-[11px] font-bold text-amber-600">Chờ duyệt</span>
            </div>
            <p className="text-[10px] text-slate-400">Dự kiến tăng thêm +18% chuyển đổi</p>
          </motion.div>

          <motion.div whileHover={{ y: -3 }} className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-xs font-medium text-slate-400">Tốc độ phản hồi AI</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">0.35s</span>
              <span className="text-[11px] font-bold text-emerald-600">Ultra-fast</span>
            </div>
            <p className="text-[10px] text-slate-400">Tích hợp API Neural Engine trực tiếp</p>
          </motion.div>
        </div>

        {/* Khối 1: 3 Khuyến nghị hành động tự động từ AI */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Khuyến Nghị Hành Động Tự Động Từ AI (AI Actionable Insights)</span>
            </h2>
            <span className="text-xs font-semibold text-slate-400">Cập nhật 5 phút trước</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Cảnh báo cầu thị trường iPhone 15 Pro Max */}
            <motion.div whileHover={{ y: -4 }} className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                    CẢNH BÁO TỒN KHO
                  </span>
                  <span className="text-xs font-bold text-slate-400">Độ tin cậy 96%</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  Nhu cầu iPhone 15 Pro Max tăng vọt cuối tuần
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Lượt xem và thêm vào giỏ hàng tăng <strong>+38%</strong> trong 48h qua. Với tồn kho hiện tại (45 máy), kho chính sẽ cạn kiệt vào chiều thứ Bảy.
                </p>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700">
                  💡 <strong>Đề xuất:</strong> Điều chuyển khẩn 30 máy từ kho tổng về chi nhánh trước 17:00 ngày mai.
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleApplyAction('action1')}
                disabled={actionStatus['action1']}
                className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  actionStatus['action1']
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20'
                }`}
              >
                {actionStatus['action1'] ? '✓ Đã tạo lệnh điều chuyển 30 máy' : 'Duyệt điều chuyển kho ngay'}
              </motion.button>
            </motion.div>

            {/* Card 2: Tối ưu giá động cho Sony WH-1000XM5 */}
            <motion.div whileHover={{ y: -4 }} className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                    DYNAMIC PRICING
                  </span>
                  <span className="text-xs font-bold text-slate-400">Độ tin cậy 92%</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  Kích hoạt Flash Voucher cho Sony WH-1000XM5
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Có 1.200 lượt xem trang nhưng tỷ lệ chốt đơn giảm 14% do người dùng so sánh giá. Kích hoạt voucher 100k giúp chốt thêm 35 đơn.
                </p>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700">
                  💡 <strong>Đề xuất:</strong> Tự động hiển thị voucher giảm 100k cho khách lưu trang trên 2 phút.
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleApplyAction('action2')}
                disabled={actionStatus['action2']}
                className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  actionStatus['action2']
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20'
                }`}
              >
                {actionStatus['action2'] ? '✓ Đã kích hoạt Dynamic Pricing' : 'Kích hoạt Voucher tự động'}
              </motion.button>
            </motion.div>

            {/* Card 3: AI Bundle MacBook + Phụ Kiện */}
            <motion.div whileHover={{ y: -4 }} className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-violet-50 text-violet-700 border border-violet-200">
                    AI UPSELL COMBO
                  </span>
                  <span className="text-xs font-bold text-slate-400">Độ tin cậy 94%</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  Tạo Combo MacBook Pro M3 kèm Magic Mouse
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Hành vi khách mua MacBook Pro có <strong>82%</strong> nhu cầu sắm thêm chuột hoặc hub Type-C. Bán kèm giảm 8% phụ kiện sẽ gia tăng AOV +18%.
                </p>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700">
                  💡 <strong>Đề xuất:</strong> Bật gói gợi ý tự động tại trang Chi tiết sản phẩm MacBook.
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleApplyAction('action3')}
                disabled={actionStatus['action3']}
                className={`w-full py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  actionStatus['action3']
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/20'
                }`}
              >
                {actionStatus['action3'] ? '✓ Đã kích hoạt Gói Combo' : 'Bật Combo gợi ý tự động'}
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Khối 2: Trình giả lập mô phỏng kịch bản tăng trưởng (Scenario Simulator) */}
        <div className="p-6 sm:p-7 bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4 relative z-10">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Mô Phỏng Kịch Bản Tăng Trưởng Doanh Số (AI Growth Simulator)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kéo thanh trượt ngân sách khuyến mãi để AI tính toán doanh số kỳ vọng và tỷ lệ ROI
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-2xl border border-slate-700/80 text-xs">
              <span className="text-slate-400 font-medium">Ngân sách đang chọn:</span>
              <strong className="text-indigo-400 font-mono text-sm">{simBudget} triệu ₫</strong>
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-2.5 relative z-10">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Ngân sách tối thiểu (5M ₫)</span>
              <span>Ngân sách tối đa (50M ₫)</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={simBudget}
              onChange={(e) => setSimBudget(Number(e.target.value))}
              className="w-full accent-indigo-500 h-2.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Kết quả mô phỏng tức thì từ AI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 relative z-10">
            <motion.div whileHover={{ y: -3 }} className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-400">Doanh thu dự kiến thu về</p>
              <p className="text-2xl font-black text-indigo-400">{projectedRevenue}M ₫</p>
              <p className="text-[10px] text-emerald-400 font-medium">Gấp 6.8 lần vốn khuyến mãi</p>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-400">Đơn hàng mới tạo ra</p>
              <p className="text-2xl font-black text-emerald-400">+{projectedOrders} đơn</p>
              <p className="text-[10px] text-slate-400 font-medium">Chi phí chốt đơn: 185k/đơn</p>
            </motion.div>

            <motion.div whileHover={{ y: -3 }} className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-400">Tỷ lệ hoàn vốn đầu tư (ROI)</p>
              <p className="text-2xl font-black text-amber-400">{projectedRoi}</p>
              <p className="text-[10px] text-slate-400 font-medium">Khả năng đạt mục tiêu: 95%</p>
            </motion.div>
          </div>
        </div>

        {/* Khối 3: Hội thoại hỏi đáp cùng chuyên gia AI */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Hỏi Đáp Trực Tiếp Với AI Retail Analyst
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Đặt câu hỏi để AI truy vấn trực tiếp kho dữ liệu đơn hàng và doanh số</p>
            </div>
          </div>

          {/* Quick prompts */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSendChat('Sản phẩm nào mang lại biên lợi nhuận cao nhất tháng này?')}
              className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              💬 Sản phẩm nào có biên lợi nhuận cao nhất?
            </button>
            <button
              onClick={() => handleSendChat('Dự báo doanh số iPhone tuần sau?')}
              className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              💬 Dự báo doanh số iPhone tuần sau?
            </button>
            <button
              onClick={() => handleSendChat('Làm thế nào để giảm tỷ lệ khách bỏ quên giỏ hàng?')}
              className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 text-xs font-semibold transition-colors cursor-pointer"
            >
              💬 Tối ưu khách bỏ quên giỏ hàng?
            </button>
          </div>

          {/* Chat feed */}
          <div className="space-y-3 max-h-72 overflow-y-auto p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            {chatMessages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 text-[10px] font-black shadow-sm">
                    AI
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-lg leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium rounded-tr-xs shadow-sm'
                      : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chat input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChat();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi phân tích cho AI (ví dụ: So sánh doanh số tháng 5 và tháng 6...)"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi</span>
            </motion.button>
          </form>
        </div>
      </motion.div>
    );
  }

  return null;
}

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  Layers,
  Sparkles,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Tablet,
  Tv,
  Camera,
  X,
  Check,
  Settings,
  ShieldCheck,
  Save,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '../../data/mockData';
import { categoryService } from '../../services/categoryService';

export default function AdminCategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isSettingsTab = searchParams.get('tab') === 'settings';

  const [categories, setCategories] = useState(
    CATEGORIES.filter((c) => c.slug !== 'all').map((cat) => ({
      ...cat,
      description: `Các dòng thiết bị ${cat.name} cao cấp chính hãng tích hợp trợ lý AI thông minh.`,
    }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCatId, setDeletingCatId] = useState(null);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const getCategoryCount = (slug) => {
    return PRODUCTS.filter((p) => p.category === slug).length;
  };

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'phone':
        return <Smartphone className="w-5 h-5 text-indigo-600" />;
      case 'laptop':
        return <Laptop className="w-5 h-5 text-violet-600" />;
      case 'audio':
        return <Headphones className="w-5 h-5 text-pink-600" />;
      case 'watch':
        return <Watch className="w-5 h-5 text-amber-600" />;
      case 'tablet':
        return <Tablet className="w-5 h-5 text-blue-600" />;
      case 'accessories':
        return <Layers className="w-5 h-5 text-emerald-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-600" />;
    }
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await categoryService.getCategories();
        if (data && data.length > 0) {
          setCategories(
            data
              .filter((c) => c.slug !== 'all')
              .map((cat) => ({
                ...cat,
                description: cat.description || `Các dòng thiết bị ${cat.name} cao cấp chính hãng tích hợp trợ lý AI thông minh.`,
              }))
          );
        }
      } catch (err) {
        console.warn('Lỗi lấy danh mục từ server:', err);
      }
    }
    fetchCategories();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const newSlug = formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-');
    const newCat = {
      id: Date.now(),
      name: formData.name,
      slug: newSlug,
      description: formData.description || 'Danh mục sản phẩm công nghệ thế hệ mới tích hợp AI.',
    };

    try {
      await categoryService.createCategory(newCat);
    } catch (err) {
      console.warn('Lỗi tạo danh mục trên server:', err);
    }

    setCategories([...categories, newCat]);
    setIsAddOpen(false);
    setFormData({ name: '', slug: '', description: '' });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingCategory) return;

    setCategories((prev) =>
      prev.map((c) => (c.id === editingCategory.id ? { ...editingCategory } : c))
    );
    setEditingCategory(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingCatId) {
      setCategories((prev) => prev.filter((c) => c.id !== deletingCatId));
      setDeletingCatId(null);
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header & Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 font-mono">
              Taxonomy & Workspace Setup
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isSettingsTab ? 'Cài đặt hệ thống & Thương hiệu' : 'Quản lý Danh mục hàng hóa'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {isSettingsTab
              ? 'Tùy chỉnh thông tin thương hiệu, mô hình trợ lý tư vấn AI & giao diện hệ thống'
              : 'Tổ chức phân tầng danh mục, luồng gợi ý AI và cấu trúc hiển thị sản phẩm'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tab switch */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setSearchParams({})}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                !isSettingsTab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Danh mục ({categories.length})
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'settings' })}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSettingsTab
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-indigo-600" />
              <span>Cài đặt hệ thống</span>
            </button>
          </div>

          {!isSettingsTab && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm danh mục mới</span>
            </motion.button>
          )}
        </div>
      </div>

      {isSettingsTab ? (
        /* ================= GIAO DIỆN CÀI ĐẶT HỆ THỐNG ================= */
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Box 1: Cấu hình thông tin cửa hàng */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Thông tin Cửa hàng & Thương hiệu</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                  Live
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tên thương hiệu</label>
                  <input
                    type="text"
                    defaultValue="Alibaba Store - Hệ thống Bán lẻ Công nghệ Chính hãng"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Hotline tư vấn</label>
                    <input
                      type="text"
                      defaultValue="091234567"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email hỗ trợ</label>
                    <input
                      type="email"
                      defaultValue="hieulatui@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Trụ sở Flagship Store</label>
                  <input
                    type="text"
                    defaultValue="136 Nguyễn Thái Học, P. Phạm Ngũ Lão, Quận 1, TP. Hồ Chí Minh"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Slogan hiển thị</label>
                  <input
                    type="text"
                    defaultValue="Trải nghiệm mua sắm thiết bị thông minh với trợ lý AI thế hệ mới"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Box 2: Trợ lý AI & Chatbot */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span>Trợ lý AI & Tự động hóa tư vấn</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Đang hoạt động 100%
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Mô hình AI điều hướng</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none font-medium cursor-pointer transition-all">
                    <option>Google Gemini 2.0 Flash (Tốc độ cao 0.2s)</option>
                    <option>Google Gemini 1.5 Pro (Phân tích so sánh chuyên sâu)</option>
                    <option>Alibaba-Store Fine-tuned Retail Model v2.4</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Chế độ tư vấn khách hàng</label>
                  <div className="p-3.5 bg-gradient-to-r from-indigo-50/70 to-violet-50/70 rounded-2xl border border-indigo-100/80 space-y-1">
                    <p className="font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      MotionSites Smart Advisor Persona
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Tự động trích xuất thông số kỹ thuật, gợi ý sản phẩm theo ngân sách, tính toán phương án trả góp 0% và phân tích ưu đãi độc quyền.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 block">Thời gian phản hồi TB</span>
                    <span className="text-sm font-extrabold text-slate-900">0.24s</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 block">Tỷ lệ hài lòng tư vấn</span>
                    <span className="text-sm font-extrabold text-indigo-600">98.6%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
            <div className="flex items-center gap-3">
              {savedSettingsNotice && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200"
                >
                  <Check className="w-3.5 h-3.5" />
                  Đã cập nhật cấu hình hệ thống thành công!
                </motion.div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi cài đặt</span>
            </motion.button>
          </div>
        </form>
      ) : (
        /* ================= GRID DANH MỤC ================= */
        <div className="space-y-5">
          {/* Search bar */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400 ml-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm danh mục theo tên hoặc slug..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCategories.map((cat, idx) => {
              const count = getCategoryCount(cat.slug);
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  whileHover={{ y: -5, scale: 1.01 }}
                  className="p-6 bg-white border border-slate-200/80 hover:border-indigo-300/80 rounded-3xl shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50/80 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                        {getCategoryIcon(cat.slug)}
                      </div>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-700 px-3 py-1 rounded-full transition-colors">
                        {count} sản phẩm
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded-md text-slate-500">
                        slug
                      </span>
                      <span className="text-xs font-mono text-indigo-600">/{cat.slug}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[11px] text-slate-500 font-medium">Hoạt động bình thường</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setEditingCategory({ ...cat })}
                        className="p-2 text-indigo-600 hover:text-indigo-800 rounded-xl hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Chỉnh sửa danh mục"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDeletingCatId(cat.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Xóa danh mục"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================== MODAL THÊM DANH MỤC ===================== */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Plus className="w-4 h-4" />
                  </div>
                  Tạo danh mục hàng hóa mới
                </h3>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên danh mục *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Máy tính bảng, Camera AI..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Đường dẫn rút gọn (Slug)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="VD: may-tinh-bang (tự sinh nếu để trống)"
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-mono text-[11px] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mô tả danh mục
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả sản phẩm trong nhóm..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    Tạo danh mục
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================== MODAL SỬA DANH MỤC ===================== */}
      <AnimatePresence>
        {editingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingCategory(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-5 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Edit2 className="w-4 h-4" />
                  </div>
                  Chỉnh sửa danh mục
                </h3>
                <button
                  onClick={() => setEditingCategory(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên danh mục
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    rows={3}
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800 transition-all"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                  >
                    Hủy
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    Lưu thay đổi
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================== MODAL XÓA DANH MỤC ===================== */}
      <AnimatePresence>
        {deletingCatId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingCatId(null)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center space-y-4 z-10"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Xác nhận xóa danh mục?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Các sản phẩm thuộc danh mục này sẽ chuyển sang trạng thái chưa phân loại trên giao diện cửa hàng.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeletingCatId(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-rose-500/20"
                >
                  Xác nhận xóa
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

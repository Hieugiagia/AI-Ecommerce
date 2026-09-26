import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  X,
  Check,
  Settings,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '../../data/mockData';

export default function AdminCategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isSettingsTab = searchParams.get('tab') === 'settings';

  const [categories, setCategories] = useState(
    CATEGORIES.filter((c) => c.slug !== 'all').map((cat) => ({
      ...cat,
      description: `Các dòng thiết bị ${cat.name} cao cấp chính hãng tích hợp trợ lý AI.`,
    }))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCatId, setDeletingCatId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  });

  const getCategoryCount = (slug) => {
    return PRODUCTS.filter((p) => p.category === slug).length;
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const newSlug = formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-');
    const newCat = {
      id: Date.now(),
      name: formData.name,
      slug: newSlug,
      description: formData.description || 'Danh mục sản phẩm chính hãng tại Alibaba-Store.',
    };

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

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isSettingsTab ? 'Cài đặt hệ thống & Cửa hàng' : 'Quản lý Danh mục hàng hóa'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {isSettingsTab
              ? 'Tùy chỉnh thông tin cửa hàng, trợ lý tư vấn Alibaba-Store, phương thức giao vận & thanh toán'
              : 'Tạo mới, chỉnh sửa và phân bổ cấu trúc sản phẩm trên cửa hàng'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab switch */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-2xl">
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
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm danh mục mới</span>
            </button>
          )}
        </div>
      </div>

      {isSettingsTab ? (
        /* ================= GIAO DIỆN CÀI ĐẶT HỆ THỐNG ================= */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Box 1: Cấu hình thông tin cửa hàng */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>Thông tin Cửa hàng & Thương hiệu</span>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên thương hiệu</label>
                <input
                  type="text"
                  defaultValue="Alibaba-Store - Hệ thống Bán lẻ Công nghệ Chính hãng"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hotline tư vấn</label>
                  <input
                    type="text"
                    defaultValue="091234567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email hỗ trợ</label>
                  <input
                    type="email"
                    defaultValue="hieulatui@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Trụ sở Flagship Store</label>
                <input
                  type="text"
                  defaultValue="136 Nguyễn Thái Học, P. Phạm Ngũ Lão, Quận 1, TP. Hồ Chí Minh"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Box 2: Trợ lý Alibaba-Store & Chatbot */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Trợ lý Tư vấn & Dự báo Tự động</span>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mô hình AI tích hợp</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:border-indigo-500 outline-none font-medium">
                  <option>Google Gemini 2.0 Flash (Tốc độ cao 0.2s)</option>
                  <option>Google Gemini 1.5 Pro (Phân tích chuyên sâu)</option>
                  <option>Alibaba-Store Fine-tuned Retail Model v2.4</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Chế độ phản hồi</label>
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-1">
                  <p className="font-bold text-indigo-900">CellphoneS Style Retail Advisor</p>
                  <p className="text-[11px] text-slate-600">
                    Tư vấn cấu hình máy, chính sách trả góp 0%, khuyến mãi thu cũ đổi mới, gợi ý sản phẩm phù hợp ngân sách.
                  </p>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-slate-500">Trạng thái dịch vụ AI:</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Đang hoạt động 100%
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= GRID DANH MỤC ================= */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map((cat) => {
          const count = getCategoryCount(cat.slug);
          return (
            <div
              key={cat.id}
              className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {count} sản phẩm
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{cat.name}</h3>
                <p className="text-[11px] font-mono text-indigo-600 mt-0.5">slug: /{cat.slug}</p>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Hoạt động bình thường</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingCategory({ ...cat })}
                    className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingCatId(cat.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Xóa danh mục"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* ===================== MODAL THÊM DANH MỤC ===================== */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Tạo danh mục hàng hóa mới
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
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
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
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
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800 font-mono text-[11px]"
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
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  Tạo danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL SỬA DANH MỤC ===================== */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                Chỉnh sửa danh mục
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
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
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
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
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL XÓA DANH MỤC ===================== */}
      {deletingCatId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Xác nhận xóa danh mục?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Các sản phẩm thuộc danh mục này sẽ chuyển sang trạng thái chưa phân loại.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingCatId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

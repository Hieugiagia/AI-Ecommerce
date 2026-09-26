import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertTriangle,
  ExternalLink,
  X,
  Package,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../../data/mockData';

export default function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isLowStockOnly = searchParams.get('tab') === 'low_stock';

  const [products, setProducts] = useState(PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal Thêm Mới
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'dien-thoai',
    brand: 'Apple',
    price: '',
    originalPrice: '',
    stock: '',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    tag: 'Mới về',
  });

  // Modal Chỉnh Sửa
  const [editingProduct, setEditingProduct] = useState(null);

  // Modal Xóa
  const [deletingProductId, setDeletingProductId] = useState(null);

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Thêm sản phẩm
  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const newProd = {
      id: Date.now(),
      name: formData.name,
      slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      category: formData.category,
      categoryName: CATEGORIES.find((c) => c.slug === formData.category)?.name || 'Khác',
      brand: formData.brand,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice || formData.price),
      stock: Number(formData.stock || 20),
      sold: 0,
      rating: 5.0,
      tag: formData.tag || 'Mới',
      image: formData.image,
      summary: 'Sản phẩm mới vừa được cập nhật vào kho hàng hệ thống.',
      description: 'Sản phẩm chính hãng với bảo hành đầy đủ tại Alibaba-Store.',
    };

    setProducts([newProd, ...products]);
    setIsAddOpen(false);
    setFormData({
      name: '',
      category: 'dien-thoai',
      brand: 'Apple',
      price: '',
      originalPrice: '',
      stock: '',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      tag: 'Mới về',
    });
  };

  // Lưu chỉnh sửa
  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingProduct) return;

    setProducts((prev) =>
      prev.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: editingProduct.name,
              brand: editingProduct.brand,
              price: Number(editingProduct.price),
              originalPrice: Number(editingProduct.originalPrice),
              stock: Number(editingProduct.stock),
              tag: editingProduct.tag,
              category: editingProduct.category,
              categoryName: CATEGORIES.find((c) => c.slug === editingProduct.category)?.name || p.categoryName,
            }
          : p
      )
    );
    setEditingProduct(null);
  };

  // Xóa sản phẩm
  const handleDeleteConfirm = () => {
    if (deletingProductId) {
      setProducts((prev) => prev.filter((p) => p.id !== deletingProductId));
      setDeletingProductId(null);
    }
  };

  // Filter
  const filteredProducts = products.filter((p) => {
    if (isLowStockOnly && (p.stock || 20) > 15) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (
      searchQuery.trim() &&
      !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const lowStockCount = products.filter((p) => (p.stock || 20) <= 15).length;
  const totalStockValue = products.reduce((acc, p) => acc + p.price * (p.stock || 20), 0);

  return (
    <div className="space-y-6">
      {/* Low Stock Filter Alert Banner if active */}
      {isLowStockOnly && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">
                Đang kích hoạt chế độ: Cảnh báo tồn kho thấp (≤ 15 sản phẩm)
              </p>
              <p className="text-xs text-amber-700">
                Tìm thấy {filteredProducts.length} mã hàng có số lượng sắp hết cần nhập bổ sung khẩn cấp.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-xl text-xs font-semibold shrink-0 cursor-pointer transition-colors"
          >
            ✕ Xem tất cả sản phẩm
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Sản phẩm & Kho hàng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Cập nhật giá bán, số lượng tồn kho, thêm và chỉnh sửa danh mục hàng hóa
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm sản phẩm mới</span>
        </button>
      </div>

      {/* Thống kê nhanh kho hàng */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Tổng số mã hàng</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{products.length} sản phẩm</p>
        </div>
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Sản phẩm sắp hết kho (&le; 15 cái)</span>
          <p className="text-xl font-bold text-amber-600 mt-1">{lowStockCount} sản phẩm</p>
        </div>
        <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Ước tính giá trị tồn kho</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatVND(totalStockValue)}</p>
        </div>
      </div>

      {/* Bảng công cụ tìm kiếm và lọc */}
      <div className="p-6 bg-white border border-slate-200/80 rounded-3xl shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên sản phẩm, hãng..."
              className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 py-2.5 px-3 rounded-xl outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Tất cả danh mục</option>
              {CATEGORIES.filter((c) => c.slug !== 'all').map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Sản phẩm</th>
                <th className="py-3 px-3">Danh mục</th>
                <th className="py-3 px-3">Giá bán</th>
                <th className="py-3 px-3">Tồn kho</th>
                <th className="py-3 px-3">Đã bán</th>
                <th className="py-3 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.2 rounded">
                            {p.brand}
                          </span>
                          {p.tag && (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                              {p.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600">{p.categoryName}</td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-slate-900">{formatVND(p.price)}</p>
                    {p.originalPrice > p.price && (
                      <p className="text-[11px] text-slate-400 line-through">
                        {formatVND(p.originalPrice)}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        (p.stock || 20) <= 15
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {(p.stock || 20) <= 15 && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      {p.stock || 20} chiếc
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 font-semibold">{p.sold || 0}</td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/product/${p.id}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Xem trang sản phẩm"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => setEditingProduct({ ...p })}
                        className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeletingProductId(p.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================== MODAL THÊM SẢN PHẨM ===================== */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                Thêm sản phẩm mới vào kho
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: iPad Pro M4 11 inch 256GB"
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Danh mục
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3 py-2.5 rounded-xl outline-none focus:border-indigo-500 text-slate-800 cursor-pointer"
                  >
                    {CATEGORIES.filter((c) => c.slug !== 'all').map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thương hiệu
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="VD: Apple, Sony..."
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giá bán (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="VD: 24990000"
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số lượng tồn kho
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="VD: 25"
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đường dẫn ảnh sản phẩm (URL)
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nhãn sản phẩm (Tag)
                </label>
                <input
                  type="text"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="VD: Bán chạy, Giảm sốc..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  Thêm vào danh sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL CHỈNH SỬA SẢN PHẨM ===================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                Chỉnh sửa sản phẩm
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên sản phẩm
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Giá bán (VNĐ)
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số lượng kho
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock || 20}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nhãn (Tag)
                </label>
                <input
                  type="text"
                  value={editingProduct.tag || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, tag: e.target.value })}
                  placeholder="VD: Bán chạy, Giảm sốc..."
                  className="w-full bg-slate-50 border border-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL XÁC NHẬN XÓA ===================== */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Xác nhận xóa sản phẩm?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sản phẩm sẽ bị gỡ bỏ khỏi kho hàng và người dùng sẽ không còn thấy sản phẩm này trên cửa hàng.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingProductId(null)}
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

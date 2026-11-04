import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  Sparkles,
  ChevronRight,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  LayoutGrid,
  ShieldCheck,
  RotateCcw,
  Zap,
  SlidersHorizontal,
  ArrowUpDown,
  Flame,
  Check,
  Monitor,
  Home,
} from 'lucide-react';
import { priceBounds } from '../services/productFilters';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { apiRequest } from '../services/api';

export default function ProductsPage() {
  const { category: paramCategory } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedCategory = paramCategory || searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || searchParams.get('q') || '';
  const priceRange = searchParams.get('price') || 'all';
  const sortBy = ['newest', 'price-asc', 'price-desc'].includes(searchParams.get('sort')) ? searchParams.get('sort') : 'newest';
  const rawPage = Number(searchParams.get('page') || 1);
  const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = 12;
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [categories, setCategories] = useState([{ id: 'all', name: 'Tất cả sản phẩm', slug: 'all' }]);
  const [categoryError, setCategoryError] = useState('');
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ key: '', products: [], total: 0, error: '' });
  const requestKey = JSON.stringify([selectedCategory, searchQuery, priceRange, sortBy, page, retry]);
  const loading = result.key !== requestKey;
  const serverProducts = loading ? [] : result.products;
  const total = loading ? 0 : result.total;
  const error = loading ? '' : result.error;

  function changeFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (paramCategory) next.set('category', paramCategory);
    next.delete('brand');
    next.delete('q');
    if (searchQuery) next.set('search', searchQuery);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    navigate('/products' + (next.size ? '?' + next : ''), { replace: key === 'search' });
  }
  const setSearchQuery = (value) => changeFilter('search', value);
  const setPriceRange = (value) => changeFilter('price', value);
  const setSortBy = (value) => changeFilter('sort', value);

  useEffect(() => {
    if (['thu-cu', 'thu-cu-doi-moi', 'trade-in'].includes(selectedCategory)) navigate('/thu-cu-doi-moi', { replace: true });
    if (['khuyen-mai', 'promotions'].includes(selectedCategory)) navigate('/khuyen-mai', { replace: true });
  }, [selectedCategory, navigate]);

  useEffect(() => {
    let active = true;
    apiRequest('/categories').then((data) => {
      if (!Array.isArray(data)) throw new Error('Danh sách danh mục không hợp lệ');
      if (active) {
        setCategories([{ id: 'all', name: 'Tất cả sản phẩm', slug: 'all' }, ...data.filter((item) => item.isActive)]);
        setCategoryError('');
      }
    }).catch((err) => { if (active) setCategoryError(err.message); });
    return () => { active = false; };
  }, [retry]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const data = await productService.getProducts({
          category: selectedCategory, q: searchQuery, sort: sortBy, page, limit,
          ...priceBounds(priceRange),
        });
        if (active) setResult({ key: requestKey, products: data.products, total: data.total, error: '' });
      } catch (err) {
        if (active) setResult({ key: requestKey, products: [], total: 0, error: err.message });
      }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [selectedCategory, searchQuery, priceRange, sortBy, page, requestKey]);

  // Category metadata for banners
  const categoryBanners = {
    'all': {
      title: 'Tất Cả Thiết Bị Công Nghệ Chính Hãng',
      subtitle: 'Khám phá sản phẩm công nghệ đỉnh cao từ Apple, Samsung, Sony, Dell, Asus với chính sách bảo hành 12 tháng 1 đổi 1.',
      badge: 'BẢO HÀNH ỦY QUYỀN CHÍNH HÃNG',
      color: 'from-slate-900 via-indigo-950 to-slate-900',
    },
    'dien-thoai': {
      title: 'Điện Thoại Smartphone Flagship',
      subtitle: 'Trợ giá thu cũ lên đời đến 4.000.000đ • Trả góp 0% duyệt nhanh 5 phút qua thẻ hoặc CCCD.',
      badge: 'TOP BÁN CHẠY NHẤT',
      color: 'from-slate-950 via-slate-900 to-indigo-950',
    },
    'laptop': {
      title: 'Laptop & Máy Tính Cao Cấp',
      subtitle: 'Hiệu năng đỉnh cao với MacBook M3, ROG Strix, Dell XPS • Đáp ứng đồ họa, lập trình và văn phòng.',
      badge: 'HIỆU NĂNG VƯỢT TRỘI',
      color: 'from-slate-950 via-indigo-950 to-purple-950',
    },
    'am-thanh': {
      title: 'Tai Nghe Chính Hãng',
      subtitle: 'Trải nghiệm tai nghe chống ồn chủ động đỉnh cao từ Sony, Apple, Marshall • Giảm thêm 200k qua VietQR.',
      badge: 'TAI NGHE CHÍNH HÃNG',
      color: 'from-slate-950 via-slate-900 to-indigo-900',
    },
    'dong-ho': {
      title: 'Đồng Hồ & Thiết Bị Ghi Hình',
      subtitle: 'Theo dõi chỉ số sức khỏe 24/7, đo điện tâm đồ ECG, GPS đa băng tần và camera hành trình 4K chống rung đỉnh cao.',
      badge: 'SỨC KHỎE & THỜI TRANG',
      color: 'from-slate-950 via-teal-950 to-slate-900',
    },
    'phu-kien': {
      title: 'PC, Màn Hình & Phụ Kiện Đỉnh Cao',
      subtitle: 'Nâng tầm góc setup với màn hình OLED 240Hz, UltraSharp 2K, phím cơ nhôm Keychron và sạc Anker GaN.',
      badge: 'SETUP CHUYÊN NGHIỆP',
      color: 'from-slate-950 via-slate-900 to-indigo-950',
    },
    'gia-dung': {
      title: 'Đồ Gia Dụng & Smart Home Tiện Nghi',
      subtitle: 'Cuộc sống hiện đại với robot hút bụi lau nhà tự giặt sấy Dreame, máy lọc không khí thông minh.',
      badge: 'TIỆN NGHI GIA ĐÌNH',
      color: 'from-slate-950 via-purple-950 to-slate-900',
    },
  };

  const currentBanner = categoryBanners[selectedCategory] || categoryBanners['all'];

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'dien-thoai':
        return Smartphone;
      case 'laptop':
        return Laptop;
      case 'am-thanh':
        return Headphones;
      case 'dong-ho':
        return Watch;
      case 'phu-kien':
        return Monitor;
      case 'gia-dung':
        return Home;
      default:
        return LayoutGrid;
    }
  };

  const hotTags = [
    { label: 'iPhone 15 Pro Max', badge: 'Hot', query: 'iPhone 15' },
    { label: 'Galaxy S24 Ultra', badge: 'Hot', query: 'S24 Ultra' },
    { label: 'MacBook M3 Max', badge: 'Mới', query: 'MacBook' },
    { label: 'iPad Pro M4', badge: 'Mới', query: 'iPad Pro' },
    { label: 'Dell UltraSharp', badge: 'Top', query: 'UltraSharp' },
    { label: 'Keychron Q1 Pro', badge: 'Hot', query: 'Keychron' },
    { label: 'Sony WH-1000XM5', badge: 'Top', query: 'Sony' },
    { label: 'ROG Gaming 4070', badge: 'Mới', query: 'ROG' },
  ];

  const priceRanges = [
    { id: 'all', label: 'Tất cả mức giá' },
    { id: 'under5', label: 'Dưới 5 triệu' },
    { id: '5to10', label: 'Từ 5 - 10 triệu' },
    { id: '10to15', label: 'Từ 10 - 15 triệu' },
    { id: '15to20', label: 'Từ 15 - 20 triệu' },
    { id: '20to25', label: 'Từ 20 - 25 triệu' },
    { id: '25to30', label: 'Từ 25 - 30 triệu' },
    { id: 'above30', label: 'Trên 30 triệu' },
  ];

  const filteredProducts = serverProducts;
  const handleSelectCategory = (slug) => changeFilter('category', slug);
  const handleResetFilters = () => navigate('/products');
  const hasActiveFilters = selectedCategory !== 'all' || priceRange !== 'all' || !!searchQuery.trim();
  const activeFilterCount = Number(selectedCategory !== 'all') + Number(priceRange !== 'all') + Number(!!searchQuery.trim());

  // Render Component Thanh Bar Bên Phải (Right Filter Sidebar - Image 2 Style)
  const renderFilterSidebar = () => (
    <div className="space-y-6">
      {/* 1. Header bộ lọc & Reset */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Bộ Lọc Tìm Kiếm</h3>
            <p className="text-[11px] text-slate-500">Phân loại theo tiêu chuẩn cửa hàng</p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer flex items-center gap-1 hover:underline"
          >
            <X className="w-3.5 h-3.5" />
            <span>Xóa lọc ({activeFilterCount})</span>
          </button>
        )}
      </div>

      {/* 2. Danh mục sản phẩm (Category List with Arrows) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
            Danh Mục Ngành Hàng
          </span>
        </div>

        <div className="space-y-1.5">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.slug);
            const isSelected = selectedCategory === cat.slug || String(cat.id) === selectedCategory;
            return (
              <motion.button
                key={cat.id}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  handleSelectCategory(cat.slug);
                  setIsMobileFilterOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-md shadow-indigo-500/20 font-bold'
                    : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white text-indigo-600 shadow-2xs'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{cat.name}</span>
                </div>

                <div className="flex items-center gap-2">

                  <ChevronRight
                    className={`w-3.5 h-3.5 ${
                      isSelected ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 4. Mức giá mong muốn (Price Brackets - Khớp ảnh bên phải) */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          Mức Giá Mong Muốn
        </span>

        <div className="grid grid-cols-2 gap-2">
          {priceRanges.map((p) => {
            const isSelected = priceRange === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setPriceRange(p.id);
                  setIsMobileFilterOpen(false);
                }}
                className={`px-2.5 py-2 rounded-2xl text-[11px] font-semibold text-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/25 font-bold'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/80'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Dòng sản phẩm HOT & Nổi Bật (Có badge Mới / Hot như ảnh mẫu) */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          Dòng Sản Phẩm HOT
        </span>

        <div className="flex flex-wrap gap-1.5">
          {hotTags.map((tag) => (
            <button
              key={tag.label}
              onClick={() => {
                setSearchQuery(tag.query);
                setIsMobileFilterOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 text-slate-700 transition-all cursor-pointer flex items-center gap-1.5 group"
            >
              <span>{tag.label}</span>
              <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded-md bg-rose-500 text-white leading-none">
                {tag.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 6. Hộp cam kết mua sắm an tâm */}
      <div className="p-4 bg-gradient-to-br from-indigo-50/70 to-violet-50/70 border border-indigo-100 rounded-3xl space-y-2">
        <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Cam kết tại Alibaba Store</span>
        </div>
        <ul className="text-[11px] text-slate-600 space-y-1.5">
          <li className="flex items-center gap-1.5">
            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>100% Chính Hãng VN/A &amp; Quốc Tế</span>
          </li>
          <li className="flex items-center gap-1.5">
            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>1 Đổi 1 Trong 30 Ngày Nếu Lỗi</span>
          </li>
          <li className="flex items-center gap-1.5">
            <Check className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>Giao Siêu Tốc 2H Nội Thành</span>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 antialiased text-slate-800">
      {/* 1. BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-indigo-600 transition-colors font-medium">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold">
          {selectedCategory === 'all'
            ? 'Tất cả sản phẩm'
            : categories.find((c) => c.slug === selectedCategory || String(c.id) === String(selectedCategory))?.name || 'Sản phẩm'}
        </span>

      </nav>

      {/* 2. HERO CATEGORY BANNER (Modern MotionSites Style) */}
      <motion.div
        key={selectedCategory}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${currentBanner.color} text-white p-6 sm:p-8 lg:p-10 shadow-lg`}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-indigo-200 border border-white/10 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-indigo-300" />
            {currentBanner.badge}
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
            {currentBanner.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {currentBanner.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Bảo Hành 12 Tháng
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              1 Đổi 1 Trong 30 Ngày
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Giao Siêu Tốc 2 Giờ
            </span>
          </div>
        </div>
      </motion.div>

      {searchParams.has('brand') && <p className="text-sm text-slate-600">Bộ lọc thương hiệu hiện chưa khả dụng. Bạn có thể tìm theo tên sản phẩm.</p>}
      {categoryError && <p role="alert" className="text-sm text-amber-800">Không tải được danh mục: {categoryError} <button className="underline" onClick={() => setRetry((value) => value + 1)}>Thử lại</button></p>}
      {/* Nút bật bộ lọc trên Mobile */}
      <div className="lg:hidden flex items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-sm"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Bộ lọc &amp; Danh mục {hasActiveFilters && `(${activeFilterCount})`}</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold border border-rose-200"
            title="Đặt lại"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ================= 3. BỐ CỤC CHÍNH (MAIN PRODUCT GRID TRÁI + BỘ LỌC PHẢI) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= CỘT TRÁI: DANH SÁCH SẢN PHẨM ================= */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Thanh công cụ tìm kiếm & Sắp xếp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200/80 rounded-3xl shadow-xs">
            {/* Input tìm kiếm nhanh */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên sản phẩm..."
                className="w-full bg-slate-50 border border-slate-200/70 focus:bg-white focus:border-indigo-500 rounded-2xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sắp xếp & Số lượng kết quả */}
            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
              <span className="text-slate-500 shrink-0 font-medium">
                Tìm thấy <strong className="text-slate-900 font-bold">{total}</strong> sản phẩm
              </span>

              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold outline-none focus:border-indigo-500 cursor-pointer transition-all"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dải chip bộ lọc đang hoạt động */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-400 font-medium">Đang lọc theo:</span>

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {categories.find((c) => c.slug === selectedCategory || String(c.id) === String(selectedCategory))?.name || selectedCategory}
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className="hover:text-indigo-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}



              {priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Giá: {priceRanges.find((p) => p.id === priceRange)?.label || 'Khoảng giá đã chọn'}
                  <button
                    onClick={() => setPriceRange('all')}
                    className="hover:text-amber-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Từ khóa: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:underline font-semibold ml-2 cursor-pointer"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* LƯỚI SẢN PHẨM CHÍNH */}
          {loading ? <p role="status" className="p-8 text-center">Đang tải sản phẩm...</p> : error ? (
            <div role="alert" className="rounded-3xl border border-rose-200 bg-white p-6 text-rose-700">
              <p>{error}</p><button className="mt-3 underline" onClick={() => setRetry((value) => value + 1)}>Thử lại</button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5"
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            /* Smart Fallback Empty State with Recommendations */
            <div className="space-y-8">
              <div className="p-8 sm:p-10 bg-white border border-slate-200/80 rounded-3xl text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Không tìm thấy sản phẩm chính xác khớp bộ lọc này
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Bạn có thể nới lỏng mức giá hoặc bấm nút bên dưới để xem toàn bộ sản phẩm.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold rounded-2xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xóa bộ lọc để xem tất cả</span>
                </button>
              </div>


            </div>
          )}
          {!loading && !error && total > 0 && (
            <nav aria-label="Phân trang sản phẩm" className="flex items-center justify-between gap-3 text-sm">
              <button disabled={page <= 1} className="rounded-xl border px-4 py-2 disabled:opacity-40" onClick={() => changeFilter('page', page - 1)}>Trước</button>
              <span>Trang {page} / {Math.max(1, Math.ceil(total / limit))}</span>
              <button disabled={page * limit >= total} className="rounded-xl border px-4 py-2 disabled:opacity-40" onClick={() => changeFilter('page', page + 1)}>Sau</button>
            </nav>
          )}
          {!loading && !error && !serverProducts.length && page > 1 && <button className="text-indigo-600 underline" onClick={() => changeFilter('page', 1)}>Về trang đầu</button>}
        </div>

        {/* ================= CỘT PHẢI: THANH BAR BỘ LỌC (Right Filter Sidebar - Image 2 Style) ================= */}
        <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-24">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs">
            {renderFilterSidebar()}
          </div>
        </aside>
      </div>

      {/* ================= MODAL / DRAWER BỘ LỌC TRÊN MOBILE ================= */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm h-full bg-white shadow-2xl p-6 overflow-y-auto space-y-4 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
                  Bộ Lọc &amp; Danh Mục
                </h3>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {renderFilterSidebar()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Filter,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  ChevronRight,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  LayoutGrid,
  Flame,
  Check,
  ShieldCheck,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';

export default function ProductsPage({ onOpenAiChat }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [priceRange, setPriceRange] = useState('all'); // 'all', 'under5', '5to15', '15to25', 'above25'
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-asc', 'price-desc', 'rating', 'sold'
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state when URL params change
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const s = searchParams.get('search') || '';
    setSelectedCategory(cat);
    setSearchQuery(s);
  }, [searchParams]);

  // Category metadata for banners
  const categoryBanners = {
    'all': {
      title: 'Tất Cả Thiết Bị Công Nghệ Chính Hãng',
      subtitle: 'Khám phá hàng trăm sản phẩm đỉnh cao từ Apple, Samsung, Sony với chính sách bảo hành 12 tháng 1 đổi 1.',
      badge: 'ƯU ĐÃI ĐỘC QUYỀN ALIBABA-STORE',
      color: 'from-slate-900 via-slate-800 to-indigo-950',
    },
    'dien-thoai': {
      title: 'Điện Thoại Smartphone Cao Cấp',
      subtitle: 'Trợ giá thu cũ lên đời đến 2.000.000đ • Trả góp 0% duyệt nhanh 5 phút qua thẻ hoặc CCCD.',
      badge: 'TOP BÁN CHẠY NHẤT',
      color: 'from-red-950 via-slate-900 to-rose-950',
    },
    'laptop': {
      title: 'Laptop & Máy Tính Cho AI & Đồ Họa',
      subtitle: 'Hiệu năng đỉnh cao với MacBook M3, ROG Strix, Dell XPS • Tặng kèm balo chống sốc và chuột không dây.',
      badge: 'HIỆU NĂNG VƯỢT TRỘI',
      color: 'from-blue-950 via-indigo-950 to-slate-900',
    },
    'am-thanh': {
      title: 'Tai Nghe & Âm Thanh Chống Ồn',
      subtitle: 'Trải nghiệm âm thanh vòm chuẩn Hi-Res Audio từ Sony, Marshall, Apple • Giảm thêm 200k khi thanh toán VietQR.',
      badge: 'ÂM THANH HI-RES',
      color: 'from-amber-950 via-slate-900 to-yellow-950',
    },
    'dong-ho': {
      title: 'Đồng Hồ Thông Minh Smartwatch',
      subtitle: 'Theo dõi chỉ số sức khỏe 24/7, đo điện tâm đồ ECG, GPS độc lập đa băng tần • Tặng dây đeo thể thao cao cấp.',
      badge: 'SỨC KHỎE & THỜI TRANG',
      color: 'from-emerald-950 via-slate-900 to-teal-950',
    },
    'phu-kien-ai': {
      title: 'Thiết Bị Đột Phá & Phụ Kiện AI',
      subtitle: 'Khám phá các thiết bị thế hệ mới: Rabbit R1, Meta Ray-Ban, Pin dự phòng MagSafe và sạc nhanh GaN.',
      badge: 'CÔNG NGHỆ TƯƠNG LAI',
      color: 'from-purple-950 via-violet-950 to-slate-900',
    },
  };

  const currentBanner = categoryBanners[selectedCategory] || categoryBanners['all'];

  // Category Icon helper
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
      case 'phu-kien-ai':
        return Sparkles;
      default:
        return LayoutGrid;
    }
  };

  // Extract unique brands
  const brands = useMemo(() => {
    const list = Array.from(new Set(PRODUCTS.map((p) => p.brand).filter(Boolean)));
    return ['all', ...list];
  }, []);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      // Brand filter
      if (selectedBrand !== 'all' && product.brand !== selectedBrand) {
        return false;
      }
      // Price range
      if (priceRange === 'under5' && product.price >= 5000000) return false;
      if (priceRange === '5to15' && (product.price < 5000000 || product.price > 15000000)) return false;
      if (priceRange === '15to25' && (product.price < 15000000 || product.price > 25000000)) return false;
      if (priceRange === 'above25' && product.price <= 25000000) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(query);
        const matchCategory = product.categoryName?.toLowerCase().includes(query);
        const matchBrand = product.brand?.toLowerCase().includes(query);
        if (!matchName && !matchCategory && !matchBrand) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'sold') return (b.sold || 0) - (a.sold || 0);
      return 0; // default featured
    });
  }, [selectedCategory, selectedBrand, priceRange, searchQuery, sortBy]);

  const handleSelectCategory = (catSlug) => {
    setSelectedCategory(catSlug);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (catSlug === 'all') next.delete('category');
      else next.set('category', catSlug);
      return next;
    });
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setPriceRange('all');
    setSearchQuery('');
    setSortBy('featured');
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    priceRange !== 'all' ||
    searchQuery.trim() !== '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 antialiased text-slate-800">
      {/* 1. BREADCRUMB */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-red-600 transition-colors font-medium">
          Trang chủ
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-900 font-bold">
          {selectedCategory === 'all'
            ? 'Tất cả sản phẩm'
            : CATEGORIES.find((c) => c.slug === selectedCategory)?.name || 'Danh mục'}
        </span>
        {selectedBrand !== 'all' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-red-600 font-bold">{selectedBrand}</span>
          </>
        )}
      </nav>

      {/* 2. DYNAMIC HERO CATEGORY BANNER (PHONG CÁCH CELLPHONES) */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${currentBanner.color} text-white p-6 sm:p-8 lg:p-10 shadow-lg`}
      >
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
            <Flame className="w-3.5 h-3.5 fill-white text-white" />
            <span>{currentBanner.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {currentBanner.title}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {currentBanner.subtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              100% Chính Hãng VN/A
            </span>
            <span className="flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              1 Đổi 1 Trong 30 Ngày
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Giao Nhanh 2 Giờ
            </span>
          </div>
        </div>
      </div>

      {/* 3. DẢI CHỌN DANH MỤC NHANH (CATEGORY QUICK SELECTOR PILLS) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Danh Mục Sản Phẩm
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = getCategoryIcon(cat.slug);
            const isSelected = selectedCategory === cat.slug;
            const count =
              cat.slug === 'all'
                ? PRODUCTS.length
                : PRODUCTS.filter((p) => p.category === cat.slug).length;

            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.slug)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border shrink-0 ${
                  isSelected
                    ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. DẢI CHỌN THƯƠNG HIỆU & MỨC GIÁ CHUẨN CELLPHONES */}
      <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-3xl shadow-xs space-y-4">
        {/* Hàng chọn Hãng */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 min-w-28">
            Thương hiệu:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  selectedBrand === b
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {b === 'all' ? 'Tất cả thương hiệu' : b}
              </button>
            ))}
          </div>
        </div>

        {/* Hàng chọn Mức giá */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 min-w-28">
            Khoảng giá:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Tất cả mức giá' },
              { id: 'under5', label: 'Dưới 5 triệu' },
              { id: '5to15', label: '5 - 15 triệu' },
              { id: '15to25', label: '15 - 25 triệu' },
              { id: 'above25', label: 'Trên 25 triệu' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPriceRange(p.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  priceRange === p.id
                    ? 'bg-red-50 text-red-600 border-red-300 ring-2 ring-red-500/20 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. THANH THỐNG KÊ KẾT QUẢ & SẮP XẾP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="text-xs sm:text-sm text-slate-600">
          Hiển thị <strong className="text-slate-900 font-extrabold">{filteredProducts.length}</strong> sản phẩm chính hãng
        </div>

        {/* Sort Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Sắp xếp:</span>
          {[
            { id: 'featured', label: 'Nổi bật' },
            { id: 'sold', label: 'Bán chạy' },
            { id: 'price-asc', label: 'Giá thấp → cao' },
            { id: 'price-desc', label: 'Giá cao → thấp' },
            { id: 'rating', label: 'Đánh giá cao' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                sortBy === s.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6. BANNER GỢI Ý TỪ TRỢ LÝ ALIBABA-STORE */}
      {onOpenAiChat && (
        <div
          onClick={onOpenAiChat}
          className="p-4 sm:p-5 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-700 rounded-3xl text-white shadow-md flex items-center justify-between gap-4 cursor-pointer hover:opacity-95 transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-extrabold flex items-center gap-2">
                <span>Chưa biết chọn mẫu thiết bị nào phù hợp?</span>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-1.5 py-0.2 rounded">
                  Tư vấn Miễn Phí
                </span>
              </p>
              <p className="text-xs text-indigo-100">
                Bấm vào đây để trò chuyện với Trợ lý Alibaba-Store: Tư vấn cấu hình, so sánh các phiên bản và dự toán tài chính tức thì.
              </p>
            </div>
          </div>

          <button className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-900 rounded-xl text-xs font-extrabold shrink-0 shadow-sm group-hover:bg-amber-300 group-hover:text-slate-950 transition-colors">
            <span>Tư vấn ngay</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 7. LƯỚI SẢN PHẨM HOẶC EMPTY STATE */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white border border-slate-200/90 rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Không tìm thấy sản phẩm phù hợp
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Không có thiết bị nào khớp với tiêu chí tìm kiếm hoặc khoảng giá đã chọn. Hãy thử nới lỏng bộ lọc hoặc xóa từ khóa.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-600/20 cursor-pointer"
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      )}
    </div>
  );
}

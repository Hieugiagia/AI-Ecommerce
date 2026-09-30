import React, { useState, useMemo, useEffect } from 'react';
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
  Tag,
  Filter,
  Monitor,
  Home,
} from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';

export default function ProductsPage({ onOpenAiChat }) {
  const { category: paramCategory } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawCategory = paramCategory || searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialBrand = searchParams.get('brand') || 'all';
  const initialPrice = searchParams.get('price') || 'all';

  const [selectedCategory, setSelectedCategory] = useState(rawCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [priceRange, setPriceRange] = useState(initialPrice);
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Auto redirect special categories to their dedicated pages
  useEffect(() => {
    if (rawCategory === 'thu-cu' || rawCategory === 'thu-cu-doi-moi' || rawCategory === 'trade-in') {
      navigate('/thu-cu-doi-moi', { replace: true });
    } else if (rawCategory === 'khuyen-mai' || rawCategory === 'promotions') {
      navigate('/khuyen-mai', { replace: true });
    }
  }, [rawCategory, navigate]);

  useEffect(() => {
    const cat = paramCategory || searchParams.get('category') || 'all';
    setSelectedCategory(cat);
    setSearchQuery(searchParams.get('search') || '');
    setSelectedBrand(searchParams.get('brand') || 'all');
    setPriceRange(searchParams.get('price') || 'all');
  }, [paramCategory, searchParams]);

  const [serverProducts, setServerProducts] = useState(PRODUCTS);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await productService.getProducts({
          category: selectedCategory,
          brand: selectedBrand,
          search: searchQuery,
          sort: sortBy,
        });
        if (res?.products?.length > 0) {
          setServerProducts(res.products);
        }
      } catch (err) {
        console.warn('Lỗi lấy danh sách sản phẩm từ backend:', err);
      }
    }
    loadProducts();
  }, [selectedCategory, selectedBrand, searchQuery, sortBy]);

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

  const allBrands = useMemo(() => {
    const list = Array.from(new Set(serverProducts.map((p) => p.brand).filter(Boolean)));
    return ['all', ...list];
  }, [serverProducts]);

  // Brands specific to current selected category
  const categoryBrands = useMemo(() => {
    const pool = selectedCategory === 'all'
      ? serverProducts
      : serverProducts.filter((p) => p.category === selectedCategory);
    return Array.from(new Set(pool.map((p) => p.brand).filter(Boolean)));
  }, [selectedCategory, serverProducts]);

  // Suggested products when filter returns 0 products
  const suggestedProducts = useMemo(() => {
    const pool = selectedCategory !== 'all'
      ? serverProducts.filter((p) => p.category === selectedCategory)
      : serverProducts;
    return pool.slice(0, 6);
  }, [selectedCategory, serverProducts]);

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

  // Lọc sản phẩm
  const filteredProducts = useMemo(() => {
    return serverProducts.filter((product) => {
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      if (selectedBrand !== 'all' && product.brand !== selectedBrand) {
        return false;
      }

      // Hỗ trợ mọi phân khúc giá từ Mega Menu & Sidebar
      if (priceRange === 'under1m' && product.price >= 1000000) return false;
      if (priceRange === '1to3m' && (product.price < 1000000 || product.price > 3000000)) return false;
      if (priceRange === '3to5m' && (product.price < 3000000 || product.price > 5000000)) return false;
      if (priceRange === 'under5' && product.price >= 5000000) return false;
      if (priceRange === 'under10' && product.price >= 10000000) return false;
      if (priceRange === '5to10' && (product.price < 5000000 || product.price > 10000000)) return false;
      if (priceRange === '5to15' && (product.price < 5000000 || product.price > 15000000)) return false;
      if (priceRange === '10to15' && (product.price < 10000000 || product.price > 15000000)) return false;
      if (priceRange === '15to20' && (product.price < 15000000 || product.price > 20000000)) return false;
      if (priceRange === '15to25' && (product.price < 15000000 || product.price > 25000000)) return false;
      if (priceRange === '20to25' && (product.price < 20000000 || product.price > 25000000)) return false;
      if (priceRange === '25to30' && (product.price < 25000000 || product.price > 30000000)) return false;
      if (priceRange === 'above20' && product.price <= 20000000) return false;
      if (priceRange === 'above25' && product.price <= 25000000) return false;
      if (priceRange === 'above30' && product.price <= 30000000) return false;

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
      return 0;
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

  const activeFilterCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedBrand !== 'all' ? 1 : 0) +
    (priceRange !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

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
          {CATEGORIES.map((cat) => {
            const Icon = getCategoryIcon(cat.slug);
            const isSelected = selectedCategory === cat.slug;
            const count =
              cat.slug === 'all'
                ? PRODUCTS.length
                : PRODUCTS.filter((p) => p.category === cat.slug).length;

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
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-500 border border-slate-200/80'
                    }`}
                  >
                    {count}
                  </span>
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

      {/* 3. Hãng sản xuất (Brand Grid - Khớp phong cách ảnh bên phải) */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-violet-600" />
            Hãng Sản Xuất
          </span>
          {selectedBrand !== 'all' && (
            <button
              onClick={() => setSelectedBrand('all')}
              className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
            >
              Tất cả
            </button>
          )}
        </div>

        {/* Lưới các hãng bo tròn trắng viền mỏng như ảnh mẫu */}
        <div className="grid grid-cols-2 gap-2">
          {allBrands.map((b) => {
            const isSelected = selectedBrand === b;
            return (
              <button
                key={b}
                onClick={() => {
                  setSelectedBrand(b);
                  setIsMobileFilterOpen(false);
                }}
                className={`px-3 py-2.5 rounded-2xl text-xs font-bold text-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white hover:bg-indigo-50/50 hover:border-indigo-300 text-slate-700 border-slate-200/80 shadow-2xs'
                }`}
              >
                {b === 'all' ? 'Tất cả hãng' : b}
              </button>
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
            : CATEGORIES.find((c) => c.slug === selectedCategory)?.name || 'Sản phẩm'}
        </span>
        {selectedBrand !== 'all' && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-indigo-600 font-bold">{selectedBrand}</span>
          </>
        )}
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
          {/* Dải thương hiệu nhanh cho danh mục hiện tại */}
          {categoryBrands.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar">
              <span className="text-xs font-bold text-slate-400 shrink-0">Hãng:</span>
              <button
                onClick={() => setSelectedBrand('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  selectedBrand === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200/80 shadow-2xs'
                }`}
              >
                Tất cả
              </button>
              {categoryBrands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand === selectedBrand ? 'all' : brand)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                    selectedBrand === brand
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs shadow-indigo-500/25'
                      : 'bg-white hover:bg-indigo-50/60 hover:border-indigo-200 text-slate-700 border-slate-200/80 shadow-2xs'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          )}

          {/* Thanh công cụ tìm kiếm & Sắp xếp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border border-slate-200/80 rounded-3xl shadow-xs">
            {/* Input tìm kiếm nhanh */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sản phẩm theo tên, model, chip, tính năng..."
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
                Tìm thấy <strong className="text-slate-900 font-bold">{filteredProducts.length}</strong> sản phẩm
              </span>

              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold outline-none focus:border-indigo-500 cursor-pointer transition-all"
                >
                  <option value="featured">Nổi bật nhất</option>
                  <option value="sold">Bán chạy nhất</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="rating">Đánh giá cao nhất</option>
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
                  {CATEGORIES.find((c) => c.slug === selectedCategory)?.name}
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className="hover:text-indigo-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedBrand !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                  Hãng: {selectedBrand}
                  <button
                    onClick={() => setSelectedBrand('all')}
                    className="hover:text-violet-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {priceRange !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Giá: {priceRanges.find((p) => p.id === priceRange)?.label}
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
          {filteredProducts.length > 0 ? (
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
                    {selectedBrand !== 'all' ? `Hãng "${selectedBrand}" hiện chưa có cấu hình theo mức giá này. ` : ''}
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

              {/* Gợi ý sản phẩm nổi bật cùng danh mục */}
              {suggestedProducts.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Gợi ý các sản phẩm nổi bật được quan tâm nhất</span>
                    </h4>
                    <button
                      onClick={handleResetFilters}
                      className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                    >
                      Xem tất cả ({PRODUCTS.length})
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5">
                    {suggestedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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

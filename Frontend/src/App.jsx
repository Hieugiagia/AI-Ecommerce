import React, { useState } from 'react';
import Navbar from './components/navbar';
import AiChatWidget from './components/AiChatWidget';
import AuthModal from './components/AuthModal';
import { CATEGORIES, PRODUCTS } from './data/mockData';
import { Star, ShoppingCart, Sparkles, Filter } from 'lucide-react';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const filteredProducts =
    selectedCategory === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === selectedCategory);

  const handleAddToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header / Navbar */}
      <Navbar
        cartCount={cart.length}
        onOpenAiChat={() => setIsAiOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950/40 to-transparent border-b border-slate-900 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Mua sắm thông minh cùng <span className="text-indigo-400">Trợ lý ảo AI</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Khám phá các sản phẩm công nghệ đỉnh cao, tối ưu hóa lựa chọn theo nhu cầu cá nhân hóa thời gian thực.
          </p>
        </div>
      </section>

      {/* Nội dung chính */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bộ lọc danh mục */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8">
          <span className="text-xs text-slate-400 flex items-center gap-1 mr-2 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Danh mục:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.slug
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Lưới sản phẩm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-900/10 transition-all flex flex-col"
            >
              {/* Ảnh */}
              <div className="relative aspect-square overflow-hidden bg-slate-800">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {p.tag && (
                  <span className="absolute top-3 left-3 bg-indigo-600 text-[11px] font-bold px-2.5 py-1 rounded-lg text-white shadow">
                    {p.tag}
                  </span>
                )}
              </div>

              {/* Thông tin */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs mb-1.5 font-medium">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{p.rating}</span>
                    <span className="text-slate-500">({p.sold} đã bán)</span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-100 line-clamp-2 mb-2 group-hover:text-indigo-400 transition-colors">
                    {p.name}
                  </h3>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between mt-2">
                  <div>
                    <div className="text-xs text-slate-500 line-through">{formatVND(p.originalPrice)}</div>
                    <div className="text-base font-bold text-rose-400">{formatVND(p.price)}</div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(p)}
                    className="p-2.5 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-xl transition-all cursor-pointer"
                    title="Thêm vào giỏ"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Widget Chat AI */}
      <AiChatWidget isOpen={isAiOpen} onClose={() => setIsAiOpen(!isAiOpen)} />

      {/* Modal Đăng nhập / Đăng ký / Quên mật khẩu */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
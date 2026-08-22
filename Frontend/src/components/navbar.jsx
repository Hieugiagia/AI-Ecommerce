import React from 'react';
import { ShoppingBag, Search, ShoppingCart, User, Sparkles } from 'lucide-react';

export default function Navbar({ cartCount, onOpenAiChat, onOpenAuth }) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
            AI-Commerce
          </span>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm điện thoại, laptop, trợ lý AI..."
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 pl-11 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAiChat}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span className="hidden sm:inline">Hỏi AI Trợ Lý</span>
          </button>

          <div className="relative cursor-pointer p-2 hover:bg-slate-800 rounded-xl text-slate-300 transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>

          {/* Nút mở Form Đăng nhập / Đăng ký */}
          <button 
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Tài khoản"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
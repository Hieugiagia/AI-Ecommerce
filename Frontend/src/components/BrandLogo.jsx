import React from 'react';
import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../config/storeConfig';

export default function BrandLogo({
  size = 'md',
  variant = 'light',
  showSlogan = false,
  to = '/',
  className = '',
}) {
  // Kích thước icon
  const iconSizes = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const isDark = variant === 'dark';
  const isAdmin = variant === 'admin';

  const logoContent = (
    <div className={`flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}>
      {/* Icon biểu tượng chữ A (Alibaba) cách điệu công nghệ đỉnh cao */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center shrink-0 shadow-md ${
          isAdmin
            ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 shadow-indigo-600/25'
            : 'bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 shadow-red-600/25'
        } transition-transform group-hover:scale-105 duration-200`}
      >
        {/* Vector Stylized A (Alibaba) Logo */}
        <svg
          className="w-3/5 h-3/5"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Biểu tượng chữ A cánh chim công nghệ / Forward Triangle */}
          <path
            d="M18.2 7.2C19.0 5.8 21.0 5.8 21.8 7.2L32.8 28.5C33.6 30.1 32.4 32 30.6 32H26.2C25.1 32 24.1 31.4 23.6 30.4L21.8 26.5H18.2L16.4 30.4C15.9 31.4 14.9 32 13.8 32H9.4C7.6 32 6.4 30.1 7.2 28.5L18.2 7.2Z"
            fill="white"
            fillOpacity="0.96"
          />
          {/* Lỗ tam giác trong chữ A */}
          <polygon points="20,13 22.8,20.5 17.2,20.5" fill={isAdmin ? '#4f46e5' : '#dc2626'} />
          {/* Điểm nhấn viên kim cương công nghệ ở tâm */}
          <circle cx="20" cy="21.5" r="1.5" fill="white" />
        </svg>

        {/* Viền sáng bóng kính */}
        <div className="absolute inset-0 rounded-[inherit] ring-1 ring-white/30 pointer-events-none" />
      </div>

      {/* Typography tên thương hiệu Alibaba-Store */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black ${textSizes[size]} tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <span className={isAdmin ? 'text-indigo-600' : 'text-red-600'}>Alibaba</span>
            <span className="text-slate-400 font-light">-</span>
            <span>Store</span>
          </span>

          {isAdmin && (
            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Admin
            </span>
          )}
        </div>

        {showSlogan && (
          <span
            className={`text-[10px] font-semibold tracking-wider uppercase mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Chính Hãng • Giá Tốt
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to}>{logoContent}</Link>;
  }

  return logoContent;
}

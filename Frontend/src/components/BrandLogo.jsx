import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function BrandLogo({
  size = 'md',
  variant = 'light',
  showSlogan = false,
  to = '/',
  className = '',
}) {
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
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`flex items-center gap-2.5 sm:gap-3 group select-none ${className}`}
    >
      {/* Icon biểu tượng chữ A cách điệu công nghệ AI SaaS */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center shrink-0 shadow-lg ${
          isAdmin
            ? 'bg-gradient-to-tr from-slate-900 via-indigo-900 to-indigo-600 shadow-indigo-600/20'
            : 'bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-500 shadow-indigo-500/25'
        } transition-transform duration-300 group-hover:shadow-indigo-500/35`}
      >
        {/* Vector Stylized A Logo */}
        <svg
          className="w-3/5 h-3/5"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Biểu tượng chữ A cánh chim công nghệ */}
          <path
            d="M18.2 7.2C19.0 5.8 21.0 5.8 21.8 7.2L32.8 28.5C33.6 30.1 32.4 32 30.6 32H26.2C25.1 32 24.1 31.4 23.6 30.4L21.8 26.5H18.2L16.4 30.4C15.9 31.4 14.9 32 13.8 32H9.4C7.6 32 6.4 30.1 7.2 28.5L18.2 7.2Z"
            fill="white"
            fillOpacity="0.96"
          />
          {/* Lỗ tam giác trong chữ A */}
          <polygon points="20,13 22.8,20.5 17.2,20.5" fill={isAdmin ? '#1e1b4b' : '#4338ca'} />
          {/* Điểm nhấn viên kim cương công nghệ ở tâm */}
          <circle cx="20" cy="21.5" r="1.5" fill="white" />
        </svg>

        {/* Viền sáng bóng kính tinh tế */}
        <div className="absolute inset-0 rounded-[inherit] ring-1 ring-white/30 pointer-events-none" />

        {/* AI micro-glow spark */}
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
        </span>
      </div>

      {/* Typography tên thương hiệu Alibaba Store */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-black ${textSizes[size]} tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Alibaba
            </span>{' '}
            <span className={isDark ? 'text-white' : 'text-slate-900'}>Store</span>
          </span>

          {isAdmin && (
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 tracking-wider">
              Admin
            </span>
          )}
        </div>

        {showSlogan && (
          <span
            className={`text-[10px] font-medium tracking-wide mt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Thiết bị công nghệ chính hãng
          </span>
        )}
      </div>
    </motion.div>
  );

  if (to) {
    return <Link to={to} className="inline-block">{logoContent}</Link>;
  }

  return logoContent;
}

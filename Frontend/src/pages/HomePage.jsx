import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  RotateCcw,
  CreditCard,
  Timer,
  ChevronRight,
  Flame,
  Monitor,
  Home,
  Truck,
} from 'lucide-react';
import { PRODUCTS, CATEGORIES } from '../data/mockData';
import ProductCard from '../components/ProductCard';

export default function HomePage({ onOpenAiChat }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [flashSaleCategory, setFlashSaleCategory] = useState('all');
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 });
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Hero carousel banners with MotionSites SaaS look
  const heroSlides = [
    {
      title: 'iPhone 15 Pro Max Titan Tự Nhiên',
      subtitle: 'Khung viền Titan hàng không vũ trụ • Sức mạnh vô song từ Chip A17 Pro tối ưu hóa AI',
      badge: 'FLAGSHIP CÔNG NGHỆ',
      price: 'Từ 29.490.000 ₫',
      oldPrice: '34.990.000 ₫',
      tag: 'Thu cũ trợ giá đến 4.000.000đ',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1000&auto=format&fit=crop&q=80',
      bgColor: 'from-slate-950 via-indigo-950 to-slate-900',
      accentGlow: 'from-indigo-500/30 to-violet-500/20',
      link: '/product/1',
    },
    {
      title: 'Galaxy S24 Ultra - Kỷ Nguyên Galaxy AI',
      subtitle: 'Khoanh tròn tìm kiếm đa năng • Phiên dịch cuộc gọi trực tiếp 16 ngôn ngữ tức thì',
      badge: 'MỞ BÁN CHÍNH THỨC',
      price: 'Từ 26.990.000 ₫',
      oldPrice: '31.990.000 ₫',
      tag: 'Tặng củ sạc 45W & Bao da chính hãng',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=1000&auto=format&fit=crop&q=80',
      bgColor: 'from-slate-950 via-slate-900 to-indigo-950',
      accentGlow: 'from-blue-500/30 to-indigo-500/20',
      link: '/product/3',
    },
    {
      title: 'MacBook Pro 16 M3 Max - Cỗ Máy Cho AI',
      subtitle: '36GB Unified Memory • GPU 30 lõi • Xử lý mô hình ngôn ngữ lớn (LLM) mượt mà',
      badge: 'HIỆU NĂNG VƯỢT TRỘI',
      price: 'Từ 68.990.000 ₫',
      oldPrice: '74.990.000 ₫',
      tag: 'Hỗ trợ trả góp 0% qua thẻ',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&auto=format&fit=crop&q=80',
      bgColor: 'from-slate-900 via-purple-950 to-slate-950',
      accentGlow: 'from-purple-500/30 to-violet-500/20',
      link: '/product/2',
    },
  ];

  // Auto carousel rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Flash sale countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 2, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter flash sale products
  const flashSaleProducts = PRODUCTS.filter((p) => {
    if (flashSaleCategory === 'all') return true;
    return p.category === flashSaleCategory;
  }).slice(0, 4);

  // Mega Menu Flyout Data matching Image 2 reference (CellphoneS style)
  const megaMenuData = {
    'laptop': {
      title: 'Laptop & Máy tính',
      allLink: '/products?category=laptop',
      columns: [
        {
          sections: [
            {
              title: 'Thương hiệu',
              type: 'brands',
              items: [
                { name: 'Apple', label: 'MacBook' },
                { name: 'Asus', label: 'ASUS' },
                { name: 'Lenovo', label: 'Lenovo' },
                { name: 'Dell', label: 'DELL' },
                { name: 'HP', label: 'HP' },
                { name: 'Acer', label: 'acer' },
                { name: 'LG', label: 'LG' },
                { name: 'MSI', label: 'msi' },
                { name: 'Gigabyte', label: 'GIGABYTE' },
                { name: 'Microsoft', label: 'Surface' },
                { name: 'Masstel', label: 'Masstel' },
                { name: 'Samsung', label: 'SAMSUNG' },
              ],
            },
            {
              title: 'Phân khúc giá',
              type: 'prices',
              items: [
                { id: 'under10', label: 'Dưới 10 triệu' },
                { id: '10to15', label: 'Từ 10 - 15 triệu' },
                { id: '15to20', label: 'Từ 15 - 20 triệu' },
                { id: '20to25', label: 'Từ 20 - 25 triệu' },
                { id: '25to30', label: 'Từ 25 - 30 triệu' },
                { id: 'above30', label: 'Trên 30 triệu' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Nhu cầu sử dụng',
              type: 'needs',
              items: [
                { name: 'Văn phòng', icon: '💻', search: 'Văn phòng' },
                { name: 'Gaming', icon: '🎮', search: 'Gaming', badge: 'Hot' },
                { name: 'Mỏng nhẹ', icon: '💻', search: 'Mỏng nhẹ' },
                { name: 'Đồ họa - kỹ thuật', icon: '🎨', search: 'Đồ họa' },
                { name: 'Sinh viên', icon: '🎓', search: 'Sinh viên' },
                { name: 'Cảm ứng', icon: '📱', search: 'Cảm ứng' },
                { name: 'Laptop AI', icon: '🤖', search: 'AI', badge: 'Hot' },
                { name: 'Mac CTO - Nâng cấp', icon: '⚙️', search: 'MacBook' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Dòng chip',
              type: 'chips',
              items: [
                { name: 'Laptop Core i3', search: 'Core i3' },
                { name: 'Laptop Core i5', search: 'Core i5' },
                { name: 'Laptop Core i7', search: 'Core i7' },
                { name: 'Laptop Core i9', search: 'Core i9' },
                { name: 'Laptop Core Ultra', search: 'Core Ultra', badge: 'Hot' },
                { name: 'Apple M3 Series', search: 'M3' },
                { name: 'Apple M4 Series', search: 'M4', badge: 'Mới' },
                { name: 'AMD Ryzen', search: 'Ryzen' },
                { name: 'Snapdragon X', search: 'Snapdragon', badge: 'Mới' },
              ],
            },
            {
              title: 'Kích thước màn hình',
              type: 'chips',
              items: [
                { name: 'Laptop 13 inch', search: '13 inch' },
                { name: 'Laptop 14 inch', search: '14 inch' },
                { name: 'Laptop 15.6 inch', search: '15.6 inch' },
                { name: 'Laptop 16 inch', search: '16 inch' },
              ],
            },
          ],
        },
      ],
    },
    'dien-thoai': {
      title: 'Điện thoại & Tablet',
      allLink: '/products?category=dien-thoai',
      columns: [
        {
          sections: [
            {
              title: 'Thương hiệu',
              type: 'brands',
              items: [
                { name: 'Apple', label: 'iPhone' },
                { name: 'Samsung', label: 'Samsung' },
                { name: 'Xiaomi', label: 'Xiaomi' },
                { name: 'Apple', label: 'iPad Pro', search: 'iPad' },
                { name: 'Samsung', label: 'Galaxy Tab', search: 'Tab' },
                { name: 'Asus', label: 'ROG Phone' },
                { name: 'OPPO', label: 'OPPO' },
                { name: 'vivo', label: 'vivo' },
                { name: 'realme', label: 'realme' },
              ],
            },
            {
              title: 'Phân khúc giá',
              type: 'prices',
              items: [
                { id: 'under5', label: 'Dưới 5 triệu' },
                { id: '5to10', label: 'Từ 5 - 10 triệu' },
                { id: '10to15', label: 'Từ 10 - 15 triệu' },
                { id: '15to20', label: 'Từ 15 - 20 triệu' },
                { id: 'above20', label: 'Trên 20 triệu' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Nhu cầu sử dụng',
              type: 'needs',
              items: [
                { name: 'Chơi game cấu hình cao', icon: '🎮', search: 'Gaming', badge: 'Hot' },
                { name: 'Chụp ảnh - Quay phim đẹp', icon: '📸', search: 'Camera' },
                { name: 'Pin khủng trên 5000mAh', icon: '🔋', search: 'Pin' },
                { name: 'Màn hình gập Flex', icon: '📱', search: 'Fold', badge: 'Hot' },
                { name: 'Nhỏ gọn thời thượng', icon: '💎', search: 'Nhỏ gọn' },
                { name: 'Điện thoại Galaxy AI', icon: '🤖', search: 'AI', badge: 'Hot' },
                { name: 'Tablet học tập & vẽ', icon: '✏️', search: 'iPad' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Dòng chip & Vi xử lý',
              type: 'chips',
              items: [
                { name: 'Apple A18 Pro', search: 'A18', badge: 'Mới' },
                { name: 'Apple A17 Pro', search: 'A17' },
                { name: 'Snapdragon 8 Gen 3', search: 'Snapdragon', badge: 'Hot' },
                { name: 'Chip Apple M4', search: 'M4', badge: 'Mới' },
                { name: 'Dimensity 9300', search: 'Dimensity' },
              ],
            },
            {
              title: 'Dòng máy HOT nhất',
              type: 'chips',
              items: [
                { name: 'iPhone 15 Pro Max', search: 'iPhone 15', badge: 'Hot' },
                { name: 'Galaxy S24 Ultra', search: 'S24 Ultra', badge: 'Hot' },
                { name: 'iPad Pro M4 OLED', search: 'iPad Pro', badge: 'Mới' },
                { name: 'Galaxy Z Fold 5', search: 'Z Fold', badge: 'Mới' },
              ],
            },
          ],
        },
      ],
    },
    'am-thanh': {
      title: 'Tai nghe & Âm thanh',
      allLink: '/products?category=am-thanh',
      columns: [
        {
          sections: [
            {
              title: 'Thương hiệu',
              type: 'brands',
              items: [
                { name: 'Apple', label: 'AirPods' },
                { name: 'Sony', label: 'Sony' },
                { name: 'Marshall', label: 'Marshall' },
                { name: 'JBL', label: 'JBL' },
                { name: 'Bose', label: 'Bose' },
                { name: 'Rode', label: 'RODE' },
                { name: 'Sennheiser', label: 'Sennheiser' },
                { name: 'Beats', label: 'Beats' },
                { name: 'Soundpeats', label: 'Soundpeats' },
              ],
            },
            {
              title: 'Phân khúc giá',
              type: 'prices',
              items: [
                { id: 'under1m', label: 'Dưới 1 triệu' },
                { id: '1to3m', label: 'Từ 1 - 3 triệu' },
                { id: '3to5m', label: 'Từ 3 - 5 triệu' },
                { id: '5to10', label: 'Từ 5 - 10 triệu' },
                { id: 'above30', label: 'Trên 10 triệu' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Thể loại âm thanh',
              type: 'needs',
              items: [
                { name: 'Tai nghe True Wireless', icon: '🎧', search: 'AirPods', badge: 'Hot' },
                { name: 'Tai nghe Chụp tai (Over-ear)', icon: '🎧', search: 'WH-1000XM5' },
                { name: 'Loa Bluetooth di động', icon: '🔊', search: 'JBL', badge: 'Hot' },
                { name: 'Micro thu âm không dây', icon: '🎙️', search: 'Micro', badge: 'Mới' },
                { name: 'Tai nghe thể thao kháng nước', icon: '🏃', search: 'Chống nước' },
                { name: 'Loa Vintage Decor phòng', icon: '📻', search: 'Marshall' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Tính năng nổi bật',
              type: 'chips',
              items: [
                { name: 'Chống ồn chủ động ANC', search: 'Chống ồn', badge: 'Hot' },
                { name: 'Spatial Audio 360°', search: 'Âm thanh không gian' },
                { name: 'Pin trâu trên 30 giờ', search: 'Pin' },
                { name: 'Kháng nước chuẩn IP67', search: 'IP67' },
                { name: 'Thu âm 32-bit Float', search: '32-bit', badge: 'Mới' },
              ],
            },
            {
              title: 'Sản phẩm nổi bật',
              type: 'chips',
              items: [
                { name: 'AirPods Pro 2 USB-C', search: 'AirPods Pro', badge: 'Hot' },
                { name: 'Sony WH-1000XM5', search: 'Sony', badge: 'Top' },
                { name: 'JBL Charge 5', search: 'JBL', badge: 'Hot' },
                { name: 'Bose QC Ultra', search: 'Bose', badge: 'Mới' },
              ],
            },
          ],
        },
      ],
    },
    'dong-ho': {
      title: 'Đồng hồ & Camera',
      allLink: '/products?category=dong-ho',
      columns: [
        {
          sections: [
            {
              title: 'Thương hiệu',
              type: 'brands',
              items: [
                { name: 'Apple', label: 'Apple Watch' },
                { name: 'Samsung', label: 'Galaxy Watch' },
                { name: 'Garmin', label: 'Garmin' },
                { name: 'Huawei', label: 'Huawei' },
                { name: 'GoPro', label: 'GoPro' },
                { name: 'Xiaomi', label: 'Xiaomi Band' },
                { name: 'Sony', label: 'Sony Alpha' },
                { name: 'Amazfit', label: 'Amazfit' },
              ],
            },
            {
              title: 'Phân khúc giá',
              type: 'prices',
              items: [
                { id: 'under5', label: 'Dưới 5 triệu' },
                { id: '5to10', label: 'Từ 5 - 10 triệu' },
                { id: '10to15', label: 'Từ 10 - 15 triệu' },
                { id: 'above20', label: 'Trên 20 triệu' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Nhu cầu & Tính năng',
              type: 'needs',
              items: [
                { name: 'Thể thao chuyên sâu & GPS', icon: '🏃', search: 'Garmin', badge: 'Hot' },
                { name: 'Đo điện tâm đồ ECG & Tim mạch', icon: '❤️', search: 'ECG' },
                { name: 'Thời lượng pin 14 ngày', icon: '🔋', search: 'Huawei', badge: 'Hot' },
                { name: 'Quay video 5.3K chống rung', icon: '📹', search: 'GoPro', badge: 'Mới' },
                { name: 'Thời trang dây da sang trọng', icon: '👔', search: 'Dây da' },
                { name: 'Viền xoay bezel vật lý', icon: '⚙️', search: 'Classic' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Dòng sản phẩm HOT',
              type: 'chips',
              items: [
                { name: 'Apple Watch Ultra 2', search: 'Ultra', badge: 'Hot' },
                { name: 'Galaxy Watch 6 Classic', search: 'Classic' },
                { name: 'Garmin Fenix 7 Pro', search: 'Fenix', badge: 'Top' },
                { name: 'GoPro Hero 12 Black', search: 'Hero 12', badge: 'Mới' },
                { name: 'Huawei Watch GT 4', search: 'Watch GT' },
              ],
            },
          ],
        },
      ],
    },
    'phu-kien': {
      title: 'PC, Màn hình & Phụ kiện',
      allLink: '/products?category=phu-kien',
      columns: [
        {
          sections: [
            {
              title: 'Thương hiệu',
              type: 'brands',
              items: [
                { name: 'Dell', label: 'Dell UltraSharp' },
                { name: 'Asus', label: 'ASUS ROG' },
                { name: 'Keychron', label: 'Keychron' },
                { name: 'Logitech', label: 'Logitech G' },
                { name: 'Anker', label: 'Anker GaN' },
                { name: 'LG', label: 'LG UltraGear' },
                { name: 'Baseus', label: 'Baseus' },
                { name: 'Corsair', label: 'Corsair' },
              ],
            },
            {
              title: 'Phân khúc giá',
              type: 'prices',
              items: [
                { id: 'under1m', label: 'Dưới 1 triệu' },
                { id: '1to3m', label: 'Từ 1 - 3 triệu' },
                { id: '3to5m', label: 'Từ 3 - 5 triệu' },
                { id: '5to10', label: 'Từ 5 - 10 triệu' },
                { id: 'above20', label: 'Trên 10 triệu' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Phân loại thiết bị',
              type: 'needs',
              items: [
                { name: 'Màn hình đồ họa chuẩn màu 2K', icon: '🖥️', search: 'UltraSharp', badge: 'Hot' },
                { name: 'Màn hình Gaming OLED 240Hz', icon: '⚡', search: 'OLED', badge: 'Mới' },
                { name: 'Bàn phím cơ Custom nhôm CNC', icon: '⌨️', search: 'Keychron', badge: 'Hot' },
                { name: 'Chuột Gaming siêu nhẹ 60g', icon: '🖱️', search: 'Logitech' },
                { name: 'Củ sạc nhanh GaN 67W', icon: '🔌', search: 'Anker', badge: 'Mới' },
                { name: 'Pin sạc không dây MagSafe', icon: '🔋', search: 'Sạc' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Góc setup nổi bật',
              type: 'chips',
              items: [
                { name: 'Dell U2724D 120Hz', search: 'U2724D', badge: 'Top' },
                { name: 'ROG OLED 240Hz 0.03ms', search: 'PG27AQDM', badge: 'Mới' },
                { name: 'Keychron Q1 Pro Nhôm', search: 'Keychron', badge: 'Hot' },
                { name: 'Logitech Superlight 2', search: 'Superlight' },
                { name: 'Anker Prime GaN 67W', search: 'Anker Prime' },
              ],
            },
          ],
        },
      ],
    },
    'gia-dung': {
      title: 'Đồ gia dụng & Smart Home',
      allLink: '/products?category=gia-dung',
      columns: [
        {
          sections: [
            {
              title: 'Thương hiệu',
              type: 'brands',
              items: [
                { name: 'Dreame', label: 'Dreame' },
                { name: 'Xiaomi', label: 'Xiaomi' },
                { name: 'Dyson', label: 'Dyson' },
                { name: 'Ecovacs', label: 'Ecovacs' },
                { name: 'Philips', label: 'Philips' },
                { name: 'Lock&Lock', label: 'Lock&Lock' },
              ],
            },
            {
              title: 'Phân khúc giá',
              type: 'prices',
              items: [
                { id: 'under5', label: 'Dưới 5 triệu' },
                { id: '5to10', label: 'Từ 5 - 10 triệu' },
                { id: '10to15', label: 'Từ 10 - 15 triệu' },
                { id: 'above20', label: 'Trên 15 triệu' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Thiết bị thông minh',
              type: 'needs',
              items: [
                { name: 'Robot hút bụi tự giặt sấy giẻ', icon: '🤖', search: 'Robot', badge: 'Hot' },
                { name: 'Máy lọc không khí diệt khuẩn', icon: '💨', search: 'Lọc không khí' },
                { name: 'Nồi chiên không dầu điện tử', icon: '🍳', search: 'Nồi chiên' },
                { name: 'Khóa cửa vân tay thông minh', icon: '🔐', search: 'Khóa cửa' },
                { name: 'Đèn bàn bảo vệ thị lực', icon: '💡', search: 'Đèn bàn' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Sản phẩm tiêu biểu',
              type: 'chips',
              items: [
                { name: 'Dreame L20 Ultra Giặt Sấy', search: 'Dreame', badge: 'Hot' },
                { name: 'Xiaomi Air Purifier 4', search: 'Xiaomi' },
                { name: 'Máy hút bụi không dây', search: 'Hút bụi' },
              ],
            },
          ],
        },
      ],
    },
    'thu-cu': {
      title: 'Thu cũ đổi mới trợ giá 4tr',
      allLink: '/thu-cu-doi-moi',
      columns: [
        {
          sections: [
            {
              title: 'Trợ giá lên đời HOT',
              type: 'needs',
              items: [
                { name: 'Lên đời iPhone 15/16 - Trợ giá 4.000.000đ', icon: '📱', link: '/thu-cu-doi-moi', badge: 'Hot' },
                { name: 'Lên đời Galaxy S24 Ultra - Trợ giá 3.000.000đ', icon: '📱', link: '/thu-cu-doi-moi', badge: 'Hot' },
                { name: 'Lên đời MacBook M3 - Trợ giá 5.000.000đ', icon: '💻', link: '/thu-cu-doi-moi', badge: 'Mới' },
                { name: 'Lên đời Apple Watch Ultra - Trợ giá 1.500.000đ', icon: '⌚', link: '/thu-cu-doi-moi' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Quy trình thu cũ 3 bước',
              type: 'needs',
              items: [
                { name: '1. Định giá online 2 phút', icon: '⏱️', link: '/thu-cu-doi-moi' },
                { name: '2. Kiểm tra máy tận nhà miễn phí', icon: '🏡', link: '/thu-cu-doi-moi' },
                { name: '3. Trừ thẳng tiền vào máy mới', icon: '💰', link: '/thu-cu-doi-moi' },
                { name: 'Máy cấn trầy xước vẫn thu', icon: '✅', link: '/thu-cu-doi-moi' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Dòng máy thu đổi nhiều nhất',
              type: 'chips',
              items: [
                { name: 'Thu iPhone 11/12/13/14', link: '/thu-cu-doi-moi' },
                { name: 'Thu Galaxy S20/S21/S22/S23', link: '/thu-cu-doi-moi' },
                { name: 'Thu MacBook Air/Pro M1/M2', link: '/thu-cu-doi-moi' },
                { name: 'Thu Apple Watch Series 5/6/7', link: '/thu-cu-doi-moi' },
              ],
            },
          ],
        },
      ],
    },
    'khuyen-mai': {
      title: 'Khuyến mãi & Xả kho',
      allLink: '/khuyen-mai',
      columns: [
        {
          sections: [
            {
              title: 'Ưu đãi thanh toán',
              type: 'needs',
              items: [
                { name: 'Giảm 500K qua VietQR / VNPAY', icon: '💳', link: '/khuyen-mai', badge: 'Hot' },
                { name: 'Trả góp 0% lãi suất duyệt 5 phút', icon: '⚡', link: '/khuyen-mai' },
                { name: 'Miễn phí giao hàng hỏa tốc 2H', icon: '🚚', link: '/khuyen-mai' },
                { name: 'Voucher chào mừng giảm 50K', icon: '🎁', link: '/khuyen-mai' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Hàng Like New 99% giá rẻ',
              type: 'chips',
              items: [
                { name: 'iPhone Like New 99% Bảo hành 12T', search: 'iPhone', badge: 'Hot' },
                { name: 'MacBook Trôi Bảo Hành Full Box', search: 'MacBook', badge: 'Mới' },
                { name: 'iPad Like New Pin 100%', search: 'iPad' },
                { name: 'Tai nghe Sony XM5 Like New', search: 'Sony' },
              ],
            },
          ],
        },
        {
          sections: [
            {
              title: 'Flash Sale giờ vàng',
              type: 'chips',
              items: [
                { name: 'Giảm đến 50% phụ kiện Anker', search: 'Anker', badge: 'Hot' },
                { name: 'Bàn phím Keychron giảm 500K', search: 'Keychron' },
                { name: 'Màn hình Dell UltraSharp quà 1Tr', search: 'Dell' },
              ],
            },
          ],
        },
      ],
    },
  };

  const sidebarCategories = [
    { name: 'Điện thoại, Tablet', slug: 'dien-thoai', icon: Smartphone, highlight: 'iPhone 15, S24, iPad' },
    { name: 'Laptop', slug: 'laptop', icon: Laptop, highlight: 'MacBook M3, Dell, ROG' },
    { name: 'Âm thanh, Mic thu âm', slug: 'am-thanh', icon: Headphones, highlight: 'AirPods, Sony XM5, JBL' },
    { name: 'Đồng hồ, Camera', slug: 'dong-ho', icon: Watch, highlight: 'Apple Watch, Garmin, GoPro' },
    { name: 'PC, Màn hình, Phụ kiện', slug: 'phu-kien', icon: Monitor, highlight: 'UltraSharp, Keychron, Anker' },
    { name: 'Đồ gia dụng, Smart Home', slug: 'gia-dung', icon: Home, highlight: 'Robot Dreame, Lọc khí' },
    { name: 'Thu cũ đổi mới trợ giá 4tr', slug: 'thu-cu', icon: RotateCcw, highlight: 'Định giá nhanh 2 phút' },
    { name: 'Khuyến mãi & Xả kho', slug: 'khuyen-mai', icon: Flame, highlight: 'Giảm tới 50%, Trả góp 0%' },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-20">
      {/* ================= 1. HERO SECTION WITH FLOATING GRADIENTS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative">
          {/* CỘT 1: Category Sidebar (Khớp phong cách CellphoneS với Mega Menu Flyout) */}
          <div
            className="hidden lg:block lg:col-span-3 relative"
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div className="bg-white rounded-3xl border border-slate-200/80 p-2.5 shadow-sm space-y-0.5 h-full">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Danh mục công nghệ</span>
                <span className="text-[10px] text-slate-400 font-medium">Rà chuột để mở</span>
              </div>
              {sidebarCategories.map((item, idx) => {
                const Icon = item.icon;
                const isHovered = hoveredCategory === item.slug;
                const targetLink =
                  item.slug === 'thu-cu'
                    ? '/thu-cu-doi-moi'
                    : item.slug === 'khuyen-mai'
                    ? '/khuyen-mai'
                    : `/products?category=${item.slug}`;

                return (
                  <Link
                    key={idx}
                    to={targetLink}
                    onMouseEnter={() => setHoveredCategory(item.slug)}
                    className={`flex items-center justify-between p-2 rounded-2xl transition-all group ${
                      isHovered
                        ? 'bg-rose-50/80 border border-rose-200/80 text-rose-600 shadow-2xs'
                        : 'hover:bg-slate-50 text-slate-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center transition-colors ${
                          isHovered
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-bold transition-colors ${
                            isHovered ? 'text-rose-600' : 'text-slate-900 group-hover:text-indigo-600'
                          }`}
                        >
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[130px]">
                          {item.highlight}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-all ${
                        isHovered
                          ? 'text-rose-600 translate-x-1 font-bold'
                          : 'text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5'
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Mega Menu Flyout Panel (Xuất hiện khi di chuột qua danh mục như ảnh mẫu bên phải) */}
            <AnimatePresence>
              {hoveredCategory && megaMenuData[hoveredCategory] && (
                <motion.div
                  key={hoveredCategory}
                  initial={{ opacity: 0, x: -8, scale: 0.99 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8, scale: 0.99 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="absolute left-[calc(100%+10px)] top-0 z-50 w-[780px] xl:w-[860px] min-h-[460px] max-h-[540px] overflow-y-auto bg-white/98 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-2xl p-6 before:absolute before:-left-3 before:top-0 before:bottom-0 before:w-3 before:content-['']"
                >
                  {/* Flyout Header */}
                  <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {megaMenuData[hoveredCategory].title}
                      </h3>
                    </div>
                    <Link
                      to={megaMenuData[hoveredCategory].allLink}
                      onClick={() => setHoveredCategory(null)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline group"
                    >
                      <span>Xem tất cả {megaMenuData[hoveredCategory].title}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Flyout Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
                    {megaMenuData[hoveredCategory].columns.map((col, colIdx) => (
                      <div key={colIdx} className="space-y-4">
                        {col.sections.map((section, secIdx) => (
                          <div key={secIdx} className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                              {section.title}
                            </h4>

                            {/* Section Brands: 3-column white boxes with clean borders */}
                            {section.type === 'brands' && (
                              <div className="grid grid-cols-3 gap-1.5">
                                {section.items.map((b, bIdx) => (
                                  <Link
                                    key={bIdx}
                                    to={
                                      b.search
                                        ? `/products?category=${hoveredCategory}&search=${encodeURIComponent(b.search)}`
                                        : `/products?category=${hoveredCategory}&brand=${encodeURIComponent(b.name)}`
                                    }
                                    onClick={() => setHoveredCategory(null)}
                                    className="h-9 px-2 rounded-xl border border-slate-200/90 bg-white hover:border-rose-500 hover:text-rose-600 flex items-center justify-center text-xs font-bold text-slate-800 shadow-2xs hover:shadow-xs transition-all text-center truncate"
                                  >
                                    {b.label || b.name}
                                  </Link>
                                ))}
                              </div>
                            )}

                            {/* Section Prices: 2-column rounded cards */}
                            {section.type === 'prices' && (
                              <div className="grid grid-cols-2 gap-1.5">
                                {section.items.map((p, pIdx) => (
                                  <Link
                                    key={pIdx}
                                    to={
                                      hoveredCategory === 'thu-cu' || hoveredCategory === 'khuyen-mai'
                                        ? `/products?price=${p.id}`
                                        : `/products?category=${hoveredCategory}&price=${p.id}`
                                    }
                                    onClick={() => setHoveredCategory(null)}
                                    className="px-2.5 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:border-rose-500 hover:text-rose-600 text-[11px] font-semibold text-slate-700 text-center transition-all shadow-2xs"
                                  >
                                    {p.label}
                                  </Link>
                                ))}
                              </div>
                            )}

                            {/* Section Needs (Nhu cầu sử dụng): cards with icons & badges */}
                            {section.type === 'needs' && (
                              <div className="space-y-1.5">
                                {section.items.map((n, nIdx) => {
                                  const targetLink = n.link
                                    ? n.link
                                    : n.search
                                    ? `/products?category=${hoveredCategory}&search=${encodeURIComponent(n.search)}`
                                    : hoveredCategory === 'thu-cu'
                                    ? '/thu-cu-doi-moi'
                                    : hoveredCategory === 'khuyen-mai'
                                    ? '/khuyen-mai'
                                    : `/products?category=${hoveredCategory}`;

                                  return (
                                    <Link
                                      key={nIdx}
                                      to={targetLink}
                                      onClick={() => setHoveredCategory(null)}
                                      className="p-2 rounded-xl border border-slate-200/90 bg-white hover:border-rose-500 hover:text-rose-600 flex items-center gap-2 text-[11px] font-semibold text-slate-700 transition-all shadow-2xs group"
                                    >
                                      <span className="text-sm shrink-0">{n.icon}</span>
                                      <span className="truncate group-hover:text-rose-600">{n.name}</span>
                                      {n.badge && (
                                        <span className="text-[9px] px-1.5 py-0.5 bg-rose-500 text-white font-bold rounded-md ml-auto shrink-0 shadow-xs">
                                          {n.badge}
                                        </span>
                                      )}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}

                            {/* Section Chips & Screen sizes: 2-column or badge buttons */}
                            {section.type === 'chips' && (
                              <div className="grid grid-cols-2 gap-1.5">
                                {section.items.map((c, cIdx) => {
                                  const targetLink = c.link
                                    ? c.link
                                    : c.search
                                    ? `/products?category=${hoveredCategory}&search=${encodeURIComponent(c.search)}`
                                    : hoveredCategory === 'thu-cu'
                                    ? '/thu-cu-doi-moi'
                                    : hoveredCategory === 'khuyen-mai'
                                    ? '/khuyen-mai'
                                    : `/products?category=${hoveredCategory}`;

                                  return (
                                    <Link
                                      key={cIdx}
                                      to={targetLink}
                                      onClick={() => setHoveredCategory(null)}
                                      className="px-2 py-1.5 rounded-xl border border-slate-200/90 bg-white hover:border-rose-500 hover:text-rose-600 text-[11px] font-semibold text-slate-700 flex items-center justify-between transition-all shadow-2xs group"
                                    >
                                      <span className="truncate group-hover:text-rose-600">{c.name}</span>
                                      {c.badge && (
                                        <span
                                          className={`text-[9px] px-1 py-0.2 rounded-md font-bold text-white ml-1 shrink-0 ${
                                            c.badge === 'Hot' ? 'bg-rose-500' : 'bg-red-600'
                                          }`}
                                        >
                                          {c.badge}
                                        </span>
                                      )}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CỘT 2: Main Banner Carousel with MotionSites Style */}
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-xl shadow-slate-900/10 flex flex-col justify-between min-h-[340px] sm:min-h-[400px] border border-slate-800">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5 }}
                className={`absolute inset-0 bg-gradient-to-r ${heroSlides[currentSlide].bgColor}`}
              >
                {/* Floating ambient glow */}
                <div
                  className={`absolute -top-10 -right-10 w-80 h-80 rounded-full bg-gradient-to-br ${heroSlides[currentSlide].accentGlow} blur-3xl pointer-events-none`}
                />

                <div className="relative h-full p-6 sm:p-8 flex flex-col justify-between text-white z-10">
                  {/* Top slide badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black text-[10px] sm:text-xs px-3 py-1 rounded-full shadow-md shadow-indigo-500/30">
                      {heroSlides[currentSlide].badge}
                    </span>
                    <span className="text-[11px] font-medium text-slate-300 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                      {heroSlides[currentSlide].tag}
                    </span>
                  </div>

                  {/* Center slide text */}
                  <div className="space-y-2.5 max-w-sm pt-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                      {heroSlides[currentSlide].title}
                    </h2>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {heroSlides[currentSlide].subtitle}
                    </p>
                    <div className="pt-2 flex items-baseline gap-2.5">
                      <span className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                        {heroSlides[currentSlide].price}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        {heroSlides[currentSlide].oldPrice}
                      </span>
                    </div>
                  </div>

                  {/* Bottom slide CTA */}
                  <div className="pt-4 flex items-center justify-between">
                    <Link
                      to={heroSlides[currentSlide].link}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 hover:bg-indigo-600 hover:text-white rounded-full text-xs font-bold transition-all shadow-md group"
                    >
                      <span>Xem chi tiết & Mua ngay</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Floating product preview image with soft motion */}
                  <motion.div
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="absolute right-6 bottom-6 w-36 sm:w-44 aspect-square rounded-2xl overflow-hidden border border-white/20 shadow-2xl hidden sm:block backdrop-blur-sm"
                  >
                    <img
                      src={heroSlides[currentSlide].image}
                      alt={heroSlides[currentSlide].title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel navigation controls */}
            <div className="absolute bottom-4 left-6 z-20 flex items-center gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* CỘT 3: 3 Banners Phụ Khuyến Mãi (Modern Tech Card Style) */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5">
            {/* Banner 1: Thu cũ đổi mới */}
            <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Link
                to="/thu-cu-doi-moi"
                className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between border border-slate-800 shadow-sm hover:border-indigo-500/50 transition-all group block"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                    Thu cũ đổi mới
                  </span>
                  <p className="text-xs font-extrabold leading-tight pt-1">Trợ giá lên đời đến 4 triệu</p>
                  <p className="text-[10px] text-slate-400">Định giá máy AI trong 2 phút</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <RotateCcw className="w-5 h-5" />
                </div>
              </Link>
            </motion.div>

            {/* Banner 2: Mở bán Galaxy AI */}
            <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Link
                to="/product/3"
                className="p-4 rounded-3xl bg-gradient-to-r from-indigo-950 via-violet-950 to-slate-900 text-white flex items-center justify-between border border-slate-800 shadow-sm hover:border-violet-500/50 transition-all group block"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-400/30 px-2 py-0.5 rounded-full">
                    Kỷ nguyên AI
                  </span>
                  <p className="text-xs font-extrabold leading-tight pt-1">Galaxy S24 Series</p>
                  <p className="text-[10px] text-slate-400">Tặng thêm voucher 1.000.000 ₫</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
              </Link>
            </motion.div>

            {/* Banner 3: Thanh toán VietQR */}
            <motion.div whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }}>
              <Link
                to="/khuyen-mai"
                className="p-4 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border border-slate-800 shadow-sm hover:border-emerald-500/50 transition-all group block"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                    Ưu đãi thanh toán
                  </span>
                  <p className="text-xs font-extrabold leading-tight pt-1">VietQR / MoMo giảm 500k</p>
                  <p className="text-[10px] text-slate-400">Áp dụng cho đơn từ 10 triệu</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-5 h-5" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= 2. 4 CAM KẾT VÀNG (Sleek Modern Trust Bar) ================= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3.5 shadow-2xs hover:border-indigo-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">100% Chính hãng</p>
              <p className="text-[10px] text-slate-500">Bảo hành 12-24 tháng ủy quyền</p>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3.5 shadow-2xs hover:border-indigo-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Giao siêu tốc 2H</p>
              <p className="text-[10px] text-slate-500">Miễn phí giao hàng đơn từ 500k</p>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3.5 shadow-2xs hover:border-indigo-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">1 Đổi 1 trong 30 ngày</p>
              <p className="text-[10px] text-slate-500">Nếu phát sinh lỗi từ nhà sản xuất</p>
            </div>
          </div>

          <div className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3.5 shadow-2xs hover:border-indigo-200 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Trả góp 0% lãi suất</p>
              <p className="text-[10px] text-slate-500">Duyệt nhanh 5 phút qua CCCD/Thẻ</p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ================= 3. FLASH SALE GIỜ VÀNG (SaaS Modern Tech Glow) ================= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 space-y-6 border border-slate-800 relative overflow-hidden">
          {/* Ambient Lighting */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header Flash Sale */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Flame className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    Giờ Vàng Giá Sốc
                  </h2>
                  <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                    FLASH SALE
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Số lượng có hạn • Cập nhật giá sốc mỗi ngày</p>
              </div>
            </div>

            {/* Countdown timer with refined pill look */}
            <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Timer className="w-4 h-4 text-indigo-400" /> Kết thúc sau:
              </span>
              <div className="flex items-center gap-1 font-mono font-black text-sm">
                <span className="bg-white text-slate-900 px-2 py-0.5 rounded-lg shadow-xs">
                  {timeLeft.hours < 10 ? `0${timeLeft.hours}` : timeLeft.hours}
                </span>
                <span className="text-indigo-400 font-bold">:</span>
                <span className="bg-white text-slate-900 px-2 py-0.5 rounded-lg shadow-xs">
                  {timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes}
                </span>
                <span className="text-indigo-400 font-bold">:</span>
                <span className="bg-white text-slate-900 px-2 py-0.5 rounded-lg shadow-xs">
                  {timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}
                </span>
              </div>
            </div>
          </div>

          {/* Flash sale category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none relative z-10">
            {[
              { id: 'all', name: '🔥 Tất cả giá sốc' },
              { id: 'dien-thoai', name: '📱 Điện thoại' },
              { id: 'laptop', name: '💻 Laptop' },
              { id: 'am-thanh', name: '🎧 Tai nghe' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFlashSaleCategory(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  flashSaleCategory === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Flash Sale Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {flashSaleProducts.map((p, idx) => (
              <ProductCard
                key={p.id}
                product={p}
                isFlashSale={true}
                soldCount={75 + idx * 6}
              />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ================= 4. DANH MỤC NỔI BẬT (Scroll-driven reveal) ================= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Danh mục nổi bật
            </h2>
            <p className="text-xs text-slate-500">Khám phá các ngành hàng thiết bị công nghệ hiện đại</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>Xem tất cả danh mục</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.filter((c) => c.slug !== 'all').map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            >
              <Link
                to={`/products?category=${cat.slug}`}
                className="p-5 bg-white border border-slate-200/80 hover:border-indigo-300 rounded-3xl shadow-2xs hover:shadow-lg hover:shadow-indigo-500/5 transition-all text-center space-y-3 group block"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-indigo-50 text-slate-700 group-hover:text-indigo-600 flex items-center justify-center mx-auto transition-colors">
                  {cat.slug === 'dien-thoai' && <Smartphone className="w-6 h-6" />}
                  {cat.slug === 'laptop' && <Laptop className="w-6 h-6" />}
                  {cat.slug === 'am-thanh' && <Headphones className="w-6 h-6" />}
                  {cat.slug === 'dong-ho' && <Watch className="w-6 h-6" />}
                  {cat.slug === 'phu-kien' && <Monitor className="w-6 h-6" />}
                  {cat.slug === 'gia-dung' && <Home className="w-6 h-6" />}
                </div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {cat.name}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ================= 5. HỆ SINH THÁI THƯƠNG HIỆU (APPLE & SAMSUNG GALAXY AI) ================= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Apple Authorized Showcase */}
          <div className="p-7 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-between space-y-5 shadow-xl shadow-slate-900/10 border border-slate-800 relative overflow-hidden">
            <div className="space-y-2.5 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full text-slate-300 border border-white/10">
                Apple Authorised Reseller
              </span>
              <h3 className="text-2xl font-black">Hệ sinh thái Apple Chính Hãng</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Đầy đủ iPhone, MacBook M3, iPad, Apple Watch với chính sách bảo hành ủy quyền chính hãng 1 đổi 1 tiêu chuẩn Apple Care.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2 relative z-10">
              <Link
                to="/products?category=dien-thoai"
                className="px-5 py-2.5 bg-white text-slate-900 hover:bg-indigo-50 rounded-full text-xs font-bold transition-all shadow-md"
              >
                Khám phá iPhone
              </Link>
              <Link
                to="/products?category=laptop"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold border border-white/20 transition-all"
              >
                MacBook M3
              </Link>
            </div>
          </div>

          {/* Samsung Galaxy AI Showcase */}
          <div className="p-7 rounded-3xl bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950 text-white flex flex-col justify-between space-y-5 shadow-xl shadow-indigo-950/10 border border-slate-800 relative overflow-hidden">
            <div className="space-y-2.5 relative z-10">
              <span className="text-[10px] font-black uppercase tracking-wider bg-violet-500/20 text-violet-300 border border-violet-400/30 px-3 py-1 rounded-full">
                Samsung Galaxy AI
              </span>
              <h3 className="text-2xl font-black">Kỷ Nguyên Trí Tuệ Nhân Tạo</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Trải nghiệm tính năng tìm kiếm thông minh khoanh vùng, trợ lý ghi chú AI và camera zoom đêm 100x với Galaxy S24 Ultra.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2 relative z-10">
              <Link
                to="/products?category=dien-thoai"
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 rounded-full text-xs font-bold transition-all shadow-md"
              >
                Mua Galaxy S24
              </Link>
              <button
                onClick={onOpenAiChat}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Hỏi AI tư vấn</span>
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ================= 6. TẤT CẢ SẢN PHẨM GỢI Ý ================= */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sản phẩm đề xuất cho bạn
            </h2>
            <p className="text-xs text-slate-500">Được tối ưu và gợi ý bởi Alibaba Store</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PRODUCTS.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </motion.section>
    </div>
  );
}

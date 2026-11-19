import { Smartphone, Laptop, Headphones, Watch, Monitor, House, Tablet, Camera, Mic, PcCase, Printer, Tv, HeartPulse, Refrigerator, Keyboard, LayoutGrid } from 'lucide-react';

export const categoryIcons = {
  'dien-thoai': Smartphone, laptop: Laptop, 'am-thanh': Headphones,
  'dong-ho': Watch, 'phu-kien': Keyboard, 'gia-dung': House,
  'may-tinh-bang': Tablet, camera: Camera, 'micro-thu-am': Mic,
  pc: PcCase, 'man-hinh': Monitor, 'may-in': Printer, tivi: Tv,
  'suc-khoe-lam-dep': HeartPulse, 'dien-may': Refrigerator,
};
export function categoryIcon(slug) { return categoryIcons[slug] || LayoutGrid; }

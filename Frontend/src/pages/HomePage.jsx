import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PackageCheck, ShoppingBag, Sparkles, Smartphone, Laptop, Headphones, Watch, Monitor, Home, LayoutGrid, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { categoryIcons } from '../data/categoryUi';


export default function HomePage({ onOpenAiChat }) {
 const [version,setVersion]=useState(0);
 const [state,setState]=useState({version:-1,category:'',products:[],categories:[],error:''});
 const [category,setCategory]=useState('all');
 useEffect(()=>{let active=true;Promise.allSettled([productService.getProducts({limit:8,category}),categoryService.getCategories()]).then(([products,categories])=>{if(active)setState({version,category,products:products.status==='fulfilled'?products.value.products:[],categories:categories.status==='fulfilled'?categories.value.filter(c=>c.slug!=='all'&&c.isActive!==false):[],error:products.status==='rejected'?products.reason.message:''});});return()=>{active=false;};},[version,category]);
 const loading=state.version!==version||state.category!==category;
 const products=state.products.slice(0,8);
 const categories=state.categories;
 return <div className="store-home">
  <div className="store-container">
   <section className="store-hero"><div className="store-hero-copy"><p className="store-kicker">THIẾT BỊ TỐT. TRẢI NGHIỆM HAY.</p><h1>Công nghệ mới.<br/><span>Chất sống mới.</span></h1><p>Một chiếc laptop cho ý tưởng lớn. Một chiếc tai nghe cho phút riêng mình. Tìm điều phù hợp với bạn tại Zentro Store.</p><div className="store-hero-actions"><Link className="store-button" to="/products">Khám phá sản phẩm</Link><button className="store-button secondary" onClick={onOpenAiChat}><Sparkles size={16}/>Tư vấn cùng AI</button></div></div><div className="store-hero-image"><img src="/images/storefront/hero-workspace.jpg" alt="Laptop trong không gian làm việc hiện đại" fetchPriority="high"/><div className="store-hero-label"><div><small>LÀM VIỆC THEO CÁCH CỦA BẠN</small><strong>Cảm hứng cho mỗi ngày mới.</strong></div><span><Laptop size={22}/></span></div></div></section>
   <section className="store-benefits" aria-label="Trải nghiệm mua sắm">{[[ShieldCheck,'Thông tin rõ ràng','Lựa chọn trước khi mua'],[PackageCheck,'Theo dõi đơn hàng','Cập nhật từng trạng thái'],[ShoppingBag,'Mua sắm thuận tiện','Quản lý giỏ hàng của bạn'],[Sparkles,'Trợ lý công nghệ','Tư vấn ngay trên website']].map(([Icon,title,description])=><div key={title} className="store-benefit"><Icon/><div><strong>{title}</strong><small>{description}</small></div></div>)}</section>
   <section className="store-section"><div className="store-section-heading"><div><h2>Bạn đang tìm điều gì?</h2><p>Từ làm việc, sáng tạo đến giải trí mỗi ngày.</p></div><Link to="/products">Tất cả danh mục</Link></div>{loading?<p className="store-empty">Đang tải danh mục...</p>:categories.length?<div className="store-category-grid">{categories.map(cat=>{const Icon=categoryIcons[cat.slug]||LayoutGrid;return <Link className="store-category" key={cat.id} to={'/products?category='+encodeURIComponent(cat.slug||cat.id)}><span><Icon/></span><strong>{cat.name}</strong></Link>;})}</div>:<div className="store-empty">Khám phá thiết bị trong <Link to="/products" className="underline">danh mục sản phẩm</Link>.</div>}</section>
   <div className="store-brand-row" aria-label="Thương hiệu công nghệ"><span>Apple</span><span>SAMSUNG</span><span>SONY</span><span>ASUS</span><span>logitech</span></div>
   <section className="store-section"><div className="store-section-heading"><div><h2>Khám phá sản phẩm</h2><p>Thiết bị phù hợp, sẵn sàng cho kế hoạch của bạn.</p></div><Link to="/products">Xem toàn bộ</Link></div><div className="store-product-filters" aria-label="Lọc danh mục sản phẩm"><button className={category==='all'?'is-active':''} aria-pressed={category==='all'} onClick={()=>setCategory('all')}>Tất cả</button>{categories.map(cat=><button key={cat.id} className={category===(cat.slug||String(cat.id))?'is-active':''} aria-pressed={category===(cat.slug||String(cat.id))} onClick={()=>setCategory(cat.slug||String(cat.id))}>{cat.name}</button>)}</div>
    {loading?<div className="store-products-grid" aria-label="Đang tải sản phẩm">{[1,2,3,4].map(i=><div key={i} className="store-loading"/>)}</div>:state.error?<div className="store-empty" role="alert">{state.error}<button onClick={()=>setVersion(v=>v+1)}><RefreshCw size={14} className="inline mr-1"/>Thử lại</button></div>:products.length?<div className="store-products-grid">{products.map(product=><ProductCard key={product.id} product={product}/>)}</div>:<div className="store-empty">Chưa có sản phẩm trong danh mục này. <Link to="/products" className="underline">Xem toàn bộ sản phẩm</Link></div>}
   </section>
   <section className="store-editorial"><article className="store-edit-card"><Laptop aria-hidden="true"/><small>KHÔNG GIAN LÀM VIỆC</small><h3>Nâng cấp thiết bị.<br/>Khơi nguồn ý tưởng.</h3><p>Khám phá laptop cho học tập, làm việc và những dự án tiếp theo.</p><Link to="/products?category=laptop">Khám phá laptop</Link></article><article className="store-edit-card"><Headphones aria-hidden="true"/><small>THẾ GIỚI ÂM THANH</small><h3>Bật nhạc lên.<br/>Tận hưởng phút riêng.</h3><p>Tìm chiếc tai nghe đồng hành trong công việc và những chuyến đi.</p><Link to="/products?category=am-thanh">Khám phá âm thanh</Link></article></section>
  </div>
 </div>;
}

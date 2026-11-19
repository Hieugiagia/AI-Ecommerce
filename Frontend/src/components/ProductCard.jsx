import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
 const {addToCart,cartBusy}=useCart();const navigate=useNavigate();const location=useLocation();
 const [addError,setAddError]=useState('');const [isAdded,setIsAdded]=useState(false);
 async function handleAddToCart(event){event.preventDefault();event.stopPropagation();setAddError('');const result=await addToCart(product);if(result.requiresAuth){navigate('/login',{state:{from:{pathname:location.pathname,search:location.search}}});}else if(result.success){setIsAdded(true);setTimeout(()=>setIsAdded(false),1500);}else setAddError(result.error);}
 const money=value=>new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(value);
 const price=Number(product.price)||0;const original=Number(product.originalPrice)||0;
 const discount=original>price?Math.round((original-price)/original*100):0;
 const image=product.thumbnailUrl||product.image||product.thumbnail_url||'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';
 const out=product.stock===0||product.status==='OUT_OF_STOCK';
 return <article className="store-product-card">
  <Link to={'/product/'+(product.slug||product.id)} className="store-product-main"><div className="store-product-image"><img src={image} alt={product.name} loading="lazy"/>{discount>0&&<span className="store-product-discount">-{discount}%</span>}</div><div className="store-product-info">{product.brand&&<p className="store-product-brand">{product.brand}</p>}<h3>{product.name}</h3><div className="store-product-prices"><strong>{money(price)}</strong>{original>price&&<del>{money(original)}</del>}</div><p className="store-product-stock">{out?'Tạm hết hàng':'Sẵn sàng đặt hàng'}</p></div></Link>
  <div className="store-product-bottom"><button onClick={handleAddToCart} disabled={isAdded||cartBusy||out}>{isAdded?<Check size={16}/>:<ShoppingBag size={16}/>}<span>{isAdded?'Đã thêm vào giỏ':out?'Hết hàng':'Thêm vào giỏ'}</span></button>{addError&&<p role="alert" className="store-product-error">{addError}</p>}</div>
 </article>;
}

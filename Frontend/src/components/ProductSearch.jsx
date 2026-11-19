import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, LoaderCircle, Search, X } from 'lucide-react';
import { productService } from '../services/productService';
import '../styles/product-search.css';

const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
const examples = ['iPhone', 'Samsung', 'Laptop', 'Tai nghe'];
const resultsUrl = query => '/products' + (query ? '?search=' + encodeURIComponent(query) : '');

export default function ProductSearch({ onNavigate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const wrapper = useRef(null);
  const input = useRef(null);
  const listId = useId();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ query: '', products: [], total: 0, loading: false, error: '' });
  const query = term.trim().replace(/\s+/g, ' ');
  const eligible = query.length >= 2;
  const current = result.query === query;
  const products = current ? result.products : [];
  const loading = eligible && (!current || result.loading);
  const visible = open;
  const activeProduct = visible && !loading ? products[activeIndex] : null;

  useEffect(() => {
    setOpen(false); setActiveIndex(-1);
    if (location.pathname === '/products') setTerm(new URLSearchParams(location.search).get('search') || '');
  }, [location.key, location.pathname, location.search]);

  useEffect(() => {
    let active = true;
    if (!eligible) return;
    const timer = setTimeout(async () => {
      setResult({ query, products: [], total: 0, loading: true, error: '' });
      try {
        const data = await productService.getProducts({ q: query, page: 1, limit: 6 });
        if (active) setResult({ query, products: data.products, total: data.total, loading: false, error: '' });
      } catch (error) {
        if (active) setResult({ query, products: [], total: 0, loading: false, error: error.message || 'Không tải được gợi ý.' });
      }
    }, 280);
    return () => { active = false; clearTimeout(timer); };
  }, [query, eligible, retry]);

  useEffect(() => {
    const outside = event => {
      if (!wrapper.current?.contains(event.target)) { setOpen(false); setActiveIndex(-1); }
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);

  function change(value) { setTerm(value); setActiveIndex(-1); setOpen(true); }
  function close() { setOpen(false); setActiveIndex(-1); onNavigate?.(); }
  function submit(event) {
    event.preventDefault(); close(); navigate(resultsUrl(query));
  }
  function keyDown(event) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') { setOpen(false); setActiveIndex(-1); return; }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); setOpen(true);
      if (products.length && !loading) {
        const next = event.key === 'ArrowDown'
          ? (activeIndex + 1) % products.length
          : activeIndex <= 0 ? products.length - 1 : activeIndex - 1;
        setActiveIndex(next);
        document.getElementById(listId + '-' + next)?.scrollIntoView({ block: 'nearest' });
      }
    } else if (event.key === 'Enter' && activeProduct) {
      event.preventDefault(); close(); navigate('/product/' + encodeURIComponent(activeProduct.slug || activeProduct.id));
    }
  }
  return <div className="store-search-wrap" ref={wrapper} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setActiveIndex(-1); }
  }}>
    <form className="store-search" onSubmit={submit} role="search" aria-label="Tìm sản phẩm trong cửa hàng">
      <Search size={19}/>
      <input ref={input} role="combobox" aria-label="Tìm kiếm sản phẩm" aria-autocomplete="list"
        aria-expanded={visible} aria-controls={listId}
        aria-activedescendant={activeProduct ? listId + '-' + activeIndex : undefined}
        autoComplete="off" placeholder="Bạn đang tìm thiết bị gì?" value={term} maxLength={200}
        onChange={event => change(event.target.value)} onFocus={() => setOpen(true)} onKeyDown={keyDown}/>
      {term && <button className="search-clear" type="button" aria-label="Xóa từ khóa tìm kiếm" onClick={() => { change(''); input.current?.focus(); }}><X size={16}/></button>}
      <button type="submit">Tìm kiếm</button>
    </form>
    {visible && <div className="search-suggestions">
      <div className="search-suggestions-heading"><strong>{eligible ? 'Sản phẩm gợi ý' : 'Bạn muốn tìm gì?'}</strong><span>{eligible ? 'Theo từ khóa của bạn' : 'Khám phá Zentro Store'}</span></div>
      {!eligible && <div className="search-suggestions-start"><div>{examples.map(text => <button type="button" key={text} onClick={() => { change(text); input.current?.focus(); }}><Search size={14}/>{text}</button>)}</div></div>}
      {loading && <p className="search-suggestions-status" role="status"><LoaderCircle size={17} className="animate-spin"/>Đang tìm sản phẩm…</p>}
      {eligible && current && !loading && result.error && <div className="search-suggestions-status" role="status"><span>Chưa tải được gợi ý. Bạn có thể thử lại hoặc xem trang kết quả.</span><button type="button" onClick={() => setRetry(value => value + 1)}>Thử lại</button></div>}
      <div id={listId} role="listbox" aria-label="Sản phẩm tìm thấy" aria-busy={loading}>
        {!loading && products.map((product, index) => <Link role="option" aria-selected={activeIndex === index}
          id={listId + '-' + index} className="search-suggestion" key={product.id}
          to={'/product/' + encodeURIComponent(product.slug || product.id)}
          onPointerMove={() => setActiveIndex(index)} onClick={close}>
          <img src={product.image} alt="" loading="lazy" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/zentro-mark.svg'; }}/>
          <span className="search-suggestion-copy"><strong>{product.name}</strong><span>{money(product.price)}<small>{product.stock > 0 ? 'Còn hàng' : 'Tạm hết hàng'}</small></span></span>
          <ArrowUpRight size={17}/>
        </Link>)}
      </div>
      {eligible && current && !loading && !result.error && !products.length && <p className="search-suggestions-status" role="status">Chưa tìm thấy sản phẩm phù hợp. Hãy thử tên ngắn hơn hoặc một từ khóa khác.</p>}
      {eligible && <Link className="search-all-results" to={resultsUrl(query)} onClick={close}>Xem tất cả kết quả{current && !loading && !result.error ? ' (' + result.total + ')' : ''}<ArrowUpRight size={16}/></Link>}
    </div>}
  </div>;
}

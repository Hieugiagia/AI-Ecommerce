import '../../styles/catalog-import.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Download, LoaderCircle, RefreshCw, CheckCircle2, Pause } from 'lucide-react';
import { loadReferenceCatalog, loadExistingCatalog, catalogImportApi } from '../../services/catalogImportService';
import { createCatalogPlan, runCatalogPlan } from '../../services/catalogImportModel';
import { formatDisplayDate } from '../../services/dateDisplay';

const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export default function CatalogImportDialog({ onClose, onImported, kind = 'products' }) {
  const dialog = useRef(null);
  const progressNode = useRef(null);
  const bodyNode = useRef(null);
  const mounted = useRef(false);
  const stopRequested = useRef(false);
  const inFlight = useRef(false);
  const [catalog, setCatalog] = useState(null);
  const [existing, setExisting] = useState(null);
  const [selected, setSelected] = useState([]);
  const [stock, setStock] = useState(20);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(null);
  const [reload, setReload] = useState(0);
  const changed = useRef(false);

  useEffect(() => {
    mounted.current = true;
    dialog.current?.showModal();
    return () => { mounted.current = false; stopRequested.current = true; };
  }, []);
  useEffect(() => {
    let active = true;
    setLoading(true); setError(''); setExisting(null);
    Promise.all([loadReferenceCatalog(kind), loadExistingCatalog()]).then(([reference, current]) => {
      if (!active) return;
      setCatalog(reference); setExisting(current);
      setSelected(reference.categories.map(category => category.slug));
      setStock(value => value || reference.defaultStock);
    }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload, kind]);
  useEffect(() => {
    if (!running) return;
    const protect = event => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', protect);
    return () => window.removeEventListener('beforeunload', protect);
  }, [running]);

  useEffect(() => {
    if (error && bodyNode.current) bodyNode.current.scrollTop = 0;
    else if (progress && progress.phase !== 'error') progressNode.current?.scrollIntoView({ block: 'nearest' });
  }, [error, progress?.phase]);

  const planning = useMemo(() => {
    if (!catalog || !existing) return { plan: null, error: '' };
    try { return { plan: createCatalogPlan(catalog, existing.categories, existing.products, selected), error: '' }; }
    catch (err) { return { plan: null, error: err.message }; }
  }, [catalog, existing, selected]);
  const plan = planning.plan;
  const hasFinished = progress?.phase === 'complete';
  const canStart = !loading && !running && !error && !planning.error && plan?.productsToCreate > 0 && Number.isInteger(stock) && stock > 0 && stock <= 9999;

  function close() {
    if (inFlight.current) return;
    if (changed.current) onImported();
    onClose();
  }
  async function start() {
    if (!canStart || inFlight.current) return;
    inFlight.current = true; stopRequested.current = false;
    setRunning(true); setError('');
    try {
      // Recheck server state immediately before writes, so a second run skips completed imports.
      const current = await loadExistingCatalog();
      if (!mounted.current || stopRequested.current) return;
      setExisting(current);
      const freshPlan = createCatalogPlan(catalog, current.categories, current.products, selected);
      const result = await runCatalogPlan(freshPlan, {
        stock, api: catalogImportApi, shouldContinue: () => mounted.current && !stopRequested.current,
        onProgress: value => {
          if (value.phase === 'product' || value.createdCategories || value.createdProducts) changed.current = true;
          if (mounted.current) setProgress(value);
        },
      });
      if (mounted.current) setProgress(result);
    } catch (err) {
      if (mounted.current) {
        if (err.progress) { changed.current = true; setProgress(err.progress); }
        setError(err.message + (err.uncertain ? ' Yêu cầu cuối có thể đã được lưu; hãy kiểm tra lại trước khi tiếp tục.' : ''));
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) setRunning(false);
    }
  }
  function retry() { setProgress(null); setReload(value => value + 1); }
  function toggle(slug) { setSelected(values => values.includes(slug) ? values.filter(value => value !== slug) : [...values, slug]); }

  return <dialog ref={dialog} className="catalog-import-dialog" aria-labelledby="catalog-import-title" onCancel={event => { event.preventDefault(); close(); }}>
    <div className="catalog-import-header"><div><span className="catalog-import-eyebrow">Bộ dữ liệu phát triển · Zentro Store</span><h2 id="catalog-import-title">{kind === 'options' ? 'Nhập phiên bản và màu sắc' : 'Thêm sản phẩm vào cửa hàng'}</h2><p>Nhập qua tài khoản admin hiện tại. Sản phẩm đã có sẽ được bỏ qua, giữ nguyên giá và tồn kho hiện tại.</p></div><button aria-label="Đóng nhập sản phẩm" disabled={running} onClick={close}><X size={21}/></button></div>
    <div className="catalog-import-body" ref={bodyNode}>
      {loading && <p role="status" className="catalog-import-loading"><LoaderCircle size={20} className="animate-spin"/>Đang kiểm tra dữ liệu và sản phẩm hiện có...</p>}
      {(error || planning.error) && <div role="alert" className="catalog-import-error"><p>{error || planning.error}</p>{!running && <button onClick={retry}><RefreshCw size={15}/>Kiểm tra lại dữ liệu</button>}<p>Các mục đã tạo được giữ lại. Lần nhập tiếp theo sẽ kiểm tra và bỏ qua những sản phẩm đã có.</p></div>}
      {kind === 'options' && <p className="catalog-import-reference">Mỗi tổ hợp phiên bản và màu là một sản phẩm riêng, để giỏ hàng và đơn hàng lưu đúng lựa chọn. Tồn kho nhập là dữ liệu test, không phải tồn kho của CellphoneS.</p>}{catalog && <div className="catalog-import-reference"><p>Giá và ảnh tham khảo từ <a href={catalog.sourceUrl} target="_blank" rel="noreferrer">CellphoneS</a>, ngày {formatDisplayDate(catalog.referenceDate, { timeZone: 'UTC' })}, khu vực TP. Hồ Chí Minh. Giá có thể thay đổi; bộ dữ liệu này dùng để phát triển và kiểm thử cửa hàng.</p></div>}
      {catalog && existing && !loading && <><div className="catalog-import-summary"><div><strong>{hasFinished ? progress.createdProducts : plan?.productsToCreate || 0}</strong><span>{hasFinished ? "Đã thêm sản phẩm" : "Sản phẩm sẽ thêm"}</span></div><div><strong>{hasFinished ? progress.createdCategories : plan?.categoriesToCreate || 0}</strong><span>{hasFinished ? "Đã tạo danh mục" : "Danh mục mới"}</span></div><div><strong>{plan?.skipped || 0}</strong><span>Sản phẩm bỏ qua</span></div><label>Tồn kho khởi tạo<input type="number" min="1" max="9999" step="1" value={stock} disabled={running || hasFinished} onChange={event => setStock(Number(event.target.value))}/><small>Áp dụng cho sản phẩm mới</small></label></div>
        {!running && !hasFinished && <label className="catalog-import-select-all"><input type="checkbox" checked={selected.length === catalog.categories.length} onChange={event => setSelected(event.target.checked ? catalog.categories.map(category => category.slug) : [])}/>Chọn tất cả {catalog.categories.length} danh mục</label>}
        <div className="catalog-import-groups">{catalog.categories.map(category => {
          const group = plan?.groups.find(item => item.category.slug === category.slug);
          return <article className="catalog-import-group" key={category.slug}><div className="catalog-import-group-heading"><label><input type="checkbox" checked={selected.includes(category.slug)} disabled={running || hasFinished} onChange={() => toggle(category.slug)}/><img src={category.products[0].thumbnailUrl} alt="" loading="lazy"/><span><strong>{category.name}</strong><small>{category.products.length} sản phẩm tham khảo{group && !group.existingId && group.products.length ? ' · Sẽ tạo danh mục' : ''}</small></span></label><span>{group ? group.products.length + ' sẽ thêm' : 'Không chọn'}</span></div><details><summary>Xem sản phẩm và giá tham khảo</summary><div className="catalog-import-previews">{category.products.map(product => <a key={product.slug} href={product.sourceUrl} target="_blank" rel="noreferrer"><img src={product.thumbnailUrl} alt="" loading="lazy"/><span>{product.name}<strong>{money(product.price)}</strong></span></a>)}</div></details></article>;
        })}</div></>}
      {progress && <div className={'catalog-import-progress' + (hasFinished ? ' is-complete' : '')} ref={progressNode} role="status" aria-live="polite"><div>{hasFinished ? <CheckCircle2 size={20}/> : running ? <LoaderCircle size={20} className="animate-spin"/> : <Pause size={20}/>}<strong>{hasFinished ? 'Đã nhập xong' : progress.phase === 'stopped' ? 'Đã tạm dừng' : running ? 'Đang nhập sản phẩm' : 'Đã dừng khi gặp lỗi'}</strong><span>{progress.createdProducts}/{progress.totalProducts} sản phẩm</span></div><progress max={Math.max(1,progress.totalProducts)} value={progress.createdProducts}/><p>{running ? progress.current : 'Đã tạo ' + progress.createdCategories + ' danh mục và ' + progress.createdProducts + ' sản phẩm.'}</p></div>}
    </div>
    <footer className="catalog-import-footer"><p>Sản phẩm mới sẽ ở trạng thái <strong>Đang mở bán</strong>. Ảnh đã được lưu cùng dự án.</p><div>{running ? <button className="admin-soft-button" onClick={() => { stopRequested.current = true; }}>Dừng sau mục hiện tại</button> : <button className="admin-soft-button" onClick={close}>{hasFinished ? 'Đóng và tải lại sản phẩm' : 'Đóng'}</button>}{!hasFinished && <button className="admin-primary" disabled={!canStart} onClick={start}>{running ? <LoaderCircle size={16} className="animate-spin"/> : <Download size={16}/>} {running ? 'Đang nhập...' : 'Nhập ' + (plan?.productsToCreate || 0) + ' sản phẩm'}</button>}</div></footer>
  </dialog>;
}

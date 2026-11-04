import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { productService } from '../../services/productService';
import { apiRequest } from '../../services/api';

const statuses = {
  PUBLISHED: 'Đang mở bán',
  DRAFT: 'Bản nháp',
  OUT_OF_STOCK: 'Hết hàng',
  ARCHIVED: 'Ngừng kinh doanh',
};
const fieldClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm';
const buttonClass = 'rounded-xl border border-slate-200 px-4 py-2 text-sm disabled:opacity-50';
const emptyForm = () => ({ name: '', slug: '', description: '', price: '', stock: '0', categoryId: '', thumbnailUrl: '', status: 'DRAFT' });
const slugify = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const money = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export default function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const lowStock = searchParams.get('tab') === 'low_stock';
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryError, setCategoryError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [busy, setBusy] = useState(false);
  const operation = useRef(false);
  const limit = 12;

  useEffect(() => {
    let active = true;
    apiRequest('/categories').then((data) => {
      if (!Array.isArray(data)) throw new Error('Danh sách danh mục không hợp lệ');
      if (active) setCategories(data);
    }).catch((err) => { if (active) setCategoryError(err.message); });
    return () => { active = false; };
  }, [refresh]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const data = await productService.getAdminProducts({ q: query, category, status, sort, page, limit });
        if (!active) return;
        const lastPage = Math.max(1, Math.ceil(data.total / limit));
        if (page > lastPage) { setPage(lastPage); return; }
        setProducts(data.products);
        setTotal(data.total);
      } catch (err) {
        if (active) { setError(err.message); setProducts([]); setTotal(0); }
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [query, category, status, sort, page, refresh]);

  async function openEdit(id) {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    setError('');
    try {
      const product = await productService.getAdminProductById(id);
      setForm({ ...product, thumbnailUrl: product.thumbnailUrl || '' });
      setFormError('');
      setConflict(false);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); operation.current = false; }
  }

  async function save(event) {
    event.preventDefault();
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    setFormError('');
    setConflict(false);
    try {
      const payload = { ...form, slug: form.slug || slugify(form.name) };
      if (form.id) await productService.updateProduct(form.id, payload);
      else await productService.createProduct(payload);
      setNotice(form.id ? 'Đã lưu thay đổi sản phẩm.' : 'Đã tạo sản phẩm.');
      setForm(null);
      setRefresh((value) => value + 1);
    } catch (err) {
      setFormError(err.message);
      setConflict(err.data?.code === 2005 || (err.status === 409 && /tải lại|thay đổi/i.test(err.message)));
    } finally { setBusy(false); operation.current = false; }
  }

  async function remove() {
    if (operation.current) return;
    operation.current = true;
    setBusy(true);
    setDeleteError('');
    try {
      await productService.deleteProduct(deleting.id);
      setDeleting(null);
      setNotice('Đã xóa sản phẩm.');
      setRefresh((value) => value + 1);
    } catch (err) { setDeleteError(err.message); }
    finally { setBusy(false); operation.current = false; }
  }

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
    setLoading(true);
  }
  const visible = lowStock ? products.filter((product) => product.stock <= 15) : products;
  const activeCategories = categories.filter((item) => item.isActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 border border-slate-200">
        <div><h1 className="text-2xl font-bold">Quản lý sản phẩm</h1><p className="text-sm text-slate-500 mt-1">Giá bán, tồn kho và trạng thái niêm yết</p></div>
        <button disabled={busy || loading || !!categoryError || !activeCategories.length} className={`${buttonClass} bg-indigo-600 text-white flex gap-2 items-center`} onClick={() => { setForm({ ...emptyForm(), categoryId: String(activeCategories[0]?.id || '') }); setFormError(''); setConflict(false); }}><Plus size={16} />Thêm sản phẩm</button>
      </div>
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-emerald-800">{notice}</p>}
      {categoryError && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-amber-800">Không tải được danh mục: {categoryError} <button className="underline" onClick={() => { setCategoryError(''); setRefresh((v) => v + 1); }}>Thử lại</button></p>}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <input aria-label="Tìm sản phẩm" className={fieldClass} placeholder="Tìm theo tên sản phẩm…" value={query} onChange={(e) => updateFilter(setQuery, e.target.value)} />
          <select aria-label="Danh mục" className={fieldClass} value={category} onChange={(e) => updateFilter(setCategory, e.target.value)}><option value="all">Tất cả danh mục</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
          <select aria-label="Trạng thái" className={fieldClass} value={status} onChange={(e) => updateFilter(setStatus, e.target.value)}><option value="all">Tất cả trạng thái</option>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          <select aria-label="Sắp xếp" className={fieldClass} value={sort} onChange={(e) => updateFilter(setSort, e.target.value)}><option value="newest">Mới nhất</option><option value="price-asc">Giá tăng dần</option><option value="price-desc">Giá giảm dần</option></select>
        </div>
        {lowStock && <p className="bg-amber-50 p-3 rounded-xl text-sm">Đang lọc tồn kho ≤ 15 trong trang hiện tại. <button className="underline" onClick={() => setSearchParams({})}>Xem tất cả</button></p>}
        {error && <p role="alert" className="text-rose-700">{error} <button className="underline" onClick={() => { setLoading(true); setRefresh((v) => v + 1); }}>Thử lại</button></p>}
        {loading ? <p role="status">Đang tải sản phẩm…</p> : !error && <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-slate-500">{['ID / Sản phẩm', 'Danh mục', 'Giá bán', 'Tồn kho', 'Trạng thái', 'Thao tác'].map((label) => <th className="py-3 px-2" key={label}>{label}</th>)}</tr></thead><tbody>{visible.map((product) => <tr key={product.id} className="border-b border-slate-100">
          <td className="py-4 px-2"><span className="text-slate-400">#{product.id}</span> <span className="font-semibold">{product.name}</span></td>
          <td className="px-2">{product.categoryName}</td><td className="px-2">{money(product.price)}</td><td className="px-2">{product.stock}</td><td className="px-2">{statuses[product.status] || product.status}</td>
          <td className="px-2"><div className="flex gap-3 items-center">{['PUBLISHED', 'OUT_OF_STOCK'].includes(product.status) && <Link className="text-indigo-600" to={`/products/${product.id}`} target="_blank" rel="noreferrer">Xem</Link>}<button aria-label={`Sửa ${product.name}`} disabled={busy} onClick={() => openEdit(product.id)}><Edit2 size={17} /></button><button aria-label={`Xóa ${product.name}`} disabled={busy} className="text-rose-600" onClick={() => { setDeleting(product); setDeleteError(''); }}><Trash2 size={17} /></button></div></td>
        </tr>)}</tbody></table>{!visible.length && <p className="py-8 text-center text-slate-500">Không có sản phẩm phù hợp.</p>}</div>}
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm"><span>{total} sản phẩm khớp bộ lọc · Trang {page}/{Math.max(1, Math.ceil(total / limit))}</span><div className="flex gap-2"><button className={buttonClass} disabled={loading || page <= 1} onClick={() => { setLoading(true); setPage(page - 1); }}>Trước</button><button className={buttonClass} disabled={loading || page * limit >= total} onClick={() => { setLoading(true); setPage(page + 1); }}>Sau</button></div></div>
      </div>
      {form && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><section role="dialog" aria-modal="true" aria-labelledby="product-form-title" className="max-h-[90vh] overflow-y-auto w-full max-w-xl bg-white rounded-3xl p-6">
        <div className="flex justify-between items-center mb-5"><h2 id="product-form-title" className="font-bold text-xl">{form.id ? `Sửa sản phẩm #${form.id}` : 'Thêm sản phẩm'}</h2><button aria-label="Đóng" disabled={busy} onClick={() => setForm(null)}><X /></button></div>
        <form onSubmit={save} className="space-y-4"><fieldset disabled={busy} className="space-y-4">
          <label className="block text-sm">Tên sản phẩm<input required maxLength={255} className={fieldClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="block text-sm">Slug<input required={!!form.id} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={280} className={fieldClass} placeholder="Để trống để tạo từ tên sản phẩm" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></label>
          <label className="block text-sm">Danh mục<select required className={fieldClass} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}><option value="">Chọn danh mục</option>{categories.map((item) => <option key={item.id} value={item.id} disabled={!item.isActive}>{item.name}{!item.isActive ? ' (ngừng hoạt động)' : ''}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm">Giá bán (VNĐ)<input required type="number" min="0" max="9999999999999.99" step="0.01" className={fieldClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label><label className="block text-sm">Tồn kho<input required type="number" min="0" max="2147483647" step="1" className={fieldClass} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></label></div>
          <label className="block text-sm">Trạng thái<select className={fieldClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="block text-sm">Đường dẫn ảnh<input type="url" maxLength={500} className={fieldClass} value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} /></label>
          <label className="block text-sm">Mô tả<textarea rows={4} className={fieldClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        </fieldset>
        {formError && <p role="alert" className="text-sm text-rose-700">{formError}</p>}
        {conflict && <button type="button" disabled={busy} className={`${buttonClass} text-indigo-700`} onClick={() => openEdit(form.id)}>Tải bản mới nhất (bỏ thay đổi đang nhập)</button>}
        <div className="flex justify-end gap-3"><button type="button" className={buttonClass} disabled={busy} onClick={() => setForm(null)}>Hủy</button><button disabled={busy || conflict} className={`${buttonClass} bg-indigo-600 text-white`}>{busy ? 'Đang lưu…' : 'Lưu sản phẩm'}</button></div>
        </form>
      </section></div>}
      {deleting && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><section role="dialog" aria-modal="true" aria-labelledby="delete-title" className="w-full max-w-md rounded-3xl bg-white p-6 space-y-4"><h2 id="delete-title" className="text-lg font-bold">Xóa sản phẩm #{deleting.id}?</h2><p className="text-sm">{deleting.name} sẽ bị xóa khỏi hệ thống. Bạn có thể chọn trạng thái ngừng kinh doanh nếu muốn giữ sản phẩm.</p>{deleteError && <p role="alert" className="text-rose-700 text-sm">{deleteError}</p>}<div className="flex justify-end gap-3"><button disabled={busy} className={buttonClass} onClick={() => setDeleting(null)}>Hủy</button><button disabled={busy} className={`${buttonClass} bg-rose-600 text-white`} onClick={remove}>{busy ? 'Đang xóa…' : 'Xóa sản phẩm'}</button></div></section></div>}
    </div>
  );
}

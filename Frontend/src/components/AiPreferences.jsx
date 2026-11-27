import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import { buildAdvicePrompt } from '../services/aiPreferences';
import '../styles/ai-preferences.css';

export default function AiPreferences({ canSend, onSend }) {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true; setLoading(true); setLoadError('');
    apiRequest('/categories').then(rows => {
      if (!Array.isArray(rows)) throw new Error('Chưa đọc được danh mục.');
      const available = rows.filter(row => row.isActive !== false && row.slug !== 'all' && row.slug && row.name);
      if (active) setCategories(available);
    }).catch(() => { if (active) setLoadError('Chưa tải được danh mục. Bạn vẫn có thể nhập câu hỏi trực tiếp.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [retry]);
  function submit(event) {
    event.preventDefault(); setError('');
    if (!canSend) return;
    try { onSend(buildAdvicePrompt({ category: categories.find(row => row.slug === category), brand, maxPrice })); }
    catch (error) { setError(error.message); }
  }
  return <form className="ai-preferences" aria-label="Tư vấn theo nhu cầu" onSubmit={submit}>
    {loading && <p role="status">Đang tải danh mục…</p>}
    {loadError && <p role="status">{loadError} <button type="button" onClick={() => setRetry(value => value + 1)}>Thử lại</button></p>}
    <fieldset disabled={loading || !canSend || !!loadError}>
      <label>Loại sản phẩm<select required aria-label="Loại sản phẩm cần tư vấn" value={category} onChange={event => setCategory(event.target.value)}><option value="">Chọn loại sản phẩm</option>{categories.map(row => <option key={row.slug} value={row.slug}>{row.name}</option>)}</select></label>
      <div><label>Thương hiệu<input aria-label="Thương hiệu cần tư vấn" value={brand} maxLength={50} placeholder="Ví dụ: Samsung" onChange={event => setBrand(event.target.value)}/></label>
        <label>Ngân sách tối đa (VNĐ)<input aria-label="Ngân sách tư vấn" type="number" min="1" max="9999999999999" step="1" value={maxPrice} placeholder="Ví dụ: 15000000" onChange={event => setMaxPrice(event.target.value)}/></label></div>
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={!categories.length}>Tư vấn theo lựa chọn</button>
    </fieldset>
  </form>;
}

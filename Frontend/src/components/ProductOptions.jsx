import { Check } from 'lucide-react';
import { chooseVersion, optionPurchase, versionChoices } from '../services/productOptionsModel';

const money = value => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
export default function ProductOptions({ data, selected, onSelect, loading, error, onRetry }) {
  if (loading) return <div className="product-options" role="status">Đang tải phiên bản và thông số…</div>;
  if (error) return <div className="product-options" role="alert"><p>{error}</p><button className="underline" onClick={onRetry}>Thử lại</button></div>;
  if (!data?.options.length) return <div className="product-options"><strong>Phiên bản tiêu chuẩn</strong><p>Giá và tồn kho theo sản phẩm đang xem.</p></div>;
  const versions = versionChoices(data.options);
  const colors = data.options.filter(option => option.version === selected?.version);
  const purchase = optionPurchase(selected);
  return <section className="product-options" aria-label="Lựa chọn sản phẩm">
    <fieldset><legend>Chọn phiên bản</legend><div className="product-options-grid">
      {versions.map(item => <button type="button" key={item.version} aria-pressed={selected?.version === item.version}
        onClick={() => onSelect(chooseVersion(data.options, item.version, selected))}>
        <span>{item.version}{selected?.version === item.version && <Check size={16}/>}</span>
        <strong>{versions.length > 1 ? 'Từ ' : ''}{money(item.price)}</strong>
        {!item.available && <small>Chưa mở bán</small>}
      </button>)}
    </div></fieldset>
    {colors.some(option => option.color) && <fieldset><legend>Chọn màu sắc <span>{selected?.color}</span></legend><div className="product-options-grid">
      {colors.map(option => <button type="button" key={option.slug} aria-pressed={selected?.slug === option.slug} onClick={() => onSelect(option)}>
        <span>{option.color || 'Tiêu chuẩn'}{selected?.slug === option.slug && <Check size={16}/>}</span>
        <strong>{money(option.product?.price ?? option.referencePrice)}</strong>
        {!optionPurchase(option) && <small>{!option.product ? 'Chưa mở bán' : 'Tạm hết hàng'}</small>}
      </button>)}
    </div></fieldset>}
    <div className="product-choice-summary" aria-live="polite"><strong>{[selected?.version, selected?.color].filter(Boolean).join(' · ')}</strong>
      {!purchase && <p>{selected?.product ? 'Phiên bản này tạm hết hàng.' : 'Phiên bản này chưa mở bán tại Zentro Store. Giá hiển thị là giá tham khảo; hiện chưa thể đặt mua.'}</p>}
    </div>
  </section>;
}

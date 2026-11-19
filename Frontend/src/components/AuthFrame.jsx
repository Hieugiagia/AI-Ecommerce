import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

export default function AuthFrame({
  children,
  eyebrow = '',
  title,
  description,
  register = false,
  productShowcase = false,
}) {
  return <section className={'auth-frame' + (register ? ' auth-register' : '')}>
    <div className="auth-form-side">
      <div className="auth-topline"><BrandLogo variant="modern" size="sm" /><Link to="/">Về cửa hàng</Link></div>
      <div className="auth-form-content">
        {eyebrow && <p className="auth-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p className="auth-description">{description}</p>
        {children}
      </div>
      <div className="auth-form-bottom"><span>Zentro Store · Công nghệ cho cuộc sống</span><span>Tiếng Việt</span></div>
    </div>
    <aside className={'auth-visual' + (productShowcase ? ' auth-visual-products' : '')} aria-label="Khám phá Zentro Store">
      <img
        src={productShowcase ? '/images/storefront/auth-products.png' : '/images/storefront/auth-interior.jpg'}
        alt={productShowcase ? 'Không gian trưng bày laptop, điện thoại, tai nghe và các sản phẩm phong cách sống' : ''}
      />
      {productShowcase ? <div className="auth-visual-content">
        <small>Khám phá cùng Zentro Store</small>
        <h2>Chọn điều bạn thích.<br />Tận hưởng mỗi ngày.</h2>
        <p>Từ thiết bị công nghệ đến những món đồ cho cuộc sống. Tìm lựa chọn phù hợp với bạn tại Zentro Store.</p>
      </div> : <div className="auth-visual-content">
        <small>LESS NOISE. MORE POSSIBILITIES.</small>
        <h2>Một kết nối nhỏ.<br />Mở ra nhiều điều mới.</h2>
        <p>Từ góc làm việc đến những phút thư giãn, tìm thiết bị phù hợp với cuộc sống của bạn.</p>
        <div className="auth-visual-bottom"><span>Khám phá cùng Zentro Store</span><span>● ━ ━</span></div>
      </div>}
    </aside>
  </section>;
}

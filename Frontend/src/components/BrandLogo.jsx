import { Link } from 'react-router-dom';
import { STORE_CONFIG } from '../config/storeConfig';

export default function BrandLogo({
  size = 'md',
  variant = 'light',
  showSlogan = false,
  to = '/',
  className = '',
}) {
  const classes = [
    'brand-new',
    size === 'sm' ? 'brand-new-small' : '',
    size === 'lg' ? 'brand-new-large' : '',
    variant === 'dark' ? 'brand-new-dark' : '',
    className,
  ].filter(Boolean).join(' ');

  const logo = <span className={classes}>
    <span className="brand-new-symbol" aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 11H29L11 29H29" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
    <span>
      <span className="brand-new-name">{STORE_CONFIG.name}</span>
      {showSlogan && <span className="brand-new-caption">Công nghệ cho cuộc sống</span>}
    </span>
  </span>;

  return to ? <Link to={to} aria-label={STORE_CONFIG.name + ' - Trang chủ'}>{logo}</Link> : logo;
}

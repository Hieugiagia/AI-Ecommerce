import { Eye, EyeOff } from 'lucide-react';

export default function AuthField({ id, label, icon: Icon, reveal, onReveal, trailing, ...props }) {
  return <div className="auth-field"><div className="auth-field-head"><label htmlFor={id}>{label}</label>{trailing}</div><div className="auth-input-wrap">
    {Icon && <Icon aria-hidden="true" />}<input id={id} {...props} />
    {onReveal && <button type="button" aria-label={reveal ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={reveal} onClick={onReveal}>{reveal ? <EyeOff /> : <Eye />}</button>}
  </div></div>;
}

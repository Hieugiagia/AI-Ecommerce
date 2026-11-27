import { useEffect, useState } from 'react';
import { paymentService } from '../services/paymentService';

export default function PaymentMethods({ value, onChange }) {
  const [state, setState] = useState({ loading: true, enabled: false, error: '' });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ loading: true, enabled: false, error: '' });
    paymentService.methods().then(data => {
      if (active) setState({ loading: false, enabled: data.momoEnabled, error: '' });
    }).catch(() => {
      if (active) setState({ loading: false, enabled: false, error: 'Chưa kiểm tra được MoMo. Bạn vẫn có thể đặt hàng bằng COD.' });
    });
    return () => { active = false; };
  }, [retry]);
  useEffect(() => { if (!state.enabled && value === 'MOMO') onChange('COD'); }, [state.enabled, value, onChange]);
  return <div className="space-y-3">
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4">
      <input className="mt-1 accent-orange-600" type="radio" name="paymentMethod" value="COD" checked={value === 'COD'} onChange={() => onChange('COD')} />
      <span><strong className="block">Thanh toán khi nhận hàng (COD)</strong><span className="mt-1 block text-sm text-slate-500">Thanh toán cho người giao hàng khi nhận sản phẩm.</span></span>
    </label>
    <label className={'flex items-start gap-3 rounded-2xl border border-slate-200 p-4 ' + (state.enabled ? 'cursor-pointer' : 'opacity-60')}>
      <input className="mt-1 accent-orange-600" type="radio" name="paymentMethod" value="MOMO" disabled={!state.enabled} checked={value === 'MOMO'} onChange={() => onChange('MOMO')} />
      <span><strong className="block">Ví MoMo <span className="ml-2 rounded bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">Sandbox</span></strong><span className="mt-1 block text-sm text-slate-500">{state.loading ? 'Đang kiểm tra...' : state.enabled ? 'Thử thanh toán qua môi trường kiểm thử của MoMo.' : 'Chưa sẵn sàng thanh toán.'}</span></span>
    </label>
    {state.error && <p role="status" className="text-sm text-slate-500">{state.error} <button type="button" className="underline" onClick={() => setRetry(n => n + 1)}>Thử lại</button></p>}
  </div>;
}

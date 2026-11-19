import { useEffect, useRef, useState } from 'react';
import { MapPin, Plus, Pencil, Trash2, Check } from 'lucide-react';
import { addressService } from '../services/addressService';
import '../styles/address-book.css';
import { addressPayload, addressLine } from '../services/addressModel';
import LocationFields from './LocationFields';

const fields = [
  ['receiverName', 'Tên người nhận'], ['receiverPhone', 'Số điện thoại'],
];
const empty = user => ({receiverName:user?.fullName || '',receiverPhone:user?.phone || '',city:'',district:'',ward:'',streetAddress:'',isDefault:false});
export default function AddressBook({ user }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);
  const [form, setForm] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const active = useRef(false);
  const inFlight = useRef(false);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  useEffect(() => {
    let live = true; setLoading(true); setLoadError('');
    addressService.list().then(data => { if (live) { setRows(data); setUncertain(false); } })
      .catch(err => { if (live) setLoadError([404,405].includes(err.status) ? 'Sổ địa chỉ hiện chưa sẵn sàng.' : err.message); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [reload]);
  async function mutate(task, message) {
    if (inFlight.current || uncertain || loading || loadError) return;
    inFlight.current = true; setBusy(true); setError(''); setNotice('');
    let taskCompleted = false;
    try {
      await task(); taskCompleted = true;
      const data = await addressService.list();
      if (!active.current) return;
      setRows(data); setForm(null); setDeleting(null); setNotice(message);
    } catch (err) {
      if (!active.current) return;
      setError(err.message || 'Chưa cập nhật được địa chỉ.');
      if (taskCompleted || !err.status || err.status >= 500) setUncertain(true);
    } finally {
      inFlight.current = false; if (active.current) setBusy(false);
    }
  }
  function refresh() { setForm(null); setDeleting(null); setError(''); setNotice(''); setReload(value=>value+1); }
  return <section className="address-book" aria-label="Sổ địa chỉ giao hàng">
    <div className="address-book-heading"><div><h2><MapPin size={21}/>Sổ địa chỉ</h2><p>Lưu địa chỉ nhận hàng để chọn nhanh khi thanh toán.</p></div><button type="button" className="address-primary" disabled={loading || busy || !!loadError || uncertain || !!form} onClick={()=>{setForm(empty(user));setError('');setNotice('');}}><Plus size={16}/>Thêm địa chỉ</button></div>
    {loading && <p role="status">Đang tải sổ địa chỉ…</p>}
    {loadError && <div role="alert" className="address-error">{loadError} <button type="button" onClick={refresh}>Tải lại</button></div>}
    {error && <div role="alert" className="address-error"><p>{error}</p>{uncertain && <p>Yêu cầu vừa rồi có thể đã được lưu. Hãy tải lại để kiểm tra trước khi thao tác tiếp. <button type="button" disabled={busy} onClick={refresh}>Tải lại địa chỉ</button></p>}</div>}
    {notice && <p role="status" className="address-notice"><Check size={17}/>{notice}</p>}
    {form && <form className="address-form" aria-label={form.id ? 'Sửa địa chỉ' : 'Thêm địa chỉ'} onSubmit={event=>{event.preventDefault();try { addressPayload(form); } catch (err) { setError(err.message); return; } mutate(()=>addressService.save(form.id,form),'Đã lưu địa chỉ.');}}>
      <fieldset disabled={busy || uncertain}><legend>{form.id ? 'Chỉnh sửa địa chỉ' : 'Địa chỉ mới'}</legend><div className="address-fields">{fields.map(([key,label])=><label key={key}>{label}<input required name={key} type={key==='receiverPhone'?'tel':'text'} maxLength={key==='receiverPhone'?16:100} value={form[key]} onChange={event=>setForm(previous=>({...previous,[key]:event.target.value}))}/></label>)}
      {form.legacyLocation ? <div className="location-legacy"><p>{form.ward}, {form.district}, {form.city}</p><button type="button" onClick={()=>setForm(previous=>({...previous,city:'',ward:'',district:'',legacyLocation:false}))}>Chọn tỉnh/phường mới</button></div> : <LocationFields province={form.city} ward={form.ward} disabled={busy || uncertain} onChange={({province,ward})=>setForm(previous=>({...previous,city:province,ward,district:ward}))}/>}
      <label className="address-street-field">Số nhà, tên đường<input required name="streetAddress" maxLength={100} value={form.streetAddress} onChange={event=>setForm(previous=>({...previous,streetAddress:event.target.value}))}/></label>
      </div>
      <label className="address-default-check"><input type="checkbox" checked={form.isDefault} onChange={event=>setForm(previous=>({...previous,isDefault:event.target.checked}))}/>Đặt làm địa chỉ mặc định</label>
      <div className="address-actions"><button type="button" onClick={()=>setForm(null)}>Hủy</button><button type="submit" className="address-primary">{busy?'Đang lưu…':'Lưu địa chỉ'}</button></div></fieldset>
    </form>}
    {!loading && !loadError && !rows.length && !form && <p className="address-empty">Bạn chưa lưu địa chỉ nhận hàng nào.</p>}
    {!loading && !loadError && <div className="address-list">{rows.map(row=><article className="address-card" key={row.id}><div><strong>{row.receiverName}</strong><span>{row.receiverPhone}</span>{row.isDefault && <b>Mặc định</b>}</div><p>{addressLine(row)}</p>
      {deleting===row.id ? <div className="address-delete-confirm"><p>Xóa địa chỉ này khỏi sổ địa chỉ? Thông tin trong đơn hàng đã đặt được giữ nguyên.</p><div className="address-actions"><button type="button" disabled={busy || uncertain} onClick={()=>setDeleting(null)}>Giữ lại</button><button type="button" disabled={busy || uncertain} onClick={()=>mutate(()=>addressService.remove(row.id),'Đã xóa địa chỉ.')}>Xác nhận xóa</button></div></div> : <div className="address-actions">
        {!row.isDefault && <button type="button" disabled={busy || uncertain || !!form} onClick={()=>mutate(()=>addressService.makeDefault(row.id),'Đã đổi địa chỉ mặc định.')}>Đặt mặc định</button>}
        <button type="button" disabled={busy || uncertain || !!form} onClick={()=>{setForm({...row,legacyLocation:row.district!==row.ward});setError('');setNotice('');}}><Pencil size={15}/>Sửa</button>
        <button type="button" disabled={busy || uncertain || !!form} onClick={()=>{setDeleting(row.id);setError('');setNotice('');}}><Trash2 size={15}/>Xóa</button>
      </div>}</article>)}</div>}
  </section>;
}

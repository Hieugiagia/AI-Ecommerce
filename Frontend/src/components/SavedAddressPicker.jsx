import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { addressService } from '../services/addressService';
import '../styles/address-book.css';

export default function SavedAddressPicker({ onSelect }) {
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [retry,setRetry]=useState(0);
  useEffect(()=>{
    let active=true;setLoading(true);setError('');
    addressService.list().then(data=>{if(active)setRows(data);}).catch(()=>{if(active)setError('Chưa tải được địa chỉ đã lưu. Bạn vẫn có thể nhập thông tin nhận hàng bên dưới.');}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[retry]);
  return <div className="saved-address-picker">
    {loading ? <p role="status">Đang tải địa chỉ đã lưu…</p> : error ? <p role="status">{error} <button type="button" onClick={()=>setRetry(n=>n+1)}>Thử lại</button></p> : rows.length ? <>
      <label>Chọn từ sổ địa chỉ<select aria-label="Chọn địa chỉ đã lưu" defaultValue="" onChange={event=>{const row=rows.find(row=>String(row.id)===event.target.value);if(row)onSelect(row);event.target.value='';}}>
        <option value="" disabled>Chọn một địa chỉ nhận hàng</option>{rows.map(row=><option key={row.id} value={row.id}>{row.isDefault?'Mặc định · ':''}{row.receiverName} · {row.streetAddress}, {row.ward}, {row.city}</option>)}
      </select></label>
      {rows.find(row=>row.isDefault) && <button type="button" onClick={()=>onSelect(rows.find(row=>row.isDefault))}>Dùng địa chỉ mặc định</button>}
    </> : <p>Bạn chưa có địa chỉ đã lưu. Có thể nhập trực tiếp bên dưới.</p>}
    <Link to="/profile?tab=addresses">Quản lý sổ địa chỉ</Link>
  </div>;
}

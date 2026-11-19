import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { loadDivisions } from '../services/locationService';
import { filterLocations } from '../services/locationModel';
import '../styles/location-fields.css';

function LocationSelect({ label, name, value, options, onChange, disabled, placeholder }) {
  const id=useId(),root=useRef(null),input=useRef(null);
  const [open,setOpen]=useState(false),[active,setActive]=useState(-1);
  const selected=options.find(row=>row.name===value);
  const matches=filterLocations(options,selected?'':value);
  useEffect(()=>{
    input.current?.setCustomValidity(disabled||selected?'':'Vui lòng chọn một mục trong danh sách gợi ý.');
  },[disabled,selected,value]);
  useEffect(()=>{
    const outside=event=>{if(!root.current?.contains(event.target)){setOpen(false);setActive(-1);}};
    document.addEventListener('pointerdown',outside);
    return()=>document.removeEventListener('pointerdown',outside);
  },[]);
  function choose(row){onChange(row.name);input.current?.focus();setOpen(false);setActive(-1);}
  return <div className="location-select" ref={root} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget)){setOpen(false);setActive(-1);}}}>
    <label htmlFor={id}>{label} *</label>
    <div className="location-input"><Search size={16}/><input ref={input} id={id} name={name}
      role="combobox" aria-autocomplete="list" aria-expanded={open&&!disabled} aria-controls={id+'-list'}
      aria-activedescendant={open&&active>=0&&matches[active]?id+'-'+active:undefined}
      required disabled={disabled} value={value} placeholder={placeholder} autoComplete="off"
      onFocus={()=>{setOpen(true);setActive(-1);}}
      onChange={event=>{onChange(event.target.value);setOpen(true);setActive(-1);}}
      onKeyDown={event=>{
        if(event.nativeEvent.isComposing)return;
        if(event.key==='Escape'){setOpen(false);setActive(-1);}
        else if(event.key==='ArrowDown'||event.key==='ArrowUp'){
          event.preventDefault();setOpen(true);
          if(matches.length){const next=event.key==='ArrowDown'?(active+1)%matches.length:active<=0?matches.length-1:active-1;setActive(next);document.getElementById(id+'-'+next)?.scrollIntoView({block:'nearest'});}
        }else if(event.key==='Enter'&&open){event.preventDefault();if(matches[active]||matches.length===1)choose(matches[active]||matches[0]);}
      }}/><ChevronDown size={16}/></div>
    {open&&!disabled&&<div className="location-options" role="listbox" id={id+'-list'} aria-label={label}>
      {matches.length?matches.map((row,index)=><button type="button" role="option" key={row.code} id={id+'-'+index}
        aria-selected={selected?.code===row.code} className={index===active?'is-active':''}
        onPointerMove={()=>setActive(index)} onClick={()=>choose(row)}><span>{row.name}</span>{selected?.code===row.code&&<Check size={15}/>}</button>)
      :<p>Không tìm thấy địa danh phù hợp.</p>}
    </div>}
  </div>;
}

export default function LocationFields({ province, ward, onChange, disabled=false }) {
  const [data,setData]=useState(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  useEffect(()=>{
    let active=true;setError('');
    loadDivisions().then(data=>{if(active)setData(data);}).catch(error=>{if(active)setError(error.message);});
    return()=>{active=false;};
  },[retry]);
  const provinces=data?.provinces||[];
  const selected=provinces.find(item=>item.name===province);
  return <div className="location-fields">
    <LocationSelect label="Tỉnh / Thành phố" name="province" value={province} options={provinces}
      disabled={disabled||!data} placeholder={data?'Tìm hoặc chọn tỉnh/thành':'Đang tải tỉnh/thành…'}
      onChange={value=>onChange({province:value,ward:''})}/>
    <LocationSelect label="Phường / Xã / Đặc khu" name="ward" value={ward} options={selected?.wards||[]}
      disabled={disabled||!selected} placeholder={selected?'Tìm hoặc chọn phường/xã':'Chọn tỉnh/thành trước'}
      onChange={value=>onChange({province,ward:value})}/>
    {!data&&<input className="location-loading-guard" aria-label="Trạng thái tải địa danh" required value="" onChange={()=>{}} onInvalid={event=>event.currentTarget.setCustomValidity('Vui lòng đợi danh sách địa danh tải xong.')} tabIndex={-1}/>}
    {error&&<p role="alert" className="location-error">{error} <button type="button" onClick={()=>setRetry(n=>n+1)}>Thử lại</button></p>}
    {data&&<small className="location-source">Dữ liệu: <a href={data.source} target="_blank" rel="noreferrer">Địa Chỉ Việt</a> · <a href={data.licenseUrl} target="_blank" rel="noreferrer">CC BY 4.0</a></small>}
  </div>;
}

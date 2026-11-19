export const normalizeLocationQuery = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase().replace(/\s+/g,' ').trim();
export function filterLocations(options, query) {
  const words = normalizeLocationQuery(query).split(' ').filter(Boolean);
  return options.filter(item => words.every(word => normalizeLocationQuery(item.name).includes(word)))
    .sort((a,b)=>a.name.localeCompare(b.name,'vi'));
}
export function validateDivisions(data) {
  if (data?.schemaVersion!==1 || !Array.isArray(data.provinces) || data.provinces.length!==34) throw new Error('Chưa tải đủ danh sách tỉnh/thành.');
  const provinces=new Set(),wards=new Set();
  for(const province of data.provinces) {
    if(!/^\d{2}$/.test(province.code)||!province.name||provinces.has(province.code)||!province.wards?.length)throw new Error('Dữ liệu tỉnh/thành không hợp lệ.');
    provinces.add(province.code);
    for(const ward of province.wards) {
      if(!/^\d{5}$/.test(ward.code)||!ward.name||wards.has(ward.code))throw new Error('Dữ liệu phường/xã không hợp lệ.');
      wards.add(ward.code);
    }
  }
  return data;
}

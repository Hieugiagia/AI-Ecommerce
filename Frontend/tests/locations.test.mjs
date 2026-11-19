import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { filterLocations, validateDivisions } from '../src/services/locationModel.js';
import { shippingFromAddress, addressLine } from '../src/services/addressModel.js';
const data=JSON.parse(fs.readFileSync(new URL('../public/data/vietnam-divisions.json',import.meta.url)));
test('local dataset has 34 provinces and 3321 uniquely coded wards, source and license',()=>{
  validateDivisions(data);
  assert.equal(data.provinces.flatMap(p=>p.wards).length,3321);
  assert.equal(data.license,'CC BY 4.0');
  assert.ok(data.source.startsWith('https://diachiviet.com/'));
});
test('province and ward search accepts accents, no accents and Vietnamese d-stroke',()=>{
  assert.equal(filterLocations(data.provinces,'ha noi')[0].name,'Thành phố Hà Nội');
  assert.ok(filterLocations(data.provinces,'dak lak').length===1);
  const hanoi=data.provinces.find(p=>p.code==='01');
  assert.equal(filterLocations(hanoi.wards,'ba dinh')[0].name,'Phường Ba Đình');
});
test('province lists never mix wards across province boundaries',()=>{
  const hanoi=data.provinces.find(p=>p.code==='01'),hcm=data.provinces.find(p=>p.code==='79');
  assert.ok(hanoi.wards.some(w=>w.name==='Phường Ba Đình'));
  assert.ok(!hcm.wards.some(w=>hanoi.wards.some(x=>x.code===w.code)));
});
test('two-level addresses fit existing API without repeating ward in shipping address',()=>{
  const row={id:1,receiverName:'An',receiverPhone:'0912345678',streetAddress:'12 Main',ward:'Phường Ba Đình',district:'Phường Ba Đình',city:'Thành phố Hà Nội',isDefault:true};
  const shipping=shippingFromAddress(row,{notes:'Keep'});
  assert.equal(shipping.address,'12 Main');
  assert.equal(shipping.district,row.ward);
  assert.equal(shipping.notes,'Keep');
  assert.equal(addressLine(row),'12 Main, Phường Ba Đình, Thành phố Hà Nội');
  const legacy={...row,district:'Quận Ba Đình'};
  assert.equal(shippingFromAddress(legacy).address,'12 Main, Phường Ba Đình');
  assert.ok(addressLine(legacy).includes('Quận Ba Đình'));
});
test('invalid source payload is rejected instead of silently showing incomplete locations',()=>{
  assert.throws(()=>validateDivisions({...data,provinces:data.provinces.slice(1)}));
  const clone=structuredClone(data);clone.provinces[1].wards.push(clone.provinces[0].wards[0]);
  assert.throws(()=>validateDivisions(clone));
});

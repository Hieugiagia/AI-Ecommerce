import test from 'node:test';
import assert from 'node:assert/strict';
import { addressPayload, normalizeAddresses, shippingFromAddress } from '../src/services/addressModel.js';
import { checkoutPayload } from '../src/services/checkoutModel.js';
const address = {id:1,receiverName:'Nguyen An',receiverPhone:'0912345678',streetAddress:'12 Main',ward:'Ward A',district:'Area A',city:'City A',isDefault:true};
test('address writes only editable fields and trim values; no user identity can be supplied',()=>{
  assert.deepEqual(addressPayload({...address,receiverName:' Nguyen An ',userId:999,id:70,role:'ROLE_ADMIN'}),Object.fromEntries(Object.entries(address).filter(([key])=>key!=='id')));
});
test('required and overlong address fields and invalid phones are rejected before writes',()=>{
  for(const changes of [{ward:' '},{streetAddress:'x'.repeat(101)},{receiverPhone:'123'},{receiverName:''}])assert.throws(()=>addressPayload({...address,...changes}));
});
test('address list rejects malformed rows, duplicate IDs and multiple defaults',()=>{
  for(const data of [null,{},[{}],[address,address],[address,{...address,id:2}]])assert.throws(()=>normalizeAddresses(data));
  assert.equal(normalizeAddresses([{...address,id:2,isDefault:false},address])[0].id,1);
  assert.deepEqual(normalizeAddresses([]),[]);
});
test('saved address becomes an editable shipping snapshot and preserves notes and unrelated form fields',()=>{
  const current={notes:'Call first',address:'Old street',fullName:'Old receiver'};
  const shipping=shippingFromAddress(address,current);
  assert.equal(shipping.notes,'Call first');assert.equal(shipping.address,'12 Main, Ward A');assert.equal(shipping.province,address.city);
  assert.equal(current.address,'Old street');
  const payload=checkoutPayload('12345678-1234-1234-1234-123456789abc',15000000,shipping);
  assert.equal(payload.shippingInfo.fullName,address.receiverName);
  assert.equal(payload.shippingInfo.notes,'Call first');
  assert.ok(!('addressId' in payload)&&!('userId' in payload));
});

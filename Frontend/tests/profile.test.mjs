import test from 'node:test';
import assert from 'node:assert/strict';
import { profilePayload, confirmedProfile } from '../src/services/profileModel.js';
const user = { id: 7, fullName: 'Old Name', email: 'user@example.test', phone: '0912345678', role: 'ROLE_USER' };

test('profile update only sends editable fields and normalizes names', () => {
  assert.deepEqual(profilePayload({fullName:'  Nguyen   An ',phone:' 0912345678 ',email:'other@test',role:'ROLE_ADMIN',id:99,address:'ignored'}),{fullName:'Nguyen An',phone:'0912345678'});
  assert.equal(profilePayload({fullName:'An',phone:'+84912345678'}).phone,'+84912345678');
});
test('invalid names and phone numbers cannot form an update request', () => {
  for(const form of [{fullName:' ',phone:user.phone},{fullName:'A'.repeat(256),phone:user.phone},{fullName:'An',phone:'123'},{fullName:'An',phone:'0912345678abc'}]) assert.throws(()=>profilePayload(form));
});
test('only an explicit confirmed response for the same account updates the local profile', () => {
  const updated={...user,fullName:'New Name'};
  assert.equal(confirmedProfile({success:true,user:updated},user),updated);
  for(const response of [null,{success:true},{user:updated},{success:false,user:updated},{success:true,user:{...updated,id:8}},{success:true,user:{...updated,email:'other@test'}},{success:true,user:{...updated,role:'ROLE_ADMIN'}}]) assert.throws(()=>confirmedProfile(response,user));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmedAuth } from '../src/services/authModel.js';

const reply = { success: true, accessToken: 'server-access-token', refreshToken: 'server-refresh-token',
  user: { id: 7, fullName: 'Test User', email: 'admin-name@example.test', role: 'ROLE_USER' } };
test('confirmed server session preserves user role even when email contains admin', () => {
  const session = confirmedAuth(reply);
  assert.equal(session.token,reply.accessToken);
  assert.equal(session.refreshToken,reply.refreshToken);
  assert.equal(session.user.role,'ROLE_USER');
  assert.equal(session.user,reply.user);
});
test('server admin role and legacy token field are accepted without guessing identity', () => {
  const session = confirmedAuth({...reply, accessToken:null, token:'legacy-server-token', user:{...reply.user,role:'ROLE_ADMIN'}});
  assert.equal(session.token,'legacy-server-token');
  assert.equal(session.user.role,'ROLE_ADMIN');
});
test('missing or rejected authentication data never creates a synthetic session', () => {
  for (const response of [null,{}, {...reply,success:false}, {...reply,accessToken:''}, {...reply,refreshToken:null},
    {...reply,user:null}, {...reply,user:{...reply.user,id:0}}, {...reply,user:{...reply.user,email:''}},
    {...reply,user:{...reply.user,fullName:''}}, {...reply,user:{...reply.user,role:undefined}}]) {
    assert.throws(()=>confirmedAuth(response));
  }
});

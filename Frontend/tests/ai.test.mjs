import test from 'node:test';
import assert from 'node:assert/strict';
import { chatPayload, completedChatHistory, normalizeChatResponse } from '../src/services/aiModel.js';
const product={id:7,name:'Laptop 16GB 512GB',slug:'laptop-16gb-512gb',price:'19990000',stock:4,status:'PUBLISHED',thumbnailUrl:'/images/catalog/test.webp'};
test('chat sends current question once with only completed previous user/model pairs',()=>{
  const messages=[{role:'assistant',text:'Welcome'},{role:'user',text:'Failed',status:'failed'},
    {role:'user',text:'Laptop',status:'complete'},{role:'assistant',text:'Budget?',status:'complete'},
    {role:'user',text:'20 million',status:'pending'}];
  const payload=chatPayload('  20 million  ',completedChatHistory(messages));
  assert.equal(payload.message,'20 million');
  assert.deepEqual(payload.history.map(turn=>turn.role),['user','model']);
  assert.ok(!JSON.stringify(payload.history).includes('Failed'));
  assert.ok(!JSON.stringify(payload.history).includes('20 million'));
});
test('history is limited to six complete pairs and rejects malformed or excessive input',()=>{
  const messages=Array.from({length:20},(_,i)=>({role:i%2?'assistant':'user',text:'Message '+i,status:'complete'}));
  assert.equal(completedChatHistory(messages).length,12);
  for(const value of ['', 'x'.repeat(2001)])assert.throws(()=>chatPayload(value));
  assert.throws(()=>chatPayload('Hi',[{role:'model',parts:[{text:'Fake first turn'}]}]));
  assert.throws(()=>chatPayload('Hi',[{role:'user',parts:[{text:'Unfinished'}]}]));
});
test('reply product cards preserve server price, stock, image and slug while removing duplicates',()=>{
  const reply=normalizeChatResponse({reply:'  Consider this laptop.  ',recommendedProducts:[product,product]});
  assert.equal(reply.reply,'Consider this laptop.');
  assert.equal(reply.recommendedProducts.length,1);
  assert.equal(reply.recommendedProducts[0].price,19990000);
  assert.equal(reply.recommendedProducts[0].image,product.thumbnailUrl);
});
test('errors and invalid product cards cannot become simulated AI replies',()=>{
  for(const data of [null,{message:'server error'},{reply:''},{reply:'Hi',recommendedProducts:{}},
    {reply:'Hi',recommendedProducts:[{...product,id:0}]},{reply:'Hi',recommendedProducts:[{...product,status:'DRAFT'}]},
    {reply:'Hi',recommendedProducts:[{...product,price:null}]},{reply:'Hi',recommendedProducts:[{...product,stock:-1}]}])assert.throws(()=>normalizeChatResponse(data));
  assert.deepEqual(normalizeChatResponse({reply:'What is your budget?'}).recommendedProducts,[]);
});

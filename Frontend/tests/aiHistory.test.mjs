import test from 'node:test';
import assert from 'node:assert/strict';
import { newAiDraft, readAiDraft, writeAiDraft, normalizeSessions, normalizeConversation, turnConfirmed, turnPayload } from '../src/services/aiHistoryModel.js';
const storage=()=>{const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};};
const id='12345678-1234-1234-1234-123456789abc';
const req='aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const conversation={id,title:'Laptop advice',messages:[
  {id:1,clientRequestId:req,role:'user',text:'Laptop',recommendedProducts:[]},
  {id:2,clientRequestId:req,role:'assistant',text:'What budget?',recommendedProducts:[]}
]};
test('pending chat survives reload with same request identity and is isolated by account',()=>{
 const store=storage(),draft={...newAiDraft(),selectedId:id,pending:{id:req,text:'Laptop'}};
 writeAiDraft(store,7,draft);
 assert.deepEqual(readAiDraft(store,7),draft);
 assert.equal(readAiDraft(store,8),null);
 assert.deepEqual(turnPayload(draft.pending),{requestId:req,message:'Laptop'});
});
test('storage failure prevents unsafe send instead of discarding request identity',()=>{
 assert.throws(()=>writeAiDraft({setItem(){throw new Error('Unavailable');}},7,newAiDraft()));
 assert.throws(()=>writeAiDraft(storage(),7,{clientKey:'invalid',selectedId:null}));
 assert.throws(()=>turnPayload({id:req,text:''}));
});
test('history preserves message IDs and confirms both messages without fake product cards',()=>{
 const result=normalizeConversation(conversation,id);
 assert.equal(result.messages[0].text,'Laptop');
 assert.equal(result.messages[1].status,'complete');
 assert.deepEqual(result.messages[1].recommendedProducts,[]);
 assert.ok(turnConfirmed(result,{id:req,text:'Laptop'}));
 assert.ok(!turnConfirmed(result,{id:req,text:'Different question'}));
 assert.ok(!turnConfirmed({...result,messages:result.messages.slice(0,1)},{id:req,text:'Laptop'}));
});
test('malformed and wrong-conversation responses cannot replace current chat',()=>{
 assert.throws(()=>normalizeConversation(conversation,req));
 assert.throws(()=>normalizeConversation({...conversation,messages:[conversation.messages[0],conversation.messages[0]]}));
 assert.throws(()=>normalizeConversation({...conversation,messages:[{id:1,role:'system',text:'Private prompt'}]}));
 assert.throws(()=>normalizeSessions([{id,title:'One'},{id,title:'Duplicate'}]));
 assert.deepEqual(normalizeSessions([]),[]);
});

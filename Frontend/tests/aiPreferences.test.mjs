import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAdvicePrompt } from '../src/services/aiPreferences.js';
const category={name:'Điện thoại',slug:'dien-thoai'};
test('guided request expresses a new category, brand and exact VND ceiling without old preferences',()=>{
 const prompt=buildAdvicePrompt({category,brand:' Samsung ',maxPrice:'15000000'});
 assert.ok(prompt.startsWith('Nhu cầu mới:'));
 assert.ok(prompt.includes('Điện thoại của Samsung'));
 assert.ok(prompt.includes('Ngân sách tối đa 15000000 đồng'));
 assert.ok(prompt.includes('Không dùng thương hiệu hay ngân sách của nhu cầu trước'));
});
test('omitted optional budget and brand do not invent constraints or claim available products',()=>{
 const prompt=buildAdvicePrompt({category});
 assert.ok(!prompt.includes('Ngân sách tối đa'));
 assert.ok(!prompt.includes('của Samsung'));
 assert.ok(prompt.includes('Nếu không có sản phẩm phù hợp, hãy nói rõ'));
});
test('invalid categories, brands and money are rejected before chat submission',()=>{
 assert.throws(()=>buildAdvicePrompt({category:null}));
 assert.throws(()=>buildAdvicePrompt({category,brand:'a'.repeat(51)}));
 for(const maxPrice of ['-1','0','1.5','not-money','10000000000000'])assert.throws(()=>buildAdvicePrompt({category,maxPrice}));
});

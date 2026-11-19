import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { validateReferenceCatalog, createCatalogPlan, runCatalogPlan } from '../src/services/catalogImportModel.js';

const catalog = JSON.parse(await readFile(new URL('../public/data/reference-catalog.json', import.meta.url), 'utf8'));
const all = catalog.categories.map(category => category.slug);
const categoryRows = catalog.categories.map((category,index) => ({ id: 100 + index, slug: category.slug, name: category.name, isActive: true }));
const tiny = () => structuredClone({ ...catalog, categories: [{ ...catalog.categories[0], products: catalog.categories[0].products.slice(0,2) }] });

test('reference catalog contains 15 groups, 20 distinct products each and 300 local source images', async () => {
  validateReferenceCatalog(catalog);
  assert.equal(catalog.categories.length,15);
  assert.equal(catalog.categories.reduce((sum,category)=>sum+category.products.length,0),300);
  for(const category of catalog.categories) {
    assert.equal(category.products.length,20);
    for(const product of category.products) {
      const image = await stat(new URL('../public'+product.thumbnailUrl,import.meta.url));
      assert.ok(image.size>300);
    }
  }
});

test('invalid prices, duplicate slugs and nonlocal image paths are rejected before import', () => {
  for(const mutate of [
    data => { data.categories[0].products[0].price=-1; },
    data => { data.categories[0].products[1].slug=data.categories[0].products[0].slug; },
    data => { data.categories[0].products[0].thumbnailUrl='https://example.test/image.jpg'; },
  ]) {
    const data=tiny();mutate(data);assert.throws(()=>validateReferenceCatalog(data));
  }
});

test('planning matches actual category IDs and skips existing products by slug or normalized name', () => {
  const data=tiny();
  const plan=createCatalogPlan(data,[categoryRows[0]],[
    {id:1,slug:'different-slug',name:data.categories[0].products[0].name.toUpperCase()},
  ],[all[0]]);
  assert.equal(plan.groups[0].existingId,100);
  assert.equal(plan.productsToCreate,1);assert.equal(plan.categoriesToCreate,0);assert.equal(plan.skipped,1);
});

test('batch creates 300 confirmed products, only missing categories, and a rerun performs no writes', async () => {
  let nextId=1000;const categories=categoryRows.slice(0,3);const products=[];let writes=0;
  const api={
    createCategory:async payload=>{writes++;const row={...payload,id:nextId++,isActive:true};categories.push(row);return row;},
    createProduct:async payload=>{writes++;assert.equal(payload.stock,20);assert.equal(payload.status,'PUBLISHED');assert.ok(categories.some(c=>c.id===payload.categoryId));const row={...payload,id:nextId++};products.push(row);return row;},
  };
  const first=await runCatalogPlan(createCatalogPlan(catalog,categories,products,all),{stock:20,api});
  assert.equal(first.createdProducts,300);assert.equal(first.createdCategories,12);assert.equal(first.phase,'complete');
  const previous=writes;
  const rerun=await runCatalogPlan(createCatalogPlan(catalog,categories,products,all),{stock:20,api});
  assert.equal(rerun.createdProducts,0);assert.equal(rerun.skipped,300);assert.equal(writes,previous);
});

test('lost create response stops as uncertain; rechecking server state skips the saved product on resume', async () => {
  const data=tiny();const products=[];let lose=true;let id=1;
  const api={createCategory:async()=>{throw Error('unexpected category create');},createProduct:async payload=>{
    const row={...payload,id:id++};products.push(row);
    if(lose){lose=false;throw new TypeError('Network response lost');}return row;
  }};
  await assert.rejects(runCatalogPlan(createCatalogPlan(data,[categoryRows[0]],products,[all[0]]),{api}),err=>err.uncertain&&err.progress.createdProducts===0);
  const resumed=await runCatalogPlan(createCatalogPlan(data,[categoryRows[0]],products,[all[0]]),{api});
  assert.equal(resumed.createdProducts,1);assert.equal(products.length,2);assert.equal(new Set(products.map(p=>p.slug)).size,2);
});

test('permission failures and mismatched success responses never count as successful imports', async () => {
  const data=tiny();const plan=createCatalogPlan(data,[categoryRows[0]],[],[all[0]]);
  await assert.rejects(runCatalogPlan(plan,{api:{createProduct:async()=>{throw Object.assign(new Error('Forbidden'),{status:403});}}}),err=>err.status===403&&!err.uncertain&&err.progress.createdProducts===0);
  await assert.rejects(runCatalogPlan(plan,{api:{createProduct:async payload=>({...payload,id:1,price:1})}}),err=>err.progress.createdProducts===0);
});

test('stop request completes the current product and performs no further writes', async () => {
  const data=tiny();const plan=createCatalogPlan(data,[categoryRows[0]],[],[all[0]]);
  let writes=0;const api={createProduct:async payload=>({...payload,id:++writes})};
  const result=await runCatalogPlan(plan,{api,shouldContinue:()=>writes<1});
  assert.equal(result.phase,'stopped');assert.equal(result.createdProducts,1);assert.equal(writes,1);
});

test('incomplete existing-product snapshots are rejected before planning any writes', () => {
  assert.throws(() => createCatalogPlan(tiny(), [categoryRows[0]], [{ name: 'Missing identity', slug: 'existing' }], [all[0]]));
});

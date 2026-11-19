import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolveProductOptions, optionPurchase, chooseVersion, versionChoices } from '../src/services/productOptionsModel.js';
import { validateReferenceCatalog, createCatalogPlan, runCatalogPlan } from '../src/services/catalogImportModel.js';

const metadata = JSON.parse(fs.readFileSync(new URL('../public/data/product-options.json', import.meta.url)));
const catalog = JSON.parse(fs.readFileSync(new URL('../public/data/reference-options.json', import.meta.url)));
const original = JSON.parse(fs.readFileSync(new URL('../public/data/reference-catalog.json', import.meta.url)));
const rows = catalog.categories.flatMap(category => category.products);
const live = (slug, price=12345678, stock=3) => ({ id:71, slug, price, stock, status:'PUBLISHED', name:'Server SKU' });

test('all 304 existing products have sourced specifications; every priced choice has real specs and an existing local image', () => {
  assert.equal(Object.keys(metadata.families).length, 304);
  for (const category of original.categories) for (const product of category.products) assert.ok(metadata.entries[product.slug]);
  for (const family of Object.values(metadata.families)) {
    assert.ok(Object.keys(family.specs).length > 0, family.name);
    assert.match(family.sourceUrl, /^https:\/\/(cellphones.com.vn|support.apple.com)\//);
    for (const option of family.options) {
      assert.ok(option.referencePrice >= 10000, option.slug);
      assert.ok(Object.keys(option.specs).length > 0, option.slug);
      assert.ok(fs.existsSync(new URL('../public' + option.image, import.meta.url)), option.slug);
    }
  }
  validateReferenceCatalog(catalog);
  assert.equal(rows.length, new Set(rows.map(row => row.slug)).size);
});

test('reference-only choices cannot be bought and cannot override server price or inventory', () => {
  const parent = live('iphone-18-pro');
  const data = resolveProductOptions(metadata, parent, []);
  assert.ok(data.options.length > 1);
  assert.equal(optionPurchase(data.options[0]), null);
  const sku = live(data.options[0].slug, 42000000, 2);
  const resolved = resolveProductOptions(metadata, parent, [sku]);
  assert.equal(optionPurchase(resolved.options[0]).id, 71);
  assert.equal(optionPurchase(resolved.options[0]).price, 42000000);
  assert.equal(versionChoices(resolved.options).find(item => item.version === resolved.options[0].version).price, 42000000);
});

test('version switches preserve color when a real SKU exists; otherwise choose an available SKU', () => {
  const options = [
    { slug:'a',version:'128GB',color:'Black',product:live('a') },
    { slug:'b',version:'256GB',color:'White',product:live('b') },
    { slug:'c',version:'256GB',color:'Black',product:live('c') },
  ];
  assert.equal(chooseVersion(options,'256GB',options[0]).slug,'c');
  assert.equal(chooseVersion(options,'256GB',{color:'Red'}).slug,'b');
});

test('unpublished, out-of-stock and malformed SKU choices are never purchasable', () => {
  for (const changes of [{stock:0},{stock:-1},{stock:1.5},{status:'DRAFT'},{id:null},{id:0},{price:NaN},{price:0}]) {
    assert.equal(optionPurchase({product:{...live('a'),...changes}}), null);
  }
});

test('direct SKU URLs resolve to the same family and exact selected SKU', () => {
  const option = metadata.families['iphone-18-pro'].options[0];
  const data = resolveProductOptions(metadata, live(option.slug), []);
  assert.equal(data.initialSlug, option.slug);
  assert.equal(optionPurchase(data.options.find(o => o.slug===option.slug)).id,71);
  assert.equal(resolveProductOptions(metadata, live('custom-product'), []), null);
});

test('all SKU rows import through existing product DTO and a second run creates nothing', async () => {
  const categories = catalog.categories.map((category,index) => ({...category,id:index+1,isActive:true}));
  const stored = original.categories.flatMap(category => category.products).map((p,index)=>({...p,id:index+1}));
  const plan = createCatalogPlan(catalog,categories,stored,categories.map(c=>c.slug));
  const initialCount = stored.length;
  assert.ok(plan.productsToCreate > 900);
  await runCatalogPlan(plan,{api:{
    createCategory(){throw new Error('all categories already exist');},
    async createProduct(body){
      assert.deepEqual(Object.keys(body).sort(),['name','slug','description','price','stock','categoryId','thumbnailUrl','status'].sort());
      const row = {...body,id:stored.length+1};stored.push(row);return row;
    }
  }});
  assert.equal(stored.length-initialCount,plan.productsToCreate);
  const again = createCatalogPlan(catalog,categories,stored,categories.map(c=>c.slug));
  assert.equal(again.productsToCreate,0);
});

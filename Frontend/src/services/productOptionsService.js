import { productService } from './productService';
import { resolveProductOptions } from './productOptionsModel.js';

let metadataPromise;
async function loadMetadata() {
  if (!metadataPromise) metadataPromise = fetch('/data/product-options.json').then(async response => {
    if (!response.ok) throw new Error('Chưa tải được thông số và các phiên bản.');
    const data = await response.json();
    if (data.schemaVersion !== 1 || !data.entries || !data.families) throw new Error('Dữ liệu phiên bản không hợp lệ.');
    return data;
  }).catch(error => { metadataPromise = null; throw error; });
  return metadataPromise;
}

export async function loadProductOptions(product) {
  const metadata = await loadMetadata();
  if (!metadata.entries[product.slug]) return null;
  const family = metadata.families[metadata.entries[product.slug].family];
  const products = [];
  // Refresh on every detail visit: prices, publication state and stock belong to the API.
  for (let page = 1; page <= 200; page++) {
    const batch = await productService.getProducts({ category: family.category, page, limit: 50 });
    if (!Number.isInteger(batch.total) || batch.total < 0) throw new Error('Không kiểm tra được các phiên bản đang bán.');
    products.push(...batch.products);
    if (page * 50 >= batch.total) return resolveProductOptions(metadata, product, products);
    if (!batch.products.length) throw new Error('Danh sách phiên bản đã thay đổi. Vui lòng tải lại.');
  }
  throw new Error('Chưa tải đủ các phiên bản đang bán.');
}

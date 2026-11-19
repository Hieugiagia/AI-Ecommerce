import { apiRequest } from './api';
import { productService } from './productService';
import { validateReferenceCatalog } from './catalogImportModel.js';

export async function loadReferenceCatalog(kind = 'products') {
  const response = await fetch(kind === 'options' ? '/data/reference-options.json' : '/data/reference-catalog.json');
  if (!response.ok) throw new Error('Không tải được bộ sản phẩm tham khảo.');
  return validateReferenceCatalog(await response.json());
}

export async function loadExistingCatalog() {
  const categories = await apiRequest('/categories');
  if (!Array.isArray(categories)) throw new Error('Danh sách danh mục hiện có không hợp lệ.');
  const products = [];
  const seen = new Set();
  for (let page = 1; page <= 10000; page++) {
    const batch = await productService.getAdminProducts({ page, limit: 50, sort: 'newest' });
    if (!Number.isInteger(batch.total) || batch.total < 0 || !Array.isArray(batch.products)) throw new Error('Danh sách sản phẩm hiện có không hợp lệ.');
    for (const product of batch.products) {
      if (!Number.isInteger(product?.id) || product.id < 1 || typeof product.slug !== 'string' || !product.slug
        || typeof product.name !== 'string' || !product.name.trim()) {
        throw new Error('Dữ liệu sản phẩm hiện có không đủ để kiểm tra trùng. Chưa nhập thêm sản phẩm.');
      }
      if (!seen.has(product.id)) { seen.add(product.id); products.push(product); }
    }
    if (page * 50 >= batch.total) return { categories, products };
    if (!batch.products.length) throw new Error('Danh sách sản phẩm thay đổi trong lúc kiểm tra. Hãy tải lại dữ liệu.');
  }
  throw new Error('Danh mục quá lớn để kiểm tra trong một lần. Chưa có dữ liệu nào được nhập.');
}

export const catalogImportApi = {
  createCategory: payload => apiRequest('/categories', { method: 'POST', body: payload }),
  createProduct: payload => productService.createProduct(payload),
};

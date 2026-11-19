const normalName = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const validSlug = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 240;
const sourceUrl = value => {
  try { const url = new URL(value); return url.protocol === 'https:' && (url.hostname === 'cellphones.com.vn' || url.hostname.endsWith('.cellphones.com.vn')); }
  catch { return false; }
};

export function validateReferenceCatalog(data) {
  if (data?.schemaVersion !== 1 || !Array.isArray(data.categories) || !data.categories.length
    || !/^\d{4}-\d{2}-\d{2}$/.test(data.referenceDate || '') || !sourceUrl(data.sourceUrl)) {
    throw new Error('Bộ dữ liệu tham khảo không hợp lệ.');
  }
  const categories = new Set(), products = new Set();
  for (const category of data.categories) {
    if (!validSlug(category.slug) || categories.has(category.slug) || !category.name || !sourceUrl(category.sourceUrl)
      || !Array.isArray(category.products) || !category.products.length) throw new Error('Danh mục trong bộ dữ liệu không hợp lệ.');
    categories.add(category.slug);
    for (const product of category.products) {
      if (!validSlug(product.slug) || products.has(product.slug) || typeof product.name !== 'string' || !product.name.trim() || product.name.length > 255
        || !Number.isFinite(product.price) || product.price <= 0 || product.price > 9999999999999
        || !/^\/images\/catalog\/[a-z0-9-]+\.(?:jpg|png|webp|avif)$/.test(product.thumbnailUrl || '')
        || !sourceUrl(product.sourceUrl) || !sourceUrl(product.sourceImageUrl)) {
        throw new Error('Sản phẩm trong bộ dữ liệu không hợp lệ: ' + (product.name || product.slug || 'không rõ tên'));
      }
      products.add(product.slug);
    }
  }
  return data;
}

export function createCatalogPlan(catalog, existingCategories, existingProducts, selectedSlugs) {
  validateReferenceCatalog(catalog);
  if (!Array.isArray(existingCategories) || !Array.isArray(existingProducts)) throw new Error('Chưa tải đủ dữ liệu hiện có để kiểm tra trùng.');
  if (existingProducts.some(product => !Number.isInteger(product?.id) || product.id < 1
    || typeof product.slug !== 'string' || !product.slug || typeof product.name !== 'string' || !product.name.trim())) {
    throw new Error('Dữ liệu sản phẩm hiện có không đủ để kiểm tra trùng.');
  }
  const selected = new Set(selectedSlugs);
  const names = new Set(existingProducts.map(product => normalName(product.name)));
  const slugs = new Set(existingProducts.map(product => product.slug));
  const groups = catalog.categories.filter(category => selected.has(category.slug)).map(category => {
    const existing = existingCategories.find(item => item.slug === category.slug)
      || existingCategories.find(item => normalName(item.name) === normalName(category.name));
    if (existing && (!Number.isInteger(existing.id) || existing.id < 1 || existing.isActive === false)) {
      throw new Error('Danh mục "' + category.name + '" đang ngừng hoạt động hoặc có dữ liệu không hợp lệ.');
    }
    const products = category.products.filter(product => !slugs.has(product.slug) && !names.has(normalName(product.name)));
    return { category, existingId: existing?.id || null, products, skipped: category.products.length - products.length };
  });
  return {
    groups,
    productsToCreate: groups.reduce((sum, group) => sum + group.products.length, 0),
    categoriesToCreate: groups.filter(group => !group.existingId && group.products.length).length,
    skipped: groups.reduce((sum, group) => sum + group.skipped, 0),
  };
}

export async function runCatalogPlan(plan, { stock = 20, api, onProgress = () => {}, shouldContinue = () => true }) {
  if (!Number.isInteger(stock) || stock < 1 || stock > 9999) throw new Error('Tồn kho khởi tạo phải là số nguyên từ 1 đến 9999.');
  const progress = { createdProducts: 0, createdCategories: 0, skipped: plan.skipped, totalProducts: plan.productsToCreate, current: '', phase: 'starting' };
  const report = () => onProgress({ ...progress });
  const stop = () => { progress.phase = 'stopped'; report(); return { ...progress }; };
  report();
  try {
    const categoryIds = new Map();
    for (const group of plan.groups) {
      if (!group.products.length) continue;
      if (!shouldContinue()) return stop();
      let categoryId = group.existingId;
      if (!categoryId) {
        progress.phase = 'category'; progress.current = group.category.name; report();
        const category = await api.createCategory({ name: group.category.name, slug: group.category.slug, parentId: null });
        if (!Number.isInteger(category?.id) || category.id < 1 || category.slug !== group.category.slug) {
          throw new Error('Máy chủ chưa xác nhận danh mục vừa tạo. Hãy kiểm tra lại trước khi tiếp tục.');
        }
        categoryId = category.id;
        progress.createdCategories++;
      }
      categoryIds.set(group.category.slug, categoryId);
    }
    // Interleave groups so newest-product feeds show a variety of categories.
    const groups = [...plan.groups].reverse();
    const largest = Math.max(0, ...groups.map(group => group.products.length));
    for (let index = largest - 1; index >= 0; index--) {
      for (const group of groups) {
        const product = group.products[index];
        if (!product) continue;
        if (!shouldContinue()) return stop();
        const categoryId = categoryIds.get(group.category.slug);
        progress.phase = 'product'; progress.current = product.name; report();
        const created = await api.createProduct({
          name: product.name, slug: product.slug, description: product.description || '',
          price: product.price, stock, categoryId, thumbnailUrl: product.thumbnailUrl, status: 'PUBLISHED',
        });
        if (!Number.isInteger(created?.id) || created.id < 1 || created.slug !== product.slug
          || Number(created.categoryId) !== categoryId || Number(created.price) !== product.price) {
          throw new Error('Máy chủ chưa xác nhận đúng sản phẩm vừa tạo. Hãy kiểm tra lại trước khi tiếp tục.');
        }
        progress.createdProducts++;
        report();
      }
    }
    progress.phase = 'complete'; progress.current = ''; report();
    return { ...progress };
  } catch (cause) {
    const error = new Error(cause.message || 'Không thể tiếp tục nhập sản phẩm.');
    error.status = cause.status;
    error.progress = { ...progress, phase: 'error' };
    error.uncertain = !cause.status || cause.status >= 500;
    throw error;
  }
}

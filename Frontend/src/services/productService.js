import { apiRequest } from './api';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/mockData';

/**
 * Product Service
 * Khớp chuẩn 100% với Router /products của Backend:
 * - GET  /products     : Tìm kiếm, lọc, phân trang (query params: q, category, brand, minPrice, maxPrice, page, limit, sort)
 * - GET  /products/{id}: Xem chi tiết 1 sản phẩm
 * - POST /products     : Thêm mới sản phẩm
 * - PUT  /products/{id}: Cập nhật thông tin, tồn kho
 */

export const productService = {
  /**
   * Lấy danh sách sản phẩm với bộ lọc & phân trang
   * GET /products
   */
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('q', params.search);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.brand && params.brand !== 'all') query.append('brand', params.brand);
    if (params.minPrice) query.append('minPrice', params.minPrice);
    if (params.maxPrice) query.append('maxPrice', params.maxPrice);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    if (params.sort) query.append('sort', params.sort);

    const queryString = query.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    try {
      const data = await apiRequest(endpoint, { method: 'GET' });
      if (Array.isArray(data)) {
        return { products: data, total: data.length };
      }
      if (data && Array.isArray(data.products)) {
        return data;
      }
      return { products: INITIAL_PRODUCTS, total: INITIAL_PRODUCTS.length };
    } catch {
      // Fallback khi backend chưa chạy
      let filtered = [...INITIAL_PRODUCTS];
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
      }
      if (params.category && params.category !== 'all') {
        filtered = filtered.filter((p) => p.category === params.category);
      }
      if (params.brand && params.brand !== 'all') {
        filtered = filtered.filter((p) => p.brand?.toLowerCase() === params.brand.toLowerCase());
      }
      return { products: filtered, total: filtered.length };
    }
  },

  /**
   * Xem chi tiết sản phẩm theo ID hoặc Slug
   * GET /products/{id}
   */
  async getProductById(id) {
    try {
      const data = await apiRequest(`/products/${id}`, { method: 'GET' });
      return data?.product || data;
    } catch {
      // Fallback tìm trong mockData
      return (
        INITIAL_PRODUCTS.find((p) => String(p.id) === String(id) || p.slug === String(id)) || null
      );
    }
  },

  /**
   * Thêm mới sản phẩm
   * POST /products
   * @param {Object} productData
   */
  async createProduct(productData) {
    return await apiRequest('/products', {
      method: 'POST',
      body: productData,
    });
  },

  /**
   * Cập nhật thông tin sản phẩm, tồn kho
   * PUT /products/{id}
   * @param {string|number} id
   * @param {Object} productData
   */
  async updateProduct(id, productData) {
    return await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: productData,
    });
  },

  /**
   * Xóa sản phẩm
   * DELETE /products/{id}
   */
  async deleteProduct(id) {
    return await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

export default productService;

import { apiRequest } from './api';
import { CATEGORIES as INITIAL_CATEGORIES } from '../data/mockData';

/**
 * Category Service
 * Khớp chuẩn 100% với Router /categories của Backend:
 * - GET  /categories : Lấy cây danh mục
 * - POST /categories : Tạo danh mục
 */

export const categoryService = {
  /**
   * Lấy toàn bộ cây danh mục
   * GET /categories
   */
  async getCategories() {
    try {
      const data = await apiRequest('/categories', { method: 'GET' });
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.categories)) return data.categories;
      if (data && Array.isArray(data.data)) return data.data;
      return INITIAL_CATEGORIES;
    } catch {
      // Fallback về mock data nếu Backend chưa bật
      return INITIAL_CATEGORIES;
    }
  },

  /**
   * Tạo danh mục mới
   * POST /categories
   * @param {Object} categoryData - { name, slug, icon, parentId }
   */
  async createCategory(categoryData) {
    return await apiRequest('/categories', {
      method: 'POST',
      body: categoryData,
    });
  },
};

export default categoryService;

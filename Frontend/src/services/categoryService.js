import { apiRequest } from './api';
import { CATEGORIES as INITIAL_CATEGORIES } from '../data/mockData';

/**
 * Category Service
 * Khớp chuẩn 100% với PostgreSQL Database & Spring Boot Controller:
 * Bảng categories:
 * - id: Long (PK)
 * - name: String (NOT NULL)
 * - slug: String (UNIQUE)
 * - isActive: Boolean (is_active)
 * - createdAt: Timestamp (created_at)
 *
 * Endpoint:
 * - GET  /api/categories : Lấy toàn bộ danh sách danh mục
 * - POST /api/categories : Tạo danh mục mới
 */

export const categoryService = {
  /**
   * Lấy toàn bộ danh mục từ Backend
   * GET /api/categories
   * @returns {Promise<Array>}
   */
  async getCategories() {
    try {
      const data = await apiRequest('/categories', { method: 'GET' });
      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (data && Array.isArray(data.categories)) {
        list = data.categories;
      } else if (data && Array.isArray(data.data)) {
        list = data.data;
      }

      if (list && list.length > 0) {
        return list.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          isActive: c.isActive !== undefined ? c.isActive : (c.is_active !== undefined ? c.is_active : true),
          createdAt: c.createdAt || c.created_at,
          description: c.description || `Danh mục ${c.name} chính hãng`,
          icon: c.icon || null,
        }));
      }

      // Nếu Backend trả về mảng rỗng thì trả về rỗng
      if (Array.isArray(data)) {
        return [];
      }

      return INITIAL_CATEGORIES;
    } catch (err) {
      console.warn('Backend chưa sẵn sàng hoặc lỗi /api/categories, sử dụng danh mục dự phòng:', err.message);
      return INITIAL_CATEGORIES;
    }
  },

  /**
   * Tạo danh mục mới
   * POST /api/categories
   * @param {Object} categoryData - { name, slug, isActive }
   */
  async createCategory(categoryData) {
    return await apiRequest('/categories', {
      method: 'POST',
      body: {
        name: categoryData.name,
        slug: categoryData.slug,
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
      },
    });
  },
};

export default categoryService;


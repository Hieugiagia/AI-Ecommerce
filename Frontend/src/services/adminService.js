import { apiRequest } from './api';

/**
 * Admin Dashboard Service
 * Khớp chuẩn 100% với Router /admin/dashboard của Backend:
 * - GET /admin/dashboard/overview    : Xem số liệu tổng quan kinh doanh
 * - GET /admin/dashboard/top-selling : Top sản phẩm bán chạy
 */

export const adminService = {
  /**
   * Lấy số liệu tổng quan kinh doanh (Doanh thu, đơn hàng, khách hàng, biểu đồ)
   * GET /admin/dashboard/overview
   */
  async getOverview() {
    return await apiRequest('/admin/dashboard/overview', {
      method: 'GET',
    });
  },

  /**
   * Lấy danh sách top sản phẩm bán chạy nhất
   * GET /admin/dashboard/top-selling
   */
  async getTopSelling() {
    return await apiRequest('/admin/dashboard/top-selling', {
      method: 'GET',
    });
  },
};

export default adminService;

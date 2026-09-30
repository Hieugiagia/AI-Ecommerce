import { apiRequest } from './api';

/**
 * Cart Service
 * Khớp chuẩn 100% với Router /cart và /cart/items của Backend:
 * - GET    /cart                  : Xem giỏ hàng của user
 * - DELETE /cart/clear            : Xóa toàn bộ giỏ hàng
 * - POST   /cart/items            : Thêm vào giỏ hàng
 * - PATCH  /cart/items/{itemID}   : Thay đổi số lượng mua
 * - DELETE /cart/items/{itemID}   : Xóa 1 món nào đó khỏi giỏ
 */

export const cartService = {
  /**
   * Lấy giỏ hàng của người dùng hiện tại
   * GET /cart
   */
  async getCart() {
    return await apiRequest('/cart', { method: 'GET' });
  },

  /**
   * Xóa sạch toàn bộ giỏ hàng
   * DELETE /cart/clear
   */
  async clearCart() {
    return await apiRequest('/cart/clear', { method: 'DELETE' });
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   * POST /cart/items
   * @param {Object} itemData - { productId, quantity, variant, color }
   */
  async addItem(itemData) {
    return await apiRequest('/cart/items', {
      method: 'POST',
      body: itemData,
    });
  },

  /**
   * Cập nhật số lượng của một mục trong giỏ
   * PATCH /cart/items/{itemID}
   * @param {string|number} itemID
   * @param {number} quantity
   */
  async updateItemQuantity(itemID, quantity) {
    return await apiRequest(`/cart/items/${itemID}`, {
      method: 'PATCH',
      body: { quantity },
    });
  },

  /**
   * Xóa 1 món khỏi giỏ hàng
   * DELETE /cart/items/{itemID}
   * @param {string|number} itemID
   */
  async removeItem(itemID) {
    return await apiRequest(`/cart/items/${itemID}`, {
      method: 'DELETE',
    });
  },
};

export default cartService;

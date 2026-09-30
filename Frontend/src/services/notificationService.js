import { apiRequest } from './api';

/**
 * Notification Service
 * Khớp chuẩn 100% với Router /notifications của Backend:
 * - GET   /notifications          : Lấy danh sách thông báo
 * - PATCH /notifications/{id}/read: Đánh dấu đã đọc 1 thông báo
 * - PATCH /notifications/read-all : Đánh dấu đọc tất cả thông báo
 */

export const notificationService = {
  /**
   * Lấy danh sách thông báo
   * GET /notifications
   */
  async getNotifications() {
    try {
      const data = await apiRequest('/notifications', { method: 'GET' });
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.notifications)) return data.notifications;
      return [];
    } catch {
      // Dữ liệu mẫu ban đầu để hiển thị demo khi backend chưa bật
      return [
        {
          id: 'notif_1',
          title: 'Chào mừng thành viên mới!',
          message: 'Chào mừng bạn đến với Alibaba Store. Tặng bạn mã WELCOME50K giảm 50k cho đơn đầu tiên.',
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          type: 'promotion',
        },
        {
          id: 'notif_2',
          title: 'Ưu đãi Siêu Sale AI Tech',
          message: 'Giảm đến 30% cho các dòng laptop và phụ kiện công nghệ tuần này.',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          type: 'system',
        },
      ];
    }
  },

  /**
   * Đánh dấu 1 thông báo là đã đọc
   * PATCH /notifications/{id}/read
   * @param {string|number} id
   */
  async markAsRead(id) {
    return await apiRequest(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   * PATCH /notifications/read-all
   */
  async markAllAsRead() {
    return await apiRequest('/notifications/read-all', {
      method: 'PATCH',
    });
  },
};

export default notificationService;

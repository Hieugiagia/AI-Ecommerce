import { apiRequest } from './api';

/**
 * AI Service
 * Khớp chuẩn 100% với Router /ai của Backend:
 * - POST /ai/chat            : Trò chuyện tư vấn mua sắm
 * - GET  /ai/recommendations : Lấy danh sách sản phẩm tư vấn
 */

export const aiService = {
  /**
   * Trò chuyện tư vấn mua sắm thông minh
   * POST /ai/chat
   * @param {string} message - Câu hỏi của người dùng
   * @param {Array} history - Lịch sử trò chuyện [{ role: 'user' | 'model', parts: [{ text }] }]
   */
  async chat(message, history = []) {
    return await apiRequest('/ai/chat', {
      method: 'POST',
      body: { message, history },
    });
  },

  /**
   * Lấy danh sách sản phẩm do AI gợi ý
   * GET /ai/recommendations
   */
  async getRecommendations() {
    try {
      const data = await apiRequest('/ai/recommendations', { method: 'GET' });
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.recommendations)) return data.recommendations;
      return [];
    } catch {
      return [];
    }
  },
};

export default aiService;

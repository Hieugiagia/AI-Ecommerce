import { apiRequest } from './api';
import { chatPayload, normalizeChatResponse } from './aiModel.js';

export const aiService = {
  async chat(message, history = [], { signal } = {}) {
    const body = chatPayload(message, history);
    const controller = new AbortController();
    const cancel = () => controller.abort();
    signal?.addEventListener('abort', cancel, { once: true });
    if (signal?.aborted) controller.abort();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      return normalizeChatResponse(await apiRequest('/ai/chat', { method: 'POST', body, signal: controller.signal }));
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('Trợ lý chưa phản hồi kịp. Bạn có thể thử lại câu hỏi.');
      if ([404, 405, 503].includes(error.status)) throw new Error('Trợ lý tư vấn hiện chưa sẵn sàng. Vui lòng thử lại sau.');
      throw error;
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', cancel);
    }
  },
  async getRecommendations() {
    const data = await apiRequest('/ai/recommendations');
    if (Array.isArray(data)) return data;
    if (!Array.isArray(data?.recommendations)) throw new Error('Chưa tải được sản phẩm tư vấn.');
    return data.recommendations;
  },
};

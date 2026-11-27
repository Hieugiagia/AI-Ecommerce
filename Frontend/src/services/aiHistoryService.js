import { apiRequest } from './api';
import { normalizeSessions, normalizeConversation, turnConfirmed, turnPayload } from './aiHistoryModel.js';
async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try { return await apiRequest(path, { ...options, signal: controller.signal }); }
  catch (error) {
    if (error.name === 'AbortError') throw new Error('Chưa nhận được xác nhận lịch sử. Hãy thử lại cùng câu hỏi để kiểm tra kết quả.');
    throw error;
  } finally { clearTimeout(timer); }
}
export const aiHistoryService = {
  async list() { return normalizeSessions(await request('/ai/sessions')); },
  async get(id) { return normalizeConversation(await request('/ai/sessions/' + encodeURIComponent(id)), id); },
  async create(clientKey, title) {
    const row = await request('/ai/sessions', { method: 'POST', body: { clientKey, title: title.slice(0,100) } });
    return normalizeSessions([row])[0];
  },
  async send(id, attempt) {
    const conversation = normalizeConversation(await request('/ai/sessions/' + encodeURIComponent(id) + '/turns', { method: 'POST', body: turnPayload(attempt) }), id);
    if (!turnConfirmed(conversation, attempt)) throw new Error('Máy chủ chưa xác nhận đầy đủ câu hỏi và câu trả lời. Vui lòng kiểm tra lại.');
    return conversation;
  },
};

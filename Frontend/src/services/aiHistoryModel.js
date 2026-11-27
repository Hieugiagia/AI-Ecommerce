import { normalizeChatResponse } from './aiModel.js';
const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
export const aiDraftKey = account => 'zentro_ai_draft:' + account;
export function newAiDraft() { return { selectedId: null, clientKey: crypto.randomUUID(), pending: null }; }
export function readAiDraft(storage, account) {
  try {
    const data = JSON.parse(storage.getItem(aiDraftKey(account)));
    if (!data || !uuid(data.clientKey) || (data.selectedId !== null && !uuid(data.selectedId))) return null;
    if (data.pending && (!uuid(data.pending.id) || typeof data.pending.text !== 'string' || !data.pending.text.trim() || data.pending.text.length > 2000)) return null;
    return data;
  } catch { return null; }
}
export function writeAiDraft(storage, account, data) {
  if (!account || !uuid(data.clientKey) || (data.selectedId !== null && !uuid(data.selectedId))) throw new Error('Chưa chuẩn bị được cuộc trò chuyện.');
  storage.setItem(aiDraftKey(account), JSON.stringify(data));
  return data;
}
export function normalizeSessions(data) {
  if (!Array.isArray(data)) throw new Error('Chưa đọc được danh sách hội thoại.');
  const seen = new Set();
  return data.map(row => {
    if (!uuid(row?.id) || typeof row.title !== 'string' || !row.title.trim() || seen.has(row.id)) throw new Error('Danh sách hội thoại không hợp lệ.');
    seen.add(row.id);
    return { ...row };
  });
}
export function normalizeConversation(data, expectedId) {
  if (!uuid(data?.id) || (expectedId && data.id !== expectedId) || !Array.isArray(data.messages) || typeof data.title !== 'string') throw new Error('Chưa đọc được cuộc trò chuyện.');
  const seen = new Set();
  const messages = data.messages.map(row => {
    if (!Number.isSafeInteger(row?.id) || row.id < 1 || seen.has(row.id) || !['user','assistant'].includes(row.role)
      || typeof row.text !== 'string' || !row.text.trim() || row.text.length > (row.role === 'user' ? 2000 : 12000)) throw new Error('Tin nhắn đã lưu không hợp lệ.');
    seen.add(row.id);
    const reply = row.role === 'assistant' ? normalizeChatResponse({ reply: row.text, recommendedProducts: row.recommendedProducts || [] }) : null;
    return { ...row, status: 'complete', recommendedProducts: reply?.recommendedProducts || [] };
  });
  return { ...data, messages };
}
export function turnConfirmed(conversation, attempt) {
  return conversation.messages.some(row => row.role === 'user' && row.clientRequestId === attempt.id && row.text === attempt.text)
    && conversation.messages.some(row => row.role === 'assistant' && row.clientRequestId === attempt.id);
}
export function turnPayload(attempt) {
  if (!uuid(attempt?.id) || typeof attempt.text !== 'string' || !attempt.text.trim() || attempt.text.length > 2000) throw new Error('Câu hỏi không hợp lệ.');
  return { requestId: attempt.id, message: attempt.text.trim() };
}

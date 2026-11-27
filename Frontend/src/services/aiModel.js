const MAX_MESSAGE = 2000;
export function chatPayload(message, history = []) {
  const text = String(message || '').trim();
  if (!text || text.length > MAX_MESSAGE) throw new Error('Câu hỏi cần từ 1 đến 2.000 ký tự.');
  if (!Array.isArray(history) || history.length > 12) throw new Error('Lịch sử trò chuyện không hợp lệ.');
  const cleanHistory = history.map((turn, index) => {
    if (turn?.role !== (index % 2 === 0 ? 'user' : 'model') || !Array.isArray(turn.parts)
      || turn.parts.length !== 1 || typeof turn.parts[0]?.text !== 'string'
      || !turn.parts[0].text.trim() || turn.parts[0].text.length > (turn.role === 'user' ? 2000 : 12000)) throw new Error('Lịch sử trò chuyện không hợp lệ.');
    return { role: turn.role, parts: [{ text: turn.parts[0].text.trim() }] };
  });
  if (cleanHistory.length % 2) throw new Error('Lịch sử trò chuyện chưa hoàn tất.');
  return { message: text, history: cleanHistory };
}
export function completedChatHistory(messages) {
  const turns = [];
  for (let index = 0; index < messages.length - 1; index++) {
    const user = messages[index], assistant = messages[index + 1];
    if (user.role === 'user' && user.status === 'complete' && assistant.role === 'assistant' && assistant.status === 'complete') {
      turns.push({ role: 'user', parts: [{ text: user.text }] }, { role: 'model', parts: [{ text: assistant.text }] });
      index++;
    }
  }
  return turns.slice(-12);
}
export function normalizeChatResponse(data) {
  if (typeof data?.reply !== 'string' || !data.reply.trim() || data.reply.length > 12000
    || (data.recommendedProducts !== undefined && !Array.isArray(data.recommendedProducts))) {
    throw new Error('Chưa đọc được phản hồi từ trợ lý. Vui lòng thử lại.');
  }
  const seen = new Set();
  const products = (data.recommendedProducts || []).map(product => {
    if (!Number.isSafeInteger(product?.id) || product.id < 1 || typeof product.name !== 'string' || !product.name.trim()
      || typeof product.slug !== 'string' || !product.slug.trim() || product.price === null
      || product.price === '' || !Number.isFinite(Number(product.price)) || Number(product.price) < 0
      || !Number.isInteger(product.stock) || product.stock < 0 || product.status !== 'PUBLISHED') {
      throw new Error('Thông tin sản phẩm tư vấn chưa được xác nhận. Vui lòng thử lại.');
    }
    return { ...product, price: Number(product.price), image: product.thumbnailUrl || product.image || '/zentro-mark.svg' };
  }).filter(product => { if (seen.has(product.id)) return false; seen.add(product.id); return true; }).slice(0, 4);
  return { reply: data.reply.trim(), recommendedProducts: products };
}

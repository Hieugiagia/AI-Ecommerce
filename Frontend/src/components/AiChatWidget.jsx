import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, ArrowRight } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import { Link } from 'react-router-dom';
import { aiService } from '../services/aiService';

export default function AiChatWidget({ isOpen, onClose }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Xin chào! Mình là trợ lý AI tư vấn của Alibaba-Store. Bạn đang tìm thiết bị nào hoặc cần tư vấn cấu hình ra sao?',
      recommendedProducts: [],
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    'Laptop cho đồ họa & lập trình?',
    'iPhone 15 Pro Max giá tốt?',
    'Tai nghe chống ồn đỉnh nhất?',
    'Rabbit R1 là gì?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (userText) => {
    const textToSend = userText || input;
    if (!textToSend.trim()) return;

    const userMsg = { role: 'user', text: textToSend };
    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    if (!userText) setInput('');
    setIsTyping(true);

    try {
      const history = currentMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }));
      const res = await aiService.chat(textToSend, history);
      if (res && (res.reply || res.text || res.message)) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: res.reply || res.text || res.message,
            recommendedProducts: res.recommendedProducts || [],
          },
        ]);
        setIsTyping(false);
        return;
      }
    } catch {
      // Fallback về mock matching nếu Backend chưa bật
    }

    // AI intelligent fallback matching
    setTimeout(() => {
      let replyText = '';
      let matched = [];
      const lower = textToSend.toLowerCase();

      if (lower.includes('laptop') || lower.includes('macbook') || lower.includes('lập trình') || lower.includes('xps')) {
        matched = PRODUCTS.filter((p) => p.category === 'laptop');
        replyText =
          'Với nhu cầu làm việc, code và đồ họa nặng, mình gợi ý MacBook Pro 16 M3 Max (pin 22h, 36GB RAM chạy mô hình AI cực tốt) hoặc Dell XPS 13 Plus mỏng nhẹ tinh tế!';
      } else if (lower.includes('iphone') || lower.includes('s24') || lower.includes('điện thoại')) {
        matched = PRODUCTS.filter((p) => p.category === 'dien-thoai');
        replyText =
          'Trong phân khúc flagship hiện tại, iPhone 15 Pro Max nổi bật với khung titan và zoom quang 5x, còn Galaxy S24 Ultra trang bị các tính năng Galaxy AI dịch thuật và khoanh vùng tìm kiếm siêu nhạy.';
      } else if (lower.includes('tai nghe') || lower.includes('âm thanh') || lower.includes('chống ồn')) {
        matched = PRODUCTS.filter((p) => p.category === 'am-thanh');
        replyText =
          'Sony WH-1000XM5 đang là lựa chọn số 1 về khả năng chống ồn chủ động và đàm thoại lọc gió thông minh!';
      } else if (lower.includes('rabbit') || lower.includes('phụ kiện') || lower.includes('ai')) {
        matched = PRODUCTS.filter((p) => p.category === 'phu-kien-ai');
        replyText =
          'Rabbit R1 là thiết bị AI LAM điều khiển bằng giọng nói thế hệ mới cực hot. Ngoài ra bạn có thể tham khảo bàn phím Keychron Q1 Pro siêu đầm tay.';
      } else {
        matched = PRODUCTS.slice(0, 2);
        replyText = `Mình đã ghi nhận nhu cầu "${textToSend}" của bạn. Dựa trên phân tích xu hướng mua sắm, đây là các sản phẩm được đánh giá cao nhất bạn có thể tham khảo:`;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: replyText,
          recommendedProducts: matched,
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <>
      {/* Floating Action Button with Pulse Effect */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="ai-fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={onClose}
            className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 text-white rounded-full shadow-xl shadow-indigo-500/30 cursor-pointer flex items-center justify-center group"
            title="Trợ lý tư vấn AI Alibaba-Store"
            aria-label="Mở Trợ lý Alibaba-Store"
          >
            <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-violet-400 border-2 border-white" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cửa sổ chat AI with Spring Transition */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="ai-chat-window"
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[600px] max-h-[85vh] bg-white border border-slate-200/90 rounded-3xl shadow-2xl shadow-indigo-500/15 flex flex-col overflow-hidden"
          >
            {/* Header with Subtle Tech Glow */}
            <div className="relative px-5 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-950/60 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    Trợ lý Mua sắm AI
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-slate-300">Tư vấn cấu hình & ưu đãi thời gian thực</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="relative z-10 p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompts Strip */}
            <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="text-[11px] font-medium text-slate-600 hover:text-indigo-600 bg-white hover:bg-indigo-50/80 border border-slate-200/80 hover:border-indigo-200 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Area with animated line-by-line reveal */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className="max-w-[85%] space-y-2">
                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Sản phẩm gợi ý từ AI */}
                    {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        {msg.recommendedProducts.slice(0, 2).map((item) => (
                          <Link
                            key={item.id}
                            to={`/product/${item.id}`}
                            onClick={onClose}
                            className="flex items-center gap-2.5 p-2 bg-white hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-300 rounded-2xl transition-all group shadow-2xs"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-11 h-11 rounded-xl object-contain bg-slate-50 p-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600">
                                {item.name}
                              </p>
                              <p className="text-xs font-bold text-indigo-600">{formatVND(item.price)}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5 items-center"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200/80 p-3 rounded-2xl rounded-bl-xs flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi AI về cấu hình, so sánh máy..."
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-full outline-none transition-all"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white rounded-full transition-all cursor-pointer shadow-sm shadow-indigo-500/20"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
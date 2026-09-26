import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, ArrowRight, CornerDownLeft } from 'lucide-react';
import { PRODUCTS } from '../data/mockData';
import { Link } from 'react-router-dom';

export default function AiChatWidget({ isOpen, onClose }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Xin chào! Mình là trợ lý tư vấn của Alibaba-Store. Bạn đang tìm thiết bị nào hoặc cần tư vấn cấu hình ra sao?',
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

  const handleSend = (userText) => {
    const textToSend = userText || input;
    if (!textToSend.trim()) return;

    const userMsg = { role: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!userText) setInput('');
    setIsTyping(true);

    // AI intelligent mock matching
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
    }, 700);
  };

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <>
      {/* Floating Button khi Widget đóng */}
      {!isOpen && (
        <button
          onClick={onClose}
          className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-full shadow-xl shadow-slate-900/20 hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center group"
          title="Trợ lý tư vấn Alibaba-Store"
          aria-label="Mở Trợ lý Alibaba-Store"
        >
          <Sparkles className="w-6 h-6 text-indigo-300 group-hover:text-yellow-300 transition-colors" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
        </button>
      )}

      {/* Cửa sổ chat AI */}
      {isOpen && (
        <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] h-[580px] max-h-[85vh] bg-white border border-slate-200/90 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                <Sparkles className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center gap-1.5">
                  Trợ lý Mua sắm Alibaba-Store
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
                </h3>
                <p className="text-[11px] text-slate-400">Tư vấn cấu hình & ưu đãi thời gian thực</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] font-medium text-slate-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Tin nhắn */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white rounded-br-xs'
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
                          className="flex items-center gap-2.5 p-2 bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all group"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-11 h-11 rounded-lg object-cover bg-slate-100"
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
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-xs flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô nhập tin nhắn */}
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
              placeholder="Nhập câu hỏi cho AI..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 text-slate-800 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-slate-900 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
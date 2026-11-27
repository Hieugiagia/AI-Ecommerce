import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, ArrowRight, RotateCcw, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAiConversation } from '../hooks/useAiConversation';
import { formatDisplayDateTime } from '../services/dateDisplay';
import { Link, useLocation } from 'react-router-dom';
import AiPreferences from './AiPreferences';

export default function AiChatWidget(props) {
  const { user, isAuthenticated } = useAuth();
  return <AiChatSession key={user?.id || 'guest'} {...props} account={user?.id} authenticated={isAuthenticated}/>;
}
function AiChatSession({ isOpen, onClose, account, authenticated }) {
  const location = useLocation();
  const [input, setInput] = useState('');
  const [historyOpen,setHistoryOpen]=useState(false);
  const [preferencesOpen,setPreferencesOpen]=useState(false);
  const messagesEndRef = useRef(null);
  const {messages,sessions,mode,loading,isTyping,error,historyError,failedAttempt,selectedId,
    send,resetChat,openSession,loadHistory,retry,canSend,canReset}=useAiConversation({account,authenticated,isOpen});

  const quickPrompts = [
    'Laptop dưới 20 triệu cho học tập',
    'Điện thoại 256GB đang còn hàng',
    'Tai nghe dưới 3 triệu',
    'Giúp mình chọn thiết bị phù hợp',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  function handleSend(userText) {
    if(send(userText || input)){setInput('');return true;}
    return false;
  }

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
            title="Trợ lý tư vấn AI Zentro Store"
            aria-label="Mở Trợ lý Zentro Store"
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

                  </h3>
                  <p className="text-[11px] text-slate-300">Gợi ý theo sản phẩm của Zentro Store</p>
                </div>
              </div>

              {authenticated && <button type="button" aria-label="Lịch sử trò chuyện" aria-expanded={historyOpen} onClick={()=>{setHistoryOpen(value=>!value);setPreferencesOpen(false);}} className="relative z-10 p-1.5 text-slate-300 hover:text-white"><History size={18}/></button>}
              <button type="button" disabled={!canReset} onClick={()=>{resetChat();setInput('');}} aria-label="Bắt đầu cuộc trò chuyện mới" className="relative z-10 p-1.5 text-slate-300 hover:text-white disabled:opacity-40"><RotateCcw size={17}/></button>
              <button
                aria-label="Đóng trợ lý tư vấn"
                onClick={onClose}
                className="relative z-10 p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {authenticated && historyOpen && <section aria-label="Danh sách hội thoại" className="max-h-44 overflow-y-auto border-b border-slate-200 bg-slate-50 p-3 text-sm">
              <div className="mb-2 flex justify-between items-center"><strong>Cuộc trò chuyện của bạn</strong><button type="button" disabled={isTyping || loading} onClick={loadHistory} className="text-orange-700 underline">Tải lại</button></div>
              {sessions.map(session=><button type="button" key={session.id} disabled={isTyping || loading || !!failedAttempt} onClick={async()=>{await openSession(session.id);setHistoryOpen(false);setInput('');}} aria-pressed={session.id===selectedId} className="mb-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:bg-orange-50"><span className="block truncate">{session.title}</span><small className="text-slate-500">{formatDisplayDateTime(session.updatedAt || session.createdAt)}</small></button>)}
              {!sessions.length&&!loading&&mode==='saved'&&<p className="text-slate-500">Chưa có hội thoại đã lưu.</p>}
            </section>}
            {authenticated && <div aria-live="polite" className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">{loading ? 'Đang tải lịch sử...' : mode==='temporary' ? 'Lịch sử chưa sẵn sàng. Cuộc trò chuyện này chưa được lưu.' : mode==='saved' ? 'Lịch sử được lưu theo tài khoản của bạn.' : 'Chưa tải được lịch sử.'}{(historyError||mode==='temporary'||mode==='error')&&<button type="button" disabled={isTyping||loading} onClick={loadHistory} className="ml-2 text-orange-700 underline">Thử tải lịch sử</button>}{historyError&&<p role="status">{historyError}</p>}</div>}
            {authenticated && <div className="border-b border-slate-100 px-4 py-2 text-xs"><button type="button" aria-expanded={preferencesOpen} onClick={()=>{setPreferencesOpen(value=>!value);setHistoryOpen(false);}} className="font-semibold text-orange-700">{preferencesOpen ? 'Đóng bộ chọn nhu cầu' : 'Chọn loại sản phẩm, hãng và ngân sách'}</button></div>}
            {authenticated && preferencesOpen && <AiPreferences canSend={canSend} onSend={prompt=>{if(handleSend(prompt))setPreferencesOpen(false);}}/>}
            {/* Quick Prompts Strip */}
            <div className="px-4 py-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  disabled={!canSend}
                  onClick={() => handleSend(prompt)}
                  className="text-[11px] font-medium text-slate-600 hover:text-indigo-600 bg-white hover:bg-indigo-50/80 border border-slate-200/80 hover:border-indigo-200 px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Area with animated line-by-line reveal */}
            <div role="log" aria-label="Cuộc trò chuyện tư vấn" aria-live="polite" className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
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
                      className={`whitespace-pre-wrap break-words p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
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
                        {msg.recommendedProducts.slice(0, 4).map((item) => (
                          <Link
                            key={item.id}
                            to={'/product/' + encodeURIComponent(item.slug || item.id)}
                            onClick={onClose}
                            className="flex items-center gap-2.5 p-2 bg-white hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-300 rounded-2xl transition-all group shadow-2xs"
                          >
                            <img
                              src={item.image}
                              onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src='/zentro-mark.svg';}}
                              alt={item.name}
                              className="w-11 h-11 rounded-xl object-contain bg-slate-50 p-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-indigo-600">
                                {item.name}
                              </p>
                              <p className="text-xs font-bold text-indigo-600">{formatVND(item.price)}{mode==='saved'&&<small className="ml-2 font-normal text-slate-500">Giá hiện tại</small>}</p>
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
              {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><p>{error}</p>{failedAttempt && <button type="button" disabled={isTyping} onClick={retry} className="mt-2 font-semibold underline">Thử lại câu hỏi</button>}</div>}
              {!authenticated && <p className="rounded-xl border border-slate-200 bg-white p-3 text-sm"><Link to="/login" state={{from:{pathname:location.pathname}}} onClick={onClose} className="font-semibold text-orange-700 underline">Đăng nhập để trò chuyện</Link> và nhận gợi ý từ trợ lý.</p>}
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
                aria-label="Câu hỏi cho trợ lý"
                maxLength={2000}
                disabled={!authenticated}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi AI về cấu hình, so sánh máy..."
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 text-slate-800 text-xs sm:text-sm px-4 py-2.5 rounded-full outline-none transition-all"
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                aria-label="Gửi câu hỏi"
                disabled={!canSend || !input.trim()}
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

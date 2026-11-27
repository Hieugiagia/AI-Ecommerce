import { useEffect, useRef, useState } from 'react';
import { aiService } from '../services/aiService';
import { completedChatHistory } from '../services/aiModel';
import { aiHistoryService } from '../services/aiHistoryService';
import { newAiDraft, readAiDraft, writeAiDraft, turnConfirmed } from '../services/aiHistoryModel';

const greeting = () => ({role:'assistant',text:'Xin chào! Mình là trợ lý AI tư vấn của Zentro Store. Bạn đang tìm thiết bị nào hoặc cần tư vấn cấu hình ra sao?',recommendedProducts:[]});
export function useAiConversation({ account, authenticated, isOpen }) {
  const [messages,setMessages]=useState(()=>[greeting()]);
  const [sessions,setSessions]=useState([]);
  const [mode,setMode]=useState('checking');
  const [loading,setLoading]=useState(false);
  const [isTyping,setIsTyping]=useState(false);
  const [error,setError]=useState('');
  const [historyError,setHistoryError]=useState('');
  const [failedAttempt,setFailedAttempt]=useState(null);
  const [selectedId,setSelectedId]=useState(null);
  const mounted=useRef(false),inFlight=useRef(false),initialized=useRef(false),request=useRef(null);
  const draft=useRef(null);
  if(!draft.current) draft.current=readAiDraft(sessionStorage,account)||newAiDraft();
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;request.current?.abort();};},[]);
  function saveDraft(value) { writeAiDraft(sessionStorage,account,value);draft.current=value;setSelectedId(value.selectedId); }
  async function refreshList() {
    try {const rows=await aiHistoryService.list();if(mounted.current){setSessions(rows);setHistoryError('');}}
    catch {if(mounted.current)setHistoryError('Chưa tải được danh sách hội thoại.');}
  }
  async function loadHistory() {
    if(inFlight.current||!authenticated)return;
    inFlight.current=true;setLoading(true);setHistoryError('');
    try {
      const rows=await aiHistoryService.list();
      if(mounted.current)setSessions(rows);
      let conversation=null;
      if(draft.current.selectedId) conversation=await aiHistoryService.get(draft.current.selectedId);
      if(!mounted.current)return;
      setSessions(rows);setMode('saved');setSelectedId(draft.current.selectedId);
      if(conversation)setMessages([greeting(),...conversation.messages]);
      const pending=draft.current.pending;
      if(pending) {
        if(conversation&&turnConfirmed(conversation,pending)){saveDraft({...draft.current,pending:null});setFailedAttempt(null);setError('');}
        else {setMessages([greeting(),...(conversation?.messages||[]),{id:pending.id,role:'user',text:pending.text,status:'failed'}]);setFailedAttempt(pending);setError('Có câu hỏi chưa được xác nhận. Bấm thử lại để kiểm tra cùng lần gửi, tránh tạo trùng.');}
      }
    } catch(err) {
      if(!mounted.current)return;
      if(![401,403].includes(err.status)&&!draft.current.pending&&!draft.current.selectedId){setMode('temporary');}
      else {setMode('error');setHistoryError(err.message||'Chưa tải được lịch sử.');}
    } finally {inFlight.current=false;if(mounted.current)setLoading(false);}
  }
  useEffect(()=>{
    if(authenticated&&isOpen&&!initialized.current){initialized.current=true;loadHistory();}
  },[authenticated,isOpen]);
  async function run(attempt) {
    if(inFlight.current||!authenticated)return;
    inFlight.current=true;setIsTyping(true);setError('');setFailedAttempt(null);
    request.current=new AbortController();
    setMessages(previous=>previous.map(row=>row.id===attempt.id?{...row,status:'pending'}:row));
    try {
      if(mode==='temporary') {
        const result=await aiService.chat(attempt.text,attempt.history,{signal:request.current.signal});
        if(!mounted.current)return;
        setMessages(previous=>[...previous.map(row=>row.id===attempt.id?{...row,status:'complete'}:row),
          {role:'assistant',text:result.reply,recommendedProducts:result.recommendedProducts,status:'complete'}]);
      } else {
        let id=draft.current.selectedId;
        if(!id){
          const session=await aiHistoryService.create(draft.current.clientKey,attempt.text);
          if(!mounted.current)return;
          id=session.id;saveDraft({...draft.current,selectedId:id});
        }
        const conversation=await aiHistoryService.send(id,attempt);
        if(!mounted.current)return;
        saveDraft({...draft.current,pending:null});
        setMessages([greeting(),...conversation.messages]);
        void refreshList();
      }
    } catch(err) {
      if(!mounted.current)return;
      setMessages(previous=>previous.map(row=>row.id===attempt.id?{...row,status:'failed'}:row));
      setFailedAttempt({...attempt,definitive:[400,401,403,404,409,422,429].includes(err.status)});setError(err.message||'Chưa xác nhận được câu trả lời. Vui lòng thử lại.');
    } finally {inFlight.current=false;if(mounted.current)setIsTyping(false);}
  }
  function send(text) {
    if(inFlight.current||!authenticated||!['saved','temporary'].includes(mode)||loading||failedAttempt)return false;
    const value=String(text||'').trim();if(!value||value.length>2000)return false;
    const attempt={id:crypto.randomUUID(),text:value,history:mode==='temporary'?completedChatHistory(messages):[]};
    if(mode==='saved'){
      try{saveDraft({...draft.current,pending:attempt});}
      catch{setError('Chưa chuẩn bị được trạng thái gửi. Vui lòng kiểm tra quyền lưu trữ của trình duyệt.');return false;}
    }
    setMessages(previous=>[...previous,{id:attempt.id,role:'user',text:value,status:'pending'}]);
    run(attempt);return true;
  }
  async function openSession(id) {
    if(inFlight.current||failedAttempt)return;
    inFlight.current=true;setLoading(true);setError('');
    try {
      const conversation=await aiHistoryService.get(id);
      if(!mounted.current)return;
      saveDraft({selectedId:id,clientKey:crypto.randomUUID(),pending:null});
      setMessages([greeting(),...conversation.messages]);setMode('saved');setHistoryError('');
    } catch(err){if(mounted.current)setHistoryError(err.message);}
    finally{inFlight.current=false;if(mounted.current)setLoading(false);}
  }
  function resetChat() {
    if(!authenticated||inFlight.current||(failedAttempt&&mode!=='temporary'&&!failedAttempt.definitive))return;
    try{saveDraft(newAiDraft());setMessages([greeting()]);setError('');setFailedAttempt(null);}
    catch{setError('Chưa tạo được cuộc trò chuyện mới.');}
  }
  return {messages,sessions,mode,loading,isTyping,error,historyError,failedAttempt,selectedId,
    send,resetChat,openSession,loadHistory,retry:()=>failedAttempt&&run(failedAttempt),
    canReset:authenticated&&!isTyping&&!loading&&(!failedAttempt||mode==='temporary'||failedAttempt.definitive),
    canSend:authenticated&&!isTyping&&!loading&&!failedAttempt&&['saved','temporary'].includes(mode)};
}

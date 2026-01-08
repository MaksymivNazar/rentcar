import React, { useState, useEffect } from 'react';
import './SupportChat.css';

function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [userId] = useState(() => localStorage.getItem('chat_id') || 'u_' + Math.random().toString(36).substr(2, 5));
  const [msgs, setMsgs] = useState([]);

  useEffect(() => {
    localStorage.setItem('chat_id', userId);
    const itv = setInterval(() => {
      const chats = JSON.parse(localStorage.getItem('support_chats')) || {};
      setMsgs(chats[userId] || []);
    }, 1000);
    return () => clearInterval(itv);
  }, [userId]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const chats = JSON.parse(localStorage.getItem('support_chats')) || {};
    const newMsg = { id: Date.now(), sender: 'user', text, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    chats[userId] = [...(chats[userId] || []), newMsg];
    localStorage.setItem('support_chats', JSON.stringify(chats));
    setText('');
  };

  return (
    <div className="support-widget">
      <button className="chat-open-btn" onClick={() => setIsOpen(!isOpen)}>{isOpen ? '✕' : '💬 Чат'}</button>
      {isOpen && (
        <div className="chat-window-client">
          <div className="chat-head">Підтримка Olimp Rent</div>
          <div className="chat-body">
            {msgs.map(m => (
              <div key={m.id} className={`chat-bubble ${m.sender}`}>
                <p>{m.text}</p>
                <span>{m.time}</span>
              </div>
            ))}
          </div>
          <form className="chat-foot" onSubmit={send}>
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Напишіть..." />
            <button type="submit">➤</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default SupportChat;
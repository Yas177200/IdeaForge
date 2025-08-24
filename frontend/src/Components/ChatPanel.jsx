import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../api';
import { connectProjectSocket } from '../socket';
import '../css/chat.css';

export default function ChatPanel({ projectId, open, onClose }) {
  const me = JSON.parse(localStorage.getItem('user') || 'null');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(null); 
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    let mounted = true;

    (async () => {
      try {
        const { data } = await api.get(`/projects/${projectId}/chat?limit=50`);
        const initial = [...data.messages].reverse();
        if (mounted) setMessages(initial);
        scrollToBottom();
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load chat');
      }
    })();

    const s = connectProjectSocket(projectId);
    socketRef.current = s;

    s.on('connect_error', (err) => {
        console.error('[socket] connect_error:', err?.message, err);
    });
    s.on('connect', () => console.info('[chat] connected'));
    s.on('disconnect', () => console.info('[chat] disconnected'));

    s.on('chat:new', (msg) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    });

    s.on('chat:typing', (t) => setTyping(t?.isTyping ? t : null));

    return () => {
      mounted = false;
      s.off();
      s.close();
    };
  }, [open, projectId]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }));
  };

  const send = () => {
    const content = text.trim();
    if (!content) return;
    socketRef.current?.emit('chat:send', { content }, (ack) => {
      if (!ack?.ok) {
        setError(ack?.error || 'Failed to send');
      } else {
        setText('');
      }
    });
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    } else {
      socketRef.current?.emit('chat:typing', true);
      setTimeout(() => socketRef.current?.emit('chat:typing', false), 700);
    }
  };

  if (!open) return null;

  return (
    <div className="chat-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="chat-panel" onClick={e => e.stopPropagation()}>
        <div className="chat-head">
          <h3>Project Chat</h3>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="chat-body">
          {messages.map(m => (
            <div key={m.id} className={`msg ${m.senderId === me?.id ? 'me' : ''}`}>
              <div className="meta">
                <span className="name">{m.senderName}</span>
                <span className="time">{new Date(m.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="bubble">{m.content}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {typing?.userId && typing.userId !== me?.id && (
          <div className="typing">Someone is typing…</div>
        )}

        <div className="chat-input">
          <textarea
            rows="2"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
          />
          <button className="btn btn-primary" onClick={send}>Send</button>
        </div>
      </div>
    </div>
  );
}

ChatPanel.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

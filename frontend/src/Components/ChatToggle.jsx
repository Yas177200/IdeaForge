import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connectProjectSocket } from '../socket';
import '../css/chat.css';

export default function ChatToggle({ projectId, onOpen }) {
  const [unread, setUnread] = useState(0);
  const socketRef = useRef(null);
  const openRef = useRef(false);

  useEffect(() => {
    const s = connectProjectSocket(projectId);
    socketRef.current = s;

    s.on('connect_error', (err) => {
        console.error('[socket] connect_error:', err?.message, err);
    });

    s.on('chat:new', () => {
      if (!openRef.current) setUnread(n => n + 1);
    });

    return () => {
      s.off();
      s.close();
    };
  }, [projectId]);

  const openPanel = () => {
    openRef.current = true;
    setUnread(0);
    onOpen();
  };

  return (
    <button className="chat-fab" onClick={openPanel} title="Open chat">
      Chat
      {unread > 0 && <span className="chat-badge">{unread}</span>}
    </button>
  );
}

ChatToggle.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onOpen: PropTypes.func.isRequired
};

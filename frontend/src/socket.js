import { io } from 'socket.io-client';

const SOCKET_URL  = import.meta.env.VITE_SOCKET_URL  || 'http://localhost:3000';
const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH || '/socket.io';

export function connectProjectSocket(projectId) {
  const token = localStorage.getItem('token');
  const socket = io(SOCKET_URL, {
    path: SOCKET_PATH,
    auth: { token },
    query: { projectId: String(projectId) },
    transports: ['polling','websocket'],  
  });

  socket.on('connect_error', (err) => {
    console.error('[socket] connect_error:', err?.message, err);
  });

  return socket;
}

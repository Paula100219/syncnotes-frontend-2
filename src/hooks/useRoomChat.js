import { useEffect, useRef, useState } from 'react';

export function useRoomChat(roomId, token) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!roomId || !token || initializedRef.current) return;

    initializedRef.current = true;
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    (async () => {
      const { createStompClient } = await import('@/chat/ChatService');
      const client = createStompClient(API_BASE, token);
      clientRef.current = client;

       client.onConnect = () => {
         setConnected(true);
         client.subscribe(`/topic/room/${roomId}`, (msg) => {
           const ws = JSON.parse(msg.body);
           if (ws.type === 'CHAT_MESSAGE') {
             setMessages((prev) => [...prev, ws.payload]);
           }
         });
       };

       client.onStompError = () => setConnected(false);
       client.onWebSocketClose = () => setConnected(false);

      client.activate();
    })();

    return () => {
      initializedRef.current = false;
      clientRef.current?.deactivate?.();
      clientRef.current = null;
    };
  }, [roomId, token]);

  const sendMessage = (content) => {
    if (clientRef.current && connected) {
      clientRef.current.publish({
        destination: `/app/room/${roomId}/chat`,
        body: JSON.stringify({ content }),
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  };

  return { connected, messages, sendMessage };
}
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export function createStompClient(API_BASE, token) {
  const socket = new SockJS(`${API_BASE}/ws`);
  const client = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    debug: (str) => console.log(str),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });
  return client;
}
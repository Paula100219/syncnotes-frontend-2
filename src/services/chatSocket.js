const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081"; // Usa el MISMO host/puerto que el login

const WS_ENDPOINT = `${BASE}/ws`;

const token = () => localStorage.getItem("token") || "";

const authHeader = () => (token() ? { Authorization: `Bearer ${token()}` } : {});

export async function createChatClient({ roomId, onConnected, onMessage, onError }) {
  const SockJS = (await import("sockjs-client/dist/sockjs.js")).default;
  const { Client } = await import("@stomp/stompjs");

  const client = new Client({

    webSocketFactory: () => new SockJS(WS_ENDPOINT),

    connectHeaders: authHeader(),

    reconnectDelay: 3000,

    debug: () => {}, // sin logs ruidosos

  });

  client.onConnect = () => {

    client.subscribe(`/topic/room/${roomId}`, (msg) => {

      try {

        const payload = JSON.parse(msg.body);

        onMessage && onMessage(payload);

      } catch (e) {

        console.error("WS parse error:", e);

      }

    });

    onConnected && onConnected();

  };

  client.onStompError = (frame) => {

    console.error("Broker error:", frame.headers["message"]);

    onError && onError(new Error(frame.headers["message"]));

  };

  client.onWebSocketError = (e) => {

    console.error("WS error:", e);

    onError && onError(e);

  };

  const sendChat = (content) => {

    if (!client.connected) return;

    client.publish({

      destination: `/app/room/${roomId}/chat`,

      body: JSON.stringify({ content }),

      headers: authHeader(),

    });

  };

  return {

    connect: () => client.activate(),

    disconnect: () => client.deactivate(),

    sendChat,

  };
}
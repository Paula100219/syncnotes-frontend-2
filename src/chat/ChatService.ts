import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs"; // evita bundling del build de Node

export function createStompClient(baseHttpUrl: string, token: string) {
// baseHttpUrl = p.ej. http://localhost:8081
const socketFactory = () => new SockJS(`${baseHttpUrl}/ws`);
const client = new Client({
webSocketFactory: socketFactory as any,
reconnectDelay: 5000,
connectHeaders: {
Authorization: `Bearer ${token}`,
},
debug: () => {}, // dejar vacío para no ensuciar consola
});
return client;
}
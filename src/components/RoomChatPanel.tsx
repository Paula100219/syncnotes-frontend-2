import { useEffect, useRef, useState } from "react";
import { chatService } from "../services/ChatService";
import { getRoomMessages } from "../services/Api";
import "./room-chat.css";

interface RoomChatPanelProps {
  roomId: string;
  currentUsername?: string;
}

export default function RoomChatPanel({ roomId, currentUsername }: RoomChatPanelProps) {
  const [status, setStatus] = useState<"Conectado" | "Desconectado">("Desconectado");
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const mounted = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mounted.current = true;
    chatService.connect({
      roomId,
      onStatus: setStatus,
       onMessage: (msg) => {
         // Backend envía {type, payload}. Solo usamos payload cuando type === "CHAT_MESSAGE"
         const parsed = msg?.type === "CHAT_MESSAGE" ? msg.payload : msg;
         if (!mounted.current) return;
         setMessages((prev) => [...prev, { ...parsed, mine: parsed.username === currentUsername }]);
       },
    });
    return () => {
      mounted.current = false;
      chatService.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getRoomMessages(roomId);
        if (mounted.current) {
          setMessages(data.map((msg: any) => ({ ...msg, mine: msg.username === currentUsername })));
        }
      } catch (error) {
        console.error("Error al cargar mensajes:", error);
      }
    };
    if (roomId) {
      fetchMessages();
    }
  }, [roomId, currentUsername]);

  // autoscroll suave cuando llegan mensajes
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const value = text.trim();
    if (!value) return;
    // No empujes localmente para evitar duplicados.
    chatService.sendMessage(value);
    setText("");
  };

  return (
    <div className="chat-card">
      <div className="chat-card__header">
        <span>Chat de la sala</span>
        <span className={`chat-card__status ${status === "Conectado" ? "ok" : "warn"}`}>
          {status}
        </span>
      </div>

      <div className="chat-messages" ref={listRef}>
         {messages.map((m, i) => {
           const username = (m?.username ?? "Usuario").toString();
           return (
             <div key={i} className={`msg ${m.mine ? "self" : "other"}`}>
              <span className="msg-user">{username}</span>
              <div className="msg-bubble">{m?.content ?? ""}</div>
            </div>
          );
        })}
      </div>

      <form
        className="chat-card__input"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          type="text"
          placeholder="Escribe un mensaje"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" disabled={status !== "Conectado"}>
          Enviar
        </button>
      </form>
    </div>
  );
}
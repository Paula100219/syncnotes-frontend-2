import { useState, useEffect, useRef } from 'react';
import { socket } from '../services/chatSocket';
import { getCurrentName } from '../services/helpers';



export default function ChatBox({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;
    let isMounted = true;
    async function fetchMessages() {
      try {
        const response = await fetch(`http://localhost:8081/api/rooms/${roomId}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Historial cargado:", data); // para verificar en consola
          setMessages(data.map(msg => ({ ...msg, sender: msg.senderName || 'Equipo' })));
        } else {
          console.error(" Error al cargar mensajes:", response.statusText);
        }
      } catch (error) {
        console.error(" Error al obtener mensajes:", error);
      }
    }
    // Limpiar mensajes previos antes de recargar
    setMessages([]);
    // Cargar historial del backend
    fetchMessages();
    // 3 Conectar el socket
    socket.emit("join_room", roomId);
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    // 4 Escuchar mensajes nuevos
    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    // 5 Cleanup al salir
    return () => {
      isMounted = false;
      socket.off("receive_message");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [roomId]);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const send = (e) => {
    e.preventDefault();
    const msg = text.trim();
    if (!msg) return;
    socket.emit("send_chat", msg);
    setMessages((prev) => [
      ...prev,
      { sender: getCurrentName() || 'Tú', content: msg, ts: Date.now(), self: true },
    ]);
    setText('');
  };

  if (!roomId) {
    return (
      <aside
        className="chat-box"
        style={{
          width: '420px',
          minWidth: 320,
          maxWidth: 480,
          height: 'calc(100vh - 160px)',
          background: 'rgba(16, 24, 39, 0.7)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
          <div style={{ fontWeight: 600, marginBottom: '8px' }}>Selecciona una sala para chatear</div>
          <div style={{ fontSize: '14px' }}>Abre una sala para unirte al chat del equipo</div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="chat-box"
      style={{
        width: '420px',
        minWidth: 320,
        maxWidth: 480,
        height: 'calc(100vh - 160px)',
        background: 'rgba(16, 24, 39, 0.7)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ color: '#E5E7EB', fontWeight: 800, fontSize: 20, margin: 0 }}>
          Chat del Equipo
        </h3>
        <div style={{ marginLeft: 'auto', opacity: 0.7, color: connected ? '#22C55E' : '#F59E0B' }}>
          {connected ? 'Conectado' : 'Conectando'}
        </div>

      </div>

      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 2px',
          gap: 8,
          display: 'grid',
        }}
      >
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 32 }}>
            <div
              style={{
                width: 40,
                height: 40,
                margin: '0 auto 8px',
                borderRadius: 12,
                border: '2px solid #4B5563',
              }}
            />
            <div style={{ fontWeight: 600 }}>No hay mensajes todavía.</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              ¡Rompe el hielo y saluda al equipo!
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = m.self || (m.sender && m.sender === getCurrentName());
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: mine ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '78%',
                    background: mine ? '#2563EB' : '#374151',
                    color: '#E5E7EB',
                    borderRadius: 14,
                    padding: '10px 12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,.25)',
                  }}
                >
                  {!mine && (
                    <div style={{ fontSize: 12, color: '#D1D5DB', marginBottom: 4 }}>
                      {m.sender || 'Equipo'}
                    </div>
                  )}
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={send} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje..."
          style={{
            flex: 1,
            background: '#111827',
            color: '#E5E7EB',
            border: '1px solid #374151',
            borderRadius: 12,
            padding: '10px 12px',
            outline: 'none',
          }}
          disabled={!connected}
        />
        <button
          type="submit"
          title="Enviar"
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            border: 'none',
            background: '#2563EB',
            color: 'white',
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
            fontSize: 18,
          }}
        >
          ✈️
        </button>
      </form>
    </aside>
  );
}
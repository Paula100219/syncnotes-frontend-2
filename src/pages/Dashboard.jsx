import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import {
  getMe,
  createRoom,
  createTask,
  getMyRooms,
} from "../services/api";
import "./dashboard.css";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null); // { user, rooms, tasks }
  const [error, setError] = useState(null);

  // modales
  const [openRoomModal, setOpenRoomModal] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);

  // forms
  const [roomForm, setRoomForm] = useState({
    name: "",
    description: "",
    isPublic: false,
  });
  const [taskForm, setTaskForm] = useState({
    roomId: "",
    title: "",
    dueDate: "",
    priority: "MEDIUM",
  });

  // cargar datos iniciales
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMe();
        setMe(data);
        // por usabilidad: preseleccionar 1ª sala en modal de tarea
        if (data?.rooms?.length && !taskForm.roomId) {
          setTaskForm((f) => ({ ...f, roomId: data.rooms[0].id }));
        }
      } catch (e) {
        console.error(e);
        setError(
          e?.message || "No se pudo cargar tu información. Intenta nuevamente."
        );
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const userName = me?.user?.name || me?.user?.username || "tu espacio de trabajo";
  const rooms = me?.rooms || [];
  const tasks = me?.tasks || [];

  // HANDLERS ──────────────────────────────────────────────
  function handleRoomChange(e) {
    const { name, value, type, checked } = e.target;
    setRoomForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleTaskChange(e) {
    const { name, value } = e.target;
    setTaskForm((f) => ({ ...f, [name]: value }));
  }

  async function submitRoom(e) {
    e.preventDefault();
    try {
      const created = await createRoom(roomForm);
      // refrescar solo rooms
      const updatedRooms = await getMyRooms();
      setMe((prev) => ({ ...prev, rooms: updatedRooms }));
      setOpenRoomModal(false);
      setRoomForm({ name: "", description: "", isPublic: false });
    } catch (err) {
      alert(
        (err && (err.data?.error || err.data?.message)) ||
          err.message ||
          "No se pudo crear la sala"
      );
    }
  }

  async function submitTask(e) {
    e.preventDefault();
    if (!taskForm.roomId) {
      alert("Selecciona una sala para la tarea.");
      return;
    }
    try {
      await createTask(taskForm.roomId, {
        title: taskForm.title,
        dueDate: taskForm.dueDate || null,
        priority: taskForm.priority,
      });
      // refrescamos /me para obtener tasks consolidadas
      const data = await getMe();
      setMe(data);
      setOpenTaskModal(false);
      setTaskForm((f) => ({
        ...f,
        title: "",
        dueDate: "",
        priority: "MEDIUM",
      }));
    } catch (err) {
      alert(
        (err && (err.data?.error || err.data?.message)) ||
          err.message ||
          "No se pudo crear la tarea"
      );
    }
  }

  // formateos simples
  const pendingTasks = useMemo(
    () => (tasks || []).filter((t) => !t.completed),
    [tasks]
  );

  return (
    <div className="ns-root">
      <Navbar variant="dashboard" />

      <main className="dash-main">
        <header className="dash-header">
          <h1 className="dash-title">Tu Espacio de Trabajo</h1>

          <div className="dash-actions">
            <button className="btn-primary" onClick={() => setOpenRoomModal(true)}>
              + Crear nueva sala
            </button>
            <button className="btn-ghost">
              Ver salas públicas
            </button>
          </div>
        </header>

        {loading ? (
          <div className="dash-loading">Cargando…</div>
        ) : error ? (
          <div className="ns-alert ns-alert--err">{error}</div>
        ) : (
          <section className="dash-grid">
            {/* Columna izquierda: salas */}
            <div className="dash-left">
              <h2 className="dash-section-title">Mis Salas</h2>

              <div className="rooms-grid">
                {rooms.length === 0 && (
                  <div className="room-empty">
                    <div className="room-empty-icon">👥</div>
                    <div className="room-empty-title">Aún no tienes salas.</div>
                    <div className="room-empty-sub">
                      ¡Crea una para empezar a colaborar!
                    </div>
                  </div>
                )}

                {rooms.map((r) => (
                  <div key={r.id} className="room-card">
                    <div className="room-title">{r.name}</div>
                    <div className="room-sub">
                      {r.membersCount ?? 0} miembros en línea
                    </div>
                    <div className="room-actions">
                      <button className="btn-secondary">Abrir sala</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna derecha: tareas */}
            <aside className="dash-right">
              <h2 className="dash-section-title">Tus Tareas Pendientes</h2>

              <div className="tasks-panel">
                {pendingTasks.length === 0 ? (
                  <div className="tasks-empty">
                    No tienes tareas pendientes 🧹
                  </div>
                ) : (
                  <ul className="tasks-list">
                    {pendingTasks.map((t) => (
                      <li key={t.id} className="task-item">
                        <div className="task-dot" aria-hidden />
                        <div className="task-title">{t.title}</div>
                        <div className="task-badge">
                          {/* ejemplo simple de badges */}
                          {t.dueBadge === "TODAY" && (
                            <span className="badge badge-danger">Vence hoy</span>
                          )}
                          {t.dueBadge === "TOMORROW" && (
                            <span className="badge badge-warning">Vence mañana</span>
                          )}
                          {t.completed && (
                            <span className="badge badge-success">Completada</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <button className="btn-panel" onClick={() => setOpenTaskModal(true)}>
                  + Nueva tarea
                </button>
              </div>
            </aside>
          </section>
        )}

        <footer className="dash-footer">
          <div>© 2024 SyncNotes. Todos los derechos reservados.</div>
          <div className="dash-links">
            <a>Ayuda</a>
            <a>Contacto</a>
            <a>Términos de servicio</a>
          </div>
        </footer>
      </main>

      {/* MODAL: Crear sala */}
      {openRoomModal && (
        <div className="ns-modal" role="dialog" aria-modal="true">
          <div className="ns-modal__card">
            <h3 className="ns-modal__title">Crear nueva sala</h3>
            <form onSubmit={submitRoom} className="ns-modal__form">
              <label className="ns-label">Nombre de la sala</label>
              <input
                className="ns-input"
                name="name"
                value={roomForm.name}
                onChange={handleRoomChange}
                required
                placeholder="Ej. Diseño de Producto"
              />

              <label className="ns-label">Descripción (opcional)</label>
              <textarea
                className="ns-input ns-textarea"
                name="description"
                rows={3}
                value={roomForm.description}
                onChange={handleRoomChange}
                placeholder="Breve descripción"
              />

              <label className="ns-checkbox">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={roomForm.isPublic}
                  onChange={handleRoomChange}
                />
                <span>Hacerla pública</span>
              </label>

              <div className="ns-modal__actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setOpenRoomModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Nueva tarea */}
      {openTaskModal && (
        <div className="ns-modal" role="dialog" aria-modal="true">
          <div className="ns-modal__card">
            <h3 className="ns-modal__title">Nueva tarea</h3>
            <form onSubmit={submitTask} className="ns-modal__form">
              <label className="ns-label">Título</label>
              <input
                className="ns-input"
                name="title"
                value={taskForm.title}
                onChange={handleTaskChange}
                required
                placeholder="Ej. Preparar presentación"
              />

              <div className="ns-grid-2">
                <div>
                  <label className="ns-label">Fecha límite</label>
                  <input
                    className="ns-input"
                    type="date"
                    name="dueDate"
                    value={taskForm.dueDate}
                    onChange={handleTaskChange}
                  />
                </div>
                <div>
                  <label className="ns-label">Prioridad</label>
                  <select
                    className="ns-input"
                    name="priority"
                    value={taskForm.priority}
                    onChange={handleTaskChange}
                  >
                    <option value="LOW">Baja</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                  </select>
                </div>
              </div>

              <label className="ns-label">Sala</label>
              <select
                className="ns-input"
                name="roomId"
                value={taskForm.roomId}
                onChange={handleTaskChange}
                required
              >
                <option value="">Selecciona una sala…</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              <div className="ns-modal__actions">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setOpenTaskModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
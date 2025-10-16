import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import {
  getMe,
  createRoom,
  createTask,
  getMyRooms,
  deleteRoom, // ✅ nueva función
} from "../services/api";
import "./dashboard.css";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);

  const [openRoomModal, setOpenRoomModal] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false); // ✅ Modal eliminar

  const [roomToDelete, setRoomToDelete] = useState(null); // ✅ sala a eliminar

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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMe();
        setMe(data);
        if (data?.rooms?.length && !taskForm.roomId) {
          setTaskForm((f) => ({ ...f, roomId: data.rooms[0].id }));
        }
      } catch (e) {
        setError(e?.message || "No se pudo cargar tu información.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rooms = me?.rooms || [];
  const tasks = me?.tasks || [];

  const pendingTasks = useMemo(
    () => tasks.filter((t) => !t.completed),
    [tasks]
  );

  const handleRoomChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoomForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setTaskForm((f) => ({ ...f, [name]: value }));
  };

  const submitRoom = async (e) => {
    e.preventDefault();
    try {
      await createRoom(roomForm);
      const updatedRooms = await getMyRooms();
      setMe((prev) => ({ ...prev, rooms: updatedRooms }));
      setOpenRoomModal(false);
      setRoomForm({ name: "", description: "", isPublic: false });
    } catch (err) {
      alert(err.message || "No se pudo crear la sala");
    }
  };

  const submitTask = async (e) => {
    e.preventDefault();
    if (!taskForm.roomId) return alert("Selecciona una sala.");
    try {
      await createTask(taskForm.roomId, {
        title: taskForm.title,
        dueDate: taskForm.dueDate || null,
        priority: taskForm.priority,
      });
      const data = await getMe();
      setMe(data);
      setOpenTaskModal(false);
      setTaskForm({ ...taskForm, title: "", dueDate: "" });
    } catch (err) {
      alert(err.message || "No se pudo crear la tarea");
    }
  };

  // ✅ Eliminar sala
  const confirmDeleteRoom = (room) => {
    setRoomToDelete(room);
    setOpenDeleteModal(true);
  };

  const handleDeleteRoom = async () => {
    try {
      await deleteRoom(roomToDelete.id);
      const updatedRooms = await getMyRooms();
      setMe((prev) => ({ ...prev, rooms: updatedRooms }));
      setOpenDeleteModal(false);
      setRoomToDelete(null);
    } catch (err) {
      alert(err.message || "No se pudo eliminar la sala");
    }
  };

  return (
    <div className="ns-root">
      <Navbar
        variant="dashboard"
        onCreateRoom={() => setOpenRoomModal(true)}
        onViewPublicRooms={() => alert("Próximamente")}
      />

      <main className="dash-main">
        <header className="dash-header">
          <h1 className="dash-title">Tu Espacio de Trabajo</h1>
        </header>

        {loading ? (
          <div className="dash-loading">Cargando…</div>
        ) : error ? (
          <div className="ns-alert ns-alert--err">{error}</div>
        ) : (
          <section className="dash-grid">
            <div className="dash-left">
              <h2 className="dash-section-title">Mis Salas</h2>
              <div className="rooms-grid">
                {rooms.length === 0 ? (
                  <div className="room-empty">
                    <div className="room-empty-icon">👥</div>
                    <div className="room-empty-title">Aún no tienes salas.</div>
                    <div className="room-empty-sub">
                      ¡Crea una para empezar a colaborar!
                    </div>
                  </div>
                ) : (
                  rooms.map((r) => (
                    <div key={r.id} className="room-card">
                      <div className="room-title">{r.name}</div>
                      <div className="room-sub">{r.membersCount ?? 0} miembros</div>
                      <div className="room-actions">
                        <button className="btn-secondary">Abrir sala</button>
                        <button
                          className="btn-ghost"
                          onClick={() => confirmDeleteRoom(r)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <aside className="dash-right">
              <h2 className="dash-section-title">Tus Tareas Pendientes</h2>
              <div className="tasks-panel">
                {pendingTasks.length === 0 ? (
                  <div className="tasks-empty">No tienes tareas pendientes 🧹</div>
                ) : (
                  <ul className="tasks-list">
                    {pendingTasks.map((t) => (
                      <li key={t.id} className="task-item">
                        <div className="task-dot" />
                        <div className="task-title">{t.title}</div>
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
      </main>

      {/* Modal Crear Sala */}
      {openRoomModal && (
        <div className="ns-modal">
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

      {/* Modal Nueva Tarea */}
      {openTaskModal && (
        <div className="ns-modal">
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
                placeholder="Ej. Examen de física"
              />

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

              <label className="ns-label">Sala</label>
              <select
                className="ns-input"
                name="roomId"
                value={taskForm.roomId}
                onChange={handleTaskChange}
                required
              >
                <option value="">Selecciona una sala...</option>
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

      {/* ✅ Modal Confirmar Eliminación */}
      {openDeleteModal && (
        <div className="ns-modal">
          <div className="ns-modal__card">
            <h3 className="ns-modal__title">Eliminar sala</h3>
            <p>
              ¿Seguro que deseas eliminar la sala{" "}
              <strong>{roomToDelete?.name}</strong>?<br />
              Esta acción no se puede deshacer.
            </p>
            <div className="ns-modal__actions">
              <button
                className="btn-ghost"
                onClick={() => setOpenDeleteModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleDeleteRoom}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

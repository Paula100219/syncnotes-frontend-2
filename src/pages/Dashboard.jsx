import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getMe,
  getMyRooms,
  getRoomTasks,
  createRoom,
  createTask,
  deleteRoom,
  updateTask,
  deleteTask,
} from "../services/api";
import "./dashboard.css";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [openRoomModal, setOpenRoomModal] = useState(false);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [roomForm, setRoomForm] = useState({
    name: "",
    description: "",
    isPublic: false,
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    dueDate: "",
    priority: "MEDIUM",
  });

  const navigate = useNavigate();

  // 🔹 Cargar usuario
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getMe();
        setMe(data);
      } catch (e) {
        setError(e?.message || "No se pudo cargar tu información.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const rooms = me?.rooms || [];

  // 🔹 Cargar tareas de una sala
  const handleOpenRoom = async (room) => {
    setSelectedRoom(room);
    try {
      setLoading(true);
      const roomTasks = await getRoomTasks(room.id);
      setTasks(roomTasks);
    } catch {
      alert("No se pudieron cargar las tareas de esta sala");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Crear sala
  const handleRoomChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoomForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
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

  // 🔹 Crear o actualizar tarea
  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setTaskForm((f) => ({ ...f, [name]: value }));
  };

  const submitTask = async (e) => {
    e.preventDefault();
    if (!selectedRoom) return alert("Primero selecciona una sala.");

    try {
      if (editingTask) {
        // 🟢 Actualizar tarea existente
        await updateTask(selectedRoom.id, editingTask.id, taskForm);
        alert("Tarea actualizada correctamente");
      } else {
        // 🆕 Crear nueva tarea
        await createTask(selectedRoom.id, {
          title: taskForm.title,
          dueDate: taskForm.dueDate || null,
          priority: taskForm.priority,
        });
      }

      const updatedTasks = await getRoomTasks(selectedRoom.id);
      setTasks(updatedTasks);
      setOpenTaskModal(false);
      setEditingTask(null);
      setTaskForm({ title: "", dueDate: "", priority: "MEDIUM" });
    } catch (err) {
      alert(err.message || "No se pudo guardar la tarea");
    }
  };

  // 🔹 Eliminar tarea
  const handleDeleteTask = async (task) => {
    if (!selectedRoom) return;
    const ok = confirm(`¿Eliminar la tarea "${task.title}"?`);
    if (!ok) return;

    try {
      await deleteTask(selectedRoom.id, task.id);
      const updatedTasks = await getRoomTasks(selectedRoom.id);
      setTasks(updatedTasks);
      alert("Tarea eliminada correctamente");
    } catch (err) {
      alert(err.message || "No se pudo eliminar la tarea");
    }
  };

  // 🔹 Abrir modal para editar tarea
  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      priority: task.priority || "MEDIUM",
    });
    setOpenTaskModal(true);
  };

  // 🔹 Eliminar sala
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);

  const confirmDeleteRoom = (room) => {
    setRoomToDelete(room);
    setOpenDeleteModal(true);
  };

  const handleDeleteRoom = async () => {
    try {
      await deleteRoom(roomToDelete.id);
      const updatedRooms = await getMyRooms();
      setMe((prev) => ({ ...prev, rooms: updatedRooms }));
      if (selectedRoom?.id === roomToDelete.id) {
        setSelectedRoom(null);
        setTasks([]);
      }
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
            {/* 🟦 Salas */}
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
                      <div className="room-sub">
                        {r.membersCount ?? 0} miembros
                      </div>
                      <div className="room-actions">
                        <button
                          className="btn-secondary"
                          onClick={() => handleOpenRoom(r)}
                        >
                          Abrir sala
                        </button>
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

            {/* 🟩 Panel de tareas */}
            <aside className="dash-right">
              <h2 className="dash-section-title">
                {selectedRoom
                  ? `Tareas de ${selectedRoom.name}`
                  : "Selecciona una sala"}
              </h2>

              <div className="tasks-panel">
                {!selectedRoom ? (
                  <div className="tasks-empty">
                    Selecciona una sala para ver sus tareas
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="tasks-empty">No hay tareas en esta sala 🧹</div>
                ) : (
                  <ul className="tasks-list">
                    {tasks.map((t) => (
                      <li key={t.id} className="task-item">
                        <div
                          className="task-dot"
                          style={{
                            background:
                              t.priority === "HIGH"
                                ? "#ef4444"
                                : t.priority === "LOW"
                                ? "#22c55e"
                                : "#f59e0b",
                          }}
                        />
                        <div className="task-title">
                          {t.title}
                          {t.dueDate && (
                            <div className="task-date">
                              <small>
                                {new Date(t.dueDate).toLocaleDateString()}
                              </small>
                            </div>
                          )}
                        </div>
                        <span
                          className={`badge ${
                            t.priority === "HIGH"
                              ? "badge-danger"
                              : t.priority === "LOW"
                              ? "badge-success"
                              : "badge-warning"
                          }`}
                        >
                          {t.priority}
                        </span>

                        {/* 🟡 Botones editar / eliminar */}
                        <div className="task-actions">
                          <button
                            className="btn-ghost small"
                            onClick={() => handleEditTask(t)}
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-ghost small"
                            onClick={() => handleDeleteTask(t)}
                          >
                            🗑️
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                {selectedRoom && (
                  <button
                    className="btn-panel"
                    onClick={() => {
                      setEditingTask(null);
                      setTaskForm({ title: "", dueDate: "", priority: "MEDIUM" });
                      setOpenTaskModal(true);
                    }}
                  >
                    + Nueva tarea
                  </button>
                )}
              </div>
            </aside>
          </section>
        )}
      </main>
    </div>
  );
}

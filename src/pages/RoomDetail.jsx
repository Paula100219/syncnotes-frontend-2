import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getRoomDetails, getRoomTasks, addMember, updateMemberRole, searchUser, updateTask, deleteTask, getMe, createTask } from "../services/api";
import "./dashboard.css";

const isValidMember = (m) => {
  // Acepta objetos con al menos id/username/name.
  if (!m) return false;
  if (typeof m === "string") {
    // Si tu API devuelve strings (ids/usernames) y no puedes resolverlos aquí, déjalos pasar.
    // Si conoces el username eliminado en este cliente, puedes ocultarlo:
    const deletedLocal = localStorage.getItem("__lastDeletedUsername");
    if (deletedLocal && m === deletedLocal) return false;
    return true;
  }
  return Boolean(m.id || m.username || m.name);
};

const sanitizeMembers = (members = []) => members.filter(isValidMember);

// Intentar obtener el username del owner con los campos que pueda traer "room".
const getOwnerUsername = (room) => {
  return (
    room?.owner?.username ||
    room?.createdBy?.username ||
    room?.ownerUsername ||
    room?.createdByUsername ||
    null
  );
};

// en caso de que tengan flags o roles.
const findOwnerUsernameFromMembers = (members = []) => {
  // 1) objetos con flags típicos
  const byFlag = members.find(
    (m) =>
      typeof m !== "string" &&
      (m.role === "OWNER" ||
        m.role === "PROPIETARIO" ||
        m.isOwner === true ||
        m?.roles?.includes?.("OWNER"))
  );
  if (byFlag?.username) return byFlag.username;

  // 2) cadenas con rol dentro (p.ej., "juanperez123:OWNER")
  const byString = members.find(
    (m) => typeof m === "string" && /:(owner|propietario)/i.test(m)
  );
  if (typeof byString === "string") return byString.split(":")[0];

  return null;
};

export default function RoomDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);

  // Estados del modal añadir miembro
  const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
  const [searchMode, setSearchMode] = useState("username");
  const [usernameInput, setUsernameInput] = useState("");
  const [userIdSeleccionado, setUserIdSeleccionado] = useState("");

  const [message, setMessage] = useState("");
  const [searching, setSearching] = useState(false);

  const [openDeleteTaskModal, setOpenDeleteTaskModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [openTaskModal, setOpenTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
  });
  const [taskError, setTaskError] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);
   const [selectedTask, setSelectedTask] = useState(null);
   const [showTaskModal, setShowTaskModal] = useState(false);
   const [taskSelected, setTaskSelected] = useState(null);

  // Cargar datos
   useEffect(() => {
     (async () => {
       try {
         setLoading(true);
         const [userData, roomData, tasksData] = await Promise.all([
           getMe(),
           getRoomDetails(roomId),
           getRoomTasks(roomId),
         ]);
          setMe(userData);
          setRoom({ ...roomData, members: sanitizeMembers(roomData.members) });
          setTasks(tasksData);
       } catch (e) {
         setError(e?.message || "No se pudo cargar la sala.");
       } finally {
         setLoading(false);
       }
     })();
   }, [roomId]);

   // Cerrar modal con Esc
   useEffect(() => {
     const onKey = (e) => e.key === 'Escape' && setShowTaskModal(false);
     window.addEventListener('keydown', onKey);
     return () => window.removeEventListener('keydown', onKey);
   }, []);

  // Reset modal
  const resetForm = () => {
    setUsernameInput("");
    setUserIdSeleccionado("");
    setMessage("");
    setSearching(false);
  };

  // Abrir modal añadir miembro
  const handleOpenAddMember = () => {
    resetForm();
    setOpenAddMemberModal(true);
  };

  // Abrir modal crear tarea
  const handleOpenTaskModal = () => {
    setTaskForm({ title: "", description: "" });
    setTaskError("");
    setOpenTaskModal(true);
  };

  // Buscar usuario
  const handleBuscar = async () => {
    const trimmed = usernameInput.trim();
    if (!trimmed) {
      setMessage("Ingresa un username");
      return;
    }
    setSearching(true);
    setMessage("Buscando usuario...");
    try {
      const response = await searchUser(trimmed);
      if (response && response.usuario && response.usuario.id) {
        setUserIdSeleccionado(response.usuario.id);

        setMessage("Usuario encontrado correctamente.");
      } else {
        setMessage("Usuario no encontrado");
        setUserIdSeleccionado("");

      }
     } catch (err) {
       if (err.status === 404) {
         setMessage("Usuario no encontrado");
       } else if (err.status === 401 || err.status === 403) {
         setMessage("Sesión expirada. Redirigiendo a login.");
         const deletedU = localStorage.getItem("username");
         if (deletedU) localStorage.setItem("__lastDeletedUsername", deletedU);
         localStorage.removeItem("token");
         localStorage.removeItem("username");
         window.location.replace("/login");
       } else {
         setMessage("Error al buscar usuario");
       }
      setUserIdSeleccionado("");

    } finally {
      setSearching(false);
    }
  };

  // Añadir miembro
  const submitAddMember = async () => {
    if (!userIdSeleccionado) {
      setMessage("Primero busca un usuario");
      return;
    }

    try {
      await addMember(roomId, userIdSeleccionado, "EDITOR");
       setMessage("Miembro añadido correctamente");
       setOpenAddMemberModal(false);
       resetForm();
       // Refrescar
       const roomData = await getRoomDetails(roomId);
       setRoom({ ...roomData, members: sanitizeMembers(roomData.members) });
     } catch (err) {
       if (err.status === 401 || err.status === 403) {
         setMessage("Sesión expirada o sin permisos. Redirigiendo a login.");
         const deletedU = localStorage.getItem("username");
         if (deletedU) localStorage.setItem("__lastDeletedUsername", deletedU);
         localStorage.removeItem("token");
         localStorage.removeItem("username");
         window.location.replace("/login");
       } else if (err.status === 400) {
         setMessage(err.message || "Error en la solicitud");
       } else {
         setMessage(err.message || "No se pudo añadir el miembro");
       }
     }
  };

  // Cambiar rol
  const handleChangeRole = async (memberId, newRole) => {
    try {
      await updateMemberRole(roomId, memberId, newRole);
      const roomData = await getRoomDetails(roomId);
      setRoom({ ...roomData, members: sanitizeMembers(roomData.members) });
    } catch (err) {
      alert(err.message || "No se pudo cambiar el rol");
    }
  };

  // Toggle completar tarea
  const handleToggleComplete = async (task) => {
    const originalCompleted = task.completed;
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)));
    try {
      await updateTask(roomId, task.id, { completed: !task.completed });
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: originalCompleted } : t)));
      alert(err.message || "No se pudo actualizar la tarea");
    }
  };

  // Confirmar eliminar tarea
  const confirmDeleteTask = (task) => {
    setTaskToDelete(task);
    setOpenDeleteTaskModal(true);
  };

  // Eliminar tarea
  const handleDeleteTask = async () => {
    try {
      await deleteTask(roomId, taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      setOpenDeleteTaskModal(false);
      setTaskToDelete(null);
    } catch (err) {
      alert(err.message || "No se pudo eliminar la tarea");
    }
  };

  // Crear tarea
  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setTaskForm((f) => ({ ...f, [name]: value }));
  };

  const submitTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      setTaskError("El título es obligatorio");
      return;
    }
    setTaskError("");
    setTaskLoading(true);
    try {
      const payload = {
        title: taskForm.title,
        description: taskForm.description || "",
      };
      const newTask = await createTask(roomId, payload);
      setTasks((prev) => [newTask, ...prev]);
      setOpenTaskModal(false);
      setTaskForm({ title: "", description: "" });
     } catch (err) {
       if (err.status === 401 || err.status === 403) {
         const deletedU = localStorage.getItem("username");
         if (deletedU) localStorage.setItem("__lastDeletedUsername", deletedU);
         localStorage.removeItem("token");
         localStorage.removeItem("username");
         window.location.replace("/login");
       } else {
        alert(err.message || "No se pudo crear la tarea");
      }
    } finally {
      setTaskLoading(false);
    }
  };

  if (loading) return <div className="ns-root"><div className="dash-loading">Cargando…</div></div>;
  if (error) return <div className="ns-root"><div className="ns-alert ns-alert--err">{error}</div></div>;
  if (!room) return <div className="ns-root"><div>No se encontró la sala.</div></div>;

  const myRole = room?.members?.find(m => m.userId === me?.id)?.role;
  const safeMembers = sanitizeMembers(room?.members || []);

  let ownerUsername = getOwnerUsername(room);
  if (!ownerUsername) {
    ownerUsername = findOwnerUsernameFromMembers(safeMembers);
  }

  let ownerLabel = null;
  if (ownerUsername) {
    const ownerObj = safeMembers.find(
      (m) => typeof m !== "string" && m?.username === ownerUsername
    );
    ownerLabel = ownerObj?.name || ownerObj?.username || ownerUsername;
  }

  return (
    <div className="ns-root">
      <Navbar variant="dashboard" />

      <main className="dash-main">
        <header className="dash-header">
          <button className="btn-primary" onClick={() => navigate("/dashboard")}>
            ← Volver a Mis Salas
          </button>
          <h1 className="dash-title">Sala: {room.name}</h1>
        </header>

        <section className="dash-room-detail">
            {/* Info sala */}
            <div className="room-info">
              <h3>Información de la Sala</h3>
               <p><strong>Descripción:</strong> {room.description || "Sin descripción"}</p>
               <p><strong>Pública:</strong> {room.isPublic ? "Sí" : "No"}</p>
               {ownerUsername && (
                 <p>
                   <strong>Propietario:</strong>{" "}
                   {(() => {
                     const ownerObj = safeMembers.find(
                       (m) => typeof m !== "string" && m?.username === ownerUsername
                     );
                     return ownerObj?.name || ownerObj?.username || ownerUsername;
                   })()}
                 </p>
               )}
               <p><strong>Miembros:</strong> {safeMembers.length}</p>
              <button className="btn-primary" onClick={handleOpenAddMember} style={{ marginTop: '10px' }}>
                + Añadir Miembro
              </button>
            </div>

              {/* Miembros */}
              <div className="members-list">
                 <h3>Miembros ({safeMembers.length})</h3>
                <ul className="members">
                   {safeMembers.map((m, i) => {
                     const key = typeof m === "string" ? m : (m.id || m.username || i);
                     const username = typeof m === "string"
                       ? m.split(":")[0] // por si viene "usuario:OWNER"
                       : m.username;
                     const label = typeof m === "string"
                       ? username
                       : (m.name || m.username);
                     // Es propietario si coincide con ownerUsername o si su objeto trae flag de owner
                     const isOwner =
                       (ownerUsername && username === ownerUsername) ||
                       (typeof m !== "string" &&
                         (m.role === "OWNER" ||
                          m.role === "PROPIETARIO" ||
                          m.isOwner === true ||
                          m?.roles?.includes?.("OWNER")));
                     return (
                       <li key={key} className="member-item">
                         <span>{label}</span>
                         {isOwner ? (
                           <span className="badge badge-owner">PROPIETARIO</span>
                         ) : (
                           <span className="badge badge-member">MIEMBRO</span>
                         )}
                       </li>
                     );
                   })}
                </ul>
              </div>

          {/* Tareas */}
          <div className="tasks-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3>Tareas</h3>
              {myRole !== 'VIEWER' && (
                <button className="btn-primary" onClick={handleOpenTaskModal}>
                  + Nueva tarea
                </button>
              )}
            </div>
            {tasks.length === 0 ? (
              <div className="tasks-empty">No hay tareas en esta sala</div>
            ) : (
               <ul className="tasks-list">
                 {tasks.map((t) => (
                   <li
                     key={t.id}
                     className="task-item"
                     onClick={() => { setTaskSelected(t); setShowTaskModal(true); }}
                   >
                     {/* Lado izquierdo: punto + título */}
                     <div className="task-main">
                       <span className="dot" style={{ background: t.priority === "HIGH" ? "#ef4444" : t.priority === "LOW" ? "#22c55e" : "#f59e0b" }} />
                       <span className="task-title" style={t.completed ? { textDecoration: "line-through", opacity: 0.6 } : {}}>{t.title}</span>
                       <span className={`badge ${t.priority === "HIGH" ? "badge-danger" : t.priority === "LOW" ? "badge-success" : "badge-warning"}`}>
                         {t.priority}
                       </span>
                     </div>
                     {/* Lado derecho: acciones (no deben propagar el click) */}
                     {myRole !== 'VIEWER' && (
                       <div className="task-actions" onClick={(e) => e.stopPropagation()}>
                         <button
                           className="icon-btn"
                           title={t.completed ? "Marcar como pendiente" : "Marcar como completada"}
                           onClick={() => handleToggleComplete(t)}
                         >
                           {t.completed ? "↩️" : "✅"}
                         </button>
                         <button
                           className="icon-btn"
                           title="Eliminar tarea"
                            onClick={() => confirmDeleteTask(t)}
                         >
                           🗑️
                         </button>
                       </div>
                     )}
                   </li>
                 ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      {/* Modal Añadir Miembro */}
      {openAddMemberModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="modal-title">Añadir Miembro a la Sala</h2>
            <div className="modal-form">
              <label>
                Buscar por:
                <select value={searchMode} onChange={(e) => { setSearchMode(e.target.value); setUsernameInput(""); setUserIdSeleccionado(""); setMessage(""); }}>
                  <option value="username">Username</option>
                  <option value="id">ID</option>
                </select>
              </label>
              <label>
                {searchMode === "username" ? "Usuario:" : "User ID:"}
                <div className="input-container">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      if (searchMode === "id") {
                        const idValido = /^[a-f\d]{24}$/i.test(e.target.value);
                        setMessage(idValido ? "" : "ID inválido");
                      } else {
                        setMessage("");
                      }
                    }}
                    placeholder={
                      searchMode === "username"
                        ? "Ingresa username"
                        : "Ingresa userId (24 hex)"
                    }
                  />
                </div>
                {searchMode === "username" && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleBuscar}
                  >
                    {searching ? "Buscando..." : "Buscar"}
                  </button>
                )}
              </label>
              {message && <p>{message}</p>}
              <div className="flex items-center justify-end gap-2 mt-4">
                <button type="button" className="btn-secondary" onClick={() => { setOpenAddMemberModal(false); resetForm(); }}>
                  Cancelar
                </button>
                <button type="button" className="btn-primary" disabled={!userIdSeleccionado} onClick={submitAddMember}>
                  Añadir Miembro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Tarea */}
      {openTaskModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="modal-title">Nueva tarea</h2>
            <form onSubmit={submitTask} className="modal-form">
              <label>
                Título:
                <input
                  type="text"
                  name="title"
                  value={taskForm.title}
                  onChange={(e) => {
                    handleTaskChange(e);
                    if (taskError && e.target.value.trim()) setTaskError("");
                  }}
                  placeholder="Ej. examen de física"
                />
              </label>
              {taskError && <p style={{ color: "red" }}>{taskError}</p>}

              <label>
                Descripción:
                <textarea
                  name="description"
                  value={taskForm.description}
                  onChange={handleTaskChange}
                  placeholder="(opcional)"
                />
              </label>

              <div className="modal-actions">
                <button type="submit" className="btn-primary" disabled={taskLoading}>
                  {taskLoading ? "Creando..." : "Crear"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setOpenTaskModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Tarea */}
      {selectedTask && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="modal-title">{selectedTask.title}</h2>
            <div className="modal-form">
              <p><strong>Descripción:</strong> {selectedTask.description?.trim() ? selectedTask.description : "Sin descripción"}</p>
              <p><strong>Creada por:</strong> {selectedTask.createdByName || "Sin asignar"}</p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSelectedTask(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Tarea */}
      {openDeleteTaskModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="modal-title">Eliminar tarea</h2>
            <p style={{ textAlign: "center", color: "#a8b3c7", marginBottom: "14px" }}>
              ¿Seguro que quieres eliminar <strong>{taskToDelete?.title}</strong>?
            </p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setOpenDeleteTaskModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleDeleteTask}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
       )}

       {/* Modal de Detalle */}
       {showTaskModal && taskSelected && (
         <div className="modal-backdrop" onClick={() => setShowTaskModal(false)}>
           <div className="modal-card" onClick={(e) => e.stopPropagation()}>
             <div className="modal-header">
               <h3 className="modal-title">{taskSelected.title}</h3>
               <button className="btn-close" onClick={() => setShowTaskModal(false)}>×</button>
             </div>
             <div className="modal-body">
               {taskSelected.description
                 ? <p style={{whiteSpace: 'pre-wrap'}}>{taskSelected.description}</p>
                 : <p style={{opacity:.7}}>Sin descripción.</p>}
             </div>
             {/* Opcional, pequeño pie informativo */}
             {(taskSelected.createdByUsername || taskSelected.createdAt) && (
               <div className="modal-footer meta">
                   <span>Creada por: {taskSelected.createdByUsername || "Sin asignar"}</span>
                 {taskSelected.createdAt && <span>  {new Date(taskSelected.createdAt).toLocaleString()}</span>}
               </div>
             )}
           </div>
         </div>
       )}
     </div>
   );
 }
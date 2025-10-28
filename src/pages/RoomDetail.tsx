import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import RoomChatPanel from "../components/RoomChatPanel";
import { useAuth } from "../hooks/useAuth";
import { getRoomDetails, getRoomTasks, addMember, searchUser, updateTask, deleteTask, createTask } from "../services/api";
import "./dashboard.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface Member {
  id?: string;
  username?: string;
  name?: string;
  role?: string;
  isOwner?: boolean;
  roles?: string[];
}

interface Room {
  name: string;
  description?: string;
  isPublic: boolean;
  members: (Member | string)[];
  owner?: Member;
  createdBy?: Member;
  ownerUsername?: string;
  createdByUsername?: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: string;
  createdByName?: string;
  createdByUsername?: string;
  createdAt?: string;
}

interface User {
  id: string;
  username: string;
}

const isValidMember = (m: Member | string): boolean => {
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

export default function RoomDetail(): JSX.Element {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth() as { token: string | null; user: User | null };
  const [loading, setLoading] = useState<boolean>(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);

   // Estados del modal añadir miembro
    const [openAddMemberModal, setOpenAddMemberModal] = useState<boolean>(false);
    const [usernameInput, setUsernameInput] = useState<string>("");
    const [userIdSeleccionado, setUserIdSeleccionado] = useState<string>("");

  const [message, setMessage] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);

  const [openDeleteTaskModal, setOpenDeleteTaskModal] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [openTaskModal, setOpenTaskModal] = useState<boolean>(false);
  const [taskForm, setTaskForm] = useState<{ title: string; description: string }>({
    title: "",
    description: "",
  });
  const [taskError, setTaskError] = useState<string>("");
  const [taskLoading, setTaskLoading] = useState<boolean>(false);
     const [selectedTask, setSelectedTask] = useState<Task | null>(null);
     const [showTaskModal, setShowTaskModal] = useState<boolean>(false);
     const [taskSelected, setTaskSelected] = useState<Task | null>(null);

    // Cargar datos
     useEffect(() => {
        (async () => {
          try {
            setLoading(true);
            const [roomData, tasksData] = await Promise.all([
              getRoomDetails(roomId!),
              getRoomTasks(roomId!),
            ]);
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
       await addMember(roomId!, userIdSeleccionado, "EDITOR");
        setMessage("Miembro añadido correctamente");
        setOpenAddMemberModal(false);
        resetForm();
        // Refrescar
        const roomData = await getRoomDetails(roomId!);
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



   // Toggle completar tarea
   const handleToggleComplete = async (task: Task) => {
     const originalCompleted = task.completed;
     setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t)));
     try {
       await updateTask(roomId!, task.id, { completed: !task.completed });
     } catch (err) {
       setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: originalCompleted } : t)));
       alert(err.message || "No se pudo actualizar la tarea");
     }
   };

   // Confirmar eliminar tarea
   const confirmDeleteTask = (task: Task) => {
     setTaskToDelete(task);
     setOpenDeleteTaskModal(true);
   };

   // Eliminar tarea
   const handleDeleteTask = async () => {
     if (!taskToDelete) return;
     try {
       await deleteTask(roomId!, taskToDelete.id);
       setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
       setOpenDeleteTaskModal(false);
       setTaskToDelete(null);
     } catch (err) {
       alert(err.message || "No se pudo eliminar la tarea");
     }
   };

   // Crear tarea
   const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
     const { name, value } = e.target;
     setTaskForm((f) => ({ ...f, [name]: value }));
   };

   const submitTask = async (e: React.FormEvent<HTMLFormElement>) => {
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
       const newTask = await createTask(roomId!, payload);
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

  const myRole = room?.members?.find(m => m.userId === user?.id)?.role;
  const safeMembers = sanitizeMembers(room?.members || []);

  let ownerUsername = getOwnerUsername(room);
  if (!ownerUsername) {
    ownerUsername = findOwnerUsernameFromMembers(safeMembers);
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
                             style={{ color: t.completed ? '#6b7280' : '#22c55e' }}
                           >
                             {t.completed ? (
                               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.59 5.58L20 12l-8-8-8 8z" fill="currentColor"/>
                               </svg>
                             ) : (
                               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                               </svg>
                             )}
                           </button>
                           <button
                             className="icon-btn"
                             title="Eliminar tarea"
                              onClick={() => confirmDeleteTask(t)}
                              style={{ color: '#ef4444' }}
                           >
                             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                               <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z" fill="currentColor"/>
                             </svg>
                           </button>
                        </div>
                      )}
                    </li>
                  ))}
               </ul>
             )}
           </div>

               {/* Chat de la sala */}
               <RoomChatPanel
                 roomId={roomId}
                 currentUsername={user?.username}
               />
        </section>
      </main>

      {/* Modal Añadir Miembro */}
      {openAddMemberModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="modal-title">Añadir Miembro a la Sala</h2>
            <div className="modal-form">
              <label>
                Usuario:
                <div className="input-container">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      setMessage("");
                    }}
                    placeholder="Ingresar nombre del usuario"
                  />
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleBuscar}
                >
                  {searching ? "Buscando..." : "Buscar"}
                </button>
              </label>
              {message && <p>{message}</p>}
              <div className="flex items-center justify-end gap-2 mt-4">
                <button type="button" onClick={() => { setOpenAddMemberModal(false); resetForm(); }} style={{ backgroundColor: 'white', color: 'black', border: '1px solid #ccc', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer' }}>
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
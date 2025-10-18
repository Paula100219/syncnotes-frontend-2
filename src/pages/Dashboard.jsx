import { useEffect, useState } from "react";
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
  getRoomDetails,
  addMember,
  updateMemberRole,
  searchUser,
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

  const [roomForm, setRoomForm] = useState({
    name: "",
    description: "",
    isPublic: false,
  });

    // 🔹 Formulario de tareas
    const [taskForm, setTaskForm] = useState({
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
      assignedTo: "",
    });

   const [openDeleteModal, setOpenDeleteModal] = useState(false);
   const [roomToDelete, setRoomToDelete] = useState(null);

   const [openDeleteTaskModal, setOpenDeleteTaskModal] = useState(false);
   const [taskToDelete, setTaskToDelete] = useState(null);

       const [openAddMemberModal, setOpenAddMemberModal] = useState(false);
       const [searchMode, setSearchMode] = useState("username"); // "username" or "id"
       const [usernameInput, setUsernameInput] = useState("");
       const [userIdSeleccionado, setUserIdSeleccionado] = useState("");
       const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
       const [message, setMessage] = useState("");
       const [searching, setSearching] = useState(false);
       const [adding, setAdding] = useState(false);

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
      const [roomTasks, roomDetails] = await Promise.all([
        getRoomTasks(room.id),
        getRoomDetails(room.id),
      ]);
      setTasks(roomTasks);
      setSelectedRoom(roomDetails); // actualizar con detalles completos
    } catch {
      alert("No se pudieron cargar los datos de la sala");
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

  // 🔹 Crear o actualizar tarea (sin fecha)
  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setTaskForm((f) => ({ ...f, [name]: value }));
  };

    const submitTask = async (e) => {
      e.preventDefault();
      if (!selectedRoom) return alert("Primero selecciona una sala.");

      try {
        await createTask(selectedRoom.id, {
          title: taskForm.title,
          description: taskForm.description,
        });
        alert("Tarea creada correctamente");

        const updatedTasks = await getRoomTasks(selectedRoom.id);
        setTasks(updatedTasks);
        setOpenTaskModal(false);
        setTaskForm({ title: "", description: "", priority: "MEDIUM", dueDate: "", assignedTo: "" });
      } catch (err) {
        alert(err.message || "No se pudo guardar la tarea");
      }
    };

   // 🔹 Confirmar eliminación de tarea
   const confirmDeleteTask = (task) => {
     setTaskToDelete(task);
     setOpenDeleteTaskModal(true);
   };



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
           setUsuarioEncontrado(response.usuario);
           setMessage("Usuario encontrado correctamente.");
         } else {
           setMessage("Usuario no encontrado");
           setUserIdSeleccionado("");
           setUsuarioEncontrado(null);
         }
       } catch (err) {
         if (err.status === 404) {
           setMessage("Usuario no encontrado");
         } else if (err.status === 401 || err.status === 403) {
           setMessage("Sesión expirada. Redirigiendo a login.");
           window.location.href = "/login";
         } else {
           setMessage("Error al buscar usuario");
         }
         setUserIdSeleccionado("");
         setUsuarioEncontrado(null);
       } finally {
         setSearching(false);
       }
     };

     const submitAddMember = async () => {
       if (!selectedRoom) {
         setMessage("Selecciona una sala primero");
         return;
       }
       if (!userIdSeleccionado) {
         setMessage("Primero busca un usuario");
         return;
       }
       setAdding(true);
       try {
         await addMember(selectedRoom.id, userIdSeleccionado, "EDITOR");
         setMessage("Miembro añadido correctamente");
         setOpenAddMemberModal(false);
         resetForm();
         // Refrescar miembros
         try {
           const roomDetails = await getRoomDetails(selectedRoom.id);
           setSelectedRoom(roomDetails);
         } catch (refreshErr) {
           console.error("Error al refrescar miembros:", refreshErr);
         }
        } catch (err) {
          if (err.status === 401 || err.status === 403) {
            setMessage("Sesión expirada o sin permisos. Redirigiendo a login.");
            window.location.href = "/login";
          } else if (err.status === 400) {
            setMessage(err.message || "Error en la solicitud");
          } else {
            setMessage(err.message || "No se pudo añadir el miembro");
          }
        } finally {
         setAdding(false);
       }
     };

     const resetForm = () => {
       setUsernameInput("");
       setUserIdSeleccionado("");
       setUsuarioEncontrado(null);
       setMessage("");
       setSearching(false);
       setAdding(false);
     };

   // 🔹 Cambiar rol de miembro
   const handleChangeRole = async (memberId, newRole) => {
     try {
       await updateMemberRole(selectedRoom.id, memberId, newRole);
       const roomDetails = await getRoomDetails(selectedRoom.id);
       setSelectedRoom(roomDetails);
     } catch (err) {
       alert(err.message || "No se pudo cambiar el rol");
     }
   };

   // 🔹 Eliminar tarea
   const handleDeleteTask = async () => {
     try {
       await deleteTask(selectedRoom.id, taskToDelete.id);
       const updatedTasks = await getRoomTasks(selectedRoom.id);
       setTasks(updatedTasks);
       setOpenDeleteTaskModal(false);
       setTaskToDelete(null);
     } catch (err) {
       alert(err.message || "No se pudo eliminar la tarea");
     }
   };

   // 🔹 Marcar tarea como completada/no completada
   const handleToggleComplete = async (task) => {
     try {
       await updateTask(selectedRoom.id, task.id, { completed: !task.completed });
       const updatedTasks = await getRoomTasks(selectedRoom.id);
       setTasks(updatedTasks);
     } catch (err) {
       alert(err.message || "No se pudo actualizar la tarea");
     }
   };

  // 🔹 Confirmar eliminación de sala
  const confirmDeleteRoom = (room) => {
    setRoomToDelete(room);
    setOpenDeleteModal(true);
  };

  // 🔹 Eliminar sala
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

              {/* 🟩 Panel de tareas y miembros */}
              <aside className="dash-right">
                <h2 className="dash-section-title">
                  {selectedRoom
                    ? `Sala: ${selectedRoom.name}`
                    : "Selecciona una sala"}
                </h2>

                 {selectedRoom && (
                   <div className="room-info">
                     <h3>Información de la Sala</h3>
                     <div>
                       <p><strong>Descripción:</strong> {selectedRoom.description || "Sin descripción"}</p>
                       <p><strong>Pública:</strong> {selectedRoom.isPublic ? "Sí" : "No"}</p>
                       <p><strong>Miembros:</strong> {selectedRoom.members?.length || 0}</p>
                     </div>
                     {selectedRoom.members?.some(m => m.userId === me?.user?.id && (m.role === "OWNER" || m.role === "ADMIN")) && (
                       <button className="btn-secondary" onClick={() => setOpenAddMemberModal(true)}>
                         + Añadir Miembro
                       </button>
                     )}
                   </div>
                 )}

                 {selectedRoom && (
                   <div className="members-list">
                      <h3>Miembros ({selectedRoom.members?.length || 0})</h3>
                       <ul>
                         {selectedRoom.members?.map((m) => {
                           const roleMap = {
                             OWNER: "Propietario",
                             EDITOR: "Miembro",
                             VIEWER: "Lector",
                           };
                           const badgeClass = {
                             OWNER: "badge-owner",
                             EDITOR: "badge-editor",
                             VIEWER: "badge-viewer",
                           };
                           return (
                             <li key={m.userId}>
                               <div>
                                 <strong>{m.username}</strong> <span className={`badge ${badgeClass[m.role] || ""}`}>{roleMap[m.role] || m.role}</span>
                               </div>
                               {selectedRoom.members?.find(mem => mem.userId === me?.user?.id)?.role === "OWNER" && m.role !== "OWNER" && (
                                 <select
                                   value={m.role}
                                   onChange={(e) => handleChangeRole(m.userId, e.target.value)}
                                 >
                                   <option value="EDITOR">Miembro</option>
                                   <option value="VIEWER">Lector</option>
                                 </select>
                               )}
                             </li>
                           );
                         })}
                       </ul>
                   </div>
                 )}

                <h3>Tareas</h3>

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
                          <div className="task-title" style={t.completed ? { textDecoration: "line-through", opacity: 0.6 } : {}}>{t.title}</div>

                          <div className="task-meta" style={{ fontSize: "0.8em", color: "#666", marginTop: "4px" }}>
                            Asignada a: {t.assignedToName || "Nadie"} | Creada por: {t.createdByName}
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
 
                          <div className="task-actions">
                            <button
                              className="btn-ghost small"
                              onClick={() => handleToggleComplete(t)}
                              title={t.completed ? "Marcar como pendiente" : "Marcar como completada"}
                            >
                              {t.completed ? "↩️" : "✅"}
                            </button>
                            <button
                              className="btn-ghost small"
                              onClick={() => confirmDeleteTask(t)}
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
                           setTaskForm({ title: "", description: "" });
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



      {/* 🔹 Modal Crear Sala */}
      {openRoomModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="modal-title">Crear nueva sala</h2>
            <form onSubmit={submitRoom} className="modal-form">
              <label>
                Nombre:
                <input
                  type="text"
                  name="name"
                  value={roomForm.name}
                  onChange={handleRoomChange}
                  required
                />
              </label>

              <label>
                Descripción:
                <textarea
                  name="description"
                  value={roomForm.description}
                  onChange={handleRoomChange}
                  placeholder="(opcional)"
                />
              </label>

              <label className="checkbox">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={roomForm.isPublic}
                  onChange={handleRoomChange}
                />{" "}
                Sala pública
              </label>

               <div className="modal-actions">
                 <button type="submit" className="btn-primary">
                   Crear Sala
                 </button>
                 <button
                   type="button"
                   className="btn-secondary"
                   onClick={() => setOpenRoomModal(false)}
                 >
                   Cancelar
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔹 Modal Crear/Editar Tarea */}
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
                   onChange={handleTaskChange}
                   required
                   placeholder="Ej. examen de física"
                 />
               </label>

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
                <button type="submit" className="btn-primary">
                  Guardar
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

      {/* 🔹 Modal Eliminar Sala */}
      {openDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="modal-title">Eliminar sala</h2>
            <p
              style={{
                textAlign: "center",
                color: "#a8b3c7",
                marginBottom: "14px",
              }}
            >
              ¿Seguro que quieres eliminar <strong>{roomToDelete?.name}</strong>?
            </p>
            <div className="modal-actions">
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

      {/* 🔹 Modal Eliminar Tarea */}
      {openDeleteTaskModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="modal-title">Eliminar tarea</h2>
            <p
              style={{
                textAlign: "center",
                color: "#a8b3c7",
                marginBottom: "14px",
              }}
            >
              ¿Seguro que quieres eliminar <strong>{taskToDelete?.title}</strong>?
            </p>
            <div className="modal-actions">
              <button
                className="btn-ghost"
                onClick={() => setOpenDeleteTaskModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleDeleteTask}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

         {/* 🔹 Modal Añadir Miembro */}
         {openAddMemberModal && selectedRoom && (
           <div className="modal-backdrop">
             <div className="modal">
               <h2 className="modal-title">Añadir Miembro a la Sala</h2>
               <div className="modal-form">
                 <label>
                   Buscar por:
                   <select
                     value={searchMode}
                     onChange={(e) => {
                       const newMode = e.target.value;
                       setUsernameInput("");
                       setUserIdSeleccionado("");
                       setUsuarioEncontrado(null);
                       setMessage("");
                     }}
                   >
                     <option value="username">Username</option>
                     <option value="id">ID</option>
                   </select>
                 </label>
                 <label>
                   {searchMode === "username" ? "Usuario:" : "User ID:"}
                   <input
                     type="text"
                     value={usernameInput}
                     onChange={(e) => {
                       const val = e.target.value;
                       setUsernameInput(val);
                       setMessage("");
                       setUserIdSeleccionado("");
                       setUsuarioEncontrado(null);
                       if (searchMode === "id") {
                         if (/^[a-fA-F0-9]{24}$/.test(val)) {
                           setUserIdSeleccionado(val);
                           setMessage("ID válido");
                         } else {
                           setMessage("ID inválido");
                         }
                       }
                     }}
                     placeholder={searchMode === "username" ? "Ingresa username" : "Ingresa userId (24 hex)"}
                   />
                   {searchMode === "username" && (
                     <button
                       type="button"
                       disabled={searching}
                       onClick={handleBuscar}
                     >
                       {searching ? "Buscando..." : "Buscar"}
                     </button>
                   )}
                 </label>
                  {message && <p>{message}</p>}
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setOpenAddMemberModal(false);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={!userIdSeleccionado}
                      onClick={submitAddMember}
                    >
                      Añadir Miembro
                    </button>
                  </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

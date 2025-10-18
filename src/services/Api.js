// Base del backend desde .env (VITE_API_BASE=http://localhost:8081).
// Si no está definida, usa cadena vacía (same-origin).
const API =
  (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || "";

function makeUrl(path) {
  // path siempre debe comenzar con "/"
  return API + path;
}

// Guardar / obtener el token
export const setToken = (t) => localStorage.setItem("auth_token", t);
export const getToken = () => localStorage.getItem("auth_token");

// Helpers seguros
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

function authHeaders(extra = {}) {
  return {
    Authorization: "Bearer " + getToken(),
    ...extra,
  };
}

// 🔹 LOGIN: obtiene el token y lo guarda (lanza error legible en 401/403)
export async function login(username, password) {
  const r = await fetch(makeUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ username, password }),
  });

  const body = await safeJson(r);
  if (!r.ok) {
    const fallback = await safeText(r);
    const err = new Error(
      (body && (body.error || body.message)) || fallback || "Login failed"
    );
    err.status = r.status;
    err.data = body;
    throw err;
  }

  const token = body && body.token;
  setToken(token);
  return token;
}

// 🔹 GET genérico con autorización (Bearer)
export async function apiGet(path) {
  const r = await fetch(makeUrl(path), {
    headers: authHeaders(),
  });

  const body = await safeJson(r);
  if (!r.ok) {
    const fallback = await safeText(r);
    const err = new Error(
      (body && (body.error || body.message)) || fallback || "Request failed"
    );
    err.status = r.status;
    err.data = body;
    throw err;
  }
  return body;
}

// 🔹 POST genérico con autorización
async function apiPost(path, data) {
  const r = await fetch(makeUrl(path), {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data || {}),
  });
  const body = await safeJson(r);
  if (!r.ok) {
    const fallback = await safeText(r);
    const err = new Error(
      (body && (body.error || body.message)) || fallback || "Request failed"
    );
    err.status = r.status;
    err.data = body;
    throw err;
  }
  return body;
}

// 🔹 PUT genérico con autorización
async function apiPut(path, data) {
  const r = await fetch(makeUrl(path), {
    method: "PUT",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(data || {}),
  });
  const body = await safeJson(r);
  if (!r.ok) {
    const fallback = await safeText(r);
    const err = new Error(
      (body && (body.error || body.message)) || fallback || "Request failed"
    );
    err.status = r.status;
    err.data = body;
    throw err;
  }
  return body;
}

// 🔹 DELETE genérico con autorización
async function apiDelete(path) {
  const r = await fetch(makeUrl(path), {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!r.ok) {
    const body = await safeJson(r);
    const fallback = await safeText(r);
    const err = new Error(
      (body && (body.error || body.message)) || fallback || "Request failed"
    );
    err.status = r.status;
    err.data = body;
    throw err;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────
// ENDPOINTS DE TU BACKEND
// ─────────────────────────────────────────────────────────────

// Me: devuelve { user, rooms, tasks, message } desde /api/auth/me
export const getMe = () => apiGet("/api/auth/me");

// Rooms
export const getPublicRooms = () => apiGet("/api/rooms/public");
export const getMyRooms = () => apiGet("/api/rooms/my-rooms");

// ✅ Crear sala
export function createRoom({ name, description, isPublic }) {
  return apiPost("/api/rooms", {
    name,
    description: description || "",
    // si tu DTO usa "isPublic" o "privacy", ajusta el campo:
    isPublic: !!isPublic,
  });
}

// ✅ Obtener tareas de una sala (opcional si ya usas /me)
export function getRoomTasks(roomId, completed) {
  const q = typeof completed === "boolean" ? `?completed=${completed}` : "";
  return apiGet(`/api/rooms/${encodeURIComponent(roomId)}/tasks${q}`);
}

// ✅ Crear tarea
export function createTask(roomId, { title, description }) {
  return apiPost(`/api/rooms/${encodeURIComponent(roomId)}/tasks`, {
    title,
    description: description || "",
  });
}

// (opcionales) actualizar / eliminar tarea
export function updateTask(roomId, taskId, payload) {
  return apiPut(`/api/rooms/${roomId}/tasks/${taskId}`, payload);
}
export function deleteTask(roomId, taskId) {
  return apiDelete(`/api/rooms/${roomId}/tasks/${taskId}`);
}

// 🔹 REGISTER: crear usuario nuevo
export async function register(name, username, password) {
  const r = await fetch(makeUrl("/api/users/signup-user"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ name, username, password }),
  });

  const body = await safeJson(r);
  if (!r.ok) {
    const fallback = await safeText(r);
    const err = new Error(
      (body && (body.error || body.message)) || fallback || "Register failed"
    );
    err.status = r.status;
    err.data = body;
    throw err;
  }
  return body;
}
// ✅ Eliminar sala
export function deleteRoom(roomId) {
  return apiDelete(`/api/rooms/${encodeURIComponent(roomId)}`);
}

// ✅ Obtener detalles de sala
export function getRoomDetails(roomId) {
  return apiGet(`/api/rooms/${encodeURIComponent(roomId)}`);
}

// ✅ Añadir miembro a sala
export function addMember(roomId, userId, role) {
  return apiPost(`/api/rooms/${encodeURIComponent(roomId)}/members`, { userId, role });
}

// ✅ Buscar usuario por username
export function searchUser(username) {
  return apiGet(`/api/users/searchUser/${encodeURIComponent(username)}`);
}

// ✅ Actualizar rol de miembro
export function updateMemberRole(roomId, memberId, role) {
  return apiPut(`/api/rooms/${encodeURIComponent(roomId)}/members/${encodeURIComponent(memberId)}/role?role=${encodeURIComponent(role)}`);
}

// ✅ Unirse a sala pública
export function joinRoom(roomId) {
  return apiPost(`/api/rooms/${encodeURIComponent(roomId)}/join`);
}

// ✅ Obtener mensajes de sala
export function getRoomMessages(roomId) {
  return apiGet(`/api/rooms/${encodeURIComponent(roomId)}/messages`);
}

// ✅ Obtener historial de sala
export function getRoomHistory(roomId) {
  return apiGet(`/api/rooms/${encodeURIComponent(roomId)}/history`);
}


// 🔹 (opcional) test conexión
export async function getServerMessage() {
  try {
    const response = await apiGet("/api/message");
    return (response && response.message) || response;
  } catch (error) {
    console.error("Error al obtener mensaje del servidor:", error);
    return null;
  }
}
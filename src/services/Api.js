// Base del backend desde .env (VITE_API_BASE=http://localhost:8081).
// Si no está definida, usa cadena vacía (same-origin).
const API = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || "";

function makeUrl(path) {
  // path siempre debe comenzar con "/"
  return API + path;
}

// Guardar / obtener el token
export const setToken = (t) => localStorage.setItem("auth_token", t);
export const getToken = () => localStorage.getItem("auth_token");

// Helpers seguros
async function safeJson(res) {
  try { return await res.json(); } catch (e) { return null; }
}
async function safeText(res) {
  try { return await res.text(); } catch (e) { return ""; }
}

// 🔹 LOGIN: obtiene el token y lo guarda (lanza error legible en 401/403)
export async function login(username, password) {
  const r = await fetch(makeUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: username, password: password })
  });

  const body = await safeJson(r);
  if (!r.ok) {
    const fallback = await safeText(r);
    const err = new Error((body && body.message) || fallback || "Login failed");
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
    headers: { Authorization: "Bearer " + getToken() }
  });

  const body = await safeJson(r);
  if (!r.ok) {
    const fallback = await safeText(r);
    const err = new Error((body && body.message) || fallback || "Request failed");
    err.status = r.status;
    err.data = body;
    throw err;
  }
  return body;
}

// 🔹 Ejemplos de endpoints de tu backend
export const getPublicRooms = () => apiGet("/api/rooms/public");
export const getMyRooms =   () => apiGet("/api/rooms/my-rooms");

// 🔹 Obtener mensaje del servidor para test de conexión
export async function getServerMessage() {
  try {
    const response = await apiGet("/api/message");
    return (response && response.message) || response;
  } catch (error) {
    console.error("Error al obtener mensaje del servidor:", error);
    return null;
  }
}

// 🔹 REGISTER: crear usuario nuevo
export async function register(name, username, password) {
  const r = await fetch(makeUrl("/api/users/signup-user"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name, username: username, password: password })
  });

  const body = await safeJson(r);
  if (!r.ok) {
    const fallback = await safeText(r);
    const err = new Error((body && body.message) || fallback || "Register failed");
    err.status = r.status;
    err.data = body;
    throw err;
  }
  return body;
}

/* ============================================================
   🔎 Opcional: comprobar si un usuario existe (para afinar el
   mensaje en el login cuando el backend responde genérico).
   - Devuelve true  -> el usuario existe
   - Devuelve false -> el usuario NO existe
   - Devuelve null  -> no se pudo determinar (endpoint no existe,
                       CORS, etc). En ese caso no rompas la UI.
   ============================================================ */
export async function userExists(username) {
  try {
    // Opción A: /api/users/exists?username=...
    const rA = await fetch(
      makeUrl("/api/users/exists?username=" + encodeURIComponent(username))
    );
    if (rA.ok) {
      const data = (await safeJson(rA)) || {};
      if (typeof data.exists === "boolean") return data.exists;
      if (typeof data.userExists === "boolean") return data.userExists;
      if (typeof data.found === "boolean") return data.found;
    } else if (rA.status === 404) {
      // si el endpoint no existe, probamos la opción B
    }
  } catch (e) {
    // ignoramos y probamos la opción B
  }

  try {
    // Opción B: /api/users/:username -> 200 existe, 404 no existe
    const rB = await fetch(
      makeUrl("/api/users/" + encodeURIComponent(username))
    );
    if (rB.status === 200) return true;
    if (rB.status === 404) return false;
  } catch (e) {
    // ignoramos
  }

  return null;
}
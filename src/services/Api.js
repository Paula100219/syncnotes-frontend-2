// src/services/api.js
const API = import.meta.env.VITE_API_BASE;

// Guardar / obtener el token
export const setToken = (t) => localStorage.setItem("auth_token", t);
export const getToken = () => localStorage.getItem("auth_token");

// 🔹 LOGIN: obtiene el token y lo guarda
export async function login(username, password) {
  const r = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!r.ok) throw new Error(await r.text());
  const { token } = await r.json();
  setToken(token);
  return token;
}

// 🔹 GET genérico con autorización (Bearer)
export async function apiGet(path) {
  const r = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// 🔹 Ejemplos de endpoints de tu backend
export const getPublicRooms = () => apiGet("/api/rooms/public");
export const getMyRooms = () => apiGet("/api/rooms/my-rooms");

// 🔹 Obtener mensaje del servidor para test de conexión
export async function getServerMessage() {
  try {
    const response = await apiGet("/api/message");
    return response.message || response;
  } catch (error) {
    console.error("Error al obtener mensaje del servidor:", error);
    return null;
  }
}
// 🔹 REGISTER: crear usuario nuevo
export async function register(name, username, password) {
  const r = await fetch(`${API}/api/users/signup-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, password }),
  });

  if (!r.ok) {
    throw new Error(await r.text());
  }

  return await r.json();
}

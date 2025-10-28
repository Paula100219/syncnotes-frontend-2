// Usa la variable de entorno VITE_API_BASE_URL, si no existe, cae a window.location.origin.

let HTTP_BASE = import.meta.env.VITE_API_BASE_URL || window.location.origin;

function httpBaseToWsBase(base) {

// El endpoint WS vive en el mismo host del backend bajo /ws (sin /api).

// Si la base termina con /api/... lo recortamos para dejar solo el host.

try {

const url = new URL(base);

return `${url.protocol}//${url.host}`;

} catch {

return base;

}

}

export { HTTP_BASE, httpBaseToWsBase };
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// import { useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
// import { getServerMessage } from "./services/api";

export default function App() {
  /*  // si luego quieres probar la conexión al backend, descomenta:
  useEffect(() => {
    async function testConnection() {
      const response = await getServerMessage();
      if (response) console.log("Conectado al backend:", response);
      else console.error("No se pudo conectar al backend");
    }
    testConnection();
  }, []);
  */

  return (
    <Router>
      <Routes>
        {/* raíz -> login (replace evita que quede en el historial) */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* después de autenticación */}
        <Route path="/home" element={<Home />} />

        {/* rutas desconocidas -> login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
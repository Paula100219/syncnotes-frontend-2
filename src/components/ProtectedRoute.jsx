// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getMe, getToken, setToken } from "../services/Api";

export default function ProtectedRoute({ children }) {
  const [state, setState] = useState({ loading: true, ok: false });

  useEffect(() => {
    let mounted = true;
    async function check() {
      const token = getToken();
      if (!token) {
        if (mounted) setState({ loading: false, ok: false });
        return;
      }
      try {
        await getMe(); // valida token rápido
        if (mounted) setState({ loading: false, ok: true });
       } catch {
         // token inválido/expirado
         setToken(""); // limpia
         localStorage.removeItem("token");
         if (mounted) setState({ loading: false, ok: false });
       }
    }
    check();
    return () => { mounted = false; };
  }, []);

  if (state.loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-900 text-slate-200">
        <div className="animate-pulse opacity-80">Cargando…</div>
      </div>
    );
  }
  if (!state.ok) return <Navigate to="/login" replace />;

  return children;
}
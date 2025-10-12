import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AuthForm from "../components/AuthForm";
import { login } from "../services/api";
import "./login.css";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [mensaje, setMensaje] = useState(null); // { tipo:'error'|'ok', texto:string }
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (mensaje) setMensaje(null); // limpia el aviso al teclear
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setCargando(true);
    try {
      const token = await login(form.username, form.password);
      console.log("Token guardado:", token);
      navigate("/home");
    } catch (err) {
      const status = (err && err.status) || (err && err.response && err.response.status);
      const apiMsg =
        (err && err.data && err.data.message) ||
        (err && err.response && err.response.data && err.response.data.message) ||
        err.message;

      const texto =
        status === 401 || status === 403
          ? apiMsg || "Usuario o contraseña incorrectos."
          : apiMsg || "No se pudo iniciar sesión. Intenta de nuevo.";

      setMensaje({ tipo: "error", texto });
    } finally {
      setCargando(false);
    }
  };

  const fields = [
    { label: "Usuario", type: "text", name: "username", placeholder: "Nombre del usuario" },
    { label: "Contraseña", type: "password", name: "password", placeholder: "" }
  ];

  return (
    <div className="ns-root">
      <Navbar variant="login" />

      <main className="ns-main">
        <section className="ns-card">
          <h1 className="ns-title">Iniciar sesión en SyncNotes</h1>
          <p className="ns-subtitle">Bienvenido de nuevo. Accede a tus notas.</p>

          <div className="ns-form-scope" aria-live="polite">
            <AuthForm
              fields={fields}
              buttonText={cargando ? "Entrando..." : "Iniciar sesión"}
              onSubmit={handleSubmit}
              formData={form}
              onChange={handleChange}
              showForgotPassword={true}
              linkText="¿No tienes una cuenta?"
              linkTo="/register"
              linkLabel="Regístrate aquí"
            />

            {/* Mensaje de error/éxito debajo del formulario */}
            {mensaje && mensaje.texto && (
              <div
                className={`ns-alert ${
                  mensaje.tipo === "error" ? "ns-alert--err" : "ns-alert--ok"
                }`}
              >
                {mensaje.texto}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AuthForm from "../components/AuthForm";
import { login } from "../services/api";
import "./login.css";

function normalizeMsg(s) {
  try {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  } catch {
    return String(s || "").toLowerCase();
  }
}

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function validate() {
    const e = {};
    if (!form.username || !String(form.username).trim()) e.username = "No has ingresado tus datos.";
    if (!form.password || !String(form.password).trim()) e.password = "No has ingresado tus datos.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(evt) {
    const { name, value } = evt.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name] && value?.trim()) {
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
    if (message) setMessage(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await login(form.username, form.password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.user?.username || form.username);
      localStorage.setItem("name", data.user?.name || "");
      navigate("/dashboard"); // ⬅️ al dashboard
    } catch (err) {
      const status =
        err?.status || err?.response?.status;

      const apiMsgRaw =
        (err?.data && (err.data.error || err.data.message)) ||
        (err?.response?.data && (err.response.data.error || err.response.data.message)) ||
        err?.message || "";

      const m = normalizeMsg(apiMsgRaw);

      let text;
      if (status === 404) {
        text = "Usuario no encontrado.";
      } else if (status === 401 || status === 403) {
        if (m.includes("usuario no encontrado") || m.includes("usuario incorrecto")) {
          text = "Usuario no encontrado.";
        } else if (m.includes("contrasena incorrecta") || m.includes("contraseña incorrecta") || m.includes("password")) {
          text = "Contraseña incorrecta.";
        } else {
          text = "Usuario o contraseña incorrectos.";
        }
      } else if (status >= 500) {
        text = apiMsgRaw || "Error en el servidor. Intenta más tarde.";
      } else {
        text = apiMsgRaw || "No se pudo obtener la sesión.";
      }

      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { label: "Username", type: "text", name: "username", placeholder: "Nombre del usuario" },
    { label: "Contraseña", type: "password", name: "password", placeholder: "Ingresar contraseña" },
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
              buttonText={loading ? "Entrando..." : "Iniciar sesión"}
              onSubmit={handleSubmit}
              formData={form}
              onChange={handleChange}
              showForgotPassword={false}
              linkText="¿No tienes una cuenta?"
              linkTo="/register"
              linkLabel="Regístrate aquí"
              errors={errors}
            />

            {message?.text ? (
              <div className={"ns-alert " + (message.type === "error" ? "ns-alert--err" : "ns-alert--ok")}>
                {message.text}
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}

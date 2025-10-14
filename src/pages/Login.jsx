import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AuthForm from "../components/AuthForm";
import { login } from "../services/api";
import "./login.css";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null); // { type:'error'|'ok', text:string }
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function validate() {
    var e = {};
    if (!form.username || !String(form.username).trim()) {
      e.username = "No has ingresado tus datos.";
    }
    if (!form.password || !String(form.password).trim()) {
      e.password = "No has ingresado tus datos.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(evt) {
    var name = evt.target.name;
    var value = evt.target.value;
    setForm(function (f) {
      return Object.assign({}, f, { [name]: value });
    });
    if (errors[name] && value && String(value).trim()) {
      setErrors(function (prev) {
        var n = Object.assign({}, prev);
        delete n[name];
        return n;
      });
    }
    if (message) setMessage(null);
  }

  function normalizeMsg(s) {
    try {
      return String(s || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    } catch (_) {
      return String(s || "").toLowerCase();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const token = await login(form.username, form.password);
      console.log("Token guardado:", token);
      navigate("/home");
    } catch (err) {
      const status =
        (err && err.status) ||
        (err && err.response && err.response.status);

      // 👇 TOMAR MENSAJE DEL BACKEND: usa 'error' o 'message'
      const apiMsgRaw =
        (err && err.data && (err.data.error || err.data.message)) ||
        (err && err.response && err.response.data && (err.response.data.error || err.response.data.message)) ||
        err.message ||
        "";

      const m = normalizeMsg(apiMsgRaw);

      // Palabras clave
      const mentionsUser =
        m.includes("usuario no encontrado") ||
        m.includes("usuario incorrecto") ||
        m.includes("user not found") ||
        m.includes("username not found") ||
        m.includes("usuario");
      const mentionsPass =
        m.includes("contrasena") ||
        m.includes("contraseña") || // si llega con tilde
        m.includes("password") ||
        m.includes("credenciales");

      let text;

      // ── Mapeo claro con base en tu backend ─────────────────────────────
      if (status === 404) {
        text = "Usuario no encontrado.";
      } else if (status === 401 || status === 403) {
        // Si el backend dijo explícitamente "Usuario no encontrado/incorrecto"
        if (m.includes("usuario no encontrado") || m.includes("usuario incorrecto")) {
          text = "Usuario no encontrado.";
        }
        // Si dijo explícitamente "Contraseña Incorrecta"
        else if (m.includes("contrasena incorrecta") || m.includes("contraseña incorrecta") || m.includes("password")) {
          text = "Contraseña incorrecta.";
        }
        // Si mencionó usuario pero no password, tratamos como usuario
        else if (mentionsUser && !mentionsPass) {
          text = "Usuario no encontrado.";
        }
        // Si no hay pista clara, cae en genérico de credenciales
        else {
          text = "Usuario o contraseña incorrectos.";
        }
      } else if (status >= 500) {
        text = apiMsgRaw || "Error en el servidor. Intenta más tarde.";
      } else {
        text = apiMsgRaw || "No se pudo iniciar sesión. Intenta de nuevo.";
      }
      // ──────────────────────────────────────────────────────────────────

      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

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
              buttonText={loading ? "Entrando..." : "Iniciar sesión"}
              onSubmit={handleSubmit}
              formData={form}
              onChange={handleChange}
              showForgotPassword={true}
              linkText="¿No tienes una cuenta?"
              linkTo="/register"
              linkLabel="Regístrate aquí"
              errors={errors}
            />

            {message && message.text ? (
              <div
                className={
                  "ns-alert " +
                  (message.type === "error" ? "ns-alert--err" : "ns-alert--ok")
                }
              >
                {message.text}
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
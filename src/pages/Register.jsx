// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import AuthForm from "../components/AuthForm";
import { register } from "../services/api";
import "./login.css"; // reutilizamos los estilos del login

export default function Register() {
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null); // { type: 'ok' | 'error', text: string }
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));

    // validar en tiempo real
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));

    if (message) setMessage(null);
  }

  function validateField(name, value) {
    let error = null;
    if (name === 'name') {
      if (!value || !String(value).trim()) {
        error = "No has ingresado tus datos.";
      } else if (String(value).trim().split(' ').length < 2) {
        error = "Ingresa nombre y apellido.";
      }
    } else if (name === 'username') {
      if (!value || !String(value).trim()) {
        error = "No has ingresado tus datos.";
      }
    } else if (name === 'password') {
      if (!value || !String(value).trim()) {
        error = "No has ingresado tus datos.";
      } else {
        const pwd = String(value);
        if (pwd.length < 8 || pwd.length > 20) {
          error = "La contraseña debe tener entre 8 y 20 caracteres.";
        } else if (!/[A-Z]/.test(pwd)) {
          error = "La contraseña debe tener al menos una mayúscula.";
        } else if (!/[a-z]/.test(pwd)) {
          error = "La contraseña debe tener al menos una minúscula.";
        } else if (!/[0-9]/.test(pwd)) {
          error = "La contraseña debe tener al menos un número.";
        }
      }
    }
    return error;
  }

  function validate() {
    const e = {};
    Object.keys(form).forEach(name => {
      const error = validateField(name, form[name]);
      if (error) e[name] = error;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

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

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (!validate()) return;

    setLoading(true);
    try {
      await register(form.name, form.username, form.password);
      setMessage({ type: "ok", text: "Registro exitoso. Ahora inicia sesión." });
      setForm({ name: "", username: "", password: "" });
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      const status =
        (err && err.status) ||
        (err && err.response && err.response.status);

      const apiMsgRaw =
        (err && err.data && (err.data.error || err.data.message)) ||
        (err &&
          err.response &&
          err.response.data &&
          (err.response.data.error || err.response.data.message)) ||
        err.message ||
        "";

      const m = normalizeMsg(apiMsgRaw);

      let text;
      if (status === 409 || m.includes("ya existe") || m.includes("exist") || m.includes("duplic")) {
        text = "El usuario ya existe.";
      } else if (status === 400) {
        if (m.includes("password") || m.includes("contrasena") || m.includes("contraseña")) {
          text = "Contraseña inválida.";
        } else if (m.includes("username") || m.includes("usuario")) {
          text = "El usuario no es válido.";
        } else if (m.includes("name") || m.includes("nombre")) {
          text = "El nombre no es válido.";
        } else {
          text = apiMsgRaw || "Datos inválidos.";
        }
      } else if (status === 422) {
        text = "Datos inválidos. Revisa los campos.";
      } else if (status >= 500) {
        text = apiMsgRaw || "Error en el servidor. Intenta más tarde.";
      } else {
        text = apiMsgRaw || "Hubo un error al registrarse. Intenta de nuevo.";
      }

      setMessage({ type: "error", text });
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { label: "Nombre completo", type: "text", name: "name", placeholder: "Nombre completo" },
    { label: "Username", type: "text", name: "username", placeholder: "usuario" },
    { label: "Contraseña", type: "password", name: "password", placeholder: "Contraseña" },
  ];

  return (
    <div className="ns-root">
      <Navbar variant="register" />

      <main className="ns-main">
        <section className="ns-card">
          <h1 className="ns-title">Crea tu cuenta</h1>
          <p className="ns-subtitle">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="ns-link">Inicia sesión</Link>
          </p>

          <div className="ns-form-scope" aria-live="polite">
            <AuthForm
              fields={fields}
              buttonText={loading ? "Registrando..." : "Registrarse"}
              onSubmit={handleSubmit}
              formData={form}
              onChange={handleChange}
              showForgotPassword={false}
              errors={errors}           // ⬅️ muestra errores bajo cada campo
            />

            {message?.text ? (
              <div
                className={
                  "ns-alert " + (message.type === "ok" ? "ns-alert--ok" : "ns-alert--err")
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
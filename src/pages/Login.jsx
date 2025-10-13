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

      const apiMsg =
        (err && err.data && err.data.message) ||
        (err && err.response && err.response.data && err.response.data.message) ||
        err.message;

      const text =
        status === 401 || status === 403
          ? (apiMsg || "Usuario o contraseña incorrectos.")
          : (apiMsg || "No se pudo iniciar sesión. Intenta de nuevo.");

      setMessage({ type: "error", text: text });
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
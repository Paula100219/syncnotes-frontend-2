import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AuthForm from "../components/AuthForm";
import { register } from "../services/api";
import "./login.css"; // reutilizamos los estilos del login

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [message, setMessage] = useState({ text: "", type: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form.name, form.username, form.password);
      setMessage({
        text: "Registro exitoso. Ahora inicia sesión.",
        type: "success",
      });
      setForm({ name: "", username: "", password: "" });
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      console.error("Error al registrar:", err);
      setMessage({
        text: "Hubo un error al registrarse. Intenta de nuevo.",
        type: "error",
      });
    }
  };

  const fields = [
    {
      label: "Nombre completo",
      type: "text",
      name: "name",
      placeholder: "Nombre completo",
    },
    {
      label: "Usuario",
      type: "text",
      name: "username",
      placeholder: "Usuario",
    },
    {
      label: "Contraseña",
      type: "password",
      name: "password",
      placeholder: "Contraseña",
    },
  ];

  return (
    <div className="ns-root">
      <Navbar variant="register" />

      <main className="ns-main">
        <section className="ns-card">
          <h1 className="ns-title">Crea tu cuenta</h1>
          <p className="ns-subtitle">
            ¿Ya tienes una cuenta?{" "}
            <a href="/login" className="ns-link">Inicia sesión</a>
          </p>

          <div className="ns-form-scope">
            <AuthForm
              fields={fields}
              buttonText="Registrarse"
              onSubmit={handleSubmit}
              formData={form}
              onChange={handleChange}
              showForgotPassword={false}
            />

            {message.text && (
              <div
                className={`ns-alert ${
                  message.type === "success" ? "ns-alert--ok" : "ns-alert--err"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import AuthForm from "../components/AuthForm";
import { login } from "../services/api";
import "./login.css"; // <-- CSS en la misma carpeta

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await login(form.username, form.password);
      console.log("Token guardado:", token);
      navigate("/home");
    } catch (err) {
      console.error("Error al hacer login:", err);
    }
  };

  const fields = [
    { label: "Usuario", type: "text", name: "username", placeholder: "nombre.usuario" },
    { label: "Contraseña", type: "password", name: "password", placeholder: "" }
  ];

  return (
    <div className="ns-root">
      <Navbar variant="login" />

      <main className="ns-main">
        {/* La tarjeta y el contenedor visual */}
        <section className="ns-card">
          <h1 className="ns-title">Iniciar sesión en SyncNotes</h1>
          <p className="ns-subtitle">Bienvenido de nuevo. Accede a tus notas.</p>

          {/* No importa cómo esté construido tu AuthForm; 
              los estilos se aplicarán por descendencia */}
          <div className="ns-form-scope">
            <AuthForm
              fields={fields}
              buttonText="Iniciar sesión"
              onSubmit={handleSubmit}
              formData={form}
              onChange={handleChange}
              showForgotPassword={true}
              linkText="¿No tienes una cuenta?"
              linkTo="/register"
              linkLabel="Regístrate aquí"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
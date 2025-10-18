import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logoPng from "../assets/logo.png";

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #0d1117;
  padding: 0.6rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  z-index: 1000;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const LogoImg = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const BrandText = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  position: relative;
`;

const Button = styled.button`
  background-color: ${({ variant }) =>
    variant === "primary" ? "#2388ff" : "transparent"};
  color: ${({ variant }) => (variant === "primary" ? "#fff" : "#c9d1d9")};
  border: ${({ variant }) =>
    variant === "primary"
      ? "none"
      : "1px solid rgba(255, 255, 255, 0.2)"};
  padding: 0.45rem 1rem;
  border-radius: 0.6rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: background 0.2s ease, transform 0.1s ease;

  &:hover {
    background-color: ${({ variant }) =>
      variant === "primary" ? "#1f6feb" : "rgba(255,255,255,0.1)"};
    transform: translateY(-1px);
  }
`;

const IconButton = styled.button`
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.6);
  }
`;

// 🔹 Estilos del menú desplegable
const Dropdown = styled.div`
  position: absolute;
  top: 56px;
  right: 0;
  background: rgba(28, 36, 56, 0.96);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  min-width: 180px;
  z-index: 999;
  animation: fadeIn 0.15s ease;
`;

const DropItem = styled.button`
  background: none;
  border: none;
  color: #f1f1f1;
  text-align: left;
  padding: 10px 14px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 20px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,.45);
`;

export default function Navbar({
  variant = "login",
  onCreateRoom,
  onViewPublicRooms,
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // 🔹 Estados para actualizar usuario
  const API = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || "";
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [form, setForm] = useState({ name: "", username: "" });

  // 🔹 Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    navigate("/login");
  };

  const getCurrentUsername = () => {
    const ls = localStorage.getItem("username");
    if (ls) return ls;
    const t = localStorage.getItem("auth_token");
    if (t) {
      try {
        const payload = JSON.parse(atob(t.split(".")[1]));
        return payload?.username || payload?.sub || null;
      } catch {
        // ignore
      }
    }
    return null;
  };

  const loadUserData = async () => {
    const uname = getCurrentUsername();
    if (!uname) { alert("No hay usuario en sesión."); return false; }
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/users/searchUser/${encodeURIComponent(uname)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo cargar la información del usuario.");
      }
      const data = await res.json();
      const u = data?.usuario;
      if (!u?.id) throw new Error("No se pudo resolver el ID del usuario.");
      setUserId(u.id);
      setForm({ name: u.name || "", username: u.username || "" });
      return true;
    } catch (e) {
      alert(e.message || "No se pudo cargar la información del usuario.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const openUpdateUser = async () => {
    const ok = await loadUserData();
    if (ok) setShowUpdateModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!userId) return alert("Falta el id del usuario.");
    const body = {
      name: (form.name ?? "").trim(),
      username: (form.username ?? "").trim(),
    };
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/users/update-user/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al actualizar usuario");
      }
      alert("Usuario actualizado correctamente.");
      setShowUpdateModal(false);
      const current = getCurrentUsername();
      if (body.username && current && body.username !== current) {
        localStorage.setItem("username", body.username);
      }
    } catch (e) {
      alert(e.message || "Error al actualizar usuario");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "dashboard") {
    return (
      <>
        <Nav>
        <Left>
          <LogoImg src={logoPng} alt="logo" />
          <BrandText>SyncNotes</BrandText>
        </Left>

        <Right ref={menuRef}>
          <Button variant="primary" onClick={onCreateRoom}>
            + Crear nueva sala
          </Button>

          <Button onClick={() => navigate("/chat")}>💬 Ir al chat</Button>

          <Button onClick={onViewPublicRooms}>Ver salas públicas</Button>
          <IconButton title="Notificaciones">🔔</IconButton>

          {/* 🔹 Avatar con menú desplegable */}
          <div style={{ position: "relative" }}>
            <Avatar
              src="https://i.pravatar.cc/36"
              alt="perfil"
              onClick={() => setMenuOpen(!menuOpen)}
            />
            {menuOpen && (
              <Dropdown>
                <DropItem onClick={() => navigate("/perfil")}>👤 Perfil</DropItem>
                 <DropItem onClick={openUpdateUser}>
                    ⚙️ Actualizar usuario
                  </DropItem>
                 <DropItem onClick={(e) => e.preventDefault()}>🗑️ Eliminar usuario</DropItem>
                 <DropItem onClick={handleLogout}>🚪 Cerrar sesión</DropItem>
              </Dropdown>
            )}
          </div>
        </Right>
      </Nav>

      {showUpdateModal && (
        <Modal onClick={() => setShowUpdateModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Actualizar usuario</h3>
            <form onSubmit={handleUpdateUser} className="ns-form-scope">
              <div>
                <label>Nombre</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label>Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div className="actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowUpdateModal(false)} disabled={loading}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </ModalContent>
        </Modal>
      )}
      </>
    );
  }

  // versión pública
  return (
    <Nav>
      <Left>
        <LogoImg src={logoPng} alt="logo" />
        <BrandText style={{ color: "#1677ff" }}>SyncNotes</BrandText>
      </Left>
      <Right>
        <Link to="/register">
          <Button variant="secondary">Registrarse</Button>
        </Link>
        <Link to="/login">
          <Button variant="primary">Iniciar sesión</Button>
        </Link>
      </Right>
    </Nav>
  );
}

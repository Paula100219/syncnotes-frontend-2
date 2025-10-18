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
  background: linear-gradient(145deg, rgba(17, 24, 39, 0.98), rgba(11, 15, 25, 0.98));
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  min-width: 200px;
  z-index: 999;
  animation: fadeIn 0.2s ease;
  overflow: hidden;
`;

const DropItem = styled.button`
  background: none;
  border: none;
  color: #e6eaf2;
  text-align: left;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(22, 119, 255, 0.1);
    color: #1677ff;
    transform: translateX(2px);
  }

  &:first-child {
    border-top-left-radius: 14px;
    border-top-right-radius: 14px;
  }

  &:last-child {
    border-bottom-left-radius: 14px;
    border-bottom-right-radius: 14px;
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
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
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
    const deletedU = localStorage.getItem("username");
    if (deletedU) localStorage.setItem("__lastDeletedUsername", deletedU);
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

  const ensureUserId = async () => {
    if (userId) return userId;
    const uname = getCurrentUsername();
    if (!uname) throw new Error("No hay usuario en sesión.");
    const res = await fetch(`${API}/api/users/searchUser/${encodeURIComponent(uname)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error || "No se pudo obtener el usuario actual.");
    }
    const data = await res.json();
    const u = data?.usuario;
    if (!u?.id) throw new Error("No se pudo resolver el ID del usuario.");
    setUserId(u.id);
    return u.id;
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      const id = await ensureUserId();
      const uname = getCurrentUsername();
      const res = await fetch(`${API}/api/users/delete-user/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
      });
      const tryJson = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(tryJson?.error || "Error al eliminar usuario");
      }
      setDeleteMessage(tryJson?.mensaje || "Usuario eliminado exitosamente");
      setShowDeleteSuccessModal(true);
      localStorage.setItem("__lastDeletedUsername", uname);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("username");
    } catch (e) {
      alert(e.message || "No se pudo eliminar el usuario.");
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
                <DropItem onClick={() => navigate("/perfil")}>Perfil</DropItem>
                  <DropItem onClick={openUpdateUser}>
                     Actualizar usuario
                   </DropItem>
                   <DropItem onClick={handleDeleteUser}>Eliminar usuario</DropItem>
                  <DropItem onClick={handleLogout}>Cerrar sesión</DropItem>
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

      {showDeleteConfirmModal && (
        <Modal onClick={() => setShowDeleteConfirmModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Confirmar Eliminación</h3>
            <p style={{ margin: '1rem 0', textAlign: 'center' }}>
              ¿Seguro que deseas eliminar tu cuenta? Esta acción es irreversible.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button
                onClick={async () => { setShowDeleteConfirmModal(false); await handleDeleteUser(); }}
                disabled={loading}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                {loading ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                style={{
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </ModalContent>
        </Modal>
      )}

      {showDeleteSuccessModal && (
        <Modal onClick={() => { setShowDeleteSuccessModal(false); navigate("/login"); }}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Cuenta Eliminada</h3>
            <p style={{ margin: '1rem 0', textAlign: 'center' }}>{deleteMessage}</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => { setShowDeleteSuccessModal(false); navigate("/login"); }}
                style={{
                  backgroundColor: '#1677ff',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Aceptar
              </button>
            </div>
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

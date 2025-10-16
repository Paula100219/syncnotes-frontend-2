import styled from "styled-components";
import { Link } from "react-router-dom";
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
`;

export default function Navbar({
  variant = "login",
  onCreateRoom,
  onViewPublicRooms,
}) {
  if (variant === "dashboard") {
    return (
      <Nav>
        <Left>
          <LogoImg src={logoPng} alt="logo" />
          <BrandText>SyncNotes</BrandText>
        </Left>

        <Right>
          <Button variant="primary" onClick={onCreateRoom}>
            + Crear nueva sala
          </Button>
          <Button onClick={onViewPublicRooms}>Ver salas públicas</Button>
          <IconButton title="Notificaciones">🔔</IconButton>
          <Avatar src="https://i.pravatar.cc/36" alt="perfil" />
        </Right>
      </Nav>
    );
  }

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

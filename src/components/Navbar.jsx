import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import logoPng from '../assets/logo.png'; // tu logo PNG

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #1a1a2e;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.65rem;       /* leve ajuste del espacio */
  text-decoration: none;
`;

const LogoImg = styled.img`
  width: 28px;        /* ↑ de 24px a 28px */
  height: 28px;
  object-fit: contain;
  image-rendering: auto;   /* nítido en pantallas retina */
  border-radius: 6px;      /* opcional */
`;

const BrandText = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: #1677ff;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: #1677ff;
  }
`;

const NavButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Button = styled(Link)`
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;

  ${({ variant }) =>
    variant === 'primary'
      ? `
    background-color: #1677ff;
    color: white;
    border: 2px solid #1677ff;

    &:hover {
      background-color: #0056cc;
      border-color: #0056cc;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(22, 119, 255, 0.3);
    }
  `
      : `
    background-color: transparent;
    color: white;
    border: 2px solid white;

    &:hover {
      background-color: white;
      color: #1a1a2e;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
    }
  `}
`;

const Navbar = ({ variant = 'login' }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  const links = variant === 'login'
    ? ['Inicio', 'Funciones', 'Precios']
    : ['Inicio', 'Funciones', 'Precios', 'Soporte'];

  const routeMap = {
    'Inicio': '/',
    'Funciones': '/features',
    'Precios': '/pricing',
    'Soporte': '/support',
  };

  return (
    <Nav>
      <Brand to="/">
        <LogoImg src={logoPng} alt="NoteSync logo" />
        <BrandText>SyncNotes</BrandText>
      </Brand>

      {!isAuthPage && (
        <NavLinks>
          {links.map((link) => (
            <NavLink key={link} to={routeMap[link] ?? '/'}>
              {link}
            </NavLink>
          ))}
        </NavLinks>
      )}

      <NavButtons>
        {variant === 'login' ? (
          <>
            <Button variant="secondary" to="/register">
              Registrarse
            </Button>
            <Button variant="primary" to="/login">
              Iniciar sesión
            </Button>
          </>
        ) : (
          <Button variant="secondary" to="/login">
            Iniciar sesión
          </Button>
        )}
      </NavButtons>
    </Nav>
  );
};

export default Navbar;
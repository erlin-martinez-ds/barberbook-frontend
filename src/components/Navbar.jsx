
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar__marca">
        BarberBook
      </Link>

      <nav className="navbar__links">
        <NavLink to="/">Inicio</NavLink>
        <NavLink to="/barberos">Barberos</NavLink>
        <NavLink to="/servicios">Servicios</NavLink>

        {user ? (
          <>
            <NavLink to="/dashboard">Mi cuenta</NavLink>
            <NavLink to="/reservas">Mis reservas</NavLink>
            <span className="navbar__usuario">{user.name}</span>
            <button type="button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Iniciar sesión</NavLink>
            <NavLink to="/register">Crear cuenta</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

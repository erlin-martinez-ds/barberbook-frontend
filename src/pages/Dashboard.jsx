import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <section>
      <h1>Hola, {user.name}</h1>
      <p>Correo: {user.email}</p>
      <p>Rol: {user.role}</p>
      <p><Link to="/reservas">Ver mis reservas</Link></p>
    </section>
  );
}

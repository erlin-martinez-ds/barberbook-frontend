import { Link } from "react-router-dom";

export default function NoAutorizado() {
  return (
    <section>
      <h1>Acceso denegado</h1>
      <p>Tu rol no tiene permiso para ver esta página.</p>
      <Link to="/">Volver al inicio</Link>
    </section>
  );
}

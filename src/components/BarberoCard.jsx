import { Link } from "react-router-dom";

export default function BarberoCard({ barbero }) {
  return (
    <article className="tarjeta">
      <h3>{barbero.user?.name ?? "Barbero"}</h3>
      {barbero.specialties?.length > 0 && <p>{barbero.specialties.join(", ")}</p>}
      {barbero.yearsExperience != null && <p>{barbero.yearsExperience} años de experiencia</p>}
      <Link to={`/barberos/${barbero._id ?? barbero.id}`}>Ver detalle</Link>
    </article>
  );
}

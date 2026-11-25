import { Link } from "react-router-dom";
import { formatDuration, formatPrice } from "../utils/formatters";

export default function ServicioCard({ servicio }) {
  return (
    <article className="tarjeta">
      <h3>{servicio.name}</h3>
      <p>{formatPrice(servicio.price)}</p>
      <p>{formatDuration(servicio.duration)}</p>
      <Link to={`/servicios/${servicio._id ?? servicio.id}`}>Ver detalle</Link>
    </article>
  );
}

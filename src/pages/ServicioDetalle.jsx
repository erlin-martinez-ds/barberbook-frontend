import { Link, useParams } from "react-router-dom";
import { Cargando, ErrorMensaje } from "../components/Estado";
import { useFetch } from "../hooks/useFetch";
import { formatDuration, formatPrice } from "../utils/formatters";

export default function ServicioDetalle() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/services/${id}`);

  if (loading) return <Cargando />;
  if (error) return <ErrorMensaje mensaje={error} />;

  const servicio = data?.service ?? data;

  return (
    <section>
      <Link to="/servicios">← Volver a servicios</Link>
      <h1>{servicio.name}</h1>
      {servicio.description && <p>{servicio.description}</p>}
      <p>Precio: {formatPrice(servicio.price)}</p>
      <p>Duración: {formatDuration(servicio.duration)}</p>
    </section>
  );
}

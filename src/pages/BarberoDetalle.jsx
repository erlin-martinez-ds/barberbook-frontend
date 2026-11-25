import { Link, useParams } from "react-router-dom";
import { Cargando, ErrorMensaje } from "../components/Estado";
import { useFetch } from "../hooks/useFetch";

export default function BarberoDetalle() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/barbers/${id}`);

  if (loading) return <Cargando />;
  if (error) return <ErrorMensaje mensaje={error} />;

  const barbero = data?.barber ?? data;

  return (
    <section>
      <Link to="/barberos">← Volver a barberos</Link>
      <h1>{barbero.user?.name ?? "Barbero"}</h1>
      {barbero.specialties?.length > 0 && <p>Especialidades: {barbero.specialties.join(", ")}</p>}
      {barbero.yearsExperience != null && <p>Experiencia: {barbero.yearsExperience} años</p>}
      {barbero.bio && <p>{barbero.bio}</p>}
    </section>
  );
}

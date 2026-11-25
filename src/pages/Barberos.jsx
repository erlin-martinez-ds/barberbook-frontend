import BarberoCard from "../components/BarberoCard";
import { Cargando, ErrorMensaje, Vacio } from "../components/Estado";
import { useFetch } from "../hooks/useFetch";

export default function Barberos() {
  const { data, loading, error } = useFetch("/barbers");

  if (loading) return <Cargando />;
  if (error) return <ErrorMensaje mensaje={error} />;

  const barberos = data?.barbers ?? [];

  return (
    <section>
      <h1>Barberos</h1>
      {barberos.length === 0 ? (
        <Vacio mensaje="Todavía no hay barberos activos." />
      ) : (
        <div className="grilla">
          {barberos.map((b) => (
            <BarberoCard key={b._id ?? b.id} barbero={b} />
          ))}
        </div>
      )}
    </section>
  );
}

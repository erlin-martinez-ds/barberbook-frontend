import ServicioCard from "../components/ServicioCard";
import { Cargando, ErrorMensaje, Vacio } from "../components/Estado";
import { useFetch } from "../hooks/useFetch";

export default function Servicios() {
  const { data, loading, error } = useFetch("/services");

  if (loading) return <Cargando />;
  if (error) return <ErrorMensaje mensaje={error} />;

  const servicios = data?.services ?? [];

  return (
    <section>
      <h1>Servicios</h1>
      {servicios.length === 0 ? (
        <Vacio mensaje="Todavía no hay servicios disponibles." />
      ) : (
        <div className="grilla">
          {servicios.map((s) => (
            <ServicioCard key={s._id ?? s.id} servicio={s} />
          ))}
        </div>
      )}
    </section>
  );
}

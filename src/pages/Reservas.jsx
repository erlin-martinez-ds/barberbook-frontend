import { Link } from "react-router-dom";
import { Cargando, ErrorMensaje, Vacio } from "../components/Estado";
import { useFetch } from "../hooks/useFetch";
import { formatDateTime } from "../utils/formatters";

function getReservaId(reserva) {
  return reserva._id ?? reserva.id;
}

function getNombreReserva(reserva) {
  return reserva.service?.name ?? reserva.serviceName ?? reserva.service ?? "Reserva";
}

export default function Reservas() {
  const { data, loading, error } = useFetch("/bookings");

  if (loading) return <Cargando />;
  if (error) return <ErrorMensaje mensaje={error} />;

  const reservas = Array.isArray(data)
    ? data
    : data?.bookings ?? data?.reservations ?? data?.data ?? [];

  return (
    <section>
      <div className="reserva-cabecera">
        <h1>Mis reservas</h1>
        <Link to="/reservas/nueva">Nueva reserva</Link>
      </div>

      {reservas.length === 0 ? (
        <Vacio mensaje="Todavía no tienes reservas." />
      ) : (
        <div className="lista-reservas">
          {reservas.map((reserva) => (
            <article className="tarjeta" key={getReservaId(reserva)}>
              <div className="reserva-cabecera">
                <h3>{getNombreReserva(reserva)}</h3>
                {reserva.status && (
                  <span className={`estado-reserva ${String(reserva.status).toLowerCase()}`}>
                    {reserva.status}
                  </span>
                )}
              </div>
              <p>
                {formatDateTime(reserva.date ?? reserva.appointmentDate ?? reserva.startDate)}
              </p>
              <Link to={`/reservas/${getReservaId(reserva)}`}>Ver detalle</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { Cargando, ErrorMensaje, Vacio } from "../components/Estado";
import { useAuth } from "../context/useAuth";
import { useFetch } from "../hooks/useFetch";
import { formatDateTime } from "../utils/formatters";

function getReservaId(reserva) {
  return reserva._id ?? reserva.id;
}

function getNombreReserva(reserva) {
  return reserva.service?.name ?? reserva.serviceName ?? reserva.service ?? "Reserva";
}

function getNombreCliente(reserva) {
  const cliente = reserva.customer ?? reserva.client ?? reserva.user;
  return typeof cliente === "object"
    ? cliente.name ?? cliente.fullName ?? "Cliente"
    : reserva.customerName ?? reserva.clientName ?? "Cliente";
}

function isPendiente(status) {
  return ["PENDING", "PENDIENTE", "REQUESTED", "SOLICITADA"].includes(
    String(status ?? "").toUpperCase(),
  );
}

function getEstadoVisible(status) {
  const estado = String(status ?? "").toUpperCase();
  if (["PENDING", "PENDIENTE", "REQUESTED", "SOLICITADA"].includes(estado)) {
    return "Pendiente";
  }
  if (["CONFIRMED", "CONFIRMADA", "CONFIRMADO"].includes(estado)) {
    return "Confirmada";
  }
  if (["REJECTED", "RECHAZADA", "RECHAZADO", "DECLINED"].includes(estado)) {
    return "Rechazada";
  }
  return status || "Sin estado";
}

function PanelReservasBarbero({ reservas }) {
  const [estadosActualizados, setEstadosActualizados] = useState({});
  const [accionando, setAccionando] = useState(null);
  const [errores, setErrores] = useState({});

  const handleDecision = async (reserva, decision) => {
    const id = getReservaId(reserva);
    if (!id) return;
    if (
      decision === "reject" &&
      !window.confirm("¿Deseas rechazar esta reserva?")
    ) {
      return;
    }

    setAccionando(id);
    setErrores((actuales) => ({ ...actuales, [id]: "" }));
    try {
      await axiosClient.patch(`/bookings/${id}/${decision}`);
      setEstadosActualizados((actuales) => ({
        ...actuales,
        [id]: decision === "confirm" ? "CONFIRMED" : "REJECTED",
      }));
    } catch (error) {
      setErrores((actuales) => ({
        ...actuales,
        [id]: error.userMessage ?? "No se pudo actualizar la reserva",
      }));
    } finally {
      setAccionando(null);
    }
  };

  return (
    <section>
      <div className="reserva-cabecera">
        <div>
          <h1>Reservas recibidas</h1>
          <p>Consulta las solicitudes y gestiona su estado.</p>
        </div>
      </div>

      {reservas.length === 0 ? (
        <Vacio mensaje="Todavía no tienes reservas." />
      ) : (
        <div className="lista-reservas">
          {reservas.map((reserva) => {
            const id = getReservaId(reserva);
            const estado = estadosActualizados[id] ?? reserva.status;
            const pendiente = isPendiente(estado);

            return (
              <article className="tarjeta" key={id}>
                <div className="reserva-cabecera">
                  <h3>{getNombreReserva(reserva)}</h3>
                  <span
                    className={`estado-reserva ${String(estado ?? "").toLowerCase()}`}
                  >
                    {getEstadoVisible(estado)}
                  </span>
                </div>
                <p><strong>Cliente:</strong> {getNombreCliente(reserva)}</p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {formatDateTime(
                    reserva.date ?? reserva.appointmentDate ?? reserva.startDate,
                  )}
                </p>
                <div className="acciones">
                  <Link to={`/reservas/${id}`}>Ver detalle</Link>
                  {pendiente && (
                    <>
                      <button
                        type="button"
                        disabled={!id || accionando !== null}
                        onClick={() => handleDecision(reserva, "confirm")}
                      >
                        {accionando === id && "Procesando..."}
                        {accionando !== id && "Confirmar"}
                      </button>
                      <button
                        className="boton-peligro"
                        type="button"
                        disabled={!id || accionando !== null}
                        onClick={() => handleDecision(reserva, "reject")}
                      >
                        {accionando === id ? "Procesando..." : "Rechazar"}
                      </button>
                    </>
                  )}
                </div>
                {errores[id] && <p className="error">{errores[id]}</p>}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function Reservas() {
  const { user } = useAuth();
  const { data, loading, error } = useFetch("/bookings");

  if (loading) return <Cargando />;
  if (error) return <ErrorMensaje mensaje={error} />;

  const reservas = Array.isArray(data)
    ? data
    : data?.bookings ?? data?.reservations ?? data?.data ?? [];

  if (user?.role === "BARBER") {
    return <PanelReservasBarbero reservas={reservas} />;
  }

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

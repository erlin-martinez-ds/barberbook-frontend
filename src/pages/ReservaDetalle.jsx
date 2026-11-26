import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { Cargando, ErrorMensaje } from "../components/Estado";
import { useAuth } from "../context/useAuth";
import { useFetch } from "../hooks/useFetch";
import { formatDateTime, formatPrice } from "../utils/formatters";

export default function ReservaDetalle() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useFetch(`/bookings/${id}`);
  const [cancelando, setCancelando] = useState(false);
  const [errorCancelacion, setErrorCancelacion] = useState("");

  if (loading) return <Cargando />;
  if (error) return <ErrorMensaje mensaje={error} />;

  const reserva = data?.booking ?? data?.reservation ?? data?.data ?? data;
  if (!reserva) return <ErrorMensaje mensaje="No se encontró la reserva." />;
  const servicio = reserva.service;
  const barbero = reserva.barber;
  const cancelada = ["CANCELADA", "CANCELLED", "CANCELED"].includes(
    String(reserva.status ?? "").toUpperCase(),
  );

  const handleCancel = async () => {
    if (!window.confirm("¿Deseas cancelar esta reserva?")) return;

    setErrorCancelacion("");
    setCancelando(true);
    try {
      await axiosClient.patch(`/bookings/${id}/cancel`);
      navigate("/reservas", { replace: true });
    } catch (err) {
      setErrorCancelacion(err.userMessage ?? "No se pudo cancelar la reserva");
      setCancelando(false);
    }
  };

  return (
    <section>
      <Link to="/reservas">
        ← {user?.role === "BARBER" ? "Volver a reservas recibidas" : "Volver a mis reservas"}
      </Link>
      <h1>Detalle de reserva</h1>
      <div className="detalle-reserva">
        {reserva.status && <p>Estado: {reserva.status}</p>}
        <p>Fecha: {formatDateTime(reserva.date ?? reserva.appointmentDate ?? reserva.startDate)}</p>
        <p>Servicio: {typeof servicio === "object" ? servicio.name : reserva.serviceName ?? servicio ?? "No disponible"}</p>
        {typeof servicio === "object" && servicio.price != null && (
          <p>Precio: {formatPrice(servicio.price)}</p>
        )}
        <p>
          Barbero: {typeof barbero === "object"
            ? barbero.user?.name ?? barbero.name ?? "No disponible"
            : reserva.barberName ?? barbero ?? "No disponible"}
        </p>
      </div>

      {errorCancelacion && <p className="error">{errorCancelacion}</p>}
      {user?.role !== "BARBER" && !cancelada && (
        <button className="boton-peligro" type="button" onClick={handleCancel} disabled={cancelando}>
          {cancelando ? "Cancelando..." : "Cancelar reserva"}
        </button>
      )}
    </section>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { Cargando, ErrorMensaje } from "../components/Estado";
import { useFetch } from "../hooks/useFetch";

export default function NuevaReserva() {
  const navigate = useNavigate();
  const barberosRequest = useFetch("/barbers");
  const serviciosRequest = useFetch("/services");
  const [form, setForm] = useState({ barberId: "", serviceId: "", date: "" });
  const [minimumDate] = useState(
    () => new Date(Date.now() - 60000).toISOString().slice(0, 16),
  );
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (barberosRequest.loading || serviciosRequest.loading) return <Cargando />;
  if (barberosRequest.error) return <ErrorMensaje mensaje={barberosRequest.error} />;
  if (serviciosRequest.error) return <ErrorMensaje mensaje={serviciosRequest.error} />;

  const barberos = barberosRequest.data?.barbers ?? barberosRequest.data?.data ?? [];
  const servicios = serviciosRequest.data?.services ?? serviciosRequest.data?.data ?? [];

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setEnviando(true);

    try {
      const response = await axiosClient.post("/bookings", {
        barberId: form.barberId,
        serviceId: form.serviceId,
        date: new Date(form.date).toISOString(),
      });
      const reserva = response.data?.booking ?? response.data?.reservation ?? response.data?.data ?? response.data;
      navigate(`/reservas/${reserva._id ?? reserva.id}`, { replace: true });
    } catch (err) {
      setError(err.userMessage ?? "No se pudo crear la reserva");
      setEnviando(false);
    }
  };

  return (
    <section className="formulario">
      <h1>Nueva reserva</h1>

      {barberos.length === 0 || servicios.length === 0 ? (
        <p className="estado">
          Para reservar necesitas que existan barberos y servicios disponibles.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Barbero
            <select name="barberId" value={form.barberId} onChange={handleChange} required>
              <option value="">Selecciona un barbero</option>
              {barberos.map((barbero) => (
                <option key={barbero._id ?? barbero.id} value={barbero._id ?? barbero.id}>
                  {barbero.user?.name ?? barbero.name ?? "Barbero"}
                </option>
              ))}
            </select>
          </label>

          <label>
            Servicio
            <select name="serviceId" value={form.serviceId} onChange={handleChange} required>
              <option value="">Selecciona un servicio</option>
              {servicios.map((servicio) => (
                <option key={servicio._id ?? servicio.id} value={servicio._id ?? servicio.id}>
                  {servicio.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Fecha y hora
            <input
              name="date"
              type="datetime-local"
              value={form.date}
              onChange={handleChange}
              min={minimumDate}
              required
            />
          </label>

          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={enviando}>
            {enviando ? "Creando..." : "Crear reserva"}
          </button>
        </form>
      )}

      <p><Link to="/reservas">Volver a mis reservas</Link></p>
    </section>
  );
}

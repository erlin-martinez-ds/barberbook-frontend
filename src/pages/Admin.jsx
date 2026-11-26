import { useState } from "react";
import axiosClient from "../api/axiosClient";
import { Cargando, ErrorMensaje, Vacio } from "../components/Estado";
import { useFetch } from "../hooks/useFetch";
import { formatDuration, formatPrice } from "../utils/formatters";

const DIAS = [
  ["MONDAY", "Lunes"],
  ["TUESDAY", "Martes"],
  ["WEDNESDAY", "Miércoles"],
  ["THURSDAY", "Jueves"],
  ["FRIDAY", "Viernes"],
  ["SATURDAY", "Sábado"],
  ["SUNDAY", "Domingo"],
];

const FORMULARIO_BARBERO_VACIO = {
  name: "",
  email: "",
  password: "",
  specialties: "",
  yearsExperience: "",
  bio: "",
};

const FORMULARIO_SERVICIO_VACIO = {
  name: "",
  description: "",
  price: "",
  duration: "",
};

function getLista(data, resource) {
  if (Array.isArray(data)) return data;
  const nested = data?.data;
  return data?.[resource] ?? nested?.[resource] ?? (Array.isArray(nested) ? nested : []);
}

function getId(item) {
  return item?._id ?? item?.id;
}

function getHorario(barbero) {
  const actual = Array.isArray(barbero?.availability) ? barbero.availability : [];
  return DIAS.map(([dayOfWeek]) => {
    const horario = actual.find(
      (item) => String(item.dayOfWeek ?? item.day ?? "").toUpperCase() === dayOfWeek,
    );
    return {
      dayOfWeek,
      isAvailable: Boolean(horario?.isAvailable ?? horario?.available),
      startTime: horario?.startTime ?? horario?.start ?? "09:00",
      endTime: horario?.endTime ?? horario?.end ?? "17:00",
    };
  });
}

function toBarberoForm(barbero) {
  return {
    name: barbero.user?.name ?? barbero.name ?? "",
    email: barbero.user?.email ?? barbero.email ?? "",
    password: "",
    specialties: Array.isArray(barbero.specialties)
      ? barbero.specialties.join(", ")
      : "",
    yearsExperience: barbero.yearsExperience ?? "",
    bio: barbero.bio ?? "",
  };
}

function toServicioForm(servicio) {
  return {
    name: servicio.name ?? "",
    description: servicio.description ?? "",
    price: servicio.price ?? "",
    duration: servicio.duration ?? "",
  };
}

export default function Admin() {
  const barberosRequest = useFetch("/barbers");
  const serviciosRequest = useFetch("/services");
  const [barberosLocales, setBarberos] = useState(null);
  const [serviciosLocales, setServicios] = useState(null);
  const barberos = barberosLocales ?? getLista(barberosRequest.data, "barbers");
  const servicios = serviciosLocales ?? getLista(serviciosRequest.data, "services");
  const [seccion, setSeccion] = useState("barberos");
  const [barberoEditando, setBarberoEditando] = useState(null);
  const [servicioEditando, setServicioEditando] = useState(null);
  const [formBarbero, setFormBarbero] = useState(FORMULARIO_BARBERO_VACIO);
  const [formServicio, setFormServicio] = useState(FORMULARIO_SERVICIO_VACIO);
  const [barberoHorario, setBarberoHorario] = useState(null);
  const [horario, setHorario] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [errorAccion, setErrorAccion] = useState("");
  const [aviso, setAviso] = useState("");

  const actualizarBarberos = async () => {
    const response = await axiosClient.get("/barbers");
    setBarberos(getLista(response.data, "barbers"));
  };

  const actualizarServicios = async () => {
    const response = await axiosClient.get("/services");
    setServicios(getLista(response.data, "services"));
  };

  const limpiarMensajes = () => {
    setErrorAccion("");
    setAviso("");
  };

  const handleBarberoChange = (event) => {
    setFormBarbero((actual) => ({ ...actual, [event.target.name]: event.target.value }));
  };

  const handleServicioChange = (event) => {
    setFormServicio((actual) => ({ ...actual, [event.target.name]: event.target.value }));
  };

  const editarBarbero = (barbero) => {
    limpiarMensajes();
    setBarberoEditando(getId(barbero));
    setFormBarbero(toBarberoForm(barbero));
    setBarberoHorario(null);
  };

  const cancelarEdicionBarbero = () => {
    setBarberoEditando(null);
    setFormBarbero(FORMULARIO_BARBERO_VACIO);
  };

  const guardarBarbero = async (event) => {
    event.preventDefault();
    limpiarMensajes();
    setGuardando(true);
    const payload = {
      name: formBarbero.name.trim(),
      email: formBarbero.email.trim(),
      specialties: formBarbero.specialties
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      yearsExperience: Number(formBarbero.yearsExperience),
      bio: formBarbero.bio.trim(),
    };
    if (formBarbero.password) payload.password = formBarbero.password;

    try {
      if (barberoEditando) {
        await axiosClient.put(`/barbers/${barberoEditando}`, payload);
      } else {
        await axiosClient.post("/barbers", payload);
      }
      cancelarEdicionBarbero();
      try {
        await actualizarBarberos();
        setAviso("Barbero guardado correctamente.");
      } catch {
        setAviso("El barbero se guardó, pero no se pudo actualizar la lista. Recarga la página.");
      }
    } catch (error) {
      setErrorAccion(error.userMessage ?? "No se pudo guardar el barbero.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarBarbero = async (barbero) => {
    const id = getId(barbero);
    if (!id || !window.confirm("¿Deseas eliminar este barbero?")) return;
    limpiarMensajes();
    setGuardando(true);
    try {
      await axiosClient.delete(`/barbers/${id}`);
      setBarberos((actuales) => actuales.filter((item) => getId(item) !== id));
      setAviso("Barbero eliminado correctamente.");
      if (barberoHorario === id) setBarberoHorario(null);
    } catch (error) {
      setErrorAccion(error.userMessage ?? "No se pudo eliminar el barbero.");
    } finally {
      setGuardando(false);
    }
  };

  const abrirHorario = (barbero) => {
    limpiarMensajes();
    setBarberoHorario(getId(barbero));
    setHorario(getHorario(barbero));
    setBarberoEditando(null);
    setFormBarbero(FORMULARIO_BARBERO_VACIO);
  };

  const cambiarHorario = (dayOfWeek, campo, valor) => {
    setHorario((actual) =>
      actual.map((item) =>
        item.dayOfWeek === dayOfWeek ? { ...item, [campo]: valor } : item,
      ),
    );
  };

  const guardarHorario = async (event) => {
    event.preventDefault();
    limpiarMensajes();
    if (
      horario.some(
        (item) =>
          item.isAvailable &&
          (!item.startTime || !item.endTime || item.startTime >= item.endTime),
      )
    ) {
      setErrorAccion("La hora de cierre debe ser posterior a la hora de apertura.");
      return;
    }
    setGuardando(true);
    try {
      await axiosClient.patch(`/barbers/${barberoHorario}/availability`, {
        availability: horario,
      });
      setBarberos((actuales) =>
        actuales.map((barbero) =>
          getId(barbero) === barberoHorario
            ? { ...barbero, availability: horario }
            : barbero,
        ),
      );
      setAviso("Disponibilidad guardada correctamente.");
      setBarberoHorario(null);
    } catch (error) {
      setErrorAccion(error.userMessage ?? "No se pudo guardar la disponibilidad.");
    } finally {
      setGuardando(false);
    }
  };

  const editarServicio = (servicio) => {
    limpiarMensajes();
    setServicioEditando(getId(servicio));
    setFormServicio(toServicioForm(servicio));
  };

  const cancelarEdicionServicio = () => {
    setServicioEditando(null);
    setFormServicio(FORMULARIO_SERVICIO_VACIO);
  };

  const guardarServicio = async (event) => {
    event.preventDefault();
    limpiarMensajes();
    setGuardando(true);
    const payload = {
      name: formServicio.name.trim(),
      description: formServicio.description.trim(),
      price: Number(formServicio.price),
      duration: Number(formServicio.duration),
    };

    try {
      if (servicioEditando) {
        await axiosClient.put(`/services/${servicioEditando}`, payload);
      } else {
        await axiosClient.post("/services", payload);
      }
      cancelarEdicionServicio();
      try {
        await actualizarServicios();
        setAviso("Servicio guardado correctamente.");
      } catch {
        setAviso("El servicio se guardó, pero no se pudo actualizar la lista. Recarga la página.");
      }
    } catch (error) {
      setErrorAccion(error.userMessage ?? "No se pudo guardar el servicio.");
    } finally {
      setGuardando(false);
    }
  };

  const eliminarServicio = async (servicio) => {
    const id = getId(servicio);
    if (!id || !window.confirm("¿Deseas eliminar este servicio?")) return;
    limpiarMensajes();
    setGuardando(true);
    try {
      await axiosClient.delete(`/services/${id}`);
      setServicios((actuales) => actuales.filter((item) => getId(item) !== id));
      setAviso("Servicio eliminado correctamente.");
    } catch (error) {
      setErrorAccion(error.userMessage ?? "No se pudo eliminar el servicio.");
    } finally {
      setGuardando(false);
    }
  };

  if (barberosRequest.loading || serviciosRequest.loading) return <Cargando />;
  if (barberosRequest.error) return <ErrorMensaje mensaje={barberosRequest.error} />;
  if (serviciosRequest.error) return <ErrorMensaje mensaje={serviciosRequest.error} />;

  return (
    <section className="admin">
      <header className="admin__cabecera">
        <div>
          <p className="admin__eyebrow">Administración</p>
          <h1>Gestionar barbería</h1>
          <p>Administra el equipo, los servicios y los horarios de atención.</p>
        </div>
        <div className="admin__resumen">
          <span><strong>{barberos.length}</strong> barberos</span>
          <span><strong>{servicios.length}</strong> servicios</span>
        </div>
      </header>

      <div className="admin__tabs" role="tablist" aria-label="Secciones administrativas">
        <button
          type="button"
          role="tab"
          aria-selected={seccion === "barberos"}
          className={seccion === "barberos" ? "admin__tab admin__tab--activa" : "admin__tab"}
          onClick={() => {
            setSeccion("barberos");
            limpiarMensajes();
          }}
        >
          Barberos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={seccion === "servicios"}
          className={seccion === "servicios" ? "admin__tab admin__tab--activa" : "admin__tab"}
          onClick={() => {
            setSeccion("servicios");
            limpiarMensajes();
          }}
        >
          Servicios
        </button>
      </div>

      {errorAccion && <p className="error" role="alert">{errorAccion}</p>}
      {aviso && <p className="admin__aviso" role="status">{aviso}</p>}

      {seccion === "barberos" ? (
        <div className="admin__contenido">
          <div className="admin__columna">
            <div className="admin__titulo-seccion">
              <h2>Barberos</h2>
              <span>{barberos.length} registrados</span>
            </div>
            {barberos.length === 0 ? (
              <Vacio mensaje="Todavía no hay barberos registrados." />
            ) : (
              <div className="admin__lista">
                {barberos.map((barbero) => {
                  const id = getId(barbero);
                  return (
                    <article className="tarjeta admin__tarjeta" key={id}>
                      <div>
                        <h3>{barbero.user?.name ?? barbero.name ?? "Barbero"}</h3>
                        <p>{barbero.user?.email ?? barbero.email ?? "Correo no disponible"}</p>
                        {barbero.specialties?.length > 0 && (
                          <p>Especialidades: {barbero.specialties.join(", ")}</p>
                        )}
                      </div>
                      <div className="admin__acciones">
                        <button
                          className="boton-secundario"
                          type="button"
                          disabled={guardando}
                          onClick={() => editarBarbero(barbero)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={guardando}
                          onClick={() => abrirHorario(barbero)}
                        >
                          Disponibilidad
                        </button>
                        <button
                          className="boton-peligro"
                          type="button"
                          disabled={guardando}
                          onClick={() => eliminarBarbero(barbero)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="admin__formularios">
            {barberoHorario ? (
              <form className="admin__formulario" onSubmit={guardarHorario}>
                <h2>Disponibilidad semanal</h2>
                <p>Define los días y el horario de atención del barbero.</p>
                <div className="admin__horarios">
                  {horario.map((item) => (
                    <div className="admin__horario" key={item.dayOfWeek}>
                      <label className="admin__dia">
                        <input
                          type="checkbox"
                          checked={item.isAvailable}
                          onChange={(event) =>
                            cambiarHorario(item.dayOfWeek, "isAvailable", event.target.checked)
                          }
                        />
                        {DIAS.find(([dia]) => dia === item.dayOfWeek)?.[1]}
                      </label>
                      <input
                        aria-label={`Inicio ${item.dayOfWeek}`}
                        type="time"
                        value={item.startTime}
                        disabled={!item.isAvailable}
                        onChange={(event) =>
                          cambiarHorario(item.dayOfWeek, "startTime", event.target.value)
                        }
                        required={item.isAvailable}
                      />
                      <input
                        aria-label={`Fin ${item.dayOfWeek}`}
                        type="time"
                        value={item.endTime}
                        disabled={!item.isAvailable}
                        onChange={(event) =>
                          cambiarHorario(item.dayOfWeek, "endTime", event.target.value)
                        }
                        required={item.isAvailable}
                      />
                    </div>
                  ))}
                </div>
                <div className="admin__acciones">
                  <button type="submit" disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar horario"}
                  </button>
                  <button
                    className="boton-secundario"
                    type="button"
                    disabled={guardando}
                    onClick={() => setBarberoHorario(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <form className="admin__formulario" onSubmit={guardarBarbero}>
                <h2>{barberoEditando ? "Editar barbero" : "Añadir barbero"}</h2>
                <label>
                  Nombre
                  <input
                    name="name"
                    value={formBarbero.name}
                    onChange={handleBarberoChange}
                    required
                  />
                </label>
                <label>
                  Correo electrónico
                  <input
                    name="email"
                    type="email"
                    value={formBarbero.email}
                    onChange={handleBarberoChange}
                    required
                  />
                </label>
                <label>
                  {barberoEditando ? "Nueva contraseña (opcional)" : "Contraseña"}
                  <input
                    name="password"
                    type="password"
                    value={formBarbero.password}
                    onChange={handleBarberoChange}
                    required={!barberoEditando}
                    minLength={8}
                    autoComplete="new-password"
                  />
                </label>
                <label>
                  Especialidades (separadas por comas)
                  <input
                    name="specialties"
                    value={formBarbero.specialties}
                    onChange={handleBarberoChange}
                    placeholder="Corte clásico, Barba"
                  />
                </label>
                <label>
                  Años de experiencia
                  <input
                    name="yearsExperience"
                    type="number"
                    min="0"
                    value={formBarbero.yearsExperience}
                    onChange={handleBarberoChange}
                    required
                  />
                </label>
                <label>
                  Descripción
                  <textarea
                    name="bio"
                    rows="3"
                    value={formBarbero.bio}
                    onChange={handleBarberoChange}
                  />
                </label>
                <div className="admin__acciones">
                  <button type="submit" disabled={guardando}>
                    {guardando ? "Guardando..." : "Guardar barbero"}
                  </button>
                  {barberoEditando && (
                    <button
                      className="boton-secundario"
                      type="button"
                      disabled={guardando}
                      onClick={cancelarEdicionBarbero}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="admin__contenido">
          <div className="admin__columna">
            <div className="admin__titulo-seccion">
              <h2>Servicios</h2>
              <span>{servicios.length} registrados</span>
            </div>
            {servicios.length === 0 ? (
              <Vacio mensaje="Todavía no hay servicios registrados." />
            ) : (
              <div className="admin__lista">
                {servicios.map((servicio) => (
                  <article className="tarjeta admin__tarjeta" key={getId(servicio)}>
                    <div>
                      <h3>{servicio.name}</h3>
                      <p>{formatPrice(servicio.price)} · {formatDuration(servicio.duration)}</p>
                      {servicio.description && <p>{servicio.description}</p>}
                    </div>
                    <div className="admin__acciones">
                      <button
                        className="boton-secundario"
                        type="button"
                        disabled={guardando}
                        onClick={() => editarServicio(servicio)}
                      >
                        Editar
                      </button>
                      <button
                        className="boton-peligro"
                        type="button"
                        disabled={guardando}
                        onClick={() => eliminarServicio(servicio)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <form className="admin__formulario" onSubmit={guardarServicio}>
            <h2>{servicioEditando ? "Editar servicio" : "Añadir servicio"}</h2>
            <label>
              Nombre
              <input
                name="name"
                value={formServicio.name}
                onChange={handleServicioChange}
                required
              />
            </label>
            <label>
              Descripción
              <textarea
                name="description"
                rows="3"
                value={formServicio.description}
                onChange={handleServicioChange}
              />
            </label>
            <label>
              Precio (COP)
              <input
                name="price"
                type="number"
                min="0"
                step="1000"
                value={formServicio.price}
                onChange={handleServicioChange}
                required
              />
            </label>
            <label>
              Duración (minutos)
              <input
                name="duration"
                type="number"
                min="1"
                step="1"
                value={formServicio.duration}
                onChange={handleServicioChange}
                required
              />
            </label>
            <div className="admin__acciones">
              <button type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar servicio"}
              </button>
              {servicioEditando && (
                <button
                  className="boton-secundario"
                  type="button"
                  disabled={guardando}
                  onClick={cancelarEdicionServicio}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

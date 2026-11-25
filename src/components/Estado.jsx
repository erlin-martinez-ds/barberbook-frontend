export function Cargando() {
  return <p className="estado">Cargando...</p>;
}

export function ErrorMensaje({ mensaje }) {
  return <p className="estado error">{mensaje}</p>;
}

export function Vacio({ mensaje }) {
  return <p className="estado">{mensaje}</p>;
}

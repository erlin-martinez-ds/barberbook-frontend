import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

// Consulta GET. `loading` se deriva de la URL para evitar mostrar datos de otra consulta.
export function useFetch(url) {
  const [state, setState] = useState({ url: null, data: null, error: null });

  useEffect(() => {
    let cancelled = false;

    axiosClient
      .get(url)
      .then((res) => {
        if (!cancelled) setState({ url, data: res.data, error: null });
      })
      .catch((err) => {
        if (!cancelled) {
          setState({ url, data: null, error: err.userMessage ?? "Error al consultar" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  const loading = state.url !== url;
  return { data: loading ? null : state.data, error: loading ? null : state.error, loading };
}

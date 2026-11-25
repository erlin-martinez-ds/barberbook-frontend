import axios from "axios";

// Clave donde se guardará el token. La sesión (SCRUM-81) usa esta misma clave.
const TOKEN_KEY = "token";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 20000, // el plan gratuito de Render puede tardar en despertar
});

// Interceptor de petición: agrega el JWT en la cabecera Authorization
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta: devuelve los datos y normaliza los errores
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.userMessage =
        "No se pudo conectar con el servidor. Intenta de nuevo en unos segundos.";
    } else {
      // El backend responde { success: false, message, errors? }
      const { message, errors } = error.response.data ?? {};
      const details = Array.isArray(errors) ? ` (${errors.join(", ")})` : "";
      error.userMessage = (message ?? "Ocurrió un error inesperado") + details;

      // Token vencido o inválido: se elimina para no seguir enviándolo
      if (error.response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
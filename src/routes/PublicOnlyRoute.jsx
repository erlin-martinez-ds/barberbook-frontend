import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

// Login y registro: si ya hay sesión, redirige al destino previo o al dashboard.
export default function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="estado">Cargando sesión...</p>;

  if (user) {
    const destino = location.state?.from?.pathname ?? "/dashboard";
    return <Navigate to={destino} replace />;
  }

  return <Outlet />;
}

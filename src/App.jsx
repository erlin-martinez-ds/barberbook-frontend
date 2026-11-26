import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NoAutorizado from "./pages/NoAutorizado";
import NotFound from "./pages/NotFound";
import Barberos from "./pages/Barberos";
import BarberoDetalle from "./pages/BarberoDetalle";
import Servicios from "./pages/Servicios";
import ServicioDetalle from "./pages/ServicioDetalle";
import Reservas from "./pages/Reservas";
import NuevaReserva from "./pages/NuevaReserva";
import ReservaDetalle from "./pages/ReservaDetalle";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="contenedor">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/barberos" element={<Barberos />} />
          <Route path="/barberos/:id" element={<BarberoDetalle />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/servicios/:id" element={<ServicioDetalle />} />

          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<ProtectedRoute roles={["USER", "BARBER", "ADMIN"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reservas" element={<Reservas />} />
            <Route path="/reservas/nueva" element={<NuevaReserva />} />
            <Route path="/reservas/:id" element={<ReservaDetalle />} />
          </Route>

          <Route path="/no-autorizado" element={<NoAutorizado />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

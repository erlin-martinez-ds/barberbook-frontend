import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

const mocks = vi.hoisted(() => ({ useAuth: vi.fn() }));
vi.mock("../context/useAuth", () => ({ useAuth: mocks.useAuth }));

function CurrentPath() {
  const location = useLocation();
  return <p>Ruta actual: {location.pathname}</p>;
}

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
          <Route path="/admin" element={<p>Panel privado</p>} />
        </Route>
        <Route path="/login" element={<CurrentPath />} />
        <Route path="/no-autorizado" element={<CurrentPath />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    mocks.useAuth.mockReturnValue({ user: null, loading: false });
  });

  it("redirige a login cuando no existe sesión", () => {
    renderAdminRoute();

    expect(screen.getByText("Ruta actual: /login")).toBeInTheDocument();
    expect(screen.queryByText("Panel privado")).not.toBeInTheDocument();
  });

  it("bloquea a usuarios autenticados sin rol administrativo", () => {
    mocks.useAuth.mockReturnValue({
      user: { name: "Cliente", role: "USER" },
      loading: false,
    });
    renderAdminRoute();

    expect(screen.getByText("Ruta actual: /no-autorizado")).toBeInTheDocument();
    expect(screen.queryByText("Panel privado")).not.toBeInTheDocument();
  });

  it("permite el acceso al rol autorizado", () => {
    mocks.useAuth.mockReturnValue({
      user: { name: "Admin", role: "ADMIN" },
      loading: false,
    });
    renderAdminRoute();

    expect(screen.getByText("Panel privado")).toBeInTheDocument();
  });
});

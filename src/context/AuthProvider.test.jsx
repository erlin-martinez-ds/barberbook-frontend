import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosClient from "../api/axiosClient";
import Login from "../pages/Login";
import PublicOnlyRoute from "../routes/PublicOnlyRoute";
import { AuthProvider } from "./AuthProvider";

vi.mock("../api/axiosClient", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>
          <Route path="/dashboard" element={<p>Dashboard privado</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe("Autenticación", () => {
  beforeEach(() => {
    localStorage.clear();
    axiosClient.get.mockResolvedValue({
      data: { user: { name: "Alex", role: "USER" } },
    });
  });

  it("guarda el token y dirige al dashboard después de iniciar sesión", async () => {
    const user = userEvent.setup();
    axiosClient.post.mockResolvedValue({
      data: { token: "token-prueba", user: { name: "Alex", role: "USER" } },
    });
    renderLogin();

    await user.type(screen.getByLabelText("Correo"), "alex@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "clave-segura");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Dashboard privado")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBe("token-prueba");
    expect(axiosClient.post).toHaveBeenCalledWith("/auth/login", {
      email: "alex@example.com",
      password: "clave-segura",
    });
  });

  it("presenta los errores de autenticación sin guardar sesión", async () => {
    const user = userEvent.setup();
    axiosClient.post.mockRejectedValue({ userMessage: "Credenciales inválidas" });
    renderLogin();

    await user.type(screen.getByLabelText("Correo"), "alex@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "incorrecta");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Credenciales inválidas")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
    await waitFor(() => expect(axiosClient.post).toHaveBeenCalledTimes(1));
  });
});

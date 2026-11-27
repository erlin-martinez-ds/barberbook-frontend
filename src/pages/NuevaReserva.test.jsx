import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NuevaReserva from "./NuevaReserva";

const mocks = vi.hoisted(() => ({
  axiosPost: vi.fn(),
  useFetch: vi.fn(),
}));
vi.mock("../api/axiosClient", () => ({
  default: { post: mocks.axiosPost },
}));
vi.mock("../hooks/useFetch", () => ({ useFetch: mocks.useFetch }));

function CurrentPath() {
  const location = useLocation();
  return <p>Ruta actual: {location.pathname}</p>;
}

describe("Crear reserva", () => {
  beforeEach(() => {
    mocks.useFetch.mockImplementation((url) => ({
      data: url === "/barbers"
        ? { barbers: [{ _id: "barber-1", user: { name: "Ana" } }] }
        : { services: [{ _id: "service-1", name: "Corte" }] },
      loading: false,
      error: null,
    }));
  });

  it("envía la reserva y navega al detalle creado", async () => {
    const user = userEvent.setup();
    mocks.axiosPost.mockResolvedValue({
      data: { booking: { _id: "booking-1" } },
    });
    render(
      <MemoryRouter initialEntries={["/reservas/nueva"]}>
        <Routes>
          <Route path="/reservas/nueva" element={<NuevaReserva />} />
          <Route path="/reservas/:id" element={<CurrentPath />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.selectOptions(screen.getByLabelText("Barbero"), "barber-1");
    await user.selectOptions(screen.getByLabelText("Servicio"), "service-1");
    await user.type(screen.getByLabelText("Fecha y hora"), "2030-01-02T10:30");
    await user.click(screen.getByRole("button", { name: "Crear reserva" }));

    expect(await screen.findByText("Ruta actual: /reservas/booking-1")).toBeInTheDocument();
    const payload = mocks.axiosPost.mock.calls[0][1];
    expect(mocks.axiosPost).toHaveBeenCalledWith("/bookings", {
      barberId: "barber-1",
      serviceId: "service-1",
      date: expect.any(String),
    });
    expect(new Date(payload.date).toISOString()).toBe(payload.date);
  });
});

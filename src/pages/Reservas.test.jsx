import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosClient from "../api/axiosClient";
import { useAuth } from "../context/useAuth";
import { useFetch } from "../hooks/useFetch";
import Reservas from "./Reservas";

vi.mock("../api/axiosClient", () => ({
  default: { patch: vi.fn() },
}));
vi.mock("../context/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../hooks/useFetch", () => ({ useFetch: vi.fn() }));

describe("Reservas del barbero", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { role: "BARBER" } });
    useFetch.mockReturnValue({
      data: {
        bookings: [{
          _id: "booking-1",
          customer: { name: "Sam Rivera" },
          service: { name: "Corte" },
          date: "2030-01-02T10:00:00.000Z",
          status: "PENDING",
        }],
      },
      loading: false,
      error: null,
    });
  });

  it("confirma una reserva pendiente y refleja el nuevo estado", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Reservas />
      </MemoryRouter>,
    );

    expect(screen.getByText("Sam Rivera")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => {
      expect(axiosClient.patch).toHaveBeenCalledWith("/bookings/booking-1/confirm");
    });
    expect(await screen.findByText("Confirmada")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirmar" })).not.toBeInTheDocument();
  });

  it("muestra el error de API cuando falla la confirmación", async () => {
    const user = userEvent.setup();
    axiosClient.patch.mockRejectedValue({ userMessage: "Reserva ya procesada." });
    render(
      <MemoryRouter>
        <Reservas />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(await screen.findByText("Reserva ya procesada.")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });
});

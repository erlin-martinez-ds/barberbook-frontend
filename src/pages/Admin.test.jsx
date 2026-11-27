import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Admin from "./Admin";

const mocks = vi.hoisted(() => ({
  axios: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  useFetch: vi.fn(),
}));

vi.mock("../api/axiosClient", () => ({ default: mocks.axios }));
vi.mock("../hooks/useFetch", () => ({ useFetch: mocks.useFetch }));

const barbero = {
  _id: "barber-1",
  user: { name: "Ana Torres", email: "ana@example.com" },
  specialties: ["Corte"],
  yearsExperience: 5,
  availability: [],
};

const servicio = {
  _id: "service-1",
  name: "Corte clásico",
  description: "Corte con tijera",
  price: 25000,
  duration: 30,
};

describe("Panel administrativo", () => {
  beforeEach(() => {
    mocks.useFetch.mockImplementation((url) => ({
      data: url === "/barbers" ? { barbers: [barbero] } : { services: [servicio] },
      loading: false,
      error: null,
    }));
    mocks.axios.get.mockResolvedValue({
      data: { services: [servicio], barbers: [barbero] },
    });
  });

  it("muestra barberos y permite crear servicios con campos numéricos", async () => {
    const user = userEvent.setup();
    render(<Admin />);

    expect(await screen.findByText("Ana Torres")).toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Servicios" }));

    expect(screen.getByText("Corte clásico")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Nombre"), "Afeitado");
    await user.type(screen.getByLabelText("Descripción"), "Afeitado tradicional");
    await user.type(screen.getByLabelText("Precio (COP)"), "18000");
    await user.type(screen.getByLabelText("Duración (minutos)"), "20");
    await user.click(screen.getByRole("button", { name: "Guardar servicio" }));

    await waitFor(() => {
      expect(mocks.axios.post).toHaveBeenCalledWith("/services", {
        name: "Afeitado",
        description: "Afeitado tradicional",
        price: 18000,
        duration: 20,
      });
    });
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Servicio guardado correctamente.",
    );
  });

  it("rechaza horarios inválidos y guarda los siete días de disponibilidad", async () => {
    const user = userEvent.setup();
    render(<Admin />);

    await user.click(await screen.findByRole("button", { name: "Disponibilidad" }));
    await user.click(screen.getByLabelText("Lunes"));
    fireEvent.change(screen.getByLabelText("Inicio MONDAY"), {
      target: { value: "18:00" },
    });

    await user.click(screen.getByRole("button", { name: "Guardar horario" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La hora de cierre debe ser posterior a la hora de apertura.",
    );
    expect(mocks.axios.patch).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("Fin MONDAY"), {
      target: { value: "20:00" },
    });
    await user.click(screen.getByRole("button", { name: "Guardar horario" }));

    await waitFor(() => {
      expect(mocks.axios.patch).toHaveBeenCalledWith(
        "/barbers/barber-1/availability",
        {
          availability: expect.arrayContaining([
            expect.objectContaining({
              dayOfWeek: "MONDAY",
              isAvailable: true,
              startTime: "18:00",
              endTime: "20:00",
            }),
          ]),
        },
      );
    });
    expect(mocks.axios.patch.mock.calls[0][1].availability).toHaveLength(7);
  });

  it("muestra errores del servidor al intentar eliminar un barbero", async () => {
    const user = userEvent.setup();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mocks.axios.delete.mockRejectedValue({
      userMessage: "No se puede eliminar un barbero con reservas.",
    });
    render(<Admin />);

    const tarjeta = (await screen.findByText("Ana Torres")).closest("article");
    await user.click(within(tarjeta).getByRole("button", { name: "Eliminar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se puede eliminar un barbero con reservas.",
    );
    expect(screen.getByText("Ana Torres")).toBeInTheDocument();
  });
});

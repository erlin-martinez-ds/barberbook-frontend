import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axiosClient from "../api/axiosClient";
import { useFetch } from "./useFetch";

vi.mock("../api/axiosClient", () => ({
  default: { get: vi.fn() },
}));

describe("useFetch", () => {
  beforeEach(() => {
    axiosClient.get.mockReset();
  });

  it("carga y expone la respuesta de la URL solicitada", async () => {
    axiosClient.get.mockResolvedValue({ data: { services: ["Corte"] } });
    const { result } = renderHook(() => useFetch("/services"));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual({ services: ["Corte"] });
    expect(result.current.error).toBeNull();
  });

  it("expone un mensaje legible si la consulta falla", async () => {
    axiosClient.get.mockRejectedValue({ userMessage: "Servicio no disponible" });
    const { result } = renderHook(() => useFetch("/services"));

    await waitFor(() => expect(result.current.error).toBe("Servicio no disponible"));
    expect(result.current.data).toBeNull();
  });

  it("no actualiza estado cuando el componente se desmonta antes de responder", async () => {
    let resolveRequest;
    axiosClient.get.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const { result, unmount } = renderHook(() => useFetch("/services"));
    unmount();

    await act(async () => {
      resolveRequest({ data: { services: ["Corte"] } });
    });

    expect(result.current.loading).toBe(true);
  });
});

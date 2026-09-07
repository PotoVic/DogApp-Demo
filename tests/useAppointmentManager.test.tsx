import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAppointments: vi.fn(),
  createAppointment: vi.fn(),
  updateAppointment: vi.fn(),
  cancelAppointment: vi.fn(),
  completeAppointment: vi.fn(),
  deleteAppointment: vi.fn(),
}));

vi.mock("../src/services/appointments/appointmentService", () => mocks);

import { useAppointmentManager } from "../src/hooks/useAppointmentManager";

const appointment = (id = "1") => ({
  id,
  user_id: "user-1",
  dog_name: "Max",
  breed: null,
  appointment_date: "2026-08-01",
  appointment_time: "10:00",
  price: 100,
  note: null,
  status: "scheduled" as const,
  created_at: "",
  updated_at: "",
});

const input: any = {
  dog_name: "Max",
  appointment_date: "2026-08-01",
  appointment_time: "10:00",
  price: 100,
  status: "scheduled",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getAppointments.mockResolvedValue([appointment()]);
});

describe("useAppointmentManager", () => {
  it("loads appointments on mount", async () => {
    const { result } = renderHook(() => useAppointmentManager());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.appointments).toHaveLength(1);
  });

  it("exposes a friendly load error", async () => {
    mocks.getAppointments.mockRejectedValueOnce(new Error("failed"));

    const { result } = renderHook(() => useAppointmentManager());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.loadError).toBe("Failed to load appointments. Try again.");
  });

  it("creates and reloads appointments", async () => {
    mocks.createAppointment.mockResolvedValue(appointment("2"));

    const { result } = renderHook(() => useAppointmentManager());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.create(input)).resolves.toBe(true);
    });

    expect(mocks.createAppointment).toHaveBeenCalledWith(input);
    expect(result.current.successMessage).toBe("Appointment saved.");
  });

  it("reports create failures", async () => {
    mocks.createAppointment.mockRejectedValue(new Error("failed"));

    const { result } = renderHook(() => useAppointmentManager());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.create(input)).resolves.toBe(false);
    });

    expect(result.current.actionError).toBe("Failed to save the appointment. Try again.");
  });

  it("updates an appointment", async () => {
    mocks.updateAppointment.mockResolvedValue(appointment());

    const { result } = renderHook(() => useAppointmentManager());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.update("1", input)).resolves.toBe(true);
    });

    expect(mocks.updateAppointment).toHaveBeenCalledWith("1", input);
    expect(result.current.successMessage).toBe("Appointment updated.");
  });

  it("cancels an appointment", async () => {
    mocks.cancelAppointment.mockResolvedValue(appointment());

    const { result } = renderHook(() => useAppointmentManager());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.cancel("1");
    });

    expect(mocks.cancelAppointment).toHaveBeenCalledWith("1");
    expect(result.current.successMessage).toBe("Appointment cancelled.");
  });

  it("completes an appointment", async () => {
    mocks.completeAppointment.mockResolvedValue(appointment());

    const { result } = renderHook(() => useAppointmentManager());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.complete("1");
    });

    expect(mocks.completeAppointment).toHaveBeenCalledWith("1");
    expect(result.current.successMessage).toBe("Appointment marked as completed.");
  });

  it("does not delete when confirmation is declined", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);

    const { result } = renderHook(() => useAppointmentManager());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.remove(appointment() as any)).resolves.toBe(false);
    });

    expect(mocks.deleteAppointment).not.toHaveBeenCalled();
  });

  it("deletes after confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mocks.deleteAppointment.mockResolvedValue(undefined);

    const { result } = renderHook(() => useAppointmentManager());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.remove(appointment() as any)).resolves.toBe(true);
    });

    expect(mocks.deleteAppointment).toHaveBeenCalledWith("1");
    expect(result.current.successMessage).toBe("Appointment deleted.");
  });

  it("blocks a second mutation while one is active", async () => {
    let resolveFirst!: () => void;
    mocks.createAppointment.mockImplementation(
      () => new Promise<void>((resolve) => { resolveFirst = resolve; }),
    );

    const { result } = renderHook(() => useAppointmentManager());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let first!: Promise<boolean>;
    await act(async () => {
      first = result.current.create(input);
    });

    await waitFor(() => expect(result.current.mutationType).toBe("saving"));

    await act(async () => {
      await expect(result.current.create(input)).resolves.toBe(false);
    });

    expect(mocks.createAppointment).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirst();
      await first;
    });
  });

  it("clears feedback state", async () => {
    mocks.createAppointment.mockRejectedValueOnce(new Error("failed"));

    const { result } = renderHook(() => useAppointmentManager());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.create(input);
    });

    act(() => result.current.clearFeedback());

    expect(result.current.loadError).toBeNull();
    expect(result.current.actionError).toBeNull();
    expect(result.current.successMessage).toBeNull();
  });
});

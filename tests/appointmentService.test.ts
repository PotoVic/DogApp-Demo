import { beforeEach, describe, expect, it, vi } from "vitest";

const { fromMock, getUserMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  getUserMock: vi.fn(),
}));

vi.mock("../src/services/supabase/client", () => ({
  supabase: {
    from: fromMock,
    auth: { getUser: getUserMock },
  },
}));

import {
  getAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  completeAppointment,
  deleteAppointment,
} from "../src/services/appointments/appointmentService";

const chain = (result: unknown) => {
  const value: any = {
    select: vi.fn(() => value),
    order: vi.fn(),
    insert: vi.fn(() => value),
    update: vi.fn(() => value),
    delete: vi.fn(() => value),
    eq: vi.fn(() => value),
    single: vi.fn(async () => result),
  };

  // getAppointments() calls .order() twice:
  // 1. first order() keeps the query chain alive
  // 2. second order() resolves the Supabase result
  value.order
    .mockImplementationOnce(() => value)
    .mockImplementationOnce(async () => result);

  return value;
};

beforeEach(() => vi.clearAllMocks());

describe("appointmentService", () => {
  it("loads appointments ordered by date and time", async () => {
    const data = [{ id: "1" }];
    const query = chain({ data, error: null });
    fromMock.mockReturnValue(query);

    await expect(getAppointments()).resolves.toEqual(data);
    expect(fromMock).toHaveBeenCalledWith("appointments");
    expect(query.select).toHaveBeenCalledWith("*");
    expect(query.order).toHaveBeenNthCalledWith(1, "appointment_date", { ascending: true });
    expect(query.order).toHaveBeenNthCalledWith(2, "appointment_time", { ascending: true });
  });

  it("throws database errors while loading", async () => {
    fromMock.mockReturnValue(chain({ data: null, error: new Error("load failed") }));
    await expect(getAppointments()).rejects.toThrow("load failed");
  });

  it("creates an appointment with the authenticated user id", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-123" } }, error: null });
    const query = chain({ data: { id: "a" }, error: null });
    fromMock.mockReturnValue(query);

    const input: any = {
      dog_name: "Max",
      breed: "Labrador",
      appointment_date: "2026-08-01",
      appointment_time: "10:00",
      price: 100,
      status: "scheduled",
    };

    await expect(createAppointment(input)).resolves.toEqual({ id: "a" });
    expect(query.insert).toHaveBeenCalledWith({ ...input, user_id: "user-123" });
  });

  it("throws auth errors", async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: new Error("auth failed"),
    });

    await expect(createAppointment({
      dog_name: "Max",
      appointment_date: "2026-08-01",
      appointment_time: "10:00",
      price: 100,
      status: "scheduled",
    } as any)).rejects.toThrow("auth failed");
  });

  it("rejects creation without a logged-in user", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    await expect(createAppointment({
      dog_name: "Max",
      appointment_date: "2026-08-01",
      appointment_time: "10:00",
      price: 100,
      status: "scheduled",
    } as any)).rejects.toThrow("User is not logged in.");
  });

  it("propagates create errors", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "u" } }, error: null });
    fromMock.mockReturnValue(chain({ data: null, error: new Error("insert failed") }));

    await expect(createAppointment({
      dog_name: "Max",
      appointment_date: "2026-08-01",
      appointment_time: "10:00",
      price: 100,
      status: "scheduled",
    } as any)).rejects.toThrow("insert failed");
  });

  it("updates an appointment by id", async () => {
    const query = chain({ data: { id: "a" }, error: null });
    fromMock.mockReturnValue(query);
    const input: any = {
      dog_name: "Reks",
      appointment_date: "2026-08-02",
      appointment_time: "11:00",
      price: 150,
      status: "scheduled",
    };

    await expect(updateAppointment("a", input)).resolves.toEqual({ id: "a" });
    expect(query.update).toHaveBeenCalledWith(input);
    expect(query.eq).toHaveBeenCalledWith("id", "a");
  });

  it("cancels an appointment", async () => {
    const query = chain({ data: { id: "a" }, error: null });
    fromMock.mockReturnValue(query);

    await cancelAppointment("a");

    expect(query.update).toHaveBeenCalledWith({ status: "cancelled" });
    expect(query.eq).toHaveBeenCalledWith("id", "a");
  });

  it("completes an appointment", async () => {
    const query = chain({ data: { id: "a" }, error: null });
    fromMock.mockReturnValue(query);

    await completeAppointment("a");

    expect(query.update).toHaveBeenCalledWith({ status: "completed" });
    expect(query.eq).toHaveBeenCalledWith("id", "a");
  });

  it("deletes an appointment", async () => {
    const query = chain({ error: null });
    fromMock.mockReturnValue(query);

    await expect(deleteAppointment("a")).resolves.toBeUndefined();
    expect(query.delete).toHaveBeenCalled();
    expect(query.eq).toHaveBeenCalledWith("id", "a");
  });

  it("propagates mutation errors", async () => {
    const query = chain({ data: null, error: new Error("mutation failed") });
    fromMock.mockReturnValue(query);

    await expect(cancelAppointment("a")).rejects.toThrow("mutation failed");
  });
});

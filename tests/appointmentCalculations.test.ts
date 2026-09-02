import { describe, expect, it } from "vitest";
import type { Appointment } from "../src/types/appointment";
import {
  getMonthlyAppointments,
  getMonthlyEarnings,
  getAppointmentCount,
} from "../src/utils/appointmentCalculations";

const appointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: "1",
  user_id: "user-1",
  dog_name: "Burek",
  breed: "Labrador",
  appointment_date: "2026-08-15",
  appointment_time: "10:00",
  price: 100,
  note: null,
  status: "completed",
  created_at: "2026-08-01T10:00:00Z",
  updated_at: "2026-08-01T10:00:00Z",
  ...overrides,
});

describe("appointment calculations", () => {
  it("filters by month", () => {
    expect(getMonthlyAppointments([
      appointment({ id: "a", appointment_date: "2026-08-01" }),
      appointment({ id: "b", appointment_date: "2026-09-01" }),
    ], "2026-08").map((a) => a.id)).toEqual(["a"]);
  });

  it("does not mutate appointments", () => {
    const data = [appointment({ id: "a" })];
    expect(getMonthlyAppointments(data, "2026-08")).not.toBe(data);
    expect(data).toHaveLength(1);
  });

  it("calculates only completed earnings", () => {
    expect(getMonthlyEarnings([
      appointment({ price: 500, status: "completed" }),
      appointment({ price: 300, status: "scheduled" }),
      appointment({ price: 200, status: "cancelled" }),
    ], "2026-08")).toBe(500);
  });

  it("rounds each price to cents", () => {
    expect(getMonthlyEarnings([
      appointment({ id: "1", price: 10.005 }),
      appointment({ id: "2", price: 10.004 }),
    ], "2026-08")).toBe(20.01);
  });

  it("returns zero for no completed appointments", () => {
    expect(getMonthlyEarnings([
      appointment({ status: "scheduled" }),
      appointment({ status: "cancelled" }),
    ], "2026-08")).toBe(0);
  });

  it("counts all matching appointments", () => {
    expect(getAppointmentCount([
      appointment({ status: "completed" }),
      appointment({ id: "2", status: "scheduled" }),
      appointment({ id: "3", status: "cancelled" }),
    ], "2026-08")).toBe(3);
  });
});

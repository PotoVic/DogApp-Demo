/*
 * Pure appointment filtering and earnings calculations.
 */

import type { Appointment } from "../types/appointment";
import { formatCalendarDateKey } from "./calendar";

// Returns appointments for one calendar date, ordered by time.
export function getAppointmentsForDate(
  appointments: Appointment[],
  date: Date,
): Appointment[] {
  const dateKey = formatCalendarDateKey(date);

  return appointments
    .filter((appointment) => appointment.appointment_date === dateKey)
    .sort((first, second) =>
      first.appointment_time.localeCompare(second.appointment_time),
    );
}

// Calculates completed appointment earnings for one date using integer cents.
export function getDailyEarnings(
  appointments: Appointment[],
  dateKey: string,
): number {
  return (
    appointments
      .filter(
        (appointment) =>
          appointment.appointment_date === dateKey &&
          appointment.status === "completed",
      )
      .reduce((totalCents, appointment) => {
        return totalCents + Math.round(appointment.price * 100);
      }, 0) / 100
  );
}

// Returns appointments whose date belongs to the requested YYYY-MM month.
export function getMonthlyAppointments(
  appointments: Appointment[],
  monthKey: string,
): Appointment[] {
  return appointments.filter((appointment) =>
    appointment.appointment_date.startsWith(monthKey),
  );
}

// Calculates completed earnings for a month using integer cents.
export function getMonthlyEarnings(
  appointments: Appointment[],
  monthKey: string,
): number {
  return (
    getMonthlyAppointments(appointments, monthKey)
      .filter((appointment) => appointment.status === "completed")
      .reduce((totalCents, appointment) => {
        return totalCents + Math.round(appointment.price * 100);
      }, 0) / 100
  );
}

// Returns the number of appointments in a month.
export function getAppointmentCount(
  appointments: Appointment[],
  monthKey: string,
): number {
  return getMonthlyAppointments(appointments, monthKey).length;
}

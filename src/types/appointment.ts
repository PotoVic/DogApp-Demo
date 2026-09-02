/*
 * Shared appointment domain types.
 */

// Allowed lifecycle states for an appointment.
export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled";

// Mutation states used by appointment UI to show saving/deleting feedback.
export type AppointmentMutationType = "saving" | "deleting" | null;

// Database-shaped appointment record used throughout the app.
export interface Appointment {
  id: string;
  user_id: string;
  dog_name: string;
  breed: string | null;
  phone_number: string | null;
  appointment_date: string;
  appointment_time: string;
  price: number;
  note: string | null;
  status: AppointmentStatus;
  created_at: string;
  updated_at: string;
}

// Validated input shape used when creating or updating an appointment.
export interface AppointmentInput {
  dog_name: string;
  breed?: string;
  phone_number?: string;
  appointment_date: string;
  appointment_time: string;
  price: number;
  note?: string;
  status: AppointmentStatus;
}


/*
 * Supabase CRUD operations for appointments.
 */

import { supabase} from "../supabase/client"
import type { Appointment, AppointmentInput } from "../../types/appointment"


// Fetches the current user's appointments in date/time order.
export async function getAppointments(): Promise<Appointment[]> {
  
    const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

    if (error) {
        throw error
    }

    return data;
}

// Creates a new appointment for the authenticated user.
export async function createAppointment(
  appointment: AppointmentInput,
): Promise<Appointment> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    throw new Error("User is not logged in.");
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert({
      ...appointment,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
// Updates an existing appointment by ID.
export async function updateAppointment(
  id: string,
  appointment: AppointmentInput,
): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .update(appointment)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Changes an appointment's status to cancelled.
export async function cancelAppointment(
  id: string,
): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Changes an appointment's status to completed.
export async function completeAppointment(
  id: string,
): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: "completed" })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

// Deletes an appointment by ID.
export async function deleteAppointment(
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id);

  if (error) {
    throw error;
  }
}

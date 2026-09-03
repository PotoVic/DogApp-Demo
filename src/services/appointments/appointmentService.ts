/*
 * Supabase CRUD operations for appointments.
 */

import { supabase } from "../supabase/client";
import type { Appointment, AppointmentInput } from "../../types/appointment";

// Normalizes text for matching a Saved Dog with its appointment snapshots.
const normalizeAppointmentValue = (value: string | null | undefined) =>
  value?.trim().replace(/\s+/g, " ").toLocaleLowerCase("en") ?? "";

// Normalizes phone numbers so formatting differences do not prevent a match.
const normalizeAppointmentPhone = (value: string | null | undefined) =>
  value?.replace(/\D/g, "") ?? "";


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


/**
 * Updates appointment snapshots when the corresponding Saved Dog profile changes.
 *
 * Saved Dogs represent the current reusable dog data. Appointments keep their
 * own records, but for this app we also keep their dog identity fields aligned
 * with the current Saved Dog profile.
 *
 * The previous profile values are used for matching so a changed name or phone
 * can still locate the existing appointment records.
 */
export async function syncAppointmentsFromSavedDog(
  previousDog: {
    name: string;
    breed?: string | null;
    phone_number?: string | null;
  },
  updatedDog: {
    name: string;
    breed?: string | null;
    phone_number?: string | null;
  },
): Promise<void> {
  const appointments = await getAppointments();

  const previousName = normalizeAppointmentValue(previousDog.name);
  const previousBreed = normalizeAppointmentValue(previousDog.breed);
  const previousPhone = normalizeAppointmentPhone(previousDog.phone_number);

  if (!previousName) {
    return;
  }

  const matchingAppointments = appointments.filter((appointment) => {
    const appointmentName = normalizeAppointmentValue(appointment.dog_name);
    const appointmentBreed = normalizeAppointmentValue(appointment.breed);
    const appointmentPhone = normalizeAppointmentPhone(
      appointment.phone_number,
    );

    if (appointmentName !== previousName) {
      return false;
    }

    // Phone is the strongest identifier when the Saved Dog has one.
    if (previousPhone) {
      return appointmentPhone === previousPhone;
    }

    // Otherwise use name + breed when breed is available.
    if (previousBreed) {
      return appointmentBreed === previousBreed;
    }

    // With neither phone nor breed, only the name is available.
    return true;
  });

  if (matchingAppointments.length === 0) {
    return;
  }

  await Promise.all(
    matchingAppointments.map((appointment) =>
      updateAppointment(appointment.id, {
        dog_name: updatedDog.name,
        breed: updatedDog.breed ?? "",
        phone_number: updatedDog.phone_number ?? "",
        appointment_date: appointment.appointment_date,
        appointment_time: appointment.appointment_time,
        price: appointment.price,
        note: appointment.note ?? undefined,
        status: appointment.status,
      }),
    ),
  );
}

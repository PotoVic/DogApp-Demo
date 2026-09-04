/*
 * Temporary guest-data helpers for the public portfolio demo.
 */

import { supabase } from "../supabase/client";

const DEMO_USER_ID_PLACEHOLDER = "guest";

const demoSavedDogs = [
  { name: "Bella", breed: "Golden Retriever", phone_number: "+46 70 123 45 67" },
  { name: "Charlie", breed: "Labrador Retriever", phone_number: "+46 73 234 56 78" },
  { name: "Luna", breed: "Cocker Spaniel", phone_number: "+46 72 345 67 89" },
  { name: "Milo", breed: "Poodle", phone_number: "+46 76 456 78 90" },
  { name: "Rocky", breed: "French Bulldog", phone_number: "+46 79 567 89 01" },
];

const demoAppointments = [
  { dog_name: "Bella", breed: "Golden Retriever", appointment_date: "2026-08-28", appointment_time: "09:00", price: 650, note: "Full grooming", status: "completed", phone_number: "+46 70 123 45 67" },
  { dog_name: "Charlie", breed: "Labrador Retriever", appointment_date: "2026-09-01", appointment_time: "10:30", price: 550, note: "Bath and trim", status: "completed", phone_number: "+46 73 234 56 78" },
  { dog_name: "Luna", breed: "Cocker Spaniel", appointment_date: "2026-09-02", appointment_time: "09:00", price: 600, note: "Full grooming", status: "completed", phone_number: "+46 72 345 67 89" },
  { dog_name: "Milo", breed: "Poodle", appointment_date: "2026-09-02", appointment_time: "13:00", price: 700, note: "Full grooming and nail trim", status: "scheduled", phone_number: "+46 76 456 78 90" },
  { dog_name: "Rocky", breed: "French Bulldog", appointment_date: "2026-09-03", appointment_time: "10:00", price: 450, note: "Bath and deshedding", status: "scheduled", phone_number: "+46 79 567 89 01" },
  { dog_name: "Bella", breed: "Golden Retriever", appointment_date: "2026-09-04", appointment_time: "14:30", price: 650, note: "Regular grooming", status: "scheduled", phone_number: "+46 70 123 45 67" },
  { dog_name: "Luna", breed: "Cocker Spaniel", appointment_date: "2026-09-08", appointment_time: "11:00", price: 600, note: "Full grooming", status: "scheduled", phone_number: "+46 72 345 67 89" },
  { dog_name: "Charlie", breed: "Labrador Retriever", appointment_date: "2026-09-10", appointment_time: "15:00", price: 550, note: "Bath and trim", status: "scheduled", phone_number: "+46 73 234 56 78" },
];

// Creates the clean fictional starting state for a new guest.
export async function seedGuestDemoData(userId: string): Promise<void> {
  if (userId === DEMO_USER_ID_PLACEHOLDER) {
    throw new Error("Invalid guest user ID.");
  }

  const { error: savedDogsError } = await supabase
    .from("saved_dogs")
    .insert(demoSavedDogs.map((dog) => ({ ...dog, user_id: userId })));

  if (savedDogsError) {
    throw savedDogsError;
  }

  const { error: appointmentsError } = await supabase
    .from("appointments")
    .insert(demoAppointments.map((appointment) => ({ ...appointment, user_id: userId })));

  if (appointmentsError) {
    throw appointmentsError;
  }
}

// Deletes only the current anonymous user's application data. RLS remains the authorization boundary.
export async function cleanupCurrentGuestData(userId: string): Promise<void> {
  const [appointmentsResult, savedDogsResult] = await Promise.all([
    supabase.from("appointments").delete().eq("user_id", userId),
    supabase.from("saved_dogs").delete().eq("user_id", userId),
  ]);

  if (appointmentsResult.error) {
    throw appointmentsResult.error;
  }

  if (savedDogsResult.error) {
    throw savedDogsResult.error;
  }
}

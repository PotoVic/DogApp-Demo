/*
 * React hook that centralizes appointment data loading and mutations.
 */

import { useCallback, useEffect, useState } from "react";
import {
  cancelAppointment,
  completeAppointment,
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointment,
} from "../services/appointments/appointmentService";
import type {
  Appointment,
  AppointmentInput,
  AppointmentMutationType,
} from "../types/appointment";

// Centralizes appointment loading, CRUD mutations, feedback, and mutation state for appointment pages.
export function useAppointmentManager() {
  // Stores appointments loaded for the current authenticated user.
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  // Tracks appointment-list loading state.
  const [isLoading, setIsLoading] = useState(true);
  // Stores a user-safe error from the initial/reload fetch.
  const [loadError, setLoadError] = useState<string | null>(null);
  // Stores a user-safe error from a create/update/status/delete action.
  const [actionError, setActionError] = useState<string | null>(null);
  // Stores the latest successful appointment action message.
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Identifies the kind of appointment mutation currently in progress.
  const [mutationType, setMutationType] = useState<AppointmentMutationType>(null);
  // Identifies the appointment currently being mutated so only its UI shows progress.
  const [mutationAppointmentId, setMutationAppointmentId] = useState<
    string | null
  >(null);

  // Fetches the current user's appointments and updates the manager's loading/error state.
  const loadAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      setAppointments(await getAppointments());
    } catch {
      setLoadError("Failed to load appointments. Try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // This effect intentionally loads external data on mount.
    // The state updates happen as part of the asynchronous Supabase request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAppointments();
  }, [loadAppointments]);

  // Runs an appointment mutation with consistent feedback, loading state, and list refresh behavior.
  const runMutation = async (
    appointmentId: string,
    mutation: () => Promise<unknown>,
    success: string,
    failure: string,
    type: AppointmentMutationType,
  ) => {
    if (mutationType) return false;

    try {
      setActionError(null);
      setSuccessMessage(null);
      setMutationType(type);
      setMutationAppointmentId(appointmentId);
      await mutation();
      setSuccessMessage(success);
      await loadAppointments();
      return true;
    } catch {
      setActionError(failure);
      return false;
    } finally {
      setMutationType(null);
      setMutationAppointmentId(null);
    }
  };

  // Creates an appointment and refreshes the appointment list.
  const create = async (data: AppointmentInput) => {
    if (mutationType) return false;

    try {
      setActionError(null);
      setSuccessMessage(null);
      setMutationType("saving");
      setMutationAppointmentId(null);
      await createAppointment(data);
      setSuccessMessage("Appointment saved.");
      await loadAppointments();
      return true;
    } catch {
      setActionError("Failed to save the appointment. Try again.");
      return false;
    } finally {
      setMutationType(null);
    }
  };

  // Updates an appointment through the shared mutation pipeline.
  const update = async (appointmentId: string, data: AppointmentInput) =>
    runMutation(
      appointmentId,
      () => updateAppointment(appointmentId, data),
      "Appointment updated.",
      "Failed to update the appointment. Try again.",
      "saving",
    );

  // Cancels an appointment through the shared mutation pipeline.
  const cancel = async (appointmentId: string) =>
    runMutation(
      appointmentId,
      () => cancelAppointment(appointmentId),
      "Appointment cancelled.",
      "Failed to cancel the appointment. Try again.",
      "saving",
    );

  // Completes an appointment through the shared mutation pipeline.
  const complete = async (appointmentId: string) =>
    runMutation(
      appointmentId,
      () => completeAppointment(appointmentId),
      "Appointment marked as completed.",
      "Failed to complete the appointment. Try again.",
      "saving",
    );

  // Confirms and deletes an appointment through the shared mutation pipeline.
  const remove = async (appointment: Appointment) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the appointment for dog "${appointment.dog_name}"?`,
    );

    if (!confirmed) return false;

    return runMutation(
      appointment.id,
      () => deleteAppointment(appointment.id),
      "Appointment deleted.",
      "Failed to delete the appointment. Try again.",
      "deleting",
    );
  };

  // Clears current loading/action/success messages.
  const clearFeedback = () => {
    setLoadError(null);
    setActionError(null);
    setSuccessMessage(null);
  };

  return {
    appointments,
    isLoading,
    loadError,
    actionError,
    successMessage,
    mutationType,
    mutationAppointmentId,
    create,
    update,
    cancel,
    complete,
    remove,
    clearFeedback,
    reload: loadAppointments,
  };
}

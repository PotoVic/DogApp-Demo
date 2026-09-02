/*
 * Dashboard page composition and dashboard-level state.
 */

import { useState } from "react";
import type { AppointmentFormSubmitData } from "../features/appointments/components/AppointmentsForm";
import { AppointmentModal } from "../components/appointments/AppointmentModal";
import { Toast } from "../components/feedback/Toast";
import { DashboardAppointments } from "../features/dashboard/components/DashboardAppointments";
import { DashboardMiniCalendar } from "../features/dashboard/components/DashboardMiniCalendar";
import { DashboardSummary } from "../features/dashboard/components/DashboardSummary";
import { useAppointmentManager } from "../hooks/useAppointmentManager";
import type { Appointment } from "../types/appointment";
import { formatCalendarDateKey } from "../utils/calendar";
import { findOrCreateSavedDog } from "../services/savedDogs/savedDogService";
import "../features/appointments/components/appointments.css";
import "../features/dashboard/dashboard.css";

// Dashboard page: composes the calendar, summary, daily appointments, and appointment modal.
export default function AppHome() {
  // Shared appointment data and CRUD state for the dashboard.
  const manager = useAppointmentManager();
  // Controls visibility of the appointment modal.
  const [showForm, setShowForm] = useState(false);
  // Stores the appointment being edited, or null when creating.
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  // Optional date passed from the dashboard calendar when opening a new appointment.
  const [newAppointmentDate, setNewAppointmentDate] = useState<string | null>(
    null,
  );
  // The calendar date whose appointments are currently displayed.
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  // The month currently visible in the dashboard mini calendar.
  const [displayedMonth, setDisplayedMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

// Canonical YYYY-MM-DD key for today's date.
  const todayDateKey = formatCalendarDateKey(new Date());
// Canonical YYYY-MM key for the month currently visible on the dashboard.
  const monthKey = `${displayedMonth.getFullYear()}-${String(
    displayedMonth.getMonth() + 1,
  ).padStart(2, "0")}`;
// Convenience flag used to disable dashboard actions while an appointment mutation is saving.
  const isSaving = manager.mutationType === "saving";

  // Opens the appointment modal and optionally preselects a calendar date.
  const openAppointmentModal = (date?: string) => {
    if (manager.mutationType) return;

    manager.clearFeedback();
    setEditingAppointment(null);
    setNewAppointmentDate(date ?? todayDateKey);
    setShowForm(true);
  };

  // Closes the appointment modal and clears its editing state.
  const closeAppointmentModal = () => {
    if (manager.mutationType) return;

    setShowForm(false);
    setEditingAppointment(null);
    setNewAppointmentDate(null);
  };

  // Opens the modal with the selected appointment for editing.
  const handleEditAppointment = (appointment: Appointment) => {
    if (manager.mutationType) return;

    manager.clearFeedback();
    setEditingAppointment(appointment);
    setNewAppointmentDate(null);
    setShowForm(true);
  };

  // Creates or updates an appointment and optionally creates/reuses its saved-dog profile.
  const handleSubmitAppointment = async ({
    appointment,
    selectedSavedDogId,
    }: AppointmentFormSubmitData) => {
    const saved = editingAppointment
      ? await manager.update(editingAppointment.id, appointment)
      : await manager.create(appointment);

    if (!saved) return;

    if (!editingAppointment && !selectedSavedDogId) {
      try {
        await findOrCreateSavedDog({
          name: appointment.dog_name,
          breed: appointment.breed,
          phone_number: appointment.phone_number,
        });
      } catch {
        // The appointment was already saved successfully.
        // Saved Dog persistence must not make the appointment appear failed.
      }
    }

    closeAppointmentModal();
  };

  // Synchronizes the dashboard's selected date when the visible calendar month changes.
  const handleDashboardMonthChange = (nextMonth: Date) => {
    setDisplayedMonth(nextMonth);

    const today = new Date();
    const isCurrentMonth =
      nextMonth.getFullYear() === today.getFullYear() &&
      nextMonth.getMonth() === today.getMonth();

    setSelectedDate(
      isCurrentMonth
        ? today
        : new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1),
    );
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <h1>Dashboard</h1>
        <p>
          Overview of today's appointments, calendar, and key information.
        </p>
      </header>

      <DashboardSummary
        appointments={manager.appointments}
        todayDateKey={todayDateKey}
        monthKey={monthKey}
        isLoading={manager.isLoading}
      />

      <section className="dashboard-content" aria-label="Main dashboard content">
        <div className="dashboard-content__calendar" id="calendar">
          <DashboardMiniCalendar
            appointments={manager.appointments}
            selectedDate={selectedDate}
            displayedMonth={displayedMonth}
            onDateSelect={setSelectedDate}
            onAddAppointment={(date) => openAppointmentModal(date)}
            onMonthChange={handleDashboardMonthChange}
          />
        </div>

        <DashboardAppointments
          appointments={manager.appointments}
          selectedDate={selectedDate}
          isLoading={manager.isLoading}
          error={manager.loadError}
          onRetry={manager.reload}
          onEdit={handleEditAppointment}
          onComplete={(appointment) => void manager.complete(appointment.id)}
          onCancel={(appointment) => void manager.cancel(appointment.id)}
          onDelete={(appointment) => void manager.remove(appointment)}
          mutationType={manager.mutationType}
        />
      </section>

      {isSaving && (
        <p className="appointments-state" role="status" aria-live="polite">
          Saving...
        </p>
      )}

      {manager.successMessage && (
        <Toast
          message={manager.successMessage}
          variant="success"
          onClose={() => manager.clearFeedback()}
        />
      )}

      {manager.actionError && !showForm && (
        <Toast
          message={manager.actionError}
          variant="error"
          onClose={() => manager.clearFeedback()}
        />
      )}

      {showForm && (
        <AppointmentModal
          appointment={editingAppointment}
          initialDate={newAppointmentDate ?? undefined}
          error={manager.actionError}
          isSubmitting={isSaving}
          onSubmit={handleSubmitAppointment}
          onClose={closeAppointmentModal}
        />
      )}
    </div>
  );
}

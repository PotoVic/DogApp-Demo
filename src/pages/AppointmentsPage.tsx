/*
 * Appointments and saved-dogs workspace page.
 */

import { useState } from "react";
import { AppointmentList } from "../features/appointments/components/AppointmentList";
import { SavedDogsPanel } from "../features/savedDogs/components/SavedDogsPanel";
import { AppointmentModal } from "../components/appointments/AppointmentModal";
import { Toast } from "../components/feedback/Toast";
import { useAppointmentManager } from "../hooks/useAppointmentManager";
import type { Appointment } from "../types/appointment";
import type { AppointmentFormSubmitData } from "../features/appointments/components/AppointmentsForm";
import "../features/appointments/components/appointments.css";
import "./workspace-pages.css";
import { findOrCreateSavedDog } from "../services/savedDogs/savedDogService";

type AppointmentsSection = "appointments" | "saved-dogs";

// Appointments workspace: switches between appointments and saved dogs and coordinates the shared appointment manager.
export default function AppointmentsPage() {
  // Shared appointment data and CRUD state comes from the appointment manager hook.
  const manager = useAppointmentManager();
  // Controls whether the appointments list or saved-dogs panel is displayed.
  const [activeSection, setActiveSection] =
    useState<AppointmentsSection>("appointments");

  // Controls visibility of the appointment modal.
  const [showForm, setShowForm] = useState(false);
  // Stores the appointment currently being edited, or null for creation.
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);

  // Closes the appointment form/modal and clears the current appointment being edited.
  const closeForm = () => {
    if (manager.mutationType) return;

    setShowForm(false);
    setEditingAppointment(null);
  };

  // Creates or updates an appointment, then closes the form after a successful save.
  const handleSubmit = async ({
    appointment,
    selectedSavedDogId,
    }: AppointmentFormSubmitData) => {
    const saved = editingAppointment
      ? await manager.update(editingAppointment.id, appointment)
      : await manager.create(appointment);

    if (!saved) {
      return;
    }

    if (!editingAppointment && !selectedSavedDogId) {
      try {
        await findOrCreateSavedDog({
          name: appointment.dog_name,
          breed: appointment.breed,
          phone_number: appointment.phone_number,
        });
      } catch {
        // The appointment has already been saved successfully.
        // Saved Dog persistence should not make the appointment appear failed.
      }
    }

    closeForm();
  };

  // Opens the appointment form with an existing appointment loaded for editing.
  const handleEdit = (appointment: Appointment) => {
    if (manager.mutationType) return;

    manager.clearFeedback();
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  // Opens a blank appointment form, optionally using the selected date.
  const openNewAppointment = () => {
    manager.clearFeedback();
    setEditingAppointment(null);
    setShowForm(true);
  };

  return (
    <div className="workspace-page">
      <header className="workspace-page__header">
        <div>
          <h1>Wizyty</h1>
          <p className="workspace-page__description">
            Zarządzaj wizytami i zapisanymi psami w jednym miejscu.
          </p>
        </div>
      </header>

      <nav
        className="appointments-section-tabs"
        aria-label="Sekcje wizyt"
      >
        <button
          className={`appointments-section-tabs__button${
            activeSection === "appointments"
              ? " appointments-section-tabs__button--active"
              : ""
          }`}
          type="button"
          aria-pressed={activeSection === "appointments"}
          onClick={() => setActiveSection("appointments")}
        >
          Wizyty
        </button>

        <button
          className={`appointments-section-tabs__button${
            activeSection === "saved-dogs"
              ? " appointments-section-tabs__button--active"
              : ""
          }`}
          type="button"
          aria-pressed={activeSection === "saved-dogs"}
          onClick={() => setActiveSection("saved-dogs")}
        >
          Zapisane psy
        </button>
      </nav>

      {activeSection === "appointments" && (
        <div className="appointments-section-toolbar">
          <div>
            <h2 className="appointments-section-toolbar__title">Wizyty</h2>
            <p className="appointments-section-toolbar__description">
              Przeglądaj swoje wizyty i zarządzaj nimi.
            </p>
          </div>

          <button
            className="button-primary"
            type="button"
            onClick={openNewAppointment}
            disabled={Boolean(manager.mutationType)}
          >
            Dodaj wizytę
          </button>
        </div>
      )}

      {activeSection === "appointments" ? (
        <AppointmentList
          onEdit={handleEdit}
          onCancel={(appointment) => void manager.cancel(appointment.id)}
          onComplete={(appointment) => void manager.complete(appointment.id)}
          onDelete={(appointment) => void manager.remove(appointment)}
          mutationType={manager.mutationType}
          mutationAppointmentId={manager.mutationAppointmentId}
          appointments={manager.appointments}
          loading={manager.isLoading}
          error={manager.loadError}
          onRetry={manager.reload}
          showTitle={false}
        />
      ) : (
        <SavedDogsPanel />
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
          error={manager.actionError}
          isSubmitting={manager.mutationType === "saving"}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}
    </div>
  );
}

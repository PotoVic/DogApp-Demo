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
import {
  findOrCreateSavedDog,
  syncSavedDogFromAppointment,
  syncSelectedSavedDog,
} from "../services/savedDogs/savedDogService";

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
  // Used only to prefill a new appointment from an existing appointment.
  const [prefillAppointment, setPrefillAppointment] =
    useState<Appointment | null>(null);

  // Closes the appointment form/modal and clears the current appointment being edited.
  const closeForm = () => {
    if (manager.mutationType) return;

    setShowForm(false);
    setEditingAppointment(null);
    setPrefillAppointment(null);
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

    try {
      if (editingAppointment) {
        // Keep the reusable dog profile in sync with changes made while editing
        // an appointment. The old appointment values are used to find the profile.
        await syncSavedDogFromAppointment(
          {
            name: editingAppointment.dog_name,
            breed: editingAppointment.breed ?? undefined,
            phone_number: editingAppointment.phone_number ?? undefined,
          },
          {
            name: appointment.dog_name,
            breed: appointment.breed,
            phone_number: appointment.phone_number,
          },
        );
      } else if (selectedSavedDogId) {
        // If the form started from a saved dog, keep that profile current when
        // its details are changed before saving the new appointment.
        await syncSelectedSavedDog(selectedSavedDogId, {
          name: appointment.dog_name,
          breed: appointment.breed,
          phone_number: appointment.phone_number,
        });
      } else {
        await findOrCreateSavedDog({
          name: appointment.dog_name,
          breed: appointment.breed,
          phone_number: appointment.phone_number,
        });
      }
    } catch {
      // The appointment has already been saved successfully.
      // Saved Dog synchronization should not make the appointment appear failed.
    }

    closeForm();
  };

  // Opens the appointment form with an existing appointment loaded for editing.
  const handleEdit = (appointment: Appointment) => {
    if (manager.mutationType) return;

    manager.clearFeedback();
    setPrefillAppointment(null);
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  // Creates a new appointment using the previous visit only as defaults.
  const handleNextVisit = (appointment: Appointment) => {
    if (manager.mutationType) return;

    manager.clearFeedback();
    setEditingAppointment(null);
    setPrefillAppointment(appointment);
    setShowForm(true);
  };

  // Opens a blank appointment form, optionally using the selected date.
  const openNewAppointment = () => {
    manager.clearFeedback();
    setEditingAppointment(null);
    setPrefillAppointment(null);
    setShowForm(true);
  };

  return (
    <div className="workspace-page">
      <header className="workspace-page__header">
        <div>
          <h1>Appointments</h1>
          <p className="workspace-page__description">
            Manage appointments and saved dogs in one place.
          </p>
        </div>
      </header>

      <nav
        className="appointments-section-tabs"
        aria-label="Appointment sections"
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
          Appointments
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
          Saved dogs
        </button>
      </nav>

      {activeSection === "appointments" && (
        <div className="appointments-section-toolbar">
          <div>
            <h2 className="appointments-section-toolbar__title">Appointments</h2>
            <p className="appointments-section-toolbar__description">
              View and manage your appointments.
            </p>
          </div>

          <button
            className="button-primary"
            type="button"
            onClick={openNewAppointment}
            disabled={Boolean(manager.mutationType)}
          >
            Add appointment
          </button>
        </div>
      )}

      {activeSection === "appointments" ? (
        <AppointmentList
          onEdit={handleEdit}
          onNextVisit={handleNextVisit}
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
        <SavedDogsPanel onDogUpdated={() => void manager.reload()} />
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
          prefillAppointment={prefillAppointment}
          error={manager.actionError}
          isSubmitting={manager.mutationType === "saving"}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}
    </div>
  );
}

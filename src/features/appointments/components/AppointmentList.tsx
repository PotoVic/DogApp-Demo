/*
 * Reusable appointment list and action controls.
 */

import type { Appointment, AppointmentMutationType } from "../../../types/appointment";
import "./appointments.css";

interface AppointmentListProps {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  onEdit: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onComplete: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  mutationType?: AppointmentMutationType;
  mutationAppointmentId?: string | null;
  showTitle?: boolean;
  onRetry?: () => void;
}

// Formats an ISO date string as a readable Polish date.
function formatAppointmentDate(date: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

// Maps an appointment status to its Polish display label.
function getStatusLabel(status: Appointment["status"]): string {
  switch (status) {
    case "scheduled":
      return "Zaplanowana";
    case "completed":
      return "Zakończona";
    case "cancelled":
      return "Anulowana";
  }
}

// Reusable appointment list with loading, error, empty, and mutation states.
export function AppointmentList({
  appointments,
  loading,
  error,
  onEdit,
  onCancel,
  onComplete,
  onDelete,
  mutationType = null,
  mutationAppointmentId = null,
  showTitle = true,
  onRetry,
}: AppointmentListProps) {
  if (loading) {
    return (
      <p className="appointments-state" role="status" aria-live="polite">
        Ładowanie wizyt...
      </p>
    );
  }

  if (error) {
    return (
      <section className="appointment-list appointment-list--state" aria-live="polite">
        {showTitle && (
          <h2 className="appointment-list__title">Wizyty</h2>
        )}

        <div className="appointment-list__state" role="alert">
          <p className="appointments-state">{error}</p>
          {onRetry && (
            <button className="button-secondary" type="button" onClick={onRetry}>
              Spróbuj ponownie
            </button>
          )}
        </div>
      </section>
    );
  }

  if (appointments.length === 0) {
    return (
      <section className="appointment-list appointment-list--state">
        {showTitle && (
          <h2 className="appointment-list__title">Wizyty</h2>
        )}

        <div className="appointment-list__state">
          <p className="appointment-list__empty-title">Brak wizyt</p>
          <p className="appointments-state">
            Nie masz jeszcze żadnych zapisanych wizyt. Dodaj pierwszą wizytę, aby rozpocząć.
          </p>
        </div>
      </section>
    );
  }

  const isMutating = mutationType !== null;

  return (
    <section className="appointment-list">
      {showTitle && (
        <h2 className="appointment-list__title">Wizyty</h2>
      )}

      <ul className="appointment-list__items">
        {appointments.map((appointment) => {
          const isCurrentAppointment =
            mutationAppointmentId === appointment.id;

          const isSavingThisAppointment =
            isCurrentAppointment && mutationType === "saving";

          const isDeletingThisAppointment =
            isCurrentAppointment && mutationType === "deleting";

          return (
            <li className="appointment-card" key={appointment.id}>
              <div className="appointment-card__header">
                <div className="appointment-card__schedule">
                  <p className="appointment-card__date">
                    {formatAppointmentDate(appointment.appointment_date)}
                  </p>
                  <p className="appointment-card__time">
                    {appointment.appointment_time.slice(0, 5)}
                  </p>
                </div>

                <p className="appointment-card__status">
                  {getStatusLabel(appointment.status)}
                </p>
              </div>

              <p className="appointment-card__dog">
                {appointment.dog_name}
              </p>

              {appointment.breed && (
                <p className="appointment-card__breed">
                  {appointment.breed}
                </p>
              )}

              {appointment.phone_number && (
                <p className="appointment-card__phone">
                  {appointment.phone_number}
                </p>
              )}

              <p className="appointment-card__price">
                {appointment.price} zł
              </p>

              <div className="appointment-card__actions">
                <button
                  className="appointment-card__button"
                  type="button"
                  onClick={() => onEdit(appointment)}
                  disabled={isMutating}
                >
                  Edytuj
                </button>

                {appointment.status === "scheduled" && (
                  <>
                    <button
                      className="appointment-card__button appointment-card__button--complete"
                      type="button"
                      onClick={() => onComplete(appointment)}
                      disabled={isMutating}
                    >
                      {isSavingThisAppointment ? "Zapisywanie..." : "Zakończ"}
                    </button>

                    <button
                      className="appointment-card__button"
                      type="button"
                      onClick={() => onCancel(appointment)}
                      disabled={isMutating}
                    >
                      {isSavingThisAppointment ? "Zapisywanie..." : "Anuluj"}
                    </button>
                  </>
                )}

                <button
                  className="appointment-card__button appointment-card__button--delete"
                  type="button"
                  onClick={() => onDelete(appointment)}
                  disabled={isMutating}
                >
                  {isDeletingThisAppointment ? "Usuwanie..." : "Usuń"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

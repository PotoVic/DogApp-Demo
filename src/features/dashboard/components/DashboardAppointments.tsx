/*
 * Dashboard list for appointments on the selected day.
 */

import type { Appointment, AppointmentMutationType } from "../../../types/appointment";
import { formatCalendarDateKey } from "../../../utils/calendar";
import { formatCurrency } from "../../../utils/formatting";
import { getAppointmentsForDate } from "../../../utils/appointmentCalculations";

interface DashboardAppointmentsProps {
  appointments: Appointment[];
  selectedDate: Date;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onEdit: (appointment: Appointment) => void;
  onComplete: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  mutationType: AppointmentMutationType;
}

// Maps the database appointment status to the English UI label.
function getAppointmentStatusLabel(status: Appointment["status"]): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    case "scheduled":
    default:
      return "Scheduled";
  }
}

// Formats the appointment count with English singular/plural wording.
function formatAppointmentCount(count: number): string {
  if (count === 1) return "1 appointment";
  if (count >= 2 && count <= 4) return `${count} appointments`;
  return `${count} appointments`;
}

// Formats the selected dashboard date for the section heading.
function formatSelectedDate(date: Date): string {
  const label = new Intl.DateTimeFormat("en-SE", {
    day: "numeric",
    month: "long",
  }).format(date);

  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Displays appointments for the selected dashboard date and exposes edit/status/delete actions.
export function DashboardAppointments({
  appointments,
  selectedDate,
  isLoading,
  error,
  onRetry,
  onEdit,
  onComplete,
  onCancel,
  onDelete,
  mutationType,
}: DashboardAppointmentsProps) {
  const selectedDateAppointments = getAppointmentsForDate(
    appointments,
    selectedDate,
  );
  const todayKey = formatCalendarDateKey(new Date());
  const selectedDateKey = formatCalendarDateKey(selectedDate);
  const isToday = selectedDateKey === todayKey;
  const formattedDate = formatSelectedDate(selectedDate);

  return (
    <section
      className="dashboard-content__appointments dashboard-today"
      aria-labelledby="dashboard-today-title"
      id="appointments"
    >
      <div className="dashboard-today__header">
        <div>
          <h2 className="dashboard-section__title" id="dashboard-today-title">
            {isToday ? "Today's appointments" : `Appointments — ${formattedDate}`}
          </h2>

          {!isLoading && !error && (
            <p className="dashboard-today__count">
              {formatAppointmentCount(selectedDateAppointments.length)}
            </p>
          )}
        </div>
      </div>

      {isLoading && (
        <p className="appointments-state" role="status" aria-live="polite">
          Loading appointments...
        </p>
      )}

      {!isLoading && error && (
        <div className="dashboard-today__empty" role="alert">
          <p>{error}</p>
          <button className="button-secondary" type="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}

      {!isLoading && !error && selectedDateAppointments.length === 0 && (
        <div className="dashboard-today__empty">
          <p>
            {isToday
              ? "No appointments today."
              : `No appointments ${formattedDate.toLowerCase()}.`}
          </p>
        </div>
      )}

      {!isLoading && !error && selectedDateAppointments.length > 0 && (
        <div className="dashboard-today__list">
          {selectedDateAppointments.map((appointment) => (
            <article className="dashboard-appointment" key={appointment.id}>
              <header className="dashboard-appointment__header">
                <time
                  className="dashboard-appointment__time"
                  dateTime={appointment.appointment_time}
                >
                  {appointment.appointment_time.slice(0, 5)}
                </time>

                <span
                  className={`dashboard-appointment__status dashboard-appointment__status--${appointment.status}`}
                >
                  {getAppointmentStatusLabel(appointment.status)}
                </span>
              </header>

              <div className="dashboard-appointment__body">
                <div className="dashboard-appointment__identity">
                  <h3>{appointment.dog_name}</h3>
                  {appointment.breed && <p>{appointment.breed}</p>}
                </div>

                <p className="dashboard-appointment__price">
                  {formatCurrency(appointment.price)}
                </p>
              </div>

              {appointment.note && (
                <p className="dashboard-appointment__note">{appointment.note}</p>
              )}

              <footer className="dashboard-appointment__actions">
                <button
                  type="button"
                  onClick={() => onEdit(appointment)}
                  disabled={Boolean(mutationType)}
                >
                  Edit
                </button>

                {appointment.status === "scheduled" && (
                  <>
                    <button
                      className="dashboard-appointment__action--complete"
                      type="button"
                      onClick={() => onComplete(appointment)}
                      disabled={Boolean(mutationType)}
                    >
                      Complete
                    </button>
                    <button
                      type="button"
                      onClick={() => onCancel(appointment)}
                      disabled={Boolean(mutationType)}
                    >
                      Cancel
                    </button>
                  </>
                )}

                <button
                  className="dashboard-appointment__action--delete"
                  type="button"
                  onClick={() => onDelete(appointment)}
                  disabled={Boolean(mutationType)}
                >
                  Delete
                </button>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

/*
 * Dashboard month calendar and date navigation.
 */


import type { Appointment } from "../../../types/appointment";
import {
  formatCalendarDateKey,
  getCalendarDays,
} from "../../../utils/calendar";

interface DashboardMiniCalendarProps {
  appointments: Appointment[];
  selectedDate: Date;
  displayedMonth: Date;
  onDateSelect: (date: Date) => void;
  onAddAppointment: (date: string) => void;
  onMonthChange: (date: Date) => void;
}

// Polish weekday abbreviations displayed in the calendar header.
const weekdays = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

// Compares two Date values by calendar day rather than by time.
function isSameDate(firstDate: Date, secondDate: Date): boolean {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

// Compact monthly calendar used to navigate months and select a dashboard date.
export function DashboardMiniCalendar({
  appointments,
  selectedDate,
  displayedMonth,
  onDateSelect,
  onAddAppointment,
  onMonthChange,
}: DashboardMiniCalendarProps) {
  const monthLabel = new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    year: "numeric",
  }).format(displayedMonth);

  const formattedMonthLabel =
    monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  const calendarDays = getCalendarDays(displayedMonth);

  const selectedDateKey = formatCalendarDateKey(selectedDate);
  const selectedDateAppointments = appointments.filter(
    (appointment) => appointment.appointment_date === selectedDateKey,
  );

  const selectedDateLabel = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
  }).format(selectedDate);

  // Moves the mini calendar to the previous month.
  const handlePreviousMonth = () => {
    const nextMonth = new Date(
      displayedMonth.getFullYear(),
      displayedMonth.getMonth() - 1,
      1,
    );

    onMonthChange(nextMonth);
  };

  // Moves the mini calendar to the next month.
  const handleNextMonth = () => {
    const nextMonth = new Date(
      displayedMonth.getFullYear(),
      displayedMonth.getMonth() + 1,
      1,
    );

    onMonthChange(nextMonth);
  };

  // Selects a calendar day and notifies the dashboard.
  const handleDateSelect = (date: Date) => {
    onDateSelect(date);

    // If the user selects a day from the adjacent month, move the calendar
    // to that month so the selected date remains visible in its proper context.
    if (
      date.getFullYear() !== displayedMonth.getFullYear() ||
      date.getMonth() !== displayedMonth.getMonth()
    ) {
      onMonthChange(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  return (
    <section
      className="dashboard-mini-calendar"
      aria-labelledby="dashboard-mini-calendar-title"
    >
      <header className="dashboard-mini-calendar__header">
        <h2
          className="dashboard-section__title"
          id="dashboard-mini-calendar-title"
        >
          Kalendarz
        </h2>

        <div className="dashboard-mini-calendar__navigation">
          <button
            className="dashboard-mini-calendar__navigation-button"
            type="button"
            onClick={handlePreviousMonth}
            aria-label="Poprzedni miesiąc"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m15 18-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <p className="dashboard-mini-calendar__month" aria-live="polite">
            {formattedMonthLabel}
          </p>

          <button
            className="dashboard-mini-calendar__navigation-button"
            type="button"
            onClick={handleNextMonth}
            aria-label="Następny miesiąc"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="m9 18 6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      <div className="dashboard-mini-calendar__grid">
        <div className="dashboard-mini-calendar__weekdays" aria-hidden="true">
          {weekdays.map((weekday) => (
            <span key={weekday}>{weekday}</span>
          ))}
        </div>

        <div className="dashboard-mini-calendar__days">
          {calendarDays.map((calendarDay) => {
            const dateKey = formatCalendarDateKey(calendarDay.date);
            const hasAppointments = appointments.some(
              (appointment) => appointment.appointment_date === dateKey,
            );
            const isSelected = isSameDate(calendarDay.date, selectedDate);

            const className = [
              "dashboard-mini-calendar__day",
              !calendarDay.isCurrentMonth &&
                "dashboard-mini-calendar__day--outside-month",
              calendarDay.isToday && "dashboard-mini-calendar__day--today",
              isSelected && "dashboard-mini-calendar__day--selected",
            ]
              .filter(Boolean)
              .join(" ");

            const dateLabel = new Intl.DateTimeFormat("pl-PL", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(calendarDay.date);

            return (
              <button
                className={className}
                type="button"
                key={calendarDay.date.getTime()}
                onClick={() => handleDateSelect(calendarDay.date)}
                aria-label={`${dateLabel}${calendarDay.isToday ? ", dzisiaj" : ""}${hasAppointments ? ", są wizyty" : ""}${isSelected ? ", wybrano" : ""}`}
                aria-current={calendarDay.isToday ? "date" : undefined}
              >
                <span className="dashboard-mini-calendar__day-number">
                  {calendarDay.date.getDate()}
                </span>
                {hasAppointments && (
                  <span
                    className="dashboard-mini-calendar__appointment-indicator"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="dashboard-mini-calendar__selected-date">
        <div>
          <p className="dashboard-mini-calendar__selected-label">
            Wybrano
          </p>
          <p className="dashboard-mini-calendar__selected-date-title">
            {selectedDateLabel}
          </p>
          <p className="dashboard-mini-calendar__selected-count">
            {selectedDateAppointments.length === 0
              ? "Brak wizyt"
              : `${selectedDateAppointments.length} ${selectedDateAppointments.length === 1 ? "Wizyta" : selectedDateAppointments.length >= 2 && selectedDateAppointments.length <= 4 ? "Wizyty" : "Wizyt"}`}
          </p>
        </div>

        <button
          className="button-primary dashboard-mini-calendar__add-button"
          type="button"
          onClick={() => onAddAppointment(selectedDateKey)}
        >
          Dodaj wizytę
        </button>
      </div>
    </section>
  );
}

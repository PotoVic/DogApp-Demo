/*
 * Reusable appointment list, filtering, and action controls.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import arrowDownIcon from "../../../assets/arrow-down.svg";
import type {
  Appointment,
  AppointmentMutationType,
} from "../../../types/appointment";
import { formatCalendarDateKey } from "../../../utils/calendar";
import "./appointments.css";

interface AppointmentListProps {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  onEdit: (appointment: Appointment) => void;
  onNextVisit: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onComplete: (appointment: Appointment) => void;
  onDelete: (appointment: Appointment) => void;
  mutationType?: AppointmentMutationType;
  mutationAppointmentId?: string | null;
  showTitle?: boolean;
  onRetry?: () => void;
}

type AppointmentFilter = "upcoming" | "history";

// Formats an ISO date string as a readable English date.
function formatAppointmentDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

// Maps an appointment status to its English display label.
function getStatusLabel(status: Appointment["status"]): string {
  switch (status) {
    case "scheduled":
      return "Scheduled";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
  }
}

// Sorts appointments chronologically by date and time.
function sortAppointments(
  appointments: Appointment[],
  direction: "asc" | "desc",
): Appointment[] {
  return [...appointments].sort((first, second) => {
    const firstKey = `${first.appointment_date}T${first.appointment_time}`;
    const secondKey = `${second.appointment_date}T${second.appointment_time}`;

    return direction === "asc"
      ? firstKey.localeCompare(secondKey)
      : secondKey.localeCompare(firstKey);
  });
}

// Reusable appointment list with filtering, loading, error, empty, and mutation states.
export function AppointmentList({
  appointments,
  loading,
  error,
  onEdit,
  onNextVisit,
  onCancel,
  onComplete,
  onDelete,
  mutationType = null,
  mutationAppointmentId = null,
  showTitle = true,
  onRetry,
}: AppointmentListProps) {
  const isMutating = mutationType !== null;

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // "Upcoming" is the most useful default view for daily use.
  const [activeFilter, setActiveFilter] =
    useState<AppointmentFilter>("upcoming");

  // Controls whether the appointment filter dropdown is open.
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const filterDropdownRef = useRef<HTMLDivElement | null>(null);

  // References to the two filter options so keyboard navigation
  // can move focus between them.
  const filterOptionRefs = useRef<
    Record<AppointmentFilter, HTMLButtonElement | null>
  >({
    upcoming: null,
    history: null,
  });

  // The current day is calculated when the list is rendered so "Upcoming"
  // stays correct when the app remains open across midnight.
  const todayKey = formatCalendarDateKey(new Date());

  // Applies the selected view and keeps each view predictably ordered.
  const filteredAppointments = useMemo(() => {
    if (activeFilter === "upcoming") {
      return sortAppointments(
        appointments.filter(
          (appointment) =>
            appointment.status === "scheduled" &&
            appointment.appointment_date >= todayKey,
        ),
        "asc",
      );
    }

    return sortAppointments(
      appointments.filter(
        (appointment) =>
          appointment.status === "completed" ||
          appointment.status === "cancelled" ||
          appointment.appointment_date < todayKey,
      ),
      "desc",
    );
  }, [activeFilter, appointments, todayKey]);

  // Counts are calculated from the complete appointment collection so the
  // filter dropdown tells the user how much data each view contains.
  const filterCounts = useMemo(() => {
    const upcoming = appointments.filter(
      (appointment) =>
        appointment.status === "scheduled" &&
        appointment.appointment_date >= todayKey,
    ).length;

    const history = appointments.filter(
      (appointment) =>
        appointment.status === "completed" ||
        appointment.status === "cancelled" ||
        appointment.appointment_date < todayKey,
    ).length;

    return {
      upcoming,
      history,
    };
  }, [appointments, todayKey]);

  const filterOptions: Array<{
    value: AppointmentFilter;
    label: string;
    count: number;
  }> = [
    {
      value: "upcoming",
      label: "Upcoming",
      count: filterCounts.upcoming,
    },
    {
      value: "history",
      label: "Completed",
      count: filterCounts.history,
    },
  ];

  // Changes the active filter and closes the dropdown.
  const selectFilter = (filter: AppointmentFilter) => {
    setActiveFilter(filter);
    setIsFilterDropdownOpen(false);
  };

  // Handles keyboard interaction on the main filter trigger.
  const handleFilterTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " " ||
      event.key === "ArrowDown"
    ) {
      event.preventDefault();

      setIsFilterDropdownOpen(true);

      requestAnimationFrame(() => {
        filterOptionRefs.current[activeFilter]?.focus();
      });

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setIsFilterDropdownOpen(true);

      requestAnimationFrame(() => {
        filterOptionRefs.current.history?.focus();
      });
    }
  };

  // Handles keyboard interaction while an option is focused.
  const handleFilterOptionKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    value: AppointmentFilter,
  ) => {
    const currentIndex = filterOptions.findIndex(
      (option) => option.value === value,
    );

    // Escape closes the dropdown and returns focus to the trigger.
    if (event.key === "Escape") {
      event.preventDefault();

      setIsFilterDropdownOpen(false);

      filterDropdownRef.current
        ?.querySelector<HTMLButtonElement>(
          ".appointment-list__filter-trigger",
        )
        ?.focus();

      return;
    }

    // Enter / Space selects the focused option.
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      selectFilter(value);

      requestAnimationFrame(() => {
        filterDropdownRef.current
          ?.querySelector<HTMLButtonElement>(
            ".appointment-list__filter-trigger",
          )
          ?.focus();
      });

      return;
    }

    // ArrowDown moves to the next option.
    if (
      event.key === "ArrowDown" &&
      currentIndex < filterOptions.length - 1
    ) {
      event.preventDefault();

      filterOptionRefs.current[
        filterOptions[currentIndex + 1].value
      ]?.focus();

      return;
    }

    // ArrowUp moves to the previous option.
    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (currentIndex > 0) {
        filterOptionRefs.current[
          filterOptions[currentIndex - 1].value
        ]?.focus();
      } else {
        setIsFilterDropdownOpen(false);

        filterDropdownRef.current
          ?.querySelector<HTMLButtonElement>(
            ".appointment-list__filter-trigger",
          )
          ?.focus();
      }

      return;
    }

    // Home moves to the first option.
    if (event.key === "Home") {
      event.preventDefault();

      filterOptionRefs.current[filterOptions[0].value]?.focus();

      return;
    }

    // End moves to the last option.
    if (event.key === "End") {
      event.preventDefault();

      filterOptionRefs.current[
        filterOptions[filterOptions.length - 1].value
      ]?.focus();
    }

    /*
     * IMPORTANT:
     *
     * We intentionally do NOT prevent the Tab key here.
     *
     * This allows normal browser keyboard navigation:
     *
     * Trigger
     *   ↓ Tab
     * Upcoming
     *   ↓ Tab
     * History
     *   ↓ Tab
     * Next focusable element
     *
     * Shift + Tab works in the opposite direction.
     */
  };

  // Closes the overflow menu or filter dropdown when the user
  // clicks/taps outside of the currently open component.
  useEffect(() => {
    if (!openMenuId && !isFilterDropdownOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      if (openMenuId && !target.closest(".appointment-card__menu")) {
        setOpenMenuId(null);
      }

      if (
        isFilterDropdownOpen &&
        !target.closest(".appointment-list__filter-dropdown")
      ) {
        setIsFilterDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (openMenuId) {
          setOpenMenuId(null);
        }

        if (isFilterDropdownOpen) {
          setIsFilterDropdownOpen(false);

          filterDropdownRef.current
            ?.querySelector<HTMLButtonElement>(
              ".appointment-list__filter-trigger",
            )
            ?.focus();
        }
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuId, isFilterDropdownOpen]);

  if (loading) {
    return (
      <p className="appointments-state" role="status" aria-live="polite">
        Loading appointments...
      </p>
    );
  }

  if (error) {
    return (
      <section
        className="appointment-list appointment-list--state"
        aria-live="polite"
      >
        {showTitle && (
          <h2 className="appointment-list__title">Appointments</h2>
        )}

        <div className="appointment-list__state" role="alert">
          <p className="appointments-state">{error}</p>

          {onRetry && (
            <button
              className="button-secondary"
              type="button"
              onClick={onRetry}
            >
              Try again
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="appointment-list">
      {showTitle && (
        <h2 className="appointment-list__title">Appointments</h2>
      )}

      {appointments.length > 0 && (
        <div className="appointment-list__filters">
          <span className="appointment-list__filter-label">
            Show:
          </span>

          <div
            ref={filterDropdownRef}
            className="appointment-list__filter-dropdown"
          >
            <button
              className="appointment-list__filter-trigger"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isFilterDropdownOpen}
              aria-controls="appointment-filter-options"
              onClick={() =>
                setIsFilterDropdownOpen((isOpen) => !isOpen)
              }
              onKeyDown={handleFilterTriggerKeyDown}
            >
              <span>
                {
                  filterOptions.find(
                    (option) => option.value === activeFilter,
                  )?.label
                }{" "}
                (
                {
                  filterOptions.find(
                    (option) => option.value === activeFilter,
                  )?.count
                }
                )
              </span>

              <img
                className={`appointment-list__filter-chevron${
                  isFilterDropdownOpen
                    ? " appointment-list__filter-chevron--open"
                    : ""
                }`}
                src={arrowDownIcon}
                alt=""
                aria-hidden="true"
              />
            </button>

            {isFilterDropdownOpen && (
              <ul
                id="appointment-filter-options"
                className="appointment-list__filter-options"
                role="listbox"
                aria-label="Choose appointment view"
              >
                {filterOptions.map((option) => (
                  <li key={option.value} role="presentation">
                    <button
                      ref={(element) => {
                        filterOptionRefs.current[option.value] = element;
                      }}
                      className={`appointment-list__filter-option${
                        activeFilter === option.value
                          ? " appointment-list__filter-option--active"
                          : ""
                      }`}
                      type="button"
                      role="option"
                      aria-selected={activeFilter === option.value}
                      /*
                       * Both options are tabbable.
                       *
                       * This is intentional. It means:
                       * Tab -> Upcoming -> Tab -> History
                       *
                       * instead of Tab skipping History.
                       */
                      tabIndex={0}
                      onClick={() => selectFilter(option.value)}
                      onKeyDown={(event) =>
                        handleFilterOptionKeyDown(event, option.value)
                      }
                    >
                      <span>
                        {option.label} ({option.count})
                      </span>

                      {activeFilter === option.value && (
                        <span aria-hidden="true">✓</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {filteredAppointments.length === 0 ? (
        <div className="appointment-list__state">
          <p className="appointment-list__empty-title">
            {activeFilter === "upcoming"
              ? "No upcoming appointments"
              : "No appointment history"}
          </p>

          <p className="appointments-state">
            {activeFilter === "upcoming"
              ? "You currently have no upcoming appointments."
              : "You do not have any completed or cancelled appointments yet."}
          </p>
        </div>
      ) : (
        <ul className="appointment-list__items">
          {filteredAppointments.map((appointment) => {
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
                      {formatAppointmentDate(
                        appointment.appointment_date,
                      )}
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
                  {appointment.price} kr
                </p>

                <div className="appointment-card__actions">
                  <button
                    className="appointment-card__button appointment-card__button--next"
                    type="button"
                    onClick={() => onNextVisit(appointment)}
                    disabled={isMutating}
                  >
                    Next appointment
                  </button>

                  <div className="appointment-card__menu">
                    <button
                      className="appointment-card__menu-trigger"
                      type="button"
                      aria-label={`More options for appointment for dog ${appointment.dog_name}`}
                      aria-expanded={openMenuId === appointment.id}
                      onClick={() =>
                        setOpenMenuId((current) =>
                          current === appointment.id
                            ? null
                            : appointment.id,
                        )
                      }
                      disabled={isMutating}
                    >
                      <span aria-hidden="true">•••</span>
                    </button>

                    {openMenuId === appointment.id && (
                      <div className="appointment-card__menu-content">
                        <button
                          className="appointment-card__menu-item"
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onEdit(appointment);
                          }}
                          disabled={isMutating}
                        >
                          Edit
                        </button>

                        {appointment.status === "scheduled" && (
                          <>
                            <button
                              className="appointment-card__menu-item appointment-card__menu-item--complete"
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onComplete(appointment);
                              }}
                              disabled={isMutating}
                            >
                              {isSavingThisAppointment
                                ? "Saving..."
                                : "Complete"}
                            </button>

                            <button
                              className="appointment-card__menu-item appointment-card__menu-item--cancel"
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                onCancel(appointment);
                              }}
                              disabled={isMutating}
                            >
                              {isSavingThisAppointment
                                ? "Saving..."
                                : "Cancel"}
                            </button>
                          </>
                        )}

                        <button
                          className="appointment-card__menu-item appointment-card__menu-item--delete"
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            onDelete(appointment);
                          }}
                          disabled={isMutating}
                        >
                          {isDeletingThisAppointment
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
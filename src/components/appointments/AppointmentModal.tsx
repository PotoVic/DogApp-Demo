/*
 * Reusable accessible appointment modal wrapper.
 */

import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { AppointmentForm } from "../../features/appointments/components/AppointmentsForm";
import type { Appointment } from "../../types/appointment";
import type { AppointmentFormSubmitData } from "../../features/appointments/components/AppointmentsForm";
import "./appointment-modal.css";

interface AppointmentModalProps {
  appointment?: Appointment | null;
  initialDate?: string;
  error?: string | null;
  isSubmitting?: boolean;
  onSubmit: (data: AppointmentFormSubmitData) => void;
  onClose: () => void;
}

// Reusable modal wrapper for creating or editing an appointment.
export function AppointmentModal({
  appointment = null,
  initialDate,
  error = null,
  isSubmitting = false,
  onSubmit,
  onClose,
}: AppointmentModalProps) {
  // Remembers the element that opened the modal so focus can be restored on close.
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocusedElement.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timeoutId = window.setTimeout(() => {
      document.getElementById("dog_name")?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      document.body.style.overflow = originalOverflow;
      previouslyFocusedElement.current?.focus();
    };
  }, []);

  // Keeps keyboard focus inside the modal and supports Escape-to-close.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (!isSubmitting) onClose();
      return;
    }

    if (event.key !== "Tab") return;

    const focusableElements = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    );

    if (focusableElements.length === 0) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  // Closes the modal only when the backdrop itself is clicked.
  const handleBackdropMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  return (
    <div
      className="appointment-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-modal-title"
      aria-describedby={error ? "appointment-modal-error" : undefined}
      onKeyDown={handleKeyDown}
      onMouseDown={handleBackdropMouseDown}
    >
      <div className="appointment-modal__content">
        <header className="appointment-modal__header">
          <div>
            <p className="appointment-modal__eyebrow">
              {appointment ? "Manage appointment" : "New appointment"}
            </p>
            <h2
              className="appointment-modal__title"
              id="appointment-modal-title"
            >
              {appointment ? "Edit appointment" : "Add appointment"}
            </h2>
          </div>

          <button
            className="appointment-modal__close"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close form"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        {error && (
          <p
            className="appointment-form__error"
            id="appointment-modal-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <AppointmentForm
          key={`${appointment?.id ?? "new"}-${initialDate ?? ""}`}
          appointment={appointment ?? undefined}
          initialDate={initialDate}
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}

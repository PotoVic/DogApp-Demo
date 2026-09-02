/*
 * Reusable temporary success/error feedback component.
 */

import { useEffect, useState } from "react";
import "./toast.css";

type ToastVariant = "success" | "error";

type ToastProps = {
  message: string;
  variant?: ToastVariant;
  onClose: () => void;
};

const TOAST_DURATION = 4000;
const TOAST_EXIT_DURATION = 280;

// Temporary feedback message that automatically exits after a short delay.
export function Toast({
  message,
  variant = "success",
  onClose,
}: ToastProps) {
  // Tracks the short exit animation before the toast is removed.
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = window.setTimeout(() => {
      setIsExiting(true);
    }, TOAST_DURATION);

    return () => {
      window.clearTimeout(exitTimer);
    };
  }, []);

  useEffect(() => {
    if (!isExiting) {
      return;
    }

    const closeTimer = window.setTimeout(onClose, TOAST_EXIT_DURATION);

    return () => {
      window.clearTimeout(closeTimer);
    };
  }, [isExiting, onClose]);

  // Starts the toast exit animation and then calls the parent's close callback.
  const handleClose = () => {
    setIsExiting(true);
  };

  return (
    <div
      className={`toast toast--${variant}${isExiting ? " toast--exiting" : ""}`}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      <span className="toast__indicator" aria-hidden="true" />
      <p className="toast__message">{message}</p>
      <button
        className="toast__close"
        type="button"
        onClick={handleClose}
        aria-label="Close notification"
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
    </div>
  );
}

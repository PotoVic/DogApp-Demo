/*
 * Monthly reports page and PDF generation controls.
 */

import { useEffect, useMemo, useState } from "react";
import "./Reports.css";
import { getAppointments } from "../services/appointments/appointmentService";
import type { Appointment } from "../types/appointment";
import {
  getMonthlyAppointments,
  getMonthlyEarnings,
} from "../utils/appointmentCalculations";
import { formatCurrency } from "../utils/formatting";

// Returns the current calendar month as the initial report selection.
const getCurrentMonth = () => {
  const today = new Date();

  return {
    year: today.getFullYear(),
    month: today.getMonth(),
  };
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Builds the YYYY-MM key used to select appointments for a month.
const getMonthKey = (year: number, month: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}`;

// Reports page: loads appointments, lets the user switch months, and generates a monthly PDF.
export default function Reports() {
  // Tracks which month is currently displayed in the report.
  const [{ year, month }, setSelectedMonth] = useState(getCurrentMonth);
  // Stores appointments loaded for the report view.
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  // Tracks the initial appointment-loading state.
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  // Stores appointments loaded for the report view.
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    // Loads the current user's appointments for the report view.
    const loadAppointments = async () => {
      try {
        setIsLoadingAppointments(true);
        setAppointmentsError(null);

        const loadedAppointments = await getAppointments();

        if (!isMounted) {
          return;
        }

        setAppointments(loadedAppointments);
      } catch {
        if (!isMounted) {
          return;
        }

        setAppointmentsError("Unable to load appointments. Please try again.");
      } finally {
        if (isMounted) {
          setIsLoadingAppointments(false);
        }
      }
    };

    void loadAppointments();

    return () => {
      isMounted = false;
    };
  }, []);

  // Moves the report view forward or backward by the requested number of months.
  const changeMonth = (offset: number) => {
    const nextMonth = new Date(year, month + offset, 1);

    setSelectedMonth({
      year: nextMonth.getFullYear(),
      month: nextMonth.getMonth(),
    });
  };

  const monthKey = getMonthKey(year, month);

  // Memoized list of appointments belonging to the selected month.
  const monthlyAppointments = useMemo(
    () => getMonthlyAppointments(appointments, monthKey),
    [appointments, monthKey],
  );

  // Memoized total of completed appointment earnings for the selected month.
  const monthlyEarnings = useMemo(
    () => getMonthlyEarnings(appointments, monthKey),
    [appointments, monthKey],
  );

  return (
    <section className="reports-page" aria-labelledby="reports-title">
      <header className="reports-page__header">
        <h1 id="reports-title">Reports</h1>
        <p>Generate a monthly report of your appointments.</p>
      </header>

      <div className="reports-page__workspace">
        <div className="reports-page__card">
          <div className="reports-page__card-header">
            <h2>Monthly report</h2>
            <p>Select the month for which you want to generate a PDF report.</p>
          </div>

          <div className="reports-page__month-selector">
            <span className="reports-page__label">Select month</span>

            <div className="reports-page__month-navigation">
              <button
                type="button"
                className="reports-page__month-arrow"
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="m15 18-6-6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="reports-page__selected-month" aria-live="polite">
                <span className="reports-page__month-name">
                  {MONTH_NAMES[month]}
                </span>
                <span className="reports-page__month-year">{year}</span>
              </div>

              <button
                type="button"
                className="reports-page__month-arrow"
                onClick={() => changeMonth(1)}
                aria-label="Next month"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="m9 18 6-6-6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>

          {appointmentsError && (
            <p className="reports-page__error" role="alert">
              {appointmentsError}
            </p>
          )}

          <button
            type="button"
            className="reports-page__generate-button"
            disabled={isLoadingAppointments || monthlyAppointments.length === 0}
            onClick={async () => {
              const { generateMonthlyReport } =
                await import("../utils/generateMonthlyReport");

              await generateMonthlyReport({
                appointments: monthlyAppointments,
                year,
                month,
                monthlyEarnings,
              });
            }}
          >
            Generate PDF
          </button>
        </div>

        <div className="reports-page__details-card">
          <div className="reports-page__details-header">
            <div>
              <h2>
                Report for {MONTH_NAMES[month]} {year}
              </h2>

              <p>
                {isLoadingAppointments
                  ? "Loading data..."
                  : `${monthlyAppointments.length} ${
                      monthlyAppointments.length === 0
                        ? "appointments"
                        : monthlyAppointments.length === 1
                          ? "appointment"
                          : monthlyAppointments.length >= 2 &&
                              monthlyAppointments.length <= 4
                            ? "appointments"
                            : "appointments"
                    } · ${formatCurrency(monthlyEarnings)}`}
              </p>
            </div>
          </div>

          <div className="reports-page__included">
            <h3>The PDF report will include:</h3>

            <ul className="reports-page__included-list">
              <li>All appointments from the selected month</li>
              <li>Date and time</li>
              <li>Dog name</li>
              <li>Breed, if provided</li>
              <li>Appointment price</li>
              <li>Appointment status</li>
            </ul>
          </div>

          <p className="reports-page__pdf-note">
            The report will be saved as a PDF file that you can later
            print or keep on your device.
          </p>
        </div>
      </div>
    </section>
  );
}

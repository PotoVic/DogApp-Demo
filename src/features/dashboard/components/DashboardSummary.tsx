/*
 * Dashboard KPI/summary cards.
 */

import type { Appointment } from "../../../types/appointment";
import {
  getAppointmentCount,
  getDailyEarnings,
  getMonthlyEarnings,
} from "../../../utils/appointmentCalculations";

interface DashboardSummaryProps {
  appointments: Appointment[];
  todayDateKey: string;
  monthKey: string;
  isLoading: boolean;
}

import { formatCurrency } from "../../../utils/formatting";

// Displays daily earnings plus appointment count and earnings for the visible month.
export function DashboardSummary({
  appointments,
  todayDateKey,
  monthKey,
  isLoading,
}: DashboardSummaryProps) {
  const todayEarnings = getDailyEarnings(appointments, todayDateKey);
  const monthlyEarnings = getMonthlyEarnings(appointments, monthKey);
  const monthlyAppointmentCount = getAppointmentCount(appointments, monthKey);

  return (
    <section
      className="dashboard-summary"
      aria-label="Podsumowanie"
    >
      <div className="dashboard-summary__grid">
        <article className="dashboard-summary__card">
          <h3>Dzisiejszy zarobek</h3>
          <p
            aria-label={`Dzisiejszy zarobek: ${formatCurrency(todayEarnings)}`}
          >
            {isLoading ? "—" : formatCurrency(todayEarnings)}
          </p>
        </article>

        <article className="dashboard-summary__card">
          <h3>Zarobek w tym miesiącu</h3>
          <p
            aria-label={`Zarobek w tym miesiącu: ${formatCurrency(monthlyEarnings)}`}
          >
            {isLoading ? "—" : formatCurrency(monthlyEarnings)}
          </p>
        </article>

        <article className="dashboard-summary__card">
          <h3>Liczba wizyt</h3>
          <p aria-label={`Liczba wizyt w tym miesiącu: ${monthlyAppointmentCount}`}>
            {isLoading ? "—" : monthlyAppointmentCount}
          </p>
        </article>
      </div>
    </section>
  );
}

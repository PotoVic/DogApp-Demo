/*
 * Calendar-grid generation and date-key helpers.
 */

// Internal calendar-cell model containing the date and month/today flags.
interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Generates the days required to render a Monday-first monthly calendar.
 *
 * The returned array contains complete weeks, so dates from the previous
 * and next month may be included at the beginning/end of the grid.
 */
export function getCalendarDays(displayedMonth: Date): CalendarDay[] {
  const year = displayedMonth.getFullYear();
  const month = displayedMonth.getMonth();
  const today = new Date();

  const firstDayOfMonth = new Date(year, month, 1);

  // JavaScript: Sunday = 0, Monday = 1, ..., Saturday = 6
  // Calendar: Monday = 0, Tuesday = 1, ..., Sunday = 6
  const firstDayOffset = (firstDayOfMonth.getDay() + 6) % 7;

  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  const totalCells =
    Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;

  const days: CalendarDay[] = [];

  for (let index = 0; index < totalCells; index++) {
    const dayOffset = index - firstDayOffset;
    const date = new Date(year, month, dayOffset + 1);

    const isCurrentMonth =
      date.getFullYear() === year &&
      date.getMonth() === month;

    const isToday =
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();

    days.push({
      date,
      isCurrentMonth,
      isToday,
    });
  }

  return days;
}

// Converts a Date to the database-compatible YYYY-MM-DD calendar key.
export function formatCalendarDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

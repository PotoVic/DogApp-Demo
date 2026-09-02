import { describe, expect, it } from "vitest";
import { getCalendarDays, formatCalendarDateKey } from "../src/utils/calendar";

describe("calendar utilities", () => {
  it("generates complete Monday-first weeks", () => {
    for (let month = 0; month < 12; month++) {
      const days = getCalendarDays(new Date(2026, month, 15));
      expect(days.length % 7).toBe(0);
      expect(days.length).toBeGreaterThanOrEqual(28);
      expect(days.length).toBeLessThanOrEqual(42);
      expect(days[0].date.getDay()).toBe(1);
    }
  });

  it("contains exactly the selected month's days", () => {
    for (let month = 0; month < 12; month++) {
      const days = getCalendarDays(new Date(2026, month, 15));
      const current = days.filter((day) => day.isCurrentMonth);
      expect(current).toHaveLength(new Date(2026, month + 1, 0).getDate());
    }
  });

  it("keeps dates chronological", () => {
    const days = getCalendarDays(new Date(2026, 7, 15));
    for (let i = 1; i < days.length; i++) {
      expect(days[i].date.getTime()).toBeGreaterThan(days[i - 1].date.getTime());
    }
  });

  it("marks today correctly", () => {
    const today = new Date();
    const days = getCalendarDays(today);
    const marked = days.filter((day) => day.isToday);
    expect(marked).toHaveLength(1);
    expect(marked[0].date.getDate()).toBe(today.getDate());
  });

  it("formats calendar date keys", () => {
    expect(formatCalendarDateKey(new Date(2026, 0, 3))).toBe("2026-01-03");
    expect(formatCalendarDateKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

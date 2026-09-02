# SpaKalendar — Stage 08: Monthly PDF Reports

## Status

**Complete and verified**

**Previous Stage:** Stage 07 — PWA — Complete

**Next Stage:** Stage 09 — Saved Dogs & Appointment History

**Completed:** 2026-08-27

---

## 1. Purpose

Stage 08 adds a reliable monthly PDF reporting workflow without introducing a second data source or changing the existing appointment architecture.

The report is generated from the authenticated appointment data already used by SpaKalendar.

---

## 2. Scope Completed

Implemented:

- Dedicated Reports route.
- Polish monthly report UI.
- Custom month selection/navigation.
- Monthly appointment count.
- Monthly earnings.
- Client-side PDF generation with jsPDF.
- A4 portrait format.
- Embedded DejaVu Sans fonts for Polish characters.
- Minimal print-oriented PDF header.
- Appointment table.
- Polish date, price, and status formatting.
- Sorting by appointment date and time.
- Automatic A4 pagination.
- Repeated table headers on new pages.
- Page numbers.
- Long text wrapping for dog/breed fields.
- Direct browser download.
- Dynamic import of the PDF generator.
- PDF button loading/disabled behavior and visual states.

---

## 3. PDF Contents

The PDF contains:

- Report title.
- Selected month and year.
- Report date range.
- Appointment count.
- Monthly earnings.
- Appointment date.
- Appointment time.
- Dog name.
- Breed when available.
- Price.
- Appointment status.
- Page number.

Appointment notes are intentionally excluded.

---

## 4. Sorting

Appointments are sorted before rendering:

```text
appointment_date ASC
        ↓
apppointment_time ASC
```

The stored `YYYY-MM-DD` date strings are compared directly, avoiding unnecessary JavaScript `Date` timezone conversions.

---

## 5. Pagination

The PDF uses A4 page dimensions and checks the remaining vertical space before drawing each appointment row.

When a row would exceed the available content area:

1. Draw the current page number.
2. Create a new A4 page.
3. Draw the table header again.
4. Reset the appointment row font to normal.
5. Continue rendering.

This was verified with approximately 200 appointments.

---

## 6. Performance / Code Splitting

The Reports page dynamically imports `generateMonthlyReport.ts` when the user clicks **Generuj PDF**.

This keeps PDF-specific code and dependencies out of the initial application bundle until they are actually needed.

---

## 7. Database Impact

**None.**

No tables, columns, indexes, or report storage were introduced.

The existing `appointments` table remains the source of truth.

---

## 8. Security

PDF reporting does not create a new authorization system. It consumes appointment records already obtained through the authenticated application.

No service-role key, privileged credential, or server-side PDF endpoint was introduced.

The generated PDF is stored/downloaded on the user's device rather than persisted by SpaKalendar.

---

## 9. Verification

Verified:

- Normal monthly report generation.
- Polish characters.
- Correct monthly count and earnings.
- Date/time ordering.
- Multiple A4 pages.
- Repeated page headers.
- Page numbers.
- Approximately 200 appointments.
- Empty-month disabled generation state.
- Month switching.
- Responsive Reports UI.
- Production TypeScript/Vite build.

The known Chrome console Web Vitals error observed during development is not treated as an application defect because the application source does not load `web-vitals`, the error was not reproduced in Firefox, and the application's build and PDF workflow remain functional.

---

## 10. Stage 08 Rules Confirmed

- Existing appointments remain the source of truth.
- Reporting is read-only.
- No report database.
- No duplicate earnings model.
- No authentication/RLS bypass.
- No appointment notes in PDF.
- No PDF preview system.
- User prints the downloaded PDF independently.

---

## 11. Final Result

Stage 08 is complete. The user can select a month and generate a clean, printable monthly A4 report containing the relevant appointment and earnings information, including long reports that span multiple pages.

The next development stage is **Stage 09 — Saved Dogs**.

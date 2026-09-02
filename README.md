# DogCalendar

DogCalendar is a responsive appointment-management PWA for a dog groomer. The UI is primarily Polish and is designed around fast, simple daily appointment management.

## Current status

- Stage 01 — Foundation: Complete
- Stage 02 — Authentication & Authorization: Complete
- Stage 03 — Appointments: Complete
- Stage 04 — Calendar: Complete
- Stage 05 — Dashboard: Complete
- Stage 06 — UI/UX Polish: Complete
- Stage 07 — PWA: Complete
- Stage 08 — Monthly PDF Reports: Complete
- Stage 09 — Saved Dogs & Appointment History: **Complete**

## Stage 09 result

Saved Dogs are now a reusable part of the appointment workflow.

Implemented:

- Saved Dog CRUD.
- `saved_dogs.id` as the Saved Dog identity.
- `user_id` ownership.
- Saved Dog selection from the appointment form.
- Automatic reuse/creation without an extra confirmation step.
- Name, breed, and optional phone number.
- Polish phone formatting such as `323 232 232`.
- Saved Dog management inside the existing `Wizyty` area.
- Internal `Wizyty / Zapisane psy` navigation.
- Responsive Saved Dogs UI.
- Accessible Saved Dog edit/close controls.
- Historical appointments remain independent of Saved Dog edits/deletions.
- Saved Dog RLS verified with multiple users.

### Deliberate scope decision

Wizyty search/filtering is **not part of the final Stage 09 scope**. Dog-name search, breed search, year/month/status filters, result counts, and mobile filter UI were evaluated as optional future work and removed from the Stage 09 definition of done.

## Primary navigation

```text
Pulpit
Wizyty
Raporty
```

Mobile keeps three bottom-navigation items.

Inside `Wizyty`:

```text
Wizyty | Zapisane psy
```

Saved Dogs are intentionally not a fourth primary navigation item.

## Technology

- React
- TypeScript
- Vite
- CSS
- Supabase
- PostgreSQL
- Supabase Auth
- PostgreSQL RLS
- vite-plugin-pwa
- jsPDF

## Core data rule

Appointments remain the historical source of truth.

Saved Dogs are reusable current profile/contact information. Editing or deleting a Saved Dog must never rewrite or delete historical appointments.

## Security

Supabase Auth identifies the user. PostgreSQL RLS authorizes access.

The browser must never contain privileged Supabase credentials.

## Development

Run the project's normal commands, including:

```bash
npm run lint
npm run build
```

where configured.

**Last Updated:** 2026-09-02


## Current code architecture

The application source has been refactored to keep page components focused on
composition and feature coordination.

The Dashboard is split into:

```text
AppHome
├── DashboardSummary
├── DashboardMiniCalendar
├── DashboardAppointments
└── AppointmentModal
       ↓
useAppointmentManager
       ↓
appointmentService
       ↓
Supabase
```

`useAppointmentManager` is the shared appointment state/mutation layer used by
the Dashboard and the `Wizyty` workspace.

Pure appointment calculations live in:

```text
src/utils/appointmentCalculations.ts
```

Shared display formatting lives in:

```text
src/utils/formatting.ts
```

Shared domain types live in:

```text
src/types/
```

The refactor was structural only: no new business feature, database model, or
authorization model was introduced.

## Code documentation

The current source contains explanatory comments around non-obvious logic,
component responsibilities, domain types, and important state/mutation
behavior. Comments are intentionally focused on intent and responsibility
rather than documenting every obvious line of JSX or CSS.

**Last Updated:** 2026-09-02

# DogCalendar — AI Context

## Project

DogCalendar is a React + TypeScript + Vite appointment-management PWA for a dog groomer. The UI is primarily Polish.

## Current stage

**Stage 09 — Saved Dogs & Appointment History: COMPLETE**

Stages 01–08 are complete.

## Current navigation

```text
Pulpit
Wizyty
Raporty
```

Inside `Wizyty`:

```text
Wizyty | Zapisane psy
```

Do not add Saved Dogs as a fourth primary mobile-navigation item unless the product requirements explicitly change.

## Saved Dogs

Current model:

```text
saved_dogs
├── id
├── user_id
├── name
├── breed
├── phone_number
├── created_at
└── updated_at
```

`saved_dogs.id` is the identity.

`user_id` is the ownership boundary.

Saved Dogs are reusable current information.

Appointments are historical records.

## Implemented behavior

- Saved Dog CRUD.
- Automatic creation/reuse through normal appointment save.
- Existing Saved Dog reuse.
- Appointment-form population.
- Appointment phone numbers are stored on the appointment as historical snapshots.
- Breed suggestions with case-insensitive matching.
- Polish phone formatting (`323 232 232`).
- Saved Dog management inside `Wizyty`.
- Responsive and accessible management UI.
- Historical appointment independence.
- Saved Dog RLS verified with separate users.

## Important rules

1. Never use dog name as Saved Dog identity.
2. Never duplicate a Saved Dog for every appointment.
3. Appointment phone numbers belong to the appointment record once the appointment is saved.
4. Never rewrite historical appointments when a Saved Dog changes.
5. Never delete appointments when a Saved Dog is deleted.
6. RLS remains authoritative.
7. Reuse existing services/hooks/types.
8. Keep mobile as the primary experience.
9. Keep user-facing UI text Polish.
10. Do not add unnecessary architecture.

## Stage 09 scope decision

Wizyty search/filtering is intentionally **out of the completed Stage 09 scope**.

Do not implement the previously planned:

- Dog-name search.
- Breed search.
- Year filter.
- Month filter.
- Status filter.
- Clear/reset filters.
- Result count.
- Mobile filter UI.

These can be considered as a separate future feature if needed.

## Stage 09 verification

Saved Dog CRUD and cross-user isolation have been manually verified.

Next development should start from the project roadmap and should not assume unfinished Stage 09 search/filter work.

## Current source structure

The codebase has been refactored after Stage 09.

Important architecture:

```text
Pages
  ↓
Feature components
  ↓
Hooks
  ↓
Services
  ↓
Supabase
```

`useAppointmentManager` is the shared appointment state/mutation layer.

Dashboard composition:

```text
AppHome
├── DashboardSummary
├── DashboardMiniCalendar
├── DashboardAppointments
└── AppointmentModal
```

Pure appointment calculations belong in
`src/utils/appointmentCalculations.ts`.

Shared display formatting belongs in `src/utils/formatting.ts`.

Shared appointment domain types belong in `src/types/appointment.ts`.

### Refactor rules

- Do not reintroduce direct appointment CRUD logic into `AppHome`.
- Reuse `useAppointmentManager` for appointment state/mutations.
- Reuse `AppointmentModal` rather than duplicating modal implementation.
- Keep pure calculations outside React components.
- Avoid duplicating the same business logic in multiple pages/components.
- Prefer focused feature components over one large page component.
- Add comments for intent/non-obvious behavior, not for every obvious line.
- Do not change product behavior during a maintenance refactor unless explicitly requested.

## Current product scope

All Stage 01–09 functionality is complete.

Wizyty search/filtering remains intentionally out of scope.

Next development should be defined as a new stage rather than silently
expanding Stage 09.

**Last Updated:** 2026-09-02

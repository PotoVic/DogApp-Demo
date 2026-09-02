# SpaKalendar — Architecture

## Current architecture

```text
React + TypeScript + Vite
        ↓
Pages / Feature Components
        ↓
Hooks / Shared UI
        ↓
Service / data-access layer
        ↓
Supabase Client
        ↓
PostgreSQL
        ↓
RLS
```

Authentication is handled by Supabase Auth. PostgreSQL RLS is the final
authorization boundary.

## Code organization

The source is organized around pages, feature components, hooks, services,
shared domain types, and pure utilities.

```text
src/
├── components/              # Shared application-level UI
├── features/
│   ├── appointments/        # Appointment-specific UI
│   ├── dashboard/           # Dashboard-specific UI
│   └── savedDogs/           # Saved Dog-specific UI
├── hooks/                   # Shared state and application behavior
├── pages/                   # Route-level composition
├── services/                # Supabase/data-access operations
├── types/                   # Shared domain types
├── utils/                   # Pure calculations and formatting
└── styles/                  # Global styling
```

Pages should primarily coordinate state and compose feature components.
Feature-specific rendering and reusable logic should not be unnecessarily
kept inside a large page component.

## Appointment management architecture

Appointment state and mutations are centralized in
`useAppointmentManager`.

```text
AppHome / AppointmentsPage
          ↓
useAppointmentManager
          ↓
appointmentService
          ↓
Supabase
```

The manager owns shared appointment loading, mutation state, feedback, and
reload behavior. This avoids maintaining separate appointment CRUD
implementations in different pages.

The appointment service remains the data-access boundary and is responsible
for communicating with Supabase.

## Dashboard architecture

The Dashboard is intentionally decomposed:

```text
AppHome
├── DashboardSummary
│   └── appointmentCalculations
├── DashboardMiniCalendar
├── DashboardAppointments
│   └── Dashboard appointment cards/actions
└── AppointmentModal
    └── AppointmentsForm
```

`AppHome` coordinates page-level state such as the selected date, displayed
month, and appointment modal.

`DashboardSummary` owns dashboard KPI presentation.

`DashboardMiniCalendar` owns calendar presentation and date/month navigation.

`DashboardAppointments` owns the dashboard appointment-list presentation.

The shared `AppointmentModal` is reused rather than duplicating modal
markup/focus behavior inside the Dashboard.

## Pure calculation utilities

Business calculations that do not require React or Supabase are kept in:

```text
src/utils/appointmentCalculations.ts
```

Current responsibilities include:

- Appointments for a selected date.
- Daily completed earnings.
- Appointments for a selected month.
- Monthly completed earnings.
- Monthly appointment count.

These functions are pure and can be tested independently.

## Formatting utilities

Shared presentation formatting is kept in:

```text
src/utils/formatting.ts
```

Current shared formatting includes Polish PLN currency formatting.

Date/calendar-specific helpers remain in `src/utils/calendar.ts`.

## Shared domain types

Appointment lifecycle and mutation types are defined centrally in:

```text
src/types/appointment.ts
```

This avoids duplicating the same appointment mutation/status types across
components and hooks.

## Navigation architecture

Primary navigation:

```text
Pulpit
Wizyty
Raporty
```

The existing `Wizyty` area contains:

```text
Wizyty
├── Wizyty
└── Zapisane psy
```

This avoids adding a fourth mobile bottom-navigation item.

## Appointments

Appointments are historical records and remain the source of truth for
appointment history, contact phone snapshot, status, price, and earnings calculations.

Saved Dogs do not replace appointments.

## Saved Dogs

Saved Dogs are reusable current dog/profile/contact information.

Conceptual flow:

```text
Saved Dog
   ↓
Appointment form
   ↓
Populate name / breed / phone
   ↓
User may edit appointment values
   ↓
appointments stores its own name / breed / phone snapshot
   ↓
Existing appointment service
   ↓
appointments
```

Saved Dog management is intentionally separate from historical appointment
records.

Editing a Saved Dog must not update historical appointments.

Deleting a Saved Dog must not delete historical appointments.

## Saved Dog identity

The Saved Dog database `id` is the identity.

Dog name is not unique.

`user_id` establishes ownership.

## PWA

The PWA is a delivery/application-shell enhancement. It does not change
authorization or introduce offline mutation synchronization.

## Reports

Monthly PDF generation reads authorized appointment data. It does not create
a second reporting or earnings data source.

## Refactor principles

The September 2026 code cleanup introduced no new product behavior. It focused
on:

- Removing duplicated appointment management.
- Keeping `useAppointmentManager` as the shared appointment state/mutation layer.
- Extracting Dashboard rendering into feature components.
- Moving pure calculations out of page components.
- Centralizing shared domain types.
- Removing unused/redundant implementation paths.
- Keeping shared modal behavior in `AppointmentModal`.
- Adding focused comments for maintainability.

Do not introduce abstractions solely to reduce file length. New components or
hooks should have a coherent responsibility.

## Stage 09 scope decision

Wizyty search/filtering is not part of the completed Stage 09 architecture.
No search/filter subsystem was introduced.

**Last Updated:** 2026-09-02

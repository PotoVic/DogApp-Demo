# DogCalendar — Roadmap

## Stage Status

| Stage | Status |
|---|---|
| Stage 01 — Project Foundation | Complete |
| Stage 02 — Authentication & Authorization | Complete |
| Stage 03 — Appointments | Complete |
| Stage 04 — Calendar | Complete |
| Stage 05 — Dashboard | Complete |
| Stage 06 — UI/UX Refinement | Complete |
| Stage 07 — PWA | Complete |
| Stage 08 — Monthly PDF Reports | Complete |
| Stage 09 — Saved Dogs & Appointment History | **Complete** |

## Stage 09 — Saved Dogs & Appointment History

### Goal

Reduce repetitive appointment entry for returning dogs while keeping appointment data protected by authenticated ownership and RLS.

### Completed

- Saved Dogs persisted in `saved_dogs`.
- Saved Dog identity uses database `id`.
- Saved Dogs belong to the authenticated user through `user_id`.
- Saved Dog CRUD.
- Appointment-form Saved Dog selection.
- Automatic Saved Dog creation/reuse.
- Duplicate Saved Dogs avoided through the existing matching logic.
- Name, breed, optional phone number.
- English-demo phone formatting (`123 456 789`).
- Saved Dog management inside `Appointments`.
- Internal `Appointments / Saved Dogs` switch.
- Three-item mobile primary navigation preserved.
- Responsive Saved Dog UI.
- Accessible edit/close interaction.
- Saved Dog synchronization behavior verified as an intentional product rule.
- Saved Dog RLS verified across users.
- Cross-user appointment/Saved Dog isolation verified during the 2026-09-04 security review.

### Scope decision

The previously planned Appointments search/filter package is **not being implemented** in Stage 09.

Removed from the roadmap:

- Dog-name search.
- Breed search.
- Year filter.
- Month filter.
- Status filter.
- Clear/reset filters.
- Result count.
- Dedicated mobile filter UI.

These can be reconsidered as a separate future enhancement if real usage shows a need.

## Stage 09 Definition of Done

### Saved Dogs

- [x] Create.
- [x] Automatic save/reuse.
- [x] Edit.
- [x] Delete.
- [x] Name, breed, optional phone.
- [x] Authenticated-user isolation.
- [x] Duplicate names handled through Saved Dog IDs.
- [x] Useful suggestion presentation.
- [x] Mobile long-value handling.

### Breeds

- [x] Breed suggestions.
- [x] Case-insensitive matching.
- [x] No capitalization-based duplicates.
- [x] New breeds can be introduced.

### Data integrity

- [x] Saved Dog edits may synchronize matching appointment information by deliberate product behavior.
- [x] Deleting a Saved Dog does not delete appointments.
- [x] Deleting a Saved Dog does not delete appointments.
- [x] Appointments remain the source of truth.

### Security

- [x] Saved Dog RLS enabled.
- [x] SELECT ownership verified.
- [x] INSERT ownership verified.
- [x] UPDATE ownership verified.
- [x] DELETE ownership verified.
- [x] Ownership reassignment rejected/blocked.
- [x] Cross-user access verified.

### Regression

- [x] Existing appointment workflow remains functional.
- [x] Dashboard remains functional.
- [x] Calendar remains functional.
- [x] Reports remain functional.
- [x] PWA remains functional.
- [x] Responsive/accessibility behavior verified.
- [x] Documentation synchronized.

## Next Stage

Stage 10 will be defined separately. Do not assume that search/filtering is part of the next stage unless it is explicitly planned.

## Post-Stage 09 codebase cleanup

After Stage 09 functionality was completed, the application source was
refactored without changing the agreed product scope.

Completed:

- Dashboard appointment management consolidated around `useAppointmentManager`.
- Large `AppHome` page decomposed into focused Dashboard components.
- Dashboard calculations moved to pure utility functions.
- Shared appointment mutation/domain types centralized.
- Shared formatting helper introduced for currency display.
- Redundant Dashboard modal implementation removed in favor of `AppointmentModal`.
- Redundant saved-dog loading effect removed.
- Unused/redundant implementation paths removed where identified.
- Source comments added around important responsibilities and non-obvious logic.

This was a maintainability refactor, not a new product stage.

## Current engineering direction

Prefer:

```text
Page
  ↓
Feature component
  ↓
Hook / shared behavior
  ↓
Service
  ↓
Supabase
```

Keep pure calculations and formatting outside React components when they can
be expressed as standalone functions.

Avoid duplicating feature behavior between pages.

**Last Updated:** 2026-09-04

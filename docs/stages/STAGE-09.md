# DogCalendar — Stage 09: Saved Dogs & Appointment History

## Status

**COMPLETE**

## Goal

Reduce repetitive appointment entry for returning dogs while preserving appointment history and user isolation.

## Completed scope

### Saved Dogs

- [x] Saved dogs can be created.
- [x] New dogs can become available automatically through the normal appointment workflow.
- [x] Existing saved dogs are reused.
- [x] Saved dogs can be edited.
- [x] Saved dogs can be deleted.
- [x] Saved dogs contain name, breed, and optional phone number.
- [x] Appointments store an optional phone-number snapshot for historical contact information.
- [x] Saved Dog identity uses `saved_dogs.id`.
- [x] Saved Dogs are scoped to the authenticated user.
- [x] Duplicate names are handled safely.
- [x] Saved Dog suggestions show useful identifying information.
- [x] Long values work on mobile.

### Breeds

- [x] Breed autocomplete/suggestions work.
- [x] Matching is case-insensitive.
- [x] Capitalization does not create duplicate suggestions.
- [x] New breeds can be introduced.

### Wizyty / Saved Dogs UX

- [x] Existing `Wizyty` navigation item remains unchanged.
- [x] Internal `Wizyty / Zapisane psy` switch implemented.
- [x] `Dodaj wizytę` is positioned below the internal navigation.
- [x] Saved Dogs have explanatory copy.
- [x] Saved Dog CRUD UI is responsive.
- [x] Saved Dog edit close control uses `close-icon.svg`.
- [x] Close control has accessible name and focus/hover/active/disabled states.
- [x] Mobile remains at three primary navigation items.

### Appointment integration

- [x] Manual appointment entry remains available.
- [x] Saved Dog selection populates name, breed, and phone where available.
- [x] Appointment phone numbers remain available when editing the appointment and in `Wizyty`.
- [x] Suggestion dropdown closes after selection.
- [x] Existing appointment save flow remains the source of truth.

### Data integrity

- [x] Historical appointments remain unchanged after Saved Dog edits.
- [x] Appointment phone numbers are stored on the appointment itself and are not dependent on the Saved Dog record.
- [x] Deleting a Saved Dog does not delete appointments.
- [x] Appointments remain the historical source of truth.

### Security

- [x] Saved Dog RLS enabled.
- [x] SELECT ownership verified.
- [x] INSERT ownership verified.
- [x] UPDATE ownership verified.
- [x] DELETE ownership verified.
- [x] Ownership reassignment is blocked.
- [x] Cross-user access verified using separate users.

## Intentionally removed from Stage 09

The following were originally planned but are **not required** for Stage 09 completion:

- Dog-name search in Wizyty.
- Breed search in Wizyty.
- Year filter.
- Month filter.
- Status filter.
- Clear/reset filters.
- Result count.
- Dedicated mobile filter UI.

These are not bugs or unfinished Stage 09 work. They are intentionally deferred/future scope.

## Regression

The following current workflows have been manually verified during Stage 09 development:

- Appointment creation.
- Appointment editing.
- Appointment deletion/status behavior.
- Saved Dog creation.
- Saved Dog editing.
- Saved Dog deletion.
- Saved Dog reuse.
- Internal Wizyty/Saved Dogs navigation.
- Dashboard.
- Calendar.
- Reports/PDF.
- PWA behavior.
- Responsive Saved Dogs UI.

Run the project's final lint/build commands before release if not already done in the current working tree.

## Definition of Done

Stage 09 is complete because the agreed Saved Dogs functionality, appointment integration, data-integrity rules, responsive/accessibility behavior, and cross-user RLS behavior have been implemented and verified.

## Post-Stage 09 maintainability refactor

After Stage 09 functionality was verified, the source code was refactored to
reduce duplication and improve maintainability without changing Stage 09
behavior.

Completed:

- `AppHome.tsx` was reduced to page-level composition/state coordination.
- Dashboard appointment mutations now use `useAppointmentManager`.
- Dashboard rendering was split into:
  - `DashboardSummary`.
  - `DashboardMiniCalendar`.
  - `DashboardAppointments`.
- Appointment calculations were moved into
  `utils/appointmentCalculations.ts`.
- Shared currency formatting was moved into `utils/formatting.ts`.
- Shared appointment mutation types were centralized in
  `types/appointment.ts`.
- The Dashboard now reuses the shared `AppointmentModal`.
- Redundant appointment/modal implementation paths were removed.
- Redundant Saved Dog loading logic was removed.
- Source comments were added to explain important responsibilities and
  non-obvious logic.

This refactor is considered maintenance work after Stage 09 and does not add
new product scope.

**Last Updated:** 2026-09-02

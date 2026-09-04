# DogCalendar — Vision

## Product vision

DogCalendar should make everyday dog-grooming appointment management simpler than using a physical calendar.

The application should let the groomer:

- Understand the schedule quickly.
- Add appointments quickly.
- Reuse returning dog information.
- Manage appointments.
- Review historical appointments.
- Track earnings.
- Generate monthly reports.
- Use the application across devices.
- Keep user-owned data protected.

## Current product direction

Stage 09 adds Saved Dogs as reusable current information without turning DogCalendar into a customer CRM.

Saved Dog information:

- Name.
- Breed.
- Optional phone number.

Appointments remain the operational source of appointment history. Saved Dog edits may synchronize matching appointment information by deliberate product behavior; deleting a Saved Dog does not delete appointments.

## Navigation direction

The product keeps a small primary navigation:

```text
Pulpit
Wizyty
Raporty
```

Saved Dogs belong inside the existing Wizyty workflow rather than becoming a separate primary navigation item.

## Maintainability direction

The application should remain simple to operate and simple to maintain.

As the codebase grows:

- Route pages should coordinate rather than contain every implementation detail.
- Reusable feature UI should live with its feature.
- Shared appointment behavior should use the existing appointment manager.
- Pure calculations should remain independent of React and Supabase.
- Avoid introducing abstractions that do not have a clear responsibility.

## Scope discipline

Search/filtering for historical Wizyty was considered but is not part of the completed Stage 09 scope. Future scope should be based on actual user needs rather than adding complexity preemptively.

**Last Updated:** 2026-09-04

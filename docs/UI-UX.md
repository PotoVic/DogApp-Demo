# DogCalendar — UI/UX

## Primary navigation

```text
Dashboard
Appointments
Reports
```

Mobile uses three bottom-navigation items.

Saved Dogs are accessed inside `Appointments` rather than as a fourth navigation item.

## Appointments

The page contains an internal switch:

```text
Appointments | Saved Dogs
```

The `Add appointment` action sits below this internal navigation so the hierarchy remains clean on desktop and mobile.

## Saved Dogs

The Saved Dogs section explains its purpose:

> Save a dog's details once to make future appointments faster to complete.

It supports:

- List.
- Add.
- Edit.
- Delete.
- Empty state.
- Loading state.
- Error state.
- Delete confirmation.

## Saved Dog appointment selection

```text
Type dog name
     ↓
Saved Dog suggestions
     ↓
Select
     ↓
Name + breed + phone populated
     ↓
Dropdown closes
```

Manual entry remains available.

Suggestions present useful identifying information without requiring a separate customer CRM.

## Phone number

Nine-digit phone numbers are displayed/grouped as:

```text
323 232 232
```

## Saved Dog edit close control

The edit form uses the project's `close-icon.svg`.

The control has:

- Semantic button element.
- Accessible name.
- Focus-visible state.
- Hover state.
- Active state.
- Disabled state.
- Centered SVG icon.

## Responsive behavior

```text
0–1024px  → Bottom navigation
1025px+   → Sidebar
```

Mobile is the primary experience.

Long dog names, breeds, and phone values must not create horizontal overflow.

## Accessibility

Use semantic controls and labels.

Interactive controls must have visible focus states.

Icon-only controls require accessible names.

## Current UI component organization

The UI is organized so that route pages compose feature-specific components.

Dashboard:

```text
AppHome
├── DashboardSummary
├── DashboardMiniCalendar
├── DashboardAppointments
└── AppointmentModal
```

Appointments workspace:

```text
AppointmentsPage
├── AppointmentList
├── SavedDogsPanel
└── AppointmentModal
```

This structure keeps the user-facing behavior unchanged while preventing
large route components from owning unrelated presentation responsibilities.

## Scope decision

Appointments search/filter UI is not part of the completed Stage 09 UX. It was intentionally removed from scope rather than left as an unfinished requirement.

**Last Updated:** 2026-09-02

# DogCalendar — UI/UX

## Primary navigation

```text
Pulpit
Wizyty
Raporty
```

Mobile uses three bottom-navigation items.

Saved Dogs are accessed inside `Wizyty` rather than as a fourth navigation item.

## Wizyty

The page contains an internal switch:

```text
Wizyty | Zapisane psy
```

The `Dodaj wizytę` action sits below this internal navigation so the hierarchy remains clean on desktop and mobile.

## Zapisane psy

The Saved Dogs section explains its purpose:

> Zapisz dane psa raz, aby szybciej uzupełniać kolejne wizyty.

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

Polish nine-digit numbers are displayed/grouped as:

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

Wizyty search/filter UI is not part of the completed Stage 09 UX. It was intentionally removed from scope rather than left as an unfinished requirement.

**Last Updated:** 2026-09-02

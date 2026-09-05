# DogCalendar — Stage 05: Dashboard

## Purpose

Stage 05 builds the main dashboard using the completed appointment and calendar foundations.

The dashboard is the primary landing experience after login. It should answer:

> What is happening today?

and:

> How is the current month going?

This stage is functional dashboard implementation. Broad visual polish belongs to Stage 06.

---

# 1. Stage Goal

At the end of Stage 05, the authenticated user should be able to see:

- Today's date.
- Today's appointments.
- Today's earnings.
- Current-month earnings.
- Current-month appointment count.
- A mini calendar for orientation/navigation.
- A quick way to create an appointment.

---

# 2. Source of Truth

Before implementation, read:

```text
README.md
docs/AI-CONTEXT.md
docs/VISION.md
docs/ROADMAP.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/SECURITY.md
docs/UI-UX.md
```

Also inspect the existing Stage 03 appointment and Stage 04 calendar implementation.

The existing application code is the source of truth for already-implemented services, types, routing, calendar utilities, and mutation patterns.

Do not recreate existing functionality unless there is a concrete reason.

---

# 3. Scope

## In Scope

- Dashboard page/view.
- Today's date.
- Today's appointment list.
- Today's earnings.
- Current-month earnings.
- Current-month appointment count.
- Mini calendar.
- Quick appointment creation.
- Dashboard loading states.
- Dashboard empty states.
- Dashboard error states.
- Dashboard synchronization after appointment mutations.
- Responsive dashboard layout.
- Basic accessibility for the new dashboard UI.
- Use of the global color variables.

## Out of Scope

Do not implement:

- Stage 06 UI/UX refinement.
- PWA.
- PDF reports.
- Customer management.
- Dog profiles.
- Services.
- Recurring appointments.
- Notifications.
- SaaS functionality.
- Advanced analytics.
- New accounting features.
- A new dashboard database table.
- Stored daily/monthly earnings fields.
- A new state-management library unless an existing concrete requirement demands it.

---

# 4. Dashboard Information Hierarchy

Use this priority:

```text
Today's date
      ↓
Today's appointments
      ↓
Quick add appointment
      ↓
Today's earnings
      ↓
Monthly earnings
      ↓
Monthly appointment count
      ↓
Mini calendar
```

The exact layout can change responsively, but the user should be able to understand the day quickly.

---

# 5. Data Rules

The dashboard must derive its information from existing appointment data.

## Today's Appointments

Filter appointments by:

- Authenticated user.
- Current local application date.

Sort appointments in a predictable chronological order.

Use the existing appointment type/service where possible.

## Today's Earnings

Only appointments with:

```text
status = completed
```

should contribute.

```text
Today's completed appointments
        ↓
sum price
        ↓
Today's earnings
```

## Monthly Earnings

Only completed appointments in the current calendar month contribute.

```text
Current month's completed appointments
        ↓
sum price
        ↓
Monthly earnings
```

## Monthly Appointment Count

Count appointments in the current month according to the existing product definition.

Do not store the count separately.

## Financial Accuracy

Use the existing exact numeric price representation.

Do not use floating-point shortcuts for financial calculations.

---

# 6. Reuse Existing Architecture

Prefer:

```text
Existing appointment service
          ↓
Dashboard data/aggregation
          ↓
Dashboard state
          ↓
Dashboard components
```

Reuse:

- Appointment types.
- Appointment services.
- Authentication/session handling.
- Calendar utilities.
- Appointment mutation flows.
- Existing routing.
- Existing global CSS variables.

Do not duplicate appointment creation/editing/deletion logic inside the dashboard.

---

# 7. Mini Calendar

The mini calendar should:

- Show the current month.
- Highlight today.
- Indicate days containing appointments.
- Allow date selection.
- Reuse existing calendar logic where practical.

Selecting a date should navigate to or reveal the existing relevant calendar/day context.

Do not create a separate date calculation system if the existing calendar utilities can be reused.

---

# 8. Quick Appointment Creation

The dashboard should make adding an appointment easy.

Reuse the existing appointment creation flow.

The dashboard may:

- Navigate to the existing appointment creation UI.
- Open the existing appointment form/modal if that pattern already exists.

Do not create a second appointment form with duplicated validation.

If today's date is used as the default, it should remain explicit and editable.

---

# 9. UI Requirements

Use the existing global semantic color variables.

Primary UI language is English.

Suggested labels:

```text
Dashboard
Today
Today's appointments
Today's earnings
This month
Appointment count
Calendar
Add appointment
```

Use natural English wording consistent with the existing application.

---

# 10. States

## Loading

Show useful loading feedback while dashboard data is being retrieved.

Avoid an unnecessary full-screen loader if individual sections can load independently.

## Empty

When there are no appointments today:

```text
No appointments today.

[ Add appointment ]
```

## Error

Use a user-oriented message:

```text
Failed to load data.
Try again.
```

Where practical, provide a retry action.

## Success / Mutation Feedback

Reuse the existing appointment feedback patterns.

Do not create a second notification/toast system unless the existing application does not already provide one and a small reusable solution is justified.

---

# 11. Responsive Requirements

## Mobile — 0rem+

- Single-column priority.
- Today's appointments near the top.
- Quick add action easy to reach.
- Touch-friendly controls.
- No content hidden behind bottom navigation.
- Avoid horizontal scrolling.

## Tablet — 48rem+

- Use available width for summary cards.
- Two-column arrangements may be used where they improve readability.
- Keep controls touch-friendly.

## Desktop — 64rem+

- Use the existing desktop navigation/sidebar.
- Multi-column dashboard layouts may be used.
- Avoid excessive empty space.
- Keep today's appointments prominent.

---

# 12. Accessibility

At minimum:

- Semantic headings.
- Proper button/link elements.
- Accessible labels for icon buttons.
- Visible focus states.
- Keyboard-accessible interactions.
- Sufficient contrast using the existing color system.
- Do not communicate appointment status or important information by color alone.
- Touch-friendly controls.

The Stage 06 accessibility pass will provide a broader audit.

---

# 13. Dashboard Synchronization

The dashboard must remain correct after appointment mutations.

Examples:

```text
Create appointment
      ↓
Today's appointment list updates
      ↓
Relevant counts/earnings update if applicable
```

```text
Complete appointment
      ↓
Today's earnings may change
      ↓
Monthly earnings may change
```

```text
Cancel/delete appointment
      ↓
Appointment list/counts update
      ↓
Earnings remain consistent
```

Prefer existing refresh/invalidation patterns.

Do not create duplicated state that can drift from Supabase.

---

# 14. Security Requirements

The dashboard is private.

It must:

- Require authentication.
- Use the authenticated Supabase client.
- Remain protected by existing RLS.
- Never use a service-role key in frontend code.
- Never assume frontend filtering is sufficient for authorization.

Verify that dashboard-derived values cannot include another user's appointments.

---

# 15. Suggested Implementation Sequence

Implement incrementally.

### Step 1 — Inspect Existing Dashboard/Routing

Find:

- Current dashboard route/page.
- Existing `AppHome` or equivalent.
- Existing navigation.
- Existing appointment services.
- Existing calendar components/utilities.
- Existing feedback/loading patterns.

Do not modify code before understanding the current structure.

### Step 2 — Dashboard Shell

Create the dashboard structure and page-level layout.

Verify routing.

### Step 3 — Today's Date

Display today's date using the application's established date conventions.

Verify formatting and locale.

### Step 4 — Today's Appointments

Connect existing appointment data.

Verify:

- Correct date.
- Correct user.
- Correct ordering.
- Empty state.
- Loading state.
- Error state.

### Step 5 — Earnings

Implement:

- Today's earnings.
- Current-month earnings.

Verify only completed appointments contribute.

### Step 6 — Monthly Count

Add current-month appointment count.

Verify the counting rule.

### Step 7 — Quick Add

Connect the dashboard action to the existing appointment creation flow.

Verify the new appointment appears in the dashboard afterward.

### Step 8 — Mini Calendar

Reuse existing calendar logic.

Verify:

- Today.
- Current month.
- Appointment indicators.
- Date selection.
- Navigation to the relevant calendar context.

### Step 9 — Responsive Layout

Verify:

- Mobile.
- Tablet.
- Desktop.

### Step 10 — Accessibility

Verify keyboard interaction, focus states, labels, headings, and touch targets.

### Step 11 — Mutation Synchronization

Verify create/edit/delete/cancel/complete flows update dashboard data correctly.

### Step 12 — Production Verification

Run:

- TypeScript checks.
- Lint checks if configured.
- Production build.
- Manual functional testing.

---

# 16. Completion Criteria

Stage 05 is complete only when:

- [x] Dashboard route/page works.
- [x] Today's date is correct.
- [x] Today's appointments are correct.
- [x] Today's appointments are sorted predictably.
- [x] Today's earnings are correct.
- [x] Monthly earnings are correct.
- [x] Monthly appointment count is correct.
- [x] Only completed appointments contribute to earnings.
- [x] Quick appointment creation works.
- [x] Mini calendar works.
- [x] Calendar date selection integrates with existing calendar behavior.
- [x] Dashboard updates after appointment mutations.
- [x] Loading states work.
- [x] Empty states work.
- [x] Error states work.
- [x] English UI labels are appropriate.
- [x] Mobile layout works.
- [x] Tablet layout works.
- [x] Desktop layout works.
- [x] Keyboard accessibility works.
- [x] Touch targets are usable.
- [x] Existing authentication protection remains intact.
- [x] Existing RLS behavior remains intact.
- [x] No privileged credentials are exposed.
- [x] No duplicate appointment/earnings data model was introduced.
- [x] TypeScript/lint/build checks pass.
- [x] Manual Stage 05 functional testing is complete.
- [x] Relevant documentation is updated.

---

# 17. Documentation After Stage 05

When Stage 05 is verified:

1. Mark Stage 05 complete in `ROADMAP.md`.
2. Update `AI-CONTEXT.md` to Stage 06.
3. Update `ARCHITECTURE.md` with any meaningful dashboard architecture decisions.
4. Update `DATABASE.md` only if database behavior/schema changed.
5. Update `SECURITY.md` with any meaningful dashboard security decisions.
6. Update `UI-UX.md` with confirmed dashboard decisions.
7. Keep `VISION.md` aligned if product scope changes.
8. Record important implementation decisions in the stage documentation.

Do not mark Stage 05 complete merely because the dashboard renders. Functional verification is required.

---

# 18. Stage Status

**Status:** Complete

**Completed:** 2026-08-18

**Previous Stage:** Stage 04 — Calendar — Complete

**Next Stage:** Stage 06 — UI/UX Refinement


---

# 19. Stage 05 Final Verification Record

Stage 05 — Dashboard has been fully implemented and verified.

## Step Verification

- Step 1 — Dashboard foundation: Verified.
- Step 2 — Summary data: Verified.
- Step 3 — Dashboard appointment context: Verified.
- Step 4 — Dashboard layout: Verified.
- Step 5 — Dashboard appointment cards: Verified.
- Step 6 — Mini calendar integration: Verified.
- Step 7 — Dashboard date selection: Verified.
- Step 8 — Today's appointment card restructure: Verified.
- Step 9 — Responsive layout: Verified.
- Step 10 — Accessibility: Verified.
- Step 11 — Mutation synchronization: Verified.
- Step 12 — Production verification: Verified.

## Additional Confirmed Decisions

### Selected-day appointments

The Dashboard mini calendar controls the appointment context shown on the
Dashboard. Selecting a date displays appointments for that date using the
existing `appointments` data source.

### Mutation synchronization

Create, edit, delete, cancel, and complete operations continue to use the
existing appointment service and refresh pattern. Dashboard-derived data
is recalculated from refreshed appointment data.

### Appointment time

Appointment creation/editing allows only 07:00–18:00 in 5-minute increments.
Edit mode correctly preselects the existing stored time.

### Production verification

```text
npm run build  ✓
npm run lint   ✓
Manual testing ✓
```

Stage 05 is officially complete.

---

# 20. Next Stage

The next development stage is:

**Stage 06 — UI/UX Refinement**

Stage 06 should build on the verified Dashboard, Calendar, and Appointment
foundations without changing their underlying data architecture unless a
concrete requirement emerges.

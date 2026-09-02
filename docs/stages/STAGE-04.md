# SpaKalendar --- Stage 04: Calendar

## Purpose

Stage 04 implements the core monthly calendar experience of SpaKalendar.

The goal is to build a simple, familiar, mobile-first calendar that sits
on top of the appointment-management foundation completed in Stage 03.

At the end of this stage, the authenticated user should be able to:

-   View the current month.
-   Navigate to the previous month.
-   Navigate to the next month.
-   Clearly identify today's date.
-   See which days contain appointments.
-   Select a date.
-   View appointments for the selected date.
-   Start creating an appointment for a selected date.
-   Use the calendar comfortably on mobile, tablet, and desktop.

Stage 04 must reuse the existing appointment data and security model. It
should not replace the appointment system or introduce a second source
of truth.

------------------------------------------------------------------------

# 1. Stage Goal

The intended flow is:

``` text
Authenticated User
       ↓
Calendar
       ↓
Monthly Calendar Grid
       ↓
Select Date
       ↓
Appointments for Selected Date
       ↓
View / Add Appointment
       ↓
Existing Appointment UI + Supabase
```

The calendar is primarily a date-navigation and appointment-discovery
interface.

The database remains the source of truth for appointment data.

The existing Stage 03 appointment functionality remains responsible for
creating, editing, completing, cancelling, and deleting appointments.

------------------------------------------------------------------------

# 2. Reference Documentation

Before working on this stage, review:

``` text
README.md
docs/AI-CONTEXT.md
docs/VISION.md
docs/ROADMAP.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/SECURITY.md
docs/UI-UX.md
docs/stages/STAGE-01.md
docs/stages/STAGE-02.md
docs/stages/STAGE-03.md
```

The most important references for Stage 04 are:

``` text
AI-CONTEXT.md
ROADMAP.md
ARCHITECTURE.md
DATABASE.md
SECURITY.md
UI-UX.md
STAGE-03.md
```

If an implementation decision conflicts with these documents, stop and
review the conflict before continuing.

Do not silently introduce a different appointment data model,
authentication mechanism, backend architecture, or calendar workflow.

------------------------------------------------------------------------

# 3. Technology

Stage 04 uses the existing project foundation:

### Frontend

-   React
-   TypeScript
-   Vite
-   CSS

### Backend / Platform

-   Supabase

### Database

-   PostgreSQL through Supabase

### Authentication

-   Supabase Auth

### Authorization

-   PostgreSQL Row Level Security (RLS)

Do not introduce a custom backend.

Do not introduce a calendar library unless a concrete requirement
justifies it and the trade-off is reviewed first.

Do not introduce a new state-management library.

Do not introduce a second appointment data source.

------------------------------------------------------------------------

# 4. Stage Scope

## In Scope

Stage 04 includes:

-   Monthly calendar UI.
-   Current month display.
-   Previous month navigation.
-   Next month navigation.
-   Today indicator.
-   Appointment indicators on calendar days.
-   Date selection.
-   Selected-date state.
-   Displaying appointments for the selected date.
-   Creating an appointment from a selected date.
-   Reusing the existing appointment form where practical.
-   Loading states for calendar/appointment data where needed.
-   Empty states for dates without appointments.
-   Error states for calendar-related data loading.
-   Responsive calendar behavior.
-   Touch-friendly interaction.
-   Basic accessibility verification.
-   Verification that calendar data respects existing appointment
    ownership/RLS.

------------------------------------------------------------------------

## Out of Scope

Do not implement the following during Stage 04 unless a minimal
technical dependency is required:

-   Dashboard.
-   Monthly earnings dashboard.
-   Mini calendar on the dashboard.
-   Monthly PDF reports.
-   PWA functionality.
-   Customer management.
-   Dog profiles.
-   Services management.
-   Recurring appointments.
-   Notifications.
-   Advanced filtering/search.
-   SaaS functionality.
-   Advanced analytics.
-   Full UI/UX visual polish.
-   New appointment business rules.

Stage 04 should establish the calendar foundation without prematurely
implementing later stages.

------------------------------------------------------------------------

# 5. Existing Appointment Model

The calendar must use the existing appointment model from `DATABASE.md`
and Stage 03.

Conceptually:

``` text
appointments
├── id
├── user_id
├── dog_name
├── breed
├── appointment_date
├── appointment_time
├── price
├── note
├── status
├── created_at
└── updated_at
```

The appointment status values are:

``` text
scheduled
completed
cancelled
```

The calendar should use `appointment_date` to determine which days
contain appointments.

The calendar should use `appointment_time` when displaying appointments
for a selected date.

Do not introduce a separate calendar-events table.

Do not duplicate appointments into localStorage or another database.

------------------------------------------------------------------------

# 6. Security Boundary

Stage 02 established the authentication and authorization boundary.

Stage 03 verified that appointment operations continue to respect it.

Stage 04 must preserve the same model:

``` text
Authenticated User
        ↓
Supabase Client
        ↓
PostgreSQL
        ↓
RLS
        ↓
Only appointments owned by that user
```

The calendar must not request or expose appointments belonging to
another user.

Do not:

-   Disable RLS.
-   Bypass RLS.
-   Use a service-role key in the browser.
-   Trust client-side filtering as the security mechanism.
-   Create a second appointment data source.

The frontend may filter already-authorized appointment data for
presentation, but authorization remains a database responsibility.

------------------------------------------------------------------------

# 7. Step 1 --- Review the Existing Foundation

Before implementing calendar functionality, verify that the existing
application still works.

Check:

``` text
[ ] Application starts
[ ] Supabase client initializes
[ ] Login works
[ ] Authenticated session is detected
[ ] Logout works
[ ] Protected routes work
[ ] appointments table exists
[ ] RLS is enabled
[ ] Stage 03 appointment list/view works
[ ] Stage 03 appointment creation works
[ ] Stage 03 appointment editing works
[ ] Stage 03 appointment deletion works
[ ] Stage 03 cancel/complete actions work
[ ] No privileged Supabase key is exposed
```

Do not continue if the existing appointment or security foundation is
broken.

### Checkpoint

The Stage 03 appointment workflow must remain functional before calendar
work begins.

------------------------------------------------------------------------

# 8. Step 2 --- Define Calendar Data and State

The calendar needs a clear representation of:

``` text
Current displayed month
Selected date
Today's date
Calendar days
Appointments relevant to the displayed month
```

Use TypeScript types where they improve clarity.

Do not create a second appointment model.

The existing `Appointment` type should be reused.

The calendar's state should remain UI state.

Conceptually:

``` text
Displayed month
       ↓
Generate calendar days
       ↓
Match authorized appointments by date
       ↓
Render calendar
```

The selected date is also UI state:

``` text
User selects date
       ↓
selectedDate changes
       ↓
Appointments for selectedDate are displayed
```

Avoid putting derived values into state when they can be calculated from
existing state.

------------------------------------------------------------------------

# 9. Step 3 --- Generate the Monthly Calendar Grid

Implement the calendar grid for the displayed month.

The calendar should:

-   Start weeks on Monday.
-   Include all dates necessary to display complete weeks.
-   Display the correct number of days for the month.
-   Handle months with different lengths.
-   Handle leap years correctly.
-   Preserve consistent weekday positions.

Example:

``` text
Pon  Wt  Śr  Czw  Pt  Sob  Nd
──────────────────────────────
 27  28  29  30   31   1    2
  3   4   5   6    7   8    9
 ...
```

Days belonging to the previous or next month may be displayed as
adjacent-month days if the chosen calendar design uses them.

The implementation should use a reusable date utility rather than
duplicating date calculations inside JSX.

### Checkpoint

Verify:

``` text
[ ] Every displayed month has the correct dates
[ ] Weeks begin on Monday
[ ] Leap years work
[ ] Month boundaries work
[ ] Calendar grid remains structurally consistent
```

------------------------------------------------------------------------

# 10. Step 4 --- Display Current Month

The calendar should clearly display the currently viewed month.

Example:

``` text
<  Sierpień 2026  >
```

The month label should update when navigating between months.

The calendar should use the application's Polish UI language.

Month names should be presented naturally for Polish users.

Do not hard-code a single month.

### Checkpoint

Verify that changing the displayed month updates:

-   Month heading.
-   Calendar dates.
-   Appointment indicators.

------------------------------------------------------------------------

# 11. Step 5 --- Previous and Next Month Navigation

Add controls for:

``` text
Previous month
Next month
```

Expected behavior:

``` text
August 2026
     ↓ Next
September 2026
```

and:

``` text
August 2026
     ↓ Previous
July 2026
```

Navigation should update the displayed month without reloading the page.

Buttons should be keyboard accessible and have accessible names.

Avoid tiny icon-only controls unless they have proper accessible labels.

### Checkpoint

Verify:

``` text
[ ] Previous month works
[ ] Next month works
[ ] Navigation works across year boundaries
[ ] January → December transition works
[ ] December → January transition works
[ ] Month heading updates
[ ] Calendar dates update
```

------------------------------------------------------------------------

# 12. Step 6 --- Highlight Today

Today's date should be visually distinguishable from other dates.

The indicator should not rely only on color.

Possible approaches include:

-   Distinct border.
-   Background treatment.
-   Stronger typography.
-   Small marker.

The chosen design should remain consistent with the UI/UX documentation.

The calendar should determine today's date dynamically.

Do not hard-code a date.

### Checkpoint

Verify:

``` text
[ ] Today is correctly identified
[ ] Today remains correct after month navigation
[ ] Today is visually distinguishable
[ ] Today does not become "today" simply because it is selected
```

A selected date and today's date are separate concepts.

------------------------------------------------------------------------

# 13. Step 7 --- Indicate Days With Appointments

Days containing one or more authorized appointments should display a
clear appointment indicator.

Possible approaches include:

``` text
●
```

or:

``` text
3 appointments
```

or another subtle marker.

The indicator must not rely only on color.

The calendar should derive the indicator from the appointment data
already loaded for the authenticated user.

Conceptually:

``` text
Appointments
     ↓
Group/match by appointment_date
     ↓
Calendar day
     ↓
Show indicator when count > 0
```

Cancelled appointments may still count as having an appointment because
they remain historical appointment records. The exact visual treatment
should remain simple during this stage.

Do not implement earnings calculations here.

### Checkpoint

Verify:

``` text
[ ] Day with appointment has indicator
[ ] Day without appointment has no indicator
[ ] Multiple appointments do not create duplicate indicators
[ ] Indicators update when appointment data changes
[ ] Only authorized user's appointments are considered
```

------------------------------------------------------------------------

# 14. Step 8 --- Select a Date

The user should be able to select a calendar date.

Selecting a date should:

1.  Update the selected date.
2.  Make the selected date visually obvious.
3.  Display appointments for that date.

Selected date and today should remain visually distinguishable.

Expected flow:

``` text
Calendar
   ↓
User taps 18 August
   ↓
18 August becomes selected
   ↓
Appointments for 18 August appear
```

The selected date should be keyboard accessible.

### Checkpoint

Verify:

``` text
[ ] Date can be selected
[ ] Selected date is visually clear
[ ] Selection updates appointment display
[ ] Keyboard users can select dates
[ ] Selection works on touch devices
```

------------------------------------------------------------------------

# 15. Step 9 --- Display Appointments for the Selected Date

When a date is selected, display the appointments belonging to that
date.

Reuse the existing Stage 03 appointment display components where
practical.

The selected-date area should show useful information such as:

``` text
18 sierpnia

13:30
Luna
Shih Tzu
150 zł
scheduled

15:00
Bella
Pudel
180 zł
completed
```

The calendar should not create a new appointment presentation system if
the existing appointment UI can be reused.

Appointment actions such as edit, cancel, complete, and delete should
continue to use the existing Stage 03 functionality.

### Checkpoint

Verify:

``` text
[ ] Correct appointments appear for selected date
[ ] Appointments are ordered sensibly
[ ] Existing appointment actions still work
[ ] Status is displayed correctly
[ ] Empty selected dates are handled
```

------------------------------------------------------------------------

# 16. Step 10 --- Add Appointment From a Selected Date

The user should be able to start creating an appointment from the
selected date.

The selected date should be passed into or used to prefill the existing
appointment form.

Expected flow:

``` text
Select 18 August
      ↓
Add appointment
      ↓
Appointment form
      ↓
Date already set to 18 August
      ↓
User fills remaining fields
      ↓
Save
```

Do not create a separate appointment creation system.

Reuse the Stage 03 form and service.

The user should still be able to change the date in the form if the
existing appointment UX permits it.

### Checkpoint

Verify:

``` text
[ ] Add action exists for selected date
[ ] Selected date is used as the initial appointment date
[ ] Existing validation still works
[ ] Existing save/loading/success/error states work
[ ] Created appointment appears on the correct calendar day
```

------------------------------------------------------------------------

# 17. Step 11 --- Calendar Data Loading

The calendar needs appointment data to display appointment indicators
and selected-date appointments.

Use the existing appointment data-access/service layer where practical.

Do not create a second appointment retrieval implementation unless the
query requirements genuinely differ.

Loading feedback should follow the existing UI/UX principles.

Example:

``` text
Ładowanie wizyt...
```

The calendar should not appear frozen while appointment data is loading.

Avoid unnecessary full-screen loading states.

### Checkpoint

Verify:

``` text
[ ] Calendar loading state is understandable
[ ] Appointment data loads successfully
[ ] Existing appointment loading behavior is not broken
[ ] Errors are handled
```

------------------------------------------------------------------------

# 18. Step 12 --- Empty States

The selected date may have no appointments.

Provide a useful empty state.

Example:

``` text
Brak wizyt tego dnia.

[ Dodaj wizytę ]
```

The user should understand that the date simply has no appointments.

Do not display a blank area with no explanation.

### Checkpoint

Verify:

``` text
[ ] Empty selected date is handled
[ ] Empty state is understandable
[ ] Add appointment action remains available
```

------------------------------------------------------------------------

# 19. Step 13 --- Error States

Calendar-related data errors should be communicated clearly.

Example:

``` text
Nie udało się pobrać wizyt.
Spróbuj ponownie.
```

Avoid exposing raw Supabase or PostgreSQL errors.

Where appropriate, provide a retry action.

The calendar should remain usable where possible even if appointment
data cannot be loaded.

### Checkpoint

Verify:

``` text
[ ] Data error is shown clearly
[ ] Technical error details are not exposed unnecessarily
[ ] Retry/recovery is available where appropriate
[ ] UI does not silently fail
```

------------------------------------------------------------------------

# 20. Step 14 --- Calendar and Appointment Updates

The calendar must stay consistent after appointment mutations.

Examples:

``` text
Create appointment
      ↓
Calendar day gains indicator

Delete appointment
      ↓
Indicator disappears if no appointments remain

Cancel appointment
      ↓
Appointment status updates

Complete appointment
      ↓
Appointment status updates
```

The exact update strategy may use:

-   Local state update.
-   Refetching.
-   A combination of both.

Prefer the simplest reliable approach.

Do not introduce a global state-management system merely to synchronize
the calendar.

### Checkpoint

Verify that Stage 03 mutations continue to produce correct calendar
state.

------------------------------------------------------------------------

# 21. Step 15 --- Responsive Calendar UX

The calendar must follow the mobile-first strategy.

## Mobile

Prioritize:

-   Touch-friendly day cells.
-   Clear selected date.
-   Clear today indicator.
-   Simple month navigation.
-   Compact appointment information.
-   Easy add action.
-   No horizontal overflow.

## Tablet

Use additional space for:

-   Larger day cells.
-   More comfortable appointment display.
-   Wider calendar layout.

## Desktop

Use additional horizontal space where appropriate.

The calendar may become larger, but the information hierarchy should
remain simple.

Do not make the mobile calendar a scaled-down desktop table.

### Checkpoint

Verify:

``` text
[ ] Mobile works
[ ] Tablet works
[ ] Desktop works
[ ] No horizontal overflow
[ ] Day cells remain usable
[ ] Touch targets are comfortable
```

------------------------------------------------------------------------

# 22. Step 16 --- Accessibility

Calendar interaction should follow the project's accessibility
principles.

Verify:

-   Semantic buttons for interactive controls.
-   Keyboard-accessible month navigation.
-   Keyboard-accessible date selection.
-   Visible focus states.
-   Accessible labels for previous/next month controls.
-   Clear selected-date state.
-   Clear today state.
-   Appointment indicators are not communicated by color alone.
-   Sufficient touch targets.
-   Appropriate heading hierarchy.
-   Status and feedback are accessible to assistive technology where
    appropriate.

The calendar should not depend exclusively on hover.

### Checkpoint

Verify the main calendar workflow using keyboard interaction.

------------------------------------------------------------------------

# 23. Step 17 --- Code Quality

Before completing Stage 04:

-   Remove temporary test code.
-   Remove unused imports.
-   Avoid duplicated date logic.
-   Avoid duplicated appointment retrieval logic.
-   Reuse the existing appointment types.
-   Reuse existing appointment components where practical.
-   Keep calendar date calculations in reusable utilities.
-   Keep components focused.
-   Avoid unnecessary state.
-   Avoid unnecessary dependencies.
-   Keep TypeScript types accurate.
-   Keep the implementation aligned with `ARCHITECTURE.md`.

The goal is a maintainable calendar feature, not a generalized calendar
framework.

------------------------------------------------------------------------

# 24. Step 18 --- Testing

Before completing Stage 04, test the following.

## Calendar Rendering

``` text
[ ] Current month renders correctly
[ ] Week starts on Monday
[ ] Month lengths are correct
[ ] Leap years work
[ ] Adjacent month days behave correctly if displayed
```

## Navigation

``` text
[ ] Previous month works
[ ] Next month works
[ ] January → December works
[ ] December → January works
```

## Today

``` text
[ ] Today is correctly highlighted
[ ] Today remains correct after month navigation
[ ] Today and selected date are distinguishable
```

## Appointment Indicators

``` text
[ ] Days with appointments are marked
[ ] Days without appointments are not marked
[ ] Multiple appointments on one day work
[ ] Indicators update after mutations
```

## Date Selection

``` text
[ ] Date can be selected
[ ] Selected date is clearly shown
[ ] Correct appointments appear
[ ] Empty selected date works
```

## Appointment Creation

``` text
[ ] Add appointment from selected date works
[ ] Selected date is prefilled
[ ] Existing validation works
[ ] Existing save flow works
[ ] New appointment appears on correct day
```

## Existing Appointment Actions

``` text
[ ] Edit still works
[ ] Cancel still works
[ ] Complete still works
[ ] Delete still works
```

## Security

``` text
[ ] Only authenticated users can access calendar data
[ ] User A cannot see User B's appointments
[ ] RLS remains enabled
[ ] No privileged credentials are exposed
```

## UX

``` text
[ ] Loading states work
[ ] Empty states work
[ ] Error states work
[ ] Success feedback remains correct
[ ] Mobile layout works
[ ] Keyboard interaction works
[ ] Touch interaction works
```

------------------------------------------------------------------------

# 25. Stage Checkpoint

Before marking Stage 04 complete:

``` text
[ ] Monthly calendar works
[ ] Current month works
[ ] Previous month works
[ ] Next month works
[ ] Today is highlighted
[ ] Appointment days are indicated
[ ] Date selection works
[ ] Selected-date appointments are displayed
[ ] Add appointment from selected date works
[ ] Existing appointment actions still work
[ ] Loading states work
[ ] Empty states work
[ ] Error states work
[ ] Calendar updates after appointment mutations
[ ] Mobile layout works
[ ] Tablet layout works
[ ] Desktop layout works
[ ] Accessibility basics are verified
[ ] RLS still protects appointment ownership
[ ] No privileged credentials are exposed
[ ] No critical issues remain
```

------------------------------------------------------------------------

# 26. Definition of Done

Stage 04 is complete when:

1.  The authenticated user can view a monthly calendar.
2.  The current month is displayed correctly.
3.  The user can navigate between months.
4.  Today's date is clearly identifiable.
5.  Days containing appointments are visibly indicated.
6.  The user can select a date.
7.  Appointments for the selected date are displayed.
8.  The user can start creating an appointment from the selected date.
9.  The existing appointment-management workflow remains functional.
10. Calendar data is based on the existing appointment records.
11. Appointment ownership continues to be enforced by RLS.
12. Loading, empty, and error states are handled.
13. The calendar works on mobile, tablet, and desktop.
14. The main calendar workflow is keyboard accessible.
15. Touch targets are appropriate for mobile use.
16. No unnecessary new backend or state-management system was
    introduced.
17. No privileged credentials are exposed.
18. Relevant documentation is updated.
19. No known critical issues remain.
20. The project is ready for Stage 05 --- Dashboard.

------------------------------------------------------------------------

# 27. Documentation Updates

When Stage 04 is complete, update the relevant documentation.

At minimum:

``` text
docs/AI-CONTEXT.md
docs/ROADMAP.md
```

Update `ROADMAP.md`:

``` text
Stage 04 — Calendar
Status: Complete
```

Then set the current stage to:

``` text
Stage 05 — Dashboard
```

Update `AI-CONTEXT.md` so that it describes the implemented calendar
functionality and identifies Stage 05 as the current development stage.

If the calendar introduces an architectural decision, update:

``` text
docs/ARCHITECTURE.md
```

If the database schema changes, update:

``` text
docs/DATABASE.md
```

If the calendar introduces a new security consideration, update:

``` text
docs/SECURITY.md
```

If a significant UI/UX decision changes the product direction, update:

``` text
docs/UI-UX.md
```

Do not mark Stage 04 complete before the implementation and tests have
passed.

------------------------------------------------------------------------

# 28. How We Will Work Through This Stage

Stage 04 must be completed incrementally.

Do not attempt to implement the entire stage in one step.

Recommended workflow:

``` text
Read Stage 04
      ↓
Review current code
      ↓
Step 1
      ↓
Implement
      ↓
Test
      ↓
Explain / review
      ↓
Confirm
      ↓
Next step
```

When something does not work:

``` text
Stop
 ↓
Investigate
 ↓
Fix
 ↓
Retest
 ↓
Continue
```

The developer should understand important calendar implementation
decisions before continuing.

------------------------------------------------------------------------

# 29. Important Rule for AI Assistance

AI assistance must follow the project's documentation.

Before proposing a significant implementation change, consider:

``` text
AI-CONTEXT.md
      ↓
ROADMAP.md
      ↓
Current Stage
      ↓
ARCHITECTURE.md
      ↓
DATABASE.md
      ↓
SECURITY.md
      ↓
UI-UX.md
      ↓
STAGE-03.md
```

Do not introduce:

-   A custom backend.
-   A second database.
-   A separate appointment data model.
-   A new authentication system.
-   A new state-management library.
-   A service-role key in the browser.
-   LocalStorage as the primary appointment store.
-   A calendar library without reviewing the trade-off.

If a better approach is discovered, explain the trade-off before
changing the project direction.

------------------------------------------------------------------------

# 31. Stage 04 Final Implementation Result

Stage 04 was completed and the calendar behavior was incorporated into the
Dashboard workflow.

The standalone Calendar route/feature was later removed during Stage 06 UI/UX
cleanup. Calendar date calculations remain shared in `src/utils/calendar.ts`,
while the active calendar UI is `DashboardMiniCalendar`.

The current implementation therefore does not contain a separate Calendar
page or calendar route.

# 30. Stage Status

**Stage:** 04 --- Calendar

**Status:** Complete

**Previous Stage:** 03 --- Appointments --- Complete

**Next Stage:** 05 --- Dashboard

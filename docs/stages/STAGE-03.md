# DogCalendar --- Stage 03: Appointments

## Purpose

Stage 03 implements the core appointment-management functionality of
DogCalendar.

The goal is to build the first real application workflow on top of the
authentication, authorization, and database foundation completed in
Stages 01 and 02.

At the end of this stage, the authenticated user should be able to:

-   Create appointments.
-   View appointments.
-   Edit appointments.
-   Delete appointments.
-   Cancel appointments.
-   Mark appointments as completed.
-   Store dog information.
-   Store appointment price.
-   Store optional notes.
-   Validate appointment data.
-   Persist appointment data through Supabase.
-   Receive clear loading, success, empty, and error feedback.

Stage 03 must preserve the security boundaries established in Stage 02.

------------------------------------------------------------------------

# 1. Stage Goal

The intended flow is:

``` text
Authenticated User
       ↓
Appointment UI
       ↓
Appointment Form / List
       ↓
Appointment Service
       ↓
Supabase Client
       ↓
PostgreSQL
       ↓
RLS
       ↓
User's Appointments
```

The important architectural boundary remains:

``` text
React
  ↓
Supabase Client
  ↓
PostgreSQL + RLS
```

The frontend may provide validation and route protection, but it must
never be treated as the final authorization layer.

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
```

The most important references for Stage 03 are:

``` text
AI-CONTEXT.md
ROADMAP.md
ARCHITECTURE.md
DATABASE.md
SECURITY.md
UI-UX.md
```

If an implementation decision conflicts with these documents, stop and
review the conflict before continuing.

Do not silently introduce a different data model, authentication
mechanism, backend architecture, or appointment workflow.

------------------------------------------------------------------------

# 3. Technology

Stage 03 uses the existing project foundation:

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

Do not introduce a new state-management library unless a concrete
requirement justifies it.

Do not introduce a separate appointment database or localStorage-based
persistence.

------------------------------------------------------------------------

# 4. Stage Scope

## In Scope

Stage 03 includes:

-   Appointment data types.
-   Appointment service/data-access logic.
-   Appointment creation.
-   Appointment viewing.
-   Appointment editing.
-   Appointment deletion.
-   Appointment cancellation.
-   Appointment completion.
-   Appointment form.
-   Appointment list/detail UI as appropriate.
-   Client-side appointment validation.
-   Loading states.
-   Empty states.
-   Error states.
-   Success feedback.
-   Supabase integration.
-   Verification that authenticated users only operate on their own
    appointments.

------------------------------------------------------------------------

## Out of Scope

Do not implement the following during Stage 03 unless a technical
dependency makes a minimal implementation necessary:

-   Monthly calendar UI.
-   Calendar month navigation.
-   Dashboard.
-   Monthly earnings dashboard.
-   Mini calendar.
-   PWA functionality.
-   Monthly PDF reports.
-   Customer management.
-   Dog profiles.
-   Services management.
-   Recurring appointments.
-   Notifications.
-   Advanced filtering/search.
-   SaaS functionality.
-   Advanced analytics.

These belong to later stages or future scope.

Stage 03 should establish the appointment-management foundation without
prematurely implementing the rest of the application.

------------------------------------------------------------------------

# 5. Existing Database Model

The appointment model is already defined in `DATABASE.md`.

The current conceptual structure is:

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

The ownership relationship is:

``` text
auth.users.id
      ↓
appointments.user_id
```

Do not introduce a `dogs` table during this stage.

Dog information remains directly on the appointment as defined by the
current database design.

------------------------------------------------------------------------

# 6. Security Boundary

Stage 02 established the security boundary.

Stage 03 must use it rather than replace it.

The expected security model is:

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

All appointment operations must use the authenticated Supabase client.

Do not:

-   Disable RLS.
-   Bypass RLS.
-   Use a service-role key in the browser.
-   Trust a client-provided `user_id`.
-   Implement authorization only in React.
-   Store appointments as the authoritative data in localStorage.

The database remains the final authorization boundary.

------------------------------------------------------------------------

# 7. Step 1 --- Review the Existing Foundation

Before implementing appointment functionality, verify that the Stage 02
foundation still works.

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
[ ] RLS policies exist for SELECT, INSERT, UPDATE, DELETE
[ ] No privileged Supabase key is exposed
```

Do not continue if the authentication or authorization foundation is
broken.

------------------------------------------------------------------------

# 8. Step 2 --- Define Appointment Types

Create TypeScript types representing the database appointment model.

The type should accurately represent:

``` text
id
user_id
dog_name
breed
appointment_date
appointment_time
price
note
status
created_at
updated_at
```

The appointment status should be represented using a constrained
TypeScript type rather than arbitrary strings.

Conceptually:

``` ts
type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled";
```

The exact implementation should follow the project's existing type
conventions.

Avoid duplicating the same appointment type in multiple files.

------------------------------------------------------------------------

# 9. Step 3 --- Define Appointment Input Types

The data required to create or update an appointment is not necessarily
identical to the complete database record.

A creation form should not ask the user to manually provide:

``` text
id
user_id
created_at
updated_at
```

These values are handled by the application/database.

Conceptually, the form input contains:

``` text
dog_name
breed
appointment_date
appointment_time
price
note
status
```

Create appropriate TypeScript types for input data where useful.

The authenticated user's identity should come from the authenticated
Supabase session, not from a manually entered form field.

------------------------------------------------------------------------

# 10. Step 4 --- Establish Appointment Data Access

Appointment database operations should have a clear location in the
application architecture.

A possible structure is:

``` text
src/
└── services/
    └── appointments/
        ├── getAppointments.ts
        ├── createAppointment.ts
        ├── updateAppointment.ts
        └── deleteAppointment.ts
```

However, do not create many tiny files merely for organization.

If the existing project structure supports a simpler appointment
service, use that instead.

The important principle is separation between:

``` text
React UI
   ↓
Appointment data-access logic
   ↓
Supabase
```

Components should not contain large amounts of repeated Supabase query
code.

------------------------------------------------------------------------

# 11. Step 5 --- Implement Appointment Retrieval

Implement the ability to retrieve appointments for the authenticated
user.

The query should operate through the authenticated Supabase client.

The frontend should not need to manually filter out other users' records
to achieve security.

RLS should already restrict returned rows.

Conceptually:

``` text
Authenticated User
       ↓
getAppointments()
       ↓
Supabase
       ↓
RLS
       ↓
User's appointments
```

The service should handle database errors in a predictable way.

### Checkpoint

Verify:

-   Authenticated user can retrieve their appointments.
-   The returned data matches the database model.
-   RLS continues to enforce ownership.
-   Database errors are handled.

------------------------------------------------------------------------

# 12. Step 6 --- Implement Appointment Creation

Implement appointment creation using the existing Supabase client.

The creation flow should be:

``` text
User
 ↓
Appointment Form
 ↓
Client Validation
 ↓
Appointment Service
 ↓
Supabase INSERT
 ↓
RLS WITH CHECK
 ↓
PostgreSQL
```

The application should not allow the user to select or manually type
another user's `user_id`.

The service should associate the appointment with the authenticated
user.

The database RLS policy must remain the final enforcement mechanism.

### Required information

Based on the current database and UI/UX documentation:

-   Dog name --- required.
-   Breed --- optional.
-   Date --- required.
-   Time --- required.
-   Price --- required.
-   Note --- optional.
-   Status --- defaults to `scheduled` for a newly created appointment
    unless the existing database/application design specifies otherwise.

### Checkpoint

Verify:

``` text
Valid appointment
      ↓
Saved successfully
```

and:

``` text
Invalid appointment
      ↓
Rejected with useful feedback
```

------------------------------------------------------------------------

# 13. Step 7 --- Appointment Form UX

The appointment form should follow the UI/UX documentation.

Initial fields:

``` text
Dog name *
Breed
Date *
Time *
Price *
Note
Status
```

The form should:

-   Use clear labels.
-   Clearly identify required fields.
-   Use appropriate HTML input types.
-   Work comfortably on mobile.
-   Display validation errors close to the relevant field.
-   Preserve entered values when validation fails.
-   Provide clear Save and Cancel actions.
-   Avoid unnecessary confirmation steps.

Example English labels:

``` text
Dog name *
Breed
Date *
Time *
Price *
Note
Status
```

The exact wording can be refined during implementation.

------------------------------------------------------------------------

# 14. Step 8 --- Client-Side Validation

Client-side validation exists primarily for user experience.

At minimum, validate:

``` text
Dog name
Date
Time
Price
Status
```

The application should reject obviously invalid input before sending the
request.

Examples:

-   Empty required dog name.
-   Missing appointment date.
-   Missing appointment time.
-   Invalid price.
-   Negative price.
-   Unsupported status.

Client-side validation must not replace database constraints or RLS.

The database remains responsible for data integrity and authorization.

------------------------------------------------------------------------

# 15. Step 9 --- Price Handling

Price represents money.

The database already uses an exact numeric representation.

The frontend should avoid introducing unnecessary floating-point
problems.

The application should:

-   Accept a sensible monetary input.
-   Reject negative values.
-   Convert the form value into the appropriate data representation
    before insertion.
-   Display the value as the demo currency (`kr`) when appropriate.

Example:

``` text
Input:
150

Stored:
150.00

Displayed:
150 kr
```

Do not implement earnings calculations during Stage 03 beyond what is
necessary to verify appointment data.

Monthly earnings belong to later stages.

------------------------------------------------------------------------

# 16. Step 10 --- Appointment Viewing

Implement a simple appointment view appropriate for Stage 03.

The user should be able to see stored appointments without needing the
calendar or dashboard.

The view should display useful information such as:

``` text
13:30
Luna
Shih Tzu
150 kr
scheduled
```

Optional notes can be displayed without overwhelming the main
appointment information.

The UI should clearly distinguish appointment status.

Do not rely only on color.

Use text and/or appropriate icons where useful.

------------------------------------------------------------------------

# 17. Step 11 --- Appointment Editing

The user must be able to edit an existing appointment.

Editing should reuse the appointment form where practical rather than
creating a completely separate form.

The editing flow is:

``` text
Appointment
    ↓
Edit
    ↓
Form populated with existing values
    ↓
User changes values
    ↓
Validation
    ↓
Supabase UPDATE
    ↓
Updated appointment
```

The update must preserve ownership.

The user must not be able to change:

``` text
user_id
```

through the normal appointment form.

RLS must also prevent unauthorized ownership changes.

------------------------------------------------------------------------

# 18. Step 12 --- Cancel Appointment

Cancelling an appointment should change its status to:

``` text
cancelled
```

It should not necessarily delete the appointment.

This preserves the historical record.

Expected flow:

``` text
scheduled
    ↓
cancelled
```

The UI should clearly communicate that the appointment has been
cancelled.

Cancelled appointments should not contribute to finalized earnings
according to the product vision.

Do not implement the full earnings system during this stage.

------------------------------------------------------------------------

# 19. Step 13 --- Mark Appointment as Completed

The user must be able to mark an appointment as:

``` text
completed
```

Expected flow:

``` text
scheduled
    ↓
completed
```

Completed appointments remain stored.

They can later be used by the dashboard and reporting stages for
earnings calculations.

The completion action should provide clear feedback.

------------------------------------------------------------------------

# 20. Step 14 --- Delete Appointment

The user must be able to delete an appointment.

Deletion is destructive and should be treated differently from status
changes.

Because deletion is irreversible at the application level, a
confirmation step may be appropriate.

For example:

``` text
Are you sure you want to delete this appointment?
```

The exact confirmation UX should follow the UI/UX principles.

Do not add excessive confirmation dialogs to normal non-destructive
actions.

The database DELETE RLS policy must continue to enforce ownership.

------------------------------------------------------------------------

# 21. Step 15 --- Loading States

Async appointment operations need appropriate feedback.

At minimum:

### Loading appointments

``` text
Loading appointments...
```

### Saving

``` text
Zapisywanie...
```

### Deleting

``` text
Usuwanie...
```

The exact UI can use spinners, disabled controls, skeletons, or other
appropriate patterns.

Important actions should not appear to do nothing while waiting for
Supabase.

Prevent accidental duplicate submissions where appropriate.

------------------------------------------------------------------------

# 22. Step 16 --- Empty States

The appointment view should handle the case where no appointments exist.

Example:

``` text
No appointments.

[ Add appointment ]
```

The empty state should explain what is happening and provide a useful
next action.

Do not display a completely blank page.

------------------------------------------------------------------------

# 23. Step 17 --- Error States

Appointment errors should be understandable to the user.

Examples:

``` text
Failed to load appointments.
Try again.
```

``` text
Failed to save the appointment.
Try again.
```

``` text
Failed to delete the appointment.
Try again.
```

Avoid exposing raw database or Supabase errors directly.

Technical details can be logged during development when useful.

------------------------------------------------------------------------

# 24. Step 18 --- Success Feedback

Important actions should provide clear feedback.

Examples:

``` text
Appointment saved.
```

``` text
Appointment updated.
```

``` text
Appointment deleted.
```

``` text
Appointment marked as completed.
```

``` text
Appointment cancelled.
```

Feedback should be noticeable but should not unnecessarily interrupt the
workflow.

------------------------------------------------------------------------

# 25. Step 19 --- Appointment Ownership Verification

Stage 02 established RLS, but Stage 03 must verify that the new
appointment functionality continues to respect it.

Test with at least two authenticated users.

### User A

User A should be able to:

``` text
Create
Read
Update
Cancel
Complete
Delete
```

their own appointments.

### User B

User B should not be able to:

``` text
Read User A's appointment
Update User A's appointment
Delete User A's appointment
```

User B should only see their own appointment records.

The test should be performed at the database/service level, not only
through the UI.

------------------------------------------------------------------------

# 26. Step 20 --- Responsive Appointment UX

The appointment functionality must follow the mobile-first UI/UX
strategy.

### Mobile

Prioritize:

-   Single-column form.
-   Large touch targets.
-   Native date/time controls where appropriate.
-   Clear save/cancel actions.
-   Compact appointment cards.
-   Easy editing.

### Tablet

Use additional horizontal space where useful.

### Desktop

Use wider layouts where appropriate, but do not unnecessarily complicate
the workflow.

The appointment workflow should remain understandable across all
supported sizes.

------------------------------------------------------------------------

# 27. Step 21 --- Accessibility

Appointment functionality should follow the project's accessibility
principles.

Verify:

-   Semantic form markup.
-   Proper `<label>` elements.
-   Keyboard-accessible controls.
-   Visible focus states.
-   Accessible buttons.
-   Meaningful button labels.
-   Appropriate heading hierarchy.
-   Error messages associated with relevant fields.
-   Status information is not communicated by color alone.
-   Touch targets are sufficiently large.

Avoid icon-only controls when text or accessible labels would improve
clarity.

------------------------------------------------------------------------

# 28. Step 22 --- Code Quality

Before completing the stage:

-   Remove temporary test code.
-   Remove unused imports.
-   Remove unnecessary dependencies.
-   Avoid duplicated Supabase queries.
-   Avoid duplicating appointment types.
-   Keep appointment service logic separate from UI where practical.
-   Keep components understandable.
-   Keep TypeScript types accurate.
-   Do not introduce unnecessary abstractions.
-   Do not duplicate authorization logic throughout the UI.
-   Keep RLS as the database authorization boundary.

The goal is a maintainable appointment feature, not a generalized
enterprise data layer.

------------------------------------------------------------------------

# 29. Step 23 --- Testing

Before completing Stage 03, test the following.

## Create

``` text
[ ] Valid appointment can be created
[ ] Required fields are validated
[ ] Optional fields work
[ ] Price validation works
[ ] New appointment defaults to scheduled
[ ] Appointment persists after page reload
```

## Read

``` text
[ ] User can see their appointments
[ ] Empty state works
[ ] Appointment information is displayed correctly
[ ] Status is displayed correctly
```

## Update

``` text
[ ] Existing appointment can be edited
[ ] Existing values populate the form
[ ] Validation applies to updates
[ ] Updated values persist
```

## Status Changes

``` text
[ ] Appointment can be cancelled
[ ] Appointment can be marked completed
[ ] Status persists after reload
```

## Delete

``` text
[ ] Appointment can be deleted
[ ] Confirmation is handled appropriately
[ ] Deleted appointment no longer appears
```

## Security

``` text
[ ] User A cannot read User B's appointments
[ ] User A cannot update User B's appointments
[ ] User A cannot delete User B's appointments
[ ] User cannot change appointment ownership
[ ] RLS remains enabled
```

## UX

``` text
[ ] Loading states work
[ ] Error states work
[ ] Success feedback works
[ ] Empty state works
[ ] Mobile layout works
[ ] Keyboard interaction works
```

------------------------------------------------------------------------

# 30. Stage Checkpoint

Before marking Stage 03 complete:

``` text
[x] Appointment types exist
[x] Appointment data access exists
[x] Create works
[x] Read works
[x] Update works
[x] Delete works
[x] Cancel works
[x] Complete works
[x] Client-side validation works
[x] Loading states work
[x] Error states work
[x] Empty states work
[x] Success feedback works
[x] Appointments persist in PostgreSQL
[x] RLS still protects ownership
[x] Cross-user access is rejected
[x] No privileged credentials are exposed
[x] Accessibility basics are verified
[x] Mobile layout works
[x] No critical issues remain
```

All Stage 03 checkpoint requirements have been implemented and verified.

------------------------------------------------------------------------

# 31. Definition of Done

Stage 03 is complete when:

1.  The authenticated user can create appointments.
2.  The authenticated user can view appointments.
3.  The authenticated user can edit appointments.
4.  The authenticated user can delete appointments.
5.  The authenticated user can cancel appointments.
6.  The authenticated user can mark appointments as completed.
7.  Appointment data is stored in PostgreSQL.
8.  Client-side validation provides useful feedback.
9.  Loading, error, empty, and success states are handled.
10. Appointment ownership continues to be enforced by RLS.
11. Users cannot access another user's appointment data.
12. The appointment workflow works on mobile.
13. Basic accessibility requirements are satisfied.
14. No privileged credentials are exposed.
15. The implementation follows `ARCHITECTURE.md`.
16. The implementation follows `DATABASE.md`.
17. The implementation follows `SECURITY.md`.
18. The implementation follows `UI-UX.md`.
19. Relevant documentation is updated.
20. No known critical issues remain.
21. The project is ready for Stage 04 --- Calendar.

------------------------------------------------------------------------

# 32. Documentation Updates

Stage 03 has now been completed and verified.

The project documentation has been synchronized to reflect completion:

``` text
docs/AI-CONTEXT.md
docs/ROADMAP.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/SECURITY.md
```

`ROADMAP.md` now records:

``` text
Stage 03 — Appointments
Status: Complete
```

The current stage is now:

``` text
Stage 04 — Calendar
```

`AI-CONTEXT.md` now describes the completed appointment functionality
and identifies Stage 04 as the current stage.

No architectural, database, security, or UI/UX changes were required as
a result of the Stage 03 review.

Stage 03 is now officially complete.

------------------------------------------------------------------------

# 33. How We Will Work Through This Stage

Stage 03 was completed incrementally.

Do not attempt to implement the entire stage in one step.

Recommended workflow:

``` text
Read Stage 03
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

Important implementation decisions were reviewed before continuing.

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

No known critical issues remain.

------------------------------------------------------------------------

# 34. Important Rule for AI Assistance

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
```

Do not introduce:

-   A custom backend.
-   A second database.
-   A separate authentication system.
-   A new appointment data model.
-   A new state-management library.
-   A service-role key in the browser.
-   LocalStorage as the primary appointment store.

unless a concrete requirement justifies the change and the architectural
trade-off has been reviewed.

If a better approach is discovered, explain the trade-off before
changing the project direction.

------------------------------------------------------------------------

# 35. Stage Status

**Stage:** 03 --- Appointments

**Status:** Complete

**Previous Stage:** 02 --- Authentication & Authorization --- Complete

**Next Stage:** 04 --- Calendar

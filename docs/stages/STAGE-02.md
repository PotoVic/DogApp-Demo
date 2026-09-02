# DogCalendar — Stage 02: Authentication & Authorization

## Purpose

Stage 02 adds secure authentication and database-level authorization to DogCalendar.

The goal is not to build appointment-management functionality.

The goal is to establish a secure boundary so that:

- Users can authenticate.
- Users can log out.
- Authenticated sessions are handled correctly.
- Protected application areas require authentication.
- User-owned database data is protected by Row Level Security (RLS).
- Users can only access their own appointments.
- Authorization is enforced by PostgreSQL rather than only by the frontend.

Stage 02 must be completed and tested before moving to Stage 03 — Appointments.

---

# 1. Stage Goal

At the end of Stage 02, the application should have this security flow:

```text
User
  ↓
Supabase Auth
  ↓
Authenticated Session
  ↓
Protected React Application
  ↓
Supabase Client
  ↓
PostgreSQL
  ↓
RLS Policies
  ↓
User-Owned Appointments
```

The important distinction is:

```text
Authentication
      ↓
Who is the user?

Authorization
      ↓
What can that user access?
```

Supabase Auth handles authentication.

PostgreSQL Row Level Security handles database-level authorization.

Frontend route protection improves the user experience but is not considered a security boundary.

---

# 2. Reference Documentation

Before working on this stage, review:

```text
README.md
docs/AI-CONTEXT.md
docs/VISION.md
docs/ROADMAP.md
docs/ARCHITECTURE.md
docs/DATABASE.md
docs/SECURITY.md
docs/UI-UX.md
docs/stages/STAGE-01.md
```

These documents define the current project direction.

The most important references for Stage 02 are:

```text
ROADMAP.md
ARCHITECTURE.md
DATABASE.md
SECURITY.md
AI-CONTEXT.md
```

If an implementation decision conflicts with these documents, stop and review the conflict before changing the implementation.

Do not silently introduce a new architecture, library, authentication mechanism, or security model.

---

# 3. Technology

Stage 02 uses the existing project foundation:

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend / Platform

- Supabase

### Authentication

- Supabase Auth

### Database

- PostgreSQL through Supabase

### Authorization

- PostgreSQL Row Level Security (RLS)

Do not introduce a custom authentication system.

Do not store passwords in the application database.

Do not introduce a custom backend simply to handle authentication.

---

# 4. Stage Scope

## In Scope

Stage 02 includes:

- Supabase Auth configuration.
- Authentication state handling.
- Login.
- Logout.
- Protected application routes.
- Authenticated Supabase sessions.
- RLS policies for appointments.
- Appointment ownership enforcement.
- Authorization testing.
- Authentication error handling.
- Security verification.
- Documentation updates.

---

## Out of Scope

Do not implement the following during Stage 02:

- Full appointment CRUD.
- Appointment creation UI beyond what is strictly necessary to test authorization.
- Appointment editing UI.
- Appointment deletion UI.
- Calendar functionality.
- Dashboard functionality.
- Earnings calculations.
- Monthly reports.
- PDF generation.
- PWA functionality.
- Customer management.
- Dog profiles.
- Advanced analytics.
- SaaS functionality.

These belong to later stages or future scope.

Stage 03 will build the actual appointment-management functionality.

---

# 5. Security Model

DogCalendar uses a layered security model:

```text
Authentication
      ↓
Route Protection
      ↓
Supabase Client
      ↓
PostgreSQL
      ↓
RLS
      ↓
Database Constraints
```

Each layer has a different responsibility.

### Authentication

Identifies the current user.

### Route Protection

Prevents unauthenticated users from entering protected application areas through the normal UI.

### Supabase Client

Communicates with Supabase using the authenticated session.

### RLS

Determines whether the authenticated user is allowed to access a database row.

### Database Constraints

Protect data integrity.

No single frontend check should be treated as the security boundary.

---

# 6. Step 1 — Review the Existing Authentication Foundation

Before changing code, verify the Stage 01 foundation is still working.

Verify:

- React starts.
- TypeScript compiles.
- Vite starts.
- Supabase client initializes.
- `.env.local` is loaded.
- The existing `appointments` table exists.
- RLS is enabled on `appointments`.
- No service-role key is present in frontend code.

Expected architecture:

```text
React
  ↓
Supabase Client
  ↓
Supabase
  ↓
PostgreSQL
```

Do not continue if the Stage 01 foundation is broken.

### Checkpoint

```text
[ ] Frontend starts
[ ] Supabase client works
[ ] Environment variables work
[ ] appointments table exists
[ ] RLS is enabled
[ ] No privileged key is exposed
```

---

# 7. Step 2 — Configure Supabase Auth

Configure authentication through Supabase Auth.

The authentication method should be kept as simple as possible for the current private application.

Do not add authentication providers or flows that are not required by the project.

Supabase Auth should be responsible for:

- User authentication.
- Password handling where applicable.
- Authentication sessions.
- Sign-in.
- Sign-out.
- Authentication state.

The application must not implement its own password storage system.

### Checkpoint

Verify that Supabase Auth is available and that the project has the configuration required to authenticate a user.

Do not build the login UI yet.

---

# 8. Step 3 — Establish the Authentication Service Boundary

Create a small, understandable location for authentication-related application logic if one is required by the implementation.

Keep the Supabase client itself in its existing location:

```text
src/services/supabase/client.ts
```

Authentication logic should use the existing Supabase client.

Do not create a large authentication abstraction layer.

Do not introduce a repository pattern or state-management library.

The goal is to keep authentication logic understandable and easy to maintain.

### Checkpoint

Verify:

- Authentication code uses the existing Supabase client.
- No duplicate Supabase clients are created.
- No passwords are stored by the application.
- No privileged credentials are used.

---

# 9. Step 4 — Handle the Authenticated Session

The application must understand whether a user currently has an authenticated Supabase session.

The application should be able to represent at least:

```text
Loading authentication state
        ↓
Authenticated
        ↓
Unauthenticated
```

The exact React implementation should follow the project's existing architecture and avoid unnecessary global state.

The application should respond correctly when authentication state changes.

### Important

Do not manually implement authentication tokens.

Do not store passwords.

Do not treat local storage as the source of truth for authentication.

Supabase Auth is responsible for session management.

### Checkpoint

Verify that the application can determine whether a valid authenticated session exists.

---

# 10. Step 5 — Implement Login

Create the login experience required by the current application.

The login UI should:

- Be simple.
- Use clear labels.
- Provide appropriate validation.
- Display understandable authentication errors.
- Provide loading feedback during authentication.
- Avoid exposing technical Supabase errors directly to the user.
- Work on mobile.

The UI should follow the UI/UX principles already defined for authentication.

The exact authentication fields and provider should match the Supabase Auth configuration established in Step 2.

Do not add registration unless a real project requirement is introduced.

### Expected flow

```text
Unauthenticated User
        ↓
Login
        ↓
Supabase Auth
        ↓
Authenticated Session
        ↓
Protected Application
```

### Checkpoint

Verify:

```text
[ ] Valid credentials can authenticate
[ ] Invalid credentials are handled
[ ] Loading state is shown appropriately
[ ] User receives understandable feedback
[ ] Successful authentication creates an authenticated session
```

---

# 11. Step 6 — Implement Logout

Add logout functionality to the protected application.

Logout should:

1. End the Supabase authentication session.
2. Clear protected application state where appropriate.
3. Return the user to the login experience or another appropriate unauthenticated route.
4. Prevent continued access to protected application functionality.

Expected flow:

```text
Authenticated User
        ↓
Logout
        ↓
Session removed
        ↓
Unauthenticated
        ↓
Login
```

### Checkpoint

Verify:

- Logout succeeds.
- The authenticated session is removed.
- Protected UI is no longer accessible.
- The user can authenticate again afterward.

---

# 12. Step 7 — Protect Application Routes

Protected application pages should only be available to authenticated users.

Conceptually:

```text
User
 │
 ├── Unauthenticated
 │        ↓
 │      Login
 │
 └── Authenticated
          ↓
     Protected App
```

The route protection should be implemented using the application's existing routing architecture.

Do not introduce a new routing system if one already exists.

Frontend route protection is a UX layer, not the final security boundary.

A user must still be prevented from accessing private data by RLS.

### Checkpoint

Verify:

```text
Unauthenticated user
        ↓
Cannot access protected application

Authenticated user
        ↓
Can access protected application
```

Also verify that direct navigation to a protected route behaves correctly.

---

# 13. Step 8 — Create Appointment RLS Policies

The `appointments` table already has RLS enabled from Stage 01.

Stage 02 now implements the actual authorization policies.

The ownership relationship is:

```text
auth.users.id
      ↓
appointments.user_id
```

The intended policy model is:

```text
Authenticated User
        │
        ├── Own appointment → Allowed
        │
        └── Other user's appointment → Denied
```

Policies must cover:

- SELECT
- INSERT
- UPDATE
- DELETE

The policies must use the authenticated user's identity.

Do not trust a user-provided `user_id` value without database-level verification.

---

# 14. Step 9 — SELECT Authorization

A user must only be able to read their own appointments.

Conceptually:

```text
appointment.user_id = authenticated user ID
```

The policy must prevent:

```text
User A
  ↓
User B's appointment
  ↓
Denied
```

and allow:

```text
User A
  ↓
User A's appointment
  ↓
Allowed
```

### Checkpoint

Verify that an authenticated user can access their own rows but cannot read another user's rows.

---

# 15. Step 10 — INSERT Authorization

A user must only be able to create an appointment belonging to themselves.

The database must prevent a user from creating:

```text
user_id = another user's ID
```

The frontend should not be considered sufficient protection.

The database policy must enforce ownership.

### Checkpoint

Verify:

```text
User A creates appointment for User A
        ↓
Allowed

User A creates appointment for User B
        ↓
Denied
```

---

# 16. Step 11 — UPDATE Authorization

A user must only be able to update their own appointments.

The database must protect both:

```text
Existing ownership
```

and:

```text
New ownership
```

An update must not allow a user to take ownership of another user's appointment or transfer an appointment to another user without an explicitly authorized future requirement.

### Checkpoint

Verify:

```text
User A updates User A's appointment
        ↓
Allowed

User A updates User B's appointment
        ↓
Denied
```

---

# 17. Step 12 — DELETE Authorization

A user must only be able to delete their own appointments.

Verify:

```text
User A deletes User A's appointment
        ↓
Allowed

User A deletes User B's appointment
        ↓
Denied
```

Do not build the full appointment-management UI during this step.

The goal is authorization testing.

---

# 18. Step 13 — Authorization Testing

Authorization must be tested independently of frontend route protection.

The security model must work even if someone bypasses the React UI and communicates directly with Supabase.

At minimum, test:

### User A

- Can read User A's appointment.
- Can create User A's appointment.
- Can update User A's appointment.
- Can delete User A's appointment.

### User A against User B

- Cannot read User B's appointment.
- Cannot create an appointment belonging to User B.
- Cannot update User B's appointment.
- Cannot delete User B's appointment.

### Unauthenticated user

- Cannot access protected application functionality.
- Cannot access private appointment data.

The tests should verify the database behavior, not only whether buttons are hidden in React.

---

# 19. Step 14 — Authentication Error Handling

Authentication errors should be translated into useful user-facing messages.

Avoid displaying raw technical errors such as:

```text
PostgREST error
```

or internal configuration details.

Prefer clear messages appropriate for the user.

Examples:

```text
Nie udało się zalogować.
Sprawdź dane logowania i spróbuj ponownie.
```

The exact Polish wording can be refined during implementation.

Loading and error states should follow the UI/UX documentation.

---

# 20. Step 15 — Security Review

Before completing Stage 02, verify:

### Authentication

```text
[ ] Valid user can log in
[ ] Invalid credentials are handled
[ ] Authenticated session is detected
[ ] User can log out
[ ] Session state changes are handled correctly
```

### Protected Routes

```text
[ ] Unauthenticated users cannot access protected pages
[ ] Authenticated users can access protected pages
[ ] Direct navigation is handled correctly
```

### RLS

```text
[ ] RLS is enabled
[ ] SELECT policy works
[ ] INSERT policy works
[ ] UPDATE policy works
[ ] DELETE policy works
[ ] User ownership is enforced
```

### Secrets

```text
[ ] No service-role key exists in frontend code
[ ] No secret credentials are committed
[ ] .env.local remains ignored
```

### Database

```text
[ ] Existing constraints still work
[ ] user_id ownership relationship works
[ ] No unrelated tables were introduced
```

---

# 21. Step 16 — Code Quality

Before completing the stage:

- Remove temporary authentication test code.
- Remove unused imports.
- Remove unnecessary dependencies.
- Keep authentication logic understandable.
- Avoid duplicate Supabase clients.
- Avoid premature abstractions.
- Keep route protection easy to understand.
- Keep database authorization in RLS rather than duplicating security logic throughout React.
- Keep TypeScript types accurate.
- Keep the existing project structure aligned with `ARCHITECTURE.md`.

The goal is a secure and understandable authentication foundation, not a large authentication framework.

---

# 22. Stage Checkpoint

Before marking Stage 02 complete, the following should be true:

```text
[ ] Supabase Auth is configured
[ ] Login works
[ ] Invalid login is handled
[ ] Authenticated session is detected
[ ] Logout works
[ ] Protected routes work
[ ] Unauthenticated users cannot access protected pages
[ ] RLS policies exist for appointments
[ ] SELECT authorization works
[ ] INSERT authorization works
[ ] UPDATE authorization works
[ ] DELETE authorization works
[ ] Users cannot access another user's appointments
[ ] Frontend protection is not relied upon as the security boundary
[ ] No privileged credentials are exposed
[ ] No critical security issues remain
```

---

# 23. Definition of Done

Stage 02 is complete when:

1. Supabase Auth is configured.
2. A valid user can log in.
3. Invalid authentication attempts are handled correctly.
4. Authenticated sessions are handled correctly.
5. Logout works correctly.
6. Protected application routes require authentication.
7. RLS policies protect the `appointments` table.
8. Users can only read their own appointments.
9. Users can only create appointments belonging to themselves.
10. Users can only update their own appointments.
11. Users can only delete their own appointments.
12. Authorization works even when frontend protections are bypassed.
13. No privileged credentials are exposed to the browser.
14. The implementation follows `ARCHITECTURE.md`.
15. The implementation follows `SECURITY.md`.
16. Relevant documentation has been updated.
17. No known critical authentication or authorization issues remain.
18. The project is ready for Stage 03 — Appointments.

The application should now have a secure foundation for appointment functionality.

---

# 24. Documentation Updates

When Stage 02 is complete, update the relevant documentation.

At minimum:

```text
docs/AI-CONTEXT.md
docs/ROADMAP.md
docs/ARCHITECTURE.md
docs/SECURITY.md
```

Update the roadmap status:

```text
Stage 02 — Authentication & Authorization
Status: Complete
```

Then set the current stage to:

```text
Stage 03 — Appointments
```

Update `AI-CONTEXT.md` so that it reflects:

```text
Authentication implemented
Authorization implemented
RLS policies implemented
Protected routes implemented
```

Update `SECURITY.md` so that its current security status reflects the actual implementation and testing results.

Update `ARCHITECTURE.md` if the authentication implementation introduced any architectural decisions.

Do not mark Stage 02 complete simply because the login screen works.

Database-level authorization must also be implemented and tested.

---

# 25. How We Will Work Through This Stage

This stage must be completed incrementally.

Do not attempt to implement the entire stage in one step.

Recommended workflow:

```text
Read Stage 02
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

The developer should understand each important authentication and authorization decision before moving forward.

When something does not work, stop at that step and investigate it before continuing.

---

# 26. Important Rule for AI Assistance

AI assistance should follow the project documentation.

Before proposing a significant implementation change, consider:

```text
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

- New authentication libraries.
- New state-management libraries.
- A custom backend.
- A custom password system.
- New database tables.
- New authorization mechanisms.

unless there is a clear requirement and the architectural trade-off has been reviewed.

If a better approach is discovered, explain the trade-off before changing the project direction.

---

# 27. Stage Status

**Stage:** 02 — Authentication & Authorization

**Status:** Complete

**Previous Stage:** 01 — Project Foundation — Complete

**Next Stage:** 03 — Appointments
# DogCalendar — Stage 01: Project Foundation

## Purpose

Stage 01 creates the technical foundation for DogCalendar.

The goal is not to build the complete application.

The goal is to create a clean, working project that:

- Runs locally.
- Uses React + TypeScript + Vite.
- Has a clear project structure.
- Uses the planned CSS approach.
- Has a Supabase project.
- Can connect the frontend to Supabase.
- Has the initial database schema planned in `DATABASE.md`.
- Has the environment configuration in place.
- Is ready for Stage 02 authentication work.

---

# 1. Stage Goal

At the end of Stage 01, we should have:

```text
React + TypeScript + Vite
        ↓
DogCalendar project
        ↓
Supabase connection
        ↓
PostgreSQL database foundation
        ↓
Ready for authentication
```

The application does not need to have a finished dashboard, calendar, appointment system, or authentication flow yet.

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
```

These documents define the current project direction.

If a significant implementation decision conflicts with them, stop and review the relevant documentation before continuing.

---

# 3. Technology

Stage 01 uses:

### Frontend

- React
- TypeScript
- Vite
- CSS

### Backend

- Supabase

### Database

- PostgreSQL through Supabase

### Package Manager

Use the package manager selected for the local project setup.

The project should not introduce unnecessary dependencies.

---

# 4. Stage Scope

## In Scope

Stage 01 includes:

- Project initialization.
- Basic development tooling.
- Folder structure.
- CSS foundation.
- Initial application shell.
- Supabase project creation.
- Supabase client setup.
- Environment variables.
- Initial database schema.
- Basic database connection test.
- Basic project verification.
- Documentation updates.

---

## Out of Scope

Do not implement the following during Stage 01:

- Login UI.
- Registration UI.
- Logout functionality.
- Protected routes.
- Complete authentication flow.
- Full appointment CRUD.
- Calendar functionality.
- Dashboard functionality.
- Earnings calculations.
- PDF reports.
- PWA functionality.
- Customer management.
- Dog profiles.
- Advanced analytics.

These belong to later stages.

---

# 5. Step 1 — Create the React Project

Create the application using React + TypeScript + Vite.

The project should be created as a normal Vite application.

After creation, verify that the development server works.

Expected result:

```text
Browser
   ↓
DogCalendar
   ↓
Vite development server
   ↓
React application loads successfully
```

### Checkpoint

Verify:

- The project starts without errors.
- The browser displays the React application.
- TypeScript works.
- Vite works.

Do not continue if the project does not start correctly.

---

# 6. Step 2 — Establish the Project Structure

Create a structure that follows the architecture documentation.

Initial structure:

```text
src/
├── components/
├── features/
├── hooks/
├── pages/
├── services/
├── styles/
├── types/
├── utils/
├── App.tsx
└── main.tsx
```

Not every directory needs to contain code immediately.

The purpose is to establish clear areas for future functionality.

Do not create large numbers of empty subdirectories just for the sake of organization.

---

# 7. Step 3 — Establish CSS Foundation

DogCalendar uses raw CSS rather than Sass.

The CSS architecture should support:

- Mobile-first development.
- CSS custom properties.
- Consistent spacing.
- Typography.
- Colors.
- Borders.
- Radii.
- Transitions.
- Responsive breakpoints.

Responsive breakpoints:

```text
0rem
48rem
64rem
```

Base styles should target mobile.

Tablet and desktop styles should progressively enhance the base experience.

Do not build the complete visual design during this step.

Only establish the foundation.

---

# 8. Step 4 — Create the Initial Application Shell

Create a minimal application shell.

The application should be able to display:

- Application name.
- Basic page structure.
- Placeholder content.
- Responsive layout foundation.

The shell should not yet implement the complete dashboard.

The purpose is to verify that the application's basic layout architecture works.

---

# 9. Step 5 — Create the Supabase Project

Create a Supabase project for DogCalendar.

The project should use PostgreSQL as provided by Supabase.

Record the project configuration required by the frontend.

Do not expose privileged credentials.

The Supabase service-role key must never be placed in frontend code.

---

# 10. Step 6 — Install and Configure the Supabase Client

Install the official Supabase JavaScript client.

Create a dedicated location for the Supabase client configuration.

For example:

```text
src/
└── services/
    └── supabase/
        └── client.ts
```

The exact structure may be adjusted if there is a clear reason.

The Supabase client should be initialized using environment variables.

---

# 11. Step 7 — Environment Variables

Create the local environment configuration.

Conceptually:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The actual values should be stored locally.

Do not commit real credentials to Git.

Create an example environment file if useful:

```text
.env.example
```

The example file should contain variable names but no real credentials.

---

# 12. Step 8 — Configure Git Security

Ensure local environment files containing credentials are ignored.

The repository should not accidentally commit:

```text
.env
.env.local
.env.*.local
```

Before continuing, inspect Git status and verify that local secret files are not staged.

---

# 13. Step 9 — Create the Initial Database Schema

Create the initial database foundation according to `DATABASE.md`.

The initial application data model is centered around:

```text
auth.users
     │
     ▼
appointments
```

The planned appointment fields are:

```text
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

Important:

The database schema should be implemented deliberately.

Do not add unrelated tables such as:

```text
dogs
customers
services
invoices
```

during this stage unless the project requirements change.

---

# 14. Database Constraints

The initial schema should enforce important data integrity rules.

Examples:

- `id` is unique.
- `user_id` is required.
- `dog_name` is required.
- `appointment_date` is required.
- `appointment_time` is required.
- `price` cannot be negative.
- `status` uses the planned allowed values.

The exact SQL implementation should follow the final database design.

---

# 15. RLS Timing

The database foundation may be created during Stage 01.

However, the complete authentication and authorization implementation belongs to Stage 02.

Stage 01 should therefore:

- Establish the database table.
- Prepare the ownership relationship.
- Avoid pretending the application is secure before RLS policies have been implemented and tested.

Stage 02 will implement and verify:

- Authentication.
- Protected routes.
- RLS.
- User-specific access policies.
- Authorization testing.

The application must not be considered production-secure until Stage 02 is complete.

---

# 16. Step 10 — Test Supabase Connection

Create a minimal test proving that the frontend can communicate with Supabase.

The test should be simple and temporary if possible.

The goal is only to verify:

```text
React
  ↓
Supabase Client
  ↓
Supabase
  ↓
PostgreSQL
```

Do not build application functionality around the test.

---

# 17. Step 11 — Verify the Development Environment

Verify:

### Frontend

- React starts.
- TypeScript compiles.
- Vite starts.
- CSS loads.

### Supabase

- Supabase project exists.
- Environment variables are loaded.
- Supabase client initializes.
- Frontend can communicate with Supabase.

### Database

- Initial schema exists.
- Important constraints exist.
- No unintended tables were created.

### Git

- Project is tracked correctly.
- Secret environment files are ignored.
- No secrets are committed.

---

# 18. Step 12 — Code Quality

Before completing the stage:

- Remove unused starter code.
- Remove unnecessary dependencies.
- Keep components small and understandable.
- Avoid premature abstractions.
- Keep naming consistent.
- Use TypeScript appropriately.
- Keep the project structure aligned with `ARCHITECTURE.md`.

The goal is a clean starting point, not a large amount of code.

---

# 19. Stage Checkpoint

Before marking Stage 01 complete, the following should be true:

```text
[ ] React + TypeScript + Vite works
[ ] Project structure exists
[ ] CSS foundation exists
[ ] Application shell exists
[ ] Supabase project exists
[ ] Supabase client is configured
[ ] Environment variables work
[ ] Secret files are ignored by Git
[ ] Initial database schema exists
[ ] Database constraints exist
[ ] Supabase connection has been tested
[ ] No critical errors remain
```

---

# 20. Definition of Done

Stage 01 is complete when:

1. The project runs locally.
2. The frontend is connected to Supabase.
3. Environment configuration works.
4. The initial database structure exists.
5. The project follows the documented architecture.
6. The project uses the planned mobile-first CSS strategy.
7. No sensitive credentials are committed.
8. The project is ready for authentication implementation.
9. Relevant documentation has been updated.
10. The developer understands the purpose of the main pieces created during the stage.

---

# 21. Documentation Updates

When Stage 01 is complete:

Update:

```text
docs/AI-CONTEXT.md
docs/ROADMAP.md
docs/ARCHITECTURE.md
docs/DATABASE.md
```

Update the current stage from:

```text
Stage 01 — Project Foundation
Status: Not Started
```

to:

```text
Stage 01 — Project Foundation
Status: Complete
```

Then set the current stage to:

```text
Stage 02 — Authentication & Authorization
```

Do not mark the stage complete simply because the code exists.

It must also be tested.

---

# 22. How We Will Work Through This Stage

This stage should be completed incrementally.

Do not attempt to complete the entire document in one step.

Recommended workflow:

```text
Read Stage 01
      ↓
Step 1
      ↓
Implement
      ↓
Test
      ↓
Explain / review
      ↓
Next step
```

The developer should understand each important implementation decision before moving forward.

When something does not work, stop at that step and investigate it before continuing.

---

# 23. Important Rule for AI Assistance

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

Do not introduce new libraries, architecture patterns, or features without a reason.

If a better approach is discovered, explain the trade-off before changing the project direction.

---

# 24. Stage Status

**Stage:** 01 — Project Foundation

**Status:** Complete

**Next Stage:** 02 — Authentication & Authorization
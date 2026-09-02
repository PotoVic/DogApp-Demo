# SpaKalendar — Full Vitest suite

This suite is designed for the current source and tests application logic without
writing to the real Supabase database.

## Coverage areas

- Calendar utilities
- Appointment calculations
- Appointment service CRUD/error handling
- Saved Dog service CRUD and reuse logic
- Auth service delegation
- `useAppointmentManager`
- `useSavedDogs`
- `useAuth`
- Appointment modal behavior
- Toast timing/behavior

## Install test dependencies

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

## Run

```bash
npx vitest run
```

Watch mode:

```bash
npx vitest
```

## Important

The Supabase service tests use mocks. They do NOT create, update, or delete real
appointments or saved dogs.

Vitest cannot prove PostgreSQL RLS. RLS still needs separate database-level
cross-user tests.

The suite intentionally tests meaningful behavior rather than trying to inflate
coverage by testing trivial JSX or third-party libraries.

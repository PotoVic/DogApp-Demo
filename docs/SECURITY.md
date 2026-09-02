# SpaKalendar — Security

## Authorization model

```text
Supabase Auth
     ↓
Authenticated user
     ↓
Supabase Client
     ↓
PostgreSQL RLS
     ↓
Authorized rows
```

RLS is the final authorization boundary.

Frontend filtering or route protection must never be treated as sufficient security.

## Saved Dogs

Saved Dogs are owned by:

```text
saved_dogs.user_id = authenticated user's id
```

RLS covers:

- SELECT.
- INSERT.
- UPDATE.
- DELETE.

Ownership reassignment is not allowed.

## RLS verification

Stage 09 was tested with separate users.

Observed behavior:

- A user sees their own Saved Dogs.
- A user does not see another user's Saved Dogs.
- Own Saved Dog CRUD works.
- Cross-user access is blocked by ownership/RLS.
- Saved Dog deletion does not affect historical appointments.

This completes the Saved Dog RLS verification for Stage 09.

## Historical data

Saved Dog changes do not become historical appointment changes.

Appointments remain independently protected and remain the source of truth.

## Credentials

Never expose Supabase service-role credentials or other privileged secrets in browser code.

**Last Updated:** 2026-09-02

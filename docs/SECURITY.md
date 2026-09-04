# DogCalendar — Security

## Security status

**Security review updated:** 2026-09-04

The application uses a layered security model:

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
     ↓
Vercel browser security headers
```

PostgreSQL RLS is the final authorization boundary. Frontend route protection,
component state, and client-side filtering must never be treated as sufficient
security.

## Authentication

Authentication is handled by Supabase Auth.

The browser uses the public Supabase URL and public anon/publishable key. A
Supabase service-role/secret key must never be shipped to the frontend or
committed to the repository.

The current project intentionally does not enable Supabase leaked-password
protection. This remains a Security Advisor hardening warning, but it is not
considered a blocker for the current application scope.

## Row Level Security

RLS is enabled for both user-owned application tables:

- `appointments`
- `saved_dogs`

Each table has ownership policies for:

- SELECT
- INSERT
- UPDATE
- DELETE

The ownership condition is based on the authenticated user's UUID:

```sql
auth.uid() = user_id
```

For INSERT, the ownership check is enforced with `WITH CHECK`. For operations
that read or modify existing rows, ownership is enforced with `USING` as
appropriate.

Ownership reassignment is blocked by the RLS model.

## RLS verification

The security review on 2026-09-04 included:

- Inspection of the `appointments` RLS policies.
- Inspection of the `saved_dogs` RLS policies.
- Verification that the policies apply to `authenticated` users.
- Manual cross-user testing with two separate users.

Observed behavior:

- User A sees User A's appointments and Saved Dogs.
- User A does not see User B's appointments or Saved Dogs.
- User B sees User B's appointments and Saved Dogs.
- User B does not see User A's appointments or Saved Dogs.

This confirms the primary cross-user read-isolation boundary in the deployed
application.

## Database integrity

The `appointments` table was reviewed for database-level integrity rules.
Current protections include:

- `id` primary key.
- `user_id` NOT NULL.
- `user_id` foreign key to `auth.users(id)`.
- Required appointment date/time fields.
- `dog_name` NOT NULL.
- `price` NOT NULL with a non-negative check constraint.
- `status` NOT NULL with an allowed-status check constraint.

The `saved_dogs` table was also reviewed and has required `id`, `user_id`,
`name`, and timestamp fields, plus a foreign key from `user_id` to
`auth.users(id)`.

Frontend validation remains useful for UX, but database constraints are the
actual integrity boundary when requests are sent directly to Supabase.

## Privileged function: `rls_auto_enable()`

The project contains `public.rls_auto_enable()` as a `SECURITY DEFINER`
function used by the `ensure_rls` event trigger.

The function was reviewed and uses:

```text
search_path = pg_catalog
```

This prevents unsafe object resolution through a mutable search path.

Direct `EXECUTE` access for `PUBLIC`, `anon`, and `authenticated` was revoked.
The event trigger remains in place so the function continues to perform its
administrative purpose without being exposed as a normal application API
function.

## Browser security headers

Vercel is configured with baseline browser security headers:

```text
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
```

These headers were deployed and verified against the live application.

A strict Content-Security-Policy was intentionally not added during this
review because the application depends on external/browser resources and a
CSP should be introduced only after verifying all required resource and
connection origins.

## PWA / caching

The PWA service worker is configured for application assets. Private Supabase
appointment responses are not intentionally added to a broad runtime cache.
Authorization therefore remains dependent on the live Supabase session and
RLS rather than cached private API responses.

## Client-side security review

The application was reviewed for common browser-side dangerous patterns.
No application use was found for:

- `dangerouslySetInnerHTML`
- `innerHTML`
- `eval()`
- `new Function()`
- `document.cookie`
- application `localStorage`
- application `sessionStorage`
- application IndexedDB

The application does not implement its own password storage or custom JWT
system.

## Saved Dogs and appointment synchronization

Saved Dog synchronization is an intentional product behavior for the current
single-user workflow.

When a Saved Dog is edited, the application may update matching appointment
records so the groomer can keep the dog's information consistent across the
appointment history.

This behavior is protected by the same authenticated Supabase session and
appointment RLS policies. It must not be treated as a mechanism for bypassing
RLS.

The current matching logic uses identifying information such as normalized
name, phone number, and breed and contains ambiguity safeguards. Saved Dog
names are not unique.

## Security Advisor

Supabase Security Advisor was reviewed during the 2026-09-04 security pass.

Result at the time of review:

- 0 Errors.
- The remaining warning concerns leaked-password protection, which is
  intentionally not enabled for the current project scope.

The previous `rls_auto_enable()` permission warnings were addressed by
restricting direct function execution permissions.

## Known limitations / future hardening

These items are not considered blockers for the current application, but may
be addressed in future work:

- Add version-controlled Supabase migrations/policies to the repository.
- Add automated integration tests that exercise real RLS behavior rather than
  only mocked Supabase service calls.
- Consider a stricter Content-Security-Policy after inventorying all required
  origins.
- Run `npm audit` and dependency review in an environment with registry access.
- Review authentication rate limits and other production Auth settings before
  opening the application to a larger multi-user SaaS audience.

## Security principles

- Never expose privileged Supabase credentials in browser code.
- Never rely on React route protection as authorization.
- Keep PostgreSQL RLS as the final user-data authorization boundary.
- Validate important data at the database layer as well as in the UI.
- Avoid introducing security complexity that does not protect an actual
  attack surface.

**Last Updated:** 2026-09-04

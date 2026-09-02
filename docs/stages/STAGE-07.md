# DogCalendar --- Stage 07: PWA

## Status

**Complete and verified**

**Previous Stage:** Stage 06 --- UI/UX Polish --- Complete

**Completed:** 2026-08-25

**Next Stage:** Stage 08 --- Monthly PDF Reports

------------------------------------------------------------------------

# 1. Purpose

Stage 07 adds Progressive Web App functionality to DogCalendar.

The goal is to make the existing responsive web application installable
and more app-like on supported devices without changing its core
appointment management behavior.

This is an infrastructure/platform stage, not a new business-feature
stage.

------------------------------------------------------------------------

# 2. Stage Goal

At the end of Stage 07, DogCalendar should:

-   Have a valid web app manifest.
-   Have correct application metadata.
-   Have appropriate application icons.
-   Be installable where browser/platform support allows.
-   Launch with the correct DogCalendar branding.
-   Support standalone display where supported.
-   Register a service worker correctly in production.
-   Cache safe static application resources.
-   Handle service-worker updates correctly.
-   Preserve Supabase authentication.
-   Preserve appointment CRUD/status behavior.
-   Preserve Dashboard behavior.
-   Preserve PostgreSQL RLS.
-   Remain responsive and accessible.

------------------------------------------------------------------------

# 3. Source of Truth

Before implementation, read:

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
docs/stages/STAGE-04.md
docs/stages/STAGE-05.md
docs/stages/STAGE-06.md
```

Then inspect the actual application code.

The implementation is the source of truth for:

-   Vite configuration.
-   Routes.
-   Asset locations.
-   HTML metadata.
-   Existing icons/logos.
-   Build output.
-   Deployment.
-   Supabase client/authentication.
-   Application shell.

Do not assume a package or PWA setup exists before checking.

------------------------------------------------------------------------

# 4. Stage 07 Scope

## In Scope

### Manifest

Implement and verify:

-   `name`.
-   `short_name`.
-   `start_url`.
-   `scope`.
-   `display`.
-   `theme_color`.
-   `background_color`.
-   Language metadata where appropriate.
-   Icons.

### Branding

Audit existing assets first.

Create only the additional PWA icon assets actually required.

Icons should be suitable for the relevant browser/platform requirements.

### Service Worker

Implement:

-   Registration.
-   Installation.
-   Safe static asset caching.
-   Cache versioning.
-   Activation.
-   Old-cache cleanup.
-   Update behavior.

### Installability

Verify installation behavior where supported.

### Launch experience

Verify:

-   Application name.
-   Icon.
-   Theme/background colors.
-   Start URL.
-   Standalone behavior.
-   Existing authenticated application flow.

### Verification

Verify:

-   Production build.
-   Manifest.
-   Service worker.
-   Cache behavior.
-   Updates.
-   Authentication.
-   Appointments.
-   Dashboard.
-   Responsive behavior.
-   Accessibility.

------------------------------------------------------------------------

# 5. Explicitly Out of Scope

Do NOT implement:

-   Offline appointment creation.
-   Offline appointment editing.
-   Offline appointment deletion.
-   Offline appointment status mutations.
-   Offline mutation queues.
-   Conflict resolution.
-   Background appointment synchronization.
-   Push notifications.
-   Customer management.
-   Dog profiles.
-   Recurring appointments.
-   PDF reports.
-   SaaS functionality.
-   Subscription functionality.
-   New accounting functionality.
-   New database tables solely for PWA.
-   A new backend.
-   A new state-management system.

Installing the application does not mean the application must become
offline-first.

------------------------------------------------------------------------

# 6. Security Requirements

The existing security model must remain unchanged:

``` text
Supabase Auth
      ↓
Protected routes
      ↓
Supabase client
      ↓
PostgreSQL RLS
      ↓
User-owned appointments
```

The service worker must not become an authorization mechanism.

Never cache:

-   Passwords.
-   Auth tokens.
-   Service-role keys.
-   Private appointment responses by default.

Do not broadly cache authenticated Supabase API responses.

If offline private data is ever required, stop and create a separate
security/data-consistency design before implementation.

------------------------------------------------------------------------

# 7. Recommended Architecture

``` text
Browser
   ↓
Service Worker
   ↓
Safe static-resource cache
   ↓
React + TypeScript + Vite
   ↓
Supabase Client
   ↓
Supabase Auth / PostgreSQL
   ↓
RLS
```

The service worker should primarily handle safe static resources and
application update behavior.

It must not replace the existing data-access layer.

------------------------------------------------------------------------

# 8. Implementation Result

Stage 07 was implemented incrementally and verified.

## Step 1 --- PWA Setup Audit

Audited the existing project before implementation.

Findings:

-   React + TypeScript + Vite application.
-   No existing PWA/service-worker implementation.
-   No Workbox integration.
-   No `vite-plugin-pwa` dependency.
-   Existing favicon and DogCalendar branding assets were reusable.
-   Production deployment is Vercel through the connected GitHub
    repository.
-   No database changes were required.

The smallest maintainable implementation was selected: `vite-plugin-pwa`
with conservative static-resource precaching and explicit manifest
configuration.

## Step 2 --- Web App Manifest

Implemented:

-   `public/manifest.webmanifest`.
-   `name: DogCalendar`.
-   `short_name: DogCalendar`.
-   Polish language metadata.
-   `start_url: /`.
-   `scope: /`.
-   `display: standalone`.
-   Existing semantic theme/background colors.
-   Existing PWA icons.

`index.html` was updated with manifest, theme, Apple touch icon,
favicon, and Polish document-language metadata.

## Step 3 --- PWA Icons

Reused existing assets:

-   `android-chrome-192x192.png`.
-   `android-chrome-512x512.png`.
-   `apple-touch-icon.png`.
-   Existing favicon assets.

No unnecessary duplicate branding assets were created.

## Step 4 --- Service Worker

Implemented `vite-plugin-pwa` with:

``` text
registerType: prompt
manifest: false
conservative Workbox globPatterns
cleanupOutdatedCaches: true
```

The explicit manifest remains the source of truth.

The service worker precaches safe static resources and does not add
broad runtime caching for Supabase/private API responses.

The React PWA registration/update integration uses `workbox-window` and
`useRegisterSW()`.

## Step 5 --- Registration & Local Production Testing

Verified using the Vite production preview:

-   Service worker generated.
-   Service worker registered.
-   Service worker activated.
-   Application scope controlled correctly.
-   Static Cache Storage created.
-   Appointment responses were not broadly cached.
-   Authentication continued to work.
-   Appointment functionality continued to work.

## Step 6 --- Cache Strategy & Security Review

Verified that Cache Storage contained static resources such as:

-   JavaScript.
-   CSS.
-   HTML.
-   Manifest.
-   Public icons.
-   Public branding.
-   Fonts where applicable.

No appointment API response or Supabase Auth response was found in the
service-worker cache.

No offline appointment synchronization was introduced.

## Step 7 --- Service Worker Updates

Verified the lifecycle:

``` text
Version A
   ↓
Service worker active
   ↓
Version B
   ↓
New service worker waiting
   ↓
User chooses update
   ↓
New service worker activates
   ↓
Application reloads into new version
```

The prompt-based strategy avoids unexpected automatic reloads while
users may be entering appointment information.

A Polish-language update prompt was implemented using the PWA
registration API.

Verified:

-   "Później" dismisses the prompt.
-   "Aktualizuj" activates the waiting worker and reloads the
    application.
-   Authentication remains functional.
-   Appointment behavior remains functional.

## Step 8 --- Production Verification on Vercel

Production was verified on the deployed Vercel application.

Verified:

-   Production manifest loads.
-   Production icons load.
-   Production service worker registers.
-   Static Cache Storage is created.
-   Appointment requests remain network-based.
-   Authentication works.
-   Appointment functionality works.
-   Add-to-home-screen installation is available on the tested platform.
-   DogCalendar launches as a standalone application.
-   Branding and application name are correct.

------------------------------------------------------------------------

# 9. Final PWA Architecture

``` text
Browser / Installed PWA
        ↓
Service Worker
        ↓
Safe static-resource cache
        ↓
React + TypeScript + Vite
        ↓
Supabase Client
        ↓
Supabase Auth / PostgreSQL
        ↓
RLS
```

The service worker is not an authorization layer and does not replace
the existing appointment data-access architecture.

------------------------------------------------------------------------

# 10. Final Cache Strategy

Precached/static resources include safe build and public resources such
as:

-   JavaScript.
-   CSS.
-   HTML.
-   Public icons.
-   Public branding assets.
-   Manifest.
-   Other safe static build resources.

There is no broad runtime caching strategy for:

-   Supabase Auth.
-   Appointment queries.
-   Appointment mutations.
-   Private earnings data.
-   User-specific API responses.

This is intentionally conservative and keeps private appointment data
out of the PWA cache by default.

------------------------------------------------------------------------

# 11. Final Update Strategy

The project uses prompt-based service-worker updates.

The current application remains active while a new worker waits. The
user can choose to activate the update through the Polish-language
update prompt.

Outdated static caches are cleaned up by Workbox.

This avoids aggressive update/reload behavior during appointment entry.

------------------------------------------------------------------------

# 12. Security Result

Stage 07 preserved:

``` text
Supabase Auth
      ↓
Protected routes
      ↓
Supabase Client
      ↓
PostgreSQL
      ↓
RLS
```

Verified:

-   No service-role key was introduced into PWA assets.
-   No private appointment responses were broadly cached.
-   Authentication works after installation/update.
-   Protected routes remain protected.
-   RLS remains the authorization boundary.
-   No offline mutation queue or synchronization layer exists.

------------------------------------------------------------------------

# 13. Regression Result

Verified after PWA implementation:

### Authentication

-   Login.
-   Logout.
-   Session restoration.
-   Protected application flow.

### Appointments

-   Appointment creation.
-   Appointment editing.
-   Appointment status mutations.
-   Appointment persistence.
-   Existing time-selection behavior.
-   Stored appointment time restoration.

### Dashboard

-   Dashboard loading.
-   Appointment context.
-   Existing dashboard calculations.
-   Existing mini calendar behavior.

### PWA

-   Manifest.
-   Icons.
-   Service worker.
-   Static caching.
-   Update lifecycle.
-   Installation.
-   Standalone launch.

------------------------------------------------------------------------

# 14. Verification

Stage 07 verification included:

``` text
npm run build  ✓
npm run lint   ✓
```

Production PWA behavior was manually verified on Vercel.

The installed application was launched successfully in standalone mode
on the tested platform.

------------------------------------------------------------------------

# 15. Completion Criteria

-   [x] Manifest exists and is valid.
-   [x] Application name is correct.
-   [x] Short name is appropriate.
-   [x] Start URL is correct.
-   [x] Scope is correct.
-   [x] Display mode is appropriate.
-   [x] Theme/background colors are correct.
-   [x] PWA icons are correct.
-   [x] Installability is verified where supported.
-   [x] Service worker registers correctly in production.
-   [x] Safe static resources are cached.
-   [x] Cache versioning/update lifecycle works.
-   [x] Old cache cleanup is configured.
-   [x] Update behavior is verified.
-   [x] Private appointment data is not broadly cached.
-   [x] Auth tokens/credentials are not intentionally cached by the PWA
    layer.
-   [x] Authentication still works.
-   [x] Protected routes remain protected.
-   [x] RLS behavior remains intact.
-   [x] Appointment CRUD/status behavior remains intact.
-   [x] Dashboard behavior remains intact.
-   [x] Responsive behavior remains intact.
-   [x] Accessibility remains intact.
-   [x] Production build passes.
-   [x] Lint passes.
-   [x] Manual PWA testing is complete.
-   [x] No Stage 08 functionality was introduced.
-   [x] Documentation is synchronized.

------------------------------------------------------------------------

# 16. Stage 07 Final Status

**Stage 07 --- PWA: Complete and Verified**

The next stage is:

**Stage 08 --- Monthly PDF Reports**

No Stage 08 implementation was introduced during Stage 07.

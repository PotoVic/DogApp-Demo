# DogCalendar — Database

## Source of truth

`appointments` remains the source of truth for historical appointments and earnings.

Saved Dogs are reusable information only.

## Saved Dogs

```text
saved_dogs
├── id
├── user_id
├── name
├── breed
├── phone_number
├── created_at
└── updated_at
```

### Identity

`saved_dogs.id` is the unique identity of a Saved Dog.

Name is not unique because different dogs can legitimately have the same name.

### Ownership

`saved_dogs.user_id` links the record to the authenticated user.

## Appointment relationship

There is intentionally no dependency that makes historical appointments depend on Saved Dogs.

The appointment stores its own values:

```text
Saved Dog
   ↓
Appointment form
   ↓
appointments.dog_name
appointments.breed
appointments.phone_number
...
```

Saved Dog edits may synchronize matching appointment information by design. Deleting a Saved Dog does not delete appointments.

## Phone number

`phone_number` is optional on both Saved Dogs and appointments. An appointment stores the phone number used at the time of the appointment as a historical snapshot. The current application intentionally supports Saved Dog synchronization: editing a Saved Dog can update matching appointment records in the current workflow. RLS still applies to those appointment updates.

The UI presents Polish nine-digit numbers as:

```text
323232232
    ↓
323 232 232
```

Formatting is presentation/input behavior.

## RLS

Saved Dogs require RLS for:

- SELECT.
- INSERT.
- UPDATE.
- DELETE.

The policies must restrict access to the authenticated user's `user_id` and prevent ownership reassignment.

Stage 09 RLS behavior has been tested with separate users and other users' Saved Dogs are not visible. The broader 2026-09-04 security review also verified appointment and Saved Dog cross-user read isolation.

## Database constraints verified

The current `appointments` table enforces: `user_id` NOT NULL, `dog_name` NOT NULL, required date/time fields, non-negative `price`, and an allowed `status` set. `user_id` references `auth.users(id)`.

The current `saved_dogs` table enforces required identity/ownership/name/timestamp fields and references `auth.users(id)` through `user_id`.

## Future work

No search/filter database changes are required for the completed Stage 09 scope.

**Last Updated:** 2026-09-04

# Reservation System

Every ad that transitions out of `draft` status requires a reservation slot. Reservations are the mechanism that links a user's entitlement (free credit, paid pack, or manager gift) to a specific ad. See [docs/ad-statuses.md](./ad-statuses.md) for the ad lifecycle — this document covers the reservation side.

---

## Reservation Types

There are two independent reservation types:

**AdReservation** — a standard publication slot. Required for every ad moving from `draft` to `pending`. Source: `apps/strapi/src/api/ad-reservation/`.

**AdFeaturedReservation** — a featured placement slot. Optional; adds the ad to the featured section for its active duration. Source: `apps/strapi/src/api/ad-featured-reservation/`.

Each type is managed by its own content type, service, and controller. They share the same lifecycle pattern but are entirely independent — a user can have free ad-reservation slots without having any featured slots, and vice versa.

---

## Free Slot Guarantee

Each user is guaranteed 3 free `AdReservation` slots. These are not stored as a counter — they are derived at checkout time by counting the user's currently in-use slots (ads with status `active` or `pending`) and comparing against the limit.

The `userCron` runs daily at 2:00 AM (America/Santiago) and ensures every user retains access to their guaranteed slots by restoring any that were freed through expiry, rejection, or ban. Both `active` and `pending` ads count as in-use for this calculation.

Featured reservation free slots follow the same logic independently.

---

## Reservation Lifecycle

```
[checkout or gift call]
        │
        ▼
  reservation created
  (linked to user, status: available)
        │
        ▼
  publishAd() called
  (reservation linked to ad, slot consumed)
        │
        ▼
   ad → pending
        │
    ┌───┴───┐
    │       │
approveAd() rejectAd()
    │       │
    ▼       ▼
 active   rejected
           │
           └─── slot freed (available for reuse)
    │
bannedAd()
    │
    ▼
  banned
    │
    └──── slot freed (available for reuse)
```

When an ad is approved, the reservation slot remains consumed for the lifetime of the ad. When an ad is rejected or banned, the slot is freed immediately so the user can publish another ad without waiting for the cron.

---

## Manager Gift Flow

Managers can grant additional reservation slots to any user outside the normal checkout flow:

- `POST /api/ad-reservations/gift` — grants one `AdReservation` slot
- `POST /api/ad-featured-reservations/gift` — grants one `AdFeaturedReservation` slot

Both endpoints are protected by the `global::isManager` policy. The gifted slot behaves identically to a purchased or free slot once created.

---

## Key Source Files

| Purpose | Path |
| --- | --- |
| AdReservation API | `apps/strapi/src/api/ad-reservation/` |
| AdFeaturedReservation API | `apps/strapi/src/api/ad-featured-reservation/` |
| User cron (slot restoration) | `apps/strapi/src/crons/user-*.cron.ts` |
| Ad publish logic | `apps/strapi/src/api/ad/services/ad.ts` |

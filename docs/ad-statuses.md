# Ad Statuses

Ads do not use a single status field in the database. Status is **computed** from a combination of boolean flags and counters. The `computeAdStatus()` function in `apps/strapi/src/api/ad/services/ad.ts` evaluates these fields in strict priority order and returns a virtual `status` field on every ad response.

---

## Statuses

### `draft`
The ad was saved but not yet submitted for review.

**Conditions:** `draft === true` (evaluated first — overrides all other flags)

**How it starts:** Every ad created via the save-draft flow starts with `draft: true` and `remaining_days: 15`.

**How it ends:** `publishAd()` is called after payment is confirmed or a free reservation is assigned — sets `draft: false`, which transitions the ad to `pending`.

---

### `pending`
The ad has been submitted and is waiting for admin approval.

**Conditions:** `draft=false`, `active=false`, `banned=false`, `rejected=false`, `remaining_days > 0`, `ad_reservation !== null`

**How it starts:** After `publishAd()` clears the draft flag and a reservation slot is linked to the ad.

**How it ends:**
- Admin approves → `active`
- Admin rejects → `rejected`

---

### `active`
The ad is approved and publicly visible.

**Conditions:** `active=true`, `banned=false`, `rejected=false`, `remaining_days > 0`

**How it starts:** An admin calls `approveAd()`, which sets `active: true` and records `actived_at` and `actived_by`.

**How it ends:**
- `adCron` runs daily at 1 AM and decrements `remaining_days` by 1. When it reaches `0`, sets `active: false` → transitions to `archived`
- Owner calls `deactivateAd()` → transitions to `archived`
- Admin or owner calls `bannedAd()` → transitions to `banned`

---

### `archived`
The ad has ended. Covers two distinct scenarios: natural expiry (cron) and manual deactivation by the owner.

**Conditions:** `active=false`, `banned=false`, `rejected=false`, `remaining_days === 0`

#### Path 1 — Automatic expiry

**How it starts:** `adCron` runs daily at 1 AM, decrements `remaining_days` by 1. When it reaches `0`, sets `active: false`.

**Who triggers it:** Automated — no user action.

**What changes:** `active: false`, `remaining_days: 0`. Reservation slot is NOT freed (slot remains linked to the expired ad).

**Email:** None.

#### Path 2 — Manual deactivation

**How it starts:** The owner calls `deactivateAd()` while the ad is `active` or `pending`. Sets `active: false` and `remaining_days: 0`. An optional `reason_for_deactivation` can be stored (e.g. "sold").

**Who can trigger it:** Owner only. Managers cannot deactivate on behalf of an owner (use `bannedAd()` instead).

**Guard:** Throws if `active === false && remaining_days === 0` (already archived).

**What changes:** `active: false`, `remaining_days: 0`, `reason_for_deactivation` (optional). Reservation slot is NOT freed.

**Email:** None.

**Note:** Both paths produce the same computed status (`archived`) and the same user-facing label (`expired`). The only audit trail distinguishing them is `reason_for_deactivation`, which is `null` for natural expiry.

---

### `rejected`
The ad was reviewed and refused by an admin.

**Conditions:** `rejected === true`

**How it starts:** An admin calls `rejectAd()` while the ad is in `pending` state. Sets `rejected: true`, records `rejected_at`, `rejected_by`, and `reason_for_rejection`. The linked reservation slot is freed so it can be reused. A rejection email is sent to the owner.

**Default rejection reason:** `"Fue rechazado porque no cumple con las políticas y términos de uso de Waldo.click®"`

---

### `banned`
The ad was removed by the owner or an admin.

**Conditions:** `banned === true`

**How it starts:** `bannedAd()` is called by the ad owner or a user with role `Administrator`, `Admin`, or `Manager`. Sets `banned: true` and `active: false`, records `banned_at`, `banned_by`, and optional `reason_for_ban`. The linked reservation slot is freed. A ban email is sent to the owner.

---

### `unknown`
No condition matched. Should not occur in normal operation.

**Conditions:** Fallthrough — `active=false`, `banned=false`, `rejected=false`, `remaining_days > 0`, but `ad_reservation === null`. This was the old "abandoned" state before a one-time migration back-filled those ads to `draft: true`.

---

## Priority Order

`computeAdStatus()` evaluates conditions in this order — the first match wins:

```
1. draft === true                                           → draft
2. rejected === true                                       → rejected
3. banned === true                                         → banned
4. active && remaining_days > 0                            → active
5. !active && remaining_days === 0                         → archived
6. !active && remaining_days > 0 && ad_reservation != null → pending
7. (fallthrough)                                           → unknown
```

---

## State Transitions

```
[created]
    │
    ▼
  draft ──── publishAd() ────► pending
                                  │
                      ┌───────────┴───────────┐
                      │                       │
                 approveAd()            rejectAd()
                      │                       │
                      ▼                       ▼
                   active               rejected
                      │
          ┌───────────┼───────────┐
          │           │           │
       adCron    deactivateAd() bannedAd()
    (expiry)      (owner)     (owner/admin)
          │           │           │
          ▼           ▼           ▼
       archived    archived     banned
```

---

## User-Facing Labels

The `GET /api/ads/me` endpoint uses different label names for the same underlying conditions:

| Label | Meaning |
|---|---|
| `published` | Ad is active and running |
| `review` | Ad is pending admin approval |
| `expired` | Ad ended (archived) |
| `rejected` | Ad was rejected by admin |
| `banned` | Ad was banned |

---

## Automated Transitions (Cron)

| Cron | Schedule | What it does |
|---|---|---|
| `adCron` | Daily 1:00 AM (America/Santiago) | Decrements `remaining_days` by 1 for every active ad. When `remaining_days` hits `0`, sets `active: false` → `archived`. |
| `userCron` | Daily 2:00 AM (America/Santiago) | Restores free reservation slots. Each user is guaranteed 3 free slots. Considers both `active` and `pending` ads as in-use. |

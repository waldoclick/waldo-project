---
gsd_state_version: 1.0
milestone: v1.5
milestone_name: Ad Credit Refund
status: completed
stopped_at: Completed 17-01-PLAN.md
last_updated: "2026-03-06T20:46:01.683Z"
last_activity: "2026-03-06 — Phase 17 Plan 01: conditional credit-return messaging added to rejection/ban email templates"
progress:
  total_phases: 2
  completed_phases: 2
  total_plans: 2
  completed_plans: 2
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-06)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.5 Ad Credit Refund — Phase 17 Plan 01 complete, milestone done

## Current Position

```
[██████████] 100%
```

Phase: 17 – Email Notification Update (1/1 plans complete)
Plan: 01 complete — Phase 17 done, v1.5 milestone complete
Status: All phases complete
Last activity: 2026-03-06 — Phase 17 Plan 01: conditional credit-return messaging added to rejection/ban email templates

## Accumulated Context

### Decisions

All decisions from v1.1–v1.4 are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Per-entity section keys in settings store — never share a key between distinct list views
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- All utility functions accept `null | undefined` and return `"--"` for missing data
- Nuxt auto-import picks up `app/utils/*.ts` — no explicit imports needed
- **v1.5**: Reservation freeing updates reservation side (FK lives on reservation), not ad side — `entityService.update(uid, id, { data: { ad: null } })`
- **v1.5**: No try/catch around freeing calls — if freeing fails, whole reject/ban fails (caller handles)
- **v1.5**: Email templates use `!!ad.ad_reservation?.id` evaluated on pre-freed ad object — correctly reflects "was a credit returned?" boolean
- [Phase 17-email-notification-update]: Use !!ad.ad_reservation?.id evaluated before freeing to derive 'was credit returned?' boolean — id still present on pre-freed ad object — ad was fetched before reservation freeing, so the id is still present if a reservation existed

### v1.5 Implementation Context

- **Reject logic**: `apps/strapi/src/api/ad/services/ad.ts` → `rejectAd()` lines 537–611
- **Ban logic**: same file → `bannedAd()` lines 628–698
- **Credit return pattern**: set `adReservation.ad = null` and `adFeaturedReservation.ad = null` (same pattern used in `user.cron.ts`)
- **Helper utilities**: `apps/strapi/src/api/payment/utils/ad.utils.ts` → `updateAdReservation()` line 120, `updateAdFeaturedReservation()` line 144
- **Email templates**: `apps/strapi/src/services/mjml/templates/ad-rejected.mjml` and `ad-banned.mjml`
- **Email send mechanism**: both reject and ban already call `sendMjmlEmail()` — templates need new conditional variables: `adReservationReturned` (bool) and `featuredReservationReturned` (bool)

### Pending Todos

None.

### Blockers/Concerns

None.

## Performance Metrics

| Phase | Plan | Duration | Tasks | Files |
| :--- | :--- | :--- | :--- | :--- |
| 16-credit-refund-logic | 01 | 2min | 2 | 1 |
| 17-email-notification-update | 01 | 2min | 2 | 3 |

## Session Continuity

Last session: 2026-03-06T20:43:19.379Z
Stopped at: Completed 17-01-PLAN.md
Resume file: None

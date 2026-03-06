---
gsd_state_version: 1.0
milestone: v1.5
milestone_name: Ad Credit Refund
status: roadmap_created
stopped_at: Roadmap created — Phase 16 is next
last_updated: "2026-03-06T20:15:00.000Z"
last_activity: 2026-03-06 — v1.5 roadmap created (2 phases, 8 requirements mapped)
progress:
  total_phases: 2
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-06)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.5 Ad Credit Refund — roadmap ready, Phase 16 is next

## Current Position

```
████░░░░░░░░░░░░░░░░ 0/2 phases complete
```

Phase: 16 – Credit Refund Logic (not started)
Plan: —
Status: Ready to plan Phase 16
Last activity: 2026-03-06 — Roadmap created for v1.5

## Accumulated Context

### Decisions

All decisions from v1.1–v1.4 are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Per-entity section keys in settings store — never share a key between distinct list views
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- All utility functions accept `null | undefined` and return `"--"` for missing data
- Nuxt auto-import picks up `app/utils/*.ts` — no explicit imports needed

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

## Session Continuity

Last session: 2026-03-06
Stopped at: Roadmap created — ready to plan Phase 16
Resume file: None

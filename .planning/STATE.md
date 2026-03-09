---
gsd_state_version: 1.0
milestone: v1.25
milestone_name: Unified Checkout
status: In Progress
stopped_at: Milestone v1.25 started — requirements and roadmap being written
last_updated: "2026-03-08T00:00:00.000Z"
last_activity: 2026-03-08 — Milestone v1.25 started; planning in progress
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-08 for v1.25 start)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** v1.25 Unified Checkout — IN PROGRESS

## Current Position

Phase: TBD — Roadmap being written
Plan: —
Status: Planning
Last activity: 2026-03-08 — Milestone started

```
Progress: [----------] 0%
```

### Phase Map

| Phase | Name | Requirements | Status |
|-------|------|--------------|--------|
| TBD | Unified Checkout Endpoint (Strapi) | CHK-01 – CHK-05 | Pending |
| TBD | Frontend Migration | CHK-06 – CHK-08 | Pending |

## Accumulated Context

### Decisions

All decisions from v1.1–v1.24 planning are logged in PROJECT.md Key Decisions table.

Key patterns established (carry forward):
- `watch({ immediate: true })` as sole data-loading trigger — never pair with onMounted
- Strapi SDK v5 cast pattern: `response.data as T[]`, params as `Record<string,unknown>`, payload double-cast
- **v1.6**: `useAsyncData` is sole data-loading trigger in Nuxt pages
- **v1.9**: `typeCheck: true` permanently enabled in both apps
- **v1.18**: `if (import.meta.server) return;` is mandatory first line of any client-only middleware reading a localStorage-backed store
- **v1.21**: `publishAd(adId)` helper — any payment confirmation path MUST call it to set `draft: false`
- **v1.21**: Endpoint domain belongs with the entity, not the trigger — `/api/ads/save-draft` not `/api/payments/ad-draft`
- **v1.21**: New Strapi endpoints require manual permission setup in admin panel — document as deploy step in plan
- **v1.22**: `/pagar` is the central payment page — all flows with `hasToPay === true` must redirect here
- **v1.22**: `CheckoutDefault.vue` owns full payment logic — `resumen.vue` is review/redirect only
- **v1.23**: Pack purchase uses `adStore` — `packs.store.ts` eliminated; `adStore.ad.ad_id` presence determines if ad is part of the payment
- **v1.24**: Email failures are non-fatal in free-ad flow — wrapped in try/catch
- **v1.24**: Free ad creation uses two-step pattern: POST ads/save-draft → adStore.updateAdId() → POST payments/free-ad with { ad_id, pack }

### v1.25 Key Context

- **Broken flow (pre-v1.25)**: `CheckoutDefault.vue` line 38 calls `POST payments/pack` — handler was removed in v1.24 route cleanup; pack-only purchases are broken
- **New endpoint `POST /payments/checkout`**: receives `{ pack?, ad_id?, featured? }` — at least one required; 3 cases: pack-only, pack+ad, featured+ad; only initiates Webpay transaction — does NOT create reservations here
- **New endpoint `GET /payments/webpay`**: Webpay returns here after payment; executes all post-payment logic: read pack → create paid ad-reservations → create featured reservations (if total_features > 0) → publish ad (if ad_id present) → apply featured (if featured present)
- **Replaces**: `POST payments/ad` and `POST payments/pack` (both now dead) for all paid flows
- **Untouched**: `POST payments/free-ad` + `free-ad.service.ts` (free flow stays as-is)
- **Middleware**: `recaptcha.ts` has `/api/payments/pack` hardcoded — must be updated to `/api/payments/checkout`

### Pending Todos

None.

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-03-08
Stopped at: Planning phase — writing requirements and roadmap
Resume with: Execute Phase 60 once roadmap is approved

---
phase: 08-publico-anuncios-perfil
plan: 04
subsystem: strapi-backend
tags: [contact-obfuscation, reveal-endpoints, pii, anti-scraping, sold-ads]
requires:
  - sanitizeAdForPublic (ad api)
  - getUserDataWithFilters (users-permissions override)
  - recordContact (ad-contact service)
  - getAdvertisements (ad service)
provides:
  - contact-mask helpers (maskEmail/maskPhone/revealUserChannel)
  - obfuscated seller email/phone/whatsapp + has_* flags in both bulk payloads
  - 5 per-channel reveal endpoints (3 ad-keyed + 2 seller-keyed)
  - soldAds service + GET /ads/sold/:username
affects:
  - every non-manager consumer of GET /users find path (now masked, not stripped)
  - every ad-list card (catalog/actives/archiveds) — safeUser now emits masked contact + flags
tech-stack:
  added: []
  patterns:
    - "auth:false route + manual Bearer JWT verify in controller (findBySlug precedent)"
    - "pure string-transform obfuscation on already-fetched data (no extra query)"
    - "module-level reveal helpers (revealForAd/revealForSeller) keep handlers thin + DRY"
key-files:
  created:
    - apps/strapi/src/api/ad/services/contact-mask.ts
    - apps/strapi/tests/api/ad/contact-mask.test.ts
    - apps/strapi/tests/api/ad/reveal-channel.controller.test.ts
    - apps/strapi/tests/api/ad/sold-ads.service.test.ts
  modified:
    - apps/strapi/src/api/ad/services/sanitize-ad.ts
    - apps/strapi/src/api/ad/services/ad.ts
    - apps/strapi/src/api/ad/controllers/ad.ts
    - apps/strapi/src/api/ad/routes/00-ad-custom.ts
    - apps/strapi/src/extensions/users-permissions/controllers/userController.ts
decisions:
  - "Profile (seller-keyed) reveals are NOT recorded as ad-contacts — no ad to attribute"
  - "draft:false added to soldAds defaultFilters to stop never-published drafts leaking on a public surface"
  - "5 SEPARATE routes/handlers, not one :channel route (user mandate)"
metrics:
  duration: "~50m"
  tasks: 3
  completed: 2026-06-18
---

# Phase 8 Plan 04: Contact Obfuscation + Per-Channel Reveal Endpoints + soldAds Summary

Obfuscated seller contact (email/phone/whatsapp) in both public bulk payloads with presence flags, five single-purpose JWT-gated reveal endpoints (three ad-keyed that record an ad-contact, two seller-keyed that do not), and a public `soldAds` endpoint for the profile Vendidos tab — all N+1-safe, Jest AAA tested, no schema change.

## What was built

### Task 1 — contact-mask helpers + obfuscation in both sanitize paths
- New `apps/strapi/src/api/ad/services/contact-mask.ts`: pure, null-safe `maskEmail`, `maskPhone`, and `revealUserChannel(user, channel)`.
  - `maskEmail("gabriel@waldo.cl")` → `"g••••••@•••••.cl"` (first local char + bulleted rest, bulleted domain label, TLD kept).
  - `maskPhone("+56 9 1234 5678")` → `"+56 9 •••• ••78"` (+CC head + last 2 digits).
- `sanitizeAdForPublic.safeUser` now emits masked `email`/`phone`/`whatsapp` + `has_email`/`has_phone`/`has_whatsapp`; raw values removed.
- `getUserDataWithFilters` (users-permissions override): for non-managers, the PII delete loop runs as before, then `email`/`phone`/`whatsapp` are re-added MASKED + presence flags. Managers unchanged. The pure helpers are imported directly from the ad service file (no factory side effects pulled into the plugin extension).

### Task 2 — five SEPARATE per-channel reveal endpoints
All `auth:false` at the router; each verifies the Bearer JWT inside the controller (findBySlug precedent) and returns 401 for anonymous viewers. Declared before the core `/ads/:id` wildcard, hosted in the ad api.

| Route | Handler | Records ad-contact? |
| ----- | ------- | ------------------- |
| `GET /ads/:documentId/reveal/phone`    | `ad.revealAdPhone`    | yes — type `"call"` |
| `GET /ads/:documentId/reveal/whatsapp` | `ad.revealAdWhatsapp` | yes — type `"call"` |
| `GET /ads/:documentId/reveal/email`    | `ad.revealAdEmail`    | yes — type `"message"` |
| `GET /sellers/:username/reveal/phone`    | `ad.revealSellerPhone`    | NO |
| `GET /sellers/:username/reveal/whatsapp` | `ad.revealSellerWhatsapp` | NO |

DRY lives in two module-level helpers — `revealForAd(ctx, channel)` and `revealForSeller(ctx, channel)` — each thin handler hardcodes its channel. There is intentionally no seller-email route (email is not a profile channel per the mockup; a missing route 404s).

### Task 3 — soldAds service + public endpoint
- `soldAds(options, isManager, userId)` in the ad service: `active:false, banned:false, rejected:false, draft:false, remaining_days:0`, routed through `getAdvertisements` (batched view/contact counts, pagination, sanitized — no N+1).
- `soldByUsername(ctx)` controller scopes by `options.filters.user.username` (public role-bypass `isManager=true, userId=null`, like catalog).
- Route: `GET /ads/sold/:username` (`auth:false`), declared near `/ads/catalog` before the wildcard.

## Required disclosures (per plan output)

- **The five exact reveal routes** are listed in the table above — three ad-keyed (phone/whatsapp/email) + two seller-keyed (phone/whatsapp).
- **Profile (seller-keyed) reveals are NOT recorded as ad-contacts** — there is no ad to attribute the contact to, and `recordContact` requires an ad (no nullable-ad variant was added). Documented inline in `revealForSeller`.
- **whatsapp is newly obfuscated.** It was NOT in `PII_FIELDS`, so before this plan it leaked RAW on the seller-profile payload. It is now masked in both `sanitizeAdForPublic` and `getUserDataWithFilters` and exposed only via the reveal endpoints.
- **Broadened masking surface — `getUserDataWithFilters`:** this override backs GET `/users` (list) generally, so EVERY non-manager consumer of that find path now receives masked `email`/`phone`/`whatsapp` + `has_*` flags where it previously received nothing (those fields were stripped). The only known website caller is `userStore.loadUser` (the seller profile). Future callers of that path inherit the masked+flagged shape.
- **Broadened masking surface — `sanitizeAdForPublic`:** `safeUser` is shared by every ad-list endpoint. The ad-list populate (`getAdvertisements`) whitelists `user` fields and does NOT include email/phone/whatsapp, so on catalog/actives/archiveds cards the masks resolve to `""` and `has_*` to `false` (harmless presence flags). The DETAIL path (`findBySlug`) uses `user: true` (full populate), so masked real-derived values + correct flags appear there — that is the surface the 08-02 contact card consumes.

## Verification

### Automated — PASS
- `tsc --noEmit` clean on all changed Strapi files.
- Jest (run individually with `--runInBand`, never the full suite):
  - `tests/api/ad/contact-mask.test.ts` — 9/9 (mask helpers + null-safety + sanitize emits masked + flags + no raw value travels).
  - `tests/api/ad/reveal-channel.controller.test.ts` — 6/6 (anonymous → `ctx.unauthorized`; authed ad-phone → real value + `recordContact("call")`; ad-email → `recordContact("message")`; seller-phone → real value, `recordContact` NOT called; unknown documentId → `ctx.notFound`).
  - `tests/api/ad/sold-ads.service.test.ts` — 2/2 (down-ad filter shape incl. `draft:false` + username scope; pagination limit/offset).
- Grep: 5 reveal handlers, 5 reveal routes, `sold/:username` route + `soldAds`/`soldByUsername` all present.

### curl — NOT COMPLETED (environment-blocked; needs human action)
The Strapi dev server (`strapi develop`, the user's foreground process on pts/6) got stuck mid-rebuild after the rapid file churn from the three commits: the process is alive but never re-bound port 1337 (only the Nuxt proxy on 3000 is listening, returning 502 upstream). I deliberately did NOT restart it — it is the user's foreground dev process and a second instance would collide on port + DB.

**No curl status codes are reported because none were observed.** The endpoint behavior is covered by the Jest assertions above (401 anonymous, real-value fork, recordContact call/message fork, seller no-record, notFound).

**To close the last verification check (human action):** restart Strapi on 1337, then once it rebinds:

```bash
JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzgxNjU4MjY4LCJleHAiOjE3ODQyNTAyNjh9.XL-fSUOh6yetSKrgT3ZxLDJhDjGCSpq70L-5S35f7mE"

# Anonymous → 401
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:1337/api/ads/<documentId>/reveal/phone"

# Authed → real value + records ad-contact (call)
curl -s "http://localhost:1337/api/ads/<documentId>/reveal/phone" -H "Authorization: Bearer $JWT"
curl -s "http://localhost:1337/api/ads/<documentId>/reveal/email"    -H "Authorization: Bearer $JWT"   # records "message"

# Seller-keyed → real value, no recording
curl -s "http://localhost:1337/api/sellers/<username>/reveal/whatsapp" -H "Authorization: Bearer $JWT"

# Bulk payload now MASKED + has_* flags
curl -s "http://localhost:1337/api/ads/slug/<slug>" -H "Authorization: Bearer $JWT"   # ad detail (full populate → real-derived masks)

# soldAds
curl -s "http://localhost:1337/api/ads/sold/<username>"
```

(Or via the Nuxt proxy: `http://localhost:3000/api/...` with `Cookie: waldo_jwt=$JWT`.)

## Deviations from Plan

None — plan executed exactly as written. Two implementation notes:
- The reveal "DRY helpers" were placed as module-level functions (not controller methods) because the Strapi controller handler type treats a 2nd positional arg as Koa `Next`, which conflicts with a `channel` param. Functionally identical; handlers stay thin.
- `maskEmail` emits length-proportional bullets (`"g" + 6` for "gabriel"), so the exact literal is `"g••••••@•••••.cl"` (one more bullet than the plan's illustrative `"g•••••@•••••.cl"`). The masked LOOK matches the mockup and no raw substring survives; the helper is self-tested against this exact output.

## Commits

- `5a713fb9` — feat(08-04): obfuscate seller contact in both bulk payloads + presence flags
- `e2cee0ed` — feat(08-04): five separate per-channel reveal endpoints (3 ad-keyed + 2 seller-keyed)
- `2f22361d` — feat(08-04): soldAds service + public GET /ads/sold/:username endpoint

## Self-Check: PASSED

All created files exist on disk; all three commit hashes (5a713fb9, e2cee0ed, 2f22361d) present in git history.

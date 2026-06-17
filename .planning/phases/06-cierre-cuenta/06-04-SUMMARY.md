# 06-04 SUMMARY — contacts-total endpoint + contact tracking wiring

**Status:** Complete
**Requirement:** STAT-UI (partial — contacts side)

## What was done
- **Task 1 (backend):** `GET /api/ads/me/contacts-total` — `ad-contact.contactsTotal` controller (auth) + `getUserTotalContacts(userId)` service that aggregates `ad-contact` event rows over the user's active ads. Route declared before the `/ads/:documentId/contact` wildcard. Tests: `ad-contact.service.test.ts` 2/2 green (in-band). tsc clean.
- **Task 2 (frontend wiring):** `AdSingle.vue` — contact buttons (email/phone) now call `handleContact(type)` which keeps the existing GA4 `contactSeller` AND records an in-app `ad-contact` event via `POST /api/ads/:documentId/contact` (type phone→call, email→message). Non-fatal (catch swallows). The public POST route is `auth:false`, so it works for any visitor.

## Verification
- strapi tsc clean; ad-contact service test 2/2 green (run in-band, single process — avoids OOM). website vue-tsc clean.

## Notes
- Requires Strapi restart for the new route + the 06-01 permission grant to apply.
- Panel "Contactos recibidos" KPI wiring to /ads/me/contacts-total is finished in 06-05.

## Commits
- `1c53ee10` feat(06-04): contacts-total endpoint
- (this) feat(06-04): wire contact tracking in AdSingle

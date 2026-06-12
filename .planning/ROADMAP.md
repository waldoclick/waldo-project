### Phase 126: Security hardening — fix authorization vulnerabilities from security review

**Goal:** Close the authorization gaps surfaced by the branch security review so no authenticated user can take over another account, publish/mark-paid an ad without payment or moderator approval, or mutate another user's ad. All fixes are server-side in Strapi (`apps/strapi`) plus two Nuxt hardening items; no schema migrations. Each fix must be covered by a regression test (Jest for Strapi, Vitest for website).
**Requirements**: SEC-IDOR-USERS, SEC-MASSASSIGN-ADS, SEC-IDOR-FREEAD, SEC-HARDENING
**Depends on:** Phase 125
**Plans:** 2/4 plans executed

Plans:
- [ ] 126-01-PLAN.md — SEC-IDOR-USERS (HIGH): ownership policy on built-in `user.update` (cross-user PUT → 403, manager bypass) without breaking the three partial-body self callers
- [x] 126-02-PLAN.md — SEC-MASSASSIGN-ADS (HIGH): `protect-ad-fields` global middleware stripping privileged ad fields from POST/PUT `/api/ads`
- [x] 126-03-PLAN.md — SEC-IDOR-FREEAD (MEDIUM): ownership assertion in `free-ad.service.ts` before publish/relink/re-date
- [ ] 126-04-PLAN.md — SEC-HARDENING: gate dev endpoints behind `import.meta.dev`, escape contact email fields, fix `protect-user-fields` trailing-slash regex bypass

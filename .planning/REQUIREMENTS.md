# Requirements: v1.24 Free Ad Submission

## v1 Requirements

### Free Ad Submission

- [ ] **FREE-01**: `POST /api/payments/free-ad` validates that the authenticated user has a free ad credit available
- [ ] **FREE-02**: `POST /api/payments/free-ad` receives an `ad_id` (existing draft) and links the free ad-reservation to the ad
- [ ] **FREE-03**: `POST /api/payments/free-ad` sets `draft: false` on the ad, transitioning it from draft to pending
- [ ] **FREE-04**: `POST /api/payments/free-ad` sends confirmation email to the user and validation alert email to admin
- [ ] **FREE-05**: `resumen.vue` free path calls `POST /api/ads/save-draft` first to obtain/update `ad_id`, then calls `POST /api/payments/free-ad`
- [ ] **FREE-06**: Existing free flow in `POST /api/payments/ad` and `ad.service.ts` remains untouched

## Future Requirements

None identified for this milestone.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Removing `ad.service.ts` or `POST /api/payments/ad` | Explicit goal of this milestone is to add the new endpoint only — removal is a future milestone |
| Featured free flow changes | Only the free ad (pack=free) submission path is in scope |
| Dashboard changes | No dashboard UI changes required for this milestone |

## Traceability

| REQ-ID  | Phase | Status  |
|---------|-------|---------|
| FREE-01 | Phase 58 | Pending |
| FREE-02 | Phase 58 | Pending |
| FREE-03 | Phase 58 | Pending |
| FREE-04 | Phase 58 | Pending |
| FREE-05 | Phase 59 | Pending |
| FREE-06 | Phase 58 | Pending |

**Coverage:**
- v1 requirements: 6 total
- Mapped to phases: 6
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-08 after initial definition*

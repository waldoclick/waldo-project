---
phase: 28-typescript-strict-store-audit
plan: "02"
subsystem: typescript, store
tags: [typescript, pinia, persist, audit]

# Dependency graph
requires:
  - plan: 28-01
    provides: "typeCheck: true enabled, Strapi SDK filter casts fixed"
provides:
  - "14 stores with inline persist audit comments (CORRECT/REVIEW/RISK classification)"

key-files:
  modified:
    - apps/website/app/stores/ads.store.ts
    - apps/website/app/stores/ad.store.ts
    - apps/website/app/stores/app.store.ts
    - apps/website/app/stores/categories.store.ts
    - apps/website/app/stores/communes.store.ts
    - apps/website/app/stores/conditions.store.ts
    - apps/website/app/stores/faqs.store.ts
    - apps/website/app/stores/filter.store.ts
    - apps/website/app/stores/history.store.ts
    - apps/website/app/stores/indicator.store.ts
    - apps/website/app/stores/packs.store.ts
    - apps/website/app/stores/pack.store.ts
    - apps/website/app/stores/regions.store.ts
    - apps/website/app/stores/related.store.ts
---

**One-liner:** Added inline `// persist: CORRECT|REVIEW|RISK — <rationale>` audit comments above all 14 store persist entries (STORE-01).

## Tasks Completed

- Audited all 14 stores that use `persist:` in the website
- Classified each as CORRECT, REVIEW, or RISK with a one-line rationale
- No undocumented persist entries remain in the codebase

## Notes

This plan was executed together with plan 28-01 as part of the same phase execution. The combined summary was originally filed as `28-SUMMARY.md` (phase-level); this stub exists to align plan/summary counts for tooling.

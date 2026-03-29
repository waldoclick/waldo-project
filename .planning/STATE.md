---
gsd_state_version: 1.0
milestone: v1.46
milestone_name: milestone
status: unknown
stopped_at: Completed 107-03-PLAN.md
last_updated: "2026-03-29T22:41:08.435Z"
progress:
  total_phases: 1
  completed_phases: 0
  total_plans: 4
  completed_plans: 3
  percent: 75
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-29)

**Core value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.
**Current focus:** Phase 107 — dashboard-recaptcha-validation-all-routes

## Position

Milestone v1.46 PRO Subscriptions archived. Ready to start next milestone.

```
Progress: [████████░░] 75%
```

## Accumulated Context

### Key Decisions (carry forward)

- All business logic lives in Strapi; dashboard and website are stateless HTTP clients
- `pro_status === "active"` is the single source of truth for PRO membership (no `pro` boolean)
- Oneclick Mall must be contracted separately with Transbank for production (separate from Webpay Plus)
- Method-based reCAPTCHA guard (POST/PUT/DELETE) replaces allowlist-based guard — simpler and protects all future mutations automatically (107-01)
- Dashboard vitest config aligned with website pattern (happy-dom + stubs) to fix broken nuxt environment (107-01)
- useApiClient is a drop-in for useStrapiClient — only the initialization line changes, no call-site changes needed (107-02)
- Never call useStrapiClient() directly in components for mutating requests — use useApiClient() instead (107-02)
- Use apiClient typed generic apiClient<{ data: T }>() for response shape inference — avoids response.data type errors (107-03)
- Keep useStrapi() for read operations (find/findOne), replace only mutations with useApiClient() — FormPassword exception: useStrapi removed entirely (107-03)

### Roadmap Evolution

- Phase 107 added: en el dashboard hay que validar todas las rutas POST, PUT y DELETE igual como en el website

### Blockers/Concerns (open)

- Oneclick Mall must be contracted separately with Transbank for production

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260329-pa1 | fix CSP violations in staging - add missing script-src connect-src worker-src directives for Google GTM reCAPTCHA Hotjar Cloudflare Sentry | 2026-03-29 | f5ead3f9 | [260329-pa1-fix-csp-violations-in-staging-add-missin](./quick/260329-pa1-fix-csp-violations-in-staging-add-missin/) |

## Session Continuity

Last session: 2026-03-29T22:41:08.433Z
Stopped at: Completed 107-03-PLAN.md
Resume file: None

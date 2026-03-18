# Requirements: Waldo Project — v1.42

**Defined:** 2026-03-18
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.42 Requirements

### Session Persistence

- [ ] **SESS-01**: Diagnóstico root-cause documentado — se identifica exactamente por qué el guard redirige al login tras refresh (cookie ausente, fetchUser falla, o race condition SSR)
- [ ] **SESS-02**: La cookie `waldo_jwt` persiste correctamente entre recargas de página en el dashboard local
- [ ] **SESS-03**: El guard `guard.global.ts` no redirige a un usuario autenticado al refrescar la página
- [ ] **SESS-04**: Usuario puede completar el flujo: login → verify-code → refresh → permanecer autenticado

## Future Requirements

### Session (deferred)

- **SESS-05**: La sesión expira correctamente después del período configurado (`maxAge`)
- **SESS-06**: El logout limpia la cookie correctamente sin sesión residual (COOKIE_DOMAIN cross-subdomain)
- **POLL-01**: Post-logout website Pinia stores reset cuando el logout se origina desde el dashboard

## Out of Scope

| Feature | Reason |
|---------|--------|
| Website session persistence | Problem is dashboard-only; website session works correctly |
| Cross-domain session (staging) | COOKIE_DOMAIN staging verification deferred to separate milestone |
| Dashboard `useApiClient` migration | Separate unrelated milestone candidate |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SESS-01 | Phase 094 | Pending |
| SESS-02 | Phase 094 | Pending |
| SESS-03 | Phase 094 | Pending |
| SESS-04 | Phase 094 | Pending |

**Coverage:**
- v1.42 requirements: 4 total
- Mapped to phases: 4 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-18 after initial definition*

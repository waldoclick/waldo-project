# Requirements: Waldo Project — v1.42

**Defined:** 2026-03-18
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.42 Requirements

### Session Persistence

- [x] **SESS-01**: Diagnóstico root-cause documentado — `@nuxtjs/strapi` `fetchUser()` llama `setToken(null)` en el catch del SSR `/users/me`; fix: eliminar populate de relaciones pesadas no usadas (`ad_reservations.ad`, `ad_featured_reservations.ad`)
- [x] **SESS-02**: La cookie `waldo_jwt` persiste correctamente entre recargas de página — el fix previene que `fetchUser()` destruya el token en SSR
- [x] **SESS-03**: El guard `guard.global.ts` no redirige a un usuario autenticado al refrescar la página — `/users/me` ya no falla en SSR con el populate reducido
- [x] **SESS-04**: Usuario puede completar el flujo: login → verify-code → refresh → permanecer autenticado

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
| SESS-01 | Phase 094 | ✅ Complete (2026-03-18) |
| SESS-02 | Phase 094 | ✅ Complete (2026-03-18) |
| SESS-03 | Phase 094 | ✅ Complete (2026-03-18) |
| SESS-04 | Phase 094 | ✅ Complete (2026-03-18) |

**Coverage:**
- v1.42 requirements: 4 total
- Mapped to phases: 4 ✓
- Completed: 4 ✓

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-18 — v1.42 complete*

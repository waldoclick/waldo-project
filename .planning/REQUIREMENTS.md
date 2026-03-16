# Requirements: Waldo — Shared Authentication Session

**Defined:** 2026-03-16
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.40 Requirements

Requirements for Shared Authentication Session milestone.

### Session Sharing

- [ ] **SESS-01**: El usuario manager que se autentica en website queda automáticamente autenticado en dashboard sin doble login
- [ ] **SESS-02**: El usuario que se autentica en dashboard queda automáticamente autenticado en website
- [ ] **SESS-03**: Al hacer logout en website, la sesión en dashboard también se cierra
- [ ] **SESS-04**: Al hacer logout en dashboard, la sesión en website también se cierra
- [ ] **SESS-05**: La cookie compartida se configura por entorno via `COOKIE_DOMAIN` env var (`.waldo.click` prod, `.waldoclick.dev` staging)
- [ ] **SESS-06**: El entorno local (sin `COOKIE_DOMAIN`) no se ve afectado — cookie sigue siendo host-only

### Safety & Cleanup

- [ ] **SAFE-01**: Dashboard tiene composable `useLogout` centralizado; todos los call sites lo usan
- [ ] **SAFE-02**: La cookie host-only antigua (sin atributo domain) se limpia explícitamente en logout para prevenir zombie sessions
- [ ] **SAFE-03**: `.env.example` en ambas apps documenta `COOKIE_DOMAIN`

## Future Requirements

### Post-migration Polish

- **POLL-01**: Post-logout website Pinia stores reset cuando el logout se origina desde el dashboard (minor stale-data UX issue; stores son origin-scoped a localStorage, sin riesgo de seguridad)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Custom SSO redirect flow | No necesario — ambas apps comparten el mismo backend Strapi y emisor de JWT |
| Server-side JWT revocation / session blacklist | Fuera del modelo stateless JWT actual; no requerido para el caso de uso |
| Staging verification phase formal | Manual testing post-deploy, no requiere fase de código |
| `__Host-` prefixed cookie name | Explícitamente previene el atributo `Domain` (restricción RFC 6265) |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SAFE-01 | Phase TBD | Pending |
| SAFE-02 | Phase TBD | Pending |
| SAFE-03 | Phase TBD | Pending |
| SESS-01 | Phase TBD | Pending |
| SESS-02 | Phase TBD | Pending |
| SESS-03 | Phase TBD | Pending |
| SESS-04 | Phase TBD | Pending |
| SESS-05 | Phase TBD | Pending |
| SESS-06 | Phase TBD | Pending |

**Coverage:**
- v1.40 requirements: 9 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 9 ⚠️

---
*Requirements defined: 2026-03-16*
*Last updated: 2026-03-16 after initial definition*

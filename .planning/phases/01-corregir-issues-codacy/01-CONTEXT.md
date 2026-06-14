# Phase 1: Corregir issues de Codacy - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Resolver los 100 issues abiertos en Codacy para el repo `waldo-project` (snapshot
`.planning/research/codacy-issues-snapshot-2026-06-14.md`): 90 Security (Opengrep/Semgrep),
9 BestPractice (ESLint `no-explicit-any`), 1 UnusedCode (ESLint `no-unused-vars`).

La fase entrega: por cada issue, una disposición (FIX en código / SUPRIMIR como falso
positivo con justificación / VALIDAR-y-endurecer), aplicada de forma que Codacy quede limpio
**sin cegar la detección futura** y **sin introducir regresiones** en rutas de pago/auth/passwords.

Fuera de alcance: issues nuevos que aparezcan después del snapshot; refactors no relacionados;
cambios de comportamiento de producto.
</domain>

<decisions>
## Implementation Decisions

### Alcance y disposición
- Triage de los **100 issues**: arreglar todos los reales y suprimir los falsos positivos con justificación. Codacy debe quedar limpio y auditable.
- El **veredicto por-issue se decide en plan-phase leyendo cada línea flagueada** — no se asume desde el nombre del patrón. La clasificación mental previa es hipótesis, no hecho.
- Reales esperados (a confirmar por línea): `insecure-random` en generación de passwords, path-traversal real en `image-uploader`, `open-redirect` en `useProviders`, los 9 `no-explicit-any`, el `no-unused-vars` (puede ya estar resuelto en commit bb82c170).
- Sin gate de aprobación manual intermedio: el usuario eligió que execute proceda de forma autónoma una vez planeado. La lista de disposición vive en el PLAN.md como artefacto visible, pero no pausa la ejecución.

### Mecanismo de supresión (el más seguro)
- **Inline `// nosemgrep: <rule-id>` por línea** (con comentario de justificación) para reglas que tienen **mezcla** de hits reales y falsos: NoSQL-injection, path-traversal (`non-literal-fs`, `path-join-resolve`), v-html, SSRF, insecure-random, etc. Solo silencia esa línea; el resto del repo sigue vigilado.
- **Disable repo-wide en `.codacy.yaml` / config de la regla SOLO para reglas 100% ruido en este repo**: `hashicorp-tf-password` (detecta el nombre del campo "password" en forms Vue, no credenciales) y `detected-generic-api-key` (fixture en `jest.setup.ts`).
- **NUNCA** desactivar repo-wide una regla que tenga **al menos un hit real** — cegaría la detección de código genuinamente inseguro a futuro. Esta es la trampa a evitar.

### Discriminadores de triage (para el plan)
- **NoSQL-injection (36):** separar `*/content-types/*/lifecycles.ts` (condition, commune, region, category, article) — reciben `event.params` interno, casi seguro FP — de los controllers/middlewares (ad, payment, order, auth, user) que reciben input HTTP. En los HTTP: verificar que el valor que llega al filtro esté **coercionado a escalar** (un objeto permite inyección de operadores `$ne`/`$gt` incluso vía Strapi). No suprimir los 36 en bloque.
- **v-html (14):** discriminador = fuente confiable/sanitizada (HTML de CMS/Strapi, o pasado por DOMPurify) vs. controlada por usuario. Commits recientes de "v-html XSS audit" ya mitigaron algunos — verificar antes de re-tocar.
- **path-traversal:** servicios con data dir fijo (weather, indicador) y `config/database.ts` son config-driven (FP probable); `image-uploader` y `bbdd-backup.cron` pueden ser reales — el commit 3d81e7eb ya agregó guardas basename en backup.

### Correcciones técnicas (no aplicar a ciegas)
- `insecure-random`: depende del entorno. `apps/website/app/utils/password.ts` es **cliente** → `crypto.getRandomValues()`. `authController.ts:290` es **Node server** → `crypto.randomBytes()`. No aplicar uno solo a ambos.

### Gate de regresión
- En archivos de **alto blast-radius** (payment controllers, `authController.ts`, `password.ts`): antes de refactorizar, confirmar que existe cobertura de tests para esa ruta. Donde no exista, el plan agrega un **test de caracterización primero**, luego el fix.
- Verificación por bucket: `nuxt typecheck` (website/dashboard) + Jest (strapi) + correr Codacy CLI local para confirmar que el bucket bajó a 0 antes de pasar al siguiente.
- Commits atómicos agrupados por bucket de patrón.
</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- Codacy CLI v2 local ya instalado: `.codacy/cli.sh` / `pnpm codacy` (modo remote, org waldoclick). Permite re-verificar buckets localmente.
- Snapshot completo de issues: `.planning/research/codacy-issues-snapshot-2026-06-14.md` (agrupado por patrón, con archivo:línea).
- Tests existentes: `apps/strapi/tests/` (Jest, AAA), `apps/website/tests/` + `apps/dashboard/tests/` (Vitest). Regla obligatoria: tests en root `tests/`, nunca co-localizados.

### Established Patterns
- Strapi v5: usar `documentId` (no `id` numérico) en writes; queries vía documentService/entityService (parametrizadas — base de por qué muchos NoSQL son FP).
- DOMPurify / sanitización ya usada en componentes que renderizan HTML de CMS.
- `no-explicit-any` y `no-unused-vars`: CLAUDE.md prohíbe dejar vars sin usar y desaconseja `any`; NO usar prefijo `_` para silenciar (Codacy lo flaggea igual).

### Integration Points
- `.codacy.yaml` (raíz) — único punto para disables de patrón repo-wide. No crear `.codacy.yaml` per-app.
- Componentes Vue en `apps/website/app/components/` (v-html), servicios/controllers en `apps/strapi/src/`.
</code_context>

<specifics>
## Specific Ideas

El usuario pidió explícitamente: analizar bien cada punto porque puede haber falsos positivos
o cambios que perjudiquen otras cosas. La fase prioriza correctitud del triage sobre velocidad.
</specifics>

<deferred>
## Deferred Ideas

- Conectar el dashboard de Codacy via API/MCP con token de lectura (pendiente de token del usuario) — no requerido para esta fase, que trabaja desde el snapshot + CLI local.
- Nota de lifecycle: el snapshot quedó bajo milestone v1.46 que ya figura "✅ Complete" en ROADMAP. Verificar antes del paso de lifecycle autónomo (audit→complete→cleanup) que no corrompa el archivo existente; puede que esta fase deba ir bajo un milestone nuevo.
</deferred>

# Phase 4: Split legal pages into 4 documents with dashboard management - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-01
**Phase:** 04-split-legal-pages-into-4-documents-with-dashboard-management
**Areas discussed:** Seeders, URLs, Home, Registro, Featured (follow-up)

---

## Premise correction (before questions)

Codebase scout revealed the user's stated premise ("hay solo una vista que se llama condiciones de uso") was incomplete: two legal pages already exist end-to-end (`/condiciones-de-uso` backed by Strapi `term`, and `/politicas-de-privacidad` backed by Strapi `policy`), each with full CRUD, drag-and-drop reorder, and seeders. This was surfaced to the user as plain text before presenting gray areas, so their answers would be grounded in actual state rather than the original (incomplete) mental model. Also surfaced: `apps/dashboard` does not exist as a separate app — admin UI lives under `apps/website/app/pages/dashboard/**`.

---

## Seeders

| Option | Description | Selected |
|--------|-------------|----------|
| Reemplazar con los MDs | Source all 4 documents from the humanized MD files written this session — single source of truth, consistent tone | ✓ |
| Dejar Términos/Privacidad como están | Only add seeders for Cookies/Seguridad from the MDs; leave existing seeded content untouched | |

**User's choice:** Reemplazar con los MDs (Recommended)
**Notes:** No pushback on the legal-review risk flagged in the option description.

---

## URLs

| Option | Description | Selected |
|--------|-------------|----------|
| Mantener URL, solo relabel | `/condiciones-de-uso` stays, only visible text changes; new pages use plural `/politicas-de-X` | |
| Renombrar URL también | `/condiciones-de-uso` → `/terminos-y-condiciones-de-uso` with 301, 2-commit pattern, RESERVED_USERNAMES updated in both apps | ✓ |

**User's choice:** Renombrar URL también
**Notes:** User added a follow-up instruction after answering: when changing URLs, make sure to check links in the cookies-policy lightbox, the registration form, etc. This directly informed D-07 (reference list) in CONTEXT.md, including the newly-discovered `LightboxCookies.vue` "Más información" link.

---

## Home

| Option | Description | Selected |
|--------|-------------|----------|
| Calcar el patrón de FaqDefault | Reuse the `featuredFaqs` + home-section pattern for a "featured Términos" block | |
| Quiero describir algo distinto | Free-text override | ✓ (see notes) |

**User's choice:** Free text — user retracted the premise entirely: "No, solo preguntas frecuentes va en el home, me equivoque en eso. Ninguno de estos va en el home." Also repeated the URL-links reminder here.
**Notes:** This walked back the original phase request ("solo términos y condiciones de uso tienen el checkbox de destacar para mostrar en el home"). Required a follow-up question (see "Featured" below) to resolve the resulting ambiguity about the destacado/featured checkbox itself.

---

## Registro

| Option | Description | Selected |
|--------|-------------|----------|
| No, se quedan en 2 checkboxes | Cookies handled via consent banner, Seguridad is informational; only Términos link/label updates | ✓ |
| Sí, sumar los 4 al flujo de aceptación | Registration grows to 4 checkboxes or one multi-doc checkbox | |

**User's choice:** No, se quedan en 2 checkboxes (Recommended)

---

## Featured (follow-up question)

Asked after the Home retraction to resolve whether the "destacado" checkbox itself (independent of any home rendering) should still be built.

| Option | Description | Selected |
|--------|-------------|----------|
| Se cae por completo | No `featured` field, no checkbox anywhere — dead field otherwise | ✓ |
| Dejar el checkbox igual, aunque no se use | Add the field/checkbox for future use, build no home consumer | |

**User's choice:** Se cae por completo (confirmed via: "No, solo preguntas frecuentes va en el home, los demás NO")

---

## Claude's Discretion

- Exact Strapi API id / route naming for the 2 new content-types (avoiding collision with existing `condition` content-type).
- Whether to replicate dashboard CRUD components literally 2 more times vs. consolidate into a shared generic component.
- Exact HTML markup translation from MD prose into the seeder's inline-HTML string style.

## Deferred Ideas

- Home-page featured/destacado integration for legal docs — explicitly retracted; captured for a possible future phase, modeled on the existing FAQ pattern.
- Consolidating the term/policy/cookies/seguridad dashboard CRUD pattern into one generic component.

# Product Requirements Document (PRD)

This document describes Waldo's product requirements **as-built**: the problem it solves today, its personas, and its current shipped feature set framed as a baseline plus a forward-looking backlog — not a from-zero MVP definition. It is a retrospective/verification document, re-derived from `.planning/PROJECT.md`'s validated requirements history, `.planning/ROADMAP.md`'s shipped milestones, and `docs/spec/application-flows.md`'s verified application flows, not copied from any prior speculative product spec.

Waldo has never had a formal, standalone PRD before this one — product direction has historically been driven by an incremental, milestone-based planning process (`.planning/PROJECT.md`, `.planning/ROADMAP.md`) rather than a single upfront specification. This document exists to consolidate that history into one authoritative, code-verified reference, and to give future planning work (new milestones, new phases) a single place to check "what does Waldo already do" before scoping new work.

## Table of Contents

- [Problema que resuelve](#problema-que-resuelve)
- [Personas](#personas)
- [Glosario de dominio](#glosario-de-dominio)
- [MVP y futuras iteraciones](#mvp-y-futuras-iteraciones)
- [Métricas de éxito implícitas](#métricas-de-éxito-implícitas)
- [Criterios de aceptación](#criterios-de-aceptación)
- [Preguntas abiertas](#preguntas-abiertas)

---

## Problema que resuelve

Waldo is a classified-ads platform (avisos) for industrial/commercial equipment and assets. The core value it delivers, quoted verbatim from `.planning/PROJECT.md`:

> **Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.**

In English: users need a reliable way to publish and manage classified ads, with payments that work frictionlessly regardless of which payment gateway processes them. Two problems are addressed simultaneously:

1. **Ad lifecycle reliability.** A seller (individual or business) needs a trustworthy path from "create a listing" to "have it live and discoverable" — with moderation to keep the marketplace credible, and predictable expiry/renewal so stale listings don't clutter the catalog. `docs/spec/application-flows.md` Flow 2 documents this end-to-end: draft → payment confirmation → manager moderation (approve/reject/ban) → active → expiry.
2. **Payment friction and gateway lock-in.** Payments must not block or complicate ad publication, and the business logic must not be hard-wired to one payment gateway. The system is built with an abstraction layer so a listing publishes correctly whether the pack is free (`price: "0"` reservation credit) or paid (Webpay today, other gateways architecturally possible without touching ad/reservation logic). `docs/spec/application-flows.md` Flow 3 documents the free vs. paid branching; `docs/spec/backend-schema.md` documents the underlying entities (`Order`, `AdReservation`, `AdFeaturedReservation`).

Beyond the core classified-ads loop, Waldo also serves as a light content platform (Article/blog) and offers a recurring PRO subscription for sellers who want ongoing featured placement — both are shipped extensions of the same core value, not separate products.

### Why this matters (as verified against shipped increments)

`.planning/PROJECT.md`'s validated-requirements history is not a wishlist — every line is a shipped, verified increment (`✓ ... — vN.NN`), which means the "problem" framing above can be read directly off what was actually built rather than inferred from marketing copy. Three concrete signals corroborate the two problems stated above:

- **Reliability was treated as a first-class defect category, not a feature.** Early milestones (v1.1–v1.9) focused almost entirely on eliminating double-fetches, N+1 queries, silent failures, and untyped data flows across both the website and dashboard — before any new product surface was added. This indicates the team explicitly prioritized "avisos que funcionan de forma confiable" as a precondition, not an afterthought.
- **Payment-gateway abstraction was a day-one architectural decision, not a later refactor.** `.planning/PROJECT.md`'s Key Decisions table records "Abstracción en Strapi, no en el frontend" and "Transbank como adaptador default" as foundational choices — the frontend has never talked to Transbank directly, and the checkout flow's evolution (v1.21 draft model → v1.22 unified `/pagar` hub → v1.23 pack/ad branching → v1.24 free-ad path) consistently preserved this separation.
- **Order identity was hardened specifically against gateway coupling.** The non-negotiable `order.documentId` rule (`CLAUDE.md` Payment Rules, verified live in `docs/spec/application-flows.md` Flow 3) exists precisely so that a future second payment gateway would not require touching order-identity logic anywhere in the frontend.

## Personas

Roles are drawn from the verified auth/role model in `docs/spec/application-flows.md` Flow 1 (`dashboard-guard.global.ts`, role check `role.name.toLowerCase() === "manager"`). Waldo has no separate "admin" tier distinct from Manager, and Manager is not a mutually exclusive account type — it is an authenticated user whose role additionally grants access to `/dashboard/**`. All authenticated users are otherwise equal citizens of the platform.

- **End user / Seller (Authenticated role).** Publishes and manages their own ads (`apps/website` public pages), consumes 3 free ad-listing reservations and 3 free featured-placement reservations granted on registration (`docs/spec/application-flows.md` Flow 4), pays via Webpay when free credits run out, tracks orders and ad status from their account area.
- **Buyer / Browser (anonymous or Authenticated).** Browses and searches the public ad catalog, views ad detail pages, contacts sellers — does not require an account to browse, but publishing requires authentication.
- **Manager (Authenticated role + dashboard access).** Same account type as a seller, with the `Manager` role assigned. Moderates ads (approve/reject/ban — `docs/spec/application-flows.md` Flow 2), manages users, categories, orders, reservations, articles, legal documents, and gifts reservation credits to users, all from `/dashboard/**` (physically inside `apps/website`, not a separate app — see `docs/spec/technical-requirements.md`'s "Inconsistencias detectadas" note).
- **PRO Subscriber (Authenticated role, `pro_status === "active"`).** A seller on a recurring Webpay Oneclick Mall subscription for continuous featured placement; `pro_status` is the single source of truth for PRO membership (no separate boolean flag). Checkout and billing lifecycle are out of this document's core-flow scope — see `docs/spec/application-flows.md` Flow 3's "Out of scope for this diagram" note on PRO subscriptions.

### Persona detail: End user / Seller

The seller persona is the primary revenue and engagement driver. They register once (local or Google), receive their free credit allotment immediately, and can publish an ad without any payment step at all if they stay within the free-credit pool. When they need more listings or featured placement than their free credits cover, the same `/pagar` checkout hub handles both pack-only purchases and ad+pack combined purchases (`docs/spec/application-flows.md` Flow 3, `.planning/ROADMAP.md` v1.22–v1.23). Sellers track their ad status (draft/pending/active/rejected/banned/archived) and order history from their account area, and receive email notifications at every state transition that affects them (approval, rejection with credit-restitution notice, ban with credit-restitution notice).

### Persona detail: Manager

Because Manager is a role flag on an ordinary Authenticated account rather than a separate account type, any user can in principle be promoted to Manager without re-registering. In practice this is an internal/operational role used by Waldo's own team to keep the marketplace credible: reviewing every pending ad before it becomes publicly visible, handling abuse via ban, and running the operational surfaces (users, categories, orders, reservations, articles, legal documents, integrations) exposed under `/dashboard/**`. The dashboard-guard middleware is the sole enforcement boundary for this role at the routing layer; several service-level moderation actions (e.g. `bannedAd()`) additionally re-check owner-or-manager in-service as defense-in-depth (`docs/spec/application-flows.md` Flow 2).

### Non-goals (explicitly out of this document's scope)

- **Frontend/UI presentation specifics** — visual design, component inventory, and interaction patterns are covered by `docs/spec/ux-design.md`, not restated here.
- **Full entity/field-level schema** — every content-type's fields and relations live in `docs/spec/backend-schema.md`'s ER diagram; this document only names entities where needed for acceptance-criteria traceability.
- **Deployment/infrastructure topology** — covered by `docs/spec/technical-requirements.md` and `docs/deploy/deployment.md`.
- **PRO subscription billing internals** (Oneclick inscription state machine, retry/backoff mechanics) — acknowledged as shipped (see Baseline actual) but not diagrammed here; `docs/spec/application-flows.md` explicitly scopes it out of the six mandated core flows.

## Glosario de dominio

Terms used throughout this document and cross-referenced documents, verified against live schema (`docs/spec/backend-schema.md`) and flows (`docs/spec/application-flows.md`):

- **Aviso (Ad):** a classified listing. Its displayed status is always derived (never stored directly) by `computeAdStatus()` from four fields: `draft`, `active`, `rejected`, `banned`, plus `remaining_days`.
- **Pack:** the pricing tier selected for an ad — `free`, `paid`, or a specific named pack — which determines which `AdReservation` credit type is consumed at publish time.
- **Destacado (Featured):** an optional add-on that boosts an ad's visibility, backed by a separate `AdFeaturedReservation` credit, independent of the base ad-listing credit.
- **Reserva (Reservation):** a pre-allocated credit (`AdReservation` or `AdFeaturedReservation`) a user can spend on publishing an ad or featuring one. A `price: "0"` reservation is a free-tier credit; any other price is a purchased one.
- **Orden (Order):** the durable, Strapi-native record of a completed transaction, identified exclusively by `documentId`. Gateway-specific fields (`buy_order`, `token_ws`, `authorization_code`) live inside the order for audit purposes only.
- **Manager:** the dashboard-privileged role, not a separate account type — see Personas above.
- **PRO:** the recurring-subscription tier for continuous featured placement, governed by `pro_status` as the single source of truth.

## MVP y futuras iteraciones

**Framing note (per D-03):** this section documents Waldo's **shipped baseline** as of milestone v1.46 — it is not a from-zero MVP scope definition. Every item below has already shipped and been verified against source (see `.planning/ROADMAP.md` and `.planning/milestones/`). The backlog subsection lists genuinely open/forward-looking work, drawn from `.planning/STATE.md`'s open blockers and in-flight incomplete plans, not speculative feature ideas.

### Baseline actual (shipped)

Drawn from `.planning/ROADMAP.md`'s milestone history (v1.0 through v1.46, phases 1–129+):

- **Core marketplace loop:** ad creation wizard (5 dedicated URL steps, wizard-guard middleware), draft-first ad model (`draft: boolean` field, `POST /ads/save-draft`), manager moderation (approve/reject/ban with reservation-credit restoration on reject/ban), ad expiry via `adCron` — `docs/spec/application-flows.md` Flow 2.
- **Payments, gateway-agnostic by design:** unified checkout (`/pagar` as single payment hub), free vs. paid branching (`AdReservation`/`AdFeaturedReservation` credits), Webpay integration behind an internal abstraction, order identity always `order.documentId` (never a gateway token), Webpay receipt display (`/pagar/gracias`, 8-field comprobante) — `docs/spec/application-flows.md` Flow 3.
- **Reservation system:** 3 free ad-listing + 3 free featured-placement credits per user on registration/first Google login, nightly restore safety-net (`userCron`), manager-initiated gifting of reservation credits — `docs/spec/application-flows.md` Flow 4.
- **Authentication:** local email/password with mandatory two-step (6-digit code) verification, Google OAuth popup, Google One Tap, httpOnly `waldo_jwt` cookie shared across subdomains via Nitro proxy injection, dashboard role gate — `docs/spec/application-flows.md` Flow 1 (v1.36, v1.40, v1.44).
- **Audit logging:** every Strapi content-type CRUD mutation captured via a global `db.lifecycles.subscribe()` hook, written through a `{ actor, actor_type, data }` envelope into the existing Winston/Better Stack logging infrastructure — `docs/spec/application-flows.md` Flow 5 (Phase 5, v-current).
- **Operational automation:** 6 scheduled cron jobs (ad expiry, reservation restore, DB backup, verification-code cleanup, media-cleanup audit, PRO billing when enabled) plus 1 manual-trigger-only migration task, all re-runnable via `POST /api/cron-runner/:name` — `docs/spec/application-flows.md` Flow 6.
- **PRO subscriptions:** full Webpay Oneclick Mall lifecycle (inscription, recurring monthly charge with 3-day retry, cancellation), `pro_status` as single source of truth (v1.46).
- **Content platform:** Article/blog content-type with SEO fields, dashboard CRUD, AI-assisted article drafting (Gemini/Groq/Claude providers with fallback chain), public blog views (v1.29–v1.34).
- **Legal documents:** 4 independently manageable legal pages (Términos y Condiciones, Política de Privacidad, Política de Cookies, Política de Seguridad) with dashboard CRUD and drag-and-drop ordering (Phase 4).
- **Platform quality baseline:** `typeCheck: true` enforced in both website and dashboard builds, zero `any` across Strapi services/controllers/integrations, shared TypeScript domain types, GA4/GTM ecommerce event tracking, SEO infrastructure (structured data, sitemap, OG/Twitter tags).
- **CRM/marketing integrations:** Zoho CRM contact-stats sync on ad publish, Facto invoicing for boleta/factura generation.
- **AI-assisted internal tooling:** a provider-agnostic `ai-provider` orchestrator (Gemini/Groq/Claude/Cerebras, configurable fallback chain) backing article drafting and registration-time free-text field validation (fail-open by design — an AI outage never blocks user registration).
- **Security hardening baseline:** IDOR fixes across users/ads/orders, mass-assignment guards on ad payment/approval endpoints, method-based reCAPTCHA on all mutating dashboard routes, httpOnly-cookie session centralization eliminating client-side JWT exposure entirely (Phases 107–129).

### Backlog / futuras iteraciones

Drawn from `.planning/STATE.md`'s open blockers, in-flight incomplete plans, and `docs/spec/application-flows.md`'s own "Preguntas abiertas":

- **PRO Oneclick Mall production contracting** — Oneclick Mall must be contracted separately with Transbank for production before PRO billing can go fully live (open blocker in `.planning/STATE.md`).
- **Phase 4 human-verification checkpoint (04-09)** — manual Strapi admin permission grant + 12-point visual/functional verification for the Cookies/Seguridad legal pages, not yet executed.
- **Phase 5 human-verification checkpoint (05-02)** — final audit-log-homologation verification checkpoint, gated on plans 03/04/05/06 (all four now complete), not yet executed.
- **Codacy suppression track (01-06)** — bulk-ignore pass for ~80 flagged false positives, blocked on a Codacy account token.
- **AI-to-domain-endpoints frontend cutover (02-02)** — migrate `LightBoxArticles.vue` to the new domain endpoints and delete the legacy `ia`/`search` Strapi resources; requires a human verification checkpoint.
- **`cron-runner` manual-trigger endpoint access control** — existence and re-run capability confirmed, but its route-level policy/permission configuration was not independently re-verified (`docs/spec/application-flows.md` Preguntas abiertas #2).
- **`docs/domain/analytics-events.md` re-verification** — the pre-existing analytics doc (dated 2026-03-14) was not re-verified against the current GA4/GTM implementation during this documentation pass; deliberately deprioritized as it's outside the six mandated core flows (`docs/spec/application-flows.md` Preguntas abiertas #1).
- **`AdFeaturedReservation` has no scheduled restore cron** — only the synchronous reject/ban release path frees featured-placement credits; an earlier `featuredCron` was implemented and reverted. Whether a scheduled safety-net is needed for featured slots (mirroring `AdReservation`'s `userCron` restore) is an open product question, not yet scoped as a fix.
- **Dead code cleanup: `/payments/ad` (`adCreate`/`adResponse`)** — confirmed commented out of the route file and marked `DEPRECATED` in-code, superseded by the unified `checkoutCreate`/`webpayResponse` flow, but the dead controller functions themselves have not been physically removed from `payment.ts` (`docs/spec/application-flows.md` Flow 3).
- **Reservations/Featured consolidation** — an earlier attempt at consolidating the reservation and featured-reservation list components in the dashboard was explicitly deferred (`.planning/PROJECT.md` Key Decisions: "Reservations\*/Featured\* consolidation deferred") because their fetch strategies and store keys are incompatible; remains unresolved at this milestone.

## Métricas de éxito implícitas

No formal, numerically-targeted success metrics (e.g. conversion rate targets, GMV goals) exist in `.planning/PROJECT.md` or `.planning/ROADMAP.md` — this platform's roadmap has been driven by shipped-increment validation ("✓ ... — existente" / "✓ ... — vN.NN" entries) rather than a metrics-first product process. The following are the implicit success signals the shipped feature set optimizes for, inferred from what was built and instrumented:

- **Zero silent failures in the payment path.** The `order.documentId`-identity rule, idempotent Webpay-callback handling, and fail-closed `AD_FEATURED_PRICE` amount validation (`docs/spec/application-flows.md` Flow 3) all exist specifically to prevent a paid transaction from producing an inconsistent or unrecoverable state — this is treated as a correctness invariant, not an optimization.
- **Full-funnel ecommerce visibility.** GA4/GTM events cover the entire ad-creation and pack-purchase funnels (`view_item_list`, `step_view` per wizard step, `begin_checkout`, `redirect_to_payment`, `purchase`) — instrumented specifically to measure drop-off and conversion, even though no target conversion rate is documented (`.planning/PROJECT.md` v1.12, v1.27).
- **Marketplace credibility via moderation.** Every ad passes through manager approval before becoming publicly active — a deliberate trust/safety gate rather than an open-posting model.
- **Frictionless free-tier onboarding.** New users get usable credits (3 free ad + 3 free featured) at the moment of registration, with no payment step required to publish a first ad — this lowers the activation barrier and is reinforced by the nightly restore cron that keeps the free pool topped up over time.
- **Operational reliability over manual ops.** Six unattended cron jobs plus a manual re-trigger endpoint reflect an explicit goal of minimizing manual database intervention for routine maintenance (ad expiry, reservation restoration, backups, cleanup, billing).

## Criterios de aceptación

The following are behaviors already verified as shipped, each cross-referenced to a flow in `docs/spec/application-flows.md` (not speculative acceptance criteria):

1. A user can register (local email/password or Google) and receives exactly 3 free `AdReservation` + 3 free `AdFeaturedReservation` credits automatically (`application-flows.md` Flow 1, Flow 4).
2. Local email/password login requires a 6-digit verification code (15-minute expiry, max 3 attempts) before a session is issued; Google-authenticated logins bypass this step (`application-flows.md` Flow 1).
3. The client-side JavaScript never holds the Strapi JWT — it is stored exclusively as an httpOnly `waldo_jwt` cookie set by the Nitro proxy layer (`application-flows.md` Flow 1).
4. A user can save an ad as a draft (`POST /ads/save-draft`) before completing payment, and only the ad's owner can update that draft (`application-flows.md` Flow 2).
5. An ad transitions from `draft` to `pending` (awaiting moderation) only after payment confirmation — free-pack or Webpay-paid — via `publishAd()` (`application-flows.md` Flow 2, Flow 3).
6. A user with the `Manager` role can approve, reject, or ban a pending/active ad from `/dashboard/**`; approving sends a notification email and syncs publish stats to Zoho CRM on first publish (`application-flows.md` Flow 2).
7. Rejecting or banning an ad immediately releases its linked `AdReservation` and `AdFeaturedReservation` credits back to the user, making them reusable without waiting for a cron cycle (`application-flows.md` Flow 2, Flow 4).
8. A free-pack ad publish (`POST /payments/free-ad`) requires no Webpay interaction and consumes a `price: "0"` reservation credit (`application-flows.md` Flow 3).
9. A paid ad publish redirects to Webpay, and on return the browser is redirected to `/pagar/gracias?order={order.documentId}` — never a gateway token or `buy_order` value — per the project's non-negotiable payment-identity rule (`application-flows.md` Flow 3; `CLAUDE.md` Payment Rules).
10. A duplicate Webpay callback for the same `buy_order` is idempotent — it returns the existing order rather than double-charging or double-publishing (`application-flows.md` Flow 3).
11. A nightly cron (`userCron`) tops up any user below 3 available free `AdReservation` slots, treating reservations linked to expired/banned/rejected ads as spent rather than available (`application-flows.md` Flow 4, Flow 6).
12. A manager can gift N ad-listing or featured-placement reservation credits directly to a selected authenticated user, who receives an email notification (`application-flows.md` Flow 4).
13. Every content-type create/update/delete in Strapi is captured by a global lifecycle hook and written as a structured log line (`{ actor, actor_type, data }`) to the existing Winston/Better Stack logging pipeline — no dedicated audit database table (`application-flows.md` Flow 5).
14. Six scheduled cron jobs run unattended on their configured schedules (ad expiry, reservation restore, DB backup, verification-code cleanup, media-cleanup audit, and conditionally PRO billing), and any of them (plus the manual-only migration task) can be re-triggered on demand via `POST /api/cron-runner/:name` (`application-flows.md` Flow 6).
15. A dashboard route under `/dashboard/**` is inaccessible to any authenticated user whose role is not `Manager`, and inaccessible entirely to anonymous users (`application-flows.md` Flow 1).
16. PRO subscribers are billed monthly via Webpay Oneclick Mall with a 3-day retry window on failed charges; `pro_status` is the single field the rest of the system reads to determine active membership — no legacy boolean flag is consulted anywhere (`.planning/PROJECT.md` v1.46).
17. A user's email address is treated as sensitive: only server-side `strapi.db.query` filtering (not the content-API sanitizer) is used to enumerate Authenticated users for the gifting feature, closing off a forgeable-filter path that would otherwise let a client request an unauthorized role listing (`.planning/PROJECT.md` v1.17).
18. Winston transport failures during audit-log writes are caught and never block the underlying business operation that triggered them — a logging outage cannot take down ad publication, payment processing, or moderation actions (`application-flows.md` Flow 5).

Each numbered item above maps to a `docs/spec/application-flows.md` happy-path step or explicitly documented error/role-gated branch — none were derived from assumption, prior `/docs/*.md` content, or `.planning/codebase/*` prose without independent source verification, per the phase's D-06 mandate.

## Preguntas abiertas

- Whether the product intends to add a scheduled safety-net restore for `AdFeaturedReservation` credits (mirroring `AdReservation`'s `userCron` behavior) is not resolved — currently only the synchronous reject/ban path frees featured slots (see Backlog above and `docs/spec/application-flows.md` Flow 4's correction note).
- The `cron-runner` manual-trigger endpoint's access-control configuration was not independently re-verified in this documentation pass — see `docs/spec/application-flows.md` Preguntas abiertas #2.
- No formal product requirement document predates this one; "MVP" in the original sense (a from-zero minimum feature set) was never separately specified — this PRD documents the shipped baseline in its place, per D-03.
- No numerically-targeted product success metrics (conversion rate, GMV, retention) are documented anywhere in `.planning/PROJECT.md` or `.planning/ROADMAP.md` — the "Métricas de éxito implícitas" section above is inferred from what was built and instrumented, not from a stated goal; whether the product team tracks such targets outside this repository's planning artifacts is unknown.
- `docs/domain/analytics-events.md`'s staleness (dated 2026-03-14) means this PRD cannot independently confirm which GA4/GTM events are still firing correctly in production versus which may have drifted since the last analytics-specific verification pass.
- The Reservations/Featured dashboard-component consolidation, deferred per `.planning/PROJECT.md`'s Key Decisions log, has no target milestone — it is documented as a known deferred item with no committed timeline.
- Whether Waldo intends to formalize numerically-targeted product metrics going forward (post this documentation phase) is outside this document's ability to answer — it is a process question for the product owner, not a code-verifiable fact.

---

*Cross-references: [`docs/spec/application-flows.md`](./application-flows.md) for verified application flows and Mermaid diagrams; [`docs/spec/backend-schema.md`](./backend-schema.md) for the underlying entity/schema model; [`docs/spec/technical-requirements.md`](./technical-requirements.md) for architecture and infrastructure; [`docs/spec/ux-design.md`](./ux-design.md) for UI/UX design; [`docs/spec/implementation-plan.md`](./implementation-plan.md) for the retrospective delivery-phase history; `.planning/ROADMAP.md` and `.planning/PROJECT.md` for the full shipped-milestone and validated-requirements history.*

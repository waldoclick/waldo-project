# AGENTS.md — Waldo Project

AI coding rules for this monorepo. Applies to all tools (OpenCode, Claude, Cursor, Copilot, etc.).

---

## Project Context

Classified ads platform (avisos) composed of two apps in a monorepo:

- **`apps/website`** — Public-facing Nuxt 4 website; also serves the admin dashboard as `/dashboard/*` routes (the former `apps/dashboard` was merged in and deleted)
- **`apps/strapi`** — Backend API and CMS (Strapi v5)

All business logic lives in Strapi. The website is a stateless HTTP client.
Monorepo orchestrated with Turbo. Package manager: **pnpm** (never npm or yarn).

**Core value:** Users can publish and manage ads reliably, with frictionless payments — regardless of payment gateway.

---

## Documentation

Project documentation lives in the **GitHub wiki**, NOT in the repo — there is no `docs/` folder.

- Browse: https://github.com/waldoclick/waldo-project/wiki
- Read/edit locally (or when an agent needs it): clone `git@github.com:waldoclick/waldo-project.wiki.git` (it is a separate git repo, so it is not in this working tree — clone it to read the docs).
- The wiki is the single source of truth. Deploy runbooks, domain docs (ad statuses, payments, reservations, permissions, cache), and the as-built specs (PRD/TRD/BSD/etc.) all live there.

---

## Stack

### Website + Dashboard (`apps/website`, dashboard lives at `/dashboard/*`)
- Nuxt 4.1.3 with `future.compatibilityVersion: 4`
- Vue 3 Composition API with `<script setup>`
- TypeScript (strict mode — `typeCheck: true`)
- Pinia + `@pinia-plugin-persistedstate/nuxt` for state management
- `@nuxtjs/strapi` v2 for Strapi integration
- `@nuxt/image` for optimized images
- `@nuxtjs/seo` for SEO
- `nuxt-security` for CSP and security headers
- `@sentry/nuxt` for error tracking
- Vite 6 as build tool
- Vitest + `@nuxt/test-utils` for testing
- Sass for styling
- `@nuxt/eslint` for linting

### Strapi (`apps/strapi`)
- Strapi v5
- TypeScript
- Jest for testing

### Code Quality (all apps)
- Codacy configured at root (`.codacy.yaml`) — covers ESLint, Stylelint, duplication, complexity
- Run with: `pnpm codacy` from root (via Turbo)
- Do **not** create per-app `.codacy.yaml` files — root config is the only one
- **Never leave unused variables or imports** — delete them, do not rename with `_` prefix (Codacy flags `_`-prefixed vars too unless `argsIgnorePattern` is configured, which it is not)
- This applies to function parameters as well — if a parameter is unused, remove it or restructure the function signature

---

## Coding Standards

### Language & Naming
- All code, comments, documentation, and commits must be in **English**
- `camelCase` — variables and functions
- `PascalCase` — components, composables, classes, services, interfaces
- `kebab-case` — file names for pages and components
- `UPPER_SNAKE_CASE` — constants
- Interfaces use `PascalCase` with `I` prefix (e.g. `IPaymentGateway`)
- Functions follow verb + noun pattern (e.g. `loadUserAdCounts`)
- Avoid abbreviations unless widely known (HTTP, URL, etc.)

### General
- Use TypeScript everywhere — no `any` unless a cast is strictly necessary and documented
- Follow SOLID principles in all services (especially Strapi)
- Dependencies must be injected, not instantiated inside services
- Extend functionality without modifying existing code (Open/Closed Principle)

---

## Project Structure

### Nuxt app (`apps/website`, includes the `/dashboard/*` pages)
- `pages/` — file-based routing (Nuxt convention). Pages are **composition only**: they import and arrange components, never contain HTML sections or BEM classes directly
- `components/` — auto-imported Vue components (PascalCase filenames)
- `composables/` — reusable logic (auto-imported)
- `stores/` — Pinia stores
- `server/` — Nitro server-side code and API routes
- `app/types/` — shared TypeScript types and declaration files
- `app/utils/` — pure formatting utilities (auto-imported via Nuxt)

### Creating new files (pages, components, SCSS)
- **Always replicate the closest existing equivalent** — before creating any new file, find the most similar existing file and copy its exact structure, imports, and patterns
- New pages must follow the same template as sibling pages in the same directory (e.g. `pro/gracias.vue` must match `pagar/gracias.vue`)
- New components must follow the same structure as the component they are modeled after (e.g. `ResumePro.vue` must match `ResumeOrder.vue`)

### Strapi (`apps/strapi`)
Service folder structure: `/config`, `/services`, `/types`, `/factories`, `/tests`

Each file must be prefixed with the service name:
- `indicator.config.ts`, `indicator.service.ts`, `indicator.types.ts`, `indicator.factory.ts`, `indicator.test.ts`

Each service directory must have an `index.ts` that re-exports everything. Other modules import from `index.ts` only (never from individual files).

---

## Nuxt-Specific Rules

### Data Fetching
- `useAsyncData()` is the **sole** correct data-loading trigger in Nuxt pages — never pair a bare `await storeAction()` with `useAsyncData` in the same page (causes double-fetch on SSR + hydration)
- `useAsyncData` keys must be unique per page: `'<page>-<data>'` for static pages, `'page-${param}'` for dynamic routes
- `watch({ immediate: true })` is the sole data-loading trigger in dashboard components — never pair with `onMounted`
- Always provide a `default` option in `useAsyncData` (e.g. `default: () => []`) to eliminate `T | undefined` from the inferred type

### Configuration & Environment
- `useRuntimeConfig().public` — client-accessible config
- `useRuntimeConfig()` (no `.public`) — server-only config
- `useHead()` / `useSeoMeta()` for page metadata
- `definePageMeta()` for page-specific configuration
- `navigateTo()` for programmatic navigation

### State Management
- Pinia stores in `stores/` directory
- Stores with `persist` must have an inline audit comment directly above the `persist:` key:
  `// persist: CORRECT|REVIEW|RISK — <one-line rationale>`
- Always add a cache guard when adding `persist` to a store — and vice versa
- Cache guard format: `lastFetch: 0` in state, `length > 0 && Date.now() - lastFetch < TTL` as the condition

### Strapi Integration
- Use `@nuxtjs/strapi` for all Strapi calls
- Strapi SDK v5 cast patterns:
  - `response.data as T[]`
  - `params as Record<string, unknown>`
  - `filters: { ... } as unknown as Record<string, unknown>`
  - Payload double-cast: `payload as unknown as Parameters<...>[N]`

### Brand Colors
Never use colors outside this palette. Do not invent or approximate colors — use exact hex values.

| Token | Hex | Usage |
|-------|-----|-------|
| `$light_peach` | `#ffd699` | Primary CTA buttons, brand backgrounds, email button background |
| `$charcoal` | `#313338` | Primary text, dark button background, email button text on `#ffd699` |
| `$davys_grey` | `#555555` | Secondary text |
| `$silver` | `#c8c8c9` | Disabled states, borders |
| `$gainsboro` | `#eaebeb` | Dividers, subtle borders |
| `$platinum` | `#ededed` | Background surfaces |
| `$cultured` | `#f5f5f5` | Light backgrounds |
| `$ghost_white` | `#f7f7f7` | Alternate light backgrounds |
| `$white_smoke` | `#f2f2f2` | Input backgrounds |
| `$eerie_black` | `#333333` | High-contrast text |
| `$jet` | `#2d2d2e` | Near-black surfaces |
| `$red_salsa` | `#ff6b6b` | Errors, destructive actions |
| `$dodger_blue` | `#2196f3` | Links, info states |
| `$independence` | `#4e6297` | Secondary/muted blue accents |
| `$magic_mint` | `#c2e3d9` | Success states |

**In MJML email templates:** use `#ffd699` for button `background-color` and `#313338` for button `color`. Never use any other color for CTA buttons in emails.

### CSS / SCSS
- Follow **BEM** naming convention for all CSS classes
- One SCSS file per component, named after the base class (e.g. `header.scss` for `.header`)
- SCSS nesting must mirror HTML hierarchy exactly — siblings in HTML → siblings in SCSS, children → nested
- Do not add `box-shadow` or `transform: scale` to elements
- Keep transitions simple — no scale transforms on hover
- Do not create new CSS files unless the component does not already have one

#### BEM Naming Structure
- BEM = **Block** + **Modifier** + **Elements**
- The **block** is a single semantic noun: `upload`, `form`, `card`, `gallery`
- A **modifier** extends the block with `--`: `upload--media`, `form--checkout`, `card--article`
- The root HTML element gets **both** classes: `class="upload upload--media"`
- All **elements** are children of the modifier namespace: `upload--media__grid`, `upload--media__item`
- Element sub-levels use `__`: `upload--media__item__image`, `upload--media__item__remove`
- **Never** use a hyphenated compound as the block name — that is a block + modifier, not a new block
  - Correct: `upload--media` (block `upload`, modifier `media`)
  - Wrong: `upload-media` (looks like a block but is really a compound — not valid BEM)

#### No standalone compound class names — always use hierarchy
- **NEVER** create standalone classes with hyphens like `lightbox-backdrop`, `section-user`, `modal-overlay` — these are not valid BEM and break the namespace
- Every class must belong to a BEM hierarchy: if the parent is `.lightbox--demo`, its children are `.lightbox--demo__box`, `.lightbox--demo__box__title`, etc.
- If a child element needs a class, it gets it from the parent's namespace — never a new freestanding hyphenated name
  - Correct: `.lightbox--demo__backdrop`, `.lightbox--demo__box`, `.lightbox--demo__box__title`
  - Wrong: `.lightbox-backdrop`, `.section-user`, `.modal-overlay` (standalone compound names)

#### BEM Modifier Encapsulation
- A block modifier (`block--modifier`) is its **own namespace** — all its children must be prefixed with the modifier, not the base block
  - Correct: `form--checkout__field`, `form--checkout__field__title`
  - Wrong: `form__field`, `form__section-title` inside a `form--checkout` context
- Never use hyphenated words as BEM element names — use a single noun or compound written without hyphens
  - Correct: `form--checkout__field__title`
  - Wrong: `form--checkout__field__section-title`
- Do not invent new base-block element classes (e.g. `form__section-title`) when the component already has a modifier — scope everything under the modifier instead

#### form__label with non-input elements
- `form__label` is `position: absolute; top: -6px` — it floats over the border of a `form__control` input
- Never use `form__label` directly on upload, gallery, or other non-input blocks — the label will float incorrectly
- For non-input groups, add the `form__group--upload` modifier: `<div class="form__group form__group--upload">` — this makes the label `position: static` with proper margin

---

## Strapi-Specific Rules

### Plugin Extensions (Strapi v5)
- Custom controllers in plugin extensions are **not supported** in Strapi v5 — do not create or uncomment them
- Use **middlewares** to extend plugin behavior (e.g. adding `role` and `commune` to `/users/me` responses)
- Do not modify `src/extensions/users-permissions/strapi-server.ts` controller files

### Content Operations
- Prefer `documentId` over numeric `id` for content updates and deletes in Strapi v5
- Never assume `id` works for write operations

### Payment Rules — NEVER VIOLATE THESE

- **Order identity is always the Strapi `order.documentId`** — never use a payment gateway reference (Webpay `buy_order`, token, `TBK_*`, etc.) as an order identifier
- The frontend page `/pagar/gracias` receives `?order={documentId}` in the URL and calls `useOrderById(documentId)` to fetch the order from Strapi — if you pass anything other than `order.documentId` the page will 500
- Payment gateway data (`buy_order`, `token_ws`, `authorization_code`, etc.) is stored **inside** the order record for audit purposes only — it is never used as a primary key or redirect parameter
- `buy_order` is a Webpay-specific field — other gateways will not have it; always resolve to `order.documentId` before redirecting or returning to the frontend
- After any Webpay/payment flow completes, always create the Strapi order record first, then redirect with `?order={order.documentId}`
- When in doubt: the source of truth is Strapi, not the payment gateway

### Cron Jobs
- Four active cron jobs: `adCron` (1 AM), `userCron` (2 AM), `backupCron` (3 AM), `cleanupCron` (Sunday 4 AM)
- Manual execution available via `POST /api/cron-runner/:name`
- Before implementing a new cron, audit existing ones for overlapping responsibility
- Cron file naming: `{domain}-{function}.cron.ts`
- Strapi v5 config access: `strapi.config.get('database') as { connection: { host, port, database, user, password } }`

---

## Testing Rules

### Mandatory Testing Directory Rule
**All test files must live in the root-level `tests/` directory of their app — never co-located with source files.**

| App | Test root | Mirror pattern |
|-----|-----------|----------------|
| `apps/website` | `apps/website/tests/` | mirrors `app/` structure |
| `apps/strapi` | `apps/strapi/tests/` | mirrors `src/` structure |

- Never create test files inside `app/`, `src/`, or any subdirectory alongside production code
- File name and folder structure must mirror the source — e.g. `src/services/foo/foo.service.ts` → `tests/services/foo/foo.service.test.ts`
- Relative imports inside test files must cross the `tests/ → app/` or `tests/ → src/` boundary explicitly (e.g. `../../src/services/foo`)

### Nuxt apps (website & dashboard)
- Use Vitest with `@nuxt/test-utils`
- All utility functions must have 100% unit test coverage at creation time

### Strapi
- Use Jest, following the **AAA pattern** (Arrange, Act, Assert)
- Mock all external dependencies
- Test names must be descriptive and in English

### General
- Verify non-TypeScript file changes explicitly (MJML, SQL, config) — they may not be caught by TypeScript checks

---

## Refactoring Guidelines

- Prefer **purely subtractive** refactors — remove duplicate code rather than adding new abstractions
- Run `nuxt typecheck` as a diagnostic tool before enabling `typeCheck: true` — catalogues errors without blocking builds
- Enable `typeCheck: true` only after all errors are resolved
- `window.d.ts` — consolidate all Window globals here (TypeScript merges `declare global` blocks)
- File renames must update all import references atomically in the same commit
- `git mv` for all Nuxt page directory and file renames (preserves Git rename history)
- Two-commit pattern for URL migrations: rename first → update all internal refs second
- Never change Spanish UI labels (breadcrumbs, page titles) in a URL/route migration — they are user-visible content
- Codacy analysis must pass before committing code quality changes (`pnpm codacy`)

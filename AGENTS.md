# AGENTS.md — Waldo Project

AI coding rules for this monorepo. Applies to all tools (OpenCode, Claude, Cursor, Copilot, etc.).

---

## Project Context

Classified ads platform (avisos) composed of three apps in a monorepo:

- **`apps/website`** — Public-facing Nuxt 4 website
- **`apps/dashboard`** — Admin dashboard (Nuxt 4)
- **`apps/strapi`** — Backend API and CMS (Strapi v5)

All business logic lives in Strapi. Website and dashboard are stateless HTTP clients.
Monorepo orchestrated with Turbo. Package manager: **Yarn** (never npm).

**Core value:** Users can publish and manage ads reliably, with frictionless payments — regardless of payment gateway.

---

## Stack

### Website & Dashboard (`apps/website`, `apps/dashboard`)
- Nuxt 4.1.3 with `future.compatibilityVersion: 4`
- Vue 3 Composition API with `<script setup>`
- TypeScript (strict mode — `typeCheck: true` in both apps)
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
- Run with: `yarn codacy` from root (via Turbo)
- Do **not** create per-app `.codacy.yaml` files — root config is the only one

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

### Nuxt apps (`apps/website`, `apps/dashboard`)
- `pages/` — file-based routing (Nuxt convention)
- `components/` — auto-imported Vue components (PascalCase filenames)
- `composables/` — reusable logic (auto-imported)
- `stores/` — Pinia stores
- `server/` — Nitro server-side code and API routes
- `app/types/` — shared TypeScript types and declaration files
- `app/utils/` — pure formatting utilities (auto-imported via Nuxt)

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

### Cron Jobs
- Four active cron jobs: `adCron` (1 AM), `userCron` (2 AM), `backupCron` (3 AM), `cleanupCron` (Sunday 4 AM)
- Manual execution available via `POST /api/cron-runner/:name`
- Before implementing a new cron, audit existing ones for overlapping responsibility
- Cron file naming: `{domain}-{function}.cron.ts`
- Strapi v5 config access: `strapi.config.get('database') as { connection: { host, port, database, user, password } }`

---

## Testing Rules

### Nuxt apps
- Use Vitest with `@nuxt/test-utils`
- Unit tests live in `tests/utils/{name}.test.ts` for utility functions
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
- Codacy analysis must pass before committing code quality changes (`yarn codacy`)

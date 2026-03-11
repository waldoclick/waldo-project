# Codebase Structure

**Analysis Date:** 2026-03-10

## Directory Layout

```
[waldo-project]/
├── apps/                         # Core applications
│   ├── dashboard/                # Nuxt.js admin dashboard for managing ads
│   ├── website/                  # Nuxt.js 4 public website for users
│   └── strapi/                   # Strapi API backend and content CMS
├── package.json                  # Monorepo package configuration
├── turbo.json                    # Turbo configuration for orchestrated tasks
├── yarn.lock                     # Yarn lockfile
└── .planning/                    # Planning and architecture files
```

## Directory Purposes

**`apps/dashboard/`:**
- **Purpose:** Admin dashboard for managing ads and user accounts.
- **Contains:** Nuxt.js codebase with Vue components, Pinia stores, and utility functions.
- **Key files:** `nuxt.config.ts`, `app/pages/auth/login.vue`

**`apps/website/`:**
- **Purpose:** User-facing website with SSR capabilities.
- **Contains:** Nuxt.js 4 codebase; Vue components, composables, and state management.
- **Key files:** `nuxt.config.ts`, `app/pages/index.vue`

**`apps/strapi/`:**
- **Purpose:** API and backend logic; includes Strapi configurations and content types.
- **Contains:** Content types, controllers, services, and middleware.
- **Key files:** `src/index.ts`, `src/api/ad/controllers/ad.ts`

**`.planning/`:**
- **Purpose:** Architecture and roadmap planning documents.
- **Contains:** `STACK.md`, `ARCHITECTURE.md`, and milestones.
- **Key files:** `codebase/`, `REQUIREMENTS.md`

## Key File Locations

**Entry Points:**
- `apps/dashboard/nuxt.config.ts`: Configures the dashboard app.
- `apps/website/nuxt.config.ts`: Configures the website app.
- `apps/strapi/src/index.ts`: Boots the Strapi backend.

**Configuration:**
- `package.json`: Monorepo dependencies and scripts.
- `turbo.json`: Defines orchestrated tasks for all apps.
- `apps/**/.env.*`: Environment variables for individual apps.

**Core Logic:**
- `apps/website/app/pages/`: Route-level logic for the public site.
- `apps/dashboard/app/pages/`: Route-level logic for the dashboard.
- `apps/strapi/src/api/`: API services and controllers for backend logic.

**Testing:**
- `apps/dashboard/tests/utils/`: Unit tests for dashboard utilities.
- `apps/website/tests/`: Unit and integration tests for the website.
- `apps/strapi/tests/`: Tests for backend services.

## Naming Conventions

**Files:**
- **Pattern:** `kebab-case` for components, `PascalCase` for pages and services.
- **Example:** `resume-order.vue` (component), `PaymentService.ts` (service).

**Directories:**
- **Pattern:** Singular nouns
- **Example:** `components/`, `utilities/`

## Where to Add New Code

**New Feature:**
- **Primary code:** Add related logic in the relevant app (e.g., `apps/dashboard/app/pages/feature.vue`).
- **Tests:** Place test files in the `tests/` directory of the respective app.

**New Component/Module:**
- **Implementation:** Place components in `components/` and export in the `index.ts` barrel file.

**Utilities:**
- **Shared helpers:** Place under `app/utils/` or `src/utils/` depending on the app.

## Special Directories

**`apps/strapi/src/api`:**
- **Purpose:** Stores controllers, routes, models, and services for Strapi APIs.
- **Generated:** Yes.
- **Committed:** No.

**`apps/website/app/components`:**
- **Purpose:** Vue components for the website.
- **Generated:** No.
- **Committed:** Yes.

---

*Structure analysis: 2026-03-10*
# Architecture

**Analysis Date:** 2026-03-10

## Pattern Overview

**Overall:** Monorepo with separate apps for frontend and backend.

**Key Characteristics:**
- **Modular structure:** Three core applications (`apps/website`, `apps/dashboard`, `apps/strapi`).
- **Separation of concerns:** Frontend (Nuxt.js-based) and backend (Strapi v5) are strictly divided.
- **Scalable monorepo management:** Uses Turbo for orchestrated tasks across apps.

## Layers

**Frontend Applications (`apps/website`, `apps/dashboard`):**
- **Purpose:** Provide user-facing and admin-facing interfaces.
- **Location:** `apps/website` and `apps/dashboard` directories.
- **Contains:** Nuxt 4 applications, including Vue 3 components, Pinia stores, and local utilities.
- **Depends on:** Strapi API (`apps/strapi`) through the `@nuxtjs/strapi` integration.
- **Used by:** End users (website) and administrators (dashboard).

**Backend Application (`apps/strapi`):**
- **Purpose:** Core business logic and data storage.
- **Location:** `apps/strapi` directory.
- **Contains:** Strapi content types, services, controllers, and utilities.
- **Depends on:** PostgreSQL database, external payment services.
- **Used by:** Frontend apps via API calls.

## Data Flow

**User Interaction Flow:**

1. **Frontend (Website or Dashboard):**
   - Users interact through forms, navigation, and other UI elements.
   - Example path: Navigate to `/login`, access input fields.

2. **API Calls via `@nuxtjs/strapi`:**
   - Data is fetched via `useAsyncData` and sent to Strapi endpoints.

3. **Backend Processing (Strapi):**
   - Strapi services and controllers process requests and access the database.

4. **Response:**
   - API responds with JSON data consumed by the frontend.

**State Management:**
- **Frontend:** Pinia stores for application state.
- **Strapi:** Relies on internal database models.

## Key Abstractions

**Core Content Types:**
- **Purpose:** Represent structured data models for the ads platform.
- **Examples:** `apps/strapi/src/api/ad/models/ad.settings.json`, `apps/strapi/src/api/payment/models/payment.settings.json`.
- **Pattern:** CRUD-based API extensions.

**Reusable Vue Components:**
- **Purpose:** Encapsulate UI elements.
- **Examples:** `apps/website/app/components/HeaderDefault.vue`, `apps/dashboard/app/components/AdTable.vue`.
- **Pattern:** Scoped styling with BEM convention.

## Entry Points

**Frontend Apps:**
- **Entry point:** `apps/website/nuxt.config.ts` and `apps/dashboard/nuxt.config.ts`.
- **Triggers:** Development or production modes via `yarn dev`, `yarn build`.
- **Responsibilities:** Configure Nuxt plugins and application-specific settings for rendering pages.

**Strapi:**
- **Entry point:** `apps/strapi/src/index.ts`.
- **Triggers:** Start command (`yarn start`) for backend API.
- **Responsibilities:** Bootstrap the Strapi server and load plugins.

## Error Handling

**Strategy:**
- Centralized with try/catch blocks and HTTP response handling.
- Sentry integration in all apps for global error tracking.

**Patterns:**
- **Frontend:** Errors tracked via Sentry and displayed gracefully on UI (`errors.vue`).
- **Backend:** Logs errors to console and external logging services (like Logtail).

## Cross-Cutting Concerns

**Logging:**
- **Frontend:** Sentry integration set up in `nuxt.config.ts`.
- **Backend:** Centralized logger utility (e.g., `apps/strapi/src/utils/logtail.ts`).

**Validation:**
- **Frontend:** Form validation using `vee-validate`.
- **Backend:** Controller-level validation via middleware.

**Authentication:**
- **Frontend:** JWT-based authentication; login pages at `/login`.
- **Backend:** Authenticated endpoints for managing users and ads.

---

*Architecture analysis: 2026-03-10*
# Technology Stack

**Analysis Date:** 2026-03-10

## Languages

**Primary:**
- TypeScript - Used across the entire monorepo for both frontend (Nuxt) and backend (Strapi)
- JavaScript - Occasionally used with TypeScript in some libraries and configurations

**Secondary:**
- SCSS - For styling (BEM and component-specific styles)

## Runtime

**Environment:**
- Node.js v20 (minimum version, as required by package.json)

**Package Manager:**
- Yarn v1.22.22
- Lockfile: present (`yarn.lock` in root)

## Frameworks

**Core:**
- Nuxt.js v4.1.3 - Utilized for both user (`apps/website`) and admin dashboard interfaces (`apps/dashboard`)
- Strapi v5.36.1 - Serves as the CMS and backend API in `apps/strapi`

**Testing:**
- Vitest v3.0.9  - Used in the Nuxt applications for testing
- Jest v29.7.0 - Used in `apps/strapi` for backend testing

**Build/Dev:**
- Vite v6.2.5 - Development and bundling tool for Nuxt
- Turbo v2.7.3 - Orchestrates builds for the monorepo

## Key Dependencies

**Critical:**
- `@nuxtjs/strapi` v2.1.1 - Nuxt-strapi integration (used for API connectivity)
- `@sentry/nuxt` v9.17.0 - Sentry integration for error tracking in Nuxt apps
- `@strapi/provider-upload-cloudinary` v5.20.0 - Provides Cloudinary-based media uploads
- `transbank-sdk` v5.0.0 - Payment gateway SDK for RedCompra/Webpay
- `googleapis` v148.0.0 - Interaction with Google APIs (e.g., spreadsheets)

**Infrastructure:**
- `nuxt-security` v2.4.0 - Enforces headers and security policies for Nuxt applications
- `pinia` v2.2.2 - State management for both frontend apps
- `mysql2` v3.12.0 and `pg` v8.16.3 - SQL database connectors for Strapi

## Configuration

**Environment:**
- Environment variables configured using `.env` files
- Each app dynamically adjusts configurations such as API endpoints (`process.env.API_URL`), Google integrations, and security policies

**Build:**
- `tsconfig.json` present in each app for TypeScript configurations
- Modular Nuxt configurations: Nuxt 4 configuration files (`nuxt.config.ts`) specific for `apps/website` and `apps/dashboard`

## Platform Requirements

**Development:**
- Node.js compatible runtime, recommended v20+
- Yarn package manager

**Production:**
- Hosting across services capable of supporting Nuxt SSR (e.g., PM2 configured with ecosystem.config for node clusters)
- Backend infrastructure runs Strapi on Node.js with database connectors to MySQL or PostgreSQL

---

*Stack analysis: 2026-03-10*
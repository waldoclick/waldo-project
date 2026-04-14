# API Permissions

Role definitions:

- **Public** — unauthenticated request
- **Authenticated** — any user with a valid JWT
- **Manager** — authenticated user with role `manager` (enforced via `global::isManager` policy)

Legend: ✅ allowed · ❌ denied

---

| Method | Endpoint | Public | Authenticated | Manager | Notes |
| ------ | -------- | ------ | ------------- | ------- | ----- |
| **Ads** `/api/ads` | | | | | |
| GET | `/ads/slug/:slug` | ✅ | ✅ | ✅ | `auth: false` — public listing |
| GET | `/ads/catalog` | ❌ | ✅ | ✅ | |
| GET | `/ads/count` | ❌ | ✅ | ✅ | |
| GET | `/ads/actives` | ❌ | ✅ | ✅ | Owner sees own; manager sees all |
| GET | `/ads/pendings` | ❌ | ✅ | ✅ | Owner sees own; manager sees all |
| GET | `/ads/archiveds` | ❌ | ✅ | ✅ | Owner sees own; manager sees all |
| GET | `/ads/banneds` | ❌ | ✅ | ✅ | Owner sees own; manager sees all |
| GET | `/ads/rejecteds` | ❌ | ✅ | ✅ | Owner sees own; manager sees all |
| GET | `/ads/drafts` | ❌ | ✅ | ✅ | Owner sees own; manager sees all |
| GET | `/ads/thankyou/:documentId` | ❌ | ✅ | ✅ | Post-payment confirmation |
| POST | `/ads/save-draft` | ❌ | ✅ | ✅ | |
| POST | `/ads/upload` | ❌ | ✅ | ✅ | |
| DELETE | `/ads/upload/:id` | ❌ | ✅ | ✅ | Owner or manager |
| DELETE | `/ads/:id` | ❌ | ✅ | ✅ | Owner or manager |
| PUT | `/ads/:id/deactivate` | ❌ | ✅ | ✅ | Owner only |
| PUT | `/ads/:id/approve` | ❌ | ❌ | ✅ | `global::isManager` |
| PUT | `/ads/:id/reject` | ❌ | ❌ | ✅ | `global::isManager` |
| PUT | `/ads/:id/banned` | ❌ | ❌ | ✅ | `global::isManager` |
| **Orders** `/api/orders` | | | | | |
| GET | `/orders/me` | ❌ | ✅ | ✅ | Own orders only |
| GET | `/orders/export-csv` | ❌ | ❌ | ✅ | Reporting |
| GET | `/orders/sales-by-month` | ❌ | ❌ | ✅ | Reporting |
| GET | `/orders` | ❌ | ❌ | ✅ | |
| GET | `/orders/:id` | ❌ | ❌ | ✅ | |
| POST | `/orders` | ❌ | ❌ | ✅ | |
| PUT | `/orders/:id` | ❌ | ❌ | ✅ | |
| DELETE | `/orders/:id` | ❌ | ❌ | ✅ | |
| **Users** `/api/users` | | | | | |
| GET | `/users` | ❌ | ✅ | ✅ | Server-side role filter applied |
| GET | `/users/me` | ❌ | ✅ | ✅ | Strapi built-in |
| GET | `/users/authenticated` | ❌ | ✅ | ✅ | Minimal fields only |
| GET | `/users/:id` | ❌ | ✅ | ✅ | Full user data with relations |
| PUT | `/users/:id` | ❌ | ✅ | ✅ | Own profile; Strapi built-in |
| PUT | `/users/me/username` | ❌ | ✅ | ✅ | 90-day cooldown enforced |
| PUT | `/users/me/avatar` | ❌ | ✅ | ✅ | |
| PUT | `/users/me/cover` | ❌ | ✅ | ✅ | |
| **Auth** `/api/auth` | | | | | |
| POST | `/auth/local` | ✅ | ✅ | ✅ | Step 1: returns `pendingToken` |
| POST | `/auth/verify-code` | ✅ | ✅ | ✅ | `auth: false` — Step 2: exchanges code for JWT |
| POST | `/auth/resend-code` | ✅ | ✅ | ✅ | `auth: false` |
| POST | `/auth/local/register` | ✅ | ✅ | ✅ | Strapi built-in |
| POST | `/auth/forgot-password` | ✅ | ✅ | ✅ | Strapi built-in; custom MJML email |
| POST | `/auth/reset-password` | ✅ | ✅ | ✅ | Strapi built-in; receives token + new password |
| GET | `/auth/email-confirmation` | ✅ | ✅ | ✅ | Strapi built-in; token in query param |
| POST | `/auth/send-email-confirmation` | ✅ | ✅ | ✅ | Strapi built-in; custom MJML email |
| GET | `/auth/:provider/callback` | ✅ | ✅ | ✅ | OAuth callback (Google etc.) |
| POST | `/auth/google-one-tap` | ✅ | ✅ | ✅ | `auth: false` — Google One Tap credential exchange |
| **Payments** `/api/payments` | | | | | |
| POST | `/payments/free-ad` | ❌ | ✅ | ✅ | |
| POST | `/payments/checkout` | ❌ | ✅ | ✅ | Unified checkout |
| POST | `/payments/pro` | ❌ | ✅ | ✅ | PRO subscription |
| POST | `/payments/pro-cancel` | ❌ | ✅ | ✅ | |
| GET | `/payments/webpay` | ✅ | ✅ | ✅ | Transbank redirect — no auth header |
| GET | `/payments/pro-response` | ✅ | ✅ | ✅ | Transbank redirect — no auth header |
| GET | `/payments/thankyou/:documentId` | ❌ | ✅ | ✅ | |
| **Upload** `/api/upload` | | | | | |
| POST | `/upload` | ❌ | ✅ | ✅ | Strapi built-in media upload |
| GET | `/upload/files` | ❌ | ❌ | ✅ | List all uploaded files |
| GET | `/upload/files/:id` | ❌ | ❌ | ✅ | |
| DELETE | `/upload/files/:id` | ❌ | ❌ | ✅ | |
| **Ad Reservations** `/api/ad-reservations` | | | | | |
| GET | `/ad-reservations` | ❌ | ❌ | ✅ | |
| GET | `/ad-reservations/:id` | ❌ | ❌ | ✅ | |
| POST | `/ad-reservations` | ❌ | ❌ | ✅ | |
| PUT | `/ad-reservations/:id` | ❌ | ❌ | ✅ | |
| DELETE | `/ad-reservations/:id` | ❌ | ❌ | ✅ | |
| POST | `/ad-reservations/gift` | ❌ | ❌ | ✅ | `global::isManager` |
| **Ad Featured Reservations** `/api/ad-featured-reservations` | | | | | |
| GET | `/ad-featured-reservations` | ❌ | ❌ | ✅ | |
| GET | `/ad-featured-reservations/:id` | ❌ | ❌ | ✅ | |
| POST | `/ad-featured-reservations` | ❌ | ❌ | ✅ | |
| PUT | `/ad-featured-reservations/:id` | ❌ | ❌ | ✅ | |
| DELETE | `/ad-featured-reservations/:id` | ❌ | ❌ | ✅ | |
| POST | `/ad-featured-reservations/gift` | ❌ | ❌ | ✅ | `global::isManager` |
| **Subscriptions** | | | | | |
| GET | `/subscription-pros` | ❌ | ❌ | ✅ | |
| GET | `/subscription-pros/:id` | ❌ | ❌ | ✅ | |
| POST | `/subscription-pros` | ❌ | ❌ | ✅ | |
| PUT | `/subscription-pros/:id` | ❌ | ❌ | ✅ | |
| DELETE | `/subscription-pros/:id` | ❌ | ❌ | ✅ | |
| GET | `/subscription-payments` | ❌ | ❌ | ✅ | |
| GET | `/subscription-payments/:id` | ❌ | ❌ | ✅ | |
| POST | `/subscription-payments` | ❌ | ❌ | ✅ | |
| PUT | `/subscription-payments/:id` | ❌ | ❌ | ✅ | |
| DELETE | `/subscription-payments/:id` | ❌ | ❌ | ✅ | |
| **Indicators** `/api/indicators` | | | | | |
| GET | `/indicators` | ✅ | ✅ | ✅ | `auth: false` |
| GET | `/indicators/convert` | ✅ | ✅ | ✅ | `auth: false` |
| GET | `/indicators/:id` | ✅ | ✅ | ✅ | `auth: false` |
| GET | `/indicators/dashboard-stats` | ❌ | ✅ | ✅ | |
| **Categories** `/api/categories` | | | | | |
| GET | `/categories` | ✅ | ✅ | ✅ | |
| GET | `/categories/ad-counts` | ✅ | ✅ | ✅ | |
| GET | `/categories/:id` | ✅ | ✅ | ✅ | |
| POST | `/categories` | ❌ | ❌ | ✅ | |
| PUT | `/categories/:id` | ❌ | ❌ | ✅ | |
| DELETE | `/categories/:id` | ❌ | ❌ | ✅ | |
| **Regions** `/api/regions` | | | | | |
| GET | `/regions` | ✅ | ✅ | ✅ | |
| GET | `/regions/:id` | ✅ | ✅ | ✅ | |
| POST | `/regions` | ❌ | ❌ | ✅ | |
| PUT | `/regions/:id` | ❌ | ❌ | ✅ | |
| DELETE | `/regions/:id` | ❌ | ❌ | ✅ | |
| **Communes** `/api/communes` | | | | | |
| GET | `/communes` | ✅ | ✅ | ✅ | |
| GET | `/communes/:id` | ✅ | ✅ | ✅ | |
| POST | `/communes` | ❌ | ❌ | ✅ | |
| PUT | `/communes/:id` | ❌ | ❌ | ✅ | |
| DELETE | `/communes/:id` | ❌ | ❌ | ✅ | |
| **Filter** `/api/filter` | | | | | |
| GET | `/filter/communes` | ✅ | ✅ | ✅ | |
| GET | `/filter/categories` | ✅ | ✅ | ✅ | |
| **Ad Packs** `/api/ad-packs` | | | | | |
| GET | `/ad-packs` | ✅ | ✅ | ✅ | |
| GET | `/ad-packs/:id` | ✅ | ✅ | ✅ | |
| POST | `/ad-packs` | ❌ | ❌ | ✅ | |
| PUT | `/ad-packs/:id` | ❌ | ❌ | ✅ | |
| DELETE | `/ad-packs/:id` | ❌ | ❌ | ✅ | |
| **Related Ads** `/api/related` | | | | | |
| GET | `/related/ads` | ✅ | ✅ | ✅ | |
| GET | `/related/ads/:id` | ✅ | ✅ | ✅ | |
| **Search** `/api/search` | | | | | |
| POST | `/search/tavily` | ❌ | ❌ | ✅ | Calls Tavily API |
| **Google Analytics** `/api/google-analytics` | | | | | |
| GET | `/google-analytics/summary` | ❌ | ❌ | ✅ | `global::isManager` |
| GET | `/google-analytics/stats` | ❌ | ❌ | ✅ | `global::isManager` |
| GET | `/google-analytics/pages` | ❌ | ❌ | ✅ | `global::isManager` |
| **Search Console** `/api/search-console` | | | | | |
| GET | `/search-console/performance` | ❌ | ❌ | ✅ | `global::isManager` |
| GET | `/search-console/queries` | ❌ | ❌ | ✅ | `global::isManager` |
| GET | `/search-console/pages` | ❌ | ❌ | ✅ | `global::isManager` |
| **Cloudflare** `/api/cloudflare` | | | | | |
| GET | `/cloudflare/traffic` | ❌ | ❌ | ✅ | `global::isManager` |
| GET | `/cloudflare/requests` | ❌ | ❌ | ✅ | `global::isManager` |
| GET | `/cloudflare/threats` | ❌ | ❌ | ✅ | `global::isManager` |
| **Better Stack** `/api/better-stack` | | | | | |
| GET | `/better-stack/monitors` | ❌ | ❌ | ✅ | `global::isManager` |
| GET | `/better-stack/incidents` | ❌ | ❌ | ✅ | `global::isManager` |
| **IA** `/api/ia` | | | | | |
| POST | `/ia/gemini` | ❌ | ❌ | ✅ | `global::isManager` |
| POST | `/ia/groq` | ❌ | ❌ | ✅ | `global::isManager` |
| POST | `/ia/deepseek` | ❌ | ❌ | ✅ | `global::isManager` |
| POST | `/ia/claude` | ❌ | ❌ | ✅ | `global::isManager` |
| **Cron Runner** `/api/cron-runner` | | | | | |
| POST | `/cron-runner/:name` | ❌ | ❌ | ✅ | `global::isManager` |

---

## Content

These resources use `createCoreRouter` — CRUD permissions are configured in Strapi admin panel. GET endpoints are typically set to Public.

| Resource | Endpoint | Notes |
| -------- | -------- | ----- |
| Articles | `/articles` | GETs public |
| FAQs | `/faqs` | GETs public |
| Conditions | `/conditions` | GETs public |
| Terms | `/terms` | GETs public |
| Policies | `/policies` | GETs public |
| Contact | `/contacts` | POST public |
| Remaining | `/remainings` | Internal |
| Verification Codes | `/verification-codes` | Internal |

---

## Notes

- `auth: false` — bypasses JWT validation entirely. Used for payment gateway callbacks and auth flow steps that precede JWT issuance.
- `global::isManager` — evaluated before the controller runs. Returns 403 immediately if role is not `manager`.
- Routes without an explicit policy or `auth: false` are authenticated by default (Strapi rejects requests without a valid JWT).
- `orders/export-csv` and `orders/sales-by-month` must be set to Manager in Strapi admin panel — they have no hardcoded policy.

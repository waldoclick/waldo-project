# API Permissions

Role definitions:

- **Public** — unauthenticated request
- **Authenticated** — any user with a valid JWT
- **Manager** — authenticated user with role `manager` (enforced via `global::isManager` policy)

Legend: ✅ allowed · ❌ denied

Permissions are sourced from the `up_permissions` table in the local database and verified against route definitions.

---

| Method | Endpoint | Public | Authenticated | Manager | Notes |
| ------ | -------- | ------ | ------------- | ------- | ----- |
| **Ads** `/api/ads` | | | | | |
| GET | `/ads` | ❌ | ❌ | ✅ | Core find — use `/catalog` or `/slug/:slug` instead |
| GET | `/ads/:id` | ❌ | ❌ | ✅ | Core findOne — use `/slug/:slug` instead |
| POST | `/ads` | ❌ | ❌ | ✅ | Core create — managers only |
| PUT | `/ads/:id` | ❌ | ✅ | ✅ | Core update — own ad |
| DELETE | `/ads/:id` | ❌ | ❌ | ✅ | |
| GET | `/ads/slug/:slug` | ✅ | ✅ | ✅ | `auth: false` |
| GET | `/ads/catalog` | ✅ | ✅ | ✅ | Public catalog — no JWT required |
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
| DELETE | `/ads/upload/:id` | ❌ | ✅ | ✅ | Removes an image from an ad — owner or manager |
| PUT | `/ads/:id/deactivate` | ❌ | ✅ | ✅ | Owner only (enforced in controller) |
| PUT | `/ads/:id/approve` | ❌ | ❌ | ✅ | `global::isManager` |
| PUT | `/ads/:id/reject` | ❌ | ❌ | ✅ | `global::isManager` |
| PUT | `/ads/:id/banned` | ❌ | ❌ | ✅ | `global::isManager` |
| **Orders** `/api/orders` | | | | | |
| GET | `/orders/me` | ❌ | ✅ | ✅ | Own orders only |
| GET | `/orders/export-csv` | ❌ | ❌ | ❌ | ⚠ Route exists but missing from panel — needs Manager permission |
| GET | `/orders/sales-by-month` | ❌ | ❌ | ✅ | |
| GET | `/orders` | ⚠ | ✅ | ✅ | ⚠ Public has panel access — should be removed |
| GET | `/orders/:id` | ⚠ | ✅ | ✅ | ⚠ Public has panel access — should be removed |
| POST | `/orders` | ❌ | ❌ | ✅ | |
| PUT | `/orders/:id` | ❌ | ❌ | ✅ | |
| **Auth** `/api/auth` | | | | | |
| GET | `/connect/(.*)` | ✅ | ✅ | ✅ | OAuth provider initiation |
| GET | `/auth/:provider/callback` | ✅ | ✅ | ✅ | OAuth callback |
| POST | `/auth/local` | ✅ | ✅ | ✅ | Step 1: returns `pendingToken` |
| POST | `/auth/verify-code` | ✅ | ✅ | ✅ | `auth: false` — Step 2: exchanges code for JWT |
| POST | `/auth/resend-code` | ✅ | ✅ | ✅ | `auth: false` |
| POST | `/auth/refresh` | ✅ | ✅ | ✅ | |
| POST | `/auth/logout` | ❌ | ✅ | ✅ | |
| POST | `/auth/local/register` | ✅ | ✅ | ✅ | Custom MJML email |
| POST | `/auth/forgot-password` | ✅ | ✅ | ✅ | Custom MJML email |
| POST | `/auth/reset-password` | ✅ | ✅ | ✅ | Receives token + new password |
| POST | `/auth/change-password` | ❌ | ✅ | ✅ | Requires JWT; for logged-in users |
| GET | `/auth/email-confirmation` | ✅ | ✅ | ✅ | Token in query param |
| POST | `/auth/send-email-confirmation` | ✅ | ✅ | ✅ | Custom MJML email |
| POST | `/auth/google-one-tap` | ✅ | ✅ | ✅ | `auth: false` |
| **Users** `/api/users` | | | | | |
| GET | `/users` | ✅ | ✅ | ✅ | Server-side role filter applied |
| GET | `/users/me` | ❌ | ✅ | ✅ | |
| GET | `/users/authenticated` | ❌ | ✅ | ✅ | Minimal fields only |
| GET | `/users/:id` | ✅ | ✅ | ✅ | Full user data with relations |
| PUT | `/users/:id` | ❌ | ✅ | ✅ | Own profile |
| PUT | `/users/me/username` | ❌ | ✅ | ✅ | 90-day cooldown enforced |
| PUT | `/users/me/avatar` | ❌ | ✅ | ✅ | |
| PUT | `/users/me/cover` | ❌ | ✅ | ✅ | |
| **Payments** `/api/payments` | | | | | |
| POST | `/payments/free-ad` | ❌ | ✅ | ✅ | |
| POST | `/payments/checkout` | ❌ | ✅ | ✅ | Unified checkout |
| POST | `/payments/pro` | ❌ | ✅ | ✅ | PRO subscription |
| POST | `/payments/pro-cancel` | ❌ | ✅ | ✅ | |
| GET | `/payments/webpay` | ✅ | ✅ | ✅ | Transbank redirect — no auth header |
| GET | `/payments/pro-response` | ✅ | ✅ | ✅ | Transbank redirect — no auth header |
| GET | `/payments/thankyou/:documentId` | ❌ | ✅ | ✅ | |
| **Upload** `/api/upload` | | | | | |
| POST | `/upload` | ❌ | ❌ | ✅ | Direct file upload — use `/ads/upload` for ad images |
| GET | `/upload/files` | ✅ | ✅ | ✅ | |
| GET | `/upload/files/:id` | ✅ | ✅ | ✅ | |
| DELETE | `/upload/files/:id` | ❌ | ❌ | ✅ | |
| **Ad Reservations** `/api/ad-reservations` | | | | | |
| GET | `/ad-reservations` | ❌ | ✅ | ✅ | |
| GET | `/ad-reservations/:id` | ❌ | ✅ | ✅ | |
| POST | `/ad-reservations/gift` | ❌ | ❌ | ✅ | `global::isManager` |
| **Ad Featured Reservations** `/api/ad-featured-reservations` | | | | | |
| GET | `/ad-featured-reservations` | ❌ | ✅ | ✅ | |
| GET | `/ad-featured-reservations/:id` | ❌ | ✅ | ✅ | |
| POST | `/ad-featured-reservations/gift` | ❌ | ❌ | ✅ | `global::isManager` |
| **Indicators** `/api/indicators` | | | | | |
| GET | `/indicators` | ✅ | ✅ | ✅ | |
| GET | `/indicators/convert` | ✅ | ✅ | ✅ | |
| GET | `/indicators/:id` | ✅ | ✅ | ✅ | |
| GET | `/indicators/dashboard-stats` | ❌ | ❌ | ✅ | |
| **Categories** `/api/categories` | | | | | |
| GET | `/categories` | ✅ | ✅ | ✅ | |
| GET | `/categories/ad-counts` | ❌ | ❌ | ✅ | |
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
| **Related Ads** `/api/related` | | | | | |
| GET | `/related/ads` | ✅ | ✅ | ✅ | |
| GET | `/related/ads/:id` | ✅ | ✅ | ✅ | |
| **Search** `/api/search` | | | | | |
| POST | `/search/tavily` | ❌ | ❌ | ✅ | |
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
| POST | `/ia/groq` | ❌ | ❌ | ✅ | `global::isManager` — ⚠ Public has panel entry, blocked by policy |
| POST | `/ia/deepseek` | ❌ | ❌ | ✅ | `global::isManager` |
| POST | `/ia/claude` | ❌ | ❌ | ✅ | `global::isManager` |
| **Cron Runner** `/api/cron-runner` | | | | | |
| POST | `/cron-runner/:name` | ❌ | ❌ | ✅ | `global::isManager` |
| **Articles** `/api/articles` | | | | | |
| GET | `/articles` | ✅ | ❌ | ✅ | ⚠ Authenticated has no panel access — likely a gap |
| GET | `/articles/:id` | ✅ | ❌ | ✅ | ⚠ Same |
| **FAQs** `/api/faqs` | | | | | |
| GET | `/faqs` | ✅ | ✅ | ✅ | |
| GET | `/faqs/:id` | ✅ | ✅ | ✅ | |
| POST | `/faqs` | ❌ | ❌ | ✅ | |
| PUT | `/faqs/:id` | ❌ | ❌ | ✅ | |
| **Conditions** `/api/conditions` | | | | | |
| GET | `/conditions` | ✅ | ✅ | ✅ | |
| GET | `/conditions/:id` | ✅ | ✅ | ✅ | |
| POST | `/conditions` | ❌ | ❌ | ✅ | |
| PUT | `/conditions/:id` | ❌ | ❌ | ✅ | |
| DELETE | `/conditions/:id` | ❌ | ❌ | ✅ | |
| **Terms** `/api/terms` | | | | | |
| GET | `/terms` | ✅ | ✅ | ✅ | |
| GET | `/terms/:id` | ✅ | ✅ | ✅ | |
| POST | `/terms` | ❌ | ❌ | ✅ | |
| PUT | `/terms/:id` | ❌ | ❌ | ✅ | |
| **Policies** `/api/policies` | | | | | |
| GET | `/policies` | ✅ | ✅ | ✅ | |
| GET | `/policies/:id` | ✅ | ✅ | ✅ | |
| POST | `/policies` | ❌ | ❌ | ✅ | |
| PUT | `/policies/:id` | ❌ | ❌ | ✅ | |
| **Contact** `/api/contacts` | | | | | |
| POST | `/contacts` | ✅ | ✅ | ✅ | |
| GET | `/contacts` | ❌ | ❌ | ✅ | |
| GET | `/contacts/:id` | ❌ | ❌ | ✅ | |
| PUT | `/contacts/:id` | ❌ | ❌ | ✅ | |
| DELETE | `/contacts/:id` | ❌ | ❌ | ✅ | |
| **Remaining** `/api/remainings` | | | | | |
| GET | `/remainings` | ✅ | ✅ | ✅ | |
| GET | `/remainings/:id` | ✅ | ✅ | ✅ | |
| POST | `/remainings` | ❌ | ❌ | ✅ | |
| PUT | `/remainings/:id` | ❌ | ❌ | ✅ | |
| DELETE | `/remainings/:id` | ❌ | ❌ | ✅ | |
| **Subscriptions** | | | | | |
| ALL | `/subscription-pros` | ❌ | ❌ | ❌ | ⚠ No panel permissions configured |
| ALL | `/subscription-payments` | ❌ | ❌ | ❌ | ⚠ No panel permissions configured |

---

## Known Issues

These panel permissions are wrong and should be corrected in Strapi admin → Settings → Roles & Permissions:

| Issue | Impact |
| ----- | ------ |
| `Public` has `order.find` and `order.findOne` | Order data visible to unauthenticated users — security risk |
| `Public` has `ia.groq` panel entry | Harmless (blocked by `global::isManager` policy) but inconsistent — should be removed |
| `Manager` missing `order.exportCsv` | `GET /orders/export-csv` returns 403 for everyone — route is unreachable |
| `Authenticated` missing `article.find` / `article.findOne` | Logged-in users can't read articles; Public can — likely a gap |
| `subscription-pros` and `subscription-payments` have no permissions | These collections are completely inaccessible via API |

---

## Notes

- `auth: false` — bypasses JWT validation entirely. Used for Transbank callbacks and auth steps before JWT issuance.
- `global::isManager` — evaluated before the controller runs. Returns 403 if role is not `manager`, regardless of panel settings.
- Routes without explicit policy or `auth: false` require a valid JWT by default (Strapi rejects without one).
- No Public or Authenticated role has DELETE access to any resource (by design).

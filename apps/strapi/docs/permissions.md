# API Permissions

Role definitions:

- **Public** — unauthenticated request
- **Authenticated** — any user with a valid JWT
- **Manager** — authenticated user with role `manager` (enforced via `global::isManager` policy)
- **Panel** — access configured in Strapi admin → Settings → Roles & Permissions

Legend: ✅ allowed · ❌ denied · ⚙️ panel-controlled

---

## Ads `/api/ads`

| Method | Endpoint                    | Public | Authenticated | Manager | Notes                              |
| ------ | --------------------------- | ------ | ------------- | ------- | ---------------------------------- |
| GET    | `/ads/slug/:slug`           | ✅     | ✅            | ✅      | Public listing                     |
| GET    | `/ads/catalog`              | ❌     | ✅            | ✅      |                                    |
| GET    | `/ads/count`                | ❌     | ✅            | ✅      |                                    |
| GET    | `/ads/actives`              | ❌     | ✅            | ✅      | Owner sees own; manager sees all   |
| GET    | `/ads/pendings`             | ❌     | ✅            | ✅      | Owner sees own; manager sees all   |
| GET    | `/ads/archiveds`            | ❌     | ✅            | ✅      | Owner sees own; manager sees all   |
| GET    | `/ads/banneds`              | ❌     | ✅            | ✅      | Owner sees own; manager sees all   |
| GET    | `/ads/rejecteds`            | ❌     | ✅            | ✅      | Owner sees own; manager sees all   |
| GET    | `/ads/drafts`               | ❌     | ✅            | ✅      | Owner sees own; manager sees all   |
| GET    | `/ads/thankyou/:documentId` | ❌     | ✅            | ✅      | Post-payment confirmation          |
| POST   | `/ads/save-draft`           | ❌     | ✅            | ✅      |                                    |
| POST   | `/ads/upload`               | ❌     | ✅            | ✅      |                                    |
| DELETE | `/ads/upload/:id`           | ❌     | ✅            | ✅      | Owner or manager                   |
| DELETE | `/ads/:id`                  | ❌     | ✅            | ✅      | Owner or manager                   |
| PUT    | `/ads/:id/deactivate`       | ❌     | ✅            | ✅      | Owner or manager                   |
| PUT    | `/ads/:id/approve`          | ❌     | ❌            | ✅      | Manager only (`global::isManager`) |
| PUT    | `/ads/:id/reject`           | ❌     | ❌            | ✅      | Manager only (`global::isManager`) |
| PUT    | `/ads/:id/banned`           | ❌     | ❌            | ✅      | Manager only (`global::isManager`) |

---

## Orders `/api/orders`

| Method | Endpoint                 | Public | Authenticated | Manager | Notes                        |
| ------ | ------------------------ | ------ | ------------- | ------- | ---------------------------- |
| GET    | `/orders/me`             | ❌     | ✅            | ✅      | Own orders only              |
| GET    | `/orders/export-csv`     | ❌     | ⚙️            | ✅      | Reporting; should be manager |
| GET    | `/orders/sales-by-month` | ❌     | ⚙️            | ✅      | Reporting; should be manager |
| GET    | `/orders`                | ❌     | ⚙️            | ⚙️      | Panel-controlled             |
| GET    | `/orders/:id`            | ❌     | ⚙️            | ⚙️      | Panel-controlled             |
| POST   | `/orders`                | ❌     | ⚙️            | ⚙️      | Panel-controlled             |
| PUT    | `/orders/:id`            | ❌     | ⚙️            | ⚙️      | Panel-controlled             |
| DELETE | `/orders/:id`            | ❌     | ⚙️            | ⚙️      | Panel-controlled             |

---

## Users `/api/users`

| Method | Endpoint               | Public | Authenticated | Manager | Notes                                           |
| ------ | ---------------------- | ------ | ------------- | ------- | ----------------------------------------------- |
| GET    | `/users`               | ❌     | ✅            | ✅      | Returns filtered list (server-side role filter) |
| GET    | `/users/me`            | ❌     | ✅            | ✅      | Strapi built-in                                 |
| GET    | `/users/authenticated` | ❌     | ✅            | ✅      | Minimal fields, Authenticated role only         |
| GET    | `/users/:id`           | ❌     | ✅            | ✅      | Custom: full user data with relations           |
| PUT    | `/users/:id`           | ❌     | ✅            | ✅      | Own profile; Strapi built-in                    |
| PUT    | `/users/me/username`   | ❌     | ✅            | ✅      | 90-day cooldown enforced                        |
| PUT    | `/users/me/avatar`     | ❌     | ✅            | ✅      |                                                 |
| PUT    | `/users/me/cover`      | ❌     | ✅            | ✅      |                                                 |

---

## Auth `/api/auth`

| Method | Endpoint                        | Public | Authenticated | Manager | Notes                              |
| ------ | ------------------------------- | ------ | ------------- | ------- | ---------------------------------- |
| POST   | `/auth/local`                   | ✅     | ✅            | ✅      | Step 1: returns `pendingToken`     |
| POST   | `/auth/verify-code`             | ✅     | ✅            | ✅      | Step 2: exchanges code for JWT     |
| POST   | `/auth/resend-code`             | ✅     | ✅            | ✅      |                                    |
| POST   | `/auth/local/register`          | ✅     | ✅            | ✅      | Strapi built-in                    |
| POST   | `/auth/forgot-password`         | ✅     | ✅            | ✅      | Strapi built-in; custom MJML email |
| POST   | `/auth/send-email-confirmation` | ✅     | ✅            | ✅      | Strapi built-in; custom MJML email |
| GET    | `/auth/:provider/callback`      | ✅     | ✅            | ✅      | OAuth callback (Google etc.)       |
| POST   | `/auth/google-one-tap`          | ✅     | ✅            | ✅      | Google One Tap credential exchange |

---

## Payments `/api/payments`

| Method | Endpoint                         | Public | Authenticated | Manager | Notes                               |
| ------ | -------------------------------- | ------ | ------------- | ------- | ----------------------------------- |
| POST   | `/payments/free-ad`              | ❌     | ✅            | ✅      |                                     |
| POST   | `/payments/checkout`             | ❌     | ✅            | ✅      | Unified checkout                    |
| POST   | `/payments/pro`                  | ❌     | ✅            | ✅      | Pro subscription                    |
| POST   | `/payments/pro-cancel`           | ❌     | ✅            | ✅      |                                     |
| GET    | `/payments/webpay`               | ✅     | ✅            | ✅      | Transbank redirect — no auth header |
| GET    | `/payments/pro-response`         | ✅     | ✅            | ✅      | Transbank redirect — no auth header |
| GET    | `/payments/thankyou/:documentId` | ❌     | ✅            | ✅      |                                     |

---

## Ad Reservations `/api/ad-reservations`

| Method | Endpoint                | Public | Authenticated | Manager | Notes                              |
| ------ | ----------------------- | ------ | ------------- | ------- | ---------------------------------- |
| GET    | `/ad-reservations`      | ❌     | ⚙️            | ⚙️      | Panel-controlled                   |
| GET    | `/ad-reservations/:id`  | ❌     | ⚙️            | ⚙️      | Panel-controlled                   |
| POST   | `/ad-reservations`      | ❌     | ⚙️            | ⚙️      | Panel-controlled                   |
| PUT    | `/ad-reservations/:id`  | ❌     | ⚙️            | ⚙️      | Panel-controlled                   |
| DELETE | `/ad-reservations/:id`  | ❌     | ⚙️            | ⚙️      | Panel-controlled                   |
| POST   | `/ad-reservations/gift` | ❌     | ❌            | ✅      | Manager only (`global::isManager`) |

---

## Ad Featured Reservations `/api/ad-featured-reservations`

| Method | Endpoint                         | Public | Authenticated | Manager | Notes                              |
| ------ | -------------------------------- | ------ | ------------- | ------- | ---------------------------------- |
| GET    | `/ad-featured-reservations`      | ❌     | ⚙️            | ⚙️      | Panel-controlled                   |
| GET    | `/ad-featured-reservations/:id`  | ❌     | ⚙️            | ⚙️      | Panel-controlled                   |
| POST   | `/ad-featured-reservations`      | ❌     | ⚙️            | ⚙️      | Panel-controlled                   |
| PUT    | `/ad-featured-reservations/:id`  | ❌     | ⚙️            | ⚙️      | Panel-controlled                   |
| DELETE | `/ad-featured-reservations/:id`  | ❌     | ⚙️            | ⚙️      | Panel-controlled                   |
| POST   | `/ad-featured-reservations/gift` | ❌     | ❌            | ✅      | Manager only (`global::isManager`) |

---

## IA `/api/ia`

| Method | Endpoint       | Public | Authenticated | Manager | Notes                              |
| ------ | -------------- | ------ | ------------- | ------- | ---------------------------------- |
| POST   | `/ia/gemini`   | ❌     | ❌            | ✅      | Manager only (`global::isManager`) |
| POST   | `/ia/groq`     | ❌     | ❌            | ✅      | Manager only (`global::isManager`) |
| POST   | `/ia/deepseek` | ❌     | ❌            | ✅      | Manager only (`global::isManager`) |
| POST   | `/ia/claude`   | ❌     | ❌            | ✅      | Manager only (`global::isManager`) |

---

## Cron Runner `/api/cron-runner`

| Method | Endpoint             | Public | Authenticated | Manager | Notes                              |
| ------ | -------------------- | ------ | ------------- | ------- | ---------------------------------- |
| POST   | `/cron-runner/:name` | ❌     | ❌            | ✅      | Manager only (`global::isManager`) |

---

## Indicators `/api/indicators`

| Method | Endpoint                      | Public | Authenticated | Manager | Notes            |
| ------ | ----------------------------- | ------ | ------------- | ------- | ---------------- |
| GET    | `/indicators`                 | ✅     | ✅            | ✅      | `auth: false`    |
| GET    | `/indicators/convert`         | ✅     | ✅            | ✅      | `auth: false`    |
| GET    | `/indicators/:id`             | ✅     | ✅            | ✅      | `auth: false`    |
| GET    | `/indicators/dashboard-stats` | ❌     | ✅            | ✅      | Panel-controlled |

---

## Categories `/api/categories`

| Method | Endpoint                | Public | Authenticated | Manager | Notes                               |
| ------ | ----------------------- | ------ | ------------- | ------- | ----------------------------------- |
| GET    | `/categories`           | ⚙️     | ✅            | ✅      | Panel-controlled (typically public) |
| GET    | `/categories/ad-counts` | ⚙️     | ✅            | ✅      | Panel-controlled (typically public) |
| GET    | `/categories/:id`       | ⚙️     | ✅            | ✅      | Panel-controlled (typically public) |
| POST   | `/categories`           | ❌     | ⚙️            | ⚙️      | Panel-controlled                    |
| PUT    | `/categories/:id`       | ❌     | ⚙️            | ⚙️      | Panel-controlled                    |
| DELETE | `/categories/:id`       | ❌     | ⚙️            | ⚙️      | Panel-controlled                    |

---

## Regions & Communes

| Method          | Endpoint                | Public | Authenticated | Manager | Notes                               |
| --------------- | ----------------------- | ------ | ------------- | ------- | ----------------------------------- |
| GET             | `/regions`              | ⚙️     | ✅            | ✅      | Panel-controlled (typically public) |
| GET             | `/regions/:id`          | ⚙️     | ✅            | ✅      | Panel-controlled (typically public) |
| GET             | `/communes`             | ⚙️     | ✅            | ✅      | Panel-controlled (typically public) |
| GET             | `/communes/:id`         | ⚙️     | ✅            | ✅      | Panel-controlled (typically public) |
| POST/PUT/DELETE | `/regions`, `/communes` | ❌     | ⚙️            | ⚙️      | Panel-controlled                    |

---

## Filter `/api/filter`

| Method | Endpoint             | Public | Authenticated | Manager | Notes                               |
| ------ | -------------------- | ------ | ------------- | ------- | ----------------------------------- |
| GET    | `/filter/communes`   | ⚙️     | ✅            | ✅      | Panel-controlled (typically public) |
| GET    | `/filter/categories` | ⚙️     | ✅            | ✅      | Panel-controlled (typically public) |

---

## Ad Packs `/api/ad-packs`

| Method          | Endpoint        | Public | Authenticated | Manager | Notes                               |
| --------------- | --------------- | ------ | ------------- | ------- | ----------------------------------- |
| GET             | `/ad-packs`     | ⚙️     | ✅            | ✅      | Panel-controlled (typically public) |
| GET             | `/ad-packs/:id` | ⚙️     | ✅            | ✅      | Panel-controlled (typically public) |
| POST/PUT/DELETE | `/ad-packs`     | ❌     | ⚙️            | ⚙️      | Panel-controlled                    |

---

## Related Ads `/api/related`

| Method | Endpoint           | Public | Authenticated | Manager | Notes                               |
| ------ | ------------------ | ------ | ------------- | ------- | ----------------------------------- |
| GET    | `/related/ads`     | ⚙️     | ✅            | ✅      | Panel-controlled (typically public) |
| GET    | `/related/ads/:id` | ⚙️     | ✅            | ✅      | Panel-controlled (typically public) |

---

## Search `/api/search`

| Method | Endpoint         | Public | Authenticated | Manager | Notes                              |
| ------ | ---------------- | ------ | ------------- | ------- | ---------------------------------- |
| POST   | `/search/tavily` | ❌     | ⚙️            | ⚙️      | Calls Tavily API; panel-controlled |

---

## Content (panel-controlled)

These resources use `createCoreRouter` — access is configured entirely via Strapi admin panel.

| Resource           | Endpoint              | Notes                               |
| ------------------ | --------------------- | ----------------------------------- |
| Articles           | `/articles`           | Blog content; GETs typically public |
| FAQs               | `/faqs`               | GETs typically public               |
| Conditions         | `/conditions`         | GETs typically public               |
| Terms              | `/terms`              | GETs typically public               |
| Policies           | `/policies`           | GETs typically public               |
| Contact            | `/contacts`           | POST typically public               |
| Subscriptions      | `/suscriptions`       | Panel-controlled                    |
| Remaining          | `/remainings`         | Panel-controlled                    |
| Verification Codes | `/verification-codes` | Panel-controlled; internal use only |

---

## Notes

- Routes with `auth: false` bypass JWT validation entirely — they are intentionally public (payment gateway callbacks, auth flow steps that precede JWT issuance).
- `global::isManager` is evaluated **before** the controller runs — a 403 is returned immediately if the role is not `manager`.
- For panel-controlled routes, access must be reviewed and locked down in **Strapi Admin → Settings → Users & Permissions → Roles**.
- `orders/export-csv` and `orders/sales-by-month` are reporting endpoints that should be restricted to manager in the panel.

# Data Model

All business data lives in Strapi v5. Website and dashboard are stateless HTTP clients.

---

## Entity Relationships

```
User
 ├── 1:N → Ad
 │         ├── 1:1 → AdReservation
 │         ├── 0:1 → AdFeaturedReservation
 │         └── N:1 → Category, Commune, Region
 ├── 1:N → Order
 │         ├── N:1 → Pack
 │         └── N:1 → Ad (optional)
 ├── 0:1 → SubscriptionPro  (pro_status field)
 └── 1:N → SubscriptionPayment
```

---

## Entities

| Entity | Key Fields | Relations | Source |
| --- | --- | --- | --- |
| User | `email`, `username`, `rut`, `phone`, `pro_status`, `username_updated_at` | Ad, Order, SubscriptionPro, SubscriptionPayment, Commune | `apps/strapi/src/extensions/users-permissions/` |
| Ad | `title`, `description`, `price`, `draft`, `active`, `banned`, `rejected`, `remaining_days`, `actived_at`, `rejected_at`, `banned_at` | User, AdReservation, AdFeaturedReservation, Category, Commune, Region | `apps/strapi/src/api/ad/` |
| AdReservation | `used`, `gifted` | User, Ad | `apps/strapi/src/api/ad-reservation/` |
| AdFeaturedReservation | `used`, `gifted` | User, Ad | `apps/strapi/src/api/ad-featured-reservation/` |
| Order | `amount`, `status`, `buy_order`, `token_ws`, `authorization_code`, `card_number`, `transaction_date`, `is_invoice` | User, Pack, Ad | `apps/strapi/src/api/order/` |
| Pack | `name`, `price`, `days`, `pack_type`, `ads_quantity`, `featured_quantity` | Order | `apps/strapi/src/api/ad-pack/` |
| SubscriptionPro | `status`, `card_number`, `tbk_user`, `period_end` | User | `apps/strapi/src/api/subscription-pro/` |
| SubscriptionPayment | `amount`, `period_start`, `period_end`, `status`, `authorization_code` | User, SubscriptionPro | `apps/strapi/src/api/subscription-payment/` |
| Category | `name`, `slug`, `icon`, `ad_count` | Ad | `apps/strapi/src/api/category/` |
| Commune | `name`, `slug` | Ad, User, Region | `apps/strapi/src/api/commune/` |
| Region | `name`, `slug` | Commune | `apps/strapi/src/api/region/` |
| Policy | `title`, `content`, `order` | — | `apps/strapi/src/api/policy/` |
| Faq | `question`, `answer`, `order` | — | `apps/strapi/src/api/faq/` |
| Term | `title`, `content`, `order` | — | `apps/strapi/src/api/term/` |
| Condition | `title`, `content`, `order` | — | `apps/strapi/src/api/condition/` |
| Article | `title`, `slug`, `content`, `published_at` | — | `apps/strapi/src/api/article/` |

---

## Derived and Computed Fields

**`Ad.status`** — virtual field, not stored in the database. Computed by `computeAdStatus()` in `apps/strapi/src/api/ad/services/ad.ts` on every ad response. See [docs/ad-statuses.md](./ad-statuses.md) for the full computation logic.

**`User.pro_status === "active"`** — the single source of truth for PRO membership. No separate boolean flag exists. Any component or service that needs to check PRO status must read `pro_status` from the User record.

---

## Write Operations

Prefer `documentId` over numeric `id` for all update and delete operations in Strapi v5. The numeric `id` is an internal auto-increment and may not behave consistently across content type write operations in v5. `documentId` is the stable public identifier exposed by the Strapi API.

# GA4 Analytics Events

All events are pushed to the dataLayer and collected by GTM (GTM-N4B8LDKS) → GA4 (G-NR60QSZXRL).

---

## Ecommerce Events

### `view_item_list`
Fired when a list of ads is rendered.

| Parameter | Type | Description |
|---|---|---|
| `items[].item_id` | string | Ad ID |
| `items[].item_name` | string | Ad title |
| `items[].item_category` | string | Ad category name |
| `items[].price` | number | Ad price |
| `items[].currency` | string | Currency code (default: CLP) |

**Flow:** `ad_discovery`

---

### `view_item`
Fired when a single ad detail page is loaded.

| Parameter | Type | Description |
|---|---|---|
| `items[0].item_id` | string | Ad ID |
| `items[0].item_name` | string | Ad title |
| `items[0].item_category` | string | Ad category name |
| `items[0].price` | number | Ad price |
| `items[0].currency` | string | Currency code |

**Flow:** `ad_discovery`

---

### `search`
Fired when the user performs a search.

| Parameter | Type | Description |
|---|---|---|
| `search_term` | string | The search query entered by the user |

**Flow:** `ad_discovery`

---

### `add_to_cart`
Fired when the user selects a pack or a featured upgrade during ad creation.

| Parameter | Type | Description |
|---|---|---|
| `items[0].item_id` | string | Pack ID or `"featured"` / `"not_featured"` |
| `items[0].item_name` | string | Pack name or featured label |
| `items[0].item_category` | string | `"Pack"` or `"Destacado"` |
| `items[0].price` | number | Item price |
| `items[0].currency` | string | Currency code |

**Flow:** `ad_creation`

---

### `remove_from_cart`
Fired when a previously selected pack or featured option is replaced or deselected.

Same parameters as `add_to_cart`.

**Flow:** `ad_creation`

---

### `begin_checkout`
Fired when the user proceeds to the payment step.

Contains all items currently in the cart (pack and/or featured). Same item parameters as `add_to_cart`.

**Flow:** `ad_creation`

---

### `add_payment_info`
Fired when the user reaches the payment method selection step.

Contains all items currently in the cart. Same item parameters as `add_to_cart`.

**Flow:** `ad_creation`

---

### `purchase`
Fired when a payment is confirmed and the order is completed.

| Parameter | Type | Description |
|---|---|---|
| `ecommerce.transaction_id` | string | Order numeric ID |
| `ecommerce.value` | number | Total amount paid |
| `ecommerce.currency` | string | Currency code |
| `ecommerce.items[].item_id` | string | Line item identifier |
| `ecommerce.items[].item_name` | string | Line item name |
| `ecommerce.items[].item_category` | string | `"Order"` |
| `ecommerce.items[].price` | number | Line item price |
| `ecommerce.items[].quantity` | number | Quantity |

**Flow:** `pack_purchase`

---

## Engagement Events

### `contact`
Fired when a logged-in user clicks the copy button on the seller's email or phone number in an ad detail page.

| Parameter | Type | Value |
|---|---|---|
| `method` | string | `"email"` or `"phone"` |

**Flow:** `user_engagement`

---

### `generate_lead`
Fired when a user successfully submits the contact form and reaches `/contacto/gracias`.

No additional parameters.

**Flow:** `user_engagement`

---

### `article_view`
Fired when a user loads a blog article page (`/blog/[slug]`). Fires once per article — a guard prevents double-firing on SSR hydration, and the guard resets on navigation between articles.

| Parameter | Type | Description |
|---|---|---|
| `article_id` | string or number | Article ID |
| `article_title` | string | Article title |
| `article_category` | string | First category name, or `"Unknown"` if none |

**Flow:** `content_engagement`

---

## Lifecycle Events

### `sign_up`
Fired when a user completes registration successfully (both email-confirmation and non-confirmation flows).

| Parameter | Type | Value |
|---|---|---|
| `method` | string | `"email"` (always) |

**Flow:** `user_lifecycle`

---

### `login`
Fired when a user completes the login flow — either via 2-step email verification or Google OAuth.

| Parameter | Type | Value |
|---|---|---|
| `method` | string | `"email"` or `"google"` |

**Flow:** `user_lifecycle`

---

## GTM Configuration

| Resource | Name | Type |
|---|---|---|
| Tag | `ga4-basecode` | Google tag (base) |
| Tag | `ga4-ecommerce-events` | GA4 Event — fires on ecommerce events |
| Tag | `ga4-engagement-events` | GA4 Event — fires on engagement + lifecycle events |
| Trigger | `ecommerce-events` | Custom Event — regex matching ecommerce event names |
| Trigger | `engagement-events` | Custom Event — regex `contact\|generate_lead\|sign_up\|login\|article_view` |

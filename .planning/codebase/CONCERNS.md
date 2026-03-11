# Codebase Concerns

**Analysis Date:** 2026-03-10

## Tech Debt

### Website: Purchase Analytics Stub
- **Issue:** The code responsible for firing purchase-related analytics events is incomplete. The implementation has been stubbed out with a `TODO` comment.
- **File:** `apps/website/app/pages/pagar/gracias.vue` (Line 107)
- **Impact:** This could lead to the absence of critical business analytics, resulting in missed insights on user purchases and ad performance.
- **Fix approach:** Complete the integration of purchase analytics by utilizing order and payment data to update the analytics event. Collaborate with analytics and business stakeholders to define the required metrics.

### Dashboard: Placeholder in Contact Form
- **Issue:** There exists a placeholder for a default phone number pattern, which could lead to errors when validating user-submitted data.
- **File:** `apps/website/app/components/FormContact.vue` (Line 55)
- **Impact:** Potential user confusion and submission errors for non-standard phone formats.
- **Fix approach:** Update the placeholder to dynamically reflect regional phone patterns or implement robust validation for user input.

## Known Bugs

### Strapi: Validation in Payment Services
- **Symptoms:** Inconsistent validation patterns in payment-related services, possibly causing runtime errors or invalid transactions.
- **Files:** 
  - `apps/strapi/src/api/payment/controllers/payment.ts`
  - `apps/strapi/src/api/payment/services/checkout.service.ts`
- **Trigger:** Invalid input data during payment initialization or webhook processing.
- **Workaround:** None currently documented.
- **Fix approach:** Standardize validation rules for payment services using a common library or middleware. Ensure unit and integration tests cover edge cases.

## Security Considerations

### Form Inputs
- **Risk:** The handling of sensitive user inputs in the `FormContact.vue` component lacks robust client-side validation and escape mechanisms.
- **Files:** `apps/website/app/components/FormContact.vue`
- **Current mitigation:** Data sanitization on the server-side.
- **Recommendations:** Implement client-side sanitation and ensure compliance with input validation practices.

### ReCAPTCHA Integration
- **Risk:** The site uses Google ReCAPTCHA V3 for bot mitigation but lacks fallback mechanisms for users unable to pass verification.
- **Files:** `apps/website/app/components/FormContact.vue`
- **Current mitigation:** None beyond ReCAPTCHA.
- **Recommendations:** Design a fallback system (e.g., server-side bot detection or alternative challenges).

## Performance Bottlenecks

### Store Operations
- **Problem:** Excessive reliance on reactive state leads to performance concerns when handling large datasets or complex watch dependencies.
- **Files:**
  - `apps/website/app/stores/ads.store.ts`
  - `apps/website/app/stores/categories.store.ts`
- **Cause:** Unoptimized computations and deep watchers.
- **Improvement path:** Audit existing watchers, eliminate redundant state computations, and use memoized/composable patterns.

## Fragile Areas

### Error Propagation and Handling
- **Files:**
  - `apps/dashboard/app/middleware/guard.global.ts`
  - `apps/dashboard/app/middleware/dev.global.ts`
- **Why fragile:** Error handling middleware is implemented globally without module-scoped exceptions, leading to generic 500 responses.
- **Safe modification:** Redefine middleware for scope-specific error interceptors. Introduce stratified error responses.
- **Test coverage:** Requires end-to-end tests to ensure coverage.

## Scaling Limits

### Payment Analytics System
- **Current capacity:** Limited to one gateway analytics event flow configured.
- **Limit:** Inability to accommodate future payment gateways without redundant code duplication.
- **Scaling path:** Refactor the analytics integration layer to decouple event construction, allowing multiple gateways to utilize shared logic.

## Dependencies at Risk

### Transient Dependencies in the `dashboard`
- **Risk:** Dependencies in `apps/dashboard/` show weak long-term support in their respective repositories.
- **Impact:** Security vulnerabilities or end-of-life software dependencies.
- **Migration plan:** Schedule quarterly dependency reviews and prioritize replacing high-risk libraries.

## Missing Critical Features

### Test Coverage in Dashboard
- **Problem:** The `dashboard` app lacks comprehensive automated tests, especially for `stores` and `utils/` functions.
- **Blocks:** Assurance on implementation correctness for time-sensitive ads or pricing calculations.
- **Files:**
  - `apps/dashboard/app/utils/price.ts`
  - `apps/dashboard/app/stores/app.store.ts`
- **Fix approach:** Create unit test cases for core utilities and stores.

## Test Coverage Gaps

### Ads and Analytics Store
- **What's not tested:** The functional correctness under multi-user scenarios and analytics tracking edge cases.
- **Files:**
  - `apps/website/app/stores/ad.store.ts`
  - `apps/website/app/stores/ads.store.ts`
- **Risk:** Tracking errors lead to unreliable metrics and user dissatisfaction.
- **Priority:** High

---

*Concerns audit: 2026-03-10*
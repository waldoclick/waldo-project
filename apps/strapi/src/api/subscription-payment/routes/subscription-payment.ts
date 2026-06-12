/**
 * subscription-payment router
 * SEC2-LOCKDOWN: Write actions (create, update, delete) are gated behind the
 * global::isManager policy. Subscription payments are created server-side by
 * the payment flow — no user-facing write endpoint is needed.
 * Read actions (find, findOne) remain open to authenticated callers; the
 * dashboard uses these to display subscription history.
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter(
  "api::subscription-payment.subscription-payment",
  {
    config: {
      create: { policies: ["global::isManager"] },
      update: { policies: ["global::isManager"] },
      delete: { policies: ["global::isManager"] },
    },
  },
);

/**
 * subscription-payment controller
 *
 * Reads are open to authenticated callers (the dashboard uses them), so find/findOne
 * are scoped to the caller for non-managers — otherwise any authenticated user could
 * list every user's subscription payments. Managers keep full access.
 */

import { factories } from "@strapi/strapi";
import { isManagerCtx, scopeReadToOwner } from "../../../utils/owner-scope";

const UID = "api::subscription-payment.subscription-payment";

export default factories.createCoreController(UID, ({ strapi }) => ({
  async find(ctx) {
    scopeReadToOwner(ctx);
    return super.find(ctx);
  },

  async findOne(ctx) {
    if (!isManagerCtx(ctx)) {
      const documentId = ctx.params?.documentId ?? ctx.params?.id;
      const record = documentId
        ? await strapi
            .documents(UID)
            .findOne({ documentId, populate: { user: true } })
        : null;
      if (!record) return ctx.notFound();
      const ownerId = (record as { user?: { id?: number | string } }).user?.id;
      if (String(ownerId) !== String(ctx.state.user?.id)) {
        return ctx.forbidden();
      }
    }
    return super.findOne(ctx);
  },
}));

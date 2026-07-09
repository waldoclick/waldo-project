/**
 * subscription-pro controller
 *
 * find/findOne are scoped to the caller for non-managers so an authenticated user
 * cannot list or read another user's PRO subscription. Managers keep full access.
 */

import { factories } from "@strapi/strapi";
import { isManagerCtx, scopeReadToOwner } from "../../../utils/owner-scope";

const UID = "api::subscription-pro.subscription-pro";

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

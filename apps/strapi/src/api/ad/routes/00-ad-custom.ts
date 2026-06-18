/**
 * Custom ad routes - se carga ANTES que ad.ts
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/ads/count",
      handler: "ad.count",
    },
    {
      method: "GET",
      path: "/ads/catalog",
      handler: "ad.catalog",
    },
    {
      method: "GET",
      path: "/ads/actives",
      handler: "ad.actives",
    },
    {
      method: "GET",
      path: "/ads/pendings",
      handler: "ad.pendings",
    },
    {
      method: "GET",
      path: "/ads/archiveds",
      handler: "ad.archiveds",
    },
    {
      method: "GET",
      path: "/ads/banneds",
      handler: "ad.banneds",
    },
    {
      method: "GET",
      path: "/ads/rejecteds",
      handler: "ad.rejecteds",
    },
    {
      method: "GET",
      path: "/ads/drafts",
      handler: "ad.drafts",
    },
    {
      method: "POST",
      path: "/ads/save-draft",
      handler: "ad.saveDraft",
    },
    {
      method: "GET",
      path: "/ads/thankyou/:documentId",
      handler: "ad.thankyou",
    },
    {
      method: "GET",
      path: "/ads/slug/:slug",
      handler: "ad.findBySlug",
      config: { auth: false },
    },
    // ─── Per-channel contact reveal (08-04) ──────────────────────────────────
    // FIVE SEPARATE routes (user mandate: do NOT combine into one :channel route).
    // auth:false at the router; each handler verifies the Bearer JWT and 401s on
    // anonymous. The static "reveal" segment + literal channel never collide with
    // /ads/slug/:slug, /ads/sold/:username, or the core /ads/:id wildcard.
    {
      method: "GET",
      path: "/ads/:documentId/reveal/phone",
      handler: "ad.revealAdPhone",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/ads/:documentId/reveal/whatsapp",
      handler: "ad.revealAdWhatsapp",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/ads/:documentId/reveal/email",
      handler: "ad.revealAdEmail",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/sellers/:username/reveal/phone",
      handler: "ad.revealSellerPhone",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/sellers/:username/reveal/whatsapp",
      handler: "ad.revealSellerWhatsapp",
      config: { auth: false },
    },
    {
      method: "PUT",
      path: "/ads/:id/approve",
      handler: "ad.approveAd",
      config: { policies: ["global::isManager"] },
    },
    {
      method: "PUT",
      path: "/ads/:id/reject",
      handler: "ad.rejectAd",
      config: { policies: ["global::isManager"] },
    },
    {
      method: "POST",
      path: "/ads/upload",
      handler: "ad.upload",
    },
    {
      method: "DELETE",
      path: "/ads/upload/:id",
      handler: "ad.deleteUpload",
    },
    {
      method: "PUT",
      path: "/ads/:id/banned",
      handler: "ad.bannedAd",
      config: { policies: ["global::isManager"] },
    },
    {
      method: "PUT",
      path: "/ads/:id/deactivate",
      handler: "ad.deactivateAd",
    },
  ],
};

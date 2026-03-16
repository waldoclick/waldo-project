/**
 * Custom ad routes - se carga ANTES que ad.ts
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/ads/me/counts",
      handler: "ad.meCounts",
    },
    {
      method: "GET",
      path: "/ads/me",
      handler: "ad.me",
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
      path: "/ads/slug/:slug",
      handler: "ad.findBySlug",
      config: { auth: false },
    },
    {
      method: "PUT",
      path: "/ads/:id/approve",
      handler: "ad.approveAd",
    },
    {
      method: "PUT",
      path: "/ads/:id/reject",
      handler: "ad.rejectAd",
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
    },
    {
      method: "PUT",
      path: "/ads/:id/deactivate",
      handler: "ad.deactivateAd",
    },
  ],
};

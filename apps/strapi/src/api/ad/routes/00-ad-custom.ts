/**
 * Custom ad routes - se carga ANTES que ad.ts
 */

export default {
  routes: [
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
      path: "/ads/rejecteds",
      handler: "ad.rejecteds",
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
      method: "GET",
      path: "/ads/me",
      handler: "ad.me",
    },
    {
      method: "POST",
      path: "/ads/upload",
      handler: "ad.upload",
    },
    {
      method: "PUT",
      path: "/ads/:id/deactivate",
      handler: "ad.deactivateAd",
    },
  ],
};

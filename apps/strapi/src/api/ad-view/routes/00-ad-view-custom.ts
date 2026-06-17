/**
 * Custom ad-view routes — loaded BEFORE ad-view.ts
 *
 * IMPORTANT: /ads/me/views-total (static segment) is declared BEFORE
 * /ads/:documentId/stats (wildcard) so the router does not capture "me"
 * as a documentId.
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/ads/me/views-total",
      handler: "ad-view.panelViewsTotal",
    },
    {
      method: "GET",
      path: "/ads/:documentId/stats",
      handler: "ad-view.stats",
    },
  ],
};

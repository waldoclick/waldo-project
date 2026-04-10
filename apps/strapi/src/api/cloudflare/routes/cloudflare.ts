/**
 * Cloudflare Routes
 *
 * Exposes a single endpoint to retrieve Cloudflare analytics data.
 * Access is controlled via the global::isManager policy.
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/cloudflare",
      handler: "cloudflare.getData",
      config: { policies: ["global::isManager"] },
    },
  ],
};

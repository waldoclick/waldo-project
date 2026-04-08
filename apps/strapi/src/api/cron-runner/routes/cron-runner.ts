/**
 * Cron Runner Routes
 *
 * Exposes a single endpoint to manually trigger any registered cron job.
 * Access is controlled via Strapi Admin panel (Roles & Permissions).
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/cron-runner/:name", // e.g. user-cron, ad-cron, cleanup-cron, backup-cron
      handler: "cron-runner.run",
      config: { policies: ["global::isManager"] },
    },
  ],
};

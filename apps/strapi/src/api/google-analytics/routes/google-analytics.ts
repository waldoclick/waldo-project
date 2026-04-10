export default {
  routes: [
    {
      method: "GET",
      path: "/google-analytics/stats",
      handler: "google-analytics.getStats",
      config: { policies: ["global::isManager"] },
    },
    {
      method: "GET",
      path: "/google-analytics/pages",
      handler: "google-analytics.getPages",
      config: { policies: ["global::isManager"] },
    },
  ],
};

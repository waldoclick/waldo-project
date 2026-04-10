export default {
  routes: [
    {
      method: "GET",
      path: "/search-console/performance",
      handler: "search-console.getPerformance",
      config: { policies: ["global::isManager"] },
    },
    {
      method: "GET",
      path: "/search-console/queries",
      handler: "search-console.getQueries",
      config: { policies: ["global::isManager"] },
    },
    {
      method: "GET",
      path: "/search-console/pages",
      handler: "search-console.getPages",
      config: { policies: ["global::isManager"] },
    },
  ],
};

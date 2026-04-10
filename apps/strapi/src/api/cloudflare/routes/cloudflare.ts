export default {
  routes: [
    {
      method: "GET",
      path: "/cloudflare/traffic",
      handler: "cloudflare.getTraffic",
      config: { policies: ["global::isManager"] },
    },
    {
      method: "GET",
      path: "/cloudflare/requests",
      handler: "cloudflare.getRequests",
      config: { policies: ["global::isManager"] },
    },
    {
      method: "GET",
      path: "/cloudflare/threats",
      handler: "cloudflare.getThreats",
      config: { policies: ["global::isManager"] },
    },
  ],
};

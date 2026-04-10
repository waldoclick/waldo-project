export default {
  routes: [
    {
      method: "GET",
      path: "/better-stack/monitors",
      handler: "better-stack.getMonitors",
      config: { policies: ["global::isManager"] },
    },
    {
      method: "GET",
      path: "/better-stack/incidents",
      handler: "better-stack.getIncidents",
      config: { policies: ["global::isManager"] },
    },
  ],
};

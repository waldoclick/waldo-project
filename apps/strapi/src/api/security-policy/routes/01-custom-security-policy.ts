/**
 * security-policy custom routes
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/security-policies/reorder",
      handler: "security-policy.reorder",
      config: {
        policies: [],
      },
    },
  ],
};

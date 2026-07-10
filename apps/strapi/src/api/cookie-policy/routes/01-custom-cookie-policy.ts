/**
 * cookie-policy custom routes
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/cookie-policies/reorder",
      handler: "cookie-policy.reorder",
      config: {
        policies: [],
      },
    },
  ],
};

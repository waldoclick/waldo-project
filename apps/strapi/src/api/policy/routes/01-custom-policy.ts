/**
 * policy custom routes
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/policies/reorder",
      handler: "policy.reorder",
      config: {
        policies: [],
      },
    },
  ],
};

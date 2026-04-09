/**
 * term custom routes
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/terms/reorder",
      handler: "term.reorder",
      config: {
        policies: [],
      },
    },
  ],
};

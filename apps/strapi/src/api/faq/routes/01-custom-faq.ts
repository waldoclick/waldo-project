/**
 * faq custom routes
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/faqs/reorder",
      handler: "faq.reorder",
      config: {
        policies: [],
      },
    },
  ],
};

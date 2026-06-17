/**
 * Custom ad-contact routes — loaded BEFORE ad-contact.ts
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/ads/:documentId/contact",
      handler: "ad-contact.recordContact",
      config: {
        auth: false,
      },
    },
  ],
};

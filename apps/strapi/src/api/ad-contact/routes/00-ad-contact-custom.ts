/**
 * Custom ad-contact routes — loaded BEFORE ad-contact.ts
 *
 * IMPORTANT: /ads/me/contacts-total (static segment) is declared BEFORE
 * /ads/:documentId/contact (wildcard) so the router does not capture "me"
 * as a documentId.
 *
 * The GET contacts-total route requires authentication (no auth:false) —
 * permission is granted to the Authenticated role by the 06-01 bootstrap.
 * The POST /contact route is public (auth:false) — anonymous visitors may contact.
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/ads/me/contacts-total",
      handler: "ad-contact.contactsTotal",
    },
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

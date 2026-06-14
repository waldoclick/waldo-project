"use strict";

type RouteConfig = {
  method: string;
  path: string;
  handler: string;
  config: {
    auth?: boolean;
    policies: string[];
  };
};

const routes: RouteConfig[] = [
  // DEPRECATED: adCreate replaced by checkoutCreate (unified checkout flow)
  // {
  //   method: "POST",
  //   path: "/payments/ad",
  //   handler: "payment.adCreate",
  //   config: {
  //     policies: [],
  //   },
  // },
  {
    method: "POST",
    path: "/payments/free-ad",
    handler: "payment.freeAdCreate",
    config: {
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/payments/checkout",
    handler: "payment.checkoutCreate",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/payments/webpay",
    handler: "payment.webpayResponse",
    config: {
      // Transbank redirects the browser back via GET and carries no Authorization
      // header. With the httpOnly-cookie proxy, an authenticated user's waldo_jwt
      // cookie IS injected as Authorization on this top-level GET, which would make
      // Strapi evaluate the authenticated role (lacking this permission) → 403.
      // auth: false makes the route truly public; the gateway token is the only
      // identity that matters here (resolved via order.documentId).
      auth: false,
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/payments/thankyou/:documentId",
    handler: "payment.thankyou",
    config: {
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/payments/pro",
    handler: "payment.proCreate",
    config: {
      policies: [],
    },
  },
  {
    // GET is required — Transbank redirects via GET after card enrollment.
    // Transbank redirects carry no Authorization header. auth: false makes the
    // route truly public so the proxy-injected waldo_jwt (present on an
    // authenticated user's top-level GET) does not flip Strapi to the
    // authenticated role and 403. The user is resolved from the inscription
    // token stored on subscription-pro, never from ctx.state.user.
    method: "GET",
    path: "/payments/pro-response",
    handler: "payment.proResponse",
    config: {
      auth: false,
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/payments/pro-cancel",
    handler: "payment.proCancel",
    config: {
      policies: [],
    },
  },
];

export default {
  routes,
};

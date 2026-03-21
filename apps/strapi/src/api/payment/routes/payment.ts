"use strict";

type RouteConfig = {
  method: string;
  path: string;
  handler: string;
  config: {
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
    // No auth policy: Transbank redirects carry no Authorization header.
    method: "GET",
    path: "/payments/pro-response",
    handler: "payment.proResponse",
    config: {
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

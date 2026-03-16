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
  {
    method: "POST",
    path: "/payments/ad",
    handler: "payment.adCreate",
    config: {
      policies: [],
    },
  },
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
    method: "POST",
    path: "/payments/pro",
    handler: "payment.proCreate",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/payments/pro-response",
    handler: "payment.proResponse",
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
];

export default {
  routes,
};

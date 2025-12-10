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
    method: "GET",
    path: "/payments/ad-response",
    handler: "payment.adResponse",
    config: {
      policies: [],
    },
  },
  {
    method: "POST",
    path: "/payments/pack",
    handler: "payment.packCreate",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/payments/pack-response",
    handler: "payment.packResponse",
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
];

export default {
  routes,
};

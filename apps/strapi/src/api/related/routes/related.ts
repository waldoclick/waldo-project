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
    method: "GET",
    path: "/related/ads",
    handler: "related.ads",
    config: {
      policies: [],
    },
  },
];

export default {
  routes,
};

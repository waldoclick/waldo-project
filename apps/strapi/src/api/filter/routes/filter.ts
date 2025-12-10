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
    path: "/filter/communes",
    handler: "filter.communes",
    config: {
      policies: [],
    },
  },
  {
    method: "GET",
    path: "/filter/categories",
    handler: "filter.categories",
    config: {
      policies: [],
    },
  },
];

export default {
  routes,
};

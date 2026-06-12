/**
 * ad-pack router
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/ad-packs",
      handler: "ad-pack.find",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/ad-packs/:id",
      handler: "ad-pack.findOne",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/ad-packs",
      handler: "ad-pack.create",
      config: {
        policies: ["global::isManager"],
      },
    },
    {
      method: "PUT",
      path: "/ad-packs/:id",
      handler: "ad-pack.update",
      config: {
        policies: ["global::isManager"],
      },
    },
    {
      method: "DELETE",
      path: "/ad-packs/:id",
      handler: "ad-pack.delete",
      config: {
        policies: ["global::isManager"],
      },
    },
  ],
};

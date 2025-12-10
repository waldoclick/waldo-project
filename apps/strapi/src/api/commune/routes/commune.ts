/**
 * commune router
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/communes",
      handler: "commune.find",
      config: {
        policies: [],
      },
    },
    {
      method: "GET",
      path: "/communes/:id",
      handler: "commune.findOne",
      config: {
        policies: [],
      },
    },
    {
      method: "POST",
      path: "/communes",
      handler: "commune.create",
      config: {
        policies: [],
      },
    },
    {
      method: "PUT",
      path: "/communes/:id",
      handler: "commune.update",
      config: {
        policies: [],
      },
    },
    {
      method: "DELETE",
      path: "/communes/:id",
      handler: "commune.delete",
      config: {
        policies: [],
      },
    },
  ],
};

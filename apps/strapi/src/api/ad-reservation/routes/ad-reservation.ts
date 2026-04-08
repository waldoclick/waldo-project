export default {
  routes: [
    {
      method: "GET",
      path: "/ad-reservations",
      handler: "ad-reservation.find",
      config: { policies: [] },
    },
    {
      method: "GET",
      path: "/ad-reservations/:id",
      handler: "ad-reservation.findOne",
      config: { policies: [] },
    },
    {
      method: "POST",
      path: "/ad-reservations",
      handler: "ad-reservation.create",
      config: { policies: [] },
    },
    {
      method: "PUT",
      path: "/ad-reservations/:id",
      handler: "ad-reservation.update",
      config: { policies: [] },
    },
    {
      method: "DELETE",
      path: "/ad-reservations/:id",
      handler: "ad-reservation.delete",
      config: { policies: [] },
    },
    {
      method: "POST",
      path: "/ad-reservations/gift",
      handler: "ad-reservation.gift",
      config: { policies: ["global::isManager"] },
    },
  ],
};

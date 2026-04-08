export default {
  routes: [
    {
      method: "GET",
      path: "/ad-featured-reservations",
      handler: "ad-featured-reservation.find",
      config: { policies: [] },
    },
    {
      method: "GET",
      path: "/ad-featured-reservations/:id",
      handler: "ad-featured-reservation.findOne",
      config: { policies: [] },
    },
    {
      method: "POST",
      path: "/ad-featured-reservations",
      handler: "ad-featured-reservation.create",
      config: { policies: [] },
    },
    {
      method: "PUT",
      path: "/ad-featured-reservations/:id",
      handler: "ad-featured-reservation.update",
      config: { policies: [] },
    },
    {
      method: "DELETE",
      path: "/ad-featured-reservations/:id",
      handler: "ad-featured-reservation.delete",
      config: { policies: [] },
    },
    {
      method: "POST",
      path: "/ad-featured-reservations/gift",
      handler: "ad-featured-reservation.gift",
      config: { policies: ["global::isManager"] },
    },
  ],
};

export default {
  routes: [
    {
      method: "POST",
      path: "/ad-featured-reservations/gift",
      handler: "ad-featured-reservation.gift",
      config: { policies: [] },
    },
  ],
};

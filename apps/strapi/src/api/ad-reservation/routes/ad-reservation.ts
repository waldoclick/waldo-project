export default {
  routes: [
    {
      method: "POST",
      path: "/ad-reservations/gift",
      handler: "ad-reservation.gift",
      config: { policies: [] },
    },
  ],
};

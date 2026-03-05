/**
 * Custom order routes - se carga ANTES que order.ts
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/orders/sales-by-month",
      handler: "order.salesByMonth",
    },
    {
      method: "GET",
      path: "/orders/me",
      handler: "order.me",
    },
  ],
};

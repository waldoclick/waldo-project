/**
 * Custom order routes - se carga ANTES que order.ts
 *
 * IMPORTANT: /orders/me/summary (three-segment static) is declared BEFORE
 * /orders/me (two-segment) so the router does not stop at the shorter match.
 */

export default {
  routes: [
    {
      method: "GET",
      path: "/orders/export-csv",
      handler: "order.exportCsv",
      config: { policies: ["global::isManager"] },
    },
    {
      method: "GET",
      path: "/orders/sales-by-month",
      handler: "order.salesByMonth",
      config: { policies: ["global::isManager"] },
    },
    {
      method: "GET",
      path: "/orders/me/summary",
      handler: "order.meSummary",
    },
    {
      method: "GET",
      path: "/orders/me",
      handler: "order.me",
    },
  ],
};

/**
 * order service
 */

import { factories } from "@strapi/strapi";

export interface OrderSummary {
  /** Sum of all paid orders' amounts (in CLP cents, as integer). */
  total_invested: number;
  /** ISO timestamp of the most recent order, or null when the user has none. */
  last_purchase: string | null;
}

export default factories.createCoreService("api::order.order", ({ strapi }) => ({
  /**
   * Aggregate lifetime order stats for a single user.
   *
   * Fetches all orders for the user in one query (scalars only, no populate).
   * All orders in the database are post-payment by design (CLAUDE.md payment
   * rules), so no extra status filter is needed.
   *
   * @param userId - Strapi numeric user id
   * @returns { total_invested, last_purchase }
   */
  async getUserOrdersSummary(userId: number): Promise<OrderSummary> {
    const orders = (await strapi.db.query("api::order.order").findMany({
      where: { user: userId },
      select: ["amount", "createdAt"],
    })) as Array<{ amount: string | number | bigint; createdAt: string }>;

    if (orders.length === 0) {
      return { total_invested: 0, last_purchase: null };
    }

    let totalInvested = 0;
    let lastPurchase: string | null = null;

    for (const order of orders) {
      // Coerce biginteger | string | number — same pattern used in salesByMonth
      const amount =
        typeof order.amount === "bigint"
          ? Number(order.amount)
          : typeof order.amount === "string"
            ? Number.parseFloat(order.amount)
            : (order.amount as number) || 0;
      totalInvested += amount;

      if (lastPurchase === null || order.createdAt > lastPurchase) {
        lastPurchase = order.createdAt;
      }
    }

    return { total_invested: totalInvested, last_purchase: lastPurchase };
  },
}));

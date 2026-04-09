import { ICronjobResult } from "./ad-expiry.cron";
import { OneclickService } from "../services/oneclick";
import logger from "../utils/logtail";
import { computeSortPriority } from "../api/ad/services/ad";
import orderUtils from "../api/payment/utils/order.utils";
import generalUtils from "../api/payment/utils/general.utils";
import { documentDetails } from "../api/payment/utils/user.utils";

interface ProUser {
  id: number;
  documentId: string;
  subscription_pro?: { tbk_user?: string; pending_invoice?: boolean } | null;
}

interface FailedPaymentRecord {
  id: number;
  documentId?: string;
  charge_attempts: number;
  next_charge_attempt: string;
  period_start: string;
  period_end: string;
  user: ProUser;
}

interface ExhaustedPaymentRecord {
  id: number;
  documentId?: string;
  user: { id: number; documentId: string };
}

interface DuePaymentRecord {
  id: number;
  documentId?: string;
  period_end: string;
  user: ProUser;
}

/**
 * SubscriptionChargeService handles the daily billing loop for PRO subscribers.
 *
 * Responsibilities:
 * 1. Charge active PRO users whose billing period has ended (CHRG-01, CHRG-02)
 * 2. No idempotency check needed — the period_end query is self-guarding (renewed records have future period_end)
 * 3. Retry failed charges on day 1 and day 3 after expiry (CHRG-03)
 * 4. Deactivate subscriptions after 3 consecutive failed charge attempts (CHRG-03)
 * 5. Read charge amount from PRO_MONTHLY_PRICE env var (CHRG-04)
 */
export class SubscriptionChargeService {
  /**
   * Main entry point for the daily subscription charge cron.
   * Validates env config, processes new charges, retries failed ones,
   * and deactivates exhausted subscriptions.
   */
  async chargeExpiredSubscriptions(): Promise<ICronjobResult> {
    try {
      const amountRaw = process.env.PRO_MONTHLY_PRICE;
      if (!amountRaw || parseInt(amountRaw, 10) === 0) {
        const errorMessage =
          "PRO_MONTHLY_PRICE environment variable is not set or is zero — cannot process subscription charges";
        logger.error(errorMessage);
        return { success: false, error: errorMessage };
      }
      const amount = parseInt(amountRaw, 10);

      const today = new Date().toISOString().split("T")[0];

      // Step 1: Charge active PRO users whose billing period has ended
      const duePayments = (await strapi.db
        .query("api::subscription-payment.subscription-payment")
        .findMany({
          where: {
            status: { $eq: "approved" },
            period_end: { $lte: today },
            user: { pro_status: { $eq: "active" } },
          },
          populate: {
            user: {
              populate: ["subscription_pro"],
            },
          },
          limit: -1,
        })) as DuePaymentRecord[];

      logger.info(
        `SubscriptionChargeService: found ${duePayments.length} due subscription payments to charge`
      );

      for (const record of duePayments) {
        const user = record.user;
        const tbkUser = user.subscription_pro?.tbk_user;
        if (!tbkUser) {
          logger.warn(
            `SubscriptionChargeService: user ${user.id} has no subscription-pro tbk_user, skipping`
          );
          continue;
        }
        const pendingInvoice = user.subscription_pro?.pending_invoice ?? false;

        await this.chargeUser(
          { ...user, tbk_user: tbkUser, pending_invoice: pendingInvoice },
          record.period_end,
          today,
          amount,
          1
        );
      }

      // Step 2: Retry failed charges with charge_attempts < 3 whose next_charge_attempt <= today
      const retryRecords = (await strapi.db
        .query("api::subscription-payment.subscription-payment")
        .findMany({
          where: {
            status: "failed",
            charge_attempts: { $lt: 3 },
            next_charge_attempt: { $lte: today },
          },
          populate: {
            user: {
              populate: ["subscription_pro"],
            },
          },
          limit: -1,
        })) as FailedPaymentRecord[];

      logger.info(
        `SubscriptionChargeService: found ${retryRecords.length} failed payments to retry`
      );

      for (const record of retryRecords) {
        const user = record.user;
        const tbkUser = user.subscription_pro?.tbk_user;
        if (!tbkUser) {
          logger.warn(
            `SubscriptionChargeService: retry user ${user.id} has no subscription-pro tbk_user, skipping`
          );
          continue;
        }
        const pendingInvoice = user.subscription_pro?.pending_invoice ?? false;
        const attempt = record.charge_attempts + 1;
        await this.chargeUser(
          { ...user, tbk_user: tbkUser, pending_invoice: pendingInvoice },
          record.period_end,
          today,
          amount,
          attempt,
          record.id
        );
      }

      // Step 3: Deactivate exhausted subscriptions (charge_attempts >= 3)
      const exhaustedRecords = (await strapi.db
        .query("api::subscription-payment.subscription-payment")
        .findMany({
          where: {
            status: "failed",
            charge_attempts: { $gte: 3 },
          },
          populate: ["user"],
          limit: -1,
        })) as ExhaustedPaymentRecord[];

      logger.info(
        `SubscriptionChargeService: found ${exhaustedRecords.length} exhausted subscriptions to deactivate`
      );

      for (const record of exhaustedRecords) {
        const user = record.user;

        // Deactivate user
        await strapi.db.query("plugin::users-permissions.user").update({
          where: { id: user.id },
          data: { pro_status: "inactive" },
        });

        // Clear subscription-pro tbk_user on deactivation
        try {
          const subPro = await strapi.db
            .query("api::subscription-pro.subscription-pro")
            .findOne({ where: { user: { id: user.id } } });
          if (subPro) {
            await strapi.db
              .query("api::subscription-pro.subscription-pro")
              .update({
                where: { id: (subPro as { id: number }).id },
                data: { tbk_user: null },
              });
          }
        } catch (subProError) {
          logger.error(
            "SubscriptionChargeService: failed to clear subscription-pro on deactivation",
            {
              userId: user.id,
              error: subProError,
            }
          );
        }

        // Recalculate sort_priority for user's featured ads (pro=false changes priority from 0 to 1)
        try {
          const userFeaturedAds = await strapi.db.query("api::ad.ad").findMany({
            where: { user: { id: user.id } },
            populate: { ad_featured_reservation: true, user: true },
            limit: -1,
          });
          for (const ad of userFeaturedAds) {
            const priority = computeSortPriority(
              ad as {
                ad_featured_reservation?: unknown;
                user?: { pro_status?: string } | null;
              }
            );
            const adRecord = ad as Record<string, unknown>;
            if (adRecord.sort_priority !== priority) {
              await strapi.db.query("api::ad.ad").update({
                where: { id: adRecord.id },
                data: { sort_priority: priority },
              });
            }
          }
        } catch (sortError) {
          logger.error(
            "SubscriptionChargeService: sort_priority recalculation failed on deactivation",
            { userId: user.id, error: sortError }
          );
        }

        // Mark payment record as deactivated
        await strapi.db
          .query("api::subscription-payment.subscription-payment")
          .update({
            where: { id: record.id },
            data: { status: "deactivated" },
          });

        logger.info(
          `SubscriptionChargeService: deactivated PRO subscription for user ${user.id}`
        );
      }

      // Step 4: Deactivate cancelled subscriptions whose period has ended (CANC-04)
      const expiredCancelledPayments = (await strapi.db
        .query("api::subscription-payment.subscription-payment")
        .findMany({
          where: {
            status: { $eq: "approved" },
            period_end: { $lte: today },
            user: { pro_status: { $eq: "cancelled" } },
          },
          populate: ["user"],
          limit: -1,
        })) as unknown as Array<{
        id: number;
        user: { id: number; documentId: string };
      }>;

      logger.info(
        `SubscriptionChargeService: found ${expiredCancelledPayments.length} expired cancelled payment records to process`
      );

      // Deduplicate by user ID — a cancelled user may have multiple past approved rows
      const processedCancelledUserIds = new Set<number>();

      for (const record of expiredCancelledPayments) {
        const user = record.user;
        if (processedCancelledUserIds.has(user.id)) {
          continue;
        }
        processedCancelledUserIds.add(user.id);

        await strapi.db.query("plugin::users-permissions.user").update({
          where: { id: user.id },
          data: { pro_status: "inactive" },
        });

        // Recalculate sort_priority for user's featured ads (CANC-04)
        try {
          const userFeaturedAds = await strapi.db.query("api::ad.ad").findMany({
            where: { user: { id: user.id } },
            populate: { ad_featured_reservation: true, user: true },
            limit: -1,
          });
          for (const ad of userFeaturedAds) {
            const priority = computeSortPriority(
              ad as {
                ad_featured_reservation?: unknown;
                user?: { pro_status?: string } | null;
              }
            );
            const adRecord = ad as Record<string, unknown>;
            if (adRecord.sort_priority !== priority) {
              await strapi.db.query("api::ad.ad").update({
                where: { id: adRecord.id },
                data: { sort_priority: priority },
              });
            }
          }
        } catch (sortError) {
          logger.error(
            "SubscriptionChargeService: sort_priority recalculation failed on cancelled deactivation",
            { userId: user.id, error: sortError }
          );
        }

        logger.info(
          `SubscriptionChargeService: deactivated expired cancelled PRO subscription for user ${user.id}`
        );
      }

      return {
        success: true,
        results: "Subscription charges processed successfully",
      };
    } catch (error) {
      logger.error(
        "SubscriptionChargeService.chargeExpiredSubscriptions failed",
        { error }
      );
      return {
        success: false,
        error: "Failed to process subscription charges",
      };
    }
  }

  /**
   * Charges a single user via OneclickService and persists the result.
   * On success: creates/updates subscription-payment as approved with new period_end.
   * On failure: creates/updates subscription-payment as failed with next retry date.
   *
   * @param user - The PRO user to charge (with tbk_user at top level, sourced from subscription_pro)
   * @param periodEnd - ISO date string (YYYY-MM-DD) of the old period_end from the record being renewed
   * @param today - ISO date string (YYYY-MM-DD) for today
   * @param amount - Charge amount in CLP (from PRO_MONTHLY_PRICE env var)
   * @param attempt - Current attempt number (1-based)
   * @param existingRecordId - Numeric ID of existing failed payment record to update (if retrying)
   */
  private async chargeUser(
    user: ProUser & { tbk_user: string; pending_invoice: boolean },
    periodEnd: string,
    today: string,
    amount: number,
    attempt: number,
    existingRecordId?: number
  ): Promise<void> {
    const todayCompact = today.replace(/-/g, "");
    const parentBuyOrder = `pro-${user.id}-${todayCompact}`;
    const childBuyOrder = `c-${user.id}-${todayCompact}-${attempt}`;

    // Compute new period boundaries from the old period_end
    const currentPeriodEnd = new Date(periodEnd);
    const newPeriodEnd = new Date(
      currentPeriodEnd.getFullYear(),
      currentPeriodEnd.getMonth() + 1,
      1
    );
    const newPeriodEndStr = newPeriodEnd.toISOString().split("T")[0];
    // The new period starts where the old period ended
    const newPeriodStart = periodEnd;

    const oneclickService = new OneclickService();
    const result = await oneclickService.authorizeCharge(
      user.documentId,
      user.tbk_user,
      amount,
      parentBuyOrder,
      childBuyOrder
    );

    if (result.success) {
      if (existingRecordId) {
        // Update existing failed record to approved
        await strapi.db
          .query("api::subscription-payment.subscription-payment")
          .update({
            where: { id: existingRecordId },
            data: {
              status: "approved",
              authorization_code: result.authorizationCode,
              response_code: result.responseCode,
              payment_response: result.rawResponse,
              charged_at: new Date(),
              charge_attempts: attempt,
              period_end: newPeriodEndStr,
            },
          });
      } else {
        // Create new approved payment record
        await strapi.db
          .query("api::subscription-payment.subscription-payment")
          .create({
            data: {
              user: user.id,
              amount,
              status: "approved",
              parent_buy_order: parentBuyOrder,
              child_buy_order: childBuyOrder,
              authorization_code: result.authorizationCode,
              response_code: result.responseCode,
              payment_response: result.rawResponse,
              period_start: newPeriodStart,
              period_end: newPeriodEndStr,
              charged_at: new Date(),
              charge_attempts: attempt,
            },
          });
      }

      // Create order + Facto document for this charge — invoice preference from subscription-pro
      const isInvoice = user.pending_invoice;
      try {
        const userDocDetails = await documentDetails(user.id, isInvoice);
        const chargeItems = [
          { name: "Suscripcion PRO mensual", price: amount, quantity: 1 },
        ];
        const factoDoc = await generalUtils.generateFactoDocument({
          isInvoice,
          userDetails: userDocDetails,
          items: chargeItems,
        });
        await orderUtils.createAdOrder({
          amount,
          buy_order: parentBuyOrder,
          userId: user.id,
          is_invoice: isInvoice,
          payment_method: process.env.PAYMENT_GATEWAY ?? "transbank",
          payment_response: result.rawResponse,
          document_details: userDocDetails,
          items: chargeItems,
          document_response: factoDoc,
        });
      } catch (orderError) {
        // Non-fatal: charge was successful, order creation failure must not block period extension
        logger.error("SubscriptionChargeService: order/Facto creation failed", {
          userId: user.id,
          error: orderError,
        });
      }

      logger.info(
        `SubscriptionChargeService: successfully charged user ${user.id} (attempt ${attempt})`
      );
    } else {
      // Compute next retry date based on attempt number
      const nextRetryDate = new Date();
      if (attempt === 1) {
        // Retry tomorrow (day 2 after expiry)
        nextRetryDate.setDate(nextRetryDate.getDate() + 1);
      } else {
        // Retry in 2 days (day 3 after expiry on second failure)
        nextRetryDate.setDate(nextRetryDate.getDate() + 2);
      }
      const nextRetryDateStr = nextRetryDate.toISOString().split("T")[0];

      if (existingRecordId) {
        // Update existing failed record with new attempt info
        await strapi.db
          .query("api::subscription-payment.subscription-payment")
          .update({
            where: { id: existingRecordId },
            data: {
              charge_attempts: attempt,
              next_charge_attempt: nextRetryDateStr,
              response_code: result.responseCode,
              payment_response: result.rawResponse,
              period_end: newPeriodEndStr,
            },
          });
      } else {
        // Create new failed payment record
        await strapi.db
          .query("api::subscription-payment.subscription-payment")
          .create({
            data: {
              user: user.id,
              amount,
              status: "failed",
              parent_buy_order: parentBuyOrder,
              child_buy_order: childBuyOrder,
              response_code: result.responseCode,
              payment_response: result.rawResponse,
              period_start: newPeriodStart,
              period_end: newPeriodEndStr,
              charge_attempts: attempt,
              next_charge_attempt: nextRetryDateStr,
            },
          });
      }

      logger.info(
        `SubscriptionChargeService: charge failed for user ${user.id} (attempt ${attempt}), next retry: ${nextRetryDateStr}`
      );
    }
  }
}

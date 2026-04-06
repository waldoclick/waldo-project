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
  tbk_user: string;
  pro_expires_at: string;
  pro_pending_invoice?: boolean;
}

interface FailedPaymentRecord {
  id: number;
  documentId?: string;
  charge_attempts: number;
  next_charge_attempt: string;
  period_start: string;
  user: ProUser;
}

interface ExhaustedPaymentRecord {
  id: number;
  documentId?: string;
  user: { id: number; documentId: string };
}

interface CancelledUser {
  id: number;
  documentId: string;
}

/**
 * SubscriptionChargeService handles the daily billing loop for PRO subscribers.
 *
 * Responsibilities:
 * 1. Charge active PRO users whose billing period has expired (CHRG-01, CHRG-02)
 * 2. Skip users already charged for the current period — idempotency guard (CHRG-05)
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

      // Step 1: Charge newly expired active PRO users
      const expiredUsers = (await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: {
            pro_status: { $eq: "active" },
            pro_expires_at: { $lte: `${today}T23:59:59.999Z` },
          } as unknown as Record<string, unknown>,
          fields: ["id", "tbk_user", "pro_expires_at"] as Parameters<
            typeof strapi.entityService.findMany
          >[1]["fields"],
          pagination: { pageSize: -1 },
        }
      )) as ProUser[];

      logger.info(
        `SubscriptionChargeService: found ${expiredUsers.length} expired active PRO users`
      );

      for (const user of expiredUsers) {
        const periodStart = user.pro_expires_at.split("T")[0];

        // Idempotency check: skip if already approved for this period
        const existingApproved = await strapi.entityService.findMany(
          "api::subscription-payment.subscription-payment" as Parameters<
            typeof strapi.entityService.findMany
          >[0],
          {
            filters: {
              user: { id: user.id },
              period_start: periodStart,
              status: "approved",
            } as unknown as Record<string, unknown>,
            pagination: { pageSize: 1 },
          }
        );

        if ((existingApproved as unknown[]).length > 0) {
          logger.info(
            `SubscriptionChargeService: user ${user.id} already charged for period ${periodStart}, skipping`
          );
          continue;
        }

        await this.chargeUser(user, periodStart, today, amount, 1);
      }

      // Step 2: Retry failed charges with charge_attempts < 3 whose next_charge_attempt <= today
      const retryRecords = (await strapi.entityService.findMany(
        "api::subscription-payment.subscription-payment" as Parameters<
          typeof strapi.entityService.findMany
        >[0],
        {
          filters: {
            status: "failed",
            charge_attempts: { $lt: 3 },
            next_charge_attempt: { $lte: today },
          } as unknown as Record<string, unknown>,
          populate: ["user"] as unknown as Parameters<
            typeof strapi.entityService.findMany
          >[1]["populate"],
          pagination: { pageSize: -1 },
        }
      )) as FailedPaymentRecord[];

      logger.info(
        `SubscriptionChargeService: found ${retryRecords.length} failed payments to retry`
      );

      for (const record of retryRecords) {
        const user = record.user;
        const attempt = record.charge_attempts + 1;
        await this.chargeUser(
          user,
          record.period_start,
          today,
          amount,
          attempt,
          record.id
        );
      }

      // Step 3: Deactivate exhausted subscriptions (charge_attempts >= 3)
      const exhaustedRecords = (await strapi.entityService.findMany(
        "api::subscription-payment.subscription-payment" as Parameters<
          typeof strapi.entityService.findMany
        >[0],
        {
          filters: {
            status: "failed",
            charge_attempts: { $gte: 3 },
          } as unknown as Record<string, unknown>,
          populate: ["user"] as unknown as Parameters<
            typeof strapi.entityService.findMany
          >[1]["populate"],
          pagination: { pageSize: -1 },
        }
      )) as ExhaustedPaymentRecord[];

      logger.info(
        `SubscriptionChargeService: found ${exhaustedRecords.length} exhausted subscriptions to deactivate`
      );

      for (const record of exhaustedRecords) {
        const user = record.user;

        // Deactivate user
        await strapi.entityService.update(
          "plugin::users-permissions.user",
          user.id,
          {
            data: {
              pro_status: "inactive",
              pro_expires_at: null,
              tbk_user: null,
            } as unknown as Parameters<
              typeof strapi.entityService.update
            >[2]["data"],
          }
        );

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
        await strapi.entityService.update(
          "api::subscription-payment.subscription-payment" as Parameters<
            typeof strapi.entityService.update
          >[0],
          record.id,
          {
            data: {
              status: "deactivated",
            } as unknown as Parameters<
              typeof strapi.entityService.update
            >[2]["data"],
          }
        );

        logger.info(
          `SubscriptionChargeService: deactivated PRO subscription for user ${user.id}`
        );
      }

      // Step 4: Deactivate cancelled subscriptions whose pro_expires_at has passed (CANC-04)
      const expiredCancelledUsers = (await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: {
            pro_status: { $eq: "cancelled" },
            pro_expires_at: { $lte: `${today}T23:59:59.999Z` },
          } as unknown as Record<string, unknown>,
          fields: ["id", "documentId"] as Parameters<
            typeof strapi.entityService.findMany
          >[1]["fields"],
          pagination: { pageSize: -1 },
        }
      )) as CancelledUser[];

      logger.info(
        `SubscriptionChargeService: found ${expiredCancelledUsers.length} expired cancelled PRO users to deactivate`
      );

      for (const user of expiredCancelledUsers) {
        await strapi.entityService.update(
          "plugin::users-permissions.user",
          user.id,
          {
            data: {
              pro_status: "inactive",
              pro_expires_at: null,
              tbk_user: null,
            } as unknown as Parameters<
              typeof strapi.entityService.update
            >[2]["data"],
          }
        );

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
   * On success: creates/updates subscription-payment as approved and extends pro_expires_at.
   * On failure: creates/updates subscription-payment as failed with next retry date.
   *
   * @param user - The PRO user to charge
   * @param periodStart - ISO date string (YYYY-MM-DD) for the subscription period being charged
   * @param today - ISO date string (YYYY-MM-DD) for today
   * @param amount - Charge amount in CLP (from PRO_MONTHLY_PRICE env var)
   * @param attempt - Current attempt number (1-based)
   * @param existingRecordId - Numeric ID of existing failed payment record to update (if retrying)
   */
  private async chargeUser(
    user: ProUser,
    periodStart: string,
    today: string,
    amount: number,
    attempt: number,
    existingRecordId?: number
  ): Promise<void> {
    const todayCompact = today.replace(/-/g, "");
    const parentBuyOrder = `pro-${user.id}-${todayCompact}`;
    const childBuyOrder = `c-${user.id}-${todayCompact}-${attempt}`;

    const oneclickService = new OneclickService();
    const result = await oneclickService.authorizeCharge(
      user.documentId,
      user.tbk_user,
      amount,
      parentBuyOrder,
      childBuyOrder
    );

    // Alias for subscription-payment entity service calls — bypasses unregistered content type
    const subPaymentCreate = strapi.entityService.create as (
      uid: string,
      params: { data: Record<string, unknown> }
    ) => Promise<unknown>;
    const subPaymentUpdate = strapi.entityService.update as (
      uid: string,
      id: number,
      params: { data: Record<string, unknown> }
    ) => Promise<unknown>;

    if (result.success) {
      if (existingRecordId) {
        // Update existing failed record to approved
        await subPaymentUpdate(
          "api::subscription-payment.subscription-payment",
          existingRecordId,
          {
            data: {
              status: "approved",
              authorization_code: result.authorizationCode,
              response_code: result.responseCode,
              payment_response: result.rawResponse,
              charged_at: new Date(),
              charge_attempts: attempt,
            },
          }
        );
      } else {
        // Create new approved payment record
        await subPaymentCreate(
          "api::subscription-payment.subscription-payment",
          {
            data: {
              user: user.id,
              amount,
              status: "approved",
              parent_buy_order: parentBuyOrder,
              child_buy_order: childBuyOrder,
              authorization_code: result.authorizationCode,
              response_code: result.responseCode,
              payment_response: result.rawResponse,
              period_start: periodStart,
              charged_at: new Date(),
              charge_attempts: attempt,
            },
          }
        );
      }

      // Extend pro_expires_at by 30 days
      const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await strapi.entityService.update(
        "plugin::users-permissions.user",
        user.id,
        {
          data: {
            pro_expires_at: newExpiresAt,
          } as unknown as Parameters<
            typeof strapi.entityService.update
          >[2]["data"],
        }
      );

      // Create order + Facto document for this charge — reuse user's last invoice preference from checkout
      const isInvoice = Boolean(user.pro_pending_invoice ?? false);
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
        // Non-fatal: charge was successful, order creation failure must not block pro_expires_at extension
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
        await subPaymentUpdate(
          "api::subscription-payment.subscription-payment",
          existingRecordId,
          {
            data: {
              charge_attempts: attempt,
              next_charge_attempt: nextRetryDateStr,
              response_code: result.responseCode,
              payment_response: result.rawResponse,
            },
          }
        );
      } else {
        // Create new failed payment record
        await subPaymentCreate(
          "api::subscription-payment.subscription-payment",
          {
            data: {
              user: user.id,
              amount,
              status: "failed",
              parent_buy_order: parentBuyOrder,
              child_buy_order: childBuyOrder,
              response_code: result.responseCode,
              payment_response: result.rawResponse,
              period_start: periodStart,
              charge_attempts: attempt,
              next_charge_attempt: nextRetryDateStr,
            },
          }
        );
      }

      logger.info(
        `SubscriptionChargeService: charge failed for user ${user.id} (attempt ${attempt}), next retry: ${nextRetryDateStr}`
      );
    }
  }
}

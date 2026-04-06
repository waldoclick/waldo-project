import { Context } from "koa";
import adService from "../services/ad.service";
import freeAdService from "../services/free-ad.service";
import checkoutService from "../services/checkout.service";
import OrderUtils from "../utils/order.utils";
import { ProCancellationService } from "../services/pro-cancellation.service";
import { documentDetails, getCurrentUser } from "../utils/user.utils";
import {
  OneclickService,
  buildOneclickUsername,
} from "../../../services/oneclick";
import generalUtils from "../utils/general.utils";
import logger from "../../../utils/logtail";
import { IWebpayCommitData } from "../../../services/transbank/types";
import { PackType, FeaturedType } from "../types/payment.type";
import { computeSortPriority } from "../../ad/services/ad";

interface WebpayAdResult {
  success: boolean;
  ad: {
    id: number | string;
    user: { id: number | string; email?: string };
    details: { is_invoice: boolean; pack: PackType; featured: FeaturedType };
  };
  webpay: IWebpayCommitData;
  message?: string;
}

class PaymentController {
  private errorHandler = (ctx: Context, error: unknown) => {
    const e = error as { message?: string };
    ctx.status = 400;
    ctx.body = { success: false, message: e?.message };
  };

  private controllerWrapper =
    (handler: (_ctx: Context) => Promise<void>) => async (ctx: Context) => {
      try {
        await handler(ctx);
      } catch (error) {
        this.errorHandler(ctx, error);
      }
    };

  adCreate = this.controllerWrapper(async (ctx: Context) => {
    const { data } = ctx.request.body;
    const userId = ctx.state.user.id;
    const { pack, featured, is_invoice, ad } = data;

    logger.info("Iniciando creación de anuncio", {
      userId,
      pack,
      featured,
      is_invoice,
      adId: ad?.id,
    });

    const validatePayment = await adService.validatePayment(
      pack,
      featured,
      userId
    );

    if (!validatePayment.success) {
      logger.warn("Validación de pago fallida", {
        userId,
        pack,
        featured,
        error: validatePayment.message,
      });
      ctx.status = 400;
      ctx.body = validatePayment;
      return;
    }

    ad.is_paid = validatePayment.isPaymentRequired;

    logger.info("Creando anuncio", {
      userId,
      adId: ad?.id,
      isPaymentRequired: validatePayment.isPaymentRequired,
    });

    const create = await adService.create(ad, userId, {
      pack,
      featured,
      is_invoice,
    });

    if (!create) {
      logger.error("Error al crear anuncio", {
        userId,
        pack,
        featured,
        is_invoice,
      });
      ctx.status = 400;
      ctx.body = { success: false, message: "Failed to create ad" };
      return;
    }

    const adId = Number(create.ad.id);

    logger.info("Anuncio creado exitosamente", {
      userId,
      adId,
      isPaymentRequired: validatePayment.isPaymentRequired,
    });

    const payment = !validatePayment.isPaymentRequired
      ? await adService.processFreePayment(adId)
      : await adService.processPaidPayment(adId);

    if (!payment.success) {
      logger.error("Error al procesar pago", {
        userId,
        adId,
        paymentType: validatePayment.isPaymentRequired ? "paid" : "free",
        payment: payment,
      });

      // Send error to frontend
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: payment?.error?.message || "Failed to process payment",
      };
      return;
    }

    logger.info("Pago procesado exitosamente", {
      userId,
      adId,
      paymentType: validatePayment.isPaymentRequired ? "paid" : "free",
      payment: payment,
    });

    ctx.body = { data: payment };
  });

  freeAdCreate = this.controllerWrapper(async (ctx: Context) => {
    const { data } = ctx.request.body;
    const userId = ctx.state.user.id;
    const adId = Number(data?.ad_id);
    const pack = data?.pack as string;

    if (!adId) {
      ctx.status = 400;
      ctx.body = { success: false, message: "ad_id is required" };
      return;
    }

    if (pack !== "free" && pack !== "paid") {
      ctx.status = 400;
      ctx.body = { success: false, message: "pack must be 'free' or 'paid'" };
      return;
    }

    const result = await freeAdService.processFreeAd(
      adId,
      String(userId),
      pack
    );

    if (!result.success) {
      ctx.status = 400;
      ctx.body = { success: false, message: result.message };
      return;
    }

    ctx.body = { data: result };
  });

  adResponse = this.controllerWrapper(async (ctx: Context) => {
    const token = ctx.query.token_ws;
    const userId = ctx.state.user?.id || null;

    logger.info("Procesando respuesta de pago de anuncio", {
      userId,
      token: token ? "present" : "missing",
    });

    if (typeof token !== "string") {
      const cancelToken = ctx.query.TBK_TOKEN;
      const sessionId = ctx.query.TBK_ID_SESION;
      const orderNumber = ctx.query.TBK_ORDEN_COMRA;
      const redirectUrl = `${process.env.FRONTEND_URL}/anunciar/resumen`;

      logger.warn("Token de Webpay no válido, redirigiendo", {
        userId,
        cancelToken,
        sessionId,
        orderNumber,
        redirectUrl,
      });

      ctx.redirect(redirectUrl);
      return;
    }

    // Webpay Plus
    const result = (await adService.processPaidWebpay(
      token
    )) as unknown as WebpayAdResult;

    logger.info("Respuesta de Webpay procesada", {
      userId,
      token,
      result,
    });

    // Crear orden aquí
    if (!result.webpay) {
      logger.error("Respuesta de Webpay inválida", {
        userId,
        token,
        result,
      });
      ctx.redirect(`${process.env.FRONTEND_URL}/pagar/error`);
      return;
    }

    // Obtener los detalles de facturación del usuario
    const userDocumentDetails = await documentDetails(
      result.ad.user.id,
      result.ad.details.is_invoice
    );

    logger.info("Detalles de facturación obtenidos", {
      userId: result.ad.user.id,
      isInvoice: result.ad.details.is_invoice,
    });

    // Obtener detalle de compra
    const paymentDetails = await generalUtils.PaymentDetails(
      result.ad.details.pack,
      result.ad.details.featured,
      String(result.ad.user.id),
      String(result.ad.id)
    );

    // Emitir boleta o factura usando Facto
    let documentResponse;
    try {
      documentResponse = await generalUtils.generateFactoDocument({
        isInvoice: result.ad.details.is_invoice,
        userDetails: userDocumentDetails,
        items: paymentDetails.items,
      });
      logger.info("Documento Facto generado exitosamente", {
        adId: result.ad.id,
        isInvoice: result.ad.details.is_invoice,
        documentId: documentResponse?.id,
      });
    } catch (error) {
      logger.error("Error generando documento Facto", {
        adId: result.ad.id,
        error: error.message,
        stack: error.stack,
      });
    }

    // Create order
    const order = await OrderUtils.createAdOrder({
      amount: result.webpay.amount,
      buy_order: result.webpay.buy_order,
      userId: Number(result.ad.user.id),
      is_invoice: result.ad.details.is_invoice,
      payment_method: process.env.PAYMENT_GATEWAY ?? "transbank",
      payment_response: result.webpay,
      adId: Number(result.ad.id),
      document_details: userDocumentDetails,
      items: paymentDetails.items,
      document_response: documentResponse,
    });

    logger.info("Orden creada exitosamente", {
      orderId: (order?.order as { id?: unknown })?.id,
      adId: result.ad.id,
      userId: result.ad.user.id,
      amount: result.webpay.amount,
    });

    if (!result.success) {
      logger.error("Proceso de pago falló", {
        token,
        adId: result?.ad?.id,
        userId: result?.ad?.user?.id,
      });
      ctx.redirect(`${process.env.FRONTEND_URL}/pagar/error`);
    } else {
      logger.info("Proceso de pago completado exitosamente", {
        adId: result?.ad?.id,
        userId: result?.ad?.user?.id,
        orderId: (order?.order as { documentId?: string })?.documentId,
        redirectUrl: `${process.env.FRONTEND_URL}/pagar/gracias?order=${
          (order?.order as { documentId?: string })?.documentId
        }`,
      });
      ctx.redirect(
        `${process.env.FRONTEND_URL}/pagar/gracias?order=${
          (order?.order as { documentId?: string })?.documentId
        }`
      );
    }

    ctx.body = { data: result };
  });

  checkoutCreate = this.controllerWrapper(async (ctx: Context) => {
    const { data } = ctx.request.body as {
      data?: {
        pack?: string;
        ad_id?: number;
        featured?: boolean;
        is_invoice?: boolean;
      };
    };
    const userId = String(ctx.state.user.id);

    if (!data?.pack) {
      ctx.status = 400;
      ctx.body = { success: false, message: "pack is required" };
      return;
    }

    if (data.pack === "free") {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "pack must be a valid paid pack name, not 'free'",
      };
      return;
    }

    // pack === "paid" is only valid when paying for featured only (ad already has a paid reservation)
    if (data.pack === "paid" && !data.featured) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "pack 'paid' requires featured=true — nothing to pay",
      };
      return;
    }

    if (data.pack === "paid" && !data.ad_id) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "pack 'paid' requires ad_id",
      };
      return;
    }

    const result = await checkoutService.initiateCheckout(
      {
        pack: data.pack,
        ad_id: data.ad_id,
        featured: data.featured,
        is_invoice: data.is_invoice,
      },
      userId
    );

    if (!result.success) {
      ctx.status = 400;
      ctx.body = { success: false, message: result.message };
      return;
    }

    ctx.body = { data: { url: result.url, token: result.token } };
  });

  webpayResponse = this.controllerWrapper(async (ctx: Context) => {
    const token = ctx.query.token_ws;

    if (typeof token !== "string") {
      // User cancelled (Webpay sends TBK_TOKEN instead of token_ws on cancellation)
      logger.warn("Webpay checkout cancelled or invalid token", {
        tbkToken: ctx.query.TBK_TOKEN,
        sessionId: ctx.query.TBK_ID_SESION,
      });
      ctx.redirect(`${process.env.FRONTEND_URL}/pagar/error?reason=cancelled`);
      return;
    }

    const result = await checkoutService.processWebpayReturn(token);

    if (!result.success) {
      logger.error("Checkout Webpay return failed", {
        message: result.message,
      });
      ctx.redirect(`${process.env.FRONTEND_URL}/pagar/error?reason=rejected`);
      return;
    }

    // IMPORTANT: always redirect with order.documentId from Strapi — NEVER with buyOrder,
    // token, or any payment gateway reference. /pagar/gracias uses this value to call
    // useOrderById(documentId). See Payment Rules in AGENTS.md.
    if (!result.orderDocumentId) {
      logger.error("Checkout Webpay return missing orderDocumentId", {
        orderId: result.orderId,
      });
      ctx.redirect(`${process.env.FRONTEND_URL}/pagar/error?reason=rejected`);
      return;
    }

    ctx.redirect(
      `${process.env.FRONTEND_URL}/pagar/gracias?order=${result.orderDocumentId}`
    );
  });

  proCreate = this.controllerWrapper(async (ctx: Context) => {
    const user = await getCurrentUser(ctx);

    if (!user.documentId) {
      ctx.throw(500, "User documentId is missing");
      return;
    }

    const username = buildOneclickUsername(user.documentId);
    const responseUrl = `${process.env.APP_URL}/api/payments/pro-response`;

    const oneclickService = new OneclickService();
    const result = await oneclickService.startInscription(
      username,
      String(user.email),
      responseUrl
    );

    if (!result.success) {
      ctx.throw(500, "Error starting inscription");
      return;
    }

    // Store the inscription token on the user record so we can resolve the user
    // in proResponse when Transbank redirects back (no JWT present on redirect).
    // Also persist the invoice preference so proResponse can create the correct document.
    const { data: reqData } = ctx.request.body as {
      data?: { is_invoice?: boolean };
    };
    await strapi.entityService.update(
      "plugin::users-permissions.user",
      user.id,
      {
        data: {
          pro_inscription_token: String(result.token),
          pro_pending_invoice: Boolean(reqData?.is_invoice ?? false),
        } as unknown as Parameters<
          typeof strapi.entityService.update
        >[2]["data"],
      }
    );

    ctx.body = { data: { token: result.token, urlWebpay: result.urlWebpay } };
  });

  proResponse = this.controllerWrapper(async (ctx: Context) => {
    // Transbank redirects here via GET after card enrollment
    const { TBK_TOKEN } = ctx.query;

    // Cancelled case: user cancelled at Transbank — no TBK_TOKEN present
    if (!TBK_TOKEN) {
      ctx.redirect(`${process.env.FRONTEND_URL}/pro/error?reason=cancelled`);
      return;
    }

    const oneclickService = new OneclickService();
    const result = await oneclickService.finishInscription(String(TBK_TOKEN));

    // Rejected case: Transbank rejected the inscription
    if (!result.success || !result.tbkUser) {
      ctx.redirect(`${process.env.FRONTEND_URL}/pro/error?reason=rejected`);
      return;
    }

    // Resolve the user by the inscription token stored during proCreate.
    // No JWT is available here — Transbank redirects without an Authorization header.
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { pro_inscription_token: String(TBK_TOKEN) } });

    if (!user) {
      ctx.redirect(`${process.env.FRONTEND_URL}/pro/error?reason=rejected`);
      return;
    }

    // Read invoice preference stored during proCreate
    const isInvoice = Boolean(
      (user as Record<string, unknown>).pro_pending_invoice ?? false
    );

    // Success: update user record with subscription data, clear inscription token and invoice flag
    const proExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await strapi.entityService.update(
      "plugin::users-permissions.user",
      user.id,
      {
        data: {
          pro_status: "active",
          tbk_user: result.tbkUser,
          pro_card_type: result.cardType,
          pro_card_last4: result.last4CardDigits,
          pro_expires_at: proExpiresAt,
          pro_inscription_token: null,
        } as unknown as Parameters<
          typeof strapi.entityService.update
        >[2]["data"],
      }
    );

    // Create order + Facto document for the PRO inscription (non-fatal: inscription was successful)
    const proMonthlyPrice = parseInt(process.env.PRO_MONTHLY_PRICE ?? "0", 10);
    const proItems = [
      { name: "Suscripcion PRO mensual", price: proMonthlyPrice, quantity: 1 },
    ];

    let proOrder: { documentId?: string } | undefined;
    try {
      const userDocDetails = await documentDetails(user.id, isInvoice);
      const factoDoc = await generalUtils.generateFactoDocument({
        isInvoice,
        userDetails: userDocDetails,
        items: proItems,
      });
      const orderResult = await OrderUtils.createAdOrder({
        amount: proMonthlyPrice,
        buy_order: `pro-inscription-${user.id}-${Date.now()}`,
        userId: user.id,
        is_invoice: isInvoice,
        payment_method: process.env.PAYMENT_GATEWAY ?? "transbank",
        payment_response: {
          inscription: true,
          tbk_user: result.tbkUser,
          card_type: result.cardType,
        },
        document_details: userDocDetails,
        items: proItems,
        document_response: factoDoc,
      });
      if (orderResult.success && orderResult.order) {
        proOrder = orderResult.order as { documentId?: string };
      }
    } catch (orderError) {
      logger.error("proResponse: order/Facto creation failed", {
        userId: user.id,
        error: orderError,
      });
      // Non-fatal: inscription was successful
    }

    // Recalculate sort_priority for user's featured ads (pro=true changes priority from 1 to 0)
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
        "proResponse: sort_priority recalculation failed on pro activation",
        { userId: user.id, error: sortError }
      );
    }

    if (proOrder?.documentId) {
      ctx.redirect(
        `${process.env.FRONTEND_URL}/pro/pagar/gracias?order=${proOrder.documentId}`
      );
    } else {
      // Fallback: order creation failed, still redirect but to legacy page
      ctx.redirect(`${process.env.FRONTEND_URL}/pro/gracias`);
    }
  });

  proCancel = this.controllerWrapper(async (ctx: Context) => {
    const user = await getCurrentUser(ctx);

    if (!user.documentId) {
      ctx.throw(500, "User documentId is missing");
      return;
    }

    if ((user as { pro_status?: string }).pro_status !== "active") {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "User does not have an active PRO subscription",
      };
      return;
    }

    const cancellationService = new ProCancellationService();
    const result = await cancellationService.cancelSubscription(
      user.id as number,
      user.documentId
    );

    if (!result.success) {
      ctx.status = 400;
      ctx.body = { success: false, message: result.error };
      return;
    }

    ctx.body = { data: { success: true } };
  });

  thankyou = this.controllerWrapper(async (ctx: Context) => {
    const userId = ctx.state.user?.id;
    if (!userId) {
      ctx.status = 401;
      ctx.body = { success: false, message: "Unauthorized" };
      return;
    }

    const { documentId } = ctx.params;

    const order = await strapi.db.query("api::order.order").findOne({
      where: { documentId },
      populate: ["user", "ad"],
    });

    if (!order) {
      ctx.status = 404;
      ctx.body = { success: false, message: "Order not found" };
      return;
    }

    const orderRecord = order as Record<string, unknown>;
    const orderUser = orderRecord.user as Record<string, unknown> | undefined;
    if (orderUser?.id !== userId) {
      ctx.status = 403;
      ctx.body = { success: false, message: "Access denied" };
      return;
    }

    ctx.body = { data: order };
  });
}

export default new PaymentController();

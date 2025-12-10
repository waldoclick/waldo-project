import { Context } from "koa";
import adService from "../services/ad.service";
import packService from "../services/pack.service";
import OrderUtils from "../utils/order.utils";
import { ProService } from "../services/pro.service";
import { documentDetails } from "../utils/user.utils";
import generalUtils from "../utils/general.utils";
import logger from "../../../utils/logtail";

class PaymentController {
  private errorHandler = (ctx: Context, error: any) => {
    ctx.status = 400;
    ctx.body = { success: false, message: error.message };
  };

  private controllerWrapper = (handler: Function) => async (ctx: Context) => {
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
    const result = (await adService.processPaidWebpay(token)) as any;

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
      ctx.redirect(`${process.env.FRONTEND_URL}/anunciar/error`);
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
      result.ad.user.id,
      result.ad.id
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
      userId: result.ad.user.id,
      is_invoice: result.ad.details.is_invoice,
      payment_method: "webpay",
      payment_response: result.webpay,
      adId: result.ad.id,
      document_details: userDocumentDetails,
      items: paymentDetails.items,
      document_response: documentResponse,
    });

    logger.info("Orden creada exitosamente", {
      orderId: order?.order?.id,
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
      ctx.redirect(`${process.env.FRONTEND_URL}/anunciar/error`);
    } else {
      logger.info("Proceso de pago completado exitosamente", {
        adId: result?.ad?.id,
        userId: result?.ad?.user?.id,
        redirectUrl: `${process.env.FRONTEND_URL}/anunciar/gracias?ad=${result?.ad?.id}`,
      });
      ctx.redirect(
        `${process.env.FRONTEND_URL}/anunciar/gracias?ad=${result?.ad?.id}`
      );
    }

    ctx.body = { data: result };
  });

  packCreate = this.controllerWrapper(async (ctx: Context) => {
    const { data } = ctx.request.body;
    const userId = ctx.state.user.id;
    const packId = data.pack;
    const isInvoice = data.is_invoice;

    const result = await packService.packPurchase(packId, userId, isInvoice);

    ctx.body = { data: result };
  });

  packResponse = this.controllerWrapper(async (ctx: Context) => {
    const token = ctx.query.token_ws;

    if (typeof token !== "string") {
      ctx.redirect(`${process.env.FRONTEND_URL}/packs/comprar`);
      return;
    }

    const result = await packService.processPaidWebpay(token);
    console.log("result", result);

    if (!result.success) {
      ctx.redirect(`${process.env.FRONTEND_URL}/packs/error`);
    }

    // Obtener los detalles de facturación del usuario
    const userDocumentDetails = await documentDetails(
      result?.userId,
      result?.isInvoice
    );
    // console.log("userDocumentDetails", userDocumentDetails);

    const items = [
      {
        name: result?.pack?.name,
        price: result?.pack?.price,
        quantity: 1,
      },
    ];

    // Emitir boleta aquí
    const documentResponse = await generalUtils.generateFactoDocument({
      isInvoice: result?.isInvoice,
      userDetails: userDocumentDetails,
      items: items,
    });

    // Create order
    const order = await OrderUtils.createAdOrder({
      amount: result.webpay.amount,
      buy_order: result.webpay.buy_order,
      userId: Number(result?.userId),
      is_invoice: result?.isInvoice,
      payment_method: "webpay",
      payment_response: result.webpay,
      document_details: userDocumentDetails,
      items,
      document_response: documentResponse,
    });
    // console.log("order", order);

    ctx.redirect(
      `${process.env.FRONTEND_URL}/packs/gracias?pack=${result?.pack?.id}`
    );
  });

  proCreate = this.controllerWrapper(async (ctx: Context) => {
    const proService = new ProService();
    const result = await proService.createSubscription(ctx);
    ctx.body = { data: result };
  });

  proResponse = this.controllerWrapper(async (ctx: Context) => {
    const { data } = ctx.request.body;
    const userId = ctx.state.user.id;

    ctx.body = { data };
  });
}

export default new PaymentController();

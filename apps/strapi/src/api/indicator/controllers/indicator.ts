import { IndicadorService } from "../../../services/indicador/indicador.service";
import { HttpClient } from "../../../services/indicador/http-client";
import {
  Currency,
  ConversionError,
} from "../../../services/indicador/interfaces";

const SUPPORTED_CURRENCIES = ["CLP", "USD", "EUR"];

export default {
  async find(ctx) {
    try {
      const indicadorService = new IndicadorService(new HttpClient());
      const result = await indicadorService.getIndicators();

      ctx.body = {
        data: result.indicators,
        meta: {
          timestamp: result.lastUpdate,
        },
      };
    } catch (error) {
      ctx.throw(500, "An error occurred while fetching indicators");
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const indicadorService = new IndicadorService(new HttpClient());
      const indicator = await indicadorService.getIndicator(id);
      const indicators = await indicadorService.getIndicators();

      if (!indicator) {
        return ctx.notFound("Indicator not found");
      }

      ctx.body = {
        data: indicator,
        meta: {
          timestamp: indicators.lastUpdate,
        },
      };
    } catch (error) {
      ctx.throw(500, "An error occurred while fetching the indicator");
    }
  },

  async dashboardStats(ctx) {
    try {
      const [
        pending,
        published,
        archived,
        rejected,
        reservasUsadas,
        reservasLibres,
        destacadosUsados,
        destacadosLibres,
        ordenes,
        usuarios,
        categorias,
        condiciones,
        faqs,
        packs,
        regiones,
        comunas,
      ] = await Promise.all([
        // Ads by status — mirror the filters used in ad.service.ts
        strapi.db.query("api::ad.ad").count({
          where: {
            active: { $eq: false },
            banned: { $eq: false },
            rejected: { $eq: false },
            remaining_days: { $gt: 0 },
            ad_reservation: { $ne: null },
          },
        }),
        strapi.db.query("api::ad.ad").count({
          where: {
            active: { $eq: true },
            banned: { $eq: false },
            rejected: { $eq: false },
            remaining_days: { $gt: 0 },
          },
        }),
        strapi.db.query("api::ad.ad").count({
          where: {
            active: { $eq: false },
            banned: { $eq: false },
            rejected: { $eq: false },
            remaining_days: { $eq: 0 },
          },
        }),
        strapi.db.query("api::ad.ad").count({
          where: { rejected: { $eq: true } },
        }),
        // Ad reservations
        strapi.db.query("api::ad-reservation.ad-reservation").count({
          where: { ad: { $notNull: true } },
        }),
        strapi.db.query("api::ad-reservation.ad-reservation").count({
          where: { ad: { $null: true } },
        }),
        // Ad featured reservations
        strapi.db
          .query("api::ad-featured-reservation.ad-featured-reservation")
          .count({
            where: { ad: { $notNull: true } },
          }),
        strapi.db
          .query("api::ad-featured-reservation.ad-featured-reservation")
          .count({
            where: { ad: { $null: true }, price: { $eq: "0" } },
          }),
        // Standard collections
        strapi.db.query("api::order.order").count({}),
        strapi.db.query("plugin::users-permissions.user").count({}),
        strapi.db.query("api::category.category").count({}),
        strapi.db.query("api::condition.condition").count({}),
        strapi.db.query("api::faq.faq").count({}),
        strapi.db.query("api::ad-pack.ad-pack").count({}),
        strapi.db.query("api::region.region").count({}),
        strapi.db.query("api::commune.commune").count({}),
      ]);

      return ctx.send({
        data: {
          pending,
          published,
          archived,
          rejected,
          reservasUsadas,
          reservasLibres,
          destacadosUsados,
          destacadosLibres,
          ordenes,
          usuarios,
          categorias,
          condiciones,
          faqs,
          packs,
          regiones,
          comunas,
        },
      });
    } catch (error) {
      ctx.throw(500, error);
    }
  },

  async convert(ctx) {
    try {
      const { amount, from = "CLP", to = "USD" } = ctx.request.query;

      // Validate amount
      if (!amount || isNaN(Number(amount))) {
        return ctx.badRequest("Amount must be a valid number");
      }

      // Validate currencies
      if (!SUPPORTED_CURRENCIES.includes(from)) {
        return ctx.badRequest(
          `Currency '${from}' is not supported. Supported currencies are: ${SUPPORTED_CURRENCIES.join(
            ", "
          )}`
        );
      }

      if (!SUPPORTED_CURRENCIES.includes(to)) {
        return ctx.badRequest(
          `Currency '${to}' is not supported. Supported currencies are: ${SUPPORTED_CURRENCIES.join(
            ", "
          )}`
        );
      }

      const indicadorService = new IndicadorService(new HttpClient());
      const convertedAmount = await indicadorService.convert(
        Number(amount),
        from as Currency,
        to as Currency
      );
      const indicators = await indicadorService.getIndicators();

      ctx.body = {
        data: {
          amount: Number(amount),
          from,
          to,
          result: Number(convertedAmount.toFixed(2)),
        },
        meta: {
          timestamp: indicators.lastUpdate,
        },
      };
    } catch (error) {
      if (error instanceof ConversionError) {
        return ctx.badRequest(error.message);
      }
      ctx.throw(500, "An error occurred during currency conversion");
    }
  },
};

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

/**
 * order controller
 */

import { factories } from "@strapi/strapi";
import { QueryParams } from "../types";

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async me(ctx) {
      try {
        // Validar que el usuario esté autenticado
        if (!ctx.state.user || !ctx.state.user.id) {
          return ctx.unauthorized(
            "Debes estar autenticado para ver tus pedidos."
          );
        }

        // Obtener el ID del usuario actual
        const userId = ctx.state.user.id;

        // Extraer parámetros de la query
        const {
          filters = {},
          pagination = {},
          sort = [{ createdAt: "desc" }],
          populate = "*",
        } = ctx.query as QueryParams;

        // Validar y convertir parámetros de paginación
        const page = parseInt(pagination.page, 10) || 1;
        const pageSize = parseInt(pagination.pageSize, 10) || 10;

        if (page <= 0 || pageSize <= 0) {
          return ctx.badRequest(
            "Invalid pagination parameters. Page and pageSize must be positive integers."
          );
        }

        // Construir filtros
        const filterClause = {
          user: userId,
          ...(typeof filters === "object" ? filters : {}),
        };

        // Obtener órdenes del usuario con paginación
        const orders = await strapi.entityService.findMany("api::order.order", {
          filters: filterClause,
          populate,
          start: (page - 1) * pageSize,
          limit: pageSize,
          sort,
        });

        // Obtener el total de registros
        const total = await strapi.entityService.count("api::order.order", {
          filters: filterClause,
        });

        // Retornar las órdenes con la información de paginación
        return ctx.send({
          data: orders,
          meta: {
            pagination: {
              page,
              pageSize,
              pageCount: Math.ceil(total / pageSize),
              total,
            },
          },
        });
      } catch (error) {
        return ctx.internalServerError("Internal server error");
      }
    },
  })
);

/**
 * order controller
 */

import { factories } from "@strapi/strapi";
import { QueryParams } from "../types";

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async find(ctx) {
      try {
        const { query } = ctx;

        // Extraer parámetros de paginación
        const pagination = query.pagination as any;
        const page = parseInt(pagination?.page || "1", 10);
        const pageSize = parseInt(pagination?.pageSize || "25", 10);

        // Construir filtros
        const filters = query.filters || {};

        // Transformar sort de string a objeto (formato compatible con Strapi v5)
        let sort: any = { createdAt: "desc" };
        if (query.sort) {
          if (typeof query.sort === "string") {
            const [field, direction] = query.sort.split(":");
            const sortDirection = direction ? direction.toLowerCase() : "desc";
            sort = { [field]: sortDirection };
          } else if (
            typeof query.sort === "object" &&
            !Array.isArray(query.sort)
          ) {
            sort = query.sort;
          } else if (Array.isArray(query.sort) && query.sort.length > 0) {
            // Si viene como array, tomar el primer elemento
            const firstSort = query.sort[0];
            if (typeof firstSort === "object") {
              sort = firstSort;
            }
          }
        }

        // Manejar populate: si viene como objeto (populate[user]=true), convertirlo a formato correcto
        let populate: any = "*";
        if (query.populate) {
          if (typeof query.populate === "string") {
            populate = query.populate;
          } else if (typeof query.populate === "object") {
            // Si viene como objeto, usar "*" para evitar filtros implícitos
            populate = "*";
          }
        }

        // Obtener órdenes con paginación
        const orders = await strapi.entityService.findMany("api::order.order", {
          filters,
          populate,
          start: (page - 1) * pageSize,
          limit: pageSize,
          sort,
        });

        // Obtener el total de registros
        const total = await strapi.entityService.count("api::order.order", {
          filters,
        });

        // Calcular paginación
        const pageCount = Math.ceil(total / pageSize);

        return ctx.send({
          data: orders,
          meta: {
            pagination: {
              page,
              pageSize,
              pageCount,
              total,
            },
          },
        });
      } catch (error) {
        ctx.throw(500, error);
      }
    },

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

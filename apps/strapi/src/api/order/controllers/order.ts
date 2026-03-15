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
          filters: filters as unknown as Parameters<
            typeof strapi.entityService.findMany
          >[1]["filters"],
          populate,
          start: (page - 1) * pageSize,
          limit: pageSize,
          sort,
        });

        // Obtener el total de registros
        const total = await strapi.entityService.count("api::order.order", {
          filters: filters as unknown as Parameters<
            typeof strapi.entityService.count
          >[1]["filters"],
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
          filters: filterClause as unknown as Parameters<
            typeof strapi.entityService.findMany
          >[1]["filters"],
          populate: populate as unknown as Parameters<
            typeof strapi.entityService.findMany
          >[1]["populate"],
          start: (page - 1) * pageSize,
          limit: pageSize,
          sort: sort as unknown as Parameters<
            typeof strapi.entityService.findMany
          >[1]["sort"],
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

    async salesByMonth(ctx) {
      try {
        const year =
          parseInt(ctx.query.year as string, 10) || new Date().getFullYear();

        // Fetch all orders for the requested year in a single query.
        // Filter by year using a date range: from Jan 1 to Dec 31 of the year.
        const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);

        const orders = await strapi.entityService.findMany("api::order.order", {
          filters: {
            createdAt: {
              $gte: startDate.toISOString(),
              $lt: endDate.toISOString(),
            },
          } as any,
          fields: ["amount", "createdAt"],
          limit: -1, // fetch all matching orders without pagination
        });

        // Aggregate on the server: sum amount per month (0-indexed months 0-11)
        const monthlyTotals: Record<number, number> = {};
        for (let i = 0; i < 12; i++) monthlyTotals[i] = 0;

        for (const order of orders as any[]) {
          const date = new Date(order.createdAt as string);
          const month = date.getUTCMonth();
          const amount =
            typeof order.amount === "string"
              ? Number.parseFloat(order.amount as string)
              : (order.amount as number) || 0;
          monthlyTotals[month] = (monthlyTotals[month] || 0) + amount;
        }

        // Build response: array of { month (0-11), total }
        const data = Object.entries(monthlyTotals).map(([month, total]) => ({
          month: Number.parseInt(month),
          total,
        }));

        return ctx.send({ data, meta: { year } });
      } catch (error) {
        ctx.throw(500, error);
      }
    },

    async findOne(ctx: any) {
      try {
        const documentId = ctx.params.documentId ?? ctx.params.id;
        if (!documentId) {
          return ctx.badRequest("Missing order identifier");
        }
        const numericId = Number(documentId);
        const isNumericId =
          Number.isInteger(numericId) &&
          numericId > 0 &&
          String(numericId) === String(documentId);

        let order;
        if (isNumericId) {
          order = await strapi.db.query("api::order.order").findOne({
            where: { id: numericId },
            populate: ["user", "ad"],
          });
        } else {
          order = await strapi.documents("api::order.order").findOne({
            documentId,
            populate: ["user", "ad"],
          });
        }
        if (!order) {
          return ctx.notFound("Order not found");
        }
        return ctx.send({ data: order });
      } catch (error) {
        ctx.throw(500, error);
      }
    },
  })
);

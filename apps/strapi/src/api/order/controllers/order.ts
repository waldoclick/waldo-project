/**
 * order controller
 */

import { factories } from "@strapi/strapi";
import type { Context } from "koa";
import { QueryParams } from "../types";

interface StrapiOrder {
  createdAt: string;
  amount: string | number;
}

interface ExportOrder {
  id: number;
  amount: string | number;
  payment_method: string;
  is_invoice: boolean;
  createdAt: string;
  user?: { username?: string; email?: string };
  ad?: { name?: string } | null;
}

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async find(ctx) {
      try {
        const { query } = ctx;

        // Extraer parámetros de paginación
        const pagination = query.pagination as Record<string, string>;
        const page = parseInt(pagination?.page || "1", 10);
        const pageSize = parseInt(pagination?.pageSize || "25", 10);

        // Construir filtros
        const filters = query.filters || {};

        // Transformar sort de string a objeto (formato compatible con Strapi v5)
        let sort: Record<string, unknown> = { createdAt: "desc" };
        if (query.sort) {
          if (typeof query.sort === "string") {
            const [field, direction] = query.sort.split(":");
            const sortDirection = direction ? direction.toLowerCase() : "desc";
            sort = { [field]: sortDirection };
          } else if (
            typeof query.sort === "object" &&
            !Array.isArray(query.sort)
          ) {
            sort = query.sort as Record<string, unknown>;
          } else if (Array.isArray(query.sort) && query.sort.length > 0) {
            const firstSort = query.sort[0];
            if (typeof firstSort === "string" && firstSort.includes(":")) {
              const [f, d] = firstSort.split(":");
              sort = { [f]: d.toLowerCase() };
            } else if (firstSort && typeof firstSort === "object") {
              sort = firstSort;
            }
          }
        }

        // Normalize populate: db.query requires true or object, never array, "*", or string.
        // qs.stringify encodes arrays as bracket notation (populate[0]=user&populate[1]=ad)
        // which Strapi parses back as { '0': 'user', '1': 'ad' } — not a JS array.
        let populate: true | Record<string, unknown>;
        const rawPopulate = query.populate;
        if (!rawPopulate || rawPopulate === "*") {
          populate = true;
        } else if (typeof rawPopulate === "string") {
          populate = { [rawPopulate]: true };
        } else if (Array.isArray(rawPopulate)) {
          populate = (rawPopulate as string[]).reduce((acc, key) => {
            acc[key] = true;
            return acc;
          }, {} as Record<string, unknown>);
        } else if (typeof rawPopulate === "object") {
          const keys = Object.keys(rawPopulate as object);
          const isArrayLike =
            keys.length > 0 && keys.every((k) => /^\d+$/.test(k));
          if (isArrayLike) {
            // { '0': 'user', '1': 'ad' } → { user: true, ad: true }
            populate = Object.values(
              rawPopulate as Record<string, string>
            ).reduce((acc, key) => {
              acc[key] = true;
              return acc;
            }, {} as Record<string, unknown>);
          } else {
            populate = rawPopulate as Record<string, unknown>;
          }
        } else {
          populate = true;
        }

        // Obtener órdenes con paginación
        const orders = await strapi.db.query("api::order.order").findMany({
          where: filters,
          populate,
          offset: (page - 1) * pageSize,
          limit: pageSize,
          orderBy: sort,
        });

        // Obtener el total de registros
        const total = await strapi.db.query("api::order.order").count({
          where: filters,
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
          populate: populateParam = "*",
        } = ctx.query as QueryParams;

        // Validar y convertir parámetros de paginación
        const page = parseInt(pagination.page, 10) || 1;
        const pageSize = parseInt(pagination.pageSize, 10) || 10;

        if (page <= 0 || pageSize <= 0) {
          return ctx.badRequest(
            "Invalid pagination parameters. Page and pageSize must be positive integers."
          );
        }

        // Normalize populate: db.query requires true (not "*") for all relations
        const populate =
          !populateParam || populateParam === "*" ? true : populateParam;

        // Construir filtros
        const filterClause = {
          user: userId,
          ...(typeof filters === "object" ? filters : {}),
        };

        // Obtener órdenes del usuario con paginación
        const orders = await strapi.db.query("api::order.order").findMany({
          where: filterClause,
          populate: populate as unknown as Record<string, unknown>,
          offset: (page - 1) * pageSize,
          limit: pageSize,
          orderBy: sort,
        });

        // Obtener el total de registros
        const total = await strapi.db.query("api::order.order").count({
          where: filterClause,
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

        const orders = await strapi.db.query("api::order.order").findMany({
          where: {
            createdAt: {
              $gte: startDate.toISOString(),
              $lt: endDate.toISOString(),
            },
          },
          select: ["amount", "createdAt"],
          limit: -1, // fetch all matching orders without pagination
        });

        // Aggregate on the server: sum amount per month (0-indexed months 0-11)
        const monthlyTotals: Record<number, number> = {};
        for (let i = 0; i < 12; i++) monthlyTotals[i] = 0;

        for (const order of orders as unknown as StrapiOrder[]) {
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

    async exportCsv(ctx: Context) {
      try {
        const { _q, sort: sortParam } = ctx.query as {
          _q?: string;
          sort?: string;
        };

        let sort: Record<string, string> = { createdAt: "desc" };
        if (sortParam) {
          const [field, direction] = sortParam.split(":");
          sort = { [field]: direction?.toLowerCase() ?? "desc" };
        }

        let filters: Record<string, unknown> = {};
        if (_q) {
          const numericId = parseInt(_q, 10);
          const idFilter = !isNaN(numericId) ? { id: { $eq: numericId } } : {};
          filters = {
            $or: [
              ...(Object.keys(idFilter).length ? [idFilter] : []),
              { user: { username: { $containsi: _q } } },
              { ad: { name: { $containsi: _q } } },
              { buy_order: { $containsi: _q } },
            ],
          };
        }

        const orders = await strapi.db.query("api::order.order").findMany({
          where: filters,
          populate: ["user", "ad"] as unknown as Record<string, unknown>,
          limit: -1,
          orderBy: sort,
        });

        const rows = (orders as unknown as ExportOrder[]).map((o) => [
          String(o.id),
          o.user?.username ?? "",
          o.user?.email ?? "",
          o.ad?.name ?? "",
          String(o.amount),
          o.payment_method ?? "",
          o.is_invoice ? "Factura" : "Boleta",
          o.createdAt,
        ]);

        const headers = [
          "ID",
          "Cliente",
          "Email",
          "Anuncio",
          "Monto",
          "Método de Pago",
          "Tipo",
          "Fecha",
        ];
        const csv = [headers, ...rows]
          .map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
          )
          .join("\r\n");

        ctx.set("Content-Type", "text/csv; charset=utf-8");
        ctx.set("Content-Disposition", 'attachment; filename="orders.csv"');
        ctx.body = csv;
      } catch (error) {
        ctx.throw(500, error);
      }
    },

    async findOne(ctx: Context) {
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

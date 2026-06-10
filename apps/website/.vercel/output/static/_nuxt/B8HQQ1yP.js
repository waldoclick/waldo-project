import {
  aZ as g,
  a_ as n,
  a$ as d,
  bf as a,
  bC as v,
  b0 as u,
  b6 as y,
  bi as c,
  b7 as l,
  cQ as h,
  cN as w,
  bn as $,
  bo as C,
  b1 as k,
  bs as O,
  b5 as x,
  bK as S,
  ba as D,
  bu as L,
  bw as N,
  b8 as _,
} from "./BK8sApmn.js";
import { F as P } from "./VyYn0hw8.js";
import { E as A } from "./27XRtptg.js";
try {
  let e =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    o = new e.Error().stack;
  o &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[o] = "ad1a2c83-4578-4d78-951c-798622f7e05c"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-ad1a2c83-4578-4d78-951c-798622f7e05c"));
} catch {}
const z = { class: "card card--order" },
  E = { class: "card--order__header" },
  F = { class: "card--order__document-type" },
  B = { class: "card--order__title" },
  I = { class: "card--order__date" },
  T = { class: "card--order__content" },
  V = { class: "card--order__amount" },
  U = ["href"],
  j = g({
    __name: "CardOrder",
    props: { order: {} },
    setup(e) {
      const o = (s) =>
          new Date(s).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        t = (s) => {
          const r = typeof s == "string" ? Number.parseFloat(s) : s;
          return new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
          }).format(r);
        };
      return (s, r) => (
        n(),
        d("article", z, [
          a("div", E, [
            a("div", F, [
              a(
                "div",
                {
                  class: v([
                    "card--order__document-type__badge",
                    { "is-invoice": e.order.is_invoice },
                  ]),
                },
                [
                  u(y(P), {
                    size: 16,
                    class: "card--order__document-type__icon",
                  }),
                  a(
                    "span",
                    null,
                    c(e.order.is_invoice ? "Factura" : "Boleta"),
                    1,
                  ),
                ],
                2,
              ),
            ]),
            a("div", B, "Orden #" + c(e.order.id), 1),
            a("div", I, c(o(e.order.createdAt)), 1),
          ]),
          a("div", T, [
            a("div", V, c(t(e.order.amount)), 1),
            e.order.document_response?.return?.enlaces?.dte_pdf
              ? (n(),
                d(
                  "a",
                  {
                    key: 0,
                    href: e.order.document_response.return.enlaces.dte_pdf,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    class: "card--order__link btn btn--announcement",
                  },
                  " Ver documento ",
                  8,
                  U,
                ))
              : l("", !0),
          ]),
        ])
      );
    },
  }),
  M = Object.assign(j, { __name: "CardOrder" }),
  q = { class: "account account--orders", "aria-labelledby": "orders-title" },
  H = { class: "account--orders__subtitle" },
  K = { class: "account--orders__list" },
  Q = { class: "account--orders__list__items" },
  W = { key: 0, class: "account--orders__loading", "aria-live": "polite" },
  X = { key: 1, class: "account--orders__list__items__wrapper" },
  Z = { key: 0, class: "account--orders__list__items__paginate" },
  G = { class: "paginate", "aria-label": "Paginación" },
  J = { key: 2, class: "account--orders__list__items__emptystate" },
  R = g({
    __name: "AccountOrders",
    props: {
      orders: {},
      currentPage: {},
      pagination: {},
      isLoading: { type: Boolean },
      introText: {},
    },
    emits: ["page-change"],
    setup(e) {
      return (o, t) => {
        const s = h("vue-awesome-paginate");
        return (
          n(),
          d("section", q, [
            t[3] ||
              (t[3] = a(
                "h2",
                { id: "orders-title", class: "account--orders__title title" },
                "Mis órdenes",
                -1,
              )),
            a("div", H, c(e.introText), 1),
            a("div", K, [
              a("div", Q, [
                e.isLoading
                  ? (n(),
                    d("div", W, [
                      t[1] ||
                        (t[1] = a(
                          "div",
                          { class: "account--orders__list__items__sr-only" },
                          " Cargando órdenes ",
                          -1,
                        )),
                      u(w),
                    ]))
                  : l("", !0),
                !e.isLoading && e.orders.length > 0
                  ? (n(),
                    d("div", X, [
                      (n(!0),
                      d(
                        $,
                        null,
                        C(
                          e.orders,
                          (r) => (
                            n(),
                            x(M, { key: r.id, order: r }, null, 8, ["order"])
                          ),
                        ),
                        128,
                      )),
                      e.pagination.total > e.pagination.pageSize
                        ? (n(),
                          d("div", Z, [
                            a("div", G, [
                              u(
                                s,
                                {
                                  "model-value": e.currentPage,
                                  "total-items": e.pagination.total,
                                  "items-per-page": e.pagination.pageSize,
                                  "max-pages-shown": 5,
                                  "onUpdate:modelValue":
                                    t[0] ||
                                    (t[0] = (r) => o.$emit("page-change", r)),
                                },
                                null,
                                8,
                                [
                                  "model-value",
                                  "total-items",
                                  "items-per-page",
                                ],
                              ),
                            ]),
                          ]))
                        : l("", !0),
                    ]))
                  : l("", !0),
                !e.isLoading && e.orders.length === 0
                  ? (n(),
                    d("div", J, [
                      u(A, null, {
                        message: k(() => [
                          ...(t[2] || (t[2] = [O(" No hay órdenes ", -1)])),
                        ]),
                        _: 1,
                      }),
                    ]))
                  : l("", !0),
              ]),
            ]),
          ])
        );
      };
    },
  }),
  Y = Object.assign(R, { __name: "AccountOrders" }),
  ee = { class: "page" },
  ne = g({
    __name: "mis-ordenes",
    setup(e) {
      const o = _([]),
        t = _(1),
        s = _({ total: 0, pageSize: 10 }),
        r = _(!1),
        p = S(),
        m = async () => {
          r.value = !0;
          try {
            const i = await p.loadUserOrders(
              {},
              { page: t.value, pageSize: s.value.pageSize },
              ["createdAt:desc"],
            );
            i &&
              ((o.value = i.data), (s.value.total = i.meta.pagination.total));
          } catch {
          } finally {
            r.value = !1;
          }
        },
        f = (i) => {
          ((t.value = i), m());
        };
      D(async () => {
        await m();
      }, "$Og7ErX6sUF");
      const { $setSEO: b } = L();
      return (
        b({
          title: "Mis Órdenes",
          description: "Consulta el historial de tus órdenes en Waldo.click®.",
        }),
        N({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        (i, te) => (
          n(),
          d("section", ee, [
            u(
              Y,
              {
                "intro-text":
                  "Aquí podrás ver tus órdenes de compra, revisar su estado y dar seguimiento a tus pagos.",
                orders: o.value,
                "current-page": t.value,
                pagination: s.value,
                "is-loading": r.value,
                onPageChange: f,
              },
              null,
              8,
              ["orders", "current-page", "pagination", "is-loading"],
            ),
          ])
        )
      );
    },
  });
export { ne as default };
//# sourceMappingURL=B8HQQ1yP.js.map

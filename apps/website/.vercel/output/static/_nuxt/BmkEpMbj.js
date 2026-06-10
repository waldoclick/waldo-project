import { _ as L } from "./vgLiQXkW.js";
import { u as z, _ as N, a as R } from "./Bn4ou5Ry.js";
import { _ as U, a as j } from "./BbtmlxJr.js";
import { _ as H } from "./D9c01Ql2.js";
import {
  bD as q,
  aZ as F,
  b3 as M,
  be as G,
  a_ as v,
  a$ as k,
  bf as h,
  b0 as t,
  b6 as s,
  b1 as o,
  bn as Z,
  bo as J,
  b5 as K,
  bs as m,
  bi as f,
  br as Q,
  b7 as W,
  b9 as T,
  b8 as O,
  bk as X,
} from "./BK8sApmn.js";
import { _ as Y } from "./C4RpNa5i.js";
import { _ as ee } from "./BSFPidNw.js";
import { f as te } from "./DFEPOiSh.js";
import { g as ae } from "./b4AISZcu.js";
import { f as oe } from "./CjIigZ6h.js";
import { E as se } from "./DvfQSOKW.js";
import "./CNKn_OHC.js";
import "./DmUMncXv.js";
import "./Cwrq1rl2.js";
try {
  let l =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    e = new l.Error().stack;
  e &&
    ((l._sentryDebugIds = l._sentryDebugIds || {}),
    (l._sentryDebugIds[e] = "745459bb-5253-4ae6-a36e-d164d860fce6"),
    (l._sentryDebugIdIdentifier =
      "sentry-dbid-745459bb-5253-4ae6-a36e-d164d860fce6"));
} catch {}
const ne = q("download", [
    ["path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", key: "ih7n3h" }],
    ["polyline", { points: "7 10 12 15 17 10", key: "2ggqvy" }],
    ["line", { x1: "12", x2: "12", y1: "15", y2: "3", key: "1vk2je" }],
  ]),
  re = { class: "orders orders--default" },
  le = { class: "orders--default__container" },
  ce = { class: "orders--default__header" },
  ie = { class: "orders--default__table-wrapper" },
  de = { key: 0, class: "orders--default__empty" },
  B = "orders",
  ue = F({
    __name: "OrdersDefault",
    setup(l) {
      const e = z(),
        b = M(),
        u = T(() => e.getOrdersFilters),
        y = (n) => {
          e.setFilters(B, n);
        },
        c = O([]),
        _ = O(!1),
        i = O(null),
        $ = async () => {
          try {
            _.value = !0;
            const n = e.orders,
              [d, E] = n.sortBy.split(":"),
              w = {
                pagination: { page: n.currentPage, pageSize: n.pageSize },
                sort: `${d}:${E}`,
                populate: ["user", "ad"],
              };
            n.searchTerm &&
              (w.filters = {
                $or: [
                  { user: { username: { $containsi: n.searchTerm } } },
                  { ad: { name: { $containsi: n.searchTerm } } },
                  { buy_order: { $containsi: n.searchTerm } },
                ],
              });
            const r = await b("orders", { method: "GET", params: w });
            c.value = Array.isArray(r.data) ? r.data : [];
            const g = r.meta?.pagination,
              S = g?.total ?? 0,
              D = n.pageSize,
              A = g?.pageCount ?? (Math.ceil(S / D) || 1);
            i.value = {
              page: g?.page ?? 1,
              pageSize: D,
              pageCount: A,
              total: S,
            };
          } catch {
            ((c.value = []), (i.value = null));
          } finally {
            _.value = !1;
          }
        },
        x = T(() => c.value),
        C = T(() => i.value?.pageCount ?? 0),
        p = T(() => i.value?.total ?? 0);
      G(
        [
          () => e.orders.searchTerm,
          () => e.orders.sortBy,
          () => e.orders.pageSize,
          () => e.orders.currentPage,
        ],
        () => {
          $();
        },
        { immediate: !0 },
      );
      const P = [
          { label: "Orden" },
          { label: "Cliente" },
          { label: "Anuncio" },
          { label: "Monto" },
          { label: "Método de Pago" },
          { label: "Tipo" },
          { label: "Fecha" },
          { label: "Acciones", align: "right" },
        ],
        I = [
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "amount:asc", label: "Monto menor" },
          { value: "amount:desc", label: "Monto mayor" },
        ];
      return (n, d) => {
        const E = N,
          w = R,
          r = j,
          g = H,
          S = Q,
          D = U,
          A = Y,
          V = ee;
        return (
          v(),
          k("section", re, [
            h("div", le, [
              h("div", ce, [
                t(
                  E,
                  {
                    "model-value": s(e).orders.searchTerm,
                    placeholder: "Buscar órdenes...",
                    class: "orders--default__search",
                    "onUpdate:modelValue":
                      d[0] || (d[0] = (a) => s(e).setSearchTerm(B, a)),
                  },
                  null,
                  8,
                  ["model-value"],
                ),
                t(
                  w,
                  {
                    "model-value": u.value,
                    "sort-options": I,
                    "page-sizes": [10, 25, 50, 100],
                    class: "orders--default__filters",
                    "onUpdate:modelValue": y,
                  },
                  null,
                  8,
                  ["model-value"],
                ),
              ]),
              h("div", ie, [
                t(
                  A,
                  { columns: P },
                  {
                    default: o(() => [
                      (v(!0),
                      k(
                        Z,
                        null,
                        J(
                          x.value,
                          (a) => (
                            v(),
                            K(
                              D,
                              { key: a.documentId ?? a.id },
                              {
                                default: o(() => [
                                  t(
                                    r,
                                    null,
                                    { default: o(() => [m(f(a.id), 1)]), _: 2 },
                                    1024,
                                  ),
                                  t(
                                    r,
                                    null,
                                    {
                                      default: o(() => [
                                        m(f(a.user?.username || "-"), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  t(
                                    r,
                                    null,
                                    {
                                      default: o(() => [
                                        m(f(a.ad?.name || "-"), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  t(
                                    r,
                                    null,
                                    {
                                      default: o(() => [
                                        m(f(s(te)(a.amount)), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  t(
                                    r,
                                    null,
                                    {
                                      default: o(() => [
                                        t(
                                          g,
                                          null,
                                          {
                                            default: o(() => [
                                              m(f(s(ae)(a.payment_method)), 1),
                                            ]),
                                            _: 2,
                                          },
                                          1024,
                                        ),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  t(
                                    r,
                                    null,
                                    {
                                      default: o(() => [
                                        t(
                                          g,
                                          {
                                            variant: a.is_invoice
                                              ? "default"
                                              : "outline",
                                          },
                                          {
                                            default: o(() => [
                                              m(
                                                f(
                                                  a.is_invoice
                                                    ? "Factura"
                                                    : "Boleta",
                                                ),
                                                1,
                                              ),
                                            ]),
                                            _: 2,
                                          },
                                          1032,
                                          ["variant"],
                                        ),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  t(
                                    r,
                                    null,
                                    {
                                      default: o(() => [
                                        m(f(s(oe)(a.createdAt)), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  t(
                                    r,
                                    { align: "right" },
                                    {
                                      default: o(() => [
                                        t(
                                          S,
                                          {
                                            class: "orders--default__action",
                                            title: "Ver orden",
                                            to: `/dashboard/orders/${a.id}`,
                                          },
                                          {
                                            default: o(() => [
                                              t(s(se), {
                                                class:
                                                  "orders--default__action__icon",
                                              }),
                                            ]),
                                            _: 1,
                                          },
                                          8,
                                          ["to"],
                                        ),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                ]),
                                _: 2,
                              },
                              1024,
                            )
                          ),
                        ),
                        128,
                      )),
                    ]),
                    _: 1,
                  },
                ),
                x.value.length === 0 && !_.value
                  ? (v(),
                    k("div", de, [
                      ...(d[2] ||
                        (d[2] = [
                          h("p", null, "No se encontraron órdenes", -1),
                        ])),
                    ]))
                  : W("", !0),
              ]),
              t(
                V,
                {
                  "current-page": s(e).orders.currentPage,
                  "total-pages": C.value,
                  "total-records": p.value,
                  "page-size": s(e).orders.pageSize,
                  class: "orders--default__pagination",
                  onPageChange:
                    d[1] || (d[1] = (a) => s(e).setCurrentPage(B, a)),
                },
                null,
                8,
                ["current-page", "total-pages", "total-records", "page-size"],
              ),
            ]),
          ])
        );
      };
    },
  }),
  _e = Object.assign(ue, { __name: "OrdersDefault" });
function pe() {
  const l = M(),
    { Swal: e } = X(),
    b = z(),
    u = O(!1);
  async function y() {
    u.value = !0;
    try {
      const { searchTerm: c, sortBy: _ } = b.orders,
        i = { sort: _ };
      c && (i._q = c);
      const $ = await l("orders/export-csv", { method: "GET", params: i }),
        x = new Blob(["\uFEFF" + $], { type: "text/csv;charset=utf-8;" }),
        C = URL.createObjectURL(x),
        p = document.createElement("a");
      (p.setAttribute("href", C),
        p.setAttribute(
          "download",
          `orders-${new Date().toISOString().slice(0, 10)}.csv`,
        ),
        document.body.appendChild(p),
        p.click(),
        document.body.removeChild(p),
        URL.revokeObjectURL(C));
    } catch {
      await e.fire("Error", "No se pudieron exportar las órdenes.", "error");
    } finally {
      u.value = !1;
    }
  }
  return { exportOrders: y, isExporting: u };
}
const me = ["disabled"],
  $e = F({
    __name: "index",
    setup(l) {
      const e = [{ label: "Órdenes" }],
        { exportOrders: b, isExporting: u } = pe();
      return (y, c) => {
        const _ = L;
        return (
          v(),
          k("div", null, [
            t(
              _,
              { title: "Órdenes", breadcrumbs: e },
              {
                actions: o(() => [
                  h(
                    "button",
                    {
                      class: "btn btn--outline",
                      disabled: s(u),
                      title: "Exportar CSV",
                      onClick: c[0] || (c[0] = (...i) => s(b) && s(b)(...i)),
                    },
                    [t(s(ne), { size: 16 })],
                    8,
                    me,
                  ),
                ]),
                _: 1,
              },
            ),
            t(_e),
          ])
        );
      };
    },
  });
export { $e as default };
//# sourceMappingURL=BmkEpMbj.js.map

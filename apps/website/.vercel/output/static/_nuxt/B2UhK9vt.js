import { _ as U } from "./vgLiQXkW.js";
import { u as H, _ as O, a as Z } from "./Bn4ou5Ry.js";
import { _ as j, a as G } from "./BbtmlxJr.js";
import { _ as L } from "./D9c01Ql2.js";
import { _ as q } from "./C4RpNa5i.js";
import { _ as J } from "./BSFPidNw.js";
import {
  aZ as S,
  b3 as K,
  bb as Q,
  be as W,
  a_ as d,
  a$ as _,
  bf as u,
  b0 as s,
  b6 as r,
  b1 as o,
  bn as X,
  bo as Y,
  b5 as ee,
  bs as p,
  bi as c,
  b7 as x,
  b9 as g,
  b8 as h,
} from "./BK8sApmn.js";
import { f as v } from "./CjIigZ6h.js";
import { f as te } from "./DFEPOiSh.js";
import { E as se } from "./DvfQSOKW.js";
import "./CNKn_OHC.js";
import "./DmUMncXv.js";
import "./Cwrq1rl2.js";
try {
  let i =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    e = new i.Error().stack;
  e &&
    ((i._sentryDebugIds = i._sentryDebugIds || {}),
    (i._sentryDebugIds[e] = "055604c8-dfd7-4e2b-91ed-1a157a643e3b"),
    (i._sentryDebugIdIdentifier =
      "sentry-dbid-055604c8-dfd7-4e2b-91ed-1a157a643e3b"));
} catch {}
const ae = { class: "subscription-payments subscription-payments--default" },
  ne = { class: "subscription-payments--default__container" },
  oe = { class: "subscription-payments--default__header" },
  re = { class: "subscription-payments--default__table-wrapper" },
  ie = { class: "subscription-payments--default__email" },
  le = { class: "subscription-payments--default__actions" },
  ue = ["onClick"],
  ce = { key: 0, class: "subscription-payments--default__empty" },
  pe = { key: 1, class: "subscription-payments--default__loading" },
  P = "subscriptionPayments",
  de = S({
    __name: "SubscriptionPaymentsDefault",
    setup(i) {
      const e = H(),
        C = g(() => e.getSubscriptionPaymentsFilters),
        D = (n) => {
          e.setFilters(P, n);
        },
        f = (n) =>
          n === "approved"
            ? "default"
            : n === "failed"
              ? "secondary"
              : "outline",
        T = K(),
        m = h([]),
        b = h(!1),
        y = h(null),
        w = async () => {
          try {
            b.value = !0;
            const n = {
              pagination: {
                page: e.subscriptionPayments.currentPage,
                pageSize: e.subscriptionPayments.pageSize,
              },
              sort: e.subscriptionPayments.sortBy,
              populate: { user: { fields: ["email", "username"] } },
            };
            e.subscriptionPayments.searchTerm &&
              (n.filters = {
                $or: [
                  {
                    user: {
                      email: { $containsi: e.subscriptionPayments.searchTerm },
                    },
                  },
                  {
                    parent_buy_order: {
                      $containsi: e.subscriptionPayments.searchTerm,
                    },
                  },
                  {
                    child_buy_order: {
                      $containsi: e.subscriptionPayments.searchTerm,
                    },
                  },
                ],
              });
            const a = await T("subscription-payments", {
              method: "GET",
              params: n,
            });
            ((m.value = Array.isArray(a.data) ? a.data : []),
              (y.value = a.meta?.pagination || null));
          } catch {
            m.value = [];
          } finally {
            b.value = !1;
          }
        },
        I = g(() => y.value?.pageCount || 1),
        $ = g(() => y.value?.total || 0),
        k = [
          { label: "ID" },
          { label: "Usuario" },
          { label: "Monto" },
          { label: "Estado" },
          { label: "Período" },
          { label: "Cobrado" },
          { label: "Intentos" },
          { label: "Acciones", align: "right" },
        ],
        V = [
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "charged_at:desc", label: "Cobrado (más reciente)" },
          { value: "amount:desc", label: "Monto mayor a menor" },
          { value: "amount:asc", label: "Monto menor a mayor" },
          { value: "status:asc", label: "Estado A-Z" },
        ],
        B = Q(),
        z = (n) => {
          B.push(`/dashboard/users/subscription-payments/${n}`);
        };
      return (
        W(
          [
            () => e.subscriptionPayments.searchTerm,
            () => e.subscriptionPayments.sortBy,
            () => e.subscriptionPayments.pageSize,
            () => e.subscriptionPayments.currentPage,
          ],
          () => {
            w();
          },
          { immediate: !0 },
        ),
        (n, a) => {
          const A = O,
            E = Z,
            l = G,
            M = L,
            F = j,
            N = q,
            R = J;
          return (
            d(),
            _("section", ae, [
              u("div", ne, [
                u("div", oe, [
                  s(
                    A,
                    {
                      "model-value": r(e).subscriptionPayments.searchTerm,
                      placeholder: "Buscar pagos de subscripción...",
                      class: "subscription-payments--default__search",
                      "onUpdate:modelValue":
                        a[0] || (a[0] = (t) => r(e).setSearchTerm(P, t)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  s(
                    E,
                    {
                      "model-value": C.value,
                      "sort-options": V,
                      "page-sizes": [10, 25, 50, 100],
                      class: "subscription-payments--default__filters",
                      "onUpdate:modelValue": D,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                u("div", re, [
                  s(
                    N,
                    { columns: k },
                    {
                      default: o(() => [
                        (d(!0),
                        _(
                          X,
                          null,
                          Y(
                            m.value,
                            (t) => (
                              d(),
                              ee(
                                F,
                                { key: t.id },
                                {
                                  default: o(() => [
                                    s(
                                      l,
                                      null,
                                      {
                                        default: o(() => [p(c(t.id), 1)]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    s(
                                      l,
                                      null,
                                      {
                                        default: o(() => [
                                          u(
                                            "div",
                                            ie,
                                            c(t.user?.email || "-"),
                                            1,
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    s(
                                      l,
                                      null,
                                      {
                                        default: o(() => [
                                          p(c(r(te)(t.amount)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    s(
                                      l,
                                      null,
                                      {
                                        default: o(() => [
                                          s(
                                            M,
                                            { variant: f(t.status) },
                                            {
                                              default: o(() => [
                                                p(c(t.status), 1),
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
                                    s(
                                      l,
                                      null,
                                      {
                                        default: o(() => [
                                          p(
                                            c(r(v)(t.period_start ?? void 0)) +
                                              " → " +
                                              c(r(v)(t.period_end ?? void 0)),
                                            1,
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    s(
                                      l,
                                      null,
                                      {
                                        default: o(() => [
                                          p(
                                            c(
                                              t.charged_at
                                                ? r(v)(t.charged_at)
                                                : "-",
                                            ),
                                            1,
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    s(
                                      l,
                                      null,
                                      {
                                        default: o(() => [
                                          p(c(t.charge_attempts), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    s(
                                      l,
                                      { align: "right" },
                                      {
                                        default: o(() => [
                                          u("div", le, [
                                            u(
                                              "button",
                                              {
                                                class:
                                                  "subscription-payments--default__action",
                                                title:
                                                  "Ver pago de subscripción",
                                                onClick: (me) => z(t.id),
                                              },
                                              [
                                                s(r(se), {
                                                  class:
                                                    "subscription-payments--default__action__icon",
                                                }),
                                              ],
                                              8,
                                              ue,
                                            ),
                                          ]),
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
                  m.value.length === 0 && !b.value
                    ? (d(),
                      _("div", ce, [
                        ...(a[2] ||
                          (a[2] = [
                            u(
                              "p",
                              null,
                              "No se encontraron pagos de subscripción",
                              -1,
                            ),
                          ])),
                      ]))
                    : x("", !0),
                  b.value
                    ? (d(),
                      _("div", pe, [
                        ...(a[3] ||
                          (a[3] = [
                            u(
                              "p",
                              null,
                              "Cargando pagos de subscripción...",
                              -1,
                            ),
                          ])),
                      ]))
                    : x("", !0),
                ]),
                s(
                  R,
                  {
                    "current-page": r(e).subscriptionPayments.currentPage,
                    "total-pages": I.value,
                    "total-records": $.value,
                    "page-size": r(e).subscriptionPayments.pageSize,
                    class: "subscription-payments--default__pagination",
                    onPageChange:
                      a[1] || (a[1] = (t) => r(e).setCurrentPage(P, t)),
                  },
                  null,
                  8,
                  ["current-page", "total-pages", "total-records", "page-size"],
                ),
              ]),
            ])
          );
        }
      );
    },
  }),
  _e = Object.assign(de, { __name: "SubscriptionPaymentsDefault" }),
  Ie = S({
    __name: "index",
    setup(i) {
      const e = [{ label: "Pagos de subscripción" }];
      return (C, D) => {
        const f = U;
        return (
          d(),
          _("div", null, [
            s(f, { title: "Pagos de subscripción", breadcrumbs: e }),
            s(_e),
          ])
        );
      };
    },
  });
export { Ie as default };
//# sourceMappingURL=B2UhK9vt.js.map

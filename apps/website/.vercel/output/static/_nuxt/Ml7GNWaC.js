import { _ as N } from "./vgLiQXkW.js";
import { u as E, _ as U, a as M } from "./Bn4ou5Ry.js";
import { _ as j, a as H } from "./BbtmlxJr.js";
import { _ as Z } from "./D9c01Ql2.js";
import { _ as G } from "./C4RpNa5i.js";
import { _ as L } from "./BSFPidNw.js";
import {
  aZ as x,
  b3 as q,
  bb as J,
  be as K,
  a_ as u,
  a$ as _,
  bf as i,
  b0 as t,
  b6 as l,
  b1 as a,
  bn as Q,
  bo as W,
  b5 as X,
  bs as m,
  bi as p,
  b7 as D,
  b9 as h,
  b8 as v,
} from "./BK8sApmn.js";
import { f as Y } from "./CjIigZ6h.js";
import { E as ee } from "./DvfQSOKW.js";
import "./CNKn_OHC.js";
import "./DmUMncXv.js";
import "./Cwrq1rl2.js";
try {
  let n =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    e = new n.Error().stack;
  e &&
    ((n._sentryDebugIds = n._sentryDebugIds || {}),
    (n._sentryDebugIds[e] = "9ab90a56-ccf4-4673-954f-003bb27bea19"),
    (n._sentryDebugIdIdentifier =
      "sentry-dbid-9ab90a56-ccf4-4673-954f-003bb27bea19"));
} catch {}
const se = { class: "subscription-pros subscription-pros--default" },
  te = { class: "subscription-pros--default__container" },
  oe = { class: "subscription-pros--default__header" },
  ae = { class: "subscription-pros--default__table-wrapper" },
  ne = { class: "subscription-pros--default__email" },
  re = { class: "subscription-pros--default__actions" },
  ie = ["onClick"],
  le = { key: 0, class: "subscription-pros--default__empty" },
  ce = { key: 1, class: "subscription-pros--default__loading" },
  P = "subscriptionPros",
  ue = x({
    __name: "SubscriptionProsDefault",
    setup(n) {
      const e = E(),
        y = h(() => e.getSubscriptionProsFilters),
        S = (r) => {
          e.setFilters(P, r);
        },
        f = q(),
        d = v([]),
        b = v(!1),
        g = v(null),
        C = async () => {
          try {
            b.value = !0;
            const r = {
              pagination: {
                page: e.subscriptionPros.currentPage,
                pageSize: e.subscriptionPros.pageSize,
              },
              sort: e.subscriptionPros.sortBy,
              populate: { user: { fields: ["email", "username"] } },
            };
            e.subscriptionPros.searchTerm &&
              (r.filters = {
                $or: [
                  {
                    user: {
                      email: { $containsi: e.subscriptionPros.searchTerm },
                    },
                  },
                  { card_last4: { $containsi: e.subscriptionPros.searchTerm } },
                ],
              });
            const o = await f("subscription-pros", {
              method: "GET",
              params: r,
            });
            ((d.value = Array.isArray(o.data) ? o.data : []),
              (g.value = o.meta?.pagination || null));
          } catch {
            d.value = [];
          } finally {
            b.value = !1;
          }
        },
        T = h(() => g.value?.pageCount || 1),
        w = h(() => g.value?.total || 0),
        $ = [
          { label: "ID" },
          { label: "Usuario" },
          { label: "Tarjeta" },
          { label: "Factura pendiente" },
          { label: "Fecha de creación" },
          { label: "Acciones", align: "right" },
        ],
        k = [
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "user.email:asc", label: "Usuario A-Z" },
          { value: "pending_invoice:desc", label: "Pendiente primero" },
        ],
        I = J(),
        R = (r) => {
          I.push(`/dashboard/users/subscription-pros/${r}`);
        };
      return (
        K(
          [
            () => e.subscriptionPros.searchTerm,
            () => e.subscriptionPros.sortBy,
            () => e.subscriptionPros.pageSize,
            () => e.subscriptionPros.currentPage,
          ],
          () => {
            C();
          },
          { immediate: !0 },
        ),
        (r, o) => {
          const A = U,
            B = M,
            c = H,
            O = Z,
            V = j,
            z = G,
            F = L;
          return (
            u(),
            _("section", se, [
              i("div", te, [
                i("div", oe, [
                  t(
                    A,
                    {
                      "model-value": l(e).subscriptionPros.searchTerm,
                      placeholder: "Buscar subscripciones PRO...",
                      class: "subscription-pros--default__search",
                      "onUpdate:modelValue":
                        o[0] || (o[0] = (s) => l(e).setSearchTerm(P, s)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  t(
                    B,
                    {
                      "model-value": y.value,
                      "sort-options": k,
                      "page-sizes": [10, 25, 50, 100],
                      class: "subscription-pros--default__filters",
                      "onUpdate:modelValue": S,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                i("div", ae, [
                  t(
                    z,
                    { columns: $ },
                    {
                      default: a(() => [
                        (u(!0),
                        _(
                          Q,
                          null,
                          W(
                            d.value,
                            (s) => (
                              u(),
                              X(
                                V,
                                { key: s.id },
                                {
                                  default: a(() => [
                                    t(
                                      c,
                                      null,
                                      {
                                        default: a(() => [m(p(s.id), 1)]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      c,
                                      null,
                                      {
                                        default: a(() => [
                                          i(
                                            "div",
                                            ne,
                                            p(s.user?.email || "-"),
                                            1,
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      c,
                                      null,
                                      {
                                        default: a(() => [
                                          m(
                                            p(
                                              s.card_type && s.card_last4
                                                ? `${s.card_type} ****${s.card_last4}`
                                                : "-",
                                            ),
                                            1,
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      c,
                                      null,
                                      {
                                        default: a(() => [
                                          t(
                                            O,
                                            { variant: "outline" },
                                            {
                                              default: a(() => [
                                                m(
                                                  p(
                                                    s.pending_invoice
                                                      ? "Sí"
                                                      : "No",
                                                  ),
                                                  1,
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
                                    ),
                                    t(
                                      c,
                                      null,
                                      {
                                        default: a(() => [
                                          m(p(l(Y)(s.createdAt)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      c,
                                      { align: "right" },
                                      {
                                        default: a(() => [
                                          i("div", re, [
                                            i(
                                              "button",
                                              {
                                                class:
                                                  "subscription-pros--default__action",
                                                title: "Ver subscripción PRO",
                                                onClick: (_e) => R(s.id),
                                              },
                                              [
                                                t(l(ee), {
                                                  class:
                                                    "subscription-pros--default__action__icon",
                                                }),
                                              ],
                                              8,
                                              ie,
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
                  d.value.length === 0 && !b.value
                    ? (u(),
                      _("div", le, [
                        ...(o[2] ||
                          (o[2] = [
                            i(
                              "p",
                              null,
                              "No se encontraron subscripciones PRO",
                              -1,
                            ),
                          ])),
                      ]))
                    : D("", !0),
                  b.value
                    ? (u(),
                      _("div", ce, [
                        ...(o[3] ||
                          (o[3] = [
                            i("p", null, "Cargando subscripciones PRO...", -1),
                          ])),
                      ]))
                    : D("", !0),
                ]),
                t(
                  F,
                  {
                    "current-page": l(e).subscriptionPros.currentPage,
                    "total-pages": T.value,
                    "total-records": w.value,
                    "page-size": l(e).subscriptionPros.pageSize,
                    class: "subscription-pros--default__pagination",
                    onPageChange:
                      o[1] || (o[1] = (s) => l(e).setCurrentPage(P, s)),
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
  pe = Object.assign(ue, { __name: "SubscriptionProsDefault" }),
  Ce = x({
    __name: "index",
    setup(n) {
      const e = [{ label: "Subscripciones PRO" }];
      return (y, S) => {
        const f = N;
        return (
          u(),
          _("div", null, [
            t(f, { title: "Subscripciones PRO", breadcrumbs: e }),
            t(pe),
          ])
        );
      };
    },
  });
export { Ce as default };
//# sourceMappingURL=Ml7GNWaC.js.map

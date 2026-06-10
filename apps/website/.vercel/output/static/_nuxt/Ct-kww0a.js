import {
  aZ as T,
  b3 as Z,
  bb as H,
  be as L,
  a_ as d,
  a$ as _,
  bf as s,
  b0 as t,
  b6 as l,
  b1 as c,
  bn as O,
  bo as U,
  b5 as j,
  bs as y,
  bi as h,
  c1 as G,
  b7 as w,
  b9 as f,
  b8 as v,
  br as q,
} from "./BK8sApmn.js";
import { _ as J } from "./vgLiQXkW.js";
import { u as K, _ as Q, a as W } from "./Bn4ou5Ry.js";
import { _ as X, a as Y } from "./BbtmlxJr.js";
import { _ as ee } from "./C4RpNa5i.js";
import { _ as te } from "./BSFPidNw.js";
import { f as ne } from "./CjIigZ6h.js";
import { E as oe } from "./DvfQSOKW.js";
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
    (i._sentryDebugIds[e] = "3e797529-ca3f-47bf-b784-ba791770a0e9"),
    (i._sentryDebugIdIdentifier =
      "sentry-dbid-3e797529-ca3f-47bf-b784-ba791770a0e9"));
} catch {}
const ae = { class: "conditions conditions--default" },
  se = { class: "conditions--default__container" },
  ie = { class: "conditions--default__header" },
  le = { class: "conditions--default__table-wrapper" },
  ce = { class: "conditions--default__name" },
  de = { class: "conditions--default__actions" },
  re = ["onClick"],
  _e = ["onClick"],
  ue = { key: 0, class: "conditions--default__empty" },
  me = { key: 1, class: "conditions--default__loading" },
  C = "conditions",
  pe = T({
    __name: "ConditionsDefault",
    setup(i) {
      const e = K(),
        x = f(() => e.getConditionsFilters),
        u = (o) => {
          e.setFilters(C, o);
        },
        b = Z(),
        r = v([]),
        m = v(!1),
        g = v(null),
        A = async () => {
          try {
            m.value = !0;
            const o = {
              pagination: {
                page: e.conditions.currentPage,
                pageSize: e.conditions.pageSize,
              },
              sort: e.conditions.sortBy,
            };
            e.conditions.searchTerm &&
              (o.filters = { name: { $containsi: e.conditions.searchTerm } });
            const n = await b("conditions", { method: "GET", params: o });
            ((r.value = Array.isArray(n.data) ? n.data : []),
              (g.value = n.meta?.pagination || null));
          } catch {
            r.value = [];
          } finally {
            m.value = !1;
          }
        },
        D = f(() => r.value),
        S = f(() => g.value?.pageCount || 1),
        N = f(() => g.value?.total || 0),
        P = [
          { label: "ID" },
          { label: "Nombre" },
          { label: "Fecha" },
          { label: "Acciones", align: "right" },
        ],
        $ = [
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "name:asc", label: "Nombre A-Z" },
          { value: "name:desc", label: "Nombre Z-A" },
        ],
        k = H(),
        I = (o) => {
          k.push(`/dashboard/maintenance/conditions/${o}`);
        },
        V = (o) => {
          k.push(`/dashboard/maintenance/conditions/${o}/edit`);
        };
      return (
        L(
          [
            () => e.conditions.searchTerm,
            () => e.conditions.sortBy,
            () => e.conditions.pageSize,
            () => e.conditions.currentPage,
          ],
          () => {
            A();
          },
          { immediate: !0 },
        ),
        (o, n) => {
          const z = Q,
            B = W,
            p = Y,
            E = X,
            F = ee,
            M = te;
          return (
            d(),
            _("section", ae, [
              s("div", se, [
                s("div", ie, [
                  t(
                    z,
                    {
                      "model-value": l(e).conditions.searchTerm,
                      placeholder: "Buscar condiciones...",
                      class: "conditions--default__search",
                      "onUpdate:modelValue":
                        n[0] || (n[0] = (a) => l(e).setSearchTerm(C, a)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  t(
                    B,
                    {
                      "model-value": x.value,
                      "sort-options": $,
                      "page-sizes": [10, 25, 50, 100],
                      class: "conditions--default__filters",
                      "onUpdate:modelValue": u,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                s("div", le, [
                  t(
                    F,
                    { columns: P },
                    {
                      default: c(() => [
                        (d(!0),
                        _(
                          O,
                          null,
                          U(
                            D.value,
                            (a) => (
                              d(),
                              j(
                                E,
                                { key: a.id },
                                {
                                  default: c(() => [
                                    t(
                                      p,
                                      null,
                                      {
                                        default: c(() => [y(h(a.id), 1)]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      p,
                                      null,
                                      {
                                        default: c(() => [
                                          s("div", ce, h(a.name || "-"), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      p,
                                      null,
                                      {
                                        default: c(() => [
                                          y(h(l(ne)(a.updatedAt)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      p,
                                      { align: "right" },
                                      {
                                        default: c(() => [
                                          s("div", de, [
                                            s(
                                              "button",
                                              {
                                                class:
                                                  "conditions--default__action",
                                                title: "Ver condición",
                                                onClick: (R) => I(a.documentId),
                                              },
                                              [
                                                t(l(oe), {
                                                  class:
                                                    "conditions--default__action__icon",
                                                }),
                                              ],
                                              8,
                                              re,
                                            ),
                                            s(
                                              "button",
                                              {
                                                class:
                                                  "conditions--default__action",
                                                title: "Editar condición",
                                                onClick: (R) => V(a.documentId),
                                              },
                                              [
                                                t(l(G), {
                                                  class:
                                                    "conditions--default__action__icon",
                                                }),
                                              ],
                                              8,
                                              _e,
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
                  D.value.length === 0 && !m.value
                    ? (d(),
                      _("div", ue, [
                        ...(n[2] ||
                          (n[2] = [
                            s("p", null, "No se encontraron condiciones", -1),
                          ])),
                      ]))
                    : w("", !0),
                  m.value
                    ? (d(),
                      _("div", me, [
                        ...(n[3] ||
                          (n[3] = [
                            s("p", null, "Cargando condiciones...", -1),
                          ])),
                      ]))
                    : w("", !0),
                ]),
                t(
                  M,
                  {
                    "current-page": l(e).conditions.currentPage,
                    "total-pages": S.value,
                    "total-records": N.value,
                    "page-size": l(e).conditions.pageSize,
                    class: "conditions--default__pagination",
                    onPageChange:
                      n[1] || (n[1] = (a) => l(e).setCurrentPage(C, a)),
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
  fe = Object.assign(pe, { __name: "ConditionsDefault" }),
  Ae = T({
    __name: "index",
    setup(i) {
      const e = [{ label: "Condiciones" }];
      return (x, u) => {
        const b = q,
          r = J;
        return (
          d(),
          _("div", null, [
            t(
              r,
              { title: "Condiciones", breadcrumbs: e },
              {
                actions: c(() => [
                  t(
                    b,
                    {
                      class: "btn btn--primary",
                      to: "/dashboard/maintenance/conditions/new",
                    },
                    {
                      default: c(() => [
                        ...(u[0] || (u[0] = [y(" Agregar condición ", -1)])),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                _: 1,
              },
            ),
            t(fe),
          ])
        );
      };
    },
  });
export { Ae as default };
//# sourceMappingURL=Ct-kww0a.js.map

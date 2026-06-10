import {
  aZ as w,
  b3 as Z,
  bb as H,
  be as L,
  a_ as m,
  a$ as _,
  bf as s,
  b0 as t,
  b6 as u,
  b1 as l,
  bn as O,
  bo as U,
  b5 as j,
  bs as y,
  bi as f,
  c1 as G,
  b7 as k,
  b9 as b,
  b8 as v,
  br as q,
} from "./BK8sApmn.js";
import { _ as J } from "./vgLiQXkW.js";
import { u as K, _ as Q, a as W } from "./Bn4ou5Ry.js";
import { _ as X, a as Y } from "./BbtmlxJr.js";
import { _ as ee } from "./C4RpNa5i.js";
import { _ as te } from "./BSFPidNw.js";
import { f as ae } from "./CjIigZ6h.js";
import { E as ne } from "./DvfQSOKW.js";
import "./CNKn_OHC.js";
import "./DmUMncXv.js";
import "./Cwrq1rl2.js";
try {
  let c =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    e = new c.Error().stack;
  e &&
    ((c._sentryDebugIds = c._sentryDebugIds || {}),
    (c._sentryDebugIds[e] = "fe1e8982-aa44-4034-a8c0-50529d7df9b3"),
    (c._sentryDebugIdIdentifier =
      "sentry-dbid-fe1e8982-aa44-4034-a8c0-50529d7df9b3"));
} catch {}
const oe = { class: "communes communes--default" },
  se = { class: "communes--default__container" },
  le = { class: "communes--default__header" },
  ce = { class: "communes--default__table-wrapper" },
  ue = { class: "communes--default__name" },
  me = { class: "communes--default__region" },
  re = { class: "communes--default__actions" },
  ie = ["onClick"],
  _e = ["onClick"],
  de = { key: 0, class: "communes--default__empty" },
  pe = { key: 1, class: "communes--default__loading" },
  C = "communes",
  fe = w({
    __name: "CommunesDefault",
    setup(c) {
      const e = K(),
        x = b(() => e.getCommunesFilters),
        d = (o) => {
          e.setFilters(C, o);
        },
        g = Z(),
        r = v([]),
        p = v(!1),
        h = v(null),
        $ = async () => {
          try {
            p.value = !0;
            const o = {
              pagination: {
                page: e.communes.currentPage,
                pageSize: e.communes.pageSize,
              },
              sort: e.communes.sortBy,
              populate: ["region"],
            };
            e.communes.searchTerm &&
              (o.filters = {
                $or: [
                  { name: { $containsi: e.communes.searchTerm } },
                  { "region.name": { $containsi: e.communes.searchTerm } },
                ],
              });
            const a = await g("communes", { method: "GET", params: o });
            ((r.value = Array.isArray(a.data) ? a.data : []),
              (h.value = a.meta?.pagination || null));
          } catch {
            r.value = [];
          } finally {
            p.value = !1;
          }
        },
        D = b(() => r.value),
        A = b(() => h.value?.pageCount || 1),
        S = b(() => h.value?.total || 0),
        N = [
          { label: "ID" },
          { label: "Nombre" },
          { label: "Región" },
          { label: "Fecha" },
          { label: "Acciones", align: "right" },
        ],
        P = [
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "name:asc", label: "Nombre A-Z" },
          { value: "name:desc", label: "Nombre Z-A" },
        ],
        T = H(),
        I = (o) => {
          T.push(`/dashboard/maintenance/communes/${o}`);
        },
        V = (o) => {
          T.push(`/dashboard/maintenance/communes/${o}/edit`);
        };
      return (
        L(
          [
            () => e.communes.searchTerm,
            () => e.communes.sortBy,
            () => e.communes.pageSize,
            () => e.communes.currentPage,
          ],
          () => {
            $();
          },
          { immediate: !0 },
        ),
        (o, a) => {
          const z = Q,
            B = W,
            i = Y,
            E = X,
            F = ee,
            R = te;
          return (
            m(),
            _("section", oe, [
              s("div", se, [
                s("div", le, [
                  t(
                    z,
                    {
                      "model-value": u(e).communes.searchTerm,
                      placeholder: "Buscar comunas...",
                      class: "communes--default__search",
                      "onUpdate:modelValue":
                        a[0] || (a[0] = (n) => u(e).setSearchTerm(C, n)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  t(
                    B,
                    {
                      "model-value": x.value,
                      "sort-options": P,
                      "page-sizes": [10, 25, 50, 100],
                      class: "communes--default__filters",
                      "onUpdate:modelValue": d,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                s("div", ce, [
                  t(
                    F,
                    { columns: N },
                    {
                      default: l(() => [
                        (m(!0),
                        _(
                          O,
                          null,
                          U(
                            D.value,
                            (n) => (
                              m(),
                              j(
                                E,
                                { key: n.id },
                                {
                                  default: l(() => [
                                    t(
                                      i,
                                      null,
                                      {
                                        default: l(() => [y(f(n.id), 1)]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      i,
                                      null,
                                      {
                                        default: l(() => [
                                          s("div", ue, f(n.name || "-"), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      i,
                                      null,
                                      {
                                        default: l(() => [
                                          s(
                                            "div",
                                            me,
                                            f(n.region?.name || "-"),
                                            1,
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      i,
                                      null,
                                      {
                                        default: l(() => [
                                          y(f(u(ae)(n.updatedAt)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      i,
                                      { align: "right" },
                                      {
                                        default: l(() => [
                                          s("div", re, [
                                            s(
                                              "button",
                                              {
                                                class:
                                                  "communes--default__action",
                                                title: "Ver comuna",
                                                onClick: (M) => I(n.documentId),
                                              },
                                              [
                                                t(u(ne), {
                                                  class:
                                                    "communes--default__action__icon",
                                                }),
                                              ],
                                              8,
                                              ie,
                                            ),
                                            s(
                                              "button",
                                              {
                                                class:
                                                  "communes--default__action",
                                                title: "Editar comuna",
                                                onClick: (M) => V(n.documentId),
                                              },
                                              [
                                                t(u(G), {
                                                  class:
                                                    "communes--default__action__icon",
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
                  D.value.length === 0 && !p.value
                    ? (m(),
                      _("div", de, [
                        ...(a[2] ||
                          (a[2] = [
                            s("p", null, "No se encontraron comunas", -1),
                          ])),
                      ]))
                    : k("", !0),
                  p.value
                    ? (m(),
                      _("div", pe, [
                        ...(a[3] ||
                          (a[3] = [s("p", null, "Cargando comunas...", -1)])),
                      ]))
                    : k("", !0),
                ]),
                t(
                  R,
                  {
                    "current-page": u(e).communes.currentPage,
                    "total-pages": A.value,
                    "total-records": S.value,
                    "page-size": u(e).communes.pageSize,
                    class: "communes--default__pagination",
                    onPageChange:
                      a[1] || (a[1] = (n) => u(e).setCurrentPage(C, n)),
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
  be = Object.assign(fe, { __name: "CommunesDefault" }),
  Ae = w({
    __name: "index",
    setup(c) {
      const e = [{ label: "Comunas" }];
      return (x, d) => {
        const g = q,
          r = J;
        return (
          m(),
          _("div", null, [
            t(
              r,
              { title: "Comunas", breadcrumbs: e },
              {
                actions: l(() => [
                  t(
                    g,
                    {
                      class: "btn btn--primary",
                      to: "/dashboard/maintenance/communes/new",
                    },
                    {
                      default: l(() => [
                        ...(d[0] || (d[0] = [y(" Agregar comuna ", -1)])),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                _: 1,
              },
            ),
            t(be),
          ])
        );
      };
    },
  });
export { Ae as default };
//# sourceMappingURL=DktBxRUX.js.map

import {
  aZ as T,
  b3 as L,
  bb as O,
  be as U,
  a_ as c,
  a$ as g,
  bf as l,
  b0 as t,
  b6 as i,
  b1 as s,
  bn as j,
  bo as G,
  b5 as q,
  bs as b,
  bi as d,
  c1 as J,
  b7 as w,
  b9 as f,
  b8 as y,
  br as K,
} from "./BK8sApmn.js";
import { _ as Q } from "./vgLiQXkW.js";
import { u as W, _ as X, a as Y } from "./Bn4ou5Ry.js";
import { _ as ee, a as te } from "./BbtmlxJr.js";
import { _ as ne } from "./D9c01Ql2.js";
import { _ as ae } from "./C4RpNa5i.js";
import { _ as oe } from "./BSFPidNw.js";
import { f as se } from "./CjIigZ6h.js";
import { E as le } from "./DvfQSOKW.js";
import "./CNKn_OHC.js";
import "./DmUMncXv.js";
import "./Cwrq1rl2.js";
try {
  let r =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    e = new r.Error().stack;
  e &&
    ((r._sentryDebugIds = r._sentryDebugIds || {}),
    (r._sentryDebugIds[e] = "5409732d-4fda-4b74-b67f-9c7ca6f40d9c"),
    (r._sentryDebugIdIdentifier =
      "sentry-dbid-5409732d-4fda-4b74-b67f-9c7ca6f40d9c"));
} catch {}
const re = { class: "regions regions--default" },
  ie = { class: "regions--default__container" },
  ce = { class: "regions--default__header" },
  ue = { class: "regions--default__table-wrapper" },
  _e = { class: "regions--default__name" },
  de = { class: "regions--default__actions" },
  ge = ["onClick"],
  me = ["onClick"],
  pe = { key: 0, class: "regions--default__empty" },
  fe = { key: 1, class: "regions--default__loading" },
  C = "regions",
  be = T({
    __name: "RegionsDefault",
    setup(r) {
      const e = W(),
        x = f(() => e.getRegionsFilters),
        m = (n) => {
          e.setFilters(C, n);
        },
        h = L(),
        u = y([]),
        p = y(!1),
        v = y(null),
        A = async () => {
          try {
            p.value = !0;
            const n = {
              pagination: {
                page: e.regions.currentPage,
                pageSize: e.regions.pageSize,
              },
              sort: e.regions.sortBy,
              populate: ["communes"],
            };
            e.regions.searchTerm &&
              (n.filters = { name: { $containsi: e.regions.searchTerm } });
            const a = await h("regions", { method: "GET", params: n });
            ((u.value = Array.isArray(a.data) ? a.data : []),
              (v.value = a.meta?.pagination || null));
          } catch {
            u.value = [];
          } finally {
            p.value = !1;
          }
        },
        D = f(() => u.value),
        S = f(() => v.value?.pageCount || 1),
        $ = f(() => v.value?.total || 0),
        N = [
          { label: "ID" },
          { label: "Nombre" },
          { label: "Comunas" },
          { label: "Fecha" },
          { label: "Acciones", align: "right" },
        ],
        P = [
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "name:asc", label: "Nombre A-Z" },
          { value: "name:desc", label: "Nombre Z-A" },
        ],
        R = (n) => n.communes?.length || 0,
        k = O(),
        B = (n) => {
          k.push(`/dashboard/maintenance/regions/${n}`);
        },
        I = (n) => {
          k.push(`/dashboard/maintenance/regions/${n}/edit`);
        };
      return (
        U(
          [
            () => e.regions.searchTerm,
            () => e.regions.sortBy,
            () => e.regions.pageSize,
            () => e.regions.currentPage,
          ],
          () => {
            A();
          },
          { immediate: !0 },
        ),
        (n, a) => {
          const V = X,
            z = Y,
            _ = te,
            E = ne,
            F = ee,
            M = ae,
            Z = oe;
          return (
            c(),
            g("section", re, [
              l("div", ie, [
                l("div", ce, [
                  t(
                    V,
                    {
                      "model-value": i(e).regions.searchTerm,
                      placeholder: "Buscar regiones...",
                      class: "regions--default__search",
                      "onUpdate:modelValue":
                        a[0] || (a[0] = (o) => i(e).setSearchTerm(C, o)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  t(
                    z,
                    {
                      "model-value": x.value,
                      "sort-options": P,
                      "page-sizes": [10, 25, 50, 100],
                      class: "regions--default__filters",
                      "onUpdate:modelValue": m,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                l("div", ue, [
                  t(
                    M,
                    { columns: N },
                    {
                      default: s(() => [
                        (c(!0),
                        g(
                          j,
                          null,
                          G(
                            D.value,
                            (o) => (
                              c(),
                              q(
                                F,
                                { key: o.id },
                                {
                                  default: s(() => [
                                    t(
                                      _,
                                      null,
                                      {
                                        default: s(() => [b(d(o.id), 1)]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      _,
                                      null,
                                      {
                                        default: s(() => [
                                          l("div", _e, d(o.name || "-"), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      _,
                                      null,
                                      {
                                        default: s(() => [
                                          t(
                                            E,
                                            { variant: "outline" },
                                            {
                                              default: s(() => [
                                                b(
                                                  d(R(o)) +
                                                    " comuna" +
                                                    d(R(o) !== 1 ? "s" : ""),
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
                                      _,
                                      null,
                                      {
                                        default: s(() => [
                                          b(d(i(se)(o.updatedAt)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      _,
                                      { align: "right" },
                                      {
                                        default: s(() => [
                                          l("div", de, [
                                            l(
                                              "button",
                                              {
                                                class:
                                                  "regions--default__action",
                                                title: "Ver región",
                                                onClick: (H) => B(o.documentId),
                                              },
                                              [
                                                t(i(le), {
                                                  class:
                                                    "regions--default__action__icon",
                                                }),
                                              ],
                                              8,
                                              ge,
                                            ),
                                            l(
                                              "button",
                                              {
                                                class:
                                                  "regions--default__action",
                                                title: "Editar región",
                                                onClick: (H) => I(o.documentId),
                                              },
                                              [
                                                t(i(J), {
                                                  class:
                                                    "regions--default__action__icon",
                                                }),
                                              ],
                                              8,
                                              me,
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
                    ? (c(),
                      g("div", pe, [
                        ...(a[2] ||
                          (a[2] = [
                            l("p", null, "No se encontraron regiones", -1),
                          ])),
                      ]))
                    : w("", !0),
                  p.value
                    ? (c(),
                      g("div", fe, [
                        ...(a[3] ||
                          (a[3] = [l("p", null, "Cargando regiones...", -1)])),
                      ]))
                    : w("", !0),
                ]),
                t(
                  Z,
                  {
                    "current-page": i(e).regions.currentPage,
                    "total-pages": S.value,
                    "total-records": $.value,
                    "page-size": i(e).regions.pageSize,
                    class: "regions--default__pagination",
                    onPageChange:
                      a[1] || (a[1] = (o) => i(e).setCurrentPage(C, o)),
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
  he = Object.assign(be, { __name: "RegionsDefault" }),
  Ne = T({
    __name: "index",
    setup(r) {
      const e = [{ label: "Regiones" }];
      return (x, m) => {
        const h = K,
          u = Q;
        return (
          c(),
          g("div", null, [
            t(
              u,
              { title: "Regiones", breadcrumbs: e },
              {
                actions: s(() => [
                  t(
                    h,
                    {
                      class: "btn btn--primary",
                      to: "/dashboard/maintenance/regions/new",
                    },
                    {
                      default: s(() => [
                        ...(m[0] || (m[0] = [b(" Agregar región ", -1)])),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                _: 1,
              },
            ),
            t(he),
          ])
        );
      };
    },
  });
export { Ne as default };
//# sourceMappingURL=CnI5twdo.js.map

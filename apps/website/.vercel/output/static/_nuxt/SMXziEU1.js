import {
  aZ as I,
  b3 as O,
  bb as U,
  be as j,
  a_ as u,
  a$ as d,
  bf as n,
  b0 as t,
  b6 as i,
  b1 as r,
  bn as q,
  bo as J,
  b5 as K,
  bs as y,
  bi as _,
  bH as Q,
  b7 as A,
  c1 as W,
  b9 as v,
  b8 as C,
  br as X,
} from "./BK8sApmn.js";
import { _ as Y } from "./vgLiQXkW.js";
import { u as ee, _ as te, a as ae } from "./Bn4ou5Ry.js";
import { _ as oe, a as se } from "./BbtmlxJr.js";
import { _ as ne } from "./D9c01Ql2.js";
import { _ as re } from "./C4RpNa5i.js";
import { _ as le } from "./BSFPidNw.js";
import { f as ce } from "./CjIigZ6h.js";
import { E as ie } from "./DvfQSOKW.js";
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
    (c._sentryDebugIds[e] = "fc7b5361-62e2-45df-90d5-f4cf62fb3c76"),
    (c._sentryDebugIdIdentifier =
      "sentry-dbid-fc7b5361-62e2-45df-90d5-f4cf62fb3c76"));
} catch {}
const ue = { class: "categories categories--default" },
  _e = { class: "categories--default__container" },
  de = { class: "categories--default__header" },
  ge = { class: "categories--default__table-wrapper" },
  me = { class: "categories--default__name" },
  fe = { class: "categories--default__color" },
  pe = { class: "categories--default__actions" },
  be = ["onClick"],
  he = ["onClick"],
  ve = { key: 0, class: "categories--default__empty" },
  Ce = { key: 1, class: "categories--default__loading" },
  k = "categories",
  ye = I({
    __name: "CategoriesDefault",
    setup(c) {
      const e = ee(),
        w = v(() => e.getCategoriesFilters),
        m = (a) => {
          e.setFilters(k, a);
        },
        f = O(),
        g = C([]),
        T = C({}),
        p = C(!1),
        x = C(null),
        N = async () => {
          try {
            p.value = !0;
            const a = {
              pagination: {
                page: e.categories.currentPage,
                pageSize: e.categories.pageSize,
              },
              sort: e.categories.sortBy,
            };
            e.categories.searchTerm &&
              (a.filters = { name: { $containsi: e.categories.searchTerm } });
            const s = await f("categories", { method: "GET", params: a });
            ((g.value = Array.isArray(s.data) ? s.data : []),
              (x.value = s.meta?.pagination || null));
            const b = await f("categories/ad-counts", { method: "GET" }),
              D = Array.isArray(b.data) ? b.data : [],
              l = {};
            for (const h of D) l[h.categoryId] = h.count;
            T.value = l;
          } catch {
            g.value = [];
          } finally {
            p.value = !1;
          }
        },
        S = (a) => T.value[a] || 0,
        $ = v(() => g.value),
        P = v(() => x.value?.pageCount || 1),
        z = v(() => x.value?.total || 0),
        E = [
          { label: "ID" },
          { label: "Nombre" },
          { label: "Color" },
          { label: "Anuncios" },
          { label: "Fecha" },
          { label: "Acciones", align: "right" },
        ],
        F = [
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "name:asc", label: "Nombre A-Z" },
          { value: "name:desc", label: "Nombre Z-A" },
        ],
        B = U(),
        V = (a) => {
          B.push(`/dashboard/maintenance/categories/${a}`);
        },
        H = (a) => {
          B.push(`/dashboard/maintenance/categories/${a}/edit`);
        },
        R = (a) => (a ? /^#([\dA-Fa-f]{3}|[\dA-Fa-f]{6})$/.test(a.trim()) : !1);
      return (
        j(
          [
            () => e.categories.searchTerm,
            () => e.categories.sortBy,
            () => e.categories.pageSize,
            () => e.categories.currentPage,
          ],
          () => {
            N();
          },
          { immediate: !0 },
        ),
        (a, s) => {
          const b = te,
            D = ae,
            l = se,
            h = ne,
            M = oe,
            Z = re,
            G = le;
          return (
            u(),
            d("section", ue, [
              n("div", _e, [
                n("div", de, [
                  t(
                    b,
                    {
                      "model-value": i(e).categories.searchTerm,
                      placeholder: "Buscar categorías...",
                      class: "categories--default__search",
                      "onUpdate:modelValue":
                        s[0] || (s[0] = (o) => i(e).setSearchTerm(k, o)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  t(
                    D,
                    {
                      "model-value": w.value,
                      "sort-options": F,
                      "page-sizes": [10, 25, 50, 100],
                      class: "categories--default__filters",
                      "onUpdate:modelValue": m,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                n("div", ge, [
                  t(
                    Z,
                    { columns: E },
                    {
                      default: r(() => [
                        (u(!0),
                        d(
                          q,
                          null,
                          J(
                            $.value,
                            (o) => (
                              u(),
                              K(
                                M,
                                { key: o.id },
                                {
                                  default: r(() => [
                                    t(
                                      l,
                                      null,
                                      {
                                        default: r(() => [y(_(o.id), 1)]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      l,
                                      null,
                                      {
                                        default: r(() => [
                                          n("div", me, _(o.name || "-"), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      l,
                                      null,
                                      {
                                        default: r(() => [
                                          n("div", fe, [
                                            R(o.color)
                                              ? (u(),
                                                d(
                                                  "span",
                                                  {
                                                    key: 0,
                                                    class:
                                                      "categories--default__color__dot",
                                                    style: Q({
                                                      backgroundColor: o.color,
                                                    }),
                                                  },
                                                  null,
                                                  4,
                                                ))
                                              : A("", !0),
                                            n(
                                              "span",
                                              null,
                                              _(o.color || "-"),
                                              1,
                                            ),
                                          ]),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      l,
                                      null,
                                      {
                                        default: r(() => [
                                          t(
                                            h,
                                            { variant: "outline" },
                                            {
                                              default: r(() => [
                                                y(
                                                  _(S(o.id)) +
                                                    " aviso" +
                                                    _(S(o.id) !== 1 ? "s" : ""),
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
                                      l,
                                      null,
                                      {
                                        default: r(() => [
                                          y(_(i(ce)(o.updatedAt)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      l,
                                      { align: "right" },
                                      {
                                        default: r(() => [
                                          n("div", pe, [
                                            n(
                                              "button",
                                              {
                                                class:
                                                  "categories--default__action",
                                                title: "Ver categoría",
                                                onClick: (L) => V(o.documentId),
                                              },
                                              [
                                                t(i(ie), {
                                                  class:
                                                    "categories--default__action__icon",
                                                }),
                                              ],
                                              8,
                                              be,
                                            ),
                                            n(
                                              "button",
                                              {
                                                class:
                                                  "categories--default__action",
                                                title: "Editar categoría",
                                                onClick: (L) => H(o.documentId),
                                              },
                                              [
                                                t(i(W), {
                                                  class:
                                                    "categories--default__action__icon",
                                                }),
                                              ],
                                              8,
                                              he,
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
                  $.value.length === 0 && !p.value
                    ? (u(),
                      d("div", ve, [
                        ...(s[2] ||
                          (s[2] = [
                            n("p", null, "No se encontraron categorías", -1),
                          ])),
                      ]))
                    : A("", !0),
                  p.value
                    ? (u(),
                      d("div", Ce, [
                        ...(s[3] ||
                          (s[3] = [
                            n("p", null, "Cargando categorías...", -1),
                          ])),
                      ]))
                    : A("", !0),
                ]),
                t(
                  G,
                  {
                    "current-page": i(e).categories.currentPage,
                    "total-pages": P.value,
                    "total-records": z.value,
                    "page-size": i(e).categories.pageSize,
                    class: "categories--default__pagination",
                    onPageChange:
                      s[1] || (s[1] = (o) => i(e).setCurrentPage(k, o)),
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
  xe = Object.assign(ye, { __name: "CategoriesDefault" }),
  Ee = I({
    __name: "index",
    setup(c) {
      const e = [{ label: "Categorías" }];
      return (w, m) => {
        const f = X,
          g = Y;
        return (
          u(),
          d("div", null, [
            t(
              g,
              { title: "Categorías", breadcrumbs: e },
              {
                actions: r(() => [
                  t(
                    f,
                    {
                      class: "btn btn--primary",
                      to: "/dashboard/maintenance/categories/new",
                    },
                    {
                      default: r(() => [
                        ...(m[0] || (m[0] = [y(" Agregar categoría ", -1)])),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                _: 1,
              },
            ),
            t(xe),
          ])
        );
      };
    },
  });
export { Ee as default };
//# sourceMappingURL=SMXziEU1.js.map

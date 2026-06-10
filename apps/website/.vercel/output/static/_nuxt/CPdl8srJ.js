import { _ as U } from "./vgLiQXkW.js";
import { _ as G } from "./C0-eRrjO.js";
import { u as L, _ as M, a as O } from "./Bn4ou5Ry.js";
import { _ as Z, a as H } from "./BbtmlxJr.js";
import { _ as j } from "./C4RpNa5i.js";
import { _ as q } from "./BSFPidNw.js";
import {
  aZ as k,
  b3 as J,
  bb as K,
  be as Q,
  a_ as _,
  a$ as m,
  bf as u,
  b0 as a,
  b6 as l,
  b1 as d,
  bn as W,
  bo as X,
  b5 as Y,
  bs as C,
  bi as h,
  b7 as $,
  b9 as y,
  b8 as b,
} from "./BK8sApmn.js";
import { f as ee } from "./DFEPOiSh.js";
import { f as te } from "./CjIigZ6h.js";
import { E as ae } from "./DvfQSOKW.js";
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
    i = new r.Error().stack;
  i &&
    ((r._sentryDebugIds = r._sentryDebugIds || {}),
    (r._sentryDebugIds[i] = "35d39e34-f10d-4ce8-b34b-af6d242ed6af"),
    (r._sentryDebugIdIdentifier =
      "sentry-dbid-35d39e34-f10d-4ce8-b34b-af6d242ed6af"));
} catch {}
const se = { class: "featured featured--free" },
  re = { class: "featured--free__container" },
  ne = { class: "featured--free__header" },
  oe = { class: "featured--free__table-wrapper" },
  le = { class: "featured--free__user" },
  ue = ["onClick"],
  de = { key: 0, class: "featured--free__empty" },
  ie = { key: 1, class: "featured--free__loading" },
  x = "featured",
  ce = k({
    __name: "FeaturedFree",
    setup(r, { expose: i }) {
      const e = L(),
        g = y(() => e.getFeaturedFilters),
        F = (o) => {
          e.setFilters(x, o);
        },
        D = J(),
        n = b([]),
        c = b(!1),
        f = b(null),
        v = async () => {
          try {
            c.value = !0;
            const o = {
              pagination: {
                page: e.featured.currentPage,
                pageSize: e.featured.pageSize,
              },
              sort: e.featured.sortBy,
              populate: { user: { fields: ["username"] } },
              filters: { ad: { $null: !0 }, price: { $eq: "0" } },
            };
            e.featured.searchTerm &&
              (o.filters.$or = [
                { "user.username": { $containsi: e.featured.searchTerm } },
                { "user.email": { $containsi: e.featured.searchTerm } },
              ]);
            const t = await D("ad-featured-reservations", {
              method: "GET",
              params: o,
            });
            ((n.value = Array.isArray(t.data) ? t.data : []),
              (f.value = t.meta?.pagination ? t.meta.pagination : null));
          } catch {
            n.value = [];
          } finally {
            c.value = !1;
          }
        },
        T = y(() => n.value),
        w = y(() => f.value?.pageCount || 1),
        S = y(() => f.value?.total || 0),
        A = [
          { label: "ID" },
          { label: "Usuario" },
          { label: "Precio" },
          { label: "Fecha" },
          { label: "Acciones", align: "right" },
        ],
        P = [
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "user.username:asc", label: "Usuario A-Z" },
          { value: "user.username:desc", label: "Usuario Z-A" },
        ],
        V = K(),
        z = (o) => {
          V.push(`/dashboard/featured/${o}`);
        };
      return (
        i({ refresh: v }),
        Q(
          [
            () => e.featured.searchTerm,
            () => e.featured.sortBy,
            () => e.featured.pageSize,
            () => e.featured.currentPage,
          ],
          () => {
            v();
          },
          { immediate: !0 },
        ),
        (o, t) => {
          const B = M,
            I = O,
            p = H,
            R = Z,
            E = j,
            N = q;
          return (
            _(),
            m("section", se, [
              u("div", re, [
                u("div", ne, [
                  a(
                    B,
                    {
                      "model-value": l(e).featured.searchTerm,
                      placeholder: "Buscar destacados...",
                      class: "featured--free__search",
                      "onUpdate:modelValue":
                        t[0] || (t[0] = (s) => l(e).setSearchTerm(x, s)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  a(
                    I,
                    {
                      "model-value": g.value,
                      "sort-options": P,
                      "page-sizes": [10, 25, 50, 100],
                      class: "featured--free__filters",
                      "onUpdate:modelValue": F,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                u("div", oe, [
                  a(
                    E,
                    { columns: A },
                    {
                      default: d(() => [
                        (_(!0),
                        m(
                          W,
                          null,
                          X(
                            T.value,
                            (s) => (
                              _(),
                              Y(
                                R,
                                { key: s.id },
                                {
                                  default: d(() => [
                                    a(
                                      p,
                                      null,
                                      {
                                        default: d(() => [C(h(s.id), 1)]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    a(
                                      p,
                                      null,
                                      {
                                        default: d(() => [
                                          u(
                                            "div",
                                            le,
                                            h(s.user?.username || "-"),
                                            1,
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    a(
                                      p,
                                      null,
                                      {
                                        default: d(() => [
                                          C(h(l(ee)(s.price)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    a(
                                      p,
                                      null,
                                      {
                                        default: d(() => [
                                          C(h(l(te)(s.createdAt)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    a(
                                      p,
                                      { align: "right" },
                                      {
                                        default: d(() => [
                                          u(
                                            "button",
                                            {
                                              class: "featured--free__action",
                                              title: "Ver destacado",
                                              onClick: (fe) => z(s.id),
                                            },
                                            [
                                              a(l(ae), {
                                                class:
                                                  "featured--free__action__icon",
                                              }),
                                            ],
                                            8,
                                            ue,
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
                  T.value.length === 0 && !c.value
                    ? (_(),
                      m("div", de, [
                        ...(t[2] ||
                          (t[2] = [
                            u(
                              "p",
                              null,
                              "No se encontraron destacados libres",
                              -1,
                            ),
                          ])),
                      ]))
                    : $("", !0),
                  c.value
                    ? (_(),
                      m("div", ie, [
                        ...(t[3] ||
                          (t[3] = [
                            u("p", null, "Cargando destacados...", -1),
                          ])),
                      ]))
                    : $("", !0),
                ]),
                a(
                  N,
                  {
                    "current-page": l(e).featured.currentPage,
                    "total-pages": w.value,
                    "total-records": S.value,
                    "page-size": l(e).featured.pageSize,
                    class: "featured--free__pagination",
                    onPageChange:
                      t[1] || (t[1] = (s) => l(e).setCurrentPage(x, s)),
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
  _e = Object.assign(ce, { __name: "FeaturedFree" }),
  ke = k({
    __name: "free",
    setup(r) {
      const i = [
          { label: "Destacados", to: "/dashboard/featured/free" },
          { label: "Libres" },
        ],
        e = b(!1),
        g = b(null);
      function F() {
        ((e.value = !1), g.value?.refresh());
      }
      return (D, n) => {
        const c = U,
          f = G;
        return (
          _(),
          m("div", null, [
            a(
              c,
              { title: "Libres", breadcrumbs: i },
              {
                actions: d(() => [
                  u(
                    "button",
                    {
                      class: "btn btn--primary",
                      type: "button",
                      onClick: n[0] || (n[0] = (v) => (e.value = !0)),
                    },
                    " Regalar Destacados ",
                  ),
                ]),
                _: 1,
              },
            ),
            a(_e, { ref_key: "tableRef", ref: g }, null, 512),
            a(
              f,
              {
                "is-open": e.value,
                endpoint: "ad-featured-reservations",
                label: "reservas destacadas",
                onClose: n[1] || (n[1] = (v) => (e.value = !1)),
                onGifted: F,
              },
              null,
              8,
              ["is-open"],
            ),
          ])
        );
      };
    },
  });
export { ke as default };
//# sourceMappingURL=CPdl8srJ.js.map

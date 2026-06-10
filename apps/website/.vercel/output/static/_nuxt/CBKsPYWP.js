import { _ as E } from "./vgLiQXkW.js";
import { _ as Z } from "./C0-eRrjO.js";
import { u as G, _ as M, a as O } from "./Bn4ou5Ry.js";
import { _ as H, a as L } from "./BbtmlxJr.js";
import { _ as j } from "./C4RpNa5i.js";
import { _ as q } from "./BSFPidNw.js";
import {
  aZ as $,
  b3 as J,
  bb as K,
  be as Q,
  a_ as f,
  a$ as b,
  bf as n,
  b0 as a,
  b6 as d,
  b1 as o,
  bn as W,
  bo as X,
  b5 as Y,
  bs as x,
  bi as p,
  b7 as T,
  b9 as y,
  b8 as g,
} from "./BK8sApmn.js";
import { f as ee } from "./DFEPOiSh.js";
import { f as ae } from "./CjIigZ6h.js";
import { E as te } from "./DvfQSOKW.js";
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
    (r._sentryDebugIds[i] = "8db01934-55a2-4e25-b742-58a673f84730"),
    (r._sentryDebugIdIdentifier =
      "sentry-dbid-8db01934-55a2-4e25-b742-58a673f84730"));
} catch {}
const se = { class: "featured featured--used" },
  ne = { class: "featured--used__container" },
  oe = { class: "featured--used__header" },
  re = { class: "featured--used__table-wrapper" },
  le = { class: "featured--used__user" },
  ue = { class: "featured--used__ad" },
  de = ["onClick"],
  ie = { key: 0, class: "featured--used__empty" },
  ce = { key: 1, class: "featured--used__loading" },
  A = "featured",
  _e = $({
    __name: "FeaturedUsed",
    setup(r, { expose: i }) {
      const e = G(),
        v = y(() => e.getFeaturedFilters),
        C = (u) => {
          e.setFilters(A, u);
        },
        D = J(),
        l = g([]),
        c = g(!1),
        m = g(null),
        h = async () => {
          try {
            c.value = !0;
            const u = {
              pagination: {
                page: e.featured.currentPage,
                pageSize: e.featured.pageSize,
              },
              sort: e.featured.sortBy,
              populate: {
                user: { fields: ["username"] },
                ad: { fields: ["name"] },
              },
              filters: { ad: { $notNull: !0 } },
            };
            e.featured.searchTerm &&
              (u.filters.$or = [
                { "user.username": { $containsi: e.featured.searchTerm } },
                { "user.email": { $containsi: e.featured.searchTerm } },
                { "ad.name": { $containsi: e.featured.searchTerm } },
              ]);
            const t = await D("ad-featured-reservations", {
              method: "GET",
              params: u,
            });
            ((l.value = Array.isArray(t.data) ? t.data : []),
              (m.value = t.meta?.pagination ? t.meta.pagination : null));
          } catch {
            l.value = [];
          } finally {
            c.value = !1;
          }
        },
        F = y(() => l.value),
        k = y(() => m.value?.pageCount || 1),
        w = y(() => m.value?.total || 0),
        U = [
          { label: "ID" },
          { label: "Usuario" },
          { label: "Anuncio" },
          { label: "Precio" },
          { label: "Fecha" },
          { label: "Acciones", align: "right" },
        ],
        S = [
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "user.username:asc", label: "Usuario A-Z" },
          { value: "user.username:desc", label: "Usuario Z-A" },
          { value: "ad.name:asc", label: "Anuncio A-Z" },
          { value: "ad.name:desc", label: "Anuncio Z-A" },
        ],
        P = K(),
        V = (u) => {
          P.push(`/dashboard/featured/${u}`);
        };
      return (
        i({ refresh: h }),
        Q(
          [
            () => e.featured.searchTerm,
            () => e.featured.sortBy,
            () => e.featured.pageSize,
            () => e.featured.currentPage,
          ],
          () => {
            h();
          },
          { immediate: !0 },
        ),
        (u, t) => {
          const z = M,
            B = O,
            _ = L,
            I = H,
            N = j,
            R = q;
          return (
            f(),
            b("section", se, [
              n("div", ne, [
                n("div", oe, [
                  a(
                    z,
                    {
                      "model-value": d(e).featured.searchTerm,
                      placeholder: "Buscar destacados...",
                      class: "featured--used__search",
                      "onUpdate:modelValue":
                        t[0] || (t[0] = (s) => d(e).setSearchTerm(A, s)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  a(
                    B,
                    {
                      "model-value": v.value,
                      "sort-options": S,
                      "page-sizes": [10, 25, 50, 100],
                      class: "featured--used__filters",
                      "onUpdate:modelValue": C,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                n("div", re, [
                  a(
                    N,
                    { columns: U },
                    {
                      default: o(() => [
                        (f(!0),
                        b(
                          W,
                          null,
                          X(
                            F.value,
                            (s) => (
                              f(),
                              Y(
                                I,
                                { key: s.id },
                                {
                                  default: o(() => [
                                    a(
                                      _,
                                      null,
                                      {
                                        default: o(() => [x(p(s.id), 1)]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    a(
                                      _,
                                      null,
                                      {
                                        default: o(() => [
                                          n(
                                            "div",
                                            le,
                                            p(s.user?.username || "-"),
                                            1,
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    a(
                                      _,
                                      null,
                                      {
                                        default: o(() => [
                                          n("div", ue, p(s.ad?.name || "-"), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    a(
                                      _,
                                      null,
                                      {
                                        default: o(() => [
                                          x(p(d(ee)(s.price)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    a(
                                      _,
                                      null,
                                      {
                                        default: o(() => [
                                          x(p(d(ae)(s.createdAt)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    a(
                                      _,
                                      { align: "right" },
                                      {
                                        default: o(() => [
                                          n(
                                            "button",
                                            {
                                              class: "featured--used__action",
                                              title: "Ver destacado",
                                              onClick: (me) => V(s.id),
                                            },
                                            [
                                              a(d(te), {
                                                class:
                                                  "featured--used__action__icon",
                                              }),
                                            ],
                                            8,
                                            de,
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
                  F.value.length === 0 && !c.value
                    ? (f(),
                      b("div", ie, [
                        ...(t[2] ||
                          (t[2] = [
                            n(
                              "p",
                              null,
                              "No se encontraron destacados usados",
                              -1,
                            ),
                          ])),
                      ]))
                    : T("", !0),
                  c.value
                    ? (f(),
                      b("div", ce, [
                        ...(t[3] ||
                          (t[3] = [
                            n("p", null, "Cargando destacados...", -1),
                          ])),
                      ]))
                    : T("", !0),
                ]),
                a(
                  R,
                  {
                    "current-page": d(e).featured.currentPage,
                    "total-pages": k.value,
                    "total-records": w.value,
                    "page-size": d(e).featured.pageSize,
                    class: "featured--used__pagination",
                    onPageChange:
                      t[1] || (t[1] = (s) => d(e).setCurrentPage(A, s)),
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
  fe = Object.assign(_e, { __name: "FeaturedUsed" }),
  ke = $({
    __name: "used",
    setup(r) {
      const i = [
          { label: "Destacados", to: "/dashboard/featured/free" },
          { label: "Usados" },
        ],
        e = g(!1),
        v = g(null);
      function C() {
        ((e.value = !1), v.value?.refresh());
      }
      return (D, l) => {
        const c = E,
          m = Z;
        return (
          f(),
          b("div", null, [
            a(
              c,
              { title: "Usados", breadcrumbs: i },
              {
                actions: o(() => [
                  n(
                    "button",
                    {
                      class: "btn btn--primary",
                      type: "button",
                      onClick: l[0] || (l[0] = (h) => (e.value = !0)),
                    },
                    " Regalar Destacados ",
                  ),
                ]),
                _: 1,
              },
            ),
            a(fe, { ref_key: "tableRef", ref: v }, null, 512),
            a(
              m,
              {
                "is-open": e.value,
                endpoint: "ad-featured-reservations",
                label: "reservas destacadas",
                onClose: l[1] || (l[1] = (h) => (e.value = !1)),
                onGifted: C,
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
//# sourceMappingURL=CBKsPYWP.js.map

import {
  aZ as T,
  b3 as H,
  bb as L,
  be as O,
  a_ as p,
  a$ as b,
  bf as c,
  b0 as e,
  b6 as l,
  b1 as s,
  bn as U,
  bo as j,
  b5 as G,
  bs as i,
  bi as _,
  c1 as q,
  b7 as D,
  b9 as h,
  b8 as v,
  br as J,
} from "./BK8sApmn.js";
import { _ as K } from "./vgLiQXkW.js";
import { u as Q, _ as W, a as X } from "./Bn4ou5Ry.js";
import { _ as Y, a as aa } from "./BbtmlxJr.js";
import { _ as ea } from "./D9c01Ql2.js";
import { _ as ta } from "./C4RpNa5i.js";
import { _ as sa } from "./BSFPidNw.js";
import { f as oa } from "./DFEPOiSh.js";
import { f as na } from "./CjIigZ6h.js";
import { E as ca } from "./DvfQSOKW.js";
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
    a = new r.Error().stack;
  a &&
    ((r._sentryDebugIds = r._sentryDebugIds || {}),
    (r._sentryDebugIds[a] = "15342234-ea07-4edd-b455-4032ddce359b"),
    (r._sentryDebugIdIdentifier =
      "sentry-dbid-15342234-ea07-4edd-b455-4032ddce359b"));
} catch {}
const la = { class: "packs packs--dashboard" },
  ra = { class: "packs--dashboard__container" },
  da = { class: "packs--dashboard__header" },
  _a = { class: "packs--dashboard__table-wrapper" },
  ia = { class: "packs--dashboard__name" },
  ua = { class: "packs--dashboard__actions" },
  pa = ["onClick"],
  ma = ["onClick"],
  ba = { key: 0, class: "packs--dashboard__empty" },
  fa = { key: 1, class: "packs--dashboard__loading" },
  y = "packs",
  ha = T({
    __name: "PacksDashboard",
    setup(r) {
      const a = Q(),
        P = h(() => a.getPacksFilters),
        f = (n) => {
          a.setFilters(y, n);
        },
        k = H(),
        m = v([]),
        u = v(!1),
        g = v(null),
        $ = async () => {
          try {
            u.value = !0;
            const n = {
              pagination: {
                page: a.packs.currentPage,
                pageSize: a.packs.pageSize,
              },
              sort: a.packs.sortBy,
            };
            a.packs.searchTerm &&
              (n.filters = {
                $or: [
                  { name: { $containsi: a.packs.searchTerm } },
                  { text: { $containsi: a.packs.searchTerm } },
                ],
              });
            const o = await k("ad-packs", { method: "GET", params: n });
            ((m.value = Array.isArray(o.data) ? o.data : []),
              (g.value = o.meta?.pagination || null));
          } catch {
            m.value = [];
          } finally {
            u.value = !1;
          }
        },
        x = h(() => m.value),
        w = h(() => g.value?.pageCount || 1),
        A = h(() => g.value?.total || 0),
        S = [
          { label: "ID" },
          { label: "Pack" },
          { label: "Precio" },
          { label: "Duración" },
          { label: "Anuncios" },
          { label: "Destacados" },
          { label: "Fecha de Creación" },
          { label: "Acciones", align: "right" },
        ],
        B = [
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "name:asc", label: "Nombre A-Z" },
          { value: "name:desc", label: "Nombre Z-A" },
          { value: "price:asc", label: "Precio menor a mayor" },
          { value: "price:desc", label: "Precio mayor a menor" },
        ],
        C = L(),
        I = (n) => {
          C.push(`/dashboard/maintenance/packs/${n}`);
        },
        N = (n) => {
          C.push(`/dashboard/maintenance/packs/${n}/edit`);
        };
      return (
        O(
          [
            () => a.packs.searchTerm,
            () => a.packs.sortBy,
            () => a.packs.pageSize,
            () => a.packs.currentPage,
          ],
          () => {
            $();
          },
          { immediate: !0 },
        ),
        (n, o) => {
          const V = W,
            z = X,
            d = aa,
            E = ea,
            F = Y,
            M = ta,
            R = sa;
          return (
            p(),
            b("section", la, [
              c("div", ra, [
                c("div", da, [
                  e(
                    V,
                    {
                      "model-value": l(a).packs.searchTerm,
                      placeholder: "Buscar packs...",
                      class: "packs--dashboard__search",
                      "onUpdate:modelValue":
                        o[0] || (o[0] = (t) => l(a).setSearchTerm(y, t)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  e(
                    z,
                    {
                      "model-value": P.value,
                      "sort-options": B,
                      "page-sizes": [10, 25, 50, 100],
                      class: "packs--dashboard__filters",
                      "onUpdate:modelValue": f,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                c("div", _a, [
                  e(
                    M,
                    { columns: S },
                    {
                      default: s(() => [
                        (p(!0),
                        b(
                          U,
                          null,
                          j(
                            x.value,
                            (t) => (
                              p(),
                              G(
                                F,
                                { key: t.id },
                                {
                                  default: s(() => [
                                    e(
                                      d,
                                      null,
                                      {
                                        default: s(() => [i(_(t.id), 1)]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    e(
                                      d,
                                      null,
                                      {
                                        default: s(() => [
                                          c("div", ia, _(t.name || "-"), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    e(
                                      d,
                                      null,
                                      {
                                        default: s(() => [
                                          i(_(l(oa)(t.price)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    e(
                                      d,
                                      null,
                                      {
                                        default: s(() => [
                                          i(
                                            _(t.total_days || "-") + " días",
                                            1,
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    e(
                                      d,
                                      null,
                                      {
                                        default: s(() => [
                                          e(
                                            E,
                                            { variant: "outline" },
                                            {
                                              default: s(() => [
                                                i(
                                                  _(t.total_ads || 0) +
                                                    " anuncios ",
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
                                    e(
                                      d,
                                      null,
                                      {
                                        default: s(() => [
                                          i(
                                            _(t.total_features || 0) +
                                              " destacados",
                                            1,
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    e(
                                      d,
                                      null,
                                      {
                                        default: s(() => [
                                          i(_(l(na)(t.createdAt)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    e(
                                      d,
                                      { align: "right" },
                                      {
                                        default: s(() => [
                                          c("div", ua, [
                                            c(
                                              "button",
                                              {
                                                class:
                                                  "packs--dashboard__action",
                                                title: "Ver pack",
                                                onClick: (Z) => I(t.documentId),
                                              },
                                              [
                                                e(l(ca), {
                                                  class:
                                                    "packs--dashboard__action__icon",
                                                }),
                                              ],
                                              8,
                                              pa,
                                            ),
                                            c(
                                              "button",
                                              {
                                                class:
                                                  "packs--dashboard__action",
                                                title: "Editar pack",
                                                onClick: (Z) => N(t.documentId),
                                              },
                                              [
                                                e(l(q), {
                                                  class:
                                                    "packs--dashboard__action__icon",
                                                }),
                                              ],
                                              8,
                                              ma,
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
                  x.value.length === 0 && !u.value
                    ? (p(),
                      b("div", ba, [
                        ...(o[2] ||
                          (o[2] = [
                            c("p", null, "No se encontraron packs", -1),
                          ])),
                      ]))
                    : D("", !0),
                  u.value
                    ? (p(),
                      b("div", fa, [
                        ...(o[3] ||
                          (o[3] = [c("p", null, "Cargando packs...", -1)])),
                      ]))
                    : D("", !0),
                ]),
                e(
                  R,
                  {
                    "current-page": l(a).packs.currentPage,
                    "total-pages": w.value,
                    "total-records": A.value,
                    "page-size": l(a).packs.pageSize,
                    class: "packs--dashboard__pagination",
                    onPageChange:
                      o[1] || (o[1] = (t) => l(a).setCurrentPage(y, t)),
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
  ka = Object.assign(ha, { __name: "PacksDashboard" }),
  Ia = T({
    __name: "index",
    setup(r) {
      const a = [{ label: "Packs" }];
      return (P, f) => {
        const k = J,
          m = K,
          u = ka;
        return (
          p(),
          b("div", null, [
            e(
              m,
              { title: "Packs", breadcrumbs: a },
              {
                actions: s(() => [
                  e(
                    k,
                    {
                      class: "btn btn--primary",
                      to: "/dashboard/maintenance/packs/new",
                    },
                    {
                      default: s(() => [
                        ...(f[0] || (f[0] = [i(" Agregar pack ", -1)])),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                _: 1,
              },
            ),
            e(u),
          ])
        );
      };
    },
  });
export { Ia as default };
//# sourceMappingURL=Bx-us2wQ.js.map

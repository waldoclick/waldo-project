import { _ as L } from "./vgLiQXkW.js";
import { _ as Z } from "./C0-eRrjO.js";
import { u as G, _ as M, a as O } from "./Bn4ou5Ry.js";
import { _ as H, a as j } from "./BbtmlxJr.js";
import { _ as q } from "./C4RpNa5i.js";
import { _ as J } from "./BSFPidNw.js";
import {
  aZ as z,
  b3 as K,
  bb as Q,
  be as $,
  a_ as p,
  a$ as b,
  bf as l,
  b0 as t,
  b6 as d,
  b1 as u,
  bn as W,
  bo as X,
  b5 as Y,
  bs as k,
  bi as C,
  b7 as U,
  b9 as f,
  b8 as w,
} from "./BK8sApmn.js";
import { f as ee } from "./CjIigZ6h.js";
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
    _ = new i.Error().stack;
  _ &&
    ((i._sentryDebugIds = i._sentryDebugIds || {}),
    (i._sentryDebugIds[_] = "47cfb57c-55a3-46ee-a0f9-4d18a71e27fa"),
    (i._sentryDebugIdIdentifier =
      "sentry-dbid-47cfb57c-55a3-46ee-a0f9-4d18a71e27fa"));
} catch {}
const ae = { class: "reservations reservations--used" },
  te = { class: "reservations--used__container" },
  ne = { class: "reservations--used__header" },
  re = { class: "reservations--used__table-wrapper" },
  oe = { class: "reservations--used__user" },
  le = { class: "reservations--used__ad" },
  ie = ["onClick"],
  ue = { key: 0, class: "reservations--used__empty" },
  ce = { key: 1, class: "reservations--used__loading" },
  R = "reservations",
  de = z({
    __name: "ReservationsUsed",
    setup(i, { expose: _ }) {
      const e = G(),
        g = f(() => e.getReservationsFilters),
        x = (s) => {
          e.setFilters(R, s);
        },
        A = K(),
        o = w([]),
        m = w(!1),
        h = async () => {
          try {
            m.value = !0;
            const s = {
              pagination: { page: 1, pageSize: 1e3 },
              sort: e.reservations.sortBy,
              populate: {
                user: { fields: ["username", "email"] },
                ad: { fields: ["name"] },
              },
            };
            e.reservations.searchTerm &&
              (s.filters = {
                $or: [
                  {
                    "user.username": { $containsi: e.reservations.searchTerm },
                  },
                  { "user.email": { $containsi: e.reservations.searchTerm } },
                  { "ad.name": { $containsi: e.reservations.searchTerm } },
                ],
              });
            const a = await A("ad-reservations", { method: "GET", params: s }),
              n = Array.isArray(a.data) ? a.data : [];
            o.value = n.filter((v) => v.ad && v.ad.name);
          } catch {
            o.value = [];
          } finally {
            m.value = !1;
          }
        },
        y = f(() => {
          const s = e.reservations.searchTerm?.trim();
          if (!s) return o.value;
          const a = s.toLowerCase();
          return o.value.filter((n) => {
            const v = n.user?.username?.toLowerCase() || "",
              c = n.user?.email?.toLowerCase() || "",
              T = n.ad?.name?.toLowerCase() || "";
            return v.includes(a) || c.includes(a) || T.includes(a);
          });
        }),
        S = f(() => {
          const s = e.reservations.pageSize,
            n = (e.reservations.currentPage - 1) * s;
          return y.value.slice(n, n + s);
        }),
        D = f(() => y.value.length),
        P = f(() => {
          const s = e.reservations.pageSize;
          return Math.max(1, Math.ceil(D.value / s));
        }),
        V = [
          { label: "ID" },
          { label: "Usuario" },
          { label: "Anuncio" },
          { label: "Fecha" },
          { label: "Acciones", align: "right" },
        ],
        B = [
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "user.username:asc", label: "Usuario A-Z" },
          { value: "user.username:desc", label: "Usuario Z-A" },
          { value: "ad.name:asc", label: "Anuncio A-Z" },
          { value: "ad.name:desc", label: "Anuncio Z-A" },
        ],
        N = Q(),
        E = (s) => {
          N.push(`/dashboard/reservations/${s}`);
        };
      return (
        _({ refresh: h }),
        $(
          [
            () => e.reservations.searchTerm,
            () => e.reservations.sortBy,
            () => e.reservations.pageSize,
            () => e.reservations.currentPage,
          ],
          () => {
            h();
          },
          { immediate: !0 },
        ),
        $(
          () => P.value,
          (s) => {
            e.reservations.currentPage > s && e.setCurrentPage(R, s);
          },
        ),
        (s, a) => {
          const n = M,
            v = O,
            c = j,
            T = H,
            F = q,
            I = J;
          return (
            p(),
            b("section", ae, [
              l("div", te, [
                l("div", ne, [
                  t(
                    n,
                    {
                      "model-value": d(e).reservations.searchTerm,
                      placeholder: "Buscar reservas...",
                      class: "reservations--used__search",
                      "onUpdate:modelValue":
                        a[0] || (a[0] = (r) => d(e).setSearchTerm(R, r)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  t(
                    v,
                    {
                      "model-value": g.value,
                      "sort-options": B,
                      "page-sizes": [10, 25, 50, 100],
                      class: "reservations--used__filters",
                      "onUpdate:modelValue": x,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                l("div", re, [
                  t(
                    F,
                    { columns: V },
                    {
                      default: u(() => [
                        (p(!0),
                        b(
                          W,
                          null,
                          X(
                            S.value,
                            (r) => (
                              p(),
                              Y(
                                T,
                                { key: r.id },
                                {
                                  default: u(() => [
                                    t(
                                      c,
                                      null,
                                      {
                                        default: u(() => [k(C(r.id), 1)]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      c,
                                      null,
                                      {
                                        default: u(() => [
                                          l(
                                            "div",
                                            oe,
                                            C(r.user?.username || "-"),
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
                                        default: u(() => [
                                          l("div", le, C(r.ad?.name || "-"), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      c,
                                      null,
                                      {
                                        default: u(() => [
                                          k(C(d(ee)(r.createdAt)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      c,
                                      { align: "right" },
                                      {
                                        default: u(() => [
                                          l(
                                            "button",
                                            {
                                              class:
                                                "reservations--used__action",
                                              title: "Ver reserva",
                                              onClick: (me) => E(r.id),
                                            },
                                            [
                                              t(d(se), {
                                                class:
                                                  "reservations--used__action__icon",
                                              }),
                                            ],
                                            8,
                                            ie,
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
                  S.value.length === 0 && !m.value
                    ? (p(),
                      b("div", ue, [
                        ...(a[2] ||
                          (a[2] = [
                            l(
                              "p",
                              null,
                              "No se encontraron reservas usadas",
                              -1,
                            ),
                          ])),
                      ]))
                    : U("", !0),
                  m.value
                    ? (p(),
                      b("div", ce, [
                        ...(a[3] ||
                          (a[3] = [l("p", null, "Cargando reservas...", -1)])),
                      ]))
                    : U("", !0),
                ]),
                t(
                  I,
                  {
                    "current-page": d(e).reservations.currentPage,
                    "total-pages": P.value,
                    "total-records": D.value,
                    "page-size": d(e).reservations.pageSize,
                    class: "reservations--used__pagination",
                    onPageChange:
                      a[1] || (a[1] = (r) => d(e).setCurrentPage(R, r)),
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
  _e = Object.assign(de, { __name: "ReservationsUsed" }),
  Ae = z({
    __name: "used",
    setup(i) {
      const _ = [
          { label: "Reservas", to: "/dashboard/reservations/free" },
          { label: "Usadas" },
        ],
        e = w(!1),
        g = w(null);
      function x() {
        ((e.value = !1), g.value?.refresh());
      }
      return (A, o) => {
        const m = L,
          h = Z;
        return (
          p(),
          b("div", null, [
            t(
              m,
              { title: "Usadas", breadcrumbs: _ },
              {
                actions: u(() => [
                  l(
                    "button",
                    {
                      class: "btn btn--primary",
                      type: "button",
                      onClick: o[0] || (o[0] = (y) => (e.value = !0)),
                    },
                    " Regalar Reservas ",
                  ),
                ]),
                _: 1,
              },
            ),
            t(_e, { ref_key: "tableRef", ref: g }, null, 512),
            t(
              h,
              {
                "is-open": e.value,
                endpoint: "ad-reservations",
                label: "reservas",
                onClose: o[1] || (o[1] = (y) => (e.value = !1)),
                onGifted: x,
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
export { Ae as default };
//# sourceMappingURL=CPGSamck.js.map

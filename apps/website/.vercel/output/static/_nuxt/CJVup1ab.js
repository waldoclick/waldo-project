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
  a_ as d,
  a$ as v,
  bf as l,
  b0 as t,
  b6 as i,
  b1 as u,
  bn as W,
  bo as X,
  b5 as Y,
  bs as D,
  bi as C,
  b7 as $,
  b9 as h,
  b8 as m,
} from "./BK8sApmn.js";
import { f as ee } from "./CjIigZ6h.js";
import { E as se } from "./DvfQSOKW.js";
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
    c = new r.Error().stack;
  c &&
    ((r._sentryDebugIds = r._sentryDebugIds || {}),
    (r._sentryDebugIds[c] = "7bd4c9d4-f181-4bd9-aab8-4929bd4e0494"),
    (r._sentryDebugIdIdentifier =
      "sentry-dbid-7bd4c9d4-f181-4bd9-aab8-4929bd4e0494"));
} catch {}
const te = { class: "reservations reservations--free" },
  ae = { class: "reservations--free__container" },
  re = { class: "reservations--free__header" },
  ne = { class: "reservations--free__table-wrapper" },
  oe = { class: "reservations--free__user" },
  le = ["onClick"],
  ie = { key: 0, class: "reservations--free__empty" },
  ue = { key: 1, class: "reservations--free__loading" },
  R = "reservations",
  ce = k({
    __name: "ReservationsFree",
    setup(r, { expose: c }) {
      const e = L(),
        f = h(() => e.getReservationsFilters),
        y = (o) => {
          e.setFilters(R, o);
        },
        x = J(),
        n = m([]),
        _ = m(!1),
        p = m(null),
        b = async () => {
          try {
            _.value = !0;
            const o = {
              pagination: {
                page: e.reservations.currentPage,
                pageSize: e.reservations.pageSize,
              },
              sort: e.reservations.sortBy,
              populate: { user: { fields: ["username"] } },
              filters: { ad: { $null: !0 } },
            };
            e.reservations.searchTerm &&
              (o.filters.$or = [
                { "user.username": { $containsi: e.reservations.searchTerm } },
                { "user.email": { $containsi: e.reservations.searchTerm } },
              ]);
            const s = await x("ad-reservations", { method: "GET", params: o });
            ((n.value = Array.isArray(s.data) ? s.data : []),
              (p.value = s.meta?.pagination ? s.meta.pagination : null));
          } catch {
            n.value = [];
          } finally {
            _.value = !1;
          }
        },
        T = h(() => n.value),
        w = h(() => p.value?.pageCount || 1),
        F = h(() => p.value?.total || 0),
        S = [
          { label: "ID" },
          { label: "Usuario" },
          { label: "Fecha" },
          { label: "Acciones", align: "right" },
        ],
        A = [
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "user.username:asc", label: "Usuario A-Z" },
          { value: "user.username:desc", label: "Usuario Z-A" },
        ],
        P = K(),
        V = (o) => {
          P.push(`/dashboard/reservations/${o}`);
        };
      return (
        c({ refresh: b }),
        Q(
          [
            () => e.reservations.searchTerm,
            () => e.reservations.sortBy,
            () => e.reservations.pageSize,
            () => e.reservations.currentPage,
          ],
          () => {
            b();
          },
          { immediate: !0 },
        ),
        (o, s) => {
          const z = M,
            B = O,
            g = H,
            I = Z,
            E = j,
            N = q;
          return (
            d(),
            v("section", te, [
              l("div", ae, [
                l("div", re, [
                  t(
                    z,
                    {
                      "model-value": i(e).reservations.searchTerm,
                      placeholder: "Buscar reservas...",
                      class: "reservations--free__search",
                      "onUpdate:modelValue":
                        s[0] || (s[0] = (a) => i(e).setSearchTerm(R, a)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  t(
                    B,
                    {
                      "model-value": f.value,
                      "sort-options": A,
                      "page-sizes": [10, 25, 50, 100],
                      class: "reservations--free__filters",
                      "onUpdate:modelValue": y,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                l("div", ne, [
                  t(
                    E,
                    { columns: S },
                    {
                      default: u(() => [
                        (d(!0),
                        v(
                          W,
                          null,
                          X(
                            T.value,
                            (a) => (
                              d(),
                              Y(
                                I,
                                { key: a.id },
                                {
                                  default: u(() => [
                                    t(
                                      g,
                                      null,
                                      {
                                        default: u(() => [D(C(a.id), 1)]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      g,
                                      null,
                                      {
                                        default: u(() => [
                                          l(
                                            "div",
                                            oe,
                                            C(a.user?.username || "-"),
                                            1,
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      g,
                                      null,
                                      {
                                        default: u(() => [
                                          D(C(i(ee)(a.createdAt)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    t(
                                      g,
                                      { align: "right" },
                                      {
                                        default: u(() => [
                                          l(
                                            "button",
                                            {
                                              class:
                                                "reservations--free__action",
                                              title: "Ver reserva",
                                              onClick: (de) => V(a.id),
                                            },
                                            [
                                              t(i(se), {
                                                class:
                                                  "reservations--free__action__icon",
                                              }),
                                            ],
                                            8,
                                            le,
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
                  T.value.length === 0 && !_.value
                    ? (d(),
                      v("div", ie, [
                        ...(s[2] ||
                          (s[2] = [
                            l(
                              "p",
                              null,
                              "No se encontraron reservas libres",
                              -1,
                            ),
                          ])),
                      ]))
                    : $("", !0),
                  _.value
                    ? (d(),
                      v("div", ue, [
                        ...(s[3] ||
                          (s[3] = [l("p", null, "Cargando reservas...", -1)])),
                      ]))
                    : $("", !0),
                ]),
                t(
                  N,
                  {
                    "current-page": i(e).reservations.currentPage,
                    "total-pages": w.value,
                    "total-records": F.value,
                    "page-size": i(e).reservations.pageSize,
                    class: "reservations--free__pagination",
                    onPageChange:
                      s[1] || (s[1] = (a) => i(e).setCurrentPage(R, a)),
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
  _e = Object.assign(ce, { __name: "ReservationsFree" }),
  De = k({
    __name: "free",
    setup(r) {
      const c = [
          { label: "Reservas", to: "/dashboard/reservations/free" },
          { label: "Libres" },
        ],
        e = m(!1),
        f = m(null);
      function y() {
        ((e.value = !1), f.value?.refresh());
      }
      return (x, n) => {
        const _ = U,
          p = G;
        return (
          d(),
          v("div", null, [
            t(
              _,
              { title: "Libres", breadcrumbs: c },
              {
                actions: u(() => [
                  l(
                    "button",
                    {
                      class: "btn btn--primary",
                      type: "button",
                      onClick: n[0] || (n[0] = (b) => (e.value = !0)),
                    },
                    " Regalar Reservas ",
                  ),
                ]),
                _: 1,
              },
            ),
            t(_e, { ref_key: "tableRef", ref: f }, null, 512),
            t(
              p,
              {
                "is-open": e.value,
                endpoint: "ad-reservations",
                label: "reservas",
                onClose: n[1] || (n[1] = (b) => (e.value = !1)),
                onGifted: y,
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
export { De as default };
//# sourceMappingURL=CJVup1ab.js.map

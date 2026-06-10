import { _ as Z } from "./vgLiQXkW.js";
import { u as R, _ as M, a as j } from "./Bn4ou5Ry.js";
import { _ as H, a as O } from "./BbtmlxJr.js";
import { _ as G } from "./C4RpNa5i.js";
import { _ as L } from "./BSFPidNw.js";
import {
  aZ as x,
  b3 as q,
  bb as J,
  be as K,
  a_ as m,
  a$ as p,
  bf as n,
  b0 as a,
  b6 as i,
  b1 as u,
  bn as Q,
  bo as W,
  b5 as X,
  bs as T,
  bi as f,
  b7 as U,
  b9 as b,
  b8 as h,
} from "./BK8sApmn.js";
import { f as Y } from "./CjIigZ6h.js";
import { E as ee } from "./DvfQSOKW.js";
import "./CNKn_OHC.js";
import "./DmUMncXv.js";
import "./Cwrq1rl2.js";
try {
  let l =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    e = new l.Error().stack;
  e &&
    ((l._sentryDebugIds = l._sentryDebugIds || {}),
    (l._sentryDebugIds[e] = "eadbf12f-aa29-41c8-a9a8-dfb5cf1d367f"),
    (l._sentryDebugIdIdentifier =
      "sentry-dbid-eadbf12f-aa29-41c8-a9a8-dfb5cf1d367f"));
} catch {}
const se = { class: "users users--default" },
  ae = { class: "users--default__container" },
  te = { class: "users--default__header" },
  re = { class: "users--default__table-wrapper" },
  oe = { class: "users--default__username" },
  ne = { class: "users--default__email" },
  le = { class: "users--default__name" },
  ue = ["onClick"],
  ie = { key: 0, class: "users--default__empty" },
  ce = { key: 1, class: "users--default__loading" },
  y = "users",
  _e = x({
    __name: "UsersDefault",
    setup(l) {
      const e = R(),
        C = b(() => e.getUsersFilters),
        A = (r) => {
          e.setFilters(y, r);
        },
        v = q(),
        c = h([]),
        g = h(!1),
        _ = h(null),
        w = async () => {
          try {
            g.value = !0;
            const r = {
              pagination: {
                page: e.users.currentPage,
                pageSize: e.users.pageSize,
              },
              sort: e.users.sortBy,
            };
            e.users.searchTerm &&
              (r.filters = {
                $or: [
                  { username: { $containsi: e.users.searchTerm } },
                  { email: { $containsi: e.users.searchTerm } },
                  { firstname: { $containsi: e.users.searchTerm } },
                  { lastname: { $containsi: e.users.searchTerm } },
                ],
              });
            const s = await v("users", { method: "GET", params: r }),
              o = s;
            Array.isArray(s)
              ? ((c.value = s),
                (_.value = {
                  page: e.users.currentPage,
                  pageSize: e.users.pageSize,
                  pageCount: 1,
                  total: s.length,
                }))
              : o.data
                ? ((c.value = Array.isArray(o.data) ? o.data : []),
                  (_.value = o.meta?.pagination || null))
                : o.results
                  ? ((c.value = Array.isArray(o.results) ? o.results : []),
                    (_.value = o.pagination || null))
                  : ((c.value = []), (_.value = null));
          } catch {
            c.value = [];
          } finally {
            g.value = !1;
          }
        },
        D = b(() => c.value),
        S = b(() => _.value?.pageCount || 1),
        $ = b(() => _.value?.total || 0),
        k = [
          { label: "ID" },
          { label: "Usuario" },
          { label: "Correo electrónico" },
          { label: "Nombre" },
          { label: "Fecha" },
          { label: "Acciones", align: "right" },
        ],
        z = [
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "username:asc", label: "Usuario A-Z" },
          { value: "username:desc", label: "Usuario Z-A" },
          { value: "email:asc", label: "Correo A-Z" },
          { value: "email:desc", label: "Correo Z-A" },
        ],
        P = (r, s) =>
          !r && !s ? "-" : [r, s].filter(Boolean).join(" ") || "-",
        B = J(),
        V = (r) => {
          B.push(`/dashboard/users/${r}`);
        };
      return (
        K(
          [
            () => e.users.searchTerm,
            () => e.users.sortBy,
            () => e.users.pageSize,
            () => e.users.currentPage,
          ],
          () => {
            w();
          },
          { immediate: !0 },
        ),
        (r, s) => {
          const o = M,
            N = j,
            d = O,
            F = H,
            I = G,
            E = L;
          return (
            m(),
            p("section", se, [
              n("div", ae, [
                n("div", te, [
                  a(
                    o,
                    {
                      "model-value": i(e).users.searchTerm,
                      placeholder: "Buscar usuarios...",
                      class: "users--default__search",
                      "onUpdate:modelValue":
                        s[0] || (s[0] = (t) => i(e).setSearchTerm(y, t)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  a(
                    N,
                    {
                      "model-value": C.value,
                      "sort-options": z,
                      "page-sizes": [10, 25, 50, 100],
                      class: "users--default__filters",
                      "onUpdate:modelValue": A,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                n("div", re, [
                  a(
                    I,
                    { columns: k },
                    {
                      default: u(() => [
                        (m(!0),
                        p(
                          Q,
                          null,
                          W(
                            D.value,
                            (t) => (
                              m(),
                              X(
                                F,
                                { key: t.id },
                                {
                                  default: u(() => [
                                    a(
                                      d,
                                      null,
                                      {
                                        default: u(() => [T(f(t.id), 1)]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    a(
                                      d,
                                      null,
                                      {
                                        default: u(() => [
                                          n("div", oe, f(t.username || "-"), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    a(
                                      d,
                                      null,
                                      {
                                        default: u(() => [
                                          n("div", ne, f(t.email || "-"), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    a(
                                      d,
                                      null,
                                      {
                                        default: u(() => [
                                          n(
                                            "div",
                                            le,
                                            f(P(t.firstname, t.lastname)),
                                            1,
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    a(
                                      d,
                                      null,
                                      {
                                        default: u(() => [
                                          T(f(i(Y)(t.createdAt)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    a(
                                      d,
                                      { align: "right" },
                                      {
                                        default: u(() => [
                                          n(
                                            "button",
                                            {
                                              class: "users--default__action",
                                              title: "Ver usuario",
                                              onClick: (me) => V(t.id),
                                            },
                                            [
                                              a(i(ee), {
                                                class:
                                                  "users--default__action__icon",
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
                  D.value.length === 0 && !g.value
                    ? (m(),
                      p("div", ie, [
                        ...(s[2] ||
                          (s[2] = [
                            n("p", null, "No se encontraron usuarios", -1),
                          ])),
                      ]))
                    : U("", !0),
                  g.value
                    ? (m(),
                      p("div", ce, [
                        ...(s[3] ||
                          (s[3] = [n("p", null, "Cargando usuarios...", -1)])),
                      ]))
                    : U("", !0),
                ]),
                a(
                  E,
                  {
                    "current-page": i(e).users.currentPage,
                    "total-pages": S.value,
                    "total-records": $.value,
                    "page-size": i(e).users.pageSize,
                    class: "users--default__pagination",
                    onPageChange:
                      s[1] || (s[1] = (t) => i(e).setCurrentPage(y, t)),
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
  de = Object.assign(_e, { __name: "UsersDefault" }),
  Ue = x({
    __name: "index",
    setup(l) {
      const e = [{ label: "Usuarios" }];
      return (C, A) => {
        const v = Z;
        return (
          m(),
          p("div", null, [a(v, { title: "Usuarios", breadcrumbs: e }), a(de)])
        );
      };
    },
  });
export { Ue as default };
//# sourceMappingURL=C44Tkh6q.js.map

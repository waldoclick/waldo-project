import {
  bD as y,
  aZ as x,
  dc as w,
  bx as C,
  b2 as z,
  a_ as r,
  a$ as u,
  bf as a,
  b0 as e,
  dl as M,
  b6 as s,
  bi as _,
  b7 as c,
  b5 as g,
  b1 as i,
  bs as m,
  br as S,
  bG as D,
  cG as $,
  dz as L,
  dd as P,
  dA as A,
  dm as B,
  dB as V,
  bO as N,
  b$ as I,
  b9 as O,
  bk as R,
  dC as T,
  cs as F,
  ds as E,
  ct as U,
  dD as H,
  dE as q,
  cu as G,
  dw as j,
  dx as Z,
  dy as J,
  dF as K,
  dt as Q,
} from "./BK8sApmn.js";
import { M as W } from "./DFMJU6rT.js";
import { S as X } from "./B27Hvwzg.js";
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
    d = new l.Error().stack;
  d &&
    ((l._sentryDebugIds = l._sentryDebugIds || {}),
    (l._sentryDebugIds[d] = "bb322f0f-a36e-4394-9d39-db13e9462360"),
    (l._sentryDebugIdIdentifier =
      "sentry-dbid-bb322f0f-a36e-4394-9d39-db13e9462360"));
} catch {}
const Y = y("at-sign", [
  ["circle", { cx: "12", cy: "12", r: "4", key: "4exip2" }],
  ["path", { d: "M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8", key: "7n84p3" }],
]);
const ee = y("camera", [
    [
      "path",
      {
        d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
        key: "1tc9qg",
      },
    ],
    ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }],
  ]),
  te = { class: "sidebar sidebar--account" },
  se = { class: "sidebar--account__info" },
  ae = { class: "sidebar--account__avatar" },
  oe = { key: 0, class: "sidebar--account__name" },
  ne = { key: 1, class: "sidebar--account__email" },
  ie = { class: "sidebar--account__location" },
  re = { key: 3, class: "sidebar--account__showcase" },
  ue = { key: 4, class: "sidebar--account__link" },
  le = { class: "sidebar--account__menu" },
  ce = { class: "sidebar--account__menu__item" },
  de = { class: "sidebar--account__menu__item" },
  _e = { class: "sidebar--account__menu__item" },
  be = { class: "sidebar--account__menu__item" },
  me = { key: 0, class: "sidebar--account__menu__item" },
  fe = { key: 1, class: "sidebar--account__menu__item" },
  pe = { key: 2, class: "sidebar--account__menu__item" },
  ye = { class: "sidebar--account__menu__item" },
  ge = { class: "sidebar--account__menu__item" },
  ve = x({
    __name: "SidebarAccount",
    setup(l) {
      const { Swal: d } = R(),
        b = w(),
        o = C(),
        { logout: v } = T(),
        f = O(() =>
          !o.value || !o.value.commune || !o.value.commune.region
            ? ""
            : o.value.commune.name,
        ),
        k = async () => {
          d.fire({
            text: "¿Estás seguro de cerrar sesión?",
            icon: "warning",
            showCancelButton: !0,
            confirmButtonText: "Sí, quiero salir",
            cancelButtonText: "No",
          }).then(async ({ isConfirmed: p }) => {
            if (p)
              try {
                await v();
              } catch {}
          });
        },
        h = z();
      return (p, t) => {
        const n = S;
        return (
          r(),
          u("div", te, [
            a("div", se, [
              a("div", ae, [e(M, { size: "large" })]),
              s(o)
                ? (r(),
                  u("div", oe, _(s(o).firstname) + " " + _(s(o).lastname), 1))
                : c("", !0),
              s(o) ? (r(), u("div", ne, _(s(o).email), 1)) : c("", !0),
              s(h).path !== "/cuenta/perfil"
                ? (r(),
                  g(
                    n,
                    {
                      key: 2,
                      to: "/cuenta/perfil",
                      class: "sidebar--account__profile",
                      title: "Ver datos personales",
                    },
                    {
                      default: i(() => [
                        ...(t[0] || (t[0] = [m(" Ver datos personales ", -1)])),
                      ]),
                      _: 1,
                    },
                  ))
                : c("", !0),
              D(
                a(
                  "div",
                  ie,
                  [e(s(W), { size: 20 }), m(" " + _(f.value), 1)],
                  512,
                ),
                [[$, f.value]],
              ),
              s(o)
                ? (r(),
                  u("div", re, [
                    e(
                      n,
                      { to: `/${s(o).username}`, title: `@${s(o).username}` },
                      {
                        default: i(() => [m(" @" + _(s(o).username), 1)]),
                        _: 1,
                      },
                      8,
                      ["to", "title"],
                    ),
                  ]))
                : c("", !0),
              s(o)
                ? (r(),
                  u("div", ue, [
                    e(
                      n,
                      {
                        to: `/${s(o).username}`,
                        title: "Ver mi perfil público",
                      },
                      {
                        default: i(() => [
                          ...(t[1] ||
                            (t[1] = [m(" Ver mi perfil público ", -1)])),
                        ]),
                        _: 1,
                      },
                      8,
                      ["to"],
                    ),
                  ]))
                : c("", !0),
            ]),
            a("ul", le, [
              a("li", ce, [
                e(
                  n,
                  { to: "/cuenta/", title: "Mi cuenta" },
                  {
                    default: i(() => [
                      e(s(L), { size: 20 }),
                      t[2] || (t[2] = a("span", null, "Mi cuenta", -1)),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              a("li", de, [
                e(
                  n,
                  { to: "/cuenta/mis-anuncios/", title: "Mis anuncios" },
                  {
                    default: i(() => [
                      e(s(P), { size: 20 }),
                      t[3] || (t[3] = a("span", null, "Mis anuncios", -1)),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              a("li", _e, [
                e(
                  n,
                  { to: "/cuenta/mis-ordenes/", title: "Mis órdenes" },
                  {
                    default: i(() => [
                      e(s(X), { size: 20 }),
                      t[4] || (t[4] = a("span", null, "Mis órdenes", -1)),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              a("li", be, [
                e(
                  n,
                  { to: "/cuenta/perfil", title: "Mi perfil" },
                  {
                    default: i(() => [
                      e(s(A), { size: 20 }),
                      t[5] || (t[5] = a("span", null, "Mi perfil", -1)),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              s(b).features.pro
                ? (r(),
                  u("li", me, [
                    e(
                      n,
                      { to: "/cuenta/username", title: "Nombre de usuario" },
                      {
                        default: i(() => [
                          e(s(Y), { size: 20 }),
                          t[6] ||
                            (t[6] = a("span", null, "Nombre de usuario", -1)),
                          t[7] || (t[7] = a("b", null, "PRO", -1)),
                        ]),
                        _: 1,
                      },
                    ),
                  ]))
                : c("", !0),
              s(b).features.pro
                ? (r(),
                  u("li", fe, [
                    e(
                      n,
                      { to: "/cuenta/avatar", title: "Foto de perfil" },
                      {
                        default: i(() => [
                          e(s(ee), { size: 20 }),
                          t[8] ||
                            (t[8] = a("span", null, "Foto de perfil", -1)),
                          t[9] || (t[9] = a("b", null, "PRO", -1)),
                        ]),
                        _: 1,
                      },
                    ),
                  ]))
                : c("", !0),
              s(b).features.pro
                ? (r(),
                  u("li", pe, [
                    e(
                      n,
                      { to: "/cuenta/cover", title: "Portada" },
                      {
                        default: i(() => [
                          e(s(B), { size: 20 }),
                          t[10] || (t[10] = a("span", null, "Portada", -1)),
                          t[11] || (t[11] = a("b", null, "PRO", -1)),
                        ]),
                        _: 1,
                      },
                    ),
                  ]))
                : c("", !0),
              a("li", ye, [
                e(
                  n,
                  {
                    to: "/cuenta/cambiar-contrasena",
                    title: "Cambiar contraseña",
                  },
                  {
                    default: i(() => [
                      e(s(V), { size: 20 }),
                      t[12] ||
                        (t[12] = a("span", null, "Cambiar contraseña", -1)),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              a("li", ge, [
                a("a", { title: "Cerrar sesión", onClick: N(k, ["prevent"]) }, [
                  e(s(I), { size: 20 }),
                  t[13] || (t[13] = a("span", null, "Cerrar sesión", -1)),
                ]),
              ]),
            ]),
          ])
        );
      };
    },
  }),
  ke = Object.assign(ve, { __name: "SidebarAccount" }),
  he = { class: "layout layout--account" },
  xe = { class: "layout--account__container" },
  we = { class: "layout--account__sidebar" },
  Ce = { class: "layout--account__content" },
  De = {
    __name: "account",
    setup(l) {
      return (d, b) => {
        const o = q;
        return (
          r(),
          u("div", he, [
            e(s(F), { "show-search": !1 }),
            e(E),
            e(U),
            a("div", xe, [
              a("div", we, [e(s(ke))]),
              a("div", Ce, [
                (r(), g(o, { key: (d._.provides[H] || d.$route).fullPath })),
              ]),
            ]),
            e(s(G)),
            e(j),
            e(Z),
            e(J),
            e(K),
            e(Q),
          ])
        );
      };
    },
  };
export { De as default };
//# sourceMappingURL=B3JkJpdP.js.map

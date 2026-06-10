import {
  bD as j,
  aZ as h,
  a_ as i,
  b5 as x,
  b1 as k,
  bf as e,
  bS as w,
  bi as r,
  br as M,
  cY as P,
  bx as D,
  dc as H,
  bm as L,
  a$ as u,
  b6 as c,
  b0 as s,
  bs as m,
  b7 as f,
  dd as R,
  b9 as b,
  cW as V,
  bu as U,
  bw as I,
  aY as B,
} from "./BK8sApmn.js";
import { M as N } from "./C6cPP_HD.js";
import { u as z } from "./JxRx1s6n.js";
import { u as W } from "./CsS7OJ1I.js";
import { M as q } from "./Dw7hc4Ok.js";
import { S as E } from "./B27Hvwzg.js";
import "./DnzrZk1h.js";
try {
  let t =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    o = new t.Error().stack;
  o &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[o] = "5d237f1d-ed51-40d4-a1b0-2e8c19c20b25"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-5d237f1d-ed51-40d4-a1b0-2e8c19c20b25"));
} catch {}
const O = j("user-cog", [
    ["circle", { cx: "18", cy: "15", r: "3", key: "gjjjvw" }],
    ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
    ["path", { d: "M10 15H6a4 4 0 0 0-4 4v2", key: "1nfge6" }],
    ["path", { d: "m21.7 16.4-.9-.3", key: "12j9ji" }],
    ["path", { d: "m15.2 13.9-.9-.3", key: "1fdjdi" }],
    ["path", { d: "m16.6 18.7.3-.9", key: "heedtr" }],
    ["path", { d: "m19.1 12.2.3-.9", key: "1af3ki" }],
    ["path", { d: "m19.6 18.7-.4-1", key: "1x9vze" }],
    ["path", { d: "m16.8 12.3-.4-1", key: "vqeiwj" }],
    ["path", { d: "m14.3 16.6 1-.4", key: "1qlj63" }],
    ["path", { d: "m20.7 13.8 1-.4", key: "1v5t8k" }],
  ]),
  Y = { class: "card--shortcut__header" },
  F = { class: "card--shortcut__title" },
  Z = { class: "card--shortcut__description" },
  G = { class: "card--shortcut__link" },
  J = h({
    __name: "CardShortcut",
    props: {
      to: {},
      iconComponent: {},
      title: {},
      description: {},
      linkText: {},
    },
    setup(t) {
      return (o, d) => {
        const a = M;
        return (
          i(),
          x(
            a,
            { to: t.to, class: "card card--shortcut", title: t.title },
            {
              default: k(() => [
                e("span", Y, [
                  (i(),
                  x(w(t.iconComponent), { class: "card--shortcut__icon" })),
                  e("h3", F, r(t.title), 1),
                ]),
                e("p", Z, r(t.description), 1),
                e("span", G, r(t.linkText), 1),
              ]),
              _: 1,
            },
            8,
            ["to", "title"],
          )
        );
      };
    },
  }),
  _ = Object.assign(J, { __name: "CardShortcut" }),
  K = { class: "account account--main", "aria-labelledby": "account-title" },
  Q = { class: "account--main__profile" },
  X = { key: 0, class: "account--main__become_pro" },
  tt = { class: "account--main__announcements" },
  et = { class: "account--main__announcements__text" },
  nt = { class: "account--main__announcements__own" },
  st = ["innerHTML"],
  ot = ["innerHTML"],
  at = { key: 0, class: "account--main__announcements__pack" },
  ct = ["innerHTML"],
  it = { class: "account--main__shortcuts" },
  rt = {
    class: "account--main__shortcuts__links",
    "aria-labelledby": "shortcuts-title",
  },
  ut = h({
    __name: "AccountMain",
    setup(t) {
      const { getAdReservationsText: o, getFeaturedAdReservationsText: d } =
          P(),
        { getPackBannerText: a } = z(),
        p = D(),
        { sanitizeText: l } = V(),
        { packs: C, loadPacks: T } = W(),
        A = H();
      L(() => T());
      const $ = b(() => l(o())),
        y = b(() => l(d())),
        g = b(() => l(a(C.value) ?? ""));
      return (_t, n) => {
        const v = M,
          S = N;
        return (
          i(),
          u("section", K, [
            n[4] ||
              (n[4] = e(
                "div",
                { id: "account-title", class: "account--main__title" },
                "Mi cuenta",
                -1,
              )),
            e("div", Q, [
              e("span", null, r(c(p)?.firstname) + " " + r(c(p)?.lastname), 1),
              s(
                v,
                {
                  class: "account--main__profile__edit",
                  to: "/cuenta/perfil",
                  title: "Ver perfil",
                },
                {
                  default: k(() => [
                    ...(n[0] || (n[0] = [m(" Ver perfil ", -1)])),
                  ]),
                  _: 1,
                },
              ),
            ]),
            c(A).features.pro ? (i(), u("div", X, [s(S)])) : f("", !0),
            e("div", tt, [
              e("div", et, [
                e("div", nt, [
                  e("span", { innerHTML: $.value }, null, 8, st),
                  n[1] || (n[1] = m(r(" "), -1)),
                  y.value
                    ? (i(),
                      u("span", { key: 0, innerHTML: y.value }, null, 8, ot))
                    : f("", !0),
                ]),
                g.value
                  ? (i(),
                    u("div", at, [
                      e(
                        "div",
                        {
                          class: "account--main__announcements__pack__info",
                          innerHTML: g.value,
                        },
                        null,
                        8,
                        ct,
                      ),
                    ]))
                  : f("", !0),
              ]),
              s(
                v,
                { to: "/packs", class: "btn btn--buy", title: "Comprar" },
                {
                  default: k(() => [
                    ...(n[2] || (n[2] = [m(" Comprar ", -1)])),
                  ]),
                  _: 1,
                },
              ),
            ]),
            e("div", it, [
              n[3] ||
                (n[3] = e(
                  "div",
                  {
                    id: "shortcuts-title",
                    class: "account--main__shortcuts__title",
                  },
                  " Accesos frecuentes ",
                  -1,
                )),
              e("div", rt, [
                s(
                  _,
                  {
                    to: "/cuenta/mis-anuncios",
                    "icon-component": c(q),
                    title: "Mis anuncios",
                    description:
                      "Mira tus anuncios y el estados de tus publicaciones creadas.",
                    "link-text": "Ver anuncios",
                  },
                  null,
                  8,
                  ["icon-component"],
                ),
                s(
                  _,
                  {
                    to: "/cuenta/mis-ordenes",
                    "icon-component": c(E),
                    title: "Mis órdenes",
                    description:
                      "Revisa el historial de tus compras y el estado de tus pedidos.",
                    "link-text": "Ver órdenes",
                  },
                  null,
                  8,
                  ["icon-component"],
                ),
                s(
                  _,
                  {
                    to: "/packs",
                    "icon-component": c(R),
                    title: "Comprar Packs",
                    description:
                      "Mira nuestros packs de anuncios y elige el que más necesites.",
                    "link-text": "Comprar packs",
                  },
                  null,
                  8,
                  ["icon-component"],
                ),
                s(
                  _,
                  {
                    to: "/cuenta/perfil",
                    "icon-component": c(O),
                    title: "Mi perfil",
                    description:
                      "Revisa o actualiza los datos de tu cuenta, perfil y contacto.",
                    "link-text": "Revisar o editar mi perfil",
                  },
                  null,
                  8,
                  ["icon-component"],
                ),
              ]),
            ]),
          ])
        );
      };
    },
  }),
  dt = Object.assign(ut, { __name: "AccountMain" }),
  lt = { class: "page page--account" },
  gt = h({
    __name: "index",
    setup(t) {
      const { $setSEO: o, $setStructuredData: d } = U(),
        a = B();
      return (
        o({
          title: "Mi Cuenta",
          description:
            "Accede a tu cuenta en Waldo.click®. Administra tus datos, anuncios y más desde un solo lugar.",
          imageUrl: `${a.public.baseUrl}/share.jpg`,
          url: `${a.public.baseUrl}/cuenta`,
        }),
        I({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        d({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Mi Cuenta",
          url: `${a.public.baseUrl}/cuenta`,
          description:
            "Accede a tu cuenta en Waldo.click®. Administra tus datos, anuncios y más desde un solo lugar.",
        }),
        (p, l) => (i(), u("div", lt, [s(dt)]))
      );
    },
  });
export { gt as default };
//# sourceMappingURL=DDHkd8Hm.js.map

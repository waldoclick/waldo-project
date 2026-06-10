import {
  cL as I,
  bx as P,
  a_ as n,
  a$ as d,
  b6 as t,
  bf as l,
  b7 as p,
  b9 as v,
  bt as R,
  b0 as f,
  dl as w,
  bi as C,
  b5 as g,
  bC as O,
  aZ as U,
  bb as V,
  b2 as z,
  dc as M,
  cQ as j,
  dm as B,
  bn as F,
  bo as L,
  b1 as S,
  bs as T,
  bF as H,
  d9 as W,
  bu as Y,
  c_ as D,
  cw as K,
  b8 as Q,
  b4 as Z,
  bm as G,
  cv as J,
  cr as X,
  be as A,
  cs as ee,
  cu as se,
  ba as te,
  bK as ae,
  d3 as re,
  aY as ne,
} from "./BK8sApmn.js";
import { R as oe } from "./CeZ3CHNS.js";
import { _ as ie } from "./W9r5MxIt.js";
import { _ as h } from "./C7SjWCbw.js";
import { E as ue } from "./27XRtptg.js";
import { M as le } from "./DuRm081T.js";
import { M as ce } from "./C6cPP_HD.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
import "./DnzrZk1h.js";
try {
  let s =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    i = new s.Error().stack;
  i &&
    ((s._sentryDebugIds = s._sentryDebugIds || {}),
    (s._sentryDebugIds[i] = "76943b83-7a37-4ab0-aa96-4421fc293ff0"),
    (s._sentryDebugIdIdentifier =
      "sentry-dbid-76943b83-7a37-4ab0-aa96-4421fc293ff0"));
} catch {}
I("/images/chevron-right-new.svg");
const de = { class: "hero hero--profile" },
  pe = { key: 0, class: "hero--profile__image" },
  me = ["src"],
  fe = {
    __name: "HeroProfile",
    props: { user: { type: [Array, Object], default: () => ({}) } },
    setup(s) {
      const i = s;
      P();
      const { transformUrl: _ } = R(),
        a = v(() => i.user),
        b = v(() => {
          const r = a.value?.cover;
          return r ? _(r.formats["large"]?.url || r.url) : "";
        });
      return (r, u) => (
        n(),
        d("section", de, [
          t(a)?.pro_status === "active" && t(a)?.cover
            ? (n(),
              d("div", pe, [
                l(
                  "img",
                  {
                    class: "hero--profile__image__image",
                    src: t(b) || "",
                    alt: "Imagen",
                  },
                  null,
                  8,
                  me,
                ),
                u[0] ||
                  (u[0] = l(
                    "div",
                    { class: "hero--profile__overlay" },
                    null,
                    -1,
                  )),
              ]))
            : p("", !0),
        ])
      );
    },
  },
  _e = { class: "sidebar--profile__wrapper" },
  ge = { class: "sidebar--profile__user" },
  be = { class: "sidebar--profile__avatar" },
  ve = { class: "sidebar--profile__name" },
  ye = { class: "sidebar--profile__announcements" },
  he = { key: 0, class: "sidebar--profile__info" },
  $e = { key: 1 },
  ke = { class: "sidebar--profile__reminder" },
  Pe = {
    __name: "SidebarProfile",
    props: {
      user: { type: [Array, Object], default: () => ({}) },
      isPublic: { type: Boolean, default: !0 },
      isPro: { type: Boolean, default: !0 },
    },
    setup(s) {
      const i = s,
        _ = P(),
        a = v(() => i.user || ""),
        b = v(() => i.user?.firstname || ""),
        r = v(() => {
          const c = i.user?.commune?.name || "",
            m = i.user?.commune?.region?.name || "";
          return `${c}, ${m}`.trim();
        }),
        u = v(() => {
          const c = a.value.publishedAdsCount || 0;
          return c === 0
            ? "No tiene anuncios publicados"
            : c === 1
              ? "1 anuncio publicado"
              : `${c} anuncios publicados`;
        });
      return (c, m) => (
        n(),
        d(
          "div",
          {
            class: O([
              s.isPro == !0 || s.isPublic == !1 ? "pro" : "",
              "sidebar sidebar--profile",
            ]),
          },
          [
            l("div", _e, [
              l("div", ge, [
                l("div", be, [
                  f(t(w), { size: "large", user: i.user }, null, 8, ["user"]),
                ]),
                l("h1", ve, C(b.value), 1),
                l("div", ye, C(u.value), 1),
              ]),
              t(_)
                ? (n(),
                  d("div", he, [
                    r.value
                      ? (n(),
                        g(
                          t(h),
                          {
                            key: 0,
                            title: "Ubicación",
                            description: r.value,
                            "truncate-text": !0,
                          },
                          null,
                          8,
                          ["description"],
                        ))
                      : p("", !0),
                    a.value.phone && a.value.phone !== null
                      ? (n(),
                        g(
                          t(h),
                          {
                            key: 1,
                            title: "Teléfono de contacto",
                            description: a.value.phone,
                            link: `tel:${a.value.phone}`,
                            "truncate-text": !0,
                          },
                          null,
                          8,
                          ["description", "link"],
                        ))
                      : p("", !0),
                    a.value.email
                      ? (n(),
                        g(
                          t(h),
                          {
                            key: 2,
                            title: "Correo electrónico",
                            description: a.value.email,
                            link: `mailto:${a.value.email}`,
                            "truncate-text": !0,
                          },
                          null,
                          8,
                          ["description", "link"],
                        ))
                      : p("", !0),
                    a.value.username
                      ? (n(),
                        g(
                          t(h),
                          {
                            key: 3,
                            title: "Link de perfil vendedor",
                            description: `Waldo.click/${a.value.username}`,
                            link: `/${a.value.username}`,
                            "truncate-text": !0,
                            "show-copy-button": !0,
                          },
                          null,
                          8,
                          ["description", "link"],
                        ))
                      : p("", !0),
                  ]))
                : (n(), d("div", $e, [l("div", ke, [f(t(ie))])])),
            ]),
          ],
          2,
        )
      );
    },
  },
  xe = { class: "profile profile--default" },
  Ce = { class: "profile--default__container" },
  Se = { class: "profile--default__sidebar" },
  Ae = { class: "profile--default__content" },
  Ue = { key: 2, class: "profile--default__content__list" },
  Ee = { key: 3, class: "profile--default__content__emptystate" },
  Ne = { key: 4, class: "profile--default__content__paginate" },
  qe = { class: "paginate" },
  Ie = U({
    __name: "ProfileDefault",
    props: {
      user: { type: Object, required: !0 },
      ads: { type: Array, required: !0 },
      pagination: { type: Object, required: !0 },
    },
    setup(s) {
      const i = s,
        _ = V(),
        a = z(),
        b = P(),
        r = M(),
        u = v(() => b.value?.id === i.user.id),
        c = (m) => {
          (window.scrollTo(0, 0),
            _.push({ query: { ...a.query, page: m.toString() } }));
        };
      return (m, o) => {
        const $ = j("vue-awesome-paginate"),
          x = H;
        return (
          n(),
          d("section", xe, [
            l("div", Ce, [
              l("div", Se, [f(Pe, { user: s.user }, null, 8, ["user"])]),
              l("div", Ae, [
                t(r).features.pro && u.value && s.user.pro_status !== "active"
                  ? (n(), g(ce, { key: 0 }))
                  : p("", !0),
                t(r).features.pro &&
                u.value &&
                s.user.pro_status === "active" &&
                (!s.user.avatar || !s.user.cover)
                  ? (n(),
                    g(
                      le,
                      {
                        key: 1,
                        icon: t(B),
                        text: "¡Felicidades! Ya eres usuario PRO. Ahora puedes personalizar tu perfil agregando una foto de perfil y una imagen de portada para destacar aún más.",
                        "button-text": "Personalizar perfil",
                        link: "/cuenta",
                      },
                      null,
                      8,
                      ["icon"],
                    ))
                  : p("", !0),
                s.ads && s.ads.length > 0
                  ? (n(),
                    d("div", Ue, [
                      (n(!0),
                      d(
                        F,
                        null,
                        L(
                          s.ads,
                          (e) => (
                            n(),
                            g(W, { key: e.id, all: e }, null, 8, ["all"])
                          ),
                        ),
                        128,
                      )),
                    ]))
                  : (n(),
                    d("div", Ee, [
                      f(ue, null, {
                        message: S(() => [
                          ...(o[1] || (o[1] = [T(" No hay anuncios ", -1)])),
                        ]),
                        _: 1,
                      }),
                    ])),
                s.pagination && s.pagination.pageCount > 1
                  ? (n(),
                    d("div", Ne, [
                      f(x, null, {
                        default: S(() => [
                          l("div", qe, [
                            f(
                              $,
                              {
                                modelValue: s.pagination.page,
                                "onUpdate:modelValue":
                                  o[0] ||
                                  (o[0] = (e) => (s.pagination.page = e)),
                                "total-items": s.pagination.total,
                                "items-per-page": s.pagination.pageSize,
                                "max-pages-shown": 5,
                                onClick: c,
                              },
                              null,
                              8,
                              ["modelValue", "total-items", "items-per-page"],
                            ),
                          ]),
                        ]),
                        _: 1,
                      }),
                    ]))
                  : p("", !0),
              ]),
            ]),
          ])
        );
      };
    },
  }),
  Re = Object.assign(Ie, { __name: "ProfileDefault" }),
  we = { key: 0, class: "page" },
  We = U({
    __name: "[slug]",
    async setup(s) {
      let i, _;
      const { $setSEO: a, $setStructuredData: b } = Y(),
        r = D(),
        u = ne(),
        c = String(r.params.slug || "");
      if (oe.includes(c))
        throw K({
          statusCode: 404,
          message: "Página no encontrada",
          statusMessage: "Lo sentimos, la página que buscas no existe.",
        });
      const m = Q(Number.parseInt(r.query.page?.toString() || "1", 10)),
        {
          data: o,
          pending: $,
          error: x,
        } = (([i, _] = Z(async () =>
          te(
            `adsData-${c}`,
            async () => {
              const e = ae(),
                y = String(r.params.slug || ""),
                k = re();
              if ((await e.loadUser(y), !e.user?.id)) return null;
              const E = { pageSize: 12, page: m.value },
                N = ["createdAt:desc"],
                q = {
                  active: { $eq: !0 },
                  remaining_days: { $gt: 0 },
                  user: { username: { $eq: y } },
                };
              return (
                await k.loadAds(q, E, N),
                { user: e.user, ads: k.ads, pagination: k.pagination }
              );
            },
            {
              watch: [() => r.params.slug, m],
              server: !0,
              lazy: !1,
              default: () => null,
            },
          ),
        )),
        (i = await i),
        _(),
        i);
      return (
        G(() => {
          o.value || J({ statusCode: 404, message: "Página no encontrada" });
        }),
        X(() => {
          $.value || (o.value && o.value.user);
        }),
        A(
          () => o.value,
          (e) => {
            if (!e || !e.user) return;
            const y = e.user.commune?.name
              ? `en ${e.user.commune.name}`
              : "en Chile";
            (a({
              title: `Perfil de ${e.user.username}`,
              description: `Vendedor verificado en Waldo.click®. Explora los anuncios de activos industriales de ${e.user.username} ${y} y compra directo al vendedor.`,
              imageUrl: e.user.avatar?.url || `${u.public.baseUrl}/share.jpg`,
              url: `${u.public.baseUrl}/${r.params.slug}`,
            }),
              b({
                "@context": "https://schema.org",
                "@type": "ProfilePage",
                name: `Perfil de ${e.user.username}`,
                description: `Perfil de vendedor de ${e.user.username} ${y}`,
                url: `${u.public.baseUrl}/${r.params.slug}`,
                mainEntity: {
                  "@type": e.user.is_company ? "Organization" : "Person",
                  name: e.user.is_company
                    ? e.user.business_name || e.user.username
                    : `${e.user.firstname || ""} ${e.user.lastname || ""}`.trim() ||
                      e.user.username,
                  image: e.user.avatar?.url || `${u.public.baseUrl}/share.jpg`,
                  url: `${u.public.baseUrl}/${r.params.slug}`,
                },
              }));
          },
          { immediate: !0 },
        ),
        A(
          () => r.query.page,
          (e) => {
            e && (m.value = Number.parseInt(e.toString(), 10));
          },
        ),
        (e, y) =>
          t(o) && t(o).user
            ? (n(),
              d("div", we, [
                f(ee, { "show-search": !0 }),
                f(fe, { user: t(o).user }, null, 8, ["user"]),
                t(o).user && t(o).ads && t(o).pagination
                  ? (n(),
                    g(
                      Re,
                      {
                        key: 0,
                        user: t(o).user,
                        ads: t(o).ads,
                        pagination: t(o).pagination,
                      },
                      null,
                      8,
                      ["user", "ads", "pagination"],
                    ))
                  : p("", !0),
                f(se),
              ]))
            : p("", !0)
      );
    },
  });
export { We as default };
//# sourceMappingURL=Byy42QCr.js.map

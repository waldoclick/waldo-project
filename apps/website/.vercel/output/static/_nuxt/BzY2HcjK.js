import { u as te } from "./CJzzMwWR.js";
import {
  aZ as D,
  b2 as P,
  a_ as r,
  a$ as g,
  bH as ne,
  bf as m,
  b0 as q,
  b5 as A,
  bS as oe,
  b7 as $,
  bi as N,
  bs as se,
  b9 as k,
  d8 as Q,
  bb as M,
  bm as ae,
  be as w,
  bG as H,
  bN as L,
  bn as G,
  bo as K,
  b6 as a,
  b8 as E,
  cQ as re,
  b1 as ie,
  bF as le,
  d9 as ce,
  bu as ue,
  c_ as de,
  d3 as me,
  b4 as W,
  cs as ge,
  d5 as ye,
  cu as pe,
  aY as fe,
  ba as B,
  cK as _e,
} from "./BK8sApmn.js";
import { u as ve } from "./De8hi3Om.js";
import { u as be } from "./B8_kTB4K.js";
import { _ as he } from "./ClGpxEC3.js";
import { u as $e } from "./Ctg5ZDgN.js";
import "./DJjbGNXS.js";
import "./CNKn_OHC.js";
import "./RG9bXWPx.js";
try {
  let n =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    l = new n.Error().stack;
  l &&
    ((n._sentryDebugIds = n._sentryDebugIds || {}),
    (n._sentryDebugIds[l] = "d23cefd8-7533-44ed-99a1-bde6148a8a7f"),
    (n._sentryDebugIdIdentifier =
      "sentry-dbid-d23cefd8-7533-44ed-99a1-bde6148a8a7f"));
} catch {}
const Se = { class: "hero--results__container" },
  Ae = { class: "hero--results__breadcrumbs" },
  qe = { class: "hero--results__title" },
  Ce = { class: "title title--category" },
  ke = { key: 0, class: "title--category__icon" },
  we = { class: "title--category__text title" },
  xe = { key: 0, class: "hero--results__query" },
  Ie = D({
    __name: "HeroResults",
    props: { bgColor: {}, title: {}, categoryIcon: {}, color: {} },
    setup(n) {
      const { bgColorWithTransparency: l } = $e(),
        c = n,
        h = P(),
        f = k(() => h.query.s?.toString() || ""),
        u = k(() => ({
          "--hero-bg-color": l(c.bgColor || "#f0f0f0"),
          "--category-icon-bg-color": c.color || "transparent",
        })),
        e = k(() => {
          const y = [{ label: "Anuncios", to: "/anuncios" }];
          return (
            c.title &&
              c.title !== "Anuncios" &&
              y.push({ label: c.title, to: "" }),
            y
          );
        });
      return (y, s) => (
        r(),
        g(
          "section",
          { class: "hero hero--results", style: ne(u.value) },
          [
            m("div", Se, [
              m("div", Ae, [q(he, { items: e.value }, null, 8, ["items"])]),
              m("div", qe, [
                m("div", Ce, [
                  n.categoryIcon
                    ? (r(),
                      g("div", ke, [
                        (r(),
                        A(oe(n.categoryIcon), {
                          size: 24,
                          class: "icon-category",
                        })),
                      ]))
                    : $("", !0),
                  m("h1", we, N(n.title), 1),
                ]),
              ]),
              f.value
                ? (r(),
                  g("div", xe, [
                    s[0] || (s[0] = se(" Resultados para: ", -1)),
                    m("b", null, N(f.value), 1),
                  ]))
                : $("", !0),
            ]),
          ],
          4,
        )
      );
    },
  }),
  Ee = Object.assign(Ie, { __name: "HeroResults" }),
  De = { class: "filter filter--announcement" },
  Re = { class: "filter--announcement__container" },
  je = { class: "filter--announcement__selectors" },
  Ne = { class: "filter--announcement__selector" },
  Pe = ["value"],
  Ue = {
    key: 1,
    class: "filter--announcement__select filter--announcement__select--loading",
  },
  Ve = { class: "filter--announcement__order" },
  Oe = {
    key: 1,
    class:
      "filter--announcement__select filter--announcement__select--simple filter--announcement__select--loading",
  },
  Fe = D({
    __name: "FilterResults",
    setup(n) {
      const l = Q(),
        c = P(),
        h = M(),
        f = E(!1),
        u = E("null"),
        e = E("featured");
      return (
        ae(() => {
          ((f.value = !0),
            (u.value = c.query.commune?.toString() || "null"),
            (e.value = c.query.order?.toString() || "featured"));
        }),
        w(u, (y) => {
          h.push({
            query: { ...c.query, commune: y !== "null" ? y : void 0, page: 1 },
          });
        }),
        w(e, (y) => {
          h.push({ query: { ...c.query, order: y, page: 1 } });
        }),
        (y, s) => (
          r(),
          g("section", De, [
            m("div", Re, [
              m("div", je, [
                m("div", Ne, [
                  f.value
                    ? H(
                        (r(),
                        g(
                          "select",
                          {
                            key: 0,
                            id: "ubication",
                            "onUpdate:modelValue":
                              s[0] || (s[0] = (b) => (u.value = b)),
                            class: "filter--announcement__select",
                          },
                          [
                            s[2] ||
                              (s[2] = m(
                                "option",
                                { value: "null" },
                                "Ubicación",
                                -1,
                              )),
                            (r(!0),
                            g(
                              G,
                              null,
                              K(
                                a(l).filterCommunes,
                                (b) => (
                                  r(),
                                  g(
                                    "option",
                                    { key: b.id, value: b.id },
                                    N(b.name),
                                    9,
                                    Pe,
                                  )
                                ),
                              ),
                              128,
                            )),
                          ],
                          512,
                        )),
                        [[L, u.value]],
                      )
                    : (r(), g("div", Ue, " Cargando... ")),
                ]),
              ]),
              m("div", Ve, [
                s[4] || (s[4] = m("label", null, "Ordenar por:", -1)),
                f.value
                  ? H(
                      (r(),
                      g(
                        "select",
                        {
                          key: 0,
                          "onUpdate:modelValue":
                            s[1] || (s[1] = (b) => (e.value = b)),
                          class:
                            "filter--announcement__select filter--announcement__select--simple",
                        },
                        [
                          ...(s[3] ||
                            (s[3] = [
                              m(
                                "option",
                                { value: "featured" },
                                "Destacados",
                                -1,
                              ),
                              m("option", { value: "recent" }, "Recientes", -1),
                            ])),
                        ],
                        512,
                      )),
                      [[L, e.value]],
                    )
                  : (r(), g("div", Oe, " Cargando... ")),
              ]),
            ]),
          ])
        )
      );
    },
  }),
  Te = Object.assign(Fe, { __name: "FilterResults" }),
  ze = { class: "announcement announcement--archive" },
  He = { class: "container" },
  Le = { key: 0, class: "announcement--archive__list" },
  We = { key: 1, class: "announcement--archive__paginate" },
  Be = { class: "paginate" },
  Qe = D({
    __name: "AdArchive",
    props: {
      ads: { type: Array, default: () => [] },
      pagination: { type: Object, default: () => ({}) },
    },
    setup(n) {
      const l = M(),
        c = P(),
        h = (f) => {
          (window.scrollTo(0, 0),
            l.push({ query: { ...c.query, page: f.toString() } }));
        };
      return (f, u) => {
        const e = re("vue-awesome-paginate"),
          y = le;
        return (
          r(),
          g("section", ze, [
            m("div", He, [
              n.ads && n.ads.length > 0
                ? (r(),
                  g("div", Le, [
                    (r(!0),
                    g(
                      G,
                      null,
                      K(
                        n.ads,
                        (s) => (r(), A(ce, { all: s }, null, 8, ["all"])),
                      ),
                      256,
                    )),
                  ]))
                : $("", !0),
              n.pagination &&
              n.pagination.pageCount > 1 &&
              n.pagination.total > n.pagination.pageSize
                ? (r(),
                  g("div", We, [
                    q(y, null, {
                      default: ie(() => [
                        m("div", Be, [
                          q(
                            e,
                            {
                              modelValue: n.pagination.page,
                              "onUpdate:modelValue":
                                u[0] || (u[0] = (s) => (n.pagination.page = s)),
                              "total-items": n.pagination.total,
                              "items-per-page": n.pagination.pageSize,
                              "max-pages-shown": 5,
                              onClick: h,
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
                : $("", !0),
            ]),
          ])
        );
      };
    },
  }),
  Me = Object.assign(Qe, { __name: "AdArchive" }),
  Ge = { class: "page" },
  st = D({
    __name: "index",
    async setup(n) {
      let l, c;
      const { $setSEO: h, $setStructuredData: f } = ue(),
        u = fe(),
        e = de(),
        y = ve(),
        s = me(),
        b = Q(),
        { getCategoryIcon: Y } = be(),
        Z = k(() => (S.value ? Y(S.value) : void 0)),
        S = k(() => e.query.category?.toString() || ""),
        { data: C } =
          (([l, c] = W(async () =>
            B(
              () => `category-${S.value}`,
              async () =>
                S.value
                  ? (await y.loadCategory(S.value), y.category ?? null)
                  : null,
              { watch: [S], server: !0, default: () => null },
            ),
          )),
          (l = await l),
          c(),
          l),
        { data: o } =
          (([l, c] = W(async () =>
            B(
              () =>
                `adsData-${e.query.category || "all"}-${e.query.page || "1"}-${e.query.order || "default"}-${e.query.commune || "all"}-${e.query.s || ""}`,
              async () => {
                (await b.loadFilterCommunes(), s.reset());
                const i = e.query.category?.toString() || null,
                  t = Number.parseInt(e.query.page?.toString() || "1", 10),
                  _ = e.query.order?.toString() || void 0,
                  v = e.query.commune?.toString() || null,
                  p = e.query.s?.toString() || "",
                  d = { pageSize: 20, page: t },
                  X =
                    _ === "featured" || _ === void 0
                      ? ["sort_priority:asc", "createdAt:desc"]
                      : ["createdAt:desc"],
                  ee = {
                    ...(p && { name: { $containsi: p } }),
                    ...(i && { category: { slug: { $eq: i } } }),
                    ...(v && { commune: { id: { $eq: v } } }),
                  };
                await s.loadAds(ee, d, X);
                const O = s.ads,
                  F = s.pagination;
                let T = [],
                  R = !1,
                  z = null;
                if (O.length === 0 && F.total === 0) {
                  R = !0;
                  try {
                    (await s.loadAds({}, { page: 1, pageSize: 12 }, [
                      "sort_priority:asc",
                      "createdAt:desc",
                    ]),
                      (T = s.ads));
                  } catch (j) {
                    z = j instanceof Error ? j.message : String(j);
                  }
                  R = !1;
                }
                return {
                  ads: O,
                  pagination: F,
                  relatedAds: T,
                  relatedLoading: R,
                  relatedError: z,
                };
              },
              {
                watch: [
                  () => e.query.category,
                  () => e.query.page,
                  () => e.query.order,
                  () => e.query.commune,
                  () => e.query.s,
                ],
                server: !0,
                default: () => ({
                  ads: [],
                  pagination: { page: 1, pageSize: 20, pageCount: 0, total: 0 },
                  relatedAds: [],
                  relatedLoading: !1,
                  relatedError: null,
                }),
              },
            ),
          )),
          (l = await l),
          c(),
          l),
        x = () => {
          const i = e.query.s?.toString(),
            t = C.value?.name,
            _ = e.query.commune?.toString(),
            v = o.value?.ads.find(
              (d) =>
                typeof d.commune == "object" &&
                d.commune !== null &&
                d.commune.id?.toString() === _,
            )?.commune,
            p = typeof v == "object" && v !== null ? v.name : void 0;
          if (i) {
            let d = `Buscando "${i}"`;
            return (t && t !== "Anuncios" && (d += ` en ${t}`), d);
          }
          return !t || t === "Anuncios"
            ? p
              ? `Activos Industriales en ${p}`
              : "Anuncios de Activos Industriales"
            : t && p
              ? `Anuncios de ${t} en ${p}`
              : t
                ? `Anuncios de ${t} en Chile`
                : "Anuncios de Activos Industriales";
        },
        I = () => {
          const i = e.query.s?.toString(),
            t = C.value?.name,
            _ = e.query.commune?.toString(),
            v = o.value?.ads.find(
              (d) =>
                typeof d.commune == "object" &&
                d.commune !== null &&
                d.commune.id?.toString() === _,
            )?.commune,
            p = typeof v == "object" && v !== null ? v.name : void 0;
          if (i) {
            let d = `Resultados para "${i}" en Waldo.click®. Activos industriales en Chile`;
            return (
              t && t !== "Anuncios" && (d += `: ${t}`),
              p && (d += `, ${p}`),
              `${d}. Equipos nuevos y usados a los mejores precios.`
            );
          }
          return !t || t === "Anuncios"
            ? p
              ? `Encuentra anuncios de activos industriales en ${p}. Equipos industriales nuevos y usados disponibles en Waldo.click®.`
              : "Encuentra anuncios de activos industriales en todo Chile. Equipos nuevos y usados de todas las categorías disponibles en Waldo.click®."
            : t && p
              ? `Explora anuncios de ${t} en ${p}. Activos industriales disponibles en Waldo.click®. Contacta al vendedor directamente.`
              : `Explora anuncios de ${t} en Chile. Activos industriales nuevos y usados disponibles en Waldo.click®. Compra y vende en minutos.`;
        };
      (o.value &&
        (h({
          title: x(),
          description: I(),
          imageUrl: `${u.public.baseUrl}/share.jpg`,
          url: `${u.public.baseUrl}${e.fullPath}`,
        }),
        f({
          "@context": "https://schema.org",
          "@type": "SearchResultsPage",
          name: x(),
          description: I(),
          url: `${u.public.baseUrl}${e.fullPath}`,
        })),
        w(
          [() => o.value, () => e.query],
          () => {
            o.value &&
              (h({
                title: x(),
                description: I(),
                imageUrl: `${u.public.baseUrl}/share.jpg`,
                url: `${u.public.baseUrl}${e.fullPath}`,
              }),
              f({
                "@context": "https://schema.org",
                "@type": "SearchResultsPage",
                name: x(),
                description: I(),
                url: `${u.public.baseUrl}${e.fullPath}`,
              }));
          },
          { immediate: !0 },
        ));
      const U = te();
      w(
        () => o.value,
        (i) => {
          i && i.ads.length > 0 && U.viewItemListPublic(i.ads);
        },
        { immediate: !0 },
      );
      const V = E(null),
        J = (i, t) =>
          i ||
          (t
            ? (b.filterCommunes.find((v) => v.id.toString() === t)?.name ?? t)
            : null);
      return (
        w([() => e.query.s, () => e.query.commune], ([i, t]) => {
          const _ = J(i?.toString(), t?.toString());
          _ && _ !== V.value && ((V.value = _), U.search(_));
        }),
        (i, t) => (
          r(),
          g("div", Ge, [
            q(ge, { "show-search": !0 }),
            q(
              Ee,
              {
                "bg-color": a(C)?.color || "#f0f0f0",
                color: a(C)?.color || "#f0f0f0",
                title: a(C)?.name || "Anuncios",
                "category-icon": Z.value,
              },
              null,
              8,
              ["bg-color", "color", "title", "category-icon"],
            ),
            a(o) && a(o).ads && a(o).ads.length > 0
              ? (r(), A(Te, { key: 0 }))
              : $("", !0),
            a(o) && a(o).ads && a(o).ads.length > 0
              ? (r(),
                A(
                  Me,
                  { key: 1, ads: a(o).ads, pagination: a(o).pagination },
                  null,
                  8,
                  ["ads", "pagination"],
                ))
              : $("", !0),
            a(o) && a(o).ads && a(o).ads.length === 0
              ? (r(),
                A(_e, {
                  key: 2,
                  type: "fail",
                  title: "No hay anuncios con esos filtros",
                  description:
                    "Prueba ajustando tu búsqueda o mira lo que tenemos disponible",
                  button_label: "Ver más anuncios",
                  button_link: "/anuncios",
                  button_show: !0,
                }))
              : $("", !0),
            a(o) &&
            a(o).ads &&
            a(o).ads.length === 0 &&
            a(o).relatedAds &&
            a(o).relatedAds.length > 0
              ? (r(),
                A(
                  ye,
                  {
                    key: 3,
                    ads: a(o).relatedAds,
                    loading: a(o).relatedLoading,
                    error: a(o).relatedError || null,
                    title: "Equipos destacados",
                    text: "Los mejores activos industriales del momento",
                    "center-head": !0,
                  },
                  null,
                  8,
                  ["ads", "loading", "error"],
                ))
              : $("", !0),
            q(pe),
          ])
        )
      );
    },
  });
export { st as default };
//# sourceMappingURL=BzY2HcjK.js.map

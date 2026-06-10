import {
  bD as V,
  aZ as P,
  a_ as s,
  a$ as l,
  bf as r,
  bn as z,
  bo as D,
  bi as S,
  b0 as _,
  b6 as h,
  bs as x,
  b7 as g,
  b5 as v,
  b9 as E,
  cO as L,
  cM as R,
  bt as O,
  cF as q,
  bv as U,
  cP as H,
  bk as K,
  bB as G,
  b1 as B,
  br as j,
  cQ as W,
  bF as X,
  cR as I,
  bO as F,
  bC as Y,
  bS as Q,
  cN as Z,
  bK as J,
  be as ee,
  ba as te,
  bu as ae,
  bw as ne,
  b8 as $,
  cq as oe,
  cz as se,
} from "./BK8sApmn.js";
import { B as w } from "./CsW763hY.js";
import { S as ie } from "./BZT4iOTd.js";
import { E as M } from "./DvfQSOKW.js";
import { I as T } from "./BZsGLQuR.js";
import { E as re } from "./27XRtptg.js";
import { C as ce } from "./CNZV9sYn.js";
import { C as le } from "./-VADgLbk.js";
import { C as ue, B as de } from "./Bj3T-MQP.js";
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
    d = new t.Error().stack;
  d &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[d] = "c8c7ff01-7e39-407f-8711-e4f78e8791e4"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-c8c7ff01-7e39-407f-8711-e4f78e8791e4"));
} catch {}
const me = V("power", [
  ["path", { d: "M12 2v10", key: "mnfbl" }],
  ["path", { d: "M18.4 6.6a9 9 0 1 1-12.77.04", key: "obofu9" }],
]);
const fe = V("refresh-cw", [
    [
      "path",
      {
        d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",
        key: "v9h5vc",
      },
    ],
    ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
    [
      "path",
      {
        d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
        key: "3uifl3",
      },
    ],
    ["path", { d: "M8 16H3v5", key: "1cv678" }],
  ]),
  _e = { class: "card card--profileAd" },
  pe = { class: "card--profileAd__left" },
  be = { class: "card--profileAd__images" },
  ge = { key: 0, class: "card--profileAd__images__placeholder" },
  he = { class: "card--profileAd__info" },
  ve = { class: "card--profileAd__info__title" },
  ye = { class: "card--profileAd__info__text" },
  Ce = { class: "card--profileAd__highlight" },
  Ae = { key: 0, class: "card--profileAd__highlight__title" },
  ke = { class: "card--profileAd__highlight__text" },
  $e = { class: "card--profileAd__right" },
  we = { class: "card--profileAd__button" },
  xe = P({
    __name: "CardProfileAd",
    props: {
      ad: { type: Object, required: !1, default: () => ({}) },
      status: { type: String, default: "" },
    },
    setup(t) {
      const { Swal: d } = K(),
        { transformUrl: p } = O(),
        n = t,
        o = E(() => {
          const a = n.ad?.gallery || [],
            e = Math.max(0, a.length - 5);
          return a.slice(e).map((c) => p(c.url));
        }),
        f = E(() => {
          const a = n.ad?.status,
            e = n.ad?.remaining_days,
            c = n.ad?.createdAt ? new Date(n.ad.createdAt).getTime() : 0,
            b = Date.now(),
            m = Math.floor((b - c) / (1e3 * 60 * 60)),
            u = Math.floor(m / 24);
          if (!a) return "";
          switch (a) {
            case "published":
              return e === 1 ? "Expira en 1 día" : `Expira en ${e} días`;
            case "review":
              return m < 24
                ? m === 0
                  ? "En revisión hace menos de 1 hora"
                  : m === 1
                    ? "En revisión hace 1 hora"
                    : `En revisión hace ${m} horas`
                : u === 1
                  ? "En revisión hace 1 día"
                  : `En revisión hace ${u} días`;
            case "expired":
              return u === 1
                ? "Expirado hace 1 día"
                : `Expirado hace ${u} días`;
            case "rejected":
              return u === 1
                ? "Rechazado hace 1 día"
                : `Rechazado hace ${u} días`;
            case "banned":
              return u === 1
                ? "Baneado hace 1 día"
                : u > 0
                  ? `Baneado hace ${u} días`
                  : "Baneado";
            default:
              return "";
          }
        }),
        y = (a) => {
          if (!a) return "";
          const e = new Date(a),
            c = [
              "enero",
              "febrero",
              "marzo",
              "abril",
              "mayo",
              "junio",
              "julio",
              "agosto",
              "septiembre",
              "octubre",
              "noviembre",
              "diciembre",
            ],
            b = e.getDate(),
            m = c[e.getMonth()],
            u = e.getFullYear();
          return `${b} de ${m} del ${u}`;
        },
        C = async () => {
          const a = n.ad,
            e = q(),
            c = U(),
            b = async () => {
              if (!a) return;
              (e.reset(),
                e.updatePrice(Number(a.price)),
                e.updateName(a.name),
                e.updateCategory(a.category.id),
                e.updateEmail(a.email),
                e.updatePhone(a.phone),
                c.getCommunes.data.length === 0 && (await c.loadCommunes()));
              const m = c.getCommuneById(a.commune.id)?.region.id;
              (m && e.updateRegion(m),
                e.updateCommune(a.commune.id),
                e.updateAddress(a.address),
                e.updateAddressNumber(a.address_number),
                e.updateCondition(a.condition.id),
                e.updateDescription(a.description),
                e.updateManufacturer(a.manufacturer),
                e.updateModel(a.model),
                e.updateYear(Number(a.year)),
                e.updateSerialNumber(a.serial_number),
                e.updateWeight(Number(a.weight)),
                e.updateWidth(Number(a.width)),
                e.updateHeight(Number(a.height)),
                e.updateDepth(Number(a.depth)),
                e.updateCurrency(a.currency));
              const u = a.gallery.map((N) => ({
                id: String(N.id),
                url: p(N.url),
              }));
              (e.updateGallery(u),
                a.details &&
                  (e.updatePack(a.details.pack),
                  e.updateFeatured(a.details.featured),
                  e.updateIsInvoice(a.details.is_invoice)),
                e.updateStep(1),
                H("/anunciar"));
            };
          e.hasFormInProgress
            ? d
                .fire({
                  title: "Formulario en progreso",
                  text: "Hay un formulario de anuncio sin terminar. ¿Deseas descartarlo y comenzar uno nuevo?",
                  icon: "warning",
                  showCancelButton: !0,
                  confirmButtonText: "Sí, descartar",
                  cancelButtonText: "No, mantener el actual",
                })
                .then((m) => {
                  m.isConfirmed && b();
                })
            : await b();
        },
        i = () => {
          d.fire({
            title: "Razón del rechazo",
            text: n.ad?.reason_for_rejection || "No se especificó una razón",
            icon: "info",
            confirmButtonText: "Entendido",
          });
        },
        A = () => {
          d.fire({
            title: "Razón del baneo",
            text: n.ad?.reason_for_ban || "No se especificó una razón",
            icon: "info",
            confirmButtonText: "Entendido",
          });
        },
        k = () => {
          L().openDeactivateLightbox(n.ad.documentId);
        };
      return (a, e) => {
        const c = R;
        return (
          s(),
          l("article", _e, [
            r("div", pe, [
              r("div", be, [
                (s(),
                l(
                  z,
                  null,
                  D(
                    5,
                    (b) => (
                      s(),
                      l(
                        z,
                        { key: b },
                        [
                          o.value[4 - (b - 1)]
                            ? (s(),
                              v(
                                c,
                                {
                                  key: 1,
                                  class: "card--profileAd__images__img",
                                  loading: "lazy",
                                  src: o.value[4 - (b - 1)],
                                  alt: t.ad?.title,
                                  title: t.ad?.title,
                                  remote: "",
                                },
                                null,
                                8,
                                ["src", "alt", "title"],
                              ))
                            : (s(), l("div", ge)),
                        ],
                        64,
                      )
                    ),
                  ),
                  64,
                )),
              ]),
              r("div", he, [
                r("div", ve, S(y(t.ad?.createdAt)), 1),
                r("div", ye, S(t.ad?.name), 1),
              ]),
              r("div", Ce, [
                t.ad?.details?.featured
                  ? (s(),
                    l("div", Ae, [
                      _(h(ie), { size: 16 }),
                      e[0] || (e[0] = x(" Anuncio destacado ", -1)),
                    ]))
                  : g("", !0),
                r("div", ke, S(f.value), 1),
              ]),
            ]),
            r("div", $e, [
              r("div", we, [
                t.ad?.status === "published" && t.ad?.slug
                  ? (s(),
                    l(
                      z,
                      { key: 0 },
                      [
                        _(
                          w,
                          {
                            icon: h(M),
                            to: `/anuncios/${t.ad?.slug}`,
                            title: "Ver anuncio",
                            "aria-label": "Ver anuncio",
                            target: "_blank",
                            rel: "noopener noreferrer",
                          },
                          null,
                          8,
                          ["icon", "to"],
                        ),
                        _(
                          w,
                          {
                            icon: h(me),
                            title: "Desactivar publicación",
                            "aria-label": "Desactivar publicación",
                            onClick: k,
                          },
                          null,
                          8,
                          ["icon"],
                        ),
                      ],
                      64,
                    ))
                  : g("", !0),
                t.ad?.status === "review" && t.ad?.slug
                  ? (s(),
                    v(
                      w,
                      {
                        key: 1,
                        icon: h(M),
                        to: `/anuncios/${t.ad?.slug}`,
                        title: "Previsualizar anuncio",
                        "aria-label": "Previsualizar anuncio",
                        target: "_blank",
                        rel: "noopener noreferrer",
                      },
                      null,
                      8,
                      ["icon", "to"],
                    ))
                  : g("", !0),
                t.ad?.status === "rejected"
                  ? (s(),
                    v(
                      w,
                      {
                        key: 2,
                        icon: h(T),
                        title: "Ver razón",
                        "aria-label": "Ver razón",
                        onClick: i,
                      },
                      null,
                      8,
                      ["icon"],
                    ))
                  : g("", !0),
                t.ad?.status === "expired"
                  ? (s(),
                    v(
                      w,
                      {
                        key: 3,
                        icon: h(fe),
                        title: "Publicar nuevamente",
                        "aria-label": "Publicar nuevamente",
                        onClick: C,
                      },
                      null,
                      8,
                      ["icon"],
                    ))
                  : g("", !0),
                t.ad?.status === "banned"
                  ? (s(),
                    v(
                      w,
                      {
                        key: 4,
                        icon: h(T),
                        title: "Ver razón",
                        "aria-label": "Ver razón",
                        onClick: A,
                      },
                      null,
                      8,
                      ["icon"],
                    ))
                  : g("", !0),
              ]),
            ]),
          ])
        );
      };
    },
  }),
  Se = Object.assign(G(xe, [["__scopeId", "data-v-34522021"]]), {
    __name: "CardProfileAd",
  }),
  ze = P({
    __name: "ButtonCreate",
    setup(t) {
      return (d, p) => {
        const n = j;
        return (
          s(),
          v(
            n,
            {
              to: "/anunciar",
              class: "btn btn--create",
              title: "Publicar nuevo anuncio",
            },
            {
              default: B(() => [
                _(h(ce), { size: 20, class: "icon-plus" }),
                p[0] || (p[0] = x(" Publicar nuevo anuncio ", -1)),
              ]),
              _: 1,
            },
          )
        );
      };
    },
  }),
  Be = Object.assign(ze, { __name: "ButtonCreate" }),
  Pe = {
    class: "account account--announcements",
    "aria-labelledby": "announcements-title",
  },
  De = {
    id: "announcements-title",
    class: "account--announcements__title title",
  },
  Ne = { class: "account--announcements__subtitle" },
  Ee = { class: "account--announcements__list" },
  Ie = { class: "account--announcements__list__menu", role: "tablist" },
  Fe = [
    "id",
    "aria-selected",
    "aria-controls",
    "title",
    "onClick",
    "onKeydown",
  ],
  Me = { class: "account--announcements__list__items" },
  Te = {
    key: 0,
    class: "account--announcements__loading",
    "aria-live": "polite",
  },
  Ve = ["id", "aria-labelledby"],
  je = { key: 0, class: "account--announcements__list__items__paginate" },
  Le = { class: "paginate", "aria-label": "Paginación" },
  Re = ["id", "aria-labelledby"],
  Oe = { class: "account--announcements__button" },
  qe = P({
    __name: "AccountAnnouncements",
    props: {
      ads: {},
      currentFilter: {},
      currentPage: {},
      pagination: {},
      isLoading: { type: Boolean },
      introText: {},
      tabs: {},
    },
    emits: ["filter-change", "page-change"],
    setup(t) {
      const d = (n) => {
          const o = document.querySelectorAll('[role="tab"]'),
            f = n < o.length - 1 ? n + 1 : 0;
          o[f].focus();
        },
        p = (n) => {
          const o = document.querySelectorAll('[role="tab"]'),
            f = n > 0 ? n - 1 : o.length - 1;
          o[f].focus();
        };
      return (n, o) => {
        const f = j,
          y = W("vue-awesome-paginate"),
          C = X;
        return (
          s(),
          l("section", Pe, [
            r("h2", De, [
              o[2] || (o[2] = x(" Mis anuncios ", -1)),
              _(
                f,
                { to: "/#como-publicar", title: "¿Cómo anunciar?" },
                {
                  default: B(() => [
                    ...(o[1] || (o[1] = [x(" ¿Cómo anunciar? ", -1)])),
                  ]),
                  _: 1,
                },
              ),
            ]),
            r("div", Ne, S(t.introText), 1),
            _(C, null, {
              default: B(() => [
                r("div", Ee, [
                  o[4] ||
                    (o[4] = r(
                      "div",
                      {
                        class: "account--announcements__list__sr-only sr-only",
                        "aria-live": "polite",
                      },
                      " Use las flechas izquierda y derecha para navegar entre las pestañas ",
                      -1,
                    )),
                  r("div", Ie, [
                    (s(!0),
                    l(
                      z,
                      null,
                      D(
                        t.tabs,
                        (i, A) => (
                          s(),
                          l(
                            "button",
                            {
                              id: `tab-${i.value}`,
                              key: i.value,
                              type: "button",
                              role: "tab",
                              "aria-selected": t.currentFilter === i.value,
                              "aria-controls": `panel-${i.value}`,
                              class: Y({ active: t.currentFilter === i.value }),
                              title: i.label,
                              onClick: (k) => n.$emit("filter-change", i.value),
                              onKeydown: [
                                I(
                                  F((k) => d(A), ["prevent"]),
                                  ["right"],
                                ),
                                I(
                                  F((k) => p(A), ["prevent"]),
                                  ["left"],
                                ),
                              ],
                            },
                            [
                              (s(), v(Q(i.icon), { size: 16, class: "mr-2" })),
                              x(" " + S(i.label) + " ", 1),
                              r("span", null, "(" + S(i.count) + ")", 1),
                            ],
                            42,
                            Fe,
                          )
                        ),
                      ),
                      128,
                    )),
                  ]),
                  r("div", Me, [
                    t.isLoading ? (s(), l("div", Te, [_(Z)])) : g("", !0),
                    !t.isLoading && t.ads.length > 0
                      ? (s(),
                        l(
                          "div",
                          {
                            key: 1,
                            id: `panel-${t.currentFilter}`,
                            class:
                              "account--announcements__list__items__wrapper",
                            role: "tabpanel",
                            "aria-labelledby": `tab-${t.currentFilter}`,
                          },
                          [
                            (s(!0),
                            l(
                              z,
                              null,
                              D(
                                t.ads,
                                (i) => (
                                  s(),
                                  v(Se, { key: i.id, ad: i }, null, 8, ["ad"])
                                ),
                              ),
                              128,
                            )),
                            t.pagination.total > t.pagination.pageSize
                              ? (s(),
                                l("div", je, [
                                  r("div", Le, [
                                    _(
                                      y,
                                      {
                                        "model-value": t.currentPage,
                                        "total-items": t.pagination.total,
                                        "items-per-page": t.pagination.pageSize,
                                        "max-pages-shown": 5,
                                        "onUpdate:modelValue":
                                          o[0] ||
                                          (o[0] = (i) =>
                                            n.$emit("page-change", i)),
                                      },
                                      null,
                                      8,
                                      [
                                        "model-value",
                                        "total-items",
                                        "items-per-page",
                                      ],
                                    ),
                                  ]),
                                ]))
                              : g("", !0),
                          ],
                          8,
                          Ve,
                        ))
                      : g("", !0),
                    !t.isLoading && t.ads.length === 0
                      ? (s(),
                        l(
                          "div",
                          {
                            key: 2,
                            id: `panel-${t.currentFilter}`,
                            class:
                              "account--announcements__list__items__emptystate",
                            role: "tabpanel",
                            "aria-labelledby": `tab-${t.currentFilter}`,
                          },
                          [
                            _(re, null, {
                              message: B(() => [
                                ...(o[3] ||
                                  (o[3] = [x(" No hay anuncios ", -1)])),
                              ]),
                              _: 1,
                            }),
                          ],
                          8,
                          Re,
                        ))
                      : g("", !0),
                  ]),
                ]),
              ]),
              _: 1,
            }),
            r("div", Oe, [_(Be)]),
          ])
        );
      };
    },
  }),
  Ue = Object.assign(qe, { __name: "AccountAnnouncements" }),
  He = { class: "page" },
  tt = P({
    __name: "mis-anuncios",
    setup(t) {
      const d = $([
          { value: "published", label: "Activos", count: 0, icon: oe },
          { value: "review", label: "Pendientes", count: 0, icon: le },
          { value: "expired", label: "Expirados", count: 0, icon: ue },
          { value: "rejected", label: "Rechazados", count: 0, icon: se },
          { value: "banned", label: "Baneados", count: 0, icon: de },
        ]),
        p = $([]),
        n = $("published"),
        o = $(1),
        f = $({ total: 0, pageSize: 10 }),
        y = $(!1),
        C = J(),
        i = async () => {
          y.value = !0;
          try {
            const e = await C.loadUserAds(
              n.value,
              { page: o.value, pageSize: f.value.pageSize },
              ["createdAt:desc"],
            );
            if (e) {
              p.value = e.data;
              const c = e.meta.pagination.total;
              f.value.total = c;
            }
          } catch {
          } finally {
            y.value = !1;
          }
        },
        A = (e) => {
          ((n.value = e), (o.value = 1));
        },
        k = (e) => {
          o.value = e;
        };
      (ee([n, o], () => {
        i();
      }),
        te(async () => {
          const e = await C.loadUserAdCounts();
          for (const c of d.value) c.count = e[c.value] ?? 0;
          await i();
        }, "$v1noXfoVo6"));
      const { $setSEO: a } = ae();
      return (
        a({
          title: "Mis Anuncios",
          description:
            "Gestiona tus anuncios activos y archivados en Waldo.click®.",
        }),
        ne({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        (e, c) => (
          s(),
          l("div", He, [
            _(
              Ue,
              {
                "intro-text":
                  "Aquí podrás ver el estado de tus publicaciones, revisar los anuncios pendientes de aprobación y dar seguimiento a todo tu contenido.",
                ads: p.value,
                "current-filter": n.value,
                "current-page": o.value,
                pagination: f.value,
                "is-loading": y.value,
                tabs: d.value,
                onFilterChange: A,
                onPageChange: k,
              },
              null,
              8,
              [
                "ads",
                "current-filter",
                "current-page",
                "pagination",
                "is-loading",
                "tabs",
              ],
            ),
          ])
        )
      );
    },
  });
export { tt as default };
//# sourceMappingURL=CJ59eU3e.js.map

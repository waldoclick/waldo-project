import {
  aZ as h,
  a_ as _,
  a$ as b,
  bf as o,
  bi as g,
  b0 as c,
  br as I,
  b1 as v,
  b7 as L,
  b5 as A,
  b6 as k,
  bj as T,
  cF as x,
  bb as R,
  bM as D,
  bm as P,
  bF as E,
  b8 as F,
  bu as j,
  bx as M,
  b3 as O,
  b4 as U,
  be as S,
  bw as N,
  cs as V,
  aY as W,
  ba as q,
} from "./BK8sApmn.js";
import { u as H } from "./CAHpseH1.js";
import { _ as z, a as G, b as Y } from "./CmMYCT_o.js";
import { B as Z } from "./C0j-iZe8.js";
import { u as J } from "./CJzzMwWR.js";
import { u as K } from "./De8hi3Om.js";
import "./CsS7OJ1I.js";
import "./JxRx1s6n.js";
import "./DrPuZ622.js";
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
    n = new t.Error().stack;
  n &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[n] = "33968b35-cbd5-427e-8b24-aacdea658a9d"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-33968b35-cbd5-427e-8b24-aacdea658a9d"));
} catch {}
const Q = { class: "alert alert--default" },
  X = { class: "alert--default__title" },
  ee = { class: "alert--default__text" },
  te = { key: 0, class: "alert--default__button" },
  ae = h({
    __name: "AlertDefault",
    props: {
      title: {
        type: String,
        default: "Todavía no has subido ningún anuncio, ¡hazlo ahora!",
      },
      text: { type: String, default: "Tienes 3 anuncios gratuitos para usar" },
      button: { type: String, default: "" },
      to: { type: String, default: "" },
    },
    setup(t) {
      return (n, u) => {
        const l = I;
        return (
          _(),
          b("div", Q, [
            o("div", X, g(t.title), 1),
            o("div", ee, g(t.text), 1),
            t.button && t.to
              ? (_(),
                b("div", te, [
                  c(
                    l,
                    { to: t.to, title: t.button, class: "btn btn--buy" },
                    {
                      default: v(() => [o("span", null, g(t.button), 1)]),
                      _: 1,
                    },
                    8,
                    ["to", "title"],
                  ),
                ]))
              : L("", !0),
          ])
        );
      };
    },
  }),
  ne = Object.assign(ae, { __name: "AlertDefault" }),
  se = { class: "form__field" },
  ie = {
    __name: "FormCreateOne",
    emits: ["formSubmitted", "formBack"],
    setup(t, { emit: n }) {
      const u = n,
        { paymentSummaryText: l } = H(),
        p = async (r) => {
          u("formSubmitted", r);
        },
        m = async () => {
          u("formBack");
        };
      return (r, s) => (
        _(),
        A(
          k(T),
          { class: "form form--create", onSubmit: p },
          {
            default: v(({ meta: i }) => [
              s[0] ||
                (s[0] = o(
                  "div",
                  { class: "form__field" },
                  [
                    o(
                      "h2",
                      { class: "form__title" },
                      "¿Cómo quieres publicar tu anuncio?",
                    ),
                    o("div", { class: "form__description" }, [
                      o(
                        "p",
                        null,
                        " Elige la forma como quieres publicar, si tienes anuncios úsalos, si no tienes compra uno individual o un Pack, a todos les puedes adjuntar un destacado. ",
                      ),
                    ]),
                  ],
                  -1,
                )),
              o("div", se, [c(z), c(G), c(Y)]),
              c(
                Z,
                {
                  percentage: 0,
                  "current-step": 1,
                  "total-steps": 5,
                  "show-steps": !0,
                  "summary-text": k(l),
                  "primary-label": "Continuar",
                  "primary-disabled": !i.valid,
                  "show-back": !1,
                  onBack: m,
                },
                null,
                8,
                ["summary-text", "primary-disabled"],
              ),
            ]),
            _: 1,
          },
        )
      );
    },
  },
  oe = { class: "create create--announcement" },
  re = { class: "create--announcement__container" },
  ce = { key: 1, class: "create--announcement__steps" },
  ue = { class: "step step--1" },
  de = h({
    __name: "CreateAd",
    setup(t) {
      const n = x(),
        u = R(),
        l = D(),
        p = F(!1);
      P(async () => {
        p.value = await l.isProfileComplete();
      });
      function m(r) {
        (n.updateStep(2), u.push("/anunciar/datos-del-producto"));
      }
      return (r, s) => {
        const i = ne,
          f = E;
        return (
          _(),
          b("section", oe, [
            o("div", re, [
              c(f, null, {
                default: v(() => [
                  p.value
                    ? (_(),
                      b("div", ce, [
                        o("div", ue, [c(ie, { onFormSubmitted: m })]),
                      ]))
                    : (_(),
                      A(i, {
                        key: 0,
                        title: "Tu perfil aún está incompleto",
                        text: "Completa tu perfil antes de crear tu primer anuncio",
                        button: "Editar mi perfil",
                        to: "/cuenta/perfil/editar",
                      })),
                ]),
                _: 1,
              }),
            ]),
          ])
        );
      };
    },
  }),
  le = Object.assign(de, { __name: "CreateAd" }),
  me = { class: "page" },
  ke = h({
    __name: "index",
    async setup(t) {
      let n, u;
      const { $setSEO: l, $setStructuredData: p } = j(),
        m = W(),
        r = J(),
        s = M(),
        i = x(),
        f = D(),
        $ = K(),
        w = O(),
        { data: C } =
          (([n, u] = U(async () =>
            q(
              "anunciar-init",
              async () => ({
                packs:
                  (
                    await Promise.all([
                      f.loadMe(),
                      $.loadCategories(),
                      w("ad-packs", {
                        method: "GET",
                        params: { populate: "*" },
                      }),
                    ])
                  )[2].data ?? [],
              }),
              { default: () => ({ packs: [] }) },
            ),
          )),
          (n = await n),
          u(),
          n);
      return (
        i.ad.ad_id && i.userId !== f.me?.id && i.$reset(),
        (i.userId = f.me?.id ?? null),
        P(() => {
          const e = [];
          for (const d of C.value?.packs ?? [])
            e.push({
              item_id: d.id,
              item_name: `Pack ${d.total_ads} anuncios`,
              item_category: "Pack",
              price: d.price,
              currency: "CLP",
            });
          (s.value &&
            (s.value.freeAdReservationsCount ?? 0) > 0 &&
            e.push({
              item_id: "free",
              item_name: "Anuncio gratuito",
              item_category: "Pack",
              price: 0,
              currency: "CLP",
            }),
            s.value &&
              (s.value.paidAdReservationsCount ?? 0) > 0 &&
              e.push({
                item_id: "paid",
                item_name: "Anuncio de pago (reserva)",
                item_category: "Pack",
                price: 0,
                currency: "CLP",
              }),
            s.value &&
              (s.value.adFeaturedReservationsCount ?? 0) > 0 &&
              e.push({
                item_id: "featured_free",
                item_name: "Destacado gratuito",
                item_category: "Destacado",
                price: 0,
                currency: "CLP",
              }),
            e.push(
              {
                item_id: "featured_paid",
                item_name: "Destacado",
                item_category: "Destacado",
                price: 1e4,
                currency: "CLP",
              },
              {
                item_id: "featured_none",
                item_name: "Sin destacar",
                item_category: "Destacado",
                price: 0,
                currency: "CLP",
              },
            ),
            r.viewItemList(e),
            r.stepView(1, "Payment Method"));
        }),
        S(
          () => i.pack,
          (e, d) => {
            if (e === d) return;
            const a = {
              item_id: e.toString(),
              item_name: "",
              item_category: "Pack",
              price: 0,
              currency: "CLP",
            };
            if (e === "free") a.item_name = "Anuncio gratuito";
            else if (e === "paid") a.item_name = "Anuncio de pago (reserva)";
            else {
              const y = (C.value?.packs ?? []).find((B) => B.id === e);
              y &&
                ((a.item_name = `Pack ${y.total_ads} anuncios`),
                (a.price = y.price));
            }
            r.addToCartPack(a);
          },
          { immediate: !0 },
        ),
        S(
          () => i.featured,
          (e, d) => {
            if (e === d) return;
            const a = {
              item_id: "",
              item_name: "",
              item_category: "Destacado",
              price: 0,
              currency: "CLP",
            };
            (e === "free"
              ? ((a.item_id = "free_featured"),
                (a.item_name = "Destacado gratuito"))
              : e === !0
                ? ((a.item_id = "paid_featured"),
                  (a.item_name = "Destacado de pago"),
                  (a.price = 1e4))
                : ((a.item_id = "no_featured"), (a.item_name = "Sin destacar")),
              r.addToCartFeatured(a));
          },
          { immediate: !0 },
        ),
        l({
          title: "Crear Anuncio",
          description:
            "Publica tus activos industriales de manera rápida y sencilla en Waldo.click®. Aumenta tu visibilidad y encuentra compradores fácilmente.",
          imageUrl: `${m.public.baseUrl}/share.jpg`,
          url: `${m.public.baseUrl}/crear-anuncio`,
        }),
        N({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        p({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Crear Anuncio - Waldo.click®",
          url: `${m.public.baseUrl}/crear-anuncio`,
          description:
            "Publica tus activos industriales de manera rápida y sencilla en Waldo.click®. Aumenta tu visibilidad y encuentra compradores fácilmente.",
        }),
        (e, d) => (_(), b("div", me, [c(V), c(le)]))
      );
    },
  });
export { ke as default };
//# sourceMappingURL=CeYkwyBQ.js.map

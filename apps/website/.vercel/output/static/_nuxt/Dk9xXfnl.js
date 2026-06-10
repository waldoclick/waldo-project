import {
  aZ as w,
  cF as T,
  a_ as _,
  a$ as f,
  bf as e,
  bn as I,
  bo as H,
  bi as b,
  b6 as h,
  b0 as r,
  c1 as W,
  cP as q,
  b9 as v,
  b5 as E,
  cM as U,
  bt as Y,
  bm as A,
  be as Z,
  bG as $,
  cG as x,
  bs as J,
  b7 as D,
  b8 as K,
  bb as Q,
  b1 as N,
  bC as P,
  bj as X,
  cE as ee,
  b3 as te,
  bF as oe,
  bk as ae,
  bw as se,
  cs as ne,
} from "./BK8sApmn.js";
import { B as ce } from "./CsW763hY.js";
import { a as re, _ as ie, b as _e } from "./CmMYCT_o.js";
import { S as le } from "./DrPuZ622.js";
import { u as de } from "./CAHpseH1.js";
import { C as B } from "./DmUMncXv.js";
import { u as j } from "./CJzzMwWR.js";
import { u as ue } from "./CsS7OJ1I.js";
import "./JxRx1s6n.js";
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
    s = new t.Error().stack;
  s &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[s] = "aab7f452-051c-4269-bacf-709a3810cb48"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-aab7f452-051c-4269-bacf-709a3810cb48"));
} catch {}
const me = { class: "payment payment--ad" },
  fe = { class: "payment--ad__left" },
  pe = { class: "payment--ad__images" },
  he = { key: 0, class: "payment--ad__images__placeholder" },
  be = { class: "payment--ad__info" },
  ye = { class: "payment--ad__info__title" },
  ke = { class: "payment--ad__info__text" },
  ge = { class: "payment--ad__highlight" },
  ve = { class: "payment--ad__highlight__text" },
  we = { class: "payment--ad__right" },
  $e = { class: "payment--ad__button" },
  xe = w({
    __name: "PaymentAd",
    setup(t) {
      const s = T(),
        { transformUrl: l } = Y(),
        c = () => q("/anunciar/datos-del-producto"),
        u = v(() => {
          const a = s.ad.gallery || [],
            n = Math.max(0, a.length - 5);
          return a.slice(n).map((p) => l(p.url));
        }),
        y = v(() => {
          const a = new Date(),
            n = [
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
            ];
          return `${a.getDate()} de ${n[a.getMonth()]} del ${a.getFullYear()}`;
        }),
        g = v(() =>
          s.ad.price
            ? new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: s.ad.currency || "CLP",
                maximumFractionDigits: 0,
              }).format(Number(s.ad.price))
            : "",
        );
      return (a, n) => {
        const p = U;
        return (
          _(),
          f("article", me, [
            e("div", fe, [
              e("div", pe, [
                (_(),
                f(
                  I,
                  null,
                  H(
                    5,
                    (m) => (
                      _(),
                      f(
                        I,
                        { key: m },
                        [
                          u.value[4 - (m - 1)]
                            ? (_(),
                              E(
                                p,
                                {
                                  key: 1,
                                  class: "payment--ad__images__img",
                                  loading: "lazy",
                                  src: u.value[4 - (m - 1)],
                                  alt: h(s).ad.name,
                                  remote: "",
                                },
                                null,
                                8,
                                ["src", "alt"],
                              ))
                            : (_(), f("div", he)),
                        ],
                        64,
                      )
                    ),
                  ),
                  64,
                )),
              ]),
              e("div", be, [
                e("div", ye, b(y.value), 1),
                e("div", ke, b(h(s).ad.name), 1),
              ]),
              e("div", ge, [e("div", ve, b(g.value), 1)]),
            ]),
            e("div", we, [
              e("div", $e, [
                r(
                  ce,
                  {
                    icon: h(W),
                    title: "Editar anuncio",
                    "aria-label": "Editar anuncio",
                    onClick: c,
                  },
                  null,
                  8,
                  ["icon"],
                ),
              ]),
            ]),
          ])
        );
      };
    },
  }),
  Ce = Object.assign(xe, { __name: "PaymentAd" }),
  Se = { class: "payment payment--gateway" },
  Pe = w({
    __name: "PaymentGateway",
    setup(t) {
      return (s, l) => (
        _(),
        f("div", Se, [
          ...(l[0] ||
            (l[0] = [
              e(
                "div",
                { class: "payment--gateway__options" },
                [
                  e(
                    "label",
                    {
                      class:
                        "payment--gateway__options__item payment--gateway__options__item--active",
                    },
                    [
                      e("input", {
                        type: "checkbox",
                        name: "gateway",
                        value: "webpay",
                        checked: "",
                        disabled: "",
                      }),
                      e("span", null, "Transbank WebPay"),
                    ],
                  ),
                ],
                -1,
              ),
            ])),
        ])
      );
    },
  }),
  Be = Object.assign(Pe, { __name: "PaymentGateway" }),
  De = { class: "bar bar--checkout" },
  Te = { class: "container container--fluid" },
  Fe = { class: "bar--checkout__container" },
  Ee = { class: "bar--checkout__col bar--checkout__col--left" },
  Ie = ["disabled"],
  Ae = { key: 0, class: "bar--checkout__col bar--checkout__col--center" },
  Ne = { class: "bar--checkout__steps" },
  je = { class: "bar--checkout__col bar--checkout__col--right" },
  ze = { class: "bar--checkout__actions" },
  Oe = ["disabled", "title"],
  Le = w({
    __name: "BarCheckout",
    props: {
      percentage: { default: 0 },
      currentStep: { default: 1 },
      totalSteps: { default: void 0 },
      showSteps: { type: Boolean, default: !0 },
      summaryText: { default: "" },
      primaryLabel: {},
      primaryDisabled: { type: Boolean, default: !1 },
      backDisabled: { type: Boolean, default: !1 },
      showBack: { type: Boolean, default: !0 },
    },
    emits: ["back"],
    setup(t, { emit: s }) {
      const l = t,
        c = s,
        u = K(null),
        y = () => {
          u.value &&
            u.value.style.setProperty("--progress-width", `${l.percentage}%`);
        };
      return (
        A(y),
        Z(
          () => l.percentage,
          () => {
            y();
          },
        ),
        (g, a) => (
          _(),
          f("div", De, [
            e(
              "div",
              {
                ref_key: "progressElement",
                ref: u,
                class: "bar--checkout__percent",
              },
              null,
              512,
            ),
            e("div", Te, [
              e("div", Fe, [
                e("div", Ee, [
                  $(
                    e(
                      "button",
                      {
                        type: "button",
                        class: "btn btn--secondary btn--block",
                        disabled: t.backDisabled,
                        onClick: a[0] || (a[0] = (n) => c("back")),
                      },
                      [...(a[1] || (a[1] = [e("span", null, "Volver", -1)]))],
                      8,
                      Ie,
                    ),
                    [[x, t.showBack]],
                  ),
                ]),
                t.showSteps && t.totalSteps
                  ? (_(),
                    f("div", Ae, [
                      e("div", Ne, [
                        e("b", null, b(t.currentStep), 1),
                        J(" de " + b(t.totalSteps), 1),
                      ]),
                    ]))
                  : D("", !0),
                e("div", je, [
                  e("div", ze, [
                    t.summaryText
                      ? (_(),
                        E(
                          le,
                          {
                            key: 0,
                            title: "Tipo de anuncio",
                            text: t.summaryText,
                          },
                          null,
                          8,
                          ["text"],
                        ))
                      : D("", !0),
                    e(
                      "button",
                      {
                        type: "submit",
                        class: "btn btn--primary btn--block",
                        disabled: t.primaryDisabled,
                        title: t.primaryLabel,
                      },
                      [e("span", null, b(t.primaryLabel), 1)],
                      8,
                      Oe,
                    ),
                  ]),
                ]),
              ]),
            ]),
          ])
        )
      );
    },
  }),
  Me = Object.assign(Le, { __name: "BarCheckout" }),
  Ve = { key: 0, class: "form--checkout__ad" },
  Ge = { key: 1, class: "form--checkout__field" },
  Re = { class: "form--checkout__field__toggle__left" },
  He = { class: "form--checkout__field__summary" },
  We = { class: "form--checkout__field__content" },
  qe = { class: "form--checkout__field" },
  Ue = { class: "form--checkout__field__toggle__left" },
  Ye = { class: "form--checkout__field__summary" },
  Ze = { class: "form--checkout__field__content" },
  Je = { class: "form--checkout__field" },
  Ke = { class: "form--checkout__field__toggle__left" },
  Qe = { class: "form--checkout__field__summary" },
  Xe = { class: "form--checkout__field__content" },
  et = { class: "form--checkout__field" },
  tt = { class: "form--checkout__field__content" },
  ot = w({
    __name: "FormCheckout",
    emits: ["formSubmitted"],
    setup(t, { emit: s }) {
      const l = s,
        c = T(),
        u = Q(),
        { paymentSummaryText: y, packPart: g } = de(),
        a = c.ad.ad_id === null,
        n = ee({ method: a, featured: !1, invoice: !1, gateway: !1 }),
        p = (k) => {
          n[k] = !n[k];
        },
        m = v(() => g.value?.label || "—"),
        i = v(() =>
          c.featured === "free"
            ? "Destacado gratuito"
            : c.featured === !0
              ? "Destacado por $10.000"
              : "No destacar",
        ),
        d = v(() => (c.is_invoice ? "Factura" : "Boleta")),
        C = () => {
          u.push(a ? "/packs" : "/anunciar/resumen");
        },
        S = (k) => {
          l("formSubmitted", k);
        };
      return (k, o) => {
        const z = Ce,
          O = re,
          L = ie,
          M = _e,
          V = Be,
          G = Me;
        return (
          _(),
          E(
            h(X),
            { class: "form form--checkout", onSubmit: S },
            {
              default: N(({ meta: R }) => [
                o[9] ||
                  (o[9] = e(
                    "div",
                    { class: "form--checkout__header" },
                    [
                      e(
                        "h2",
                        { class: "form--checkout__header__title" },
                        "Confirma tu pago",
                      ),
                      e(
                        "div",
                        { class: "form--checkout__header__description" },
                        [
                          e(
                            "p",
                            null,
                            " Revisa los detalles de tu anuncio, elige cómo quieres publicarlo y completa el pago de forma segura. ",
                          ),
                        ],
                      ),
                    ],
                    -1,
                  )),
                a
                  ? D("", !0)
                  : (_(),
                    f("div", Ve, [
                      o[4] ||
                        (o[4] = e(
                          "h3",
                          { class: "form--checkout__ad__title" },
                          "Tu anuncio",
                          -1,
                        )),
                      r(z),
                    ])),
                a
                  ? D("", !0)
                  : (_(),
                    f("div", Ge, [
                      e(
                        "button",
                        {
                          type: "button",
                          class: "form--checkout__field__toggle",
                          onClick: o[0] || (o[0] = (F) => p("featured")),
                        },
                        [
                          e("div", Re, [
                            o[5] ||
                              (o[5] = e(
                                "h3",
                                { class: "form--checkout__field__title" },
                                "Destacado",
                                -1,
                              )),
                            e("span", He, b(i.value), 1),
                          ]),
                          r(
                            h(B),
                            {
                              size: 20,
                              class: P([
                                "form--checkout__field__chevron",
                                {
                                  "form--checkout__field__chevron--open":
                                    n.featured,
                                },
                              ]),
                            },
                            null,
                            8,
                            ["class"],
                          ),
                        ],
                      ),
                      $(e("div", We, [r(O)], 512), [[x, n.featured]]),
                    ])),
                e("div", qe, [
                  e(
                    "button",
                    {
                      type: "button",
                      class: "form--checkout__field__toggle",
                      onClick: o[1] || (o[1] = (F) => p("method")),
                    },
                    [
                      e("div", Ue, [
                        o[6] ||
                          (o[6] = e(
                            "h3",
                            { class: "form--checkout__field__title" },
                            "Tipo de publicación",
                            -1,
                          )),
                        e("span", Ye, b(m.value), 1),
                      ]),
                      r(
                        h(B),
                        {
                          size: 20,
                          class: P([
                            "form--checkout__field__chevron",
                            {
                              "form--checkout__field__chevron--open": n.method,
                            },
                          ]),
                        },
                        null,
                        8,
                        ["class"],
                      ),
                    ],
                  ),
                  $(e("div", Ze, [r(L, { "hide-free": a })], 512), [
                    [x, n.method],
                  ]),
                ]),
                e("div", Je, [
                  e(
                    "button",
                    {
                      type: "button",
                      class: "form--checkout__field__toggle",
                      onClick: o[2] || (o[2] = (F) => p("invoice")),
                    },
                    [
                      e("div", Ke, [
                        o[7] ||
                          (o[7] = e(
                            "h3",
                            { class: "form--checkout__field__title" },
                            "Boleta o factura",
                            -1,
                          )),
                        e("span", Qe, b(d.value), 1),
                      ]),
                      r(
                        h(B),
                        {
                          size: 20,
                          class: P([
                            "form--checkout__field__chevron",
                            {
                              "form--checkout__field__chevron--open": n.invoice,
                            },
                          ]),
                        },
                        null,
                        8,
                        ["class"],
                      ),
                    ],
                  ),
                  $(e("div", Xe, [r(M)], 512), [[x, n.invoice]]),
                ]),
                e("div", et, [
                  e(
                    "button",
                    {
                      type: "button",
                      class: "form--checkout__field__toggle",
                      onClick: o[3] || (o[3] = (F) => p("gateway")),
                    },
                    [
                      o[8] ||
                        (o[8] = e(
                          "div",
                          { class: "form--checkout__field__toggle__left" },
                          [
                            e(
                              "h3",
                              { class: "form--checkout__field__title" },
                              "Pasarela de pago",
                            ),
                            e(
                              "span",
                              { class: "form--checkout__field__summary" },
                              "WebPay",
                            ),
                          ],
                          -1,
                        )),
                      r(
                        h(B),
                        {
                          size: 20,
                          class: P([
                            "form--checkout__field__chevron",
                            {
                              "form--checkout__field__chevron--open": n.gateway,
                            },
                          ]),
                        },
                        null,
                        8,
                        ["class"],
                      ),
                    ],
                  ),
                  $(e("div", tt, [r(V)], 512), [[x, n.gateway]]),
                ]),
                r(
                  G,
                  {
                    percentage: 100,
                    "current-step": 1,
                    "total-steps": 5,
                    "show-steps": !0,
                    "summary-text": h(y),
                    "primary-label": "Ir a pagar",
                    "primary-disabled": !R.valid,
                    "show-back": !0,
                    onBack: C,
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
      };
    },
  }),
  at = Object.assign(ot, { __name: "FormCheckout" }),
  st = { class: "checkout checkout--default" },
  nt = { class: "checkout--default__container" },
  ct = w({
    __name: "CheckoutDefault",
    setup(t) {
      const { Swal: s } = ae(),
        l = te(),
        c = T(),
        u = j(),
        { packs: y, loadPacks: g } = ue(),
        a = async (m) => {
          await n();
        },
        n = async () => {
          if (
            (
              await s.fire({
                title: "¿Estás seguro?",
                text: "Tras realizar el pago, no será posible modificar el anuncio.",
                icon: "warning",
                showCancelButton: !0,
                confirmButtonText: "Sí, proceder al pago",
                cancelButtonText: "Cancelar",
              })
            ).isConfirmed
          )
            try {
              (u.addPaymentInfo(), await g());
              let i = c.pack;
              if (typeof c.pack == "number") {
                const k = y.value.find((o) => o.id === c.pack);
                if (!k) throw new Error("Pack not found");
                i = k.name;
              }
              const d = await l("payments/checkout", {
                  method: "POST",
                  body: {
                    data: {
                      pack: i,
                      ad_id: c.ad.ad_id,
                      featured: c.featured,
                      is_invoice: c.is_invoice,
                    },
                  },
                }),
                { url: C, token: S } = d.data;
              if (!C || !S) throw new Error("Invalid payment response");
              (u.pushEvent("redirect_to_payment", [], {
                payment_method: "webpay",
              }),
                p({ url: C, gatewayRef: S }));
            } catch (i) {
              let d =
                "Hubo un problema al procesar el pago. Por favor, inténtalo de nuevo.";
              ((i.response?.data?.message ===
                "No free featured credits available" ||
                i.message === "No free featured credits available") &&
                (d = "No tienes créditos destacados gratuitos disponibles"),
                s.fire({
                  title: "Error",
                  text: d,
                  icon: "error",
                  confirmButtonText: "Aceptar",
                }));
            }
        },
        p = (m) => {
          const i = document.createElement("form");
          ((i.method = "POST"), (i.action = m.url));
          const d = document.createElement("input");
          ((d.type = "hidden"),
            (d.name = "token_ws"),
            (d.value = m.gatewayRef),
            i.appendChild(d),
            document.body.appendChild(i),
            i.submit());
        };
      return (m, i) => {
        const d = oe;
        return (
          _(),
          f("section", st, [
            e("div", nt, [
              r(d, null, {
                default: N(() => [r(at, { onFormSubmitted: a })]),
                _: 1,
              }),
            ]),
          ])
        );
      };
    },
  }),
  rt = Object.assign(ct, { __name: "CheckoutDefault" }),
  it = { class: "page" },
  yt = w({
    __name: "index",
    setup(t) {
      const s = T(),
        l = j();
      return (
        A(() => {
          s.ad.ad_id === null && l.beginCheckout();
        }),
        se({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        (c, u) => (_(), f("div", it, [r(ne), r(rt)]))
      );
    },
  });
export { yt as default };
//# sourceMappingURL=Dk9xXfnl.js.map

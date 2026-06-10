import {
  bJ as N,
  bm as S,
  a_ as _,
  a$ as b,
  bf as t,
  bn as I,
  bo as E,
  bC as h,
  bi as m,
  b7 as k,
  bG as C,
  cX as $,
  bs as u,
  b8 as B,
  b9 as F,
  bB as q,
  bx as T,
  cY as V,
  b6 as p,
  b0 as y,
  b1 as g,
  br as U,
  aZ as R,
  be as L,
  bu as M,
  b5 as j,
  bj as A,
  bk as O,
  cF as z,
  bb as H,
  b2 as G,
  bM as J,
  b4 as X,
  bF as Y,
  cs as Z,
} from "./BK8sApmn.js";
import { u as K, a as Q } from "./BtaW-tYT.js";
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
    a = new n.Error().stack;
  a &&
    ((n._sentryDebugIds = n._sentryDebugIds || {}),
    (n._sentryDebugIds[a] = "d1304551-b0e0-416f-b315-71f28dd227ec"),
    (n._sentryDebugIdIdentifier =
      "sentry-dbid-d1304551-b0e0-416f-b315-71f28dd227ec"));
} catch {}
const x = N("pack", {
    state: () => ({ pack: 1, is_invoice: !1 }),
    getters: { getPack: (n) => n.pack, getIsInvoice: (n) => n.is_invoice },
    actions: {
      updatePack(n) {
        this.pack = n;
      },
      updateIsInvoice(n) {
        this.is_invoice = n;
      },
    },
    persist: { storage: typeof window < "u" ? localStorage : void 0 },
  }),
  W = { class: "payment payment--method" },
  ee = { class: "payment--method__list" },
  te = { key: 0 },
  se = ["value"],
  ne = {
    __name: "PackMethod",
    setup(n) {
      const a = x(),
        i = K(),
        l = F(() => i.packs),
        o = B(null);
      S(async () => {
        (await i.loadPacks(),
          (o.value = a.pack || null),
          a.updatePack(o.value));
      });
      const r = () => {
          a.updatePack(o.value);
        },
        f = (e) =>
          new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
          }).format(e);
      return (e, c) => (
        _(),
        b("div", W, [
          t("ul", ee, [
            (_(!0),
            b(
              I,
              null,
              E(
                l.value,
                (s, d) => (
                  _(),
                  b(
                    I,
                    { key: d },
                    [
                      s.total_ads > 1
                        ? (_(),
                          b(
                            "li",
                            {
                              key: 0,
                              class: h([
                                "payment--method__item",
                                {
                                  "payment--method__item--active":
                                    o.value === s.id,
                                },
                              ]),
                            },
                            [
                              s.text
                                ? (_(), b("span", te, m(s.text), 1))
                                : k("", !0),
                              t("label", null, [
                                t("p", null, [
                                  C(
                                    t(
                                      "input",
                                      {
                                        "onUpdate:modelValue":
                                          c[0] || (c[0] = (v) => (o.value = v)),
                                        value: s.id,
                                        type: "radio",
                                        name: "payment",
                                        onChange: r,
                                      },
                                      null,
                                      40,
                                      se,
                                    ),
                                    [[$, o.value]],
                                  ),
                                  t(
                                    "strong",
                                    null,
                                    m(s.total_ads) +
                                      " anuncios x " +
                                      m(f(s.price)),
                                    1,
                                  ),
                                ]),
                                t("p", null, [
                                  c[1] ||
                                    (c[1] = u(" Duración del anuncio: ", -1)),
                                  t(
                                    "strong",
                                    null,
                                    m(s.total_days) + " días",
                                    1,
                                  ),
                                ]),
                              ]),
                            ],
                            2,
                          ))
                        : k("", !0),
                    ],
                    64,
                  )
                ),
              ),
              128,
            )),
          ]),
        ])
      );
    },
  },
  ae = { class: "payment payment--invoice" },
  oe = { key: 0, class: "payment--invoice__description" },
  ie = { key: 1, class: "payment--invoice__description" },
  re = { class: "payment--invoice__options" },
  le = { class: "payment--invoice__options__item" },
  ue = ["disabled"],
  ce = { key: 2, class: "payment--invoice__details" },
  de = {
    __name: "PackInvoice",
    setup(n) {
      const a = T(),
        { canRequestInvoice: i } = V(a.value),
        l = x(),
        o = B(!1);
      S(() => {
        ((o.value = l.is_invoice),
          i.value || ((o.value = !1), (l.is_invoice = !1)));
      });
      const r = () => {
        (i.value || (o.value = !1), (l.is_invoice = o.value));
      };
      return (f, e) => {
        const c = U;
        return (
          _(),
          b("div", ae, [
            e[19] ||
              (e[19] = t(
                "div",
                { class: "payment--invoice__title" },
                "¿Necesitas boleta o factura?",
                -1,
              )),
            p(a).is_company
              ? p(i)
                ? k("", !0)
                : (_(),
                  b("div", ie, [
                    e[7] || (e[7] = t("strong", null, "Importante:", -1)),
                    e[8] ||
                      (e[8] = u(
                        " Para solicitar factura, debes completar todos los datos de tu empresa. ",
                        -1,
                      )),
                    y(
                      c,
                      { to: "/cuenta/perfil/editar" },
                      {
                        default: g(() => [
                          ...(e[6] ||
                            (e[6] = [u("Completa tu perfil aquí", -1)])),
                        ]),
                        _: 1,
                      },
                    ),
                    e[9] || (e[9] = u(". ", -1)),
                  ]))
              : (_(),
                b("div", oe, [
                  e[3] || (e[3] = t("strong", null, "Importante:", -1)),
                  e[4] ||
                    (e[4] = u(
                      " Si necesitas factura, asegúrate de tener un perfil de empresa. ",
                      -1,
                    )),
                  y(
                    c,
                    { to: "/cuenta/perfil/editar" },
                    {
                      default: g(() => [
                        ...(e[2] || (e[2] = [u("Edita tu perfil aquí", -1)])),
                      ]),
                      _: 1,
                    },
                  ),
                  e[5] || (e[5] = u(". ", -1)),
                ])),
            t("div", re, [
              t("label", le, [
                C(
                  t(
                    "input",
                    {
                      "onUpdate:modelValue":
                        e[0] || (e[0] = (s) => (o.value = s)),
                      type: "radio",
                      name: "invoice",
                      value: !1,
                      onChange: r,
                    },
                    null,
                    544,
                  ),
                  [[$, o.value]],
                ),
                e[10] || (e[10] = t("span", null, "Boleta", -1)),
              ]),
              t(
                "label",
                {
                  class: h([
                    "payment--invoice__options__item",
                    { "payment--invoice__options__item--disabled": !p(i) },
                  ]),
                },
                [
                  C(
                    t(
                      "input",
                      {
                        "onUpdate:modelValue":
                          e[1] || (e[1] = (s) => (o.value = s)),
                        type: "radio",
                        name: "invoice",
                        value: !0,
                        disabled: !p(i),
                        onChange: r,
                      },
                      null,
                      40,
                      ue,
                    ),
                    [[$, o.value]],
                  ),
                  e[11] || (e[11] = t("span", null, "Factura", -1)),
                ],
                2,
              ),
            ]),
            o.value && p(i)
              ? (_(),
                b("div", ce, [
                  e[12] || (e[12] = u(" La factura se emitirá a ", -1)),
                  t("strong", null, m(p(a).business_name), 1),
                  e[13] || (e[13] = u(", RUT ", -1)),
                  t("strong", null, m(p(a).business_rut), 1),
                  e[14] || (e[14] = u(", con giro en ", -1)),
                  t("strong", null, m(p(a).business_type), 1),
                  e[15] || (e[15] = u(". ", -1)),
                  e[16] || (e[16] = t("br", null, null, -1)),
                  e[17] || (e[17] = u(" Dirección de facturación: ", -1)),
                  t(
                    "strong",
                    null,
                    m(p(a).business_address) +
                      " " +
                      m(p(a).business_address_number) +
                      ", " +
                      m(p(a).business_commune?.name) +
                      ", " +
                      m(p(a).business_commune?.region?.name),
                    1,
                  ),
                  e[18] || (e[18] = u(". ", -1)),
                ]))
              : k("", !0),
          ])
        );
      };
    },
  },
  pe = q(de, [["__scopeId", "data-v-4f3fc9cd"]]),
  me = { class: "bar bar--create" },
  _e = { class: "container container--fluid" },
  be = { class: "bar--create__container" },
  fe = ["disabled"],
  ve = { class: "bar--create__steps" },
  ye = ["disabled"],
  ke = R({
    __name: "BarCreate",
    props: {
      percentage: {},
      currentStep: {},
      totalSteps: {},
      isValid: { type: Boolean },
      isBackDisabled: { type: Boolean },
      isSubmitDisabled: { type: Boolean },
    },
    emits: ["submit", "back"],
    setup(n) {
      const a = n,
        i = B(null),
        l = () => {
          i.value &&
            i.value.style.setProperty("--progress-width", a.percentage + "%");
        };
      return (
        L(() => a.percentage, l, { immediate: !0 }),
        S(l),
        (o, r) => (
          _(),
          b("div", me, [
            t("div", _e, [
              t(
                "div",
                {
                  ref_key: "progressElement",
                  ref: i,
                  class: "bar--create__percent",
                },
                null,
                512,
              ),
              t("div", be, [
                t(
                  "button",
                  {
                    type: "button",
                    class: "btn btn--secondary btn--block",
                    disabled: n.isBackDisabled,
                    onClick: r[0] || (r[0] = (f) => o.$emit("back")),
                  },
                  [...(r[2] || (r[2] = [t("span", null, "Volver", -1)]))],
                  8,
                  fe,
                ),
                t("div", ve, [
                  t("b", null, m(n.currentStep), 1),
                  u(" de " + m(n.totalSteps), 1),
                ]),
                t(
                  "button",
                  {
                    type: "submit",
                    class: "btn btn--primary btn--block",
                    disabled: n.isSubmitDisabled || !n.isValid,
                    onClick: r[1] || (r[1] = (f) => o.$emit("submit")),
                  },
                  [...(r[3] || (r[3] = [t("span", null, "Continuar", -1)]))],
                  8,
                  ye,
                ),
              ]),
            ]),
          ])
        )
      );
    },
  }),
  ge = Object.assign(ke, { __name: "BarCreate" }),
  Se = { class: "form__field" },
  we = {
    __name: "FormPack",
    emits: ["formSubmitted"],
    setup(n, { emit: a }) {
      const { Swal: i } = O(),
        { create: l } = Q(),
        { $recaptcha: o } = M(),
        r = x(),
        f = async (c) => {
          if (
            !(
              await i.fire({
                title: "Confirmar pago",
                text: "¿Está seguro de proceder al pago de la compra del pack?",
                icon: "warning",
                showCancelButton: !0,
                confirmButtonText: "Sí, proceder",
                cancelButtonText: "No, cancelar",
              })
            ).isConfirmed
          )
            return;
          const d = r.pack,
            v = r.is_invoice;
          try {
            const P = await o.execute("submit"),
              D = await l("payments/pack", {
                pack: d,
                is_invoice: v,
                recaptchaToken: P,
              });
            e(D.data.webpay);
          } catch {
            i.fire(
              "Error",
              "Hubo un error al procesar el pago. Por favor, inténtalo de nuevo.",
              "error",
            );
          }
        },
        e = (c) => {
          const s = document.createElement("form");
          ((s.method = "POST"), (s.action = c.url));
          const d = document.createElement("input");
          ((d.type = "hidden"),
            (d.name = "token_ws"),
            (d.value = c.token),
            s.appendChild(d),
            document.body.appendChild(s),
            s.submit());
        };
      return (c, s) => (
        _(),
        j(
          p(A),
          {
            "validation-schema": c.schema,
            class: "form form--create",
            onSubmit: f,
          },
          {
            default: g(({ meta: d }) => [
              s[1] ||
                (s[1] = t(
                  "div",
                  { class: "form__field" },
                  [
                    t("h2", { class: "form__title" }, [
                      u(" Compra un pack y ahorra en la "),
                      t("br"),
                      u("publicación de tus anuncios. "),
                    ]),
                    t("div", { class: "form__description" }, [
                      t("p", null, [
                        u(
                          " Elige el pack que mejor se ajuste a tus necesidades y obtén beneficios ",
                        ),
                        t("br"),
                        u(
                          "adicionales. Compra ahora y utiliza tus anuncios cuando lo necesites. ",
                        ),
                      ]),
                    ]),
                  ],
                  -1,
                )),
              t("div", Se, [y(ne), y(pe)]),
              y(
                ge,
                {
                  percentage: 0,
                  "current-step": 1,
                  "total-steps": 1,
                  "is-valid": d.valid,
                  onSubmit: f,
                  onBack: s[0] || (s[0] = () => c.$router.push("/packs")),
                },
                null,
                8,
                ["is-valid"],
              ),
            ]),
            _: 1,
          },
          8,
          ["validation-schema"],
        )
      );
    },
  },
  Ce = { class: "create create--announcement" },
  $e = { class: "create--announcement__container" },
  Be = { class: "create--announcement__steps" },
  xe = { class: "step step--pack" },
  w = 1,
  Pe = {
    __name: "BuyPack",
    async setup(n) {
      let a, i;
      const l = z(),
        o = H(),
        r = G(),
        f = J();
      (([a, i] = X(() => f.isProfileComplete())),
        (a = await a),
        i(),
        S(() => {
          const s = Number.parseInt(r.query.step, 10);
          !Number.isNaN(s) && s >= 1 && s <= w && l.updateStep(s);
        }));
      function e(s) {
        const d = l.step > 1 ? l.step - 1 : l.step;
        (l.updateStep(d), o.push({ query: { ...r.query, step: d } }));
      }
      async function c(s) {
        if (
          (
            await Swal.fire({
              title: "¿Estás seguro?",
              text: "¿Estás seguro de que deseas comprar el pack?",
              icon: "warning",
              showCancelButton: !0,
              confirmButtonText: "Sí, comprar",
              cancelButtonText: "No, cancelar",
            })
          ).isConfirmed
        ) {
          const v = l.step + 1;
          v > w
            ? (l.updateStep(w), o.push("/anunciar/resumen"))
            : (l.updateStep(v), o.push({ query: { ...r.query, step: v } }));
        }
      }
      return (s, d) => {
        const v = Y;
        return (
          _(),
          b("section", Ce, [
            t("div", $e, [
              y(v, null, {
                default: g(() => [
                  t("div", Be, [
                    t("div", xe, [
                      y(we, { onFormSubmitted: c, onFormBack: e }),
                    ]),
                  ]),
                ]),
                _: 1,
              }),
            ]),
          ])
        );
      };
    },
  },
  Ie = { class: "page" },
  Ee = {
    __name: "comprar",
    setup(n) {
      return (a, i) => (_(), b("div", Ie, [y(Z), y(Pe)]));
    },
  };
export { Ee as default };
//# sourceMappingURL=DEPyQP3s.js.map

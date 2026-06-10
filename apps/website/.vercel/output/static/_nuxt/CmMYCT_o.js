import {
  aZ as A,
  cF as I,
  bx as D,
  cY as V,
  bm as w,
  a_ as v,
  a$ as _,
  bf as t,
  bC as U,
  bG as f,
  cX as b,
  bi as l,
  bs as i,
  b7 as k,
  b0 as x,
  bF as q,
  b1 as $,
  bn as M,
  bo as E,
  b6 as o,
  b8 as S,
  b9 as F,
  be as j,
  br as z,
} from "./BK8sApmn.js";
import { u as G } from "./CsS7OJ1I.js";
import { u as O } from "./JxRx1s6n.js";
try {
  let c =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    n = new c.Error().stack;
  n &&
    ((c._sentryDebugIds = c._sentryDebugIds || {}),
    (c._sentryDebugIds[n] = "83c23bd8-2233-444f-a755-940d14226cb8"),
    (c._sentryDebugIdIdentifier =
      "sentry-dbid-83c23bd8-2233-444f-a755-940d14226cb8"));
} catch {}
const Q = { class: "payment payment--method" },
  X = { class: "payment--method__list" },
  Y = { key: 0 },
  Z = ["value"],
  H = A({
    __name: "PaymentMethod",
    props: { hideFree: { type: Boolean, default: !1 } },
    setup(c) {
      const n = c,
        d = I(),
        { packs: a, loadPacks: u } = G(),
        { getPackBadgeText: g } = O();
      D();
      const { getAdReservations: C } = V(),
        s = S(null);
      w(async () => {
        (await u(),
          (s.value = d.pack || 1),
          d.isPackSelected || d.updatePack(s.value));
      });
      const e = () => {
          s.value !== null && d.updatePack(s.value);
        },
        r = F(() => C()),
        P = F(() => {
          const y = r.value.unusedFreeCount;
          return y === 1
            ? "Usar mi último anuncio gratuito"
            : `Usar 1 de mis ${y} anuncios gratuitos`;
        }),
        N = F(() => {
          const y = r.value.unusedPaidCount;
          return y === 1
            ? "Usar mi último anuncio de pago"
            : `Usar 1 de mis ${y} anuncios de pago`;
        }),
        T = (y) =>
          new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
          }).format(y);
      return (y, p) => {
        const R = q;
        return (
          v(),
          _("div", Q, [
            t("ul", X, [
              !n.hideFree && r.value.unusedFreeCount > 0
                ? (v(),
                  _(
                    "li",
                    {
                      key: 0,
                      class: U([
                        "payment--method__item",
                        { "payment--method__item--active": s.value === "free" },
                      ]),
                    },
                    [
                      t("label", null, [
                        t("p", null, [
                          f(
                            t(
                              "input",
                              {
                                "onUpdate:modelValue":
                                  p[0] || (p[0] = (m) => (s.value = m)),
                                type: "radio",
                                name: "payment",
                                value: "free",
                                onChange: e,
                              },
                              null,
                              544,
                            ),
                            [[b, s.value]],
                          ),
                          t("strong", null, l(P.value), 1),
                        ]),
                        p[3] ||
                          (p[3] = t(
                            "p",
                            null,
                            [
                              i(" Duración del anuncio: "),
                              t("strong", null, "15 días"),
                            ],
                            -1,
                          )),
                      ]),
                    ],
                    2,
                  ))
                : k("", !0),
              !n.hideFree && r.value.unusedPaidCount > 0
                ? (v(),
                  _(
                    "li",
                    {
                      key: 1,
                      class: U([
                        "payment--method__item",
                        { "payment--method__item--active": s.value === "paid" },
                      ]),
                    },
                    [
                      t("label", null, [
                        t("p", null, [
                          f(
                            t(
                              "input",
                              {
                                "onUpdate:modelValue":
                                  p[1] || (p[1] = (m) => (s.value = m)),
                                type: "radio",
                                name: "payment",
                                value: "paid",
                                onChange: e,
                              },
                              null,
                              544,
                            ),
                            [[b, s.value]],
                          ),
                          t("strong", null, l(N.value), 1),
                        ]),
                        p[4] ||
                          (p[4] = t(
                            "p",
                            null,
                            [
                              i(" Duración del anuncio: "),
                              t("strong", null, "45 días"),
                            ],
                            -1,
                          )),
                      ]),
                    ],
                    2,
                  ))
                : k("", !0),
              x(R, null, {
                default: $(() => [
                  (v(!0),
                  _(
                    M,
                    null,
                    E(
                      o(a),
                      (m, B) => (
                        v(),
                        _(
                          "li",
                          {
                            key: B,
                            class: U([
                              "payment--method__item",
                              {
                                "payment--method__item--active":
                                  s.value === m.id,
                              },
                            ]),
                          },
                          [
                            o(g)(m, o(a))
                              ? (v(), _("span", Y, l(o(g)(m, o(a))), 1))
                              : k("", !0),
                            t("label", null, [
                              t("p", null, [
                                f(
                                  t(
                                    "input",
                                    {
                                      "onUpdate:modelValue":
                                        p[2] || (p[2] = (L) => (s.value = L)),
                                      value: m.id,
                                      type: "radio",
                                      name: "payment",
                                      onChange: e,
                                    },
                                    null,
                                    40,
                                    Z,
                                  ),
                                  [[b, s.value]],
                                ),
                                t(
                                  "strong",
                                  null,
                                  l(m.total_ads) +
                                    " " +
                                    l(
                                      Number(m.total_ads) === 1
                                        ? "anuncio"
                                        : "anuncios",
                                    ) +
                                    " x " +
                                    l(T(m.price)),
                                  1,
                                ),
                              ]),
                              t("p", null, [
                                p[5] ||
                                  (p[5] = i(" Duración del anuncio: ", -1)),
                                t("strong", null, l(m.total_days) + " días", 1),
                              ]),
                            ]),
                          ],
                          2,
                        )
                      ),
                    ),
                    128,
                  )),
                ]),
                _: 1,
              }),
            ]),
          ])
        );
      };
    },
  }),
  pe = Object.assign(H, { __name: "PaymentMethod" }),
  J = { class: "payment payment--featured" },
  K = { class: "payment--featured__options" },
  W = { key: 0, class: "payment--featured__options__item" },
  h = { class: "payment--featured__options__item" },
  ee = { class: "payment--featured__options__item" },
  me = {
    __name: "PaymentFeatured",
    setup(c) {
      const n = I();
      D();
      const { getAdFeaturedReservations: d } = V(),
        a = S(!1);
      (w(() => {
        ((a.value = n.featured),
          n.isFeaturedSelected || n.updateFeatured(a.value));
      }),
        j(
          () => n.pack,
          (s) => {
            s === "free" &&
              a.value === "free" &&
              ((a.value = !1), n.updateFeatured(!1));
          },
        ));
      const u = () => {
          n.updateFeatured(a.value);
        },
        g = F(() => d()),
        C = F(() => {
          const s = g.value.unusedCount;
          return s === 1
            ? "Usar mi último destacado gratuito"
            : `Usar 1 de mis ${s} destacados gratuitos`;
        });
      return (s, e) => (
        v(),
        _("div", J, [
          e[5] ||
            (e[5] = t(
              "div",
              { class: "payment--featured__title" },
              "¿Quieres destacar este anuncio?",
              -1,
            )),
          e[6] ||
            (e[6] = t(
              "div",
              { class: "payment--featured__description" },
              " Destacando tu anuncio aparecerá de los primeros en los resultados de búsqueda. ",
              -1,
            )),
          t("div", K, [
            g.value.unusedCount > 0 && o(n).pack !== "free"
              ? (v(),
                _("label", W, [
                  f(
                    t(
                      "input",
                      {
                        "onUpdate:modelValue":
                          e[0] || (e[0] = (r) => (a.value = r)),
                        type: "radio",
                        name: "value",
                        value: "free",
                        onChange: u,
                      },
                      null,
                      544,
                    ),
                    [[b, a.value]],
                  ),
                  t("span", null, l(C.value), 1),
                ]))
              : k("", !0),
            t("label", h, [
              f(
                t(
                  "input",
                  {
                    "onUpdate:modelValue":
                      e[1] || (e[1] = (r) => (a.value = r)),
                    type: "radio",
                    name: "value",
                    value: !0,
                    onChange: u,
                  },
                  null,
                  544,
                ),
                [[b, a.value]],
              ),
              e[3] || (e[3] = t("span", null, "Destacar por $10.000", -1)),
            ]),
            t("label", ee, [
              f(
                t(
                  "input",
                  {
                    "onUpdate:modelValue":
                      e[2] || (e[2] = (r) => (a.value = r)),
                    type: "radio",
                    name: "value",
                    value: !1,
                    onChange: u,
                  },
                  null,
                  544,
                ),
                [[b, a.value]],
              ),
              e[4] || (e[4] = t("span", null, "No destacar", -1)),
            ]),
          ]),
        ])
      );
    },
  },
  te = { key: 0, class: "payment payment--invoice" },
  ne = { key: 0, class: "payment--invoice__description" },
  ae = { key: 1, class: "payment--invoice__description" },
  se = { class: "payment--invoice__options" },
  oe = { class: "payment--invoice__options__item" },
  ue = ["disabled"],
  le = { key: 2, class: "payment--invoice__details" },
  ve = {
    __name: "PaymentInvoice",
    setup(c) {
      const n = D(),
        { canRequestInvoice: d } = V(n.value),
        a = I(),
        u = S(!1),
        g = F(() => a.featured === !0 || typeof a.pack == "number");
      w(() => {
        ((u.value = a.is_invoice),
          d.value || ((u.value = !1), (a.is_invoice = !1)));
      });
      const C = () => {
        (d.value || (u.value = !1), (a.is_invoice = u.value));
      };
      return (s, e) => {
        const r = z;
        return g.value
          ? (v(),
            _("div", te, [
              e[17] ||
                (e[17] = t(
                  "div",
                  { class: "payment--invoice__title" },
                  "¿Necesitas boleta o factura?",
                  -1,
                )),
              o(n).is_company
                ? o(d)
                  ? k("", !0)
                  : (v(),
                    _("div", ae, [
                      e[7] || (e[7] = t("strong", null, "Importante:", -1)),
                      e[8] ||
                        (e[8] = i(
                          " Para solicitar factura, debes completar todos los datos de tu empresa. ",
                          -1,
                        )),
                      x(
                        r,
                        { to: "/cuenta/perfil/editar" },
                        {
                          default: $(() => [
                            ...(e[6] ||
                              (e[6] = [i("Completa tu perfil aquí", -1)])),
                          ]),
                          _: 1,
                        },
                      ),
                      e[9] || (e[9] = i(". ", -1)),
                    ]))
                : (v(),
                  _("div", ne, [
                    e[3] || (e[3] = t("strong", null, "Importante:", -1)),
                    e[4] ||
                      (e[4] = i(
                        " Si necesitas factura, asegúrate de tener un perfil de empresa. ",
                        -1,
                      )),
                    x(
                      r,
                      { to: "/cuenta/perfil/editar" },
                      {
                        default: $(() => [
                          ...(e[2] || (e[2] = [i("Edita tu perfil aquí", -1)])),
                        ]),
                        _: 1,
                      },
                    ),
                    e[5] || (e[5] = i(". ", -1)),
                  ])),
              t("div", se, [
                t("label", oe, [
                  f(
                    t(
                      "input",
                      {
                        "onUpdate:modelValue":
                          e[0] || (e[0] = (P) => (u.value = P)),
                        type: "radio",
                        name: "invoice",
                        value: !1,
                        onChange: C,
                      },
                      null,
                      544,
                    ),
                    [[b, u.value]],
                  ),
                  e[10] || (e[10] = t("span", null, "Boleta", -1)),
                ]),
                t(
                  "label",
                  {
                    class: U([
                      "payment--invoice__options__item",
                      { "payment--invoice__options__item--disabled": !o(d) },
                    ]),
                  },
                  [
                    f(
                      t(
                        "input",
                        {
                          "onUpdate:modelValue":
                            e[1] || (e[1] = (P) => (u.value = P)),
                          type: "radio",
                          name: "invoice",
                          value: !0,
                          disabled: !o(d),
                          onChange: C,
                        },
                        null,
                        40,
                        ue,
                      ),
                      [[b, u.value]],
                    ),
                    e[11] || (e[11] = t("span", null, "Factura", -1)),
                  ],
                  2,
                ),
              ]),
              u.value && o(d)
                ? (v(),
                  _("div", le, [
                    e[12] || (e[12] = i(" La factura se emitirá a ", -1)),
                    t("strong", null, l(o(n).business_name), 1),
                    e[13] || (e[13] = i(", RUT ", -1)),
                    t("strong", null, l(o(n).business_rut), 1),
                    e[14] || (e[14] = i(", con giro en ", -1)),
                    t("strong", null, l(o(n).business_type), 1),
                    e[15] || (e[15] = i(". Dirección de facturación: ", -1)),
                    t(
                      "strong",
                      null,
                      l(o(n).business_address) +
                        " " +
                        l(o(n).business_address_number) +
                        ", " +
                        l(o(n).business_commune?.name) +
                        ", " +
                        l(o(n).business_commune?.region?.name),
                      1,
                    ),
                    e[16] || (e[16] = i(". ", -1)),
                  ]))
                : k("", !0),
            ]))
          : k("", !0);
      };
    },
  };
export { pe as _, me as a, ve as b };
//# sourceMappingURL=CmMYCT_o.js.map

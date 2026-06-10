import { _ as H } from "./BQLSJJto.js";
import {
  bx as M,
  bc as O,
  bd as h,
  bl as C,
  cF as B,
  b8 as N,
  bv as j,
  bm as I,
  a_ as p,
  b5 as z,
  b1 as b,
  bf as o,
  b0 as n,
  b6 as r,
  bg as i,
  bh as c,
  cI as J,
  cJ as L,
  a$ as _,
  bn as $,
  bo as k,
  bi as E,
  bj as W,
  b9 as V,
  aZ as Z,
  bb as G,
  bu as K,
  bw as Q,
  cs as X,
  bF as Y,
} from "./BK8sApmn.js";
import { u as ee } from "./D_gKzRlW.js";
import { u as oe } from "./CAHpseH1.js";
import { B as ae } from "./C0j-iZe8.js";
import { u as se } from "./CJzzMwWR.js";
import "./CsS7OJ1I.js";
import "./DrPuZ622.js";
try {
  let u =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    m = new u.Error().stack;
  m &&
    ((u._sentryDebugIds = u._sentryDebugIds || {}),
    (u._sentryDebugIds[m] = "3c56df79-8646-4352-9aa1-c6bdd4d6006b"),
    (u._sentryDebugIdIdentifier =
      "sentry-dbid-3c56df79-8646-4352-9aa1-c6bdd4d6006b"));
} catch {}
const ne = { class: "form__grid" },
  te = { class: "form__field" },
  re = { class: "form-group" },
  le = { class: "form__field" },
  de = { class: "form-group" },
  ue = { class: "form-group" },
  me = ["value"],
  ie = { class: "form-group" },
  ce = ["value"],
  pe = { class: "form__field" },
  fe = { class: "form-group" },
  be = { class: "form__field" },
  _e = { class: "form-group" },
  ge = {
    __name: "FormCreateThree",
    emits: ["formSubmitted", "formBack"],
    setup(u, { emit: m }) {
      const g = m,
        { paymentSummaryText: f } = oe(),
        d = M(),
        S = O({
          email: h()
            .required("El email es requerido")
            .email("Debe ser un email válido"),
          phone: h()
            .required("El teléfono es requerido")
            .min(11, "El teléfono debe tener al menos 11 caracteres")
            .max(20, "El teléfono no puede exceder los 20 caracteres")
            .matches(
              /^[\d\s()+-]+$/,
              "El teléfono solo puede contener números, +, espacios, paréntesis y guiones",
            ),
          region: C().nullable(),
          commune: C().nullable(),
          address: h(),
          addressNumber: h()
            .matches(
              /^\d+$/,
              "El número de dirección solo puede contener números",
            )
            .max(5, "El número de dirección no puede exceder los 5 caracteres"),
        }),
        s = B(),
        v = N(
          s.ad.region ||
            d.value?.region?.id ||
            d.value?.commune?.region?.id ||
            null,
        ),
        t = N({
          email: s.ad.email || d.value?.email || "",
          phone: s.ad.phone || d.value?.phone || "",
          region:
            s.ad.region ||
            d.value?.region?.id ||
            d.value?.commune?.region?.id ||
            null,
          commune:
            s.ad.commune !== void 0 && s.ad.commune !== null
              ? s.ad.commune
              : d.value?.commune?.id || null,
          address: s.ad.address || d.value?.address || "",
          addressNumber: s.ad.address_number || d.value?.address_number || "",
        }),
        y = ee(),
        x = V(() => y.regions.data),
        A = j(),
        D = V(() => A.communes.data || []),
        F = V(() =>
          v.value ? D.value.filter((l) => l.region.id === v.value) : [],
        ),
        w = () => {
          ((t.value.commune = null), (v.value = t.value.region));
        },
        R = (l) => {
          const e = l.target.value.replace(/\D/g, "");
          t.value.addressNumber = e.slice(0, 5);
        },
        P = async (l) => {
          (s.updateEmail(l.email),
            s.updatePhone(l.phone),
            s.updateRegion(l.region),
            s.updateCommune(l.commune),
            s.updateAddress(l.address),
            s.updateAddressNumber(l.addressNumber.toString()),
            g("formSubmitted", l));
        },
        T = async () => {
          g("formBack");
        };
      return (
        I(() => {
          y.loadRegions();
        }),
        (l, e) => {
          const U = H;
          return (
            p(),
            z(
              r(W),
              {
                "validation-schema": r(S),
                "initial-values": t.value,
                "validate-on-mount": "",
                class: "form form--create",
                onSubmit: P,
              },
              {
                default: b(({ meta: q }) => [
                  e[13] ||
                    (e[13] = o(
                      "div",
                      { class: "form__field" },
                      [
                        o(
                          "h2",
                          { class: "form__title" },
                          "Confirmanos tus datos personales",
                        ),
                        o("div", { class: "form__description" }, [
                          o(
                            "p",
                            null,
                            " Proporciona tus datos de forma precisa para asegurar el éxito de tu anuncio. ",
                          ),
                        ]),
                      ],
                      -1,
                    )),
                  o("div", ne, [
                    o("div", te, [
                      o("div", re, [
                        e[5] ||
                          (e[5] = o(
                            "label",
                            { class: "form-label", for: "email" },
                            "* Email",
                            -1,
                          )),
                        n(
                          r(i),
                          {
                            modelValue: t.value.email,
                            "onUpdate:modelValue":
                              e[0] || (e[0] = (a) => (t.value.email = a)),
                            name: "email",
                            type: "email",
                            class: "form-control",
                          },
                          null,
                          8,
                          ["modelValue"],
                        ),
                        n(r(c), { name: "email" }),
                      ]),
                    ]),
                    o("div", le, [
                      o("div", de, [
                        e[6] ||
                          (e[6] = o(
                            "label",
                            { class: "form-label", for: "phone" },
                            "* Teléfono",
                            -1,
                          )),
                        n(
                          r(i),
                          { name: "phone" },
                          {
                            default: b(({ field: a }) => [
                              n(U, J(L(a)), null, 16),
                            ]),
                            _: 1,
                          },
                        ),
                        n(r(c), { name: "phone" }),
                      ]),
                    ]),
                    o("div", ue, [
                      e[8] ||
                        (e[8] = o(
                          "label",
                          { class: "form-label", for: "region" },
                          "Región",
                          -1,
                        )),
                      n(
                        r(i),
                        {
                          modelValue: t.value.region,
                          "onUpdate:modelValue":
                            e[1] || (e[1] = (a) => (t.value.region = a)),
                          as: "select",
                          name: "region",
                          class: "form-control",
                          onChange: w,
                        },
                        {
                          default: b(() => [
                            e[7] ||
                              (e[7] = o(
                                "option",
                                { value: null, disabled: "" },
                                "Selecciona una región",
                                -1,
                              )),
                            (p(!0),
                            _(
                              $,
                              null,
                              k(
                                x.value,
                                (a) => (
                                  p(),
                                  _(
                                    "option",
                                    { key: a.id, value: a.id },
                                    E(a.name),
                                    9,
                                    me,
                                  )
                                ),
                              ),
                              128,
                            )),
                          ]),
                          _: 1,
                        },
                        8,
                        ["modelValue"],
                      ),
                      n(r(c), { name: "region" }),
                    ]),
                    o("div", ie, [
                      e[10] ||
                        (e[10] = o(
                          "label",
                          { class: "form-label", for: "commune" },
                          "Comuna",
                          -1,
                        )),
                      n(
                        r(i),
                        {
                          modelValue: t.value.commune,
                          "onUpdate:modelValue":
                            e[2] || (e[2] = (a) => (t.value.commune = a)),
                          as: "select",
                          name: "commune",
                          class: "form-control",
                        },
                        {
                          default: b(() => [
                            e[9] ||
                              (e[9] = o(
                                "option",
                                { value: null, disabled: "" },
                                "Selecciona una comuna",
                                -1,
                              )),
                            (p(!0),
                            _(
                              $,
                              null,
                              k(
                                F.value,
                                (a) => (
                                  p(),
                                  _(
                                    "option",
                                    { key: a.id, value: a.id },
                                    E(a.name),
                                    9,
                                    ce,
                                  )
                                ),
                              ),
                              128,
                            )),
                          ]),
                          _: 1,
                        },
                        8,
                        ["modelValue"],
                      ),
                      n(r(c), { name: "commune" }),
                    ]),
                    o("div", pe, [
                      o("div", fe, [
                        e[11] ||
                          (e[11] = o(
                            "label",
                            { class: "form-label", for: "address" },
                            "Dirección",
                            -1,
                          )),
                        n(
                          r(i),
                          {
                            modelValue: t.value.address,
                            "onUpdate:modelValue":
                              e[3] || (e[3] = (a) => (t.value.address = a)),
                            name: "address",
                            type: "text",
                            class: "form-control",
                          },
                          null,
                          8,
                          ["modelValue"],
                        ),
                        n(r(c), { name: "address" }),
                      ]),
                    ]),
                    o("div", be, [
                      o("div", _e, [
                        e[12] ||
                          (e[12] = o(
                            "label",
                            { class: "form-label", for: "addressNumber" },
                            " Número de Dirección ",
                            -1,
                          )),
                        n(
                          r(i),
                          {
                            modelValue: t.value.addressNumber,
                            "onUpdate:modelValue":
                              e[4] ||
                              (e[4] = (a) => (t.value.addressNumber = a)),
                            name: "addressNumber",
                            type: "text",
                            class: "form-control",
                            maxlength: "5",
                            onInput: R,
                          },
                          null,
                          8,
                          ["modelValue"],
                        ),
                        n(r(c), { name: "addressNumber" }),
                      ]),
                    ]),
                  ]),
                  n(
                    ae,
                    {
                      percentage: 50,
                      "current-step": 3,
                      "total-steps": 5,
                      "show-steps": !0,
                      "summary-text": r(f),
                      "primary-label": "Continuar",
                      "primary-disabled": !q.valid,
                      onBack: T,
                    },
                    null,
                    8,
                    ["summary-text", "primary-disabled"],
                  ),
                ]),
                _: 1,
              },
              8,
              ["validation-schema", "initial-values"],
            )
          );
        }
      );
    },
  },
  ve = { class: "page" },
  ye = { class: "create create--announcement" },
  he = { class: "create--announcement__container" },
  Se = { class: "create--announcement__steps" },
  xe = { class: "step step--3" },
  Ae = Z({
    __name: "datos-personales",
    setup(u) {
      const m = G(),
        g = se(),
        f = B(),
        { $setSEO: d } = K();
      (d({
        title: "Crear Anuncio - Datos Personales",
        description:
          "Ingresa tus datos personales para publicar tu anuncio en Waldo.click®.",
      }),
        Q({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        I(() => {
          (f.updateStep(3), g.stepView(3, "Personal Information"));
        }));
      function S() {
        (f.updateStep(4), m.push("/anunciar/ficha-de-producto"));
      }
      function s() {
        (f.updateStep(2), m.push("/anunciar/datos-del-producto"));
      }
      return (v, t) => {
        const y = ge,
          x = Y;
        return (
          p(),
          _("div", ve, [
            n(X),
            o("section", ye, [
              o("div", he, [
                n(x, null, {
                  default: b(() => [
                    o("div", Se, [
                      o("div", xe, [
                        n(y, { onFormSubmitted: S, onFormBack: s }),
                      ]),
                    ]),
                  ]),
                  _: 1,
                }),
              ]),
            ]),
          ])
        );
      };
    },
  });
export { Ae as default };
//# sourceMappingURL=BJY7GaMk.js.map

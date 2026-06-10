import {
  aZ as $,
  bc as O,
  bd as b,
  bl as j,
  cF as E,
  b8 as z,
  be as B,
  bm as I,
  a_ as p,
  b5 as H,
  b1 as y,
  bf as o,
  b0 as n,
  b6 as i,
  bg as u,
  bh as v,
  a$ as g,
  bn as K,
  bo as M,
  b7 as R,
  bi as F,
  bj as G,
  b9 as k,
  bb as Q,
  bu as W,
  bw as Z,
  cs as J,
  bF as X,
} from "./BK8sApmn.js";
import { u as Y } from "./De8hi3Om.js";
import { u as ee } from "./Ce4MZUPb.js";
import { u as te } from "./CAHpseH1.js";
import { B as ae } from "./C0j-iZe8.js";
import { u as oe } from "./CJzzMwWR.js";
import "./CsS7OJ1I.js";
import "./DrPuZ622.js";
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
    c = new l.Error().stack;
  c &&
    ((l._sentryDebugIds = l._sentryDebugIds || {}),
    (l._sentryDebugIds[c] = "65c27ff2-eb2c-48ce-877c-7b01c101749c"),
    (l._sentryDebugIdIdentifier =
      "sentry-dbid-65c27ff2-eb2c-48ce-877c-7b01c101749c"));
} catch {}
const re = { class: "form__field" },
  ne = { class: "form-group" },
  se = { key: 0, class: "form__field" },
  ie = { class: "form-group" },
  le = ["value"],
  ce = { class: "form__field" },
  de = { class: "form-group" },
  ue = { class: "currency" },
  me = { class: "currency__input" },
  pe = { class: "form__field" },
  fe = { class: "form-group" },
  _e = { class: "form-msg" },
  m = 300,
  be = $({
    __name: "FormCreateTwo",
    emits: ["formSubmitted", "formBack"],
    setup(l, { emit: c }) {
      const { isValidText: f } = ee(),
        { paymentSummaryText: d } = te(),
        h = O({
          name: b()
            .required("El título es requerido")
            .min(5, "El título debe tener al menos 5 caracteres")
            .max(50, "El título debe tener como máximo 50 caracteres")
            .test("is-valid-title", "Título no válido", (t) => f(t || "")),
          category: b().required("La categoría es requerida"),
          price: j()
            .transform((t, a) => (a === "" ? null : t))
            .required("El precio es requerido")
            .positive("El precio debe ser mayor a 0")
            .max(9999999999, "El precio no puede exceder los 10 dígitos"),
          currency: b().required("La moneda es requerida"),
          description: b()
            .required("La descripción es requerida")
            .test("is-valid-description", "Descripción no válida", (t) =>
              f(t || ""),
            ),
        }),
        r = E(),
        x = Y(),
        D = k(() => r.step),
        e = z({
          name: "",
          category: r.ad.category || "",
          price: r.ad.price || "",
          currency: r.ad.currency || "CLP",
          description: r.ad.description || "",
        }),
        S = k(() => m - e.value.description.length),
        V = () => {
          e.value.description.length > m &&
            (e.value.description = e.value.description.slice(0, m));
        };
      B(
        () => e.value.description,
        (t) => {
          t && t.length > m && (e.value.description = t.slice(0, m));
        },
      );
      const P = () => {
          e.value.name.length > 50 &&
            (e.value.name = e.value.name.slice(0, 50));
        },
        T = (t) => {
          const C = t.target.value.replace(/\D/g, "");
          if (C === "") e.value.price = "";
          else {
            const _ = Number(C);
            e.value.price = _ > 9999999999 ? 9999999999 : _;
          }
        },
        L = (t) => {
          ["e", "E", "+", "-", "."].includes(t.key) && t.preventDefault();
        },
        q = k(() => x.categories);
      (I(() => {
        ((e.value.name = r.ad.name || ""),
          (e.value.category = r.ad.category || ""),
          (e.value.price = r.ad.price || 0),
          (e.value.currency = r.ad.currency || "CLP"),
          (e.value.description = r.ad.description || ""));
      }),
        B(
          () => r.ad,
          (t) => {
            ((e.value.price = t.price || 0),
              (e.value.currency = t.currency || "CLP"),
              (e.value.name = t.name || ""),
              (e.value.category = t.category || ""),
              (e.value.description = t.description || ""));
          },
        ));
      const w = c,
        N = async (t) => {
          (r.updateName(t.name),
            r.updateCategory(t.category),
            r.updatePrice(t.price),
            r.updateCurrency(t.currency),
            r.updateDescription(t.description),
            w("formSubmitted", t));
        },
        U = async () => {
          w("formBack");
        };
      return (t, a) => (
        p(),
        H(
          i(G),
          {
            "validation-schema": i(h),
            "initial-values": e.value,
            "validate-on-mount": "",
            class: "form form--create",
            onSubmit: N,
          },
          {
            default: y(({ errors: C, meta: _ }) => [
              a[11] ||
                (a[11] = o(
                  "div",
                  { class: "form__field" },
                  [
                    o("h2", { class: "form__title" }, "¿Qué quieres publicar?"),
                    o("div", { class: "form__description" }, [
                      o(
                        "p",
                        null,
                        " Recuerda que una vez creado el anuncio no podrás editar los datos. ",
                      ),
                    ]),
                  ],
                  -1,
                )),
              o("div", re, [
                o("div", ne, [
                  a[5] ||
                    (a[5] = o(
                      "label",
                      { class: "form-label", for: "name" },
                      "* Título",
                      -1,
                    )),
                  n(
                    i(u),
                    {
                      modelValue: e.value.name,
                      "onUpdate:modelValue":
                        a[0] || (a[0] = (s) => (e.value.name = s)),
                      name: "name",
                      type: "text",
                      class: "form-control",
                      maxlength: "50",
                      onInput: P,
                    },
                    null,
                    8,
                    ["modelValue"],
                  ),
                  n(i(v), { name: "name" }),
                ]),
              ]),
              q.value.length > 0
                ? (p(),
                  g("div", se, [
                    o("div", ie, [
                      a[7] ||
                        (a[7] = o(
                          "label",
                          { class: "form-label", for: "category" },
                          "* Categoría",
                          -1,
                        )),
                      n(
                        i(u),
                        {
                          modelValue: e.value.category,
                          "onUpdate:modelValue":
                            a[1] || (a[1] = (s) => (e.value.category = s)),
                          as: "select",
                          name: "category",
                          class: "form-control",
                        },
                        {
                          default: y(() => [
                            a[6] ||
                              (a[6] = o(
                                "option",
                                { value: null, disabled: "" },
                                "Seleccione una categoría",
                                -1,
                              )),
                            (p(!0),
                            g(
                              K,
                              null,
                              M(
                                q.value,
                                (s, A) => (
                                  p(),
                                  g(
                                    "option",
                                    { key: A, value: s.id },
                                    F(s.name),
                                    9,
                                    le,
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
                      n(i(v), { name: "category" }),
                    ]),
                  ]))
                : R("", !0),
              o("div", ce, [
                o("div", de, [
                  o("div", ue, [
                    o("div", me, [
                      a[9] ||
                        (a[9] = o(
                          "label",
                          { class: "form-label", for: "price" },
                          "* Precio",
                          -1,
                        )),
                      n(
                        i(u),
                        {
                          modelValue: e.value.currency,
                          "onUpdate:modelValue":
                            a[2] || (a[2] = (s) => (e.value.currency = s)),
                          as: "select",
                          name: "currency",
                          class: "currency__select",
                        },
                        {
                          default: y(() => [
                            ...(a[8] ||
                              (a[8] = [
                                o("option", { value: "CLP" }, "CLP", -1),
                                o("option", { value: "USD" }, "USD", -1),
                              ])),
                          ]),
                          _: 1,
                        },
                        8,
                        ["modelValue"],
                      ),
                      n(
                        i(u),
                        {
                          modelValue: e.value.price,
                          "onUpdate:modelValue":
                            a[3] || (a[3] = (s) => (e.value.price = s)),
                          name: "price",
                          type: "number",
                          class: "form-control",
                          min: "0",
                          maxlength: "10",
                          inputmode: "numeric",
                          onKeydown: L,
                          onInput: T,
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      n(i(v), { name: "price" }),
                    ]),
                  ]),
                ]),
              ]),
              o("div", pe, [
                o("div", fe, [
                  a[10] ||
                    (a[10] = o(
                      "label",
                      { class: "form-label", for: "description" },
                      "* Descripción",
                      -1,
                    )),
                  n(
                    i(u),
                    {
                      modelValue: e.value.description,
                      "onUpdate:modelValue":
                        a[4] || (a[4] = (s) => (e.value.description = s)),
                      as: "textarea",
                      name: "description",
                      class: "form-control",
                      maxlength: "300",
                      onInput: V,
                    },
                    null,
                    8,
                    ["modelValue"],
                  ),
                  n(i(v), { name: "description" }),
                  o("p", _e, F(S.value) + " caracteres", 1),
                ]),
              ]),
              n(
                ae,
                {
                  percentage: 25,
                  "current-step": D.value,
                  "total-steps": 5,
                  "show-steps": !0,
                  "summary-text": i(d),
                  "primary-label": "Continuar",
                  "primary-disabled": !_.valid,
                  onBack: U,
                },
                null,
                8,
                ["current-step", "summary-text", "primary-disabled"],
              ),
            ]),
            _: 1,
          },
          8,
          ["validation-schema", "initial-values"],
        )
      );
    },
  }),
  ve = Object.assign(be, { __name: "FormCreateTwo" }),
  ye = { class: "page" },
  ge = { class: "create create--announcement" },
  he = { class: "create--announcement__container" },
  xe = { class: "create--announcement__steps" },
  Se = { class: "step step--2" },
  $e = $({
    __name: "datos-del-producto",
    setup(l) {
      const c = Q(),
        f = oe(),
        d = E(),
        { $setSEO: h } = W();
      (h({
        title: "Crear Anuncio - Datos del Producto",
        description:
          "Ingresa los datos del producto que deseas publicar en Waldo.click®.",
      }),
        Z({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        I(() => {
          (d.updateStep(2), f.stepView(2, "General"));
        }));
      function r() {
        (d.updateStep(3), c.push("/anunciar/datos-personales"));
      }
      function x() {
        (d.updateStep(1), c.push("/anunciar"));
      }
      return (D, e) => {
        const S = ve,
          V = X;
        return (
          p(),
          g("div", ye, [
            n(J),
            o("section", ge, [
              o("div", he, [
                n(V, null, {
                  default: y(() => [
                    o("div", xe, [
                      o("div", Se, [
                        n(S, { onFormSubmitted: r, onFormBack: x }),
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
export { $e as default };
//# sourceMappingURL=DnTqKTTX.js.map

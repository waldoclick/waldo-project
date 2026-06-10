import {
  aZ as D,
  bc as U,
  bl as b,
  bd as y,
  cF as I,
  b8 as K,
  bm as $,
  a_ as w,
  b5 as L,
  b1 as E,
  bf as t,
  b0 as l,
  b6 as r,
  bg as d,
  a$ as C,
  bn as M,
  bo as P,
  bh as i,
  bj as j,
  b9 as q,
  bi as T,
  bb as Y,
  bu as H,
  bw as O,
  cs as W,
  bF as z,
} from "./BK8sApmn.js";
import { u as R } from "./B5cviOR7.js";
import { u as Z } from "./Ce4MZUPb.js";
import { u as G } from "./CAHpseH1.js";
import { B as J } from "./C0j-iZe8.js";
import { u as Q } from "./CJzzMwWR.js";
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
    (u._sentryDebugIds[m] = "355ba64a-7e11-4b57-b865-3c1fd3999dfc"),
    (u._sentryDebugIdIdentifier =
      "sentry-dbid-355ba64a-7e11-4b57-b865-3c1fd3999dfc"));
} catch {}
const X = { class: "form__grid" },
  ee = { class: "form__field" },
  oe = { class: "form-group" },
  te = ["value"],
  ne = { class: "form__field" },
  ae = { class: "form-group" },
  le = { class: "form__grid form__grid--3" },
  re = { class: "form__field" },
  se = { class: "form-group" },
  de = { class: "form__field" },
  ie = { class: "form-group" },
  ue = { class: "form__field" },
  me = { class: "form-group" },
  ce = { class: "form__grid form__grid--4" },
  pe = { class: "form__field" },
  fe = { class: "form-group" },
  be = { class: "form__field" },
  _e = { class: "form-group" },
  ge = { class: "form__field" },
  he = { class: "form-group" },
  ve = { class: "form__field" },
  ye = { class: "form-group" },
  we = D({
    __name: "FormCreateFour",
    emits: ["formSubmitted", "formBack"],
    setup(u, { emit: m }) {
      const _ = m,
        { paymentSummaryText: p } = G(),
        { isValidText: x } = Z(),
        V = U({
          condition: y().required("La condición es requerida"),
          manufacturer: y()
            .nullable()
            .max(20, "El fabricante no puede exceder los 20 caracteres")
            .test("is-valid-manufacturer", "Fabricante no válido", (o) =>
              x(o || ""),
            ),
          model: y()
            .nullable()
            .max(20, "El modelo no puede exceder los 20 caracteres"),
          year: b()
            .transform((o, e) => (e === "" || e === null ? null : Number(e)))
            .nullable()
            .min(0, "El año no puede ser negativo")
            .integer("El año debe ser un número entero")
            .max(
              new Date().getFullYear(),
              `El año no puede ser mayor a ${new Date().getFullYear()}`,
            )
            .test("len", "El año debe tener como máximo 4 dígitos", (o) =>
              o == null ? !0 : String(o).length <= 4,
            ),
          serial_number: y()
            .nullable()
            .max(30, "El número de serie no puede exceder los 30 caracteres"),
          weight: b()
            .nullable()
            .min(0, "El peso no puede ser negativo")
            .transform((o, e) => (e === "" ? null : o))
            .test("len", "El peso no puede exceder los 7 caracteres", (o) =>
              o == null ? !0 : String(o).length <= 7,
            ),
          width: b()
            .nullable()
            .min(0, "El ancho no puede ser negativo")
            .transform((o, e) => (e === "" ? null : o))
            .test("len", "El ancho no puede exceder los 4 caracteres", (o) =>
              o == null ? !0 : String(o).length <= 4,
            ),
          height: b()
            .nullable()
            .min(0, "La altura no puede ser negativa")
            .transform((o, e) => (e === "" ? null : o))
            .test("len", "La altura no puede exceder los 4 caracteres", (o) =>
              o == null ? !0 : String(o).length <= 4,
            ),
          depth: b()
            .nullable()
            .min(0, "La profundidad no puede ser negativa")
            .transform((o, e) => (e === "" ? null : o))
            .test(
              "len",
              "La profundidad no puede exceder los 4 caracteres",
              (o) => (o == null ? !0 : String(o).length <= 4),
            ),
        }),
        s = I(),
        S = R(),
        a = K({
          condition: s.ad.condition || null,
          manufacturer: s.ad.manufacturer || "",
          model: s.ad.model || "",
          serial_number: s.ad.serial_number || "",
          year: s.ad.year || 0,
          weight: s.ad.weight || 0,
          width: s.ad.width || 0,
          height: s.ad.height || 0,
          depth: s.ad.depth || 0,
        }),
        F = q(() => S.conditions),
        k = async (o) => {
          (s.updateCondition(o.condition),
            s.updateManufacturer(o.manufacturer),
            s.updateModel(o.model),
            s.updateYear(o.year),
            s.updateSerialNumber(o.serial_number),
            s.updateWeight(o.weight),
            s.updateWidth(o.width),
            s.updateHeight(o.height),
            s.updateDepth(o.depth),
            _("formSubmitted", o));
        },
        B = async () => {
          _("formBack");
        },
        A = (o) => {
          ["e", "E", "+", "-", "."].includes(o.key) && o.preventDefault();
        },
        N = (o) => {
          const e = o.target,
            f = e.value.replace(/\D/g, "");
          ((e.value = f), (a.value.year = f === "" ? 0 : Number(f)));
        },
        g = (o) => {
          ["e", "E", "+", "-"].includes(o.key) && o.preventDefault();
        },
        h = (o) => {
          const e = o.target,
            c = e.value.replace(/[^\d.]/g, "").split("."),
            n = c.length > 1 ? c[0] + "." + c.slice(1).join("") : (c[0] ?? "");
          e.value = n;
          const v = e.name;
          v in a.value && (a.value[v] = n === "" ? 0 : Number(n));
        };
      return (
        $(() => {
          S.loadConditions();
        }),
        (o, e) => (
          w(),
          L(
            r(j),
            {
              "validation-schema": r(V),
              "initial-values": a.value,
              "validate-on-mount": "",
              class: "form form--create",
              onSubmit: k,
            },
            {
              default: E(({ errors: f, meta: c }) => [
                e[19] ||
                  (e[19] = t(
                    "div",
                    { class: "form__field" },
                    [
                      t(
                        "h2",
                        { class: "form__title" },
                        "Completa la ficha de tu producto",
                      ),
                      t("div", { class: "form__description" }, [
                        t(
                          "p",
                          null,
                          " Estarás mejor ubicado en los resultados de búsqueda y los compradores tendrán la información para comprar tu equipo. ",
                        ),
                      ]),
                    ],
                    -1,
                  )),
                t("div", X, [
                  t("div", ee, [
                    t("div", oe, [
                      e[10] ||
                        (e[10] = t(
                          "label",
                          { class: "form-label", for: "condition" },
                          "* Condición",
                          -1,
                        )),
                      l(
                        r(d),
                        {
                          modelValue: a.value.condition,
                          "onUpdate:modelValue":
                            e[0] || (e[0] = (n) => (a.value.condition = n)),
                          as: "select",
                          name: "condition",
                          class: "form-control",
                        },
                        {
                          default: E(() => [
                            e[9] ||
                              (e[9] = t(
                                "option",
                                { value: null, disabled: "" },
                                "Seleccione una condición",
                                -1,
                              )),
                            (w(!0),
                            C(
                              M,
                              null,
                              P(
                                F.value,
                                (n, v) => (
                                  w(),
                                  C(
                                    "option",
                                    { key: v, value: n.id },
                                    T(n.name),
                                    9,
                                    te,
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
                      l(r(i), { name: "condition" }),
                    ]),
                  ]),
                  t("div", ne, [
                    t("div", ae, [
                      e[11] ||
                        (e[11] = t(
                          "label",
                          { class: "form-label", for: "manufacturer" },
                          "Fabricante",
                          -1,
                        )),
                      l(
                        r(d),
                        {
                          modelValue: a.value.manufacturer,
                          "onUpdate:modelValue":
                            e[1] || (e[1] = (n) => (a.value.manufacturer = n)),
                          name: "manufacturer",
                          type: "text",
                          class: "form-control",
                          maxlength: "20",
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      l(r(i), { name: "manufacturer" }),
                    ]),
                  ]),
                ]),
                t("div", le, [
                  t("div", re, [
                    t("div", se, [
                      e[12] ||
                        (e[12] = t(
                          "label",
                          { class: "form-label", for: "model" },
                          "Modelo",
                          -1,
                        )),
                      l(
                        r(d),
                        {
                          modelValue: a.value.model,
                          "onUpdate:modelValue":
                            e[2] || (e[2] = (n) => (a.value.model = n)),
                          name: "model",
                          type: "text",
                          class: "form-control",
                          maxlength: "20",
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      l(r(i), { name: "model" }),
                    ]),
                  ]),
                  t("div", de, [
                    t("div", ie, [
                      e[13] ||
                        (e[13] = t(
                          "label",
                          { class: "form-label", for: "serial_number" },
                          "Número de Serie",
                          -1,
                        )),
                      l(
                        r(d),
                        {
                          modelValue: a.value.serial_number,
                          "onUpdate:modelValue":
                            e[3] || (e[3] = (n) => (a.value.serial_number = n)),
                          name: "serial_number",
                          type: "text",
                          class: "form-control",
                          maxlength: "30",
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      l(r(i), { name: "serial_number" }),
                    ]),
                  ]),
                  t("div", ue, [
                    t("div", me, [
                      e[14] ||
                        (e[14] = t(
                          "label",
                          { class: "form-label", for: "year" },
                          "Año",
                          -1,
                        )),
                      l(
                        r(d),
                        {
                          modelValue: a.value.year,
                          "onUpdate:modelValue":
                            e[4] || (e[4] = (n) => (a.value.year = n)),
                          name: "year",
                          type: "number",
                          class: "form-control",
                          min: "0",
                          maxlength: "4",
                          inputmode: "numeric",
                          onKeydown: A,
                          onInput: N,
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      l(r(i), { name: "year" }),
                    ]),
                  ]),
                ]),
                t("div", ce, [
                  t("div", pe, [
                    t("div", fe, [
                      e[15] ||
                        (e[15] = t(
                          "label",
                          { class: "form-label", for: "weight" },
                          "Peso (kg)",
                          -1,
                        )),
                      l(
                        r(d),
                        {
                          modelValue: a.value.weight,
                          "onUpdate:modelValue":
                            e[5] || (e[5] = (n) => (a.value.weight = n)),
                          name: "weight",
                          type: "number",
                          class: "form-control",
                          min: "0",
                          maxlength: "7",
                          inputmode: "decimal",
                          onKeydown: g,
                          onInput: h,
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      l(r(i), { name: "weight" }),
                    ]),
                  ]),
                  t("div", be, [
                    t("div", _e, [
                      e[16] ||
                        (e[16] = t(
                          "label",
                          { class: "form-label", for: "width" },
                          "Ancho (m)",
                          -1,
                        )),
                      l(
                        r(d),
                        {
                          modelValue: a.value.width,
                          "onUpdate:modelValue":
                            e[6] || (e[6] = (n) => (a.value.width = n)),
                          name: "width",
                          type: "number",
                          class: "form-control",
                          min: "0",
                          maxlength: "4",
                          inputmode: "decimal",
                          onKeydown: g,
                          onInput: h,
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      l(r(i), { name: "width" }),
                    ]),
                  ]),
                  t("div", ge, [
                    t("div", he, [
                      e[17] ||
                        (e[17] = t(
                          "label",
                          { class: "form-label", for: "height" },
                          "Altura (m)",
                          -1,
                        )),
                      l(
                        r(d),
                        {
                          modelValue: a.value.height,
                          "onUpdate:modelValue":
                            e[7] || (e[7] = (n) => (a.value.height = n)),
                          name: "height",
                          type: "number",
                          class: "form-control",
                          min: "0",
                          maxlength: "4",
                          inputmode: "decimal",
                          onKeydown: g,
                          onInput: h,
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      l(r(i), { name: "height" }),
                    ]),
                  ]),
                  t("div", ve, [
                    t("div", ye, [
                      e[18] ||
                        (e[18] = t(
                          "label",
                          { class: "form-label", for: "depth" },
                          "Profundidad (m)",
                          -1,
                        )),
                      l(
                        r(d),
                        {
                          modelValue: a.value.depth,
                          "onUpdate:modelValue":
                            e[8] || (e[8] = (n) => (a.value.depth = n)),
                          name: "depth",
                          type: "number",
                          class: "form-control",
                          min: "0",
                          maxlength: "4",
                          inputmode: "decimal",
                          onKeydown: g,
                          onInput: h,
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      l(r(i), { name: "depth" }),
                    ]),
                  ]),
                ]),
                l(
                  J,
                  {
                    percentage: 75,
                    "current-step": 4,
                    "total-steps": 5,
                    "show-steps": !0,
                    "summary-text": r(p),
                    "primary-label": "Continuar",
                    "primary-disabled": !c.valid,
                    onBack: B,
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
        )
      );
    },
  }),
  xe = Object.assign(we, { __name: "FormCreateFour" }),
  Ve = { class: "page" },
  Se = { class: "create create--announcement" },
  Fe = { class: "create--announcement__container" },
  ke = { class: "create--announcement__steps" },
  Ee = { class: "step step--4" },
  Ke = D({
    __name: "ficha-de-producto",
    setup(u) {
      const m = Y(),
        _ = Q(),
        p = I(),
        { $setSEO: x } = H();
      (x({
        title: "Crear Anuncio - Ficha de Producto",
        description:
          "Completa la ficha técnica de tu producto para publicar tu anuncio en Waldo.click®.",
      }),
        O({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        $(() => {
          (p.updateStep(4), _.stepView(4, "Product Sheet"));
        }));
      function V() {
        (p.updateStep(5), m.push("/anunciar/galeria-de-imagenes"));
      }
      function s() {
        (p.updateStep(3), m.push("/anunciar/datos-personales"));
      }
      return (S, a) => {
        const F = xe,
          k = z;
        return (
          w(),
          C("div", Ve, [
            l(W),
            t("section", Se, [
              t("div", Fe, [
                l(k, null, {
                  default: E(() => [
                    t("div", ke, [
                      t("div", Ee, [
                        l(F, { onFormSubmitted: V, onFormBack: s }),
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
export { Ke as default };
//# sourceMappingURL=CWDXpTYl.js.map

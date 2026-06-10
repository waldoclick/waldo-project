import { _ as le } from "./BQLSJJto.js";
import {
  bb as re,
  bv as ue,
  bK as te,
  bx as ie,
  bz as de,
  b8 as E,
  be as R,
  bc as me,
  bd as d,
  bL as be,
  bp as pe,
  bm as ce,
  a_ as b,
  b5 as ve,
  b1 as _,
  b0 as r,
  bF as _e,
  bf as o,
  b6 as u,
  bg as t,
  bh as i,
  a$ as p,
  bn as N,
  bo as I,
  bi as S,
  b7 as D,
  bj as fe,
  b9 as h,
  bM as ge,
  bk as ye,
} from "./BK8sApmn.js";
import { u as Ve } from "./BWjFl-iO.js";
import { u as Ee } from "./CMM48BjM.js";
import { u as he } from "./Ce4MZUPb.js";
import { u as qe } from "./D_gKzRlW.js";
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
    q = new c.Error().stack;
  q &&
    ((c._sentryDebugIds = c._sentryDebugIds || {}),
    (c._sentryDebugIds[q] = "3efee2a9-1881-4892-aa78-2bbab330ae83"),
    (c._sentryDebugIdIdentifier =
      "sentry-dbid-3efee2a9-1881-4892-aa78-2bbab330ae83"));
} catch {}
const we = { class: "form form--profile" },
  xe = { class: "form__grid" },
  Ue = { class: "form-group" },
  Re = { class: "form__grid" },
  Ne = { class: "form-group" },
  Ie = { class: "form-group" },
  Se = { class: "form-group" },
  De = { class: "form-group" },
  Ce = { class: "form-group" },
  Te = { class: "form-group" },
  ke = { class: "form-group" },
  Ae = { class: "form-group" },
  Be = { class: "form-group" },
  Fe = ["value"],
  Pe = { class: "form-group" },
  ze = ["value"],
  $e = { key: 0, class: "form__subtitle" },
  Me = { key: 1, class: "form__grid" },
  Le = { class: "form-group" },
  je = { class: "form-group" },
  Ge = { class: "form-group" },
  Oe = { class: "form-group" },
  Ye = { class: "form-group" },
  He = { class: "form-group" },
  Ke = { class: "form-group" },
  Je = ["value"],
  Qe = { class: "form-group" },
  We = ["value"],
  Xe = ["disabled"],
  Ze = { key: 0 },
  es = { key: 1 },
  ss = {
    __name: "FormProfile",
    props: { onboardingMode: { type: Boolean, default: !1 } },
    emits: ["success"],
    setup(c, { emit: q }) {
      const P = q,
        z = c,
        { Swal: C } = ye(),
        y = E(!1);
      re();
      const $ = qe(),
        T = h(() => $.regions?.data ?? []),
        M = ue(),
        w = h(() => M.communes?.data ?? []),
        L = te(),
        f = E(null),
        m = (s) => {
          if (s == null || s === "") return null;
          const e = Number(s);
          return Number.isNaN(e) ? null : e;
        },
        j = h(() => {
          const s = m(f.value);
          return s ? w.value.filter((e) => e.region.id === s) : [];
        }),
        l = ie(),
        { fetchUser: G } = de(),
        g = E(null),
        O = h(() => {
          const s = m(g.value);
          return s ? w.value.filter((e) => e.region.id === s) : [];
        }),
        { formatRut: k, validateRut: A } = Ve(),
        { logInfo: Y } = Ee(),
        { isValidName: x, isValidAddress: B } = he(),
        H = E({
          firstname: l.value.firstname || "",
          lastname: l.value.lastname || "",
          rut: l.value.rut || "",
          phone: l.value.phone || "",
          address: l.value.address || "",
          address_number: l.value.address_number || "",
          postal_code: l.value.postal_code || "",
          is_company: l.value.is_company !== void 0 ? l.value.is_company : null,
          region: m(l.value.region?.id) || m(l.value.commune?.region?.id),
          commune: l.value.commune?.id || null,
          birthdate: l.value.birthdate || "",
          business_name: l.value.business_name || "",
          business_type: l.value.business_type || "",
          business_rut: l.value.business_rut || "",
          business_address: l.value.business_address || "",
          business_address_number: l.value.business_address_number || "",
          business_postal_code: l.value.business_postal_code || "",
          business_region:
            m(l.value.business_region?.id) ||
            m(l.value.business_commune?.region?.id),
          business_commune: l.value.business_commune?.id || null,
        }),
        K = h(() =>
          Object.keys(a.value).some((s) => a.value[s] !== H.value[s]),
        ),
        a = E({
          firstname: l.value.firstname || "",
          lastname: l.value.lastname || "",
          rut: l.value.rut || "",
          phone: l.value.phone || "",
          address: l.value.address || "",
          address_number: l.value.address_number || "",
          postal_code: l.value.postal_code || "",
          is_company: l.value.is_company !== void 0 ? l.value.is_company : null,
          region: m(l.value.region?.id) || m(l.value.commune?.region?.id),
          commune: l.value.commune?.id || null,
          birthdate: l.value.birthdate || "",
          business_name: l.value.business_name || "",
          business_type: l.value.business_type || "",
          business_rut: l.value.business_rut || "",
          business_address: l.value.business_address || "",
          business_address_number: l.value.business_address_number || "",
          business_postal_code: l.value.business_postal_code || "",
          business_region:
            m(l.value.business_region?.id) ||
            m(l.value.business_commune?.region?.id),
          business_commune: l.value.business_commune?.id || null,
        });
      (R(
        () => a.value.rut,
        (s) => {
          a.value.rut = k(s);
        },
      ),
        R(
          () => a.value.business_rut,
          (s) => {
            a.value.business_rut = k(s);
          },
        ));
      const J = me({
        firstname: d()
          .required("El Nombre es requerido")
          .max(50, "El Nombre no puede tener más de 50 caracteres")
          .test("is-valid-name", "Nombre no válido", (s) => x(s || "")),
        lastname: d()
          .required("El Apellido es requerido")
          .max(50, "El Apellido no puede tener más de 50 caracteres")
          .test("is-valid-name", "Apellido no válido", (s) => x(s || "")),
        rut: d()
          .required("Rut es requerido")
          .test("is-valid-rut", "RUT no es válido", (s) => A(s || ""))
          .test(
            "different-from-business-rut",
            "El RUT personal no puede ser igual al RUT de la empresa",
            function (s) {
              const { business_rut: e, is_company: v } = this.parent;
              if (v && e && s) {
                const V = s.replace(/[.-]/g, ""),
                  U = e.replace(/[.-]/g, "");
                return V !== U;
              }
              return !0;
            },
          ),
        phone: d()
          .required("Teléfono es requerido")
          .min(11, "El teléfono debe tener al menos 11 caracteres")
          .max(20, "El teléfono no puede exceder los 20 caracteres")
          .matches(
            /^[\d\s()+-]+$/,
            "El teléfono solo puede contener números, +, espacios, paréntesis y guiones",
          ),
        address: d()
          .required("Dirección es requerida")
          .test("is-valid-address", "Dirección no válida", (s) => B(s || "")),
        address_number: d()
          .required("Número de Dirección es requerido")
          .max(5, "El Número de Dirección no puede tener más de 5 caracteres"),
        postal_code: d()
          .nullable()
          .matches(/^\d*$/, "El Código Postal debe ser numérico")
          .max(10, "El Código Postal no debe tener más de 10 caracteres"),
        is_company: pe().required("Tipo es requerido"),
        region: d().required("Región es requerida"),
        commune: d().required("Comuna es requerida"),
        birthdate: be()
          .typeError("Fecha de Nacimiento debe ser una fecha válida")
          .required("Fecha de Nacimiento es requerida")
          .max(
            new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
            "Debes ser mayor de 18 años",
          ),
        business_name: d().when("is_company", {
          is: !0,
          then: (s) =>
            s
              .required("Razón Social es requerida")
              .max(50, "Razón Social no puede tener más de 50 caracteres")
              .test("is-valid-name", "Razón Social no válida", (e) =>
                x(e || ""),
              ),
          otherwise: (s) => s.nullable().optional(),
        }),
        business_type: d().when("is_company", {
          is: !0,
          then: (s) =>
            s
              .required("Giro es requerido")
              .test("is-valid-name", "Giro no válido", (e) => x(e || "")),
          otherwise: (s) => s.nullable().optional(),
        }),
        business_rut: d().when("is_company", {
          is: !0,
          then: (s) =>
            s
              .required("Rut Empresa es requerido")
              .test("is-valid-rut", "RUT no es válido", (e) => A(e || ""))
              .test(
                "different-from-personal-rut",
                "El RUT de la empresa no puede ser igual al RUT personal",
                function (e) {
                  const { rut: v } = this.parent;
                  if (v && e) {
                    const V = v.replace(/[.-]/g, ""),
                      U = e.replace(/[.-]/g, "");
                    return V !== U;
                  }
                  return !0;
                },
              ),
          otherwise: (s) => s.nullable().optional(),
        }),
        business_address: d().when("is_company", {
          is: !0,
          then: (s) =>
            s
              .required("Dirección Empresa es requerida")
              .test("is-valid-address", "Dirección Empresa no válida", (e) =>
                B(e || ""),
              ),
          otherwise: (s) => s.nullable().optional(),
        }),
        business_address_number: d().when("is_company", {
          is: !0,
          then: (s) =>
            s
              .required("Número de Dirección Empresa es requerido")
              .max(
                5,
                "El Número de Dirección Empresa no puede tener más de 5 caracteres",
              ),
          otherwise: (s) => s.nullable().optional(),
        }),
        business_postal_code: d().when("is_company", {
          is: !0,
          then: (s) =>
            s
              .nullable()
              .matches(/^\d*$/, "El Código Postal Empresa debe ser numérico")
              .max(
                10,
                "El Código Postal Empresa no debe tener más de 10 caracteres",
              ),
          otherwise: (s) => s.nullable().optional(),
        }),
        business_region: d().when("is_company", {
          is: !0,
          then: (s) => s.required("Región Empresa es requerida"),
          otherwise: (s) => s.nullable().optional(),
        }),
        business_commune: d().when("is_company", {
          is: !0,
          then: (s) => s.required("Comuna Empresa es requerida"),
          otherwise: (s) => s.nullable().optional(),
        }),
      });
      ((f.value = a.value.region),
        (g.value = a.value.business_region),
        R(
          f,
          (s) => {
            a.value.region = m(s);
          },
          { immediate: !0 },
        ),
        R(
          g,
          (s) => {
            a.value.business_region = m(s);
          },
          { immediate: !0 },
        ),
        ce(() => {
          if (!m(f.value) && a.value.commune) {
            const s = w.value.find((e) => e.id === m(a.value.commune));
            s?.region?.id && (f.value = s.region.id);
          }
          if (!m(g.value) && a.value.business_commune) {
            const s = w.value.find((e) => e.id === m(a.value.business_commune));
            s?.region?.id && (g.value = s.region.id);
          }
        }));
      const Q = async (s) => {
          y.value = !0;
          try {
            const e = {
              ...s,
              phone: String(s.phone),
              address_number: s.address_number
                ? Number.parseInt(s.address_number, 10)
                : null,
              business_address_number: s.business_address_number
                ? Number.parseInt(s.business_address_number, 10)
                : null,
            };
            (await L.updateUserProfile(l.value.id, e),
              await G(),
              ge().reset(),
              Y("User profile updated successfully."),
              await C.fire({
                text: "Usuario actualizado correctamente",
                icon: "success",
                confirmButtonText: "Aceptar",
              }),
              P("success"),
              z.onboardingMode || (window.location.href = "/cuenta/perfil"));
          } catch (e) {
            const v =
              e.response?.data?.error?.message ||
              e.response?.data?.message ||
              e.message ||
              "Hubo un error. Por favor, inténtalo de nuevo.";
            C.fire({
              title: "Error",
              text: v,
              icon: "error",
              confirmButtonText: "Aceptar",
            });
          } finally {
            y.value = !1;
          }
        },
        W = () => {
          a.value.firstname.length > 50 &&
            (a.value.firstname = a.value.firstname.slice(0, 50));
        },
        X = () => {
          a.value.lastname.length > 50 &&
            (a.value.lastname = a.value.lastname.slice(0, 50));
        },
        Z = () => {
          a.value.business_name.length > 50 &&
            (a.value.business_name = a.value.business_name.slice(0, 50));
        },
        ee = () => {
          a.value.business_type.length > 80 &&
            (a.value.business_type = a.value.business_type.slice(0, 80));
        },
        se = (s) => {
          const e = String(s.target.value || "").slice(0, 5);
          ((s.target.value = e),
            (a.value.address_number = e ? Number.parseInt(e, 10) : ""));
        },
        ae = (s) => {
          const e = String(s.target.value || "").slice(0, 5);
          ((s.target.value = e),
            (a.value.business_address_number = e
              ? Number.parseInt(e, 10)
              : ""));
        };
      return (s, e) => {
        const v = le,
          V = _e;
        return (
          b(),
          ve(
            u(fe),
            {
              "validation-schema": u(J),
              "initial-values": a.value,
              "validate-on-mount": "",
              onSubmit: Q,
            },
            {
              default: _(({ errors: U, meta: ne }) => [
                r(
                  V,
                  null,
                  {
                    default: _(() => [
                      o("div", we, [
                        o("div", xe, [
                          o("div", Ue, [
                            e[19] ||
                              (e[19] = o(
                                "label",
                                { class: "form-label", for: "is_company" },
                                "Tipo",
                                -1,
                              )),
                            r(
                              u(t),
                              {
                                modelValue: a.value.is_company,
                                "onUpdate:modelValue":
                                  e[0] ||
                                  (e[0] = (n) => (a.value.is_company = n)),
                                as: "select",
                                name: "is_company",
                                class: "form-control",
                              },
                              {
                                default: _(() => [
                                  ...(e[18] ||
                                    (e[18] = [
                                      o(
                                        "option",
                                        { value: null, disabled: "" },
                                        "Seleccione un tipo",
                                        -1,
                                      ),
                                      o(
                                        "option",
                                        { value: !1 },
                                        "Persona Natural",
                                        -1,
                                      ),
                                      o("option", { value: !0 }, "Empresa", -1),
                                    ])),
                                ]),
                                _: 1,
                              },
                              8,
                              ["modelValue"],
                            ),
                            r(u(i), { name: "is_company" }),
                          ]),
                        ]),
                        e[41] ||
                          (e[41] = o(
                            "div",
                            { class: "form__subtitle" },
                            "Datos Personales",
                            -1,
                          )),
                        o("div", Re, [
                          o("div", Ne, [
                            e[20] ||
                              (e[20] = o(
                                "label",
                                { class: "form-label", for: "birthdate" },
                                "Fecha de Nacimiento *",
                                -1,
                              )),
                            r(
                              u(t),
                              {
                                modelValue: a.value.birthdate,
                                "onUpdate:modelValue":
                                  e[1] ||
                                  (e[1] = (n) => (a.value.birthdate = n)),
                                name: "birthdate",
                                type: "date",
                                class: "form-control",
                              },
                              null,
                              8,
                              ["modelValue"],
                            ),
                            r(u(i), { name: "birthdate" }),
                          ]),
                          o("div", Ie, [
                            e[21] ||
                              (e[21] = o(
                                "label",
                                { class: "form-label", for: "firstname" },
                                "Nombres *",
                                -1,
                              )),
                            r(
                              u(t),
                              {
                                modelValue: a.value.firstname,
                                "onUpdate:modelValue":
                                  e[2] ||
                                  (e[2] = (n) => (a.value.firstname = n)),
                                name: "firstname",
                                type: "text",
                                class: "form-control",
                                maxlength: "50",
                                onInput: W,
                              },
                              null,
                              8,
                              ["modelValue"],
                            ),
                            r(u(i), { name: "firstname" }),
                          ]),
                          o("div", Se, [
                            e[22] ||
                              (e[22] = o(
                                "label",
                                { class: "form-label", for: "lastname" },
                                "Apellidos *",
                                -1,
                              )),
                            r(
                              u(t),
                              {
                                modelValue: a.value.lastname,
                                "onUpdate:modelValue":
                                  e[3] ||
                                  (e[3] = (n) => (a.value.lastname = n)),
                                name: "lastname",
                                type: "text",
                                class: "form-control",
                                maxlength: "50",
                                onInput: X,
                              },
                              null,
                              8,
                              ["modelValue"],
                            ),
                            r(u(i), { name: "lastname" }),
                          ]),
                          o("div", De, [
                            e[23] ||
                              (e[23] = o(
                                "label",
                                { class: "form-label", for: "rut" },
                                "Rut *",
                                -1,
                              )),
                            r(
                              u(t),
                              {
                                modelValue: a.value.rut,
                                "onUpdate:modelValue":
                                  e[4] || (e[4] = (n) => (a.value.rut = n)),
                                name: "rut",
                                type: "text",
                                class: "form-control",
                                autocomplete: "id",
                              },
                              null,
                              8,
                              ["modelValue"],
                            ),
                            r(u(i), { name: "rut" }),
                          ]),
                          o("div", Ce, [
                            e[24] ||
                              (e[24] = o(
                                "label",
                                { class: "form-label", for: "phone" },
                                "Teléfono *",
                                -1,
                              )),
                            r(
                              u(t),
                              { name: "phone" },
                              {
                                default: _(({ field: n, handleChange: oe }) => [
                                  r(
                                    v,
                                    {
                                      value: n.value,
                                      "onUpdate:modelValue": (F) => {
                                        (oe(F), (a.value.phone = F));
                                      },
                                    },
                                    null,
                                    8,
                                    ["value", "onUpdate:modelValue"],
                                  ),
                                ]),
                                _: 1,
                              },
                            ),
                            r(u(i), { name: "phone" }),
                          ]),
                          o("div", Te, [
                            e[25] ||
                              (e[25] = o(
                                "label",
                                { class: "form-label", for: "address" },
                                "Dirección *",
                                -1,
                              )),
                            r(
                              u(t),
                              {
                                modelValue: a.value.address,
                                "onUpdate:modelValue":
                                  e[5] || (e[5] = (n) => (a.value.address = n)),
                                name: "address",
                                type: "text",
                                class: "form-control",
                              },
                              null,
                              8,
                              ["modelValue"],
                            ),
                            r(u(i), { name: "address" }),
                          ]),
                          o("div", ke, [
                            e[26] ||
                              (e[26] = o(
                                "label",
                                { class: "form-label", for: "address_number" },
                                "Número de Dirección *",
                                -1,
                              )),
                            r(
                              u(t),
                              {
                                modelValue: a.value.address_number,
                                "onUpdate:modelValue":
                                  e[6] ||
                                  (e[6] = (n) => (a.value.address_number = n)),
                                name: "address_number",
                                type: "number",
                                class: "form-control",
                                onInput: se,
                              },
                              null,
                              8,
                              ["modelValue"],
                            ),
                            r(u(i), { name: "address_number" }),
                          ]),
                          o("div", Ae, [
                            e[27] ||
                              (e[27] = o(
                                "label",
                                { class: "form-label", for: "postal_code" },
                                "Código Postal",
                                -1,
                              )),
                            r(
                              u(t),
                              {
                                modelValue: a.value.postal_code,
                                "onUpdate:modelValue":
                                  e[7] ||
                                  (e[7] = (n) => (a.value.postal_code = n)),
                                name: "postal_code",
                                type: "number",
                                class: "form-control",
                              },
                              null,
                              8,
                              ["modelValue"],
                            ),
                            r(u(i), { name: "postal_code" }),
                          ]),
                          o("div", Be, [
                            e[29] ||
                              (e[29] = o(
                                "label",
                                { class: "form-label", for: "region" },
                                "Región *",
                                -1,
                              )),
                            r(
                              u(t),
                              {
                                modelValue: f.value,
                                "onUpdate:modelValue":
                                  e[8] || (e[8] = (n) => (f.value = n)),
                                as: "select",
                                name: "region",
                                class: "form-control",
                              },
                              {
                                default: _(() => [
                                  e[28] ||
                                    (e[28] = o(
                                      "option",
                                      { value: "" },
                                      "Seleccione una región",
                                      -1,
                                    )),
                                  (b(!0),
                                  p(
                                    N,
                                    null,
                                    I(
                                      T.value,
                                      (n) => (
                                        b(),
                                        p(
                                          "option",
                                          { key: n.id, value: n.id },
                                          S(n.name),
                                          9,
                                          Fe,
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
                            r(u(i), { name: "region" }),
                          ]),
                          o("div", Pe, [
                            e[31] ||
                              (e[31] = o(
                                "label",
                                { class: "form-label", for: "commune" },
                                "Comuna *",
                                -1,
                              )),
                            r(
                              u(t),
                              {
                                modelValue: a.value.commune,
                                "onUpdate:modelValue":
                                  e[9] || (e[9] = (n) => (a.value.commune = n)),
                                as: "select",
                                name: "commune",
                                class: "form-control",
                              },
                              {
                                default: _(() => [
                                  e[30] ||
                                    (e[30] = o(
                                      "option",
                                      { value: "" },
                                      "Seleccione una comuna",
                                      -1,
                                    )),
                                  (b(!0),
                                  p(
                                    N,
                                    null,
                                    I(
                                      j.value,
                                      (n) => (
                                        b(),
                                        p(
                                          "option",
                                          { key: n.id, value: n.id },
                                          S(n.name),
                                          9,
                                          ze,
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
                            r(u(i), { name: "commune" }),
                          ]),
                        ]),
                        a.value.is_company
                          ? (b(), p("div", $e, " Datos de la Empresa "))
                          : D("", !0),
                        a.value.is_company
                          ? (b(),
                            p("div", Me, [
                              o("div", Le, [
                                e[32] ||
                                  (e[32] = o(
                                    "label",
                                    {
                                      class: "form-label",
                                      for: "business_name",
                                    },
                                    "Razón Social *",
                                    -1,
                                  )),
                                r(
                                  u(t),
                                  {
                                    modelValue: a.value.business_name,
                                    "onUpdate:modelValue":
                                      e[10] ||
                                      (e[10] = (n) =>
                                        (a.value.business_name = n)),
                                    name: "business_name",
                                    type: "text",
                                    class: "form-control",
                                    maxlength: "50",
                                    onInput: Z,
                                  },
                                  null,
                                  8,
                                  ["modelValue"],
                                ),
                                r(u(i), { name: "business_name" }),
                              ]),
                              o("div", je, [
                                e[33] ||
                                  (e[33] = o(
                                    "label",
                                    {
                                      class: "form-label",
                                      for: "business_type",
                                    },
                                    "Giro *",
                                    -1,
                                  )),
                                r(
                                  u(t),
                                  {
                                    modelValue: a.value.business_type,
                                    "onUpdate:modelValue":
                                      e[11] ||
                                      (e[11] = (n) =>
                                        (a.value.business_type = n)),
                                    name: "business_type",
                                    type: "text",
                                    class: "form-control",
                                    maxlength: "80",
                                    onInput: ee,
                                  },
                                  null,
                                  8,
                                  ["modelValue"],
                                ),
                                r(u(i), { name: "business_type" }),
                              ]),
                              o("div", Ge, [
                                e[34] ||
                                  (e[34] = o(
                                    "label",
                                    {
                                      class: "form-label",
                                      for: "business_rut",
                                    },
                                    "Rut Empresa *",
                                    -1,
                                  )),
                                r(
                                  u(t),
                                  {
                                    modelValue: a.value.business_rut,
                                    "onUpdate:modelValue":
                                      e[12] ||
                                      (e[12] = (n) =>
                                        (a.value.business_rut = n)),
                                    name: "business_rut",
                                    type: "text",
                                    class: "form-control",
                                  },
                                  null,
                                  8,
                                  ["modelValue"],
                                ),
                                r(u(i), { name: "business_rut" }),
                              ]),
                              o("div", Oe, [
                                e[35] ||
                                  (e[35] = o(
                                    "label",
                                    {
                                      class: "form-label",
                                      for: "business_address",
                                    },
                                    "Dirección Empresa *",
                                    -1,
                                  )),
                                r(
                                  u(t),
                                  {
                                    modelValue: a.value.business_address,
                                    "onUpdate:modelValue":
                                      e[13] ||
                                      (e[13] = (n) =>
                                        (a.value.business_address = n)),
                                    name: "business_address",
                                    type: "text",
                                    class: "form-control",
                                  },
                                  null,
                                  8,
                                  ["modelValue"],
                                ),
                                r(u(i), { name: "business_address" }),
                              ]),
                              o("div", Ye, [
                                e[36] ||
                                  (e[36] = o(
                                    "label",
                                    {
                                      class: "form-label",
                                      for: "business_address_number",
                                    },
                                    "Número de Dirección Empresa *",
                                    -1,
                                  )),
                                r(
                                  u(t),
                                  {
                                    modelValue: a.value.business_address_number,
                                    "onUpdate:modelValue":
                                      e[14] ||
                                      (e[14] = (n) =>
                                        (a.value.business_address_number = n)),
                                    name: "business_address_number",
                                    type: "number",
                                    class: "form-control",
                                    onInput: ae,
                                  },
                                  null,
                                  8,
                                  ["modelValue"],
                                ),
                                r(u(i), { name: "business_address_number" }),
                              ]),
                              o("div", He, [
                                e[37] ||
                                  (e[37] = o(
                                    "label",
                                    {
                                      class: "form-label",
                                      for: "business_postal_code",
                                    },
                                    "Código Postal Empresa",
                                    -1,
                                  )),
                                r(
                                  u(t),
                                  {
                                    modelValue: a.value.business_postal_code,
                                    "onUpdate:modelValue":
                                      e[15] ||
                                      (e[15] = (n) =>
                                        (a.value.business_postal_code = n)),
                                    name: "business_postal_code",
                                    type: "number",
                                    class: "form-control",
                                  },
                                  null,
                                  8,
                                  ["modelValue"],
                                ),
                                r(u(i), { name: "business_postal_code" }),
                              ]),
                              o("div", Ke, [
                                e[39] ||
                                  (e[39] = o(
                                    "label",
                                    {
                                      class: "form-label",
                                      for: "business_region",
                                    },
                                    "Región Empresa *",
                                    -1,
                                  )),
                                r(
                                  u(t),
                                  {
                                    modelValue: g.value,
                                    "onUpdate:modelValue":
                                      e[16] || (e[16] = (n) => (g.value = n)),
                                    as: "select",
                                    name: "business_region",
                                    class: "form-control",
                                  },
                                  {
                                    default: _(() => [
                                      e[38] ||
                                        (e[38] = o(
                                          "option",
                                          { value: "" },
                                          "Seleccione una región",
                                          -1,
                                        )),
                                      (b(!0),
                                      p(
                                        N,
                                        null,
                                        I(
                                          T.value,
                                          (n) => (
                                            b(),
                                            p(
                                              "option",
                                              { key: n.id, value: n.id },
                                              S(n.name),
                                              9,
                                              Je,
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
                                r(u(i), { name: "business_region" }),
                              ]),
                              o("div", Qe, [
                                e[40] ||
                                  (e[40] = o(
                                    "label",
                                    {
                                      class: "form-label",
                                      for: "business_commune",
                                    },
                                    "Comuna Empresa *",
                                    -1,
                                  )),
                                r(
                                  u(t),
                                  {
                                    modelValue: a.value.business_commune,
                                    "onUpdate:modelValue":
                                      e[17] ||
                                      (e[17] = (n) =>
                                        (a.value.business_commune = n)),
                                    as: "select",
                                    name: "business_commune",
                                    class: "form-control",
                                  },
                                  {
                                    default: _(() => [
                                      (b(!0),
                                      p(
                                        N,
                                        null,
                                        I(
                                          O.value,
                                          (n) => (
                                            b(),
                                            p(
                                              "option",
                                              { key: n.id, value: n.id },
                                              S(n.name),
                                              9,
                                              We,
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
                                r(u(i), { name: "business_commune" }),
                              ]),
                            ]))
                          : D("", !0),
                        o(
                          "button",
                          {
                            disabled:
                              !ne.valid ||
                              y.value ||
                              (!c.onboardingMode && !K.value),
                            title: "Actualizar",
                            type: "submit",
                            class: "btn btn--block btn--buy",
                          },
                          [
                            y.value
                              ? D("", !0)
                              : (b(), p("span", Ze, "Actualizar")),
                            y.value
                              ? (b(), p("span", es, "Actualizando..."))
                              : D("", !0),
                          ],
                          8,
                          Xe,
                        ),
                      ]),
                    ]),
                    _: 2,
                  },
                  1024,
                ),
              ]),
              _: 1,
            },
            8,
            ["validation-schema", "initial-values"],
          )
        );
      };
    },
  },
  ts = Object.assign(ss, { __name: "FormProfile" });
export { ts as _ };
//# sourceMappingURL=e4c2LLW0.js.map

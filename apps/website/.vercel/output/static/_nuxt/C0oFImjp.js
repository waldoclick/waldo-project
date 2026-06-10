import {
  aZ as N,
  b3 as L,
  cT as j,
  bb as B,
  b8 as w,
  be as A,
  a_ as u,
  b5 as I,
  b1 as g,
  a$ as m,
  bf as a,
  b0 as o,
  b6 as t,
  bg as c,
  bh as d,
  bi as T,
  b7 as v,
  bs as f,
  br as z,
  bj as W,
  bc as M,
  bd as k,
  bp as $,
  by as Z,
  bk as G,
  bu as H,
  b4 as Y,
  bw as J,
  aY as K,
  ba as Q,
  dj as X,
} from "./BK8sApmn.js";
import { I as ee, m as ae } from "./Cg1cJ9QQ.js";
import { u as se } from "./BWjFl-iO.js";
import { R as oe } from "./CeZ3CHNS.js";
import { u as te } from "./CJzzMwWR.js";
import "./DeJqzbk_.js";
try {
  let _ =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    n = new _.Error().stack;
  n &&
    ((_._sentryDebugIds = _._sentryDebugIds || {}),
    (_._sentryDebugIds[n] = "d1fac765-bc4d-4765-a7e7-e342ac9b12f8"),
    (_._sentryDebugIdIdentifier =
      "sentry-dbid-d1fac765-bc4d-4765-a7e7-e342ac9b12f8"));
} catch {}
const re = { key: 0, class: "step step--1" },
  le = { class: "form-group" },
  ne = { class: "form-group" },
  ie = { class: "form-label", for: "firstname" },
  ue = { class: "form-group" },
  ce = { class: "form-label", for: "lastname" },
  de = { class: "form-group" },
  me = { key: 1, class: "step step--2" },
  pe = { class: "form-group" },
  fe = { class: "form-group form-group--password" },
  _e = { key: 0 },
  ve = { key: 1 },
  be = { class: "form-group" },
  ge = { class: "form-group" },
  ye = { class: "form-check" },
  we = { class: "form-group" },
  ke = { class: "form-check" },
  he = { class: "form-check-label", for: "accepted_terms" },
  xe = { class: "form-group" },
  Ve = { class: "form-check" },
  Re = { class: "form-check-label", for: "accepted_usage_terms" },
  Ee = { class: "form__send" },
  $e = ["disabled"],
  qe = { key: 0 },
  Ce = { key: 1 },
  Ue = { key: 2 },
  Se = N({
    __name: "FormRegister",
    setup(_) {
      const { Swal: n } = G(),
        { signUp: h } = te(),
        q = L(),
        C = j("registrationEmail", () => ""),
        b = B(),
        x = w(null),
        s = w({
          is_company: !1,
          firstname: "",
          lastname: "",
          email: "",
          rut: "",
          password: "",
          username: "",
          accepted_age_confirmation: !1,
          accepted_terms: !1,
          accepted_usage_terms: !1,
        }),
        i = w(1),
        p = w(!1),
        r = w("password"),
        { formatRut: V, validateRut: O } = se(),
        U = () =>
          i.value === 1
            ? M({
                is_company: $().required("Tipo es requerido"),
                firstname: k()
                  .max(50, "Máximo 50 caracteres")
                  .required(() =>
                    s.value.is_company
                      ? "La Razón Social es requerida"
                      : "El Nombre es requerido",
                  )
                  .matches(
                    /^[\d\s.A-Za-zÁÉÍÑÓÚáéíñóú]+$/,
                    "Solo se permiten letras, números, espacios, puntos",
                  ),
                lastname: k()
                  .max(50, "Máximo 50 caracteres")
                  .required(() =>
                    s.value.is_company
                      ? "El Giro es requerida"
                      : "El Apellido es requerido",
                  )
                  .matches(
                    /^[\d\s.A-Za-zÁÉÍÑÓÚáéíñóú]+$/,
                    "Solo se permiten letras, números, espacios, puntos",
                  ),
                rut: k()
                  .max(12, "Máximo 12 caracteres")
                  .required("El RUT es requerido")
                  .test("is-valid-rut", "El RUT no es válido", (R) =>
                    O(R || ""),
                  ),
              })
            : M({
                email: k()
                  .max(254, "Máximo 254 caracteres")
                  .required("Correo electrónico es requerido")
                  .email("Correo electrónico no válido"),
                password: k()
                  .required("Contraseña es requerida")
                  .min(8, "Mínimo 8 caracteres")
                  .max(50, "Máximo 50 caracteres")
                  .matches(/[A-Z]/, "Debe incluir al menos una mayúscula")
                  .matches(/[a-z]/, "Debe incluir al menos una minúscula")
                  .matches(/\d/, "Debe incluir al menos un número"),
                confirm_password: k().oneOf(
                  [Z("password"), void 0],
                  "Las contraseñas deben coincidir",
                ),
                accepted_age_confirmation: $()
                  .oneOf([!0], "Debes confirmar que eres mayor de edad")
                  .required("Debes confirmar que eres mayor de edad"),
                accepted_terms: $()
                  .oneOf([!0], "Debes aceptar las políticas de privacidad")
                  .required("Debes aceptar las políticas de privacidad"),
                accepted_usage_terms: $()
                  .oneOf([!0], "Debes aceptar las condiciones de uso")
                  .required("Debes aceptar las condiciones de uso"),
              }),
        S = w(U());
      (A(i, () => {
        S.value = U();
      }),
        A(
          () => s.value.rut,
          (R) => {
            s.value.rut = V(R);
          },
        ));
      const P = () => {
          r.value = r.value === "password" ? "text" : "password";
        },
        F = async () => {
          if (!x.value)
            return n.fire("Error", "Formulario no encontrado.", "error");
          if (!(await x.value.validate()))
            return n.fire(
              "Error",
              "Por favor, completa los campos requeridos.",
              "error",
            );
          if (i.value === 1) i.value = 2;
          else {
            p.value = !0;
            try {
              const e = s.value.email.split("@");
              if (
                ((s.value.username = e[0] ?? ""),
                oe.includes(s.value.username.toLowerCase()))
              )
                return (
                  (p.value = !1),
                  n.fire(
                    "Error",
                    "Este nombre de usuario no está disponible",
                    "error",
                  )
                );
              const { confirm_password: y, ...E } = s.value;
              (await q("/auth/local/register", { method: "POST", body: E })).jwt
                ? (h(),
                  n.fire(
                    "Cuenta creada",
                    "Tu cuenta ha sido creada exitosamente.",
                    "success",
                  ),
                  b.push("/login"))
                : ((C.value = s.value.email),
                  h(),
                  await n.fire({
                    title: "¡Revisa tu correo!",
                    text: `Te enviamos un enlace de confirmación a ${s.value.email}. Haz clic en el enlace para activar tu cuenta.`,
                    icon: "success",
                    confirmButtonText: "Entendido",
                  }),
                  b.push("/registro/confirmar"));
            } catch (e) {
              const y = e,
                E = y.error?.details?.error?.message || y.error?.message || "";
              E === "Email or Username are already taken"
                ? n.fire(
                    "Error",
                    "El correo electrónico ya está en uso.",
                    "error",
                  )
                : n.fire(
                    "Error",
                    E || "Ocurrió un error durante el registro.",
                    "error",
                  );
            } finally {
              p.value = !1;
            }
          }
        };
      return (R, e) => {
        const y = z;
        return (
          u(),
          I(
            t(W),
            {
              ref_key: "formRef",
              ref: x,
              "validation-schema": S.value,
              onSubmit: F,
            },
            {
              default: g(({ errors: E, meta: D }) => [
                i.value === 1
                  ? (u(),
                    m("div", re, [
                      a("div", le, [
                        e[12] ||
                          (e[12] = a(
                            "label",
                            { class: "form-label", for: "is_company" },
                            "Tipo",
                            -1,
                          )),
                        o(
                          t(c),
                          {
                            modelValue: s.value.is_company,
                            "onUpdate:modelValue":
                              e[0] || (e[0] = (l) => (s.value.is_company = l)),
                            as: "select",
                            name: "is_company",
                            class: "form-control",
                          },
                          {
                            default: g(() => [
                              ...(e[11] ||
                                (e[11] = [
                                  a(
                                    "option",
                                    { value: !1 },
                                    "Persona Natural",
                                    -1,
                                  ),
                                  a("option", { value: !0 }, "Empresa", -1),
                                ])),
                            ]),
                            _: 1,
                          },
                          8,
                          ["modelValue"],
                        ),
                        o(t(d), { name: "is_company" }),
                      ]),
                      a("div", ne, [
                        a(
                          "label",
                          ie,
                          T(s.value.is_company ? "Razón Social" : "Nombres"),
                          1,
                        ),
                        o(
                          t(c),
                          {
                            modelValue: s.value.firstname,
                            "onUpdate:modelValue":
                              e[1] || (e[1] = (l) => (s.value.firstname = l)),
                            name: "firstname",
                            type: "text",
                            class: "form-control",
                            autocomplete: "given-name",
                            maxlength: "50",
                          },
                          null,
                          8,
                          ["modelValue"],
                        ),
                        o(t(d), { name: "firstname" }),
                      ]),
                      a("div", ue, [
                        a(
                          "label",
                          ce,
                          T(s.value.is_company ? "Giro" : "Apellidos"),
                          1,
                        ),
                        o(
                          t(c),
                          {
                            modelValue: s.value.lastname,
                            "onUpdate:modelValue":
                              e[2] || (e[2] = (l) => (s.value.lastname = l)),
                            name: "lastname",
                            type: "text",
                            class: "form-control",
                            autocomplete: "additional-name",
                            maxlength: "50",
                          },
                          null,
                          8,
                          ["modelValue"],
                        ),
                        o(t(d), { name: "lastname" }),
                      ]),
                      a("div", de, [
                        e[13] ||
                          (e[13] = a(
                            "label",
                            { class: "form-label", for: "rut" },
                            "Rut",
                            -1,
                          )),
                        o(
                          t(c),
                          {
                            modelValue: s.value.rut,
                            "onUpdate:modelValue":
                              e[3] || (e[3] = (l) => (s.value.rut = l)),
                            name: "rut",
                            type: "text",
                            class: "form-control",
                            autocomplete: "id",
                            maxlength: "12",
                          },
                          null,
                          8,
                          ["modelValue"],
                        ),
                        o(t(d), { name: "rut" }),
                      ]),
                    ]))
                  : v("", !0),
                i.value === 2
                  ? (u(),
                    m("div", me, [
                      a("div", pe, [
                        e[14] ||
                          (e[14] = a(
                            "label",
                            { class: "form-label", for: "email" },
                            "Correo electrónico",
                            -1,
                          )),
                        o(
                          t(c),
                          {
                            modelValue: s.value.email,
                            "onUpdate:modelValue":
                              e[4] || (e[4] = (l) => (s.value.email = l)),
                            name: "email",
                            type: "text",
                            class: "form-control",
                            autocomplete: "email",
                            maxlength: "254",
                          },
                          null,
                          8,
                          ["modelValue"],
                        ),
                        o(t(d), { name: "email" }),
                      ]),
                      a("div", fe, [
                        e[15] ||
                          (e[15] = a(
                            "label",
                            { class: "form-label", for: "password" },
                            "Contraseña",
                            -1,
                          )),
                        o(
                          t(c),
                          {
                            modelValue: s.value.password,
                            "onUpdate:modelValue":
                              e[5] || (e[5] = (l) => (s.value.password = l)),
                            name: "password",
                            type: r.value,
                            class: "form-control",
                            autocomplete: "current-password",
                            maxlength: "50",
                          },
                          null,
                          8,
                          ["modelValue", "type"],
                        ),
                        a(
                          "button",
                          {
                            class: "form-group--password__show-password",
                            type: "button",
                            title: "Mostrar/ocultar contraseña",
                            onClick: P,
                          },
                          [
                            r.value !== "password"
                              ? (u(), m("strong", _e, "Ocultar"))
                              : (u(), m("strong", ve, "Mostrar")),
                          ],
                        ),
                        o(t(d), { name: "password" }),
                      ]),
                      a("div", be, [
                        e[16] ||
                          (e[16] = a(
                            "label",
                            { class: "form-label", for: "confirm_password" },
                            "Repetir contraseña",
                            -1,
                          )),
                        o(
                          t(c),
                          {
                            modelValue: s.value.confirm_password,
                            "onUpdate:modelValue":
                              e[6] ||
                              (e[6] = (l) => (s.value.confirm_password = l)),
                            name: "confirm_password",
                            type: r.value,
                            class: "form-control",
                            autocomplete: "new-password",
                            maxlength: "50",
                          },
                          null,
                          8,
                          ["modelValue", "type"],
                        ),
                        o(t(d), { name: "confirm_password" }),
                      ]),
                      a("div", ge, [
                        a("div", ye, [
                          o(
                            t(c),
                            {
                              id: "accepted_age_confirmation",
                              modelValue: s.value.accepted_age_confirmation,
                              "onUpdate:modelValue":
                                e[7] ||
                                (e[7] = (l) =>
                                  (s.value.accepted_age_confirmation = l)),
                              name: "accepted_age_confirmation",
                              type: "checkbox",
                              class: "form-check-input",
                              value: !0,
                              "unchecked-value": !1,
                            },
                            null,
                            8,
                            ["modelValue"],
                          ),
                          e[17] ||
                            (e[17] = a(
                              "label",
                              {
                                class: "form-check-label",
                                for: "accepted_age_confirmation",
                              },
                              " Confirmo que soy mayor de edad ",
                              -1,
                            )),
                        ]),
                        o(t(d), { name: "accepted_age_confirmation" }),
                      ]),
                      a("div", we, [
                        a("div", ke, [
                          o(
                            t(c),
                            {
                              id: "accepted_terms",
                              modelValue: s.value.accepted_terms,
                              "onUpdate:modelValue":
                                e[8] ||
                                (e[8] = (l) => (s.value.accepted_terms = l)),
                              name: "accepted_terms",
                              type: "checkbox",
                              class: "form-check-input",
                              value: !0,
                              "unchecked-value": !1,
                            },
                            null,
                            8,
                            ["modelValue"],
                          ),
                          a("label", he, [
                            e[19] || (e[19] = f(" Acepto las ", -1)),
                            o(
                              y,
                              {
                                to: "/politicas-de-privacidad",
                                target: "_blank",
                              },
                              {
                                default: g(() => [
                                  ...(e[18] ||
                                    (e[18] = [
                                      f("políticas de privacidad", -1),
                                    ])),
                                ]),
                                _: 1,
                              },
                            ),
                          ]),
                        ]),
                        o(t(d), { name: "accepted_terms" }),
                      ]),
                      a("div", xe, [
                        a("div", Ve, [
                          o(
                            t(c),
                            {
                              id: "accepted_usage_terms",
                              modelValue: s.value.accepted_usage_terms,
                              "onUpdate:modelValue":
                                e[9] ||
                                (e[9] = (l) =>
                                  (s.value.accepted_usage_terms = l)),
                              name: "accepted_usage_terms",
                              type: "checkbox",
                              class: "form-check-input",
                              value: !0,
                              "unchecked-value": !1,
                            },
                            null,
                            8,
                            ["modelValue"],
                          ),
                          a("label", Re, [
                            e[21] || (e[21] = f(" Acepto las ", -1)),
                            o(
                              y,
                              { to: "/condiciones-de-uso", target: "_blank" },
                              {
                                default: g(() => [
                                  ...(e[20] ||
                                    (e[20] = [f("condiciones de uso", -1)])),
                                ]),
                                _: 1,
                              },
                            ),
                          ]),
                        ]),
                        o(t(d), { name: "accepted_usage_terms" }),
                      ]),
                    ]))
                  : v("", !0),
                a("div", Ee, [
                  i.value === 2
                    ? (u(),
                      m(
                        "button",
                        {
                          key: 0,
                          type: "button",
                          class: "btn btn--block btn--secondary",
                          onClick: e[10] || (e[10] = (l) => (i.value = 1)),
                        },
                        [
                          ...(e[22] ||
                            (e[22] = [a("span", null, "Volver", -1)])),
                        ],
                      ))
                    : v("", !0),
                  a(
                    "button",
                    {
                      disabled: !D.valid || p.value,
                      type: "submit",
                      class: "btn btn--block btn--primary",
                    },
                    [
                      i.value === 1
                        ? (u(), m("span", qe, "Siguiente"))
                        : v("", !0),
                      i.value === 2 && !p.value
                        ? (u(), m("span", Ce, "Registrate"))
                        : v("", !0),
                      i.value === 2 && p.value
                        ? (u(), m("span", Ue, "Registrando…"))
                        : v("", !0),
                    ],
                    8,
                    $e,
                  ),
                ]),
              ]),
              _: 1,
            },
            8,
            ["validation-schema"],
          )
        );
      };
    },
  }),
  De = Object.assign(Se, { __name: "FormRegister" }),
  Ae = { class: "page" },
  Te = { class: "auth" },
  Me = { class: "auth__introduce" },
  Ne = { class: "auth__form" },
  Ie = { class: "auth__form__inner" },
  ze = ["src"],
  Oe = { class: "auth__form__fields" },
  Pe = { key: 0, class: "auth__form__separator" },
  Fe = { class: "auth__form__social" },
  Le = { class: "auth__form__help" },
  je = "Regístrate y empieza a gestionar tus anuncios en waldo.click®",
  Be = "Al crear tu cuenta en waldo.click® podrás:",
  Ke = N({
    __name: "index",
    async setup(_) {
      let n, h;
      const { $setSEO: q, $setStructuredData: C } = H(),
        b = K(),
        x = b.public.apiUrl,
        { data: s } =
          (([n, h] = Y(async () =>
            Q("providers", async () => {
              const p = await fetch(`${x}/api/connect/google/callback`);
              return { google: Number(p.status) === 200 };
            }),
          )),
          (n = await n),
          h(),
          n),
        i = [
          "Ver los datos de contacto de los anuncios.",
          "Publicar anuncios con nuestros planes disponibles.",
          "Disfrutar de hasta 3 anuncios gratis renovables.",
          "Recibir notificaciones de nuevos anuncios en tu correo.",
        ];
      return (
        q({
          title: "Regístrate",
          description:
            "Crea tu cuenta en Waldo.click® y comienza a comprar y vender activos industriales de manera rápida y sencilla.",
          imageUrl: `${b.public.baseUrl}/share.jpg`,
          url: `${b.public.baseUrl}/registro`,
        }),
        J({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        C({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Regístrate",
          description:
            "Crea tu cuenta en Waldo.click® y comienza a comprar y vender activos industriales de manera rápida y sencilla.",
          url: `${b.public.baseUrl}/registro`,
        }),
        (p, r) => {
          const V = z;
          return (
            u(),
            m("div", Ae, [
              a("div", Te, [
                a("div", Me, [o(ee, { title: je, subtitle: Be, list: i })]),
                a("div", Ne, [
                  a("div", Ie, [
                    o(
                      V,
                      {
                        to: "/",
                        class: "auth__form__back",
                        title: "Ir al inicio",
                      },
                      {
                        default: g(() => [
                          a(
                            "img",
                            {
                              loading: "lazy",
                              decoding: "async",
                              src: t(ae),
                              alt: "mobile menu close",
                              title: "mobile menu close",
                            },
                            null,
                            8,
                            ze,
                          ),
                          r[0] || (r[0] = a("span", null, "Ir al inicio", -1)),
                        ]),
                        _: 1,
                      },
                    ),
                    r[7] ||
                      (r[7] = a(
                        "h1",
                        { class: "auth__form__title title" },
                        "Crea tu cuenta",
                        -1,
                      )),
                    a("div", Oe, [o(De)]),
                    t(s)?.google ? (u(), m("div", Pe, " o ")) : v("", !0),
                    a("div", Fe, [
                      t(s)?.google ? (u(), I(X, { key: 0 })) : v("", !0),
                    ]),
                    a("div", Le, [
                      a("p", null, [
                        r[2] || (r[2] = f(" ¿Tienes una cuenta en ", -1)),
                        r[3] || (r[3] = a("strong", null, "Waldo.click®", -1)),
                        r[4] || (r[4] = f(" ? ", -1)),
                        o(
                          V,
                          { to: "/login", title: "Inicia sesión" },
                          {
                            default: g(() => [
                              ...(r[1] || (r[1] = [f(" Inicia sesión ", -1)])),
                            ]),
                            _: 1,
                          },
                        ),
                      ]),
                      a("p", null, [
                        r[6] || (r[6] = f(" ¿Olvidaste tu contraseña? ", -1)),
                        o(
                          V,
                          {
                            to: "/recuperar-contrasena",
                            title: "Recupérala aquí",
                          },
                          {
                            default: g(() => [
                              ...(r[5] ||
                                (r[5] = [f(" Recupérala aquí ", -1)])),
                            ]),
                            _: 1,
                          },
                        ),
                      ]),
                    ]),
                  ]),
                ]),
              ]),
            ])
          );
        }
      );
    },
  });
export { Ke as default };
//# sourceMappingURL=C0oFImjp.js.map

import {
  bD as V,
  aZ as y,
  bx as h,
  b3 as M,
  bc as P,
  bd as _,
  by as A,
  bb as D,
  a_ as c,
  b5 as S,
  b1 as U,
  bf as e,
  b0 as n,
  b6 as t,
  bg as f,
  a$ as u,
  bh as w,
  b7 as g,
  bj as q,
  b8 as v,
  bk as E,
  b9 as N,
  bu as O,
  bw as I,
  aY as j,
} from "./BK8sApmn.js";
import { M as z } from "./DuRm081T.js";
try {
  let o =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    r = new o.Error().stack;
  r &&
    ((o._sentryDebugIds = o._sentryDebugIds || {}),
    (o._sentryDebugIds[r] = "cbc151b3-7784-40ea-b1dc-871f14c9fc88"),
    (o._sentryDebugIdIdentifier =
      "sentry-dbid-cbc151b3-7784-40ea-b1dc-871f14c9fc88"));
} catch {}
const F = V("shield-off", [
    ["path", { d: "m2 2 20 20", key: "1ooewy" }],
    [
      "path",
      {
        d: "M5 5a1 1 0 0 0-1 1v7c0 5 3.5 7.5 7.67 8.94a1 1 0 0 0 .67.01c2.35-.82 4.48-1.97 5.9-3.71",
        key: "1jlk70",
      },
    ],
    [
      "path",
      {
        d: "M9.309 3.652A12.252 12.252 0 0 0 11.24 2.28a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1v7a9.784 9.784 0 0 1-.08 1.264",
        key: "18rp1v",
      },
    ],
  ]),
  B = { class: "form-group" },
  T = { key: 0 },
  L = { key: 1 },
  R = { class: "form-group form-group--password" },
  W = { class: "form-group form-group--password" },
  H = ["disabled"],
  Z = { key: 0 },
  G = { key: 1 },
  Y = y({
    __name: "FormPassword",
    setup(o) {
      const { Swal: r } = E();
      h();
      const p = M(),
        l = P({
          current_password: _().required("Contraseña actual es requerida"),
          password: _()
            .required("Nueva contraseña es requerida")
            .min(8, "Mínimo 8 caracteres")
            .max(50, "Máximo 50 caracteres")
            .matches(/[A-Z]/, "Debe incluir al menos una mayúscula")
            .matches(/[a-z]/, "Debe incluir al menos una minúscula")
            .matches(/\d/, "Debe incluir al menos un número"),
          password_confirmation: _()
            .oneOf([A("password")], "Las contraseñas deben coincidir")
            .required("Confirmación de nueva contraseña es requerida"),
        }),
        s = v({
          current_password: "",
          password: "",
          password_confirmation: "",
        }),
        d = v(!1),
        i = v("password");
      D();
      const k = async (m) => {
          d.value = !0;
          try {
            (await p("auth/change-password", {
              method: "POST",
              body: {
                currentPassword: m.current_password,
                password: m.password,
                passwordConfirmation: m.password_confirmation,
              },
            }),
              r.fire("", "La contraseña se ha cambiado con éxito.", "success"));
          } catch {
            C();
          } finally {
            d.value = !1;
          }
        },
        C = (m) => {
          r.fire(
            "Error",
            "Hubo un error. Por favor, inténtalo de nuevo.",
            "error",
          );
        },
        x = () => {
          i.value = i.value === "password" ? "text" : "password";
        };
      return (m, a) => (
        c(),
        S(
          t(q),
          { "validation-schema": t(l), onSubmit: k },
          {
            default: U(({ errors: oa, meta: $ }) => [
              e("div", B, [
                a[3] ||
                  (a[3] = e(
                    "label",
                    { class: "form-label", for: "current_password" },
                    "Contraseña actual",
                    -1,
                  )),
                n(
                  t(f),
                  {
                    modelValue: s.value.current_password,
                    "onUpdate:modelValue":
                      a[0] || (a[0] = (b) => (s.value.current_password = b)),
                    name: "current_password",
                    type: i.value,
                    class: "form-control",
                    autocomplete: "current-password",
                  },
                  null,
                  8,
                  ["modelValue", "type"],
                ),
                e(
                  "button",
                  {
                    class: "form-group--password__show-password",
                    type: "button",
                    title: "Mostrar/ocultar contraseña",
                    onClick: x,
                  },
                  [
                    i.value !== "password"
                      ? (c(), u("strong", T, "Ocultar"))
                      : (c(), u("strong", L, "Mostrar")),
                  ],
                ),
                n(t(w), { name: "current_password" }),
              ]),
              e("div", R, [
                a[4] ||
                  (a[4] = e(
                    "label",
                    { class: "form-label", for: "password" },
                    "Nueva contraseña",
                    -1,
                  )),
                n(
                  t(f),
                  {
                    modelValue: s.value.password,
                    "onUpdate:modelValue":
                      a[1] || (a[1] = (b) => (s.value.password = b)),
                    name: "password",
                    type: i.value,
                    class: "form-control",
                    autocomplete: "new-password",
                  },
                  null,
                  8,
                  ["modelValue", "type"],
                ),
                n(t(w), { name: "password" }),
              ]),
              e("div", W, [
                a[5] ||
                  (a[5] = e(
                    "label",
                    { class: "form-label", for: "password_confirmation" },
                    "Repetir nueva contraseña",
                    -1,
                  )),
                n(
                  t(f),
                  {
                    modelValue: s.value.password_confirmation,
                    "onUpdate:modelValue":
                      a[2] ||
                      (a[2] = (b) => (s.value.password_confirmation = b)),
                    name: "password_confirmation",
                    type: i.value,
                    class: "form-control",
                    autocomplete: "new-password",
                  },
                  null,
                  8,
                  ["modelValue", "type"],
                ),
                n(t(w), { name: "password_confirmation" }),
              ]),
              e(
                "button",
                {
                  disabled: !$.valid || d.value,
                  type: "submit",
                  class: "btn btn--block btn--primary",
                },
                [
                  d.value
                    ? g("", !0)
                    : (c(), u("span", Z, "Cambiar contraseña")),
                  d.value ? (c(), u("span", G, "Cambiando…")) : g("", !0),
                ],
                8,
                H,
              ),
            ]),
            _: 1,
          },
          8,
          ["validation-schema"],
        )
      );
    },
  }),
  J = Object.assign(Y, { __name: "FormPassword" }),
  K = { class: "account account--password" },
  Q = { key: 0, class: "account--password__memo" },
  X = { key: 1, class: "account--password__form" },
  aa = y({
    __name: "AccountPassword",
    setup(o) {
      const r = h(),
        p = N(() => r.value?.provider !== "local");
      return (l, s) => (
        c(),
        u("section", K, [
          s[0] ||
            (s[0] = e(
              "div",
              { class: "account--edit__header" },
              [
                e(
                  "h1",
                  { class: "account--edit__title title" },
                  "Actualiza tu contraseña",
                ),
                e("div", { class: "account--edit__text paragraph" }, [
                  e(
                    "p",
                    null,
                    " Mantén tu cuenta segura actualizando tu contraseña periódicamente. Una contraseña fuerte es tu primera línea de defensa. Asegúrate de elegir una que sea única y no la uses en otros servicios. ",
                  ),
                ]),
              ],
              -1,
            )),
          p.value
            ? (c(),
              u("div", Q, [
                n(
                  z,
                  {
                    icon: t(F),
                    text: "No puedes cambiar tu contraseña porque iniciaste sesión con Google u otro proveedor externo.",
                    link: "/cuenta",
                    "button-text": "Volver a mi cuenta",
                  },
                  null,
                  8,
                  ["icon"],
                ),
              ]))
            : (c(), u("div", X, [n(J)])),
        ])
      );
    },
  }),
  ea = Object.assign(aa, { __name: "AccountPassword" }),
  sa = { class: "page" },
  na = y({
    __name: "cambiar-contrasena",
    setup(o) {
      const { $setSEO: r, $setStructuredData: p } = O(),
        l = j();
      return (
        r({
          title: "Cambiar Contraseña",
          description:
            "Cambia tu contraseña en Waldo.click®. Mantén tu cuenta segura actualizando tus credenciales.",
          imageUrl: `${l.public.baseUrl}/share.jpg`,
          url: `${l.public.baseUrl}/cuenta/cambiar-contrasena`,
        }),
        I({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        p({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Cambiar Contraseña",
          url: `${l.public.baseUrl}/cuenta/cambiar-contrasena`,
          description:
            "Cambia tu contraseña en Waldo.click®. Mantén tu cuenta segura actualizando tus credenciales.",
        }),
        (s, d) => (c(), u("div", sa, [n(ea)]))
      );
    },
  });
export { na as default };
//# sourceMappingURL=C-61PF1B.js.map

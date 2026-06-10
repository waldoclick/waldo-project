import {
  aZ as k,
  bc as R,
  bd as w,
  b2 as E,
  bm as M,
  cv as q,
  b8 as v,
  b3 as N,
  bb as S,
  a_ as c,
  b5 as P,
  b1 as h,
  bf as e,
  b0 as t,
  b6 as n,
  bg as g,
  bh as y,
  a$ as p,
  b7 as C,
  bj as U,
  bk as T,
  bu as A,
  bw as D,
  br as F,
  bs as x,
  aY as B,
} from "./BK8sApmn.js";
import { I as O, m as j } from "./Cg1cJ9QQ.js";
import "./DeJqzbk_.js";
try {
  let r =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    l = new r.Error().stack;
  l &&
    ((r._sentryDebugIds = r._sentryDebugIds || {}),
    (r._sentryDebugIds[l] = "99ed0a3e-dce8-4b10-b6b7-5e6e672f2f74"),
    (r._sentryDebugIdIdentifier =
      "sentry-dbid-99ed0a3e-dce8-4b10-b6b7-5e6e672f2f74"));
} catch {}
const W = { class: "form-group" },
  H = { class: "form-group form-group--password" },
  Y = { key: 0 },
  z = { key: 1 },
  L = ["disabled"],
  Z = { key: 0 },
  G = { key: 1 },
  J = k({
    __name: "FormResetPassword",
    setup(r) {
      const { Swal: l } = T(),
        f = R({
          email: w()
            .max(254, "Máximo 254 caracteres")
            .email("Correo electrónico no válido")
            .required("Correo electrónico es requerido"),
          code: w().required("Código de restablecimiento es requerido"),
          password: w()
            .max(50, "Máximo 50 caracteres")
            .required("Nueva contraseña es requerida"),
        }),
        d = E();
      M(() => {
        d.query.token ||
          q({
            statusCode: 404,
            message: "Token no válido",
            statusMessage:
              "El enlace para restablecer la contraseña no es válido",
          });
      });
      const o = v({ email: "", code: d.query.token || "", password: "" }),
        i = v(!1),
        u = v("password"),
        a = N(),
        b = S(),
        $ = async (_) => {
          i.value = !0;
          try {
            (await a("/auth/reset-password", {
              method: "POST",
              body: {
                code: _.code,
                password: _.password,
                passwordConfirmation: _.password,
              },
            }),
              l.fire("Éxito", "Contraseña restablecida con éxito.", "success"),
              b.push("/"));
          } catch {
            l.fire(
              "Error",
              "Hubo un error. Por favor, inténtalo de nuevo.",
              "error",
            );
          } finally {
            i.value = !1;
          }
        },
        I = () => {
          u.value = u.value === "password" ? "text" : "password";
        };
      return (_, s) => (
        c(),
        P(
          n(U),
          { "validation-schema": n(f), onSubmit: $ },
          {
            default: h(({ errors: ne, meta: V }) => [
              e("div", W, [
                s[3] ||
                  (s[3] = e(
                    "label",
                    { class: "form-label", for: "email" },
                    "Correo electrónico",
                    -1,
                  )),
                t(
                  n(g),
                  {
                    modelValue: o.value.email,
                    "onUpdate:modelValue":
                      s[0] || (s[0] = (m) => (o.value.email = m)),
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
                t(n(y), { name: "email" }),
              ]),
              t(
                n(g),
                {
                  modelValue: o.value.code,
                  "onUpdate:modelValue":
                    s[1] || (s[1] = (m) => (o.value.code = m)),
                  name: "code",
                  type: "hidden",
                },
                null,
                8,
                ["modelValue"],
              ),
              e("div", H, [
                s[4] ||
                  (s[4] = e(
                    "label",
                    { class: "form-label", for: "password" },
                    "Nueva Contraseña",
                    -1,
                  )),
                t(
                  n(g),
                  {
                    modelValue: o.value.password,
                    "onUpdate:modelValue":
                      s[2] || (s[2] = (m) => (o.value.password = m)),
                    name: "password",
                    type: u.value,
                    class: "form-control",
                    autocomplete: "new-password",
                    maxlength: "50",
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
                    onClick: I,
                  },
                  [
                    u.value !== "password"
                      ? (c(), p("strong", Y, "Ocultar"))
                      : (c(), p("strong", z, "Mostrar")),
                  ],
                ),
                t(n(y), { name: "password" }),
              ]),
              e(
                "button",
                {
                  disabled: !V.valid || i.value,
                  type: "submit",
                  class: "btn btn--block btn--primary",
                },
                [
                  i.value
                    ? C("", !0)
                    : (c(), p("span", Z, "Restablecer Contraseña")),
                  i.value ? (c(), p("span", G, "Restableciendo…")) : C("", !0),
                ],
                8,
                L,
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
  K = Object.assign(J, { __name: "FormResetPassword" }),
  Q = { class: "page" },
  X = { class: "auth" },
  ee = { class: "auth__introduce" },
  ae = { class: "auth__form" },
  se = { class: "auth__form__inner" },
  oe = ["src"],
  te = { class: "auth__form__fields" },
  re = { class: "auth__form__help" },
  ce = k({
    __name: "restablecer-contrasena",
    setup(r) {
      const { $setSEO: l, $setStructuredData: f } = A(),
        d = B(),
        o = {
          data: {
            title: "Restablece tu contraseña",
            list: [
              "Completa el formulario",
              "Crea una nueva contraseña segura",
              "Accede nuevamente a tu cuenta",
            ],
          },
        },
        i = j;
      return (
        l({
          title: "Restablecer Contraseña",
          description:
            "Estás en el último paso para recuperar el acceso a tu cuenta en Waldo.click®. Ingresa tu nueva contraseña para completar el proceso.",
          imageUrl: `${d.public.baseUrl}/share.jpg`,
          url: `${d.public.baseUrl}/restablecer-contrasena`,
        }),
        D({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        f({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Restablecer Contraseña",
          description:
            "Estás en el último paso para recuperar el acceso a tu cuenta en Waldo.click®. Ingresa tu nueva contraseña para completar el proceso.",
          url: `${d.public.baseUrl}/restablecer-contrasena`,
        }),
        (u, a) => {
          const b = F;
          return (
            c(),
            p("div", Q, [
              e("div", X, [
                e("div", ee, [
                  t(O, { title: o.data.title, list: o.data.list }, null, 8, [
                    "title",
                    "list",
                  ]),
                ]),
                e("div", ae, [
                  e("div", se, [
                    t(
                      b,
                      {
                        to: "/",
                        class: "auth__form__back",
                        title: "Ir al inicio",
                      },
                      {
                        default: h(() => [
                          e(
                            "img",
                            {
                              loading: "lazy",
                              decoding: "async",
                              src: n(i),
                              alt: "Cerrar menú móvil",
                              title: "Cerrar menú móvil",
                            },
                            null,
                            8,
                            oe,
                          ),
                          a[0] || (a[0] = e("span", null, "Ir al inicio", -1)),
                        ]),
                        _: 1,
                      },
                    ),
                    a[3] ||
                      (a[3] = e(
                        "h2",
                        { class: "auth__form__title title" },
                        "Restablece tu contraseña",
                        -1,
                      )),
                    e("div", te, [t(K)]),
                    e("div", re, [
                      e("p", null, [
                        a[2] || (a[2] = x(" ¿Ya tienes una cuenta? ", -1)),
                        t(
                          b,
                          { to: "/login", title: "Iniciar sesión" },
                          {
                            default: h(() => [
                              ...(a[1] || (a[1] = [x(" Inicia sesión ", -1)])),
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
export { ce as default };
//# sourceMappingURL=DNmDYUCO.js.map

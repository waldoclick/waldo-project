import {
  aZ as h,
  bc as x,
  bd as k,
  b3 as C,
  bb as $,
  a_ as u,
  b5 as I,
  b1 as b,
  bf as a,
  b0 as n,
  b6 as l,
  bg as R,
  bh as E,
  a$ as p,
  b7 as g,
  bj as F,
  b8 as v,
  bk as S,
  bu as V,
  bw as N,
  br as P,
  bs as m,
  aY as A,
} from "./BK8sApmn.js";
import { I as D, m as T } from "./Cg1cJ9QQ.js";
import "./DeJqzbk_.js";
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
    o = new t.Error().stack;
  o &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[o] = "21e17be3-69a4-4025-aae0-609fa95ba527"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-21e17be3-69a4-4025-aae0-609fa95ba527"));
} catch {}
const U = { class: "form-group" },
  j = ["disabled"],
  B = { key: 0 },
  W = { key: 1 },
  M = h({
    __name: "FormForgotPassword",
    setup(t) {
      const { Swal: o } = S(),
        d = x({
          email: k()
            .max(254, "Máximo 254 caracteres")
            .email("Correo electrónico no válido")
            .required("Correo electrónico es requerido"),
        }),
        r = v({ email: "" }),
        s = v(!1),
        _ = C(),
        e = $(),
        i = async (f) => {
          s.value = !0;
          try {
            (await _("/auth/forgot-password", {
              method: "POST",
              body: { email: f.email, context: "website" },
            }),
              o.fire(
                "Éxito",
                "Código de restablecimiento enviado con éxito.",
                "success",
              ),
              e.push("/"));
          } catch {
            o.fire(
              "Error",
              "Hubo un error. Por favor, inténtalo de nuevo.",
              "error",
            );
          } finally {
            s.value = !1;
          }
        };
      return (f, c) => (
        u(),
        I(
          l(F),
          { "validation-schema": l(d), onSubmit: i },
          {
            default: b(({ errors: X, meta: y }) => [
              a("div", U, [
                c[1] ||
                  (c[1] = a(
                    "label",
                    { class: "form-label", for: "email" },
                    "Correo electrónico",
                    -1,
                  )),
                n(
                  l(R),
                  {
                    modelValue: r.value.email,
                    "onUpdate:modelValue":
                      c[0] || (c[0] = (w) => (r.value.email = w)),
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
                n(l(E), { name: "email" }),
              ]),
              a(
                "button",
                {
                  disabled: !y.valid || s.value,
                  type: "submit",
                  class: "btn btn--block btn--primary",
                },
                [
                  s.value ? g("", !0) : (u(), p("span", B, "Enviar")),
                  s.value ? (u(), p("span", W, "Enviando…")) : g("", !0),
                ],
                8,
                j,
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
  O = Object.assign(M, { __name: "FormForgotPassword" }),
  q = { class: "page" },
  H = { class: "auth" },
  z = { class: "auth__introduce" },
  L = { class: "auth__form" },
  Y = { class: "auth__form__inner" },
  Z = ["src"],
  G = { class: "auth__form__fields" },
  J = { class: "auth__form__help" },
  K = "Recupera el acceso a tu cuenta en waldo.click®",
  Q =
    "Introduce tu correo para recibir un enlace de restablecimiento de contraseña:",
  oe = h({
    __name: "recuperar-contrasena",
    setup(t) {
      const { $setSEO: o, $setStructuredData: d } = V(),
        r = A(),
        s = [
          "Recibirás un enlace en tu correo para crear una nueva contraseña.",
          "El enlace solo será válido por un tiempo limitado.",
          "Asegúrate de revisar la carpeta de spam si no lo ves en tu bandeja de entrada.",
        ];
      return (
        o({
          title: "Recuperar Contraseña",
          description:
            "Recupera el acceso a tu cuenta en Waldo.click®. Sigue unos simples pasos para restablecer tu contraseña de forma segura.",
          imageUrl: `${r.public.baseUrl}/share.jpg`,
          url: `${r.public.baseUrl}/recuperar-contrasena`,
        }),
        N({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        d({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Recuperar Contraseña",
          description:
            "Recupera el acceso a tu cuenta en Waldo.click®. Sigue unos simples pasos para restablecer tu contraseña de forma segura.",
          url: `${r.public.baseUrl}/recuperar-contrasena`,
        }),
        (_, e) => {
          const i = P;
          return (
            u(),
            p("div", q, [
              a("div", H, [
                a("div", z, [n(D, { title: K, subtitle: Q, list: s })]),
                a("div", L, [
                  a("div", Y, [
                    n(
                      i,
                      {
                        to: "/",
                        class: "auth__form__back",
                        title: "Ir al inicio",
                      },
                      {
                        default: b(() => [
                          a(
                            "img",
                            {
                              loading: "lazy",
                              decoding: "async",
                              src: l(T),
                              alt: "mobile menu close",
                              title: "mobile menu close",
                            },
                            null,
                            8,
                            Z,
                          ),
                          e[0] || (e[0] = a("span", null, "Ir al inicio", -1)),
                        ]),
                        _: 1,
                      },
                    ),
                    e[5] ||
                      (e[5] = a(
                        "h1",
                        { class: "auth__form__title title" },
                        "Recupera tu contraseña",
                        -1,
                      )),
                    a("div", G, [n(O)]),
                    a("div", J, [
                      a("p", null, [
                        e[2] || (e[2] = m(" ¿Tienes una cuenta en ", -1)),
                        e[3] || (e[3] = a("strong", null, "Waldo.click®", -1)),
                        e[4] || (e[4] = m(" ? ", -1)),
                        n(
                          i,
                          { to: "/login", title: "Inicia sesión" },
                          {
                            default: b(() => [
                              ...(e[1] || (e[1] = [m(" Inicia sesión ", -1)])),
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
export { oe as default };
//# sourceMappingURL=DSpuaQg-.js.map

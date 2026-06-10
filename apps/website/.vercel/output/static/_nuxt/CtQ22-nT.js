import { I as y } from "./Cg1cJ9QQ.js";
import {
  bc as $,
  bd as f,
  a_ as i,
  b5 as k,
  b1 as A,
  bf as e,
  b0 as l,
  b6 as n,
  bg as b,
  bh as g,
  a$ as c,
  b7 as h,
  bj as E,
  b8 as v,
  bk as D,
  aZ as S,
  bu as x,
  bw as C,
  aY as I,
} from "./BK8sApmn.js";
import "./DeJqzbk_.js";
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
    (o._sentryDebugIds[r] = "d811ad94-e2ca-4799-ace5-304e36106301"),
    (o._sentryDebugIdIdentifier =
      "sentry-dbid-d811ad94-e2ca-4799-ace5-304e36106301"));
} catch {}
const M = { class: "form form--login" },
  T = { class: "form-group" },
  q = { class: "form-group form-group--password" },
  N = { key: 0 },
  P = { key: 1 },
  R = ["disabled"],
  U = { key: 0 },
  j = { key: 1 },
  B = {
    __name: "FormDev",
    setup(o) {
      const { Swal: r } = D(),
        a = v(!1),
        p = $({
          username: f().required("Usuario es requerido"),
          password: f().required("Contraseña es requerida"),
        }),
        t = v("password"),
        _ = () => {
          t.value = t.value === "password" ? "text" : "password";
        },
        u = async (m) => {
          a.value = !0;
          try {
            const s = await fetch("/api/dev-login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: m.username,
                password: m.password,
              }),
            });
            if (!s.ok) throw new Error(`HTTP error! status: ${s.status}`);
            (await s.json()).success && (window.location.href = "/");
          } catch (s) {
            let d =
              "No se pudo autenticar. Verifica tus credenciales de desarrollo.";
            (s.message.includes("401")
              ? (d = "Usuario o contraseña de desarrollo incorrectos.")
              : s.message.includes("400") &&
                (d = "Por favor, completa todos los campos requeridos."),
              r.fire("Acceso Denegado", d, "error"));
          } finally {
            a.value = !1;
          }
        };
      return (m, s) => (
        i(),
        k(
          n(E),
          { "validation-schema": n(p), onSubmit: u },
          {
            default: A(({ errors: d, meta: w }) => [
              e("div", M, [
                e("div", null, [
                  e("div", T, [
                    s[0] ||
                      (s[0] = e(
                        "label",
                        { class: "form-label", for: "username" },
                        "Usuario",
                        -1,
                      )),
                    l(n(b), {
                      name: "username",
                      type: "text",
                      class: "form-control",
                      autocomplete: "username",
                      placeholder: "Ingresa tu usuario de desarrollo",
                    }),
                    l(n(g), { name: "username" }),
                  ]),
                  e("div", q, [
                    s[1] ||
                      (s[1] = e(
                        "label",
                        { class: "form-label", for: "password" },
                        "Contraseña",
                        -1,
                      )),
                    l(
                      n(b),
                      {
                        name: "password",
                        type: t.value,
                        class: "form-control",
                        autocomplete: "current-password",
                        placeholder: "Ingresa tu contraseña de desarrollo",
                      },
                      null,
                      8,
                      ["type"],
                    ),
                    e(
                      "button",
                      {
                        class: "form-group--password__show-password",
                        type: "button",
                        title: "Mostrar/ocultar contraseña",
                        onClick: _,
                      },
                      [
                        t.value !== "password"
                          ? (i(), c("strong", N, "Ocultar"))
                          : (i(), c("strong", P, "Mostrar")),
                      ],
                    ),
                    l(n(g), { name: "password" }),
                  ]),
                  e(
                    "button",
                    {
                      disabled: !w.valid || a.value,
                      title: "Autenticarse",
                      type: "submit",
                      class: "btn btn--block btn--primary",
                    },
                    [
                      a.value ? h("", !0) : (i(), c("span", U, "Autenticarse")),
                      a.value
                        ? (i(), c("span", j, "Autenticando..."))
                        : h("", !0),
                    ],
                    8,
                    R,
                  ),
                ]),
              ]),
            ]),
            _: 1,
          },
          8,
          ["validation-schema"],
        )
      );
    },
  },
  F = { class: "page" },
  O = { class: "auth" },
  V = { class: "auth__introduce" },
  z = { class: "auth__form" },
  W = { class: "auth__form__inner" },
  H = { class: "auth__form__fields" },
  J = "Acceso Restringido<br>Modo Desarrollo",
  L =
    "El sitio está en mantenimiento.<br>Para continuar necesitas autenticarte:",
  K = S({
    __name: "dev",
    setup(o) {
      const r = [
          "El acceso al sitio está restringido temporalmente.",
          "Solo usuarios autorizados pueden navegar por el sitio.",
          "Los motores de búsqueda pueden acceder libremente al contenido.",
          "Contacta al administrador si necesitas acceso.",
        ],
        { $setSEO: a, $setStructuredData: p } = x(),
        t = I();
      return (
        a({
          title: "Acceso Restringido - Modo Desarrollo",
          description:
            "El sitio Waldo.click® está en modo desarrollo. El acceso está restringido temporalmente y solo usuarios autorizados pueden navegar por el sitio.",
          imageUrl: `${t.public.baseUrl}/share.jpg`,
        }),
        p({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Acceso Restringido - Modo Desarrollo",
          description:
            "El sitio Waldo.click® está en modo desarrollo. El acceso está restringido temporalmente y solo usuarios autorizados pueden navegar por el sitio.",
          url: `${t.public.baseUrl}/dev`,
        }),
        C({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        (_, u) => (
          i(),
          c("div", F, [
            e("div", O, [
              e("div", V, [l(y, { title: J, subtitle: L, list: r })]),
              e("div", z, [
                e("div", W, [
                  u[0] ||
                    (u[0] = e(
                      "h1",
                      { class: "auth__form__title title" },
                      "Acceso Restringido",
                      -1,
                    )),
                  e("div", H, [l(B)]),
                ]),
              ]),
            ]),
          ])
        )
      );
    },
  });
export { K as default };
//# sourceMappingURL=CtQ22-nT.js.map

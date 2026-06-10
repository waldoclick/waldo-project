import {
  aZ as y,
  dh as h,
  bz as v,
  bu as k,
  bw as I,
  a_ as i,
  a$ as u,
  bf as t,
  b0 as n,
  b1 as c,
  b6 as r,
  br as w,
  di as x,
  b7 as d,
  b5 as C,
  bs as a,
  aY as A,
  dj as D,
} from "./BK8sApmn.js";
import { I as N, m as U } from "./Cg1cJ9QQ.js";
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
    s = new o.Error().stack;
  s &&
    ((o._sentryDebugIds = o._sentryDebugIds || {}),
    (o._sentryDebugIds[s] = "8b107c59-3054-464f-b871-36bbf0973154"),
    (o._sentryDebugIdIdentifier =
      "sentry-dbid-8b107c59-3054-464f-b871-36bbf0973154"));
} catch {}
const $ = { class: "page" },
  V = { class: "auth" },
  W = { class: "auth__introduce" },
  B = { class: "auth__form" },
  P = { class: "auth__form__inner" },
  R = ["src"],
  z = { class: "auth__form__fields" },
  E = { key: 0, class: "auth__form__separator" },
  L = { class: "auth__form__social" },
  S = { key: 1, class: "auth__form__loading" },
  T = { class: "auth__form__help" },
  j = "Accede y gestiona tus anuncios en waldo.click®",
  q = "Con tu cuenta en waldo.click® podrás:",
  M = y({
    __name: "index",
    setup(o) {
      const s = A();
      s.public.apiUrl;
      const { data: _, pending: p } = h(
          "providers",
          async () => {
            const { getProviderAuthenticationUrl: g } = v();
            try {
              return { google: !!g("google") };
            } catch {
              return { google: !0 };
            }
          },
          { default: () => ({ google: !0 }) },
        ),
        f = [
          "Ver los datos de contacto de los anuncios.",
          "Publicar anuncios con nuestros planes disponibles.",
          "Disfrutar de hasta 3 anuncios gratis renovables.",
          "Recibir notificaciones de nuevos anuncios en tu correo periódicamente.",
        ],
        { $setSEO: b, $setStructuredData: m } = k();
      return (
        b({
          title: "Iniciar sesión",
          description:
            "Accede a tu cuenta en Waldo.click® para gestionar tus anuncios, ver contactos y disfrutar de todos los beneficios de nuestra plataforma.",
          imageUrl: `${s.public.baseUrl}/share.jpg`,
        }),
        I({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        m({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Iniciar sesión",
          description:
            "Accede a tu cuenta en Waldo.click® para gestionar tus anuncios, ver contactos y disfrutar de todos los beneficios de nuestra plataforma.",
          url: `${s.public.baseUrl}/login`,
        }),
        (g, e) => {
          const l = w;
          return (
            i(),
            u("div", $, [
              t("div", V, [
                t("div", W, [n(N, { title: j, subtitle: q, list: f })]),
                t("div", B, [
                  t("div", P, [
                    n(
                      l,
                      {
                        to: "/",
                        class: "auth__form__back",
                        title: "Ir al inicio",
                      },
                      {
                        default: c(() => [
                          t(
                            "img",
                            {
                              loading: "lazy",
                              decoding: "async",
                              src: r(U),
                              alt: "mobile menu close",
                              title: "mobile menu close",
                            },
                            null,
                            8,
                            R,
                          ),
                          e[0] || (e[0] = t("span", null, "Ir al inicio", -1)),
                        ]),
                        _: 1,
                      },
                    ),
                    e[8] ||
                      (e[8] = t(
                        "h1",
                        { class: "auth__form__title title" },
                        "Ingresa a tu cuenta",
                        -1,
                      )),
                    t("div", z, [n(x)]),
                    r(_)?.google ? (i(), u("div", E, " o ")) : d("", !0),
                    t("div", L, [
                      r(_)?.google ? (i(), C(D, { key: 0 })) : d("", !0),
                      r(p)
                        ? (i(),
                          u("div", S, [
                            ...(e[1] ||
                              (e[1] = [
                                t(
                                  "p",
                                  null,
                                  "Cargando opciones de inicio de sesión...",
                                  -1,
                                ),
                              ])),
                          ]))
                        : d("", !0),
                    ]),
                    t("div", T, [
                      t("p", null, [
                        e[3] || (e[3] = a(" ¿No tienes cuenta en ", -1)),
                        e[4] || (e[4] = t("strong", null, "Waldo.click®", -1)),
                        e[5] || (e[5] = a(" ? ", -1)),
                        n(
                          l,
                          { to: "/registro", title: "Crea una cuenta gratis" },
                          {
                            default: c(() => [
                              ...(e[2] ||
                                (e[2] = [a(" Crea una cuenta gratis ", -1)])),
                            ]),
                            _: 1,
                          },
                        ),
                      ]),
                      t("p", null, [
                        e[7] || (e[7] = a(" ¿Olvidaste tu contraseña? ", -1)),
                        n(
                          l,
                          {
                            to: "/recuperar-contrasena",
                            title: "Recupérala aquí",
                          },
                          {
                            default: c(() => [
                              ...(e[6] ||
                                (e[6] = [a(" Recupérala aquí ", -1)])),
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
export { M as default };
//# sourceMappingURL=CvAIsPKr.js.map

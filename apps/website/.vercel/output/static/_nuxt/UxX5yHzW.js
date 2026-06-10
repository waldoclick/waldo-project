import {
  bB as _,
  a_ as d,
  a$ as c,
  bf as o,
  b0 as a,
  b1 as s,
  bs as r,
  br as l,
  aZ as u,
  bw as b,
} from "./BK8sApmn.js";
try {
  let e =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    n = new e.Error().stack;
  n &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[n] = "55ce29cd-dd03-49c1-ae8c-011f62378d70"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-55ce29cd-dd03-49c1-ae8c-011f62378d70"));
} catch {}
const p = {},
  f = { class: "onboarding onboarding--thankyou" },
  y = { class: "onboarding--thankyou__content" },
  g = { class: "onboarding--thankyou__actions" };
function m(e, n) {
  const t = l;
  return (
    d(),
    c("div", f, [
      o("div", y, [
        n[2] ||
          (n[2] = o(
            "h1",
            { class: "onboarding--thankyou__title title" },
            " Muchas gracias por registrarte ",
            -1,
          )),
        n[3] ||
          (n[3] = o(
            "p",
            { class: "onboarding--thankyou__text paragraph" },
            " Tu perfil esta completo. Ya puedes publicar tu primer anuncio en Waldo.click® y comenzar a conectar con compradores y vendedores. ",
            -1,
          )),
        o("div", g, [
          a(
            t,
            { to: "/anunciar", class: "btn btn--primary btn--block" },
            {
              default: s(() => [
                ...(n[0] || (n[0] = [r("Crear mi primer anuncio", -1)])),
              ]),
              _: 1,
            },
          ),
          a(
            t,
            { to: "/", class: "btn btn--secondary btn--block" },
            {
              default: s(() => [...(n[1] || (n[1] = [r("Ir al inicio", -1)]))]),
              _: 1,
            },
          ),
        ]),
      ]),
    ])
  );
}
const k = Object.assign(_(p, [["render", m]]), {
    __name: "OnboardingThankyou",
  }),
  h = { class: "page" },
  w = u({
    __name: "thankyou",
    setup(e) {
      return (
        b({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        (n, t) => {
          const i = k;
          return (d(), c("div", h, [a(i)]));
        }
      );
    },
  });
export { w as default };
//# sourceMappingURL=UxX5yHzW.js.map

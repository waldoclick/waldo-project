import {
  aZ as _,
  a_ as l,
  a$ as u,
  bf as s,
  b0 as c,
  dk as b,
  bv as p,
  b4 as f,
  bw as g,
  cP as y,
  ba as h,
} from "./BK8sApmn.js";
import { _ as w } from "./e4c2LLW0.js";
import { u as x } from "./D_gKzRlW.js";
import "./BQLSJJto.js";
import "./BWjFl-iO.js";
import "./CMM48BjM.js";
import "./Ce4MZUPb.js";
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
    o = new e.Error().stack;
  o &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[o] = "922dcd41-cce7-45aa-b653-b6ea7191e53b"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-922dcd41-cce7-45aa-b653-b6ea7191e53b"));
} catch {}
const v = { class: "onboarding onboarding--default" },
  D = { class: "onboarding--default__container" },
  S = { class: "onboarding--default__logo" },
  k = { class: "onboarding--default__form" },
  B = _({
    __name: "OnboardingDefault",
    emits: ["success"],
    setup(e, { emit: o }) {
      const t = o,
        a = () => t("success");
      return (i, n) => {
        const r = b,
          d = w;
        return (
          l(),
          u("div", v, [
            s("div", D, [
              s("div", S, [c(r)]),
              n[0] ||
                (n[0] = s(
                  "h1",
                  { class: "onboarding--default__title" },
                  "Bienvenido a Waldo.click®",
                  -1,
                )),
              n[1] ||
                (n[1] = s(
                  "p",
                  { class: "onboarding--default__text" },
                  " Completa tu perfil para comenzar a publicar y gestionar tus avisos. ",
                  -1,
                )),
              s("div", k, [c(d, { "onboarding-mode": !0, onSuccess: a })]),
            ]),
          ])
        );
      };
    },
  }),
  C = Object.assign(B, { __name: "OnboardingDefault" }),
  I = { class: "page" },
  R = _({
    __name: "index",
    async setup(e) {
      let o, t;
      const a = () => y("/onboarding/thankyou"),
        i = x(),
        n = p();
      return (
        ([o, t] = f(async () =>
          h("onboarding-regions-communes", async () => {
            (await i.loadRegions(), await n.loadCommunes());
          }),
        )),
        await o,
        t(),
        g({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        (r, d) => {
          const m = C;
          return (l(), u("div", I, [c(m, { onSuccess: a })]));
        }
      );
    },
  });
export { R as default };
//# sourceMappingURL=DykvHJOn.js.map

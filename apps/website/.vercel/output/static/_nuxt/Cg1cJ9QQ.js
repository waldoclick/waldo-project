import {
  cL as r,
  aZ as f,
  a_ as s,
  a$ as n,
  bf as o,
  b0 as i,
  cV as p,
  b7 as l,
  bn as y,
  bo as I,
  b9 as u,
  b6 as v,
  cM as T,
  bs as L,
  bi as k,
  cW as x,
} from "./BK8sApmn.js";
import { P as D } from "./DeJqzbk_.js";
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
    t = new e.Error().stack;
  t &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[t] = "eeb6f643-a993-4182-9cc7-32229ed80a28"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-eeb6f643-a993-4182-9cc7-32229ed80a28"));
} catch {}
const M = r("/images/icon-check-circle.svg"),
  w = { class: "introduce introduce--auth" },
  N = { class: "introduce--auth__content" },
  V = { class: "introduce--auth__logo" },
  A = ["innerHTML"],
  C = { class: "introduce--auth__details" },
  H = ["innerHTML"],
  z = { key: 1, class: "introduce--auth__details__list" },
  B = { class: "introduce--auth__bg" },
  S = f({
    __name: "IntroduceAuth",
    props: { title: {}, subtitle: {}, list: {} },
    setup(e) {
      const t = e,
        { sanitizeText: d } = x(),
        _ = (a) => d(a.trim()),
        h = u(() => _(t.title)),
        c = u(() => t.list || []);
      return (a, E) => {
        const b = T;
        return (
          s(),
          n("div", w, [
            o("div", N, [
              o("div", V, [i(p)]),
              o(
                "h2",
                { class: "introduce--auth__title", innerHTML: h.value },
                null,
                8,
                A,
              ),
              o("div", C, [
                e.subtitle
                  ? (s(),
                    n(
                      "h2",
                      {
                        key: 0,
                        class: "introduce--auth__details__title",
                        innerHTML: e.subtitle,
                      },
                      null,
                      8,
                      H,
                    ))
                  : l("", !0),
                c.value.length > 0
                  ? (s(),
                    n("ul", z, [
                      (s(!0),
                      n(
                        y,
                        null,
                        I(
                          c.value,
                          (g, m) => (
                            s(),
                            n("li", { key: m }, [
                              i(b, { src: v(M), alt: "" }, null, 8, ["src"]),
                              L(" " + k(g), 1),
                            ])
                          ),
                        ),
                        128,
                      )),
                    ]))
                  : l("", !0),
              ]),
            ]),
            o("div", B, [i(D)]),
          ])
        );
      };
    },
  }),
  j = Object.assign(S, { __name: "IntroduceAuth" }),
  F = r("/images/mobile-menu-close.svg");
export { j as I, F as m };
//# sourceMappingURL=Cg1cJ9QQ.js.map

import {
  aZ as i,
  a_ as n,
  a$ as l,
  b5 as a,
  bS as b,
  bf as o,
  bi as c,
  b1 as d,
  bs as f,
  b7 as u,
  br as m,
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
    t = new e.Error().stack;
  t &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[t] = "04cce3f4-cfcb-48b4-aab9-cd09cfc2a698"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-04cce3f4-cfcb-48b4-aab9-cd09cfc2a698"));
} catch {}
const r = { class: "memo memo--default" },
  _ = { class: "memo--default__text" },
  y = i({
    __name: "MemoDefault",
    props: {
      icon: { type: [Function, Object] },
      text: {},
      buttonText: {},
      link: {},
    },
    setup(e) {
      return (t, x) => {
        const s = m;
        return (
          n(),
          l("div", r, [
            (n(), a(b(e.icon), { size: 40, class: "memo--default__icon" })),
            o("div", _, [o("p", null, c(e.text), 1)]),
            e.link && e.buttonText
              ? (n(),
                a(
                  s,
                  {
                    key: 0,
                    to: e.link,
                    class: "btn btn--buy",
                    title: e.buttonText,
                  },
                  { default: d(() => [f(c(e.buttonText), 1)]), _: 1 },
                  8,
                  ["to", "title"],
                ))
              : u("", !0),
          ])
        );
      };
    },
  }),
  k = Object.assign(y, { __name: "MemoDefault" });
export { k as M };
//# sourceMappingURL=DuRm081T.js.map

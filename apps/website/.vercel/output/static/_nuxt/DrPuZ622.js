import {
  aZ as d,
  a_ as a,
  a$ as s,
  bf as o,
  bi as n,
  b7 as c,
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
    (e._sentryDebugIds[t] = "c3661d9f-d6c3-4064-a6fc-37c406345b7f"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-c3661d9f-d6c3-4064-a6fc-37c406345b7f"));
} catch {}
const l = { class: "summary-default" },
  f = { class: "summary-default__title" },
  i = { key: 0, class: "summary-default__text" },
  r = d({
    __name: "SummaryDefault",
    props: {
      title: { default: "Tipo de publicación" },
      text: { default: void 0 },
    },
    setup(e) {
      return (t, u) => (
        a(),
        s("div", l, [
          o("span", f, n(e.title), 1),
          e.text ? (a(), s("span", i, n(e.text), 1)) : c("", !0),
        ])
      );
    },
  }),
  _ = Object.assign(r, { __name: "SummaryDefault" });
export { _ as S };
//# sourceMappingURL=DrPuZ622.js.map

import {
  aZ as s,
  a_ as a,
  a$ as i,
  bf as n,
  bA as o,
  b7 as r,
  bi as _,
  bC as l,
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
    (e._sentryDebugIds[t] = "585e13ac-be9c-45c1-83f3-ae0d333f53ab"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-585e13ac-be9c-45c1-83f3-ae0d333f53ab"));
} catch {}
const d = { class: "box box--information" },
  b = { class: "box--information__title" },
  f = s({
    __name: "BoxInformation",
    props: {
      title: { type: String, required: !0 },
      columns: { type: Number, default: 1 },
    },
    setup(e) {
      return (t, c) => (
        a(),
        i("section", d, [
          n("header", b, [
            n("h3", null, [
              t.$slots.titlePrefix
                ? o(t.$slots, "titlePrefix", { key: 0 })
                : r("", !0),
              n("span", null, _(e.title), 1),
            ]),
          ]),
          n(
            "div",
            {
              class: l([
                "box--information__description",
                `box--information__description--cols-${e.columns}`,
              ]),
            },
            [o(t.$slots, "default")],
            2,
          ),
        ])
      );
    },
  }),
  g = Object.assign(f, { __name: "BoxInformation" }),
  u = { class: "box box--content" },
  m = { class: "box--content__container" },
  p = { class: "box--content__content" },
  x = { class: "box--content__sidebar" },
  y = s({
    __name: "BoxContent",
    setup(e) {
      return (t, c) => (
        a(),
        i("section", u, [
          n("div", m, [
            n("div", p, [o(t.$slots, "content")]),
            n("aside", x, [o(t.$slots, "sidebar")]),
          ]),
        ])
      );
    },
  }),
  $ = Object.assign(y, { __name: "BoxContent" });
export { g as _, $ as a };
//# sourceMappingURL=RoATBwxO.js.map

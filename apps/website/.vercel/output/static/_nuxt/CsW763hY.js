import {
  aZ as b,
  a_ as l,
  b5 as n,
  b1 as u,
  bS as o,
  bC as c,
  a$ as s,
  br as f,
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
    (e._sentryDebugIds[t] = "03052509-5cef-43b9-969d-24a8c9a410fb"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-03052509-5cef-43b9-969d-24a8c9a410fb"));
} catch {}
const r = ["href", "target", "rel", "title", "aria-label"],
  m = ["type", "title", "aria-label"],
  y = b({
    __name: "ButtonIcon",
    props: {
      icon: {},
      to: { default: void 0 },
      href: { default: void 0 },
      target: { default: void 0 },
      rel: { default: void 0 },
      type: { default: "button" },
      title: { default: void 0 },
      ariaLabel: { default: void 0 },
      customClass: { default: "" },
      iconSize: { default: 18 },
    },
    emits: ["click"],
    setup(e) {
      return (t, a) => {
        const d = f;
        return e.to
          ? (l(),
            n(
              d,
              {
                key: 0,
                to: e.to,
                target: e.target,
                rel: e.rel,
                class: c(["btn", "btn--icon", e.customClass]),
                title: e.title,
                "aria-label": e.ariaLabel,
                onClick: a[0] || (a[0] = (i) => t.$emit("click", i)),
              },
              {
                default: u(() => [
                  (l(), n(o(e.icon), { size: e.iconSize }, null, 8, ["size"])),
                ]),
                _: 1,
              },
              8,
              ["to", "target", "rel", "class", "title", "aria-label"],
            ))
          : e.href
            ? (l(),
              s(
                "a",
                {
                  key: 1,
                  href: e.href,
                  target: e.target,
                  rel: e.rel,
                  class: c(["btn", "btn--icon", e.customClass]),
                  title: e.title,
                  "aria-label": e.ariaLabel,
                  onClick: a[1] || (a[1] = (i) => t.$emit("click", i)),
                },
                [(l(), n(o(e.icon), { size: e.iconSize }, null, 8, ["size"]))],
                10,
                r,
              ))
            : (l(),
              s(
                "button",
                {
                  key: 2,
                  type: e.type,
                  class: c(["btn", "btn--icon", e.customClass]),
                  title: e.title,
                  "aria-label": e.ariaLabel,
                  onClick: a[2] || (a[2] = (i) => t.$emit("click", i)),
                },
                [(l(), n(o(e.icon), { size: e.iconSize }, null, 8, ["size"]))],
                10,
                m,
              ));
      };
    },
  }),
  k = Object.assign(y, { __name: "ButtonIcon" });
export { k as B };
//# sourceMappingURL=CsW763hY.js.map

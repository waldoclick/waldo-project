import { bB as o, a_ as t, a$ as d, bA as s } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[n] = "7e557f92-2f72-4d3d-bf88-5c1a3ca26829"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-7e557f92-2f72-4d3d-bf88-5c1a3ca26829"));
} catch {}
const a = {},
  r = { class: "layout layout--onboarding" };
function f(e, n) {
  return (t(), d("div", r, [s(e.$slots, "default")]));
}
const c = o(a, [["render", f]]);
export { c as default };
//# sourceMappingURL=BJ9TWwRw.js.map

import { _ } from "./vgLiQXkW.js";
import { _ as d, a as c } from "./RoATBwxO.js";
import { F as l } from "./CP9GxK4v.js";
import { aZ as i, a_ as m, a$ as u, b0 as o, b1 as t } from "./BK8sApmn.js";
import "./CNKn_OHC.js";
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
    (e._sentryDebugIds[n] = "a4eb711e-8627-4972-b3c6-da6687a82371"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-a4eb711e-8627-4972-b3c6-da6687a82371"));
} catch {}
const w = i({
  __name: "new",
  setup(e) {
    const n = [
      { label: "FAQs", to: "/dashboard/maintenance/faqs" },
      { label: "Nuevo" },
    ];
    return (b, f) => {
      const a = _,
        s = d,
        r = c;
      return (
        m(),
        u("div", null, [
          o(a, { title: "Nuevo FAQ", breadcrumbs: n }),
          o(r, null, {
            content: t(() => [
              o(
                s,
                { title: "Nuevo FAQ", columns: 1 },
                { default: t(() => [o(l)]), _: 1 },
              ),
            ]),
            _: 1,
          }),
        ])
      );
    };
  },
});
export { w as default };
//# sourceMappingURL=CC8Sjap-.js.map

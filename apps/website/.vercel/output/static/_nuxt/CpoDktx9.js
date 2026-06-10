import { _ as s } from "./vgLiQXkW.js";
import { _, a as l } from "./RoATBwxO.js";
import { F as i } from "./DZUzKm9k.js";
import { aZ as d, a_ as f, a$ as m, b0 as t, b1 as n } from "./BK8sApmn.js";
import "./CNKn_OHC.js";
import "./Cwrq1rl2.js";
import "./D6ORICL5.js";
import "./CNZV9sYn.js";
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
    (e._sentryDebugIds[o] = "75affc1b-b0a1-4b09-b7c7-cc616cfc815e"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-75affc1b-b0a1-4b09-b7c7-cc616cfc815e"));
} catch {}
const v = d({
  __name: "new",
  setup(e) {
    const o = [
      { label: "Artículos", to: "/dashboard/articles" },
      { label: "Nuevo" },
    ];
    return (u, b) => {
      const a = s,
        r = _,
        c = l;
      return (
        f(),
        m("div", null, [
          t(a, { title: "Nuevo artículo", breadcrumbs: o }),
          t(c, null, {
            content: n(() => [
              t(
                r,
                { title: "Nuevo artículo", columns: 1 },
                { default: n(() => [t(i)]), _: 1 },
              ),
            ]),
            _: 1,
          }),
        ])
      );
    };
  },
});
export { v as default };
//# sourceMappingURL=CpoDktx9.js.map

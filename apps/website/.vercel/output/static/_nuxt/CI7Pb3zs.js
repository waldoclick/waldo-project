import { _ as n } from "./vgLiQXkW.js";
import { A as a } from "./CGv6sxp1.js";
import { aZ as d, a_ as i, a$ as s, b0 as t } from "./BK8sApmn.js";
import "./CNKn_OHC.js";
import "./Bn4ou5Ry.js";
import "./DmUMncXv.js";
import "./Cwrq1rl2.js";
import "./BbtmlxJr.js";
import "./C4RpNa5i.js";
import "./BSFPidNw.js";
import "./CjIigZ6h.js";
import "./BZT4iOTd.js";
import "./DvfQSOKW.js";
import "./C3iZdfbl.js";
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
    (e._sentryDebugIds[o] = "bb3bc7d9-0520-4f14-9711-a8fa1f756d54"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-bb3bc7d9-0520-4f14-9711-a8fa1f756d54"));
} catch {}
const A = d({
  __name: "expired",
  setup(e) {
    const o = [
      { label: "Anuncios", to: "/dashboard/ads/pending" },
      { label: "Expirados" },
    ];
    return (p, b) => {
      const r = n;
      return (
        i(),
        s("div", null, [
          t(r, { title: "Expirados", breadcrumbs: o }),
          t(a, {
            endpoint: "ads/archiveds",
            section: "adsArchived",
            "show-web-link": !0,
          }),
        ])
      );
    };
  },
});
export { A as default };
//# sourceMappingURL=CI7Pb3zs.js.map

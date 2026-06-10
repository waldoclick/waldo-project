import { _ as r } from "./vgLiQXkW.js";
import { A as s } from "./CGv6sxp1.js";
import { aZ as d, a_ as i, a$ as a, b0 as t } from "./BK8sApmn.js";
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
    n = new e.Error().stack;
  n &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[n] = "80912682-4af9-4c04-b1e0-e2f2db4e0498"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-80912682-4af9-4c04-b1e0-e2f2db4e0498"));
} catch {}
const A = d({
  __name: "pending",
  setup(e) {
    const n = [
      { label: "Anuncios", to: "/dashboard/ads/pending" },
      { label: "Pendientes" },
    ];
    return (p, l) => {
      const o = r;
      return (
        i(),
        a("div", null, [
          t(o, { title: "Pendientes", breadcrumbs: n }),
          t(s, {
            endpoint: "ads/pendings",
            section: "adsPendings",
            "show-web-link": !0,
          }),
        ])
      );
    };
  },
});
export { A as default };
//# sourceMappingURL=CqBrG9XO.js.map

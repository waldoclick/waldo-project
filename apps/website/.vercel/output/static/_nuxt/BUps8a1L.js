import { _ as r } from "./vgLiQXkW.js";
import { A as d } from "./CGv6sxp1.js";
import { aZ as s, a_ as i, a$ as a, b0 as o } from "./BK8sApmn.js";
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
    t = new e.Error().stack;
  t &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[t] = "d7a9316c-04fb-41d1-9bf5-70fbdde841ef"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-d7a9316c-04fb-41d1-9bf5-70fbdde841ef"));
} catch {}
const k = s({
  __name: "active",
  setup(e) {
    const t = [
      { label: "Anuncios", to: "/dashboard/ads/pending" },
      { label: "Activos" },
    ];
    return (p, c) => {
      const n = r;
      return (
        i(),
        a("div", null, [
          o(n, { title: "Activos", breadcrumbs: t }),
          o(d, {
            endpoint: "ads/actives",
            section: "adsActives",
            "show-web-link": !0,
          }),
        ])
      );
    };
  },
});
export { k as default };
//# sourceMappingURL=BUps8a1L.js.map

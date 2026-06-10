import { _ as n } from "./vgLiQXkW.js";
import { A as d } from "./CGv6sxp1.js";
import { aZ as a, a_ as s, a$ as i, b0 as t } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[o] = "5da0d6ce-2d07-406c-9066-b873bbbc8e6c"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-5da0d6ce-2d07-406c-9066-b873bbbc8e6c"));
} catch {}
const x = a({
  __name: "abandoned",
  setup(e) {
    const o = [
      { label: "Anuncios", to: "/dashboard/ads/pending" },
      { label: "Borradores" },
    ];
    return (p, b) => {
      const r = n;
      return (
        s(),
        i("div", null, [
          t(r, { title: "Borradores", breadcrumbs: o }),
          t(d, {
            endpoint: "ads/drafts",
            section: "adsDraft",
            "show-web-link": !0,
          }),
        ])
      );
    };
  },
});
export { x as default };
//# sourceMappingURL=vSVs40iu.js.map

import { _ as r } from "./vgLiQXkW.js";
import { A as a } from "./CGv6sxp1.js";
import { aZ as d, a_ as s, a$ as i, b0 as n } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[o] = "10de7442-b5fc-4f7e-9064-64eb362ecd47"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-10de7442-b5fc-4f7e-9064-64eb362ecd47"));
} catch {}
const x = d({
  __name: "banned",
  setup(e) {
    const o = [
      { label: "Anuncios", to: "/dashboard/ads/pending" },
      { label: "Baneados" },
    ];
    return (p, b) => {
      const t = r;
      return (
        s(),
        i("div", null, [
          n(t, { title: "Baneados", breadcrumbs: o }),
          n(a, {
            endpoint: "ads/banneds",
            section: "adsBanned",
            "show-web-link": !0,
          }),
        ])
      );
    };
  },
});
export { x as default };
//# sourceMappingURL=CqMCqOGb.js.map

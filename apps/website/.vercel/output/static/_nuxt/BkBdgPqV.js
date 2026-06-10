import { _ as r } from "./vgLiQXkW.js";
import { A as a } from "./CGv6sxp1.js";
import { aZ as d, a_ as s, a$ as i, b0 as t } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[o] = "3ef76d6c-982a-4993-917e-5f7ba0e5f307"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-3ef76d6c-982a-4993-917e-5f7ba0e5f307"));
} catch {}
const x = d({
  __name: "rejected",
  setup(e) {
    const o = [
      { label: "Anuncios", to: "/dashboard/ads/pending" },
      { label: "Rechazados" },
    ];
    return (p, c) => {
      const n = r;
      return (
        s(),
        i("div", null, [
          t(n, { title: "Rechazados", breadcrumbs: o }),
          t(a, {
            endpoint: "ads/rejecteds",
            section: "adsRejected",
            "show-web-link": !0,
          }),
        ])
      );
    };
  },
});
export { x as default };
//# sourceMappingURL=BkBdgPqV.js.map

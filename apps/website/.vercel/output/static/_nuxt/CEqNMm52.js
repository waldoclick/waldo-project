import {
  aZ as f,
  bw as u,
  bz as l,
  b2 as b,
  bM as p,
  cO as g,
  cP as s,
  bk as w,
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
    (e._sentryDebugIds[t] = "cf70dc7c-68f3-40b3-a80f-8c5f387b7d49"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-cf70dc7c-68f3-40b3-a80f-8c5f387b7d49"));
} catch {}
const m = f({
  __name: "facebook",
  setup(e) {
    const { Swal: t } = w();
    u({ meta: [{ name: "robots", content: "noindex, nofollow" }] });
    const { authenticateProvider: i } = l(),
      d = b(),
      a = p(),
      n = g();
    return (
      (async () => {
        try {
          if (await i("facebook", d.query.access_token)) {
            if ((a.reset(), !(await a.isProfileComplete()))) {
              await s("/onboarding");
              return;
            }
            const o = n.getReferer || "/anuncios";
            (n.clearReferer(), await s(o));
          }
        } catch (r) {
          const o =
            r?.response?.data?.error?.details?.error?.message ||
            "Error desconocido durante la autenticación.";
          (t.fire("Error", o, "error"), await s("/login"));
        }
      })(),
      (r, c) => null
    );
  },
});
export { m as default };
//# sourceMappingURL=CEqNMm52.js.map

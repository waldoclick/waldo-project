import {
  aZ as f,
  bw as g,
  bz as p,
  b2 as b,
  cO as m,
  bM as _,
  a_ as w,
  a$ as y,
  b0 as h,
  cN as S,
  cP as r,
  bk as I,
} from "./BK8sApmn.js";
import { u as k } from "./CMM48BjM.js";
import { u as A } from "./CJzzMwWR.js";
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
    (e._sentryDebugIds[o] = "7e621b2d-c2fa-4ccf-9c5b-b14a3ba26ef2"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-7e621b2d-c2fa-4ccf-9c5b-b14a3ba26ef2"));
} catch {}
const v = { class: "page page--provider" },
  x = f({
    __name: "google",
    setup(e) {
      const { Swal: o } = I();
      g({ meta: [{ name: "robots", content: "noindex, nofollow" }] });
      const { authenticateProvider: i } = p(),
        l = b(),
        a = m(),
        n = _(),
        { logInfo: d } = k(),
        { login: u } = A();
      return (
        (async () => {
          try {
            if (await i("google", String(l.query.access_token || ""))) {
              if (
                (d("User logged in successfully with Google."),
                u("google"),
                n.reset(),
                !(await n.isProfileComplete()))
              ) {
                await r("/onboarding");
                return;
              }
              const s = a.getReferer || "/anuncios";
              (a.clearReferer(), await r(s));
            }
          } catch (t) {
            const s =
              t.response?.data?.error?.details?.error?.message ||
              "Error desconocido durante la autenticación.";
            (o.fire("Error", s, "error"), await r("/login"));
          }
        })(),
        (t, c) => (w(), y("div", v, [h(S)]))
      );
    },
  });
export { x as default };
//# sourceMappingURL=B3msVyYH.js.map

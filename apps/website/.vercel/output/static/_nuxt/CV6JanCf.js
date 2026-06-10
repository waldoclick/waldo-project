import {
  aZ as c,
  bu as l,
  bw as d,
  c_ as f,
  a_ as p,
  a$ as b,
  b0 as t,
  cs as g,
  ct as m,
  cK as _,
  cu as v,
  aY as y,
  b9 as n,
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
    a = new e.Error().stack;
  a &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[a] = "e187cf92-0a93-49e7-9ae5-b3869381aa6d"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-e187cf92-0a93-49e7-9ae5-b3869381aa6d"));
} catch {}
const h = { class: "page" },
  I = c({
    __name: "error",
    setup(e) {
      const { $setSEO: a } = l(),
        o = y();
      (a({
        title: "Error en inscripcion PRO",
        description: "Hubo un problema al registrar tu tarjeta en Waldo.click.",
        imageUrl: `${o.public.baseUrl}/share.jpg`,
        url: `${o.public.baseUrl}/pro/error`,
      }),
        d({ meta: [{ name: "robots", content: "noindex, nofollow" }] }));
      const s = f(),
        r = n(() => s.query.reason),
        i = n(() =>
          r.value === "cancelled"
            ? "Inscripcion cancelada"
            : r.value === "rejected"
              ? "Inscripcion rechazada"
              : r.value === "charge-failed"
                ? "Error en el cobro"
                : "Error en la inscripcion",
        ),
        u = n(() =>
          r.value === "cancelled"
            ? "Cancelaste el registro de tu tarjeta. Puedes intentarlo nuevamente desde tu cuenta."
            : r.value === "rejected"
              ? "No se pudo registrar tu tarjeta. Verifica los datos e intenta nuevamente."
              : r.value === "charge-failed"
                ? "Tu tarjeta fue registrada pero no se pudo realizar el cobro del primer mes. Puedes intentarlo nuevamente desde tu cuenta."
                : "Ocurrio un problema al registrar tu tarjeta. Por favor, intenta de nuevo mas tarde.",
        );
      return (j, w) => (
        p(),
        b("div", h, [
          t(g, { "show-search": !0 }),
          t(m),
          t(
            _,
            { type: "fail", title: i.value, description: u.value },
            null,
            8,
            ["title", "description"],
          ),
          t(v),
        ])
      );
    },
  });
export { I as default };
//# sourceMappingURL=CV6JanCf.js.map

import {
  aZ as d,
  bu as p,
  bw as f,
  c_ as b,
  bm as m,
  a_ as g,
  a$ as _,
  b0 as o,
  cs as v,
  ct as y,
  cK as h,
  cu as w,
  aY as D,
  b9 as n,
} from "./BK8sApmn.js";
import { u as E } from "./CJzzMwWR.js";
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
    (e._sentryDebugIds[a] = "1cca0c97-b3b9-4866-9df7-55dd6aa50170"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-1cca0c97-b3b9-4866-9df7-55dd6aa50170"));
} catch {}
const k = { class: "page" },
  j = d({
    __name: "error",
    setup(e) {
      const { $setSEO: a, $setStructuredData: c } = p(),
        t = D();
      (a({
        title: "Error al Crear Anuncio",
        description:
          "Hubo un problema al intentar crear tu anuncio en Waldo.click®. Por favor, revisa los datos e inténtalo nuevamente.",
        imageUrl: `${t.public.baseUrl}/share.jpg`,
        url: `${t.public.baseUrl}/pagar/error`,
      }),
        f({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        c({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Error al Crear Anuncio - Waldo.click®",
          url: `${t.public.baseUrl}/pagar/error`,
          description:
            "Hubo un problema al intentar crear tu anuncio en Waldo.click®. Por favor, revisa los datos e inténtalo nuevamente.",
        }));
      const u = b(),
        r = n(() => u.query.reason),
        l = n(() =>
          r.value === "cancelled"
            ? "Pago cancelado"
            : r.value === "rejected"
              ? "Pago rechazado"
              : "Ha ocurrido un error",
        ),
        s = n(() =>
          r.value === "cancelled"
            ? "Cancelaste el proceso de pago. Puedes intentarlo nuevamente cuando quieras."
            : r.value === "rejected"
              ? "Tu pago fue rechazado por Webpay. Verifica los datos de tu tarjeta e intenta nuevamente."
              : "Ocurrió un problema al procesar tu solicitud. Estamos trabajando para solucionarlo. Por favor, intenta de nuevo más tarde.",
        ),
        i = E();
      return (
        m(() => {
          i.sendErrorEvent("ad_creation_error", s.value);
        }),
        (P, $) => (
          g(),
          _("div", k, [
            o(v, { "show-search": !0 }),
            o(y),
            o(
              h,
              { type: "fail", title: l.value, description: s.value },
              null,
              8,
              ["title", "description"],
            ),
            o(w),
          ])
        )
      );
    },
  });
export { j as default };
//# sourceMappingURL=BW_4Zb2E.js.map

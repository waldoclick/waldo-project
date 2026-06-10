import {
  bu as s,
  bm as n,
  a_ as c,
  a$ as i,
  b0 as a,
  cs as l,
  ct as d,
  cK as u,
  cu as p,
} from "./BK8sApmn.js";
import { u as f } from "./CJzzMwWR.js";
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
    r = new e.Error().stack;
  r &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[r] = "0cf2ac44-657d-4827-985e-c330fe094f91"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-0cf2ac44-657d-4827-985e-c330fe094f91"));
} catch {}
const b = { class: "page" },
  g = {
    __name: "error",
    setup(e) {
      const { $setSEO: r, $setStructuredData: o } = s();
      (r({
        title: "Error al Crear Aviso",
        description:
          "Hubo un problema al intentar crear tu aviso en Waldo.click®. Por favor, revisa los datos e inténtalo nuevamente.",
        imageUrl: "https://waldo.click/share.jpg",
        url: "https://waldo.click/error-crear-aviso",
      }),
        o({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Error al Crear Aviso - Waldo.click®",
          url: "https://waldo.click/error-crear-aviso",
          description:
            "Hubo un problema al intentar crear tu aviso en Waldo.click®. Por favor, revisa los datos e inténtalo nuevamente.",
        }));
      const t = f();
      return (
        n(() => {
          t.sendErrorEvent(
            "ad_creation_error",
            "Ocurrió un problema al procesar tu solicitud",
          );
        }),
        (m, _) => (
          c(),
          i("div", b, [
            a(l, { "show-search": !0 }),
            a(d),
            a(u, {
              type: "fail",
              title: "Ha ocurrido un error",
              description:
                "Ocurrió un problema al procesar tu solicitud. Estamos trabajando para solucionarlo. Por favor, intenta de nuevo más tarde.",
            }),
            a(p),
          ])
        )
      );
    },
  };
export { g as default };
//# sourceMappingURL=COPmwB4I.js.map

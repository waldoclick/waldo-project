import {
  bu as o,
  a_ as n,
  a$ as s,
  b0 as a,
  cs as c,
  ct as l,
  cK as u,
  cu as d,
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
    (e._sentryDebugIds[t] = "03132c7c-d508-40ba-b168-d4c9d8fab6e1"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-03132c7c-d508-40ba-b168-d4c9d8fab6e1"));
} catch {}
const p = { class: "page" },
  _ = {
    __name: "error",
    setup(e) {
      const { $setSEO: t, $setStructuredData: r } = o();
      return (
        t({
          title: "Error en el Pago",
          description:
            "Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.",
          imageUrl: "https://waldo.click/share.jpg",
          url: "https://waldo.click/packs/error",
        }),
        r({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Error en el Pago - Waldo.click®",
          url: "https://waldo.click/packs/error",
          description:
            "Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.",
        }),
        (i, b) => (
          n(),
          s("div", p, [
            a(c, { "show-search": !0 }),
            a(l),
            a(u, {
              type: "fail",
              title: "Error en el pago",
              description:
                "Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.",
              button_label: "Volver a intentar",
              button_link: "/packs",
              button_show: !0,
            }),
            a(d),
          ])
        )
      );
    },
  };
export { _ as default };
//# sourceMappingURL=NvzCjsM-.js.map

import {
  aZ as r,
  bu as c,
  cO as i,
  cv as l,
  a_ as d,
  a$ as p,
  b0 as u,
  cK as b,
  aY as g,
} from "./BK8sApmn.js";
import { u as m } from "./CJzzMwWR.js";
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
    (e._sentryDebugIds[a] = "3475fa03-4a89-4750-9645-43ed6463813b"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-3475fa03-4a89-4750-9645-43ed6463813b"));
} catch {}
const f = { class: "page" },
  $ = r({
    __name: "gracias",
    setup(e) {
      const { $setSEO: a, $setStructuredData: o } = c(),
        s = g(),
        t = i(),
        { generateLead: n } = m();
      return (
        t.getContactFormSent ||
          l({
            statusCode: 404,
            message: "Página no encontrada",
            statusMessage: "La página que intentas acceder no existe",
          }),
        n(),
        t.clearContactFormSent(),
        a({
          title: "Gracias por contactarnos",
          description:
            "Hemos recibido tu mensaje. Te responderemos lo antes posible. Gracias por confiar en Waldo.click®.",
          imageUrl: `${s.public.baseUrl}/thanks-share.jpg`,
          url: `${s.public.baseUrl}/gracias`,
        }),
        o({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Gracias por contactarnos",
          url: `${s.public.baseUrl}/gracias`,
          description:
            "Hemos recibido tu mensaje. Gracias por confiar en nosotros.",
        }),
        (_, y) => (
          d(),
          p("div", f, [
            u(b, {
              type: "success",
              title: "¡Gracias!, Hemos recibido tu mensaje.",
              description:
                "Nos pondremos en contacto contigo a la brevedad posible. Revisa tu correo electrónico para más detalles.",
              button_show: !0,
              button_label: "Volver al inicio",
              button_link: "/",
            }),
          ])
        )
      );
    },
  });
export { $ as default };
//# sourceMappingURL=Cib8qxsy.js.map

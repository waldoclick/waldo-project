import { u as i, F as l } from "./DWOKIegE.js";
import {
  aZ as p,
  bu as d,
  b4 as b,
  a_ as f,
  b5 as m,
  b6 as g,
  aY as y,
  ba as _,
} from "./BK8sApmn.js";
import "./SVS4z4K_.js";
import "./DmUMncXv.js";
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
    s = new e.Error().stack;
  s &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[s] = "30b81a3c-994b-4a8e-8fb9-df6085f6a6bd"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-30b81a3c-994b-4a8e-8fb9-df6085f6a6bd"));
} catch {}
const x = p({
  __name: "preguntas-frecuentes",
  async setup(e) {
    let s, r;
    const { $setSEO: o, $setStructuredData: c } = d(),
      a = y(),
      n = i(),
      { data: u } =
        (([s, r] = b(async () =>
          _("faqs", async () => (await n.loadFaqs(), n.faqs || []), {
            immediate: !0,
            server: !0,
          }),
        )),
        (s = await s),
        r(),
        s);
    return (
      o({
        title: "Preguntas Frecuentes sobre Anuncios",
        description:
          "Resuelve tus dudas sobre cómo publicar y comprar anuncios de activos industriales en Waldo.click®. Respuestas rápidas sobre packs, pagos y más.",
        imageUrl: `${a.public.baseUrl}/share.jpg`,
        url: `${a.public.baseUrl}/preguntas-frecuentes`,
      }),
      c({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        name: "Preguntas Frecuentes sobre Anuncios",
        description:
          "Resuelve tus dudas sobre cómo publicar y comprar anuncios de activos industriales en Waldo.click®. Respuestas rápidas sobre packs, pagos y más.",
        url: `${a.public.baseUrl}/preguntas-frecuentes`,
        mainEntity: (u.value || []).map((t) => ({
          "@type": "Question",
          name: t.title,
          acceptedAnswer: { "@type": "Answer", text: t.text },
        })),
      }),
      (t, w) => (
        f(),
        m(
          l,
          {
            title: "Preguntas Frecuentes",
            text: "Encuentra respuestas a las preguntas más comunes sobre cómo funciona Waldo.click®, la plataforma para comprar y vender activos industriales.",
            "is-left": !0,
            "title-tag": "h1",
            faqs: g(u) || [],
          },
          null,
          8,
          ["faqs"],
        )
      )
    );
  },
});
export { x as default };
//# sourceMappingURL=CdsTpem3.js.map

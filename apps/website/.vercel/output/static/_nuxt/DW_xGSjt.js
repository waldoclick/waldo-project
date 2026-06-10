import { A as p } from "./SVS4z4K_.js";
import {
  aZ as r,
  a_ as d,
  a$ as f,
  bf as o,
  b0 as _,
  bJ as b,
  b3 as m,
  b8 as c,
  bu as g,
  b4 as y,
  b5 as v,
  b6 as h,
  aY as P,
  ba as w,
} from "./BK8sApmn.js";
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
    a = new e.Error().stack;
  a &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[a] = "94dc22ab-905a-45fc-92de-458fe27c7031"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-94dc22ab-905a-45fc-92de-458fe27c7031"));
} catch {}
const A = { class: "policies policies--default" },
  D = { class: "policies--default__container" },
  k = { class: "policies--default__faq" },
  E = r({
    __name: "PoliciesDefault",
    props: { policies: {} },
    setup(e) {
      return (a, s) => (
        d(),
        f("section", A, [
          o("div", D, [
            s[0] ||
              (s[0] = o(
                "h1",
                { class: "policies--default__title title" },
                "Políticas de privacidad",
                -1,
              )),
            s[1] ||
              (s[1] = o(
                "div",
                { class: "policies--default__hero" },
                [
                  o(
                    "div",
                    { class: "policies--default__hero__text paragraph" },
                    [
                      o(
                        "p",
                        null,
                        ' Servicio en línea el anuncio de Activos Industriales Nuevos y/o Usados, sean estos, Equipos, Vehículos industriales, Repuestos, Insumos, a través del sitio web Waldo.click® (en adelante "Servicio de Marketing en línea"). Para utilizar y registrarse en Waldo.click®, le pedimos considere los siguientes puntos: ',
                      ),
                    ],
                  ),
                ],
                -1,
              )),
            o("div", k, [
              _(p, { questions: e.policies }, null, 8, ["questions"]),
            ]),
          ]),
        ])
      );
    },
  }),
  S = Object.assign(E, { __name: "PoliciesDefault" }),
  I = 50,
  x = b("policies", () => {
    const e = c([]),
      a = c(!1),
      s = c(null),
      l = m();
    return {
      policies: e,
      loading: a,
      error: s,
      loadPolicies: async () => {
        try {
          ((a.value = !0), (s.value = null));
          const i = await l("policies", {
            method: "GET",
            params: {
              pagination: { pageSize: I, page: 1 },
              sort: ["order:asc"],
            },
          });
          if (!i.data || !Array.isArray(i.data))
            throw new Error("Formato de datos invalido");
          e.value = i.data;
        } catch {
          s.value = "Error al cargar las politicas";
        } finally {
          a.value = !1;
        }
      },
    };
  }),
  B = r({
    __name: "politicas-de-privacidad",
    async setup(e) {
      let a, s;
      const { $setSEO: l, $setStructuredData: n } = g(),
        t = P(),
        i = x(),
        { data: u } =
          (([a, s] = y(async () =>
            w(
              "policies",
              async () => (await i.loadPolicies(), i.policies || []),
              { default: () => [], immediate: !0, server: !0 },
            ),
          )),
          (a = await a),
          s(),
          a);
      return (
        l({
          title: "Políticas de Privacidad",
          description:
            "Conoce cómo Waldo.click® protege tu información personal al publicar y comprar anuncios de activos industriales en nuestra plataforma.",
          imageUrl: `${t.public.baseUrl}/share.jpg`,
          url: `${t.public.baseUrl}/politicas-de-privacidad`,
        }),
        n({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Políticas de Privacidad",
          description:
            "Conoce cómo Waldo.click® protege tu información personal al publicar y comprar anuncios de activos industriales en nuestra plataforma.",
          url: `${t.public.baseUrl}/politicas-de-privacidad`,
        }),
        ($, C) => (d(), v(S, { policies: h(u) || [] }, null, 8, ["policies"]))
      );
    },
  });
export { B as default };
//# sourceMappingURL=DW_xGSjt.js.map

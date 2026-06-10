import { A as m } from "./SVS4z4K_.js";
import {
  aZ as c,
  a_ as d,
  a$ as p,
  bf as o,
  b0 as f,
  bJ as _,
  b3 as b,
  b8 as i,
  bu as y,
  b4 as g,
  b5 as v,
  b6 as h,
  aY as w,
  ba as A,
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
    s = new e.Error().stack;
  s &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[s] = "6f59696f-402d-458f-9f89-b5b1b039e573"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-6f59696f-402d-458f-9f89-b5b1b039e573"));
} catch {}
const D = { class: "terms terms--default" },
  T = { class: "terms--default__container" },
  E = { class: "terms--default__faq" },
  k = c({
    __name: "TermsDefault",
    props: { terms: {} },
    setup(e) {
      return (s, a) => (
        d(),
        p("section", D, [
          o("div", T, [
            a[0] ||
              (a[0] = o(
                "h1",
                { class: "terms--default__title title" },
                "Condiciones de uso",
                -1,
              )),
            a[1] ||
              (a[1] = o(
                "div",
                { class: "terms--default__hero" },
                [
                  o("div", { class: "terms--default__hero__text paragraph" }, [
                    o(
                      "p",
                      null,
                      " Al utilizar la plataforma Waldo.click® para la publicación y compra de anuncios de activos industriales, usted acepta las siguientes condiciones de uso: ",
                    ),
                  ]),
                ],
                -1,
              )),
            o("div", E, [f(m, { questions: e.terms }, null, 8, ["questions"])]),
          ]),
        ])
      );
    },
  }),
  x = Object.assign(k, { __name: "TermsDefault" }),
  C = 50,
  S = _("terms", () => {
    const e = i([]),
      s = i(!1),
      a = i(null),
      n = b();
    return {
      terms: e,
      loading: s,
      error: a,
      loadTerms: async () => {
        try {
          ((s.value = !0), (a.value = null));
          const t = await n("terms", {
            method: "GET",
            params: {
              pagination: { pageSize: C, page: 1 },
              sort: ["order:asc"],
            },
          });
          if (!t.data || !Array.isArray(t.data))
            throw new Error("Formato de datos invalido");
          e.value = t.data;
        } catch {
          a.value = "Error al cargar los terminos";
        } finally {
          s.value = !1;
        }
      },
    };
  }),
  W = c({
    __name: "condiciones-de-uso",
    async setup(e) {
      let s, a;
      const { $setSEO: n, $setStructuredData: l } = y(),
        r = w(),
        t = S(),
        { data: u } =
          (([s, a] = g(async () =>
            A("terms", async () => (await t.loadTerms(), t.terms || []), {
              default: () => [],
              immediate: !0,
              server: !0,
            }),
          )),
          (s = await s),
          a(),
          s);
      return (
        n({
          title: "Condiciones de Uso",
          description:
            "Revisa las condiciones de uso de Waldo.click® para la publicación y compra de anuncios de activos industriales en nuestra plataforma.",
          imageUrl: `${r.public.baseUrl}/share.jpg`,
          url: `${r.public.baseUrl}/condiciones-de-uso`,
        }),
        l({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Condiciones de Uso",
          description:
            "Revisa las condiciones de uso de Waldo.click® para la publicación y compra de anuncios de activos industriales en nuestra plataforma.",
          url: `${r.public.baseUrl}/condiciones-de-uso`,
        }),
        ($, I) => (d(), v(x, { terms: h(u) || [] }, null, 8, ["terms"]))
      );
    },
  });
export { W as default };
//# sourceMappingURL=Czmsze_R.js.map

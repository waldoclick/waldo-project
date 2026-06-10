import {
  bu as _,
  c_ as g,
  c$ as y,
  b4 as b,
  ba as h,
  cr as $,
  be as N,
  a_ as p,
  a$ as I,
  b0 as n,
  cs as C,
  ct as E,
  b6 as c,
  b5 as F,
  cK as w,
  b7 as O,
  cu as P,
  cv as x,
} from "./BK8sApmn.js";
import { u as l } from "./BtaW-tYT.js";
try {
  let r =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    a = new r.Error().stack;
  a &&
    ((r._sentryDebugIds = r._sentryDebugIds || {}),
    (r._sentryDebugIds[a] = "4e6faf32-9420-4dcc-8394-2616778fb238"),
    (r._sentryDebugIdIdentifier =
      "sentry-dbid-4e6faf32-9420-4dcc-8394-2616778fb238"));
} catch {}
const D = { class: "page" },
  H = {
    __name: "gracias",
    async setup(r) {
      let a, i;
      const { $setSEO: d, $setStructuredData: m } = _(),
        u = g();
      (l(), y());
      const o = (e) =>
          new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(e),
        f = (e) => {
          const t = {
              INVALID_URL: {
                message: "Pack no encontrado",
                description: "No pudimos encontrar el pack que buscas",
              },
              NOT_FOUND: {
                message: "Pack no encontrado",
                description: "No pudimos encontrar el pack que buscas",
              },
            },
            k = t[e] || t.NOT_FOUND;
          x({ statusCode: 404, ...k });
        },
        {
          data: s,
          pending: L,
          error: U,
        } = (([a, i] = b(async () =>
          h(
            "packData",
            async () => {
              if (!u.query.pack) return { error: "INVALID_URL" };
              const t = await l().getPackById(u.query.pack);
              return t || { error: "NOT_FOUND" };
            },
            { server: !0, lazy: !1 },
          ),
        )),
        (a = await a),
        i(),
        a);
      return (
        $(() => {
          s.value?.error && f(s.value.error);
        }),
        N(s, (e) => {
          e &&
            (d({
              title: `Gracias por tu Compra - ${e.name}`,
              description: `Has comprado el pack ${e.name} por ${o(e.price)}. Este pack incluye ${e.ads_count} anuncios.`,
              imageUrl: "https://waldo.click/share.jpg",
              url: `https://waldo.click/packs/gracias?pack=${e.id}`,
            }),
            m({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: `Gracias por tu Compra - ${e.name} - Waldo.click®`,
              url: `https://waldo.click/packs/gracias?pack=${e.id}`,
              description: `Has comprado el pack ${e.name} por ${o(e.price)}. Este pack incluye ${e.ads_count} anuncios.`,
            }));
        }),
        (e, t) => (
          p(),
          I("div", D, [
            n(C, { "show-search": !0 }),
            n(E),
            c(s)
              ? (p(),
                F(
                  w,
                  {
                    key: 0,
                    type: "success",
                    title: "¡Gracias por tu compra!",
                    description: `Has comprado el pack <strong>${c(s).name}</strong> por <strong>${o(c(s).price)}</strong>. Este pack incluye <strong>${c(s).total_ads}</strong> anuncios.`,
                    button_label: "Crear un anuncio",
                    button_link: "/anunciar",
                    button_show: !0,
                  },
                  null,
                  8,
                  ["description"],
                ))
              : O("", !0),
            n(P),
          ])
        )
      );
    },
  };
export { H as default };
//# sourceMappingURL=Nst44_Uo.js.map

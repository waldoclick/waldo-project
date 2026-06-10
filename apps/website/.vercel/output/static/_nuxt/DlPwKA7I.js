import { P as h } from "./DeJqzbk_.js";
import {
  aZ as d,
  a_ as c,
  a$ as r,
  bf as n,
  bi as l,
  b7 as g,
  b0 as s,
  b3 as k,
  b4 as y,
  bu as D,
  bw as w,
  cs as x,
  cu as v,
  b9 as P,
  aY as $,
  ba as A,
} from "./BK8sApmn.js";
import { P as E } from "./BK53MP7p.js";
import "./JxRx1s6n.js";
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
    (e._sentryDebugIds[t] = "30e94211-ed08-49a6-ad43-8f67f7e583b6"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-30e94211-ed08-49a6-ad43-8f67f7e583b6"));
} catch {}
const C = { class: "hero hero--default" },
  H = { class: "hero--default__container" },
  I = { class: "hero--default__title title title--big" },
  j = { key: 0, class: "hero--default__text" },
  N = { class: "hero--default__bg" },
  U = d({
    __name: "HeroDefault",
    props: { title: {}, description: {} },
    setup(e) {
      return (t, a) => (
        c(),
        r("section", C, [
          n("div", H, [
            n("h1", I, l(e.title), 1),
            e.description ? (c(), r("p", j, l(e.description), 1)) : g("", !0),
          ]),
          n("div", N, [s(h)]),
        ])
      );
    },
  }),
  B = Object.assign(U, { __name: "HeroDefault" }),
  S = { class: "page" },
  F = d({
    __name: "index",
    async setup(e) {
      let t, a;
      const u = k(),
        { data: p } =
          (([t, a] = y(async () =>
            A(
              "packs-page-packs",
              async () => {
                try {
                  return (
                    await u("ad-packs", {
                      method: "GET",
                      params: { populate: "*" },
                    })
                  ).data;
                } catch {
                  return [];
                }
              },
              { default: () => [] },
            ),
          )),
          (t = await t),
          a(),
          t),
        _ = P(() => p.value ?? []),
        o = $(),
        { $setSEO: f, $setStructuredData: b } = D();
      return (
        f({
          title: "Packs de Avisos",
          description:
            "Elige el pack de avisos que mejor se adapte a tus necesidades. Publica más anuncios y llega a más compradores en Waldo.click®.",
          imageUrl: `${o.public.baseUrl}/share.jpg`,
          url: `${o.public.baseUrl}/packs`,
        }),
        b({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Packs de Avisos — Waldo.click®",
          description:
            "Elige el pack de avisos que mejor se adapte a tus necesidades.",
          url: `${o.public.baseUrl}/packs`,
        }),
        w({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        (i, T) => {
          const m = B;
          return (
            c(),
            r("div", S, [
              s(x, { "is-trasparent": "true", "show-search": !0 }),
              s(m, { title: "Packs" }),
              s(E, { packs: _.value }, null, 8, ["packs"]),
              s(v),
            ])
          );
        }
      );
    },
  });
export { F as default };
//# sourceMappingURL=DlPwKA7I.js.map

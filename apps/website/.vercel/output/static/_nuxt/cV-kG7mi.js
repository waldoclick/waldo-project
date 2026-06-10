import { _ as p } from "./e4c2LLW0.js";
import {
  a_ as i,
  a$ as s,
  bf as o,
  b0 as r,
  aZ as m,
  bu as f,
  bv as _,
  b4 as b,
  bw as g,
  aY as y,
  ba as h,
} from "./BK8sApmn.js";
import { u as w } from "./D_gKzRlW.js";
import "./BQLSJJto.js";
import "./BWjFl-iO.js";
import "./CMM48BjM.js";
import "./Ce4MZUPb.js";
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
    (e._sentryDebugIds[t] = "83c5d1bd-9339-4a9e-9f0b-8efe24c93758"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-83c5d1bd-9339-4a9e-9f0b-8efe24c93758"));
} catch {}
const x = {
    class: "account account--edit",
    "aria-labelledby": "profile-edit-title",
  },
  C = {
    class: "account--edit__form",
    "aria-describedby": "profile-edit-title",
  },
  E = {
    __name: "AccountEdit",
    setup(e) {
      return (t, a) => (
        i(),
        s("section", x, [
          a[0] ||
            (a[0] = o(
              "div",
              { class: "account--edit__header" },
              [
                o(
                  "h1",
                  {
                    id: "profile-edit-title",
                    class: "account--edit__title title",
                  },
                  " Completa tu perfil ",
                ),
                o("div", { class: "account--edit__text paragraph" }, [
                  o(
                    "p",
                    null,
                    " ¡Haz que tu perfil brille! Completa tu información personal para que otros usuarios puedan conocerte mejor. Cuanto más completa esté tu información, más confianza generarás en la comunidad de Waldo.click®. ",
                  ),
                ]),
              ],
              -1,
            )),
          o("div", C, [r(p)]),
        ])
      );
    },
  },
  $ = { class: "page" },
  B = m({
    __name: "editar",
    async setup(e) {
      let t, a;
      const { $setSEO: c, $setStructuredData: l } = f(),
        n = y(),
        d = w(),
        u = _();
      return (
        ([t, a] = b(async () =>
          h("perfil-editar-regions-communes", async () => {
            (await d.loadRegions(), await u.loadCommunes());
          }),
        )),
        await t,
        a(),
        c({
          title: "Editar Perfil",
          description:
            "Edita tu perfil en Waldo.click®. Actualiza tu información personal y mantén tus datos al día.",
          imageUrl: `${n.public.baseUrl}/share.jpg`,
          url: `${n.public.baseUrl}/cuenta/perfil/editar`,
        }),
        g({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        l({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Editar Perfil",
          url: `${n.public.baseUrl}/cuenta/perfil/editar`,
          description:
            "Edita tu perfil en Waldo.click®. Actualiza tu información personal y mantén tus datos al día.",
        }),
        (k, A) => (i(), s("div", $, [r(E)]))
      );
    },
  });
export { B as default };
//# sourceMappingURL=cV-kG7mi.js.map

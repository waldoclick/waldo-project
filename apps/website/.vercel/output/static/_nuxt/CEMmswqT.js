import {
  a_ as c,
  a$ as d,
  bf as s,
  b0 as o,
  b6 as b,
  cq as f,
  bi as _,
  b1 as h,
  b7 as m,
  bF as y,
  aZ as g,
  bu as v,
  bw as w,
  bx as x,
  bz as C,
  b4 as p,
  cs as T,
  ct as k,
  b5 as D,
  cu as S,
  aY as $,
  b9 as I,
  cP as N,
} from "./BK8sApmn.js";
import { _ as O } from "./C7SjWCbw.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
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
    (e._sentryDebugIds[t] = "2a3ac71b-1608-4e55-a51a-9db33806a0e4"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-2a3ac71b-1608-4e55-a51a-9db33806a0e4"));
} catch {}
const P = { class: "resume resume--pro" },
  R = { class: "resume--pro__container" },
  U = { class: "resume--pro__header" },
  j = { class: "resume--pro__header__icon" },
  B = { class: "resume--pro__header__title title" },
  A = { class: "resume--pro__header__description paragraph" },
  E = { key: 0, class: "resume--pro__box" },
  F = { class: "resume--pro__details" },
  H = { class: "resume--pro__grid" },
  V = {
    __name: "ResumeProCard",
    props: {
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      summary: { type: Object, default: () => null },
    },
    setup(e) {
      return (t, a) => {
        const r = O,
          i = y;
        return (
          c(),
          d("section", P, [
            s("div", R, [
              s("div", U, [
                s("div", j, [o(b(f), { size: 24 })]),
                s("h1", B, _(e.title), 1),
                s("p", A, _(e.description), 1),
              ]),
              o(i, null, {
                default: h(() => [
                  e.summary
                    ? (c(),
                      d("div", E, [
                        a[0] ||
                          (a[0] = s(
                            "div",
                            { class: "resume--pro__subtitle" },
                            [
                              s(
                                "h2",
                                { class: "resume--pro__subtitle__title" },
                                "Tarjeta registrada",
                              ),
                            ],
                            -1,
                          )),
                        s("div", F, [
                          s("div", H, [
                            o(
                              r,
                              {
                                title: "Tipo de tarjeta",
                                description:
                                  e.summary.cardType || "No disponible",
                              },
                              null,
                              8,
                              ["description"],
                            ),
                            o(
                              r,
                              {
                                title: "Ultimos 4 digitos",
                                description:
                                  e.summary.cardLast4 || "No disponible",
                              },
                              null,
                              8,
                              ["description"],
                            ),
                          ]),
                        ]),
                      ]))
                    : m("", !0),
                ]),
                _: 1,
              }),
            ]),
          ])
        );
      };
    },
  },
  z = { class: "page" },
  G = g({
    __name: "gracias",
    async setup(e) {
      let t, a;
      const { $setSEO: r } = v(),
        i = $();
      (r({
        title: "Suscripcion PRO Confirmada",
        description:
          "Tu suscripcion PRO ha sido activada exitosamente en Waldo.click.",
        imageUrl: `${i.public.baseUrl}/share.jpg`,
        url: `${i.public.baseUrl}/pro/gracias`,
      }),
        w({ meta: [{ name: "robots", content: "noindex, nofollow" }] }));
      const n = x();
      {
        const { fetchUser: l } = C();
        (([t, a] = p(() => l())), await t, a());
      }
      n.value?.pro_status !== "active" &&
        (([t, a] = p(() => N("/cuenta"))), await t, a());
      const u = I(() =>
        n.value
          ? {
              cardType: n.value.pro_card_type,
              cardLast4: n.value.pro_card_last4,
            }
          : null,
      );
      return (l, L) => (
        c(),
        d("div", z, [
          o(T, { "show-search": !0 }),
          o(k),
          u.value
            ? (c(),
              D(
                V,
                {
                  key: 0,
                  title: "Tu suscripcion PRO esta activa",
                  description:
                    "Tu tarjeta ha sido registrada exitosamente. Ya puedes disfrutar de todos los beneficios PRO.",
                  "show-icon": !0,
                  summary: u.value,
                },
                null,
                8,
                ["summary"],
              ))
            : m("", !0),
          o(S),
        ])
      );
    },
  });
export { G as default };
//# sourceMappingURL=CEMmswqT.js.map

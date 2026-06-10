import {
  aZ as P,
  bb as T,
  cF as x,
  a_ as s,
  a$ as c,
  bC as h,
  bf as n,
  bi as _,
  b7 as b,
  b9 as i,
  cW as v,
  b0 as D,
  bF as w,
  b1 as L,
  bn as g,
  bo as $,
  b5 as B,
} from "./BK8sApmn.js";
import { u as C } from "./JxRx1s6n.js";
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
    (e._sentryDebugIds[t] = "aa811f3e-0ad1-48b4-88c5-139cf9e840bc"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-aa811f3e-0ad1-48b4-88c5-139cf9e840bc"));
} catch {}
const I = { class: "card--pack__price" },
  N = { key: 0, class: "saving" },
  S = { key: 1, class: "saving" },
  z = { class: "price" },
  F = { key: 0, class: "card--pack__description" },
  H = ["innerHTML"],
  M = { class: "card--pack__link" },
  j = P({
    __name: "CardPack",
    props: { pack: {}, allPacks: {} },
    setup(e) {
      const t = e,
        d = T(),
        u = x(),
        { sanitizeText: p } = v(),
        { getPackBadgeText: r, getPackDescription: k } = C(),
        f = async (a) => {
          (u.updatePack(a), d.push("/pagar"));
        },
        m = (a) =>
          new Intl.NumberFormat("es-CL", {
            style: "currency",
            currency: "CLP",
          }).format(a),
        l = i(() => r(t.pack, t.allPacks)),
        o = i(() => {
          const a = k(t.pack, t.allPacks).split(`
`);
          return (
            a.length > 0 && (a[0] = `<strong>${a[0]}</strong>`),
            p(a.join("<br>"))
          );
        });
      return (a, y) => (
        s(),
        c(
          "article",
          {
            class: h([
              "card card--pack",
              e.pack.recommended ? "recommended" : "",
            ]),
          },
          [
            n("div", I, [
              l.value
                ? (s(), c("span", N, _(l.value), 1))
                : (s(), c("span", S, "No hay oferta")),
              n("span", z, _(e.pack.quantity) + " x " + _(m(e.pack.price)), 1),
            ]),
            o.value
              ? (s(),
                c("div", F, [n("span", { innerHTML: o.value }, null, 8, H)]))
              : b("", !0),
            n("div", M, [
              n(
                "button",
                {
                  type: "button",
                  class: "btn btn--buy",
                  title: "Comprar",
                  onClick: y[0] || (y[0] = (R) => f(e.pack.id)),
                },
                " Comprar ",
              ),
            ]),
          ],
          2,
        )
      );
    },
  }),
  V = Object.assign(j, { __name: "CardPack" }),
  E = { class: "packs--default__container" },
  O = ["innerHTML"],
  q = { class: "packs--default__list" },
  A = P({
    __name: "PacksDefault",
    props: { separator: { type: Boolean }, packs: {} },
    setup(e) {
      const t = e,
        d = t.separator ?? !1,
        { sanitizeText: u } = v(),
        { getPacksPageTitle: p } = C(),
        r = i(() => u(p(t.packs))),
        k = i(() => (d ? "is-separator" : ""));
      return (f, m) => {
        const l = w;
        return (
          s(),
          c(
            "section",
            {
              id: "comprar-packs",
              class: h(["packs packs--default", k.value]),
            },
            [
              n("div", E, [
                r.value
                  ? (s(),
                    c(
                      "h2",
                      {
                        key: 0,
                        class: "packs--default__title title",
                        innerHTML: r.value,
                      },
                      null,
                      8,
                      O,
                    ))
                  : b("", !0),
                n("div", q, [
                  D(l, null, {
                    default: L(() => [
                      (s(!0),
                      c(
                        g,
                        null,
                        $(
                          e.packs,
                          (o, a) => (
                            s(),
                            c(
                              g,
                              { key: a },
                              [
                                o.total_ads > 1
                                  ? (s(),
                                    B(
                                      V,
                                      { key: 0, pack: o, "all-packs": e.packs },
                                      null,
                                      8,
                                      ["pack", "all-packs"],
                                    ))
                                  : b("", !0),
                              ],
                              64,
                            )
                          ),
                        ),
                        128,
                      )),
                    ]),
                    _: 1,
                  }),
                ]),
              ]),
            ],
            2,
          )
        );
      };
    },
  }),
  G = Object.assign(A, { __name: "PacksDefault" });
export { G as P };
//# sourceMappingURL=BK53MP7p.js.map

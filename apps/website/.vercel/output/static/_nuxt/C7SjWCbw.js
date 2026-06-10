import {
  cx as y,
  bE as h,
  a_ as t,
  a$ as o,
  bf as g,
  bi as a,
  b0 as n,
  b1 as l,
  bG as f,
  b6 as u,
  b7 as _,
  bF as m,
  bC as b,
} from "./BK8sApmn.js";
import { I as k } from "./BZsGLQuR.js";
import { C as x } from "./Db0x1g0W.js";
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
    i = new e.Error().stack;
  i &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[i] = "1e63cefc-5996-4af6-8062-bb570460863f"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-1e63cefc-5996-4af6-8062-bb570460863f"));
} catch {}
const C = { class: "card card--info" },
  w = { class: "card--info__title" },
  T = { key: 0, class: "card--info__description" },
  v = { key: 0 },
  I = ["href", "title"],
  B = ["title"],
  D = { key: 1, class: "card--info__description" },
  V = {
    __name: "CardInfo",
    props: {
      title: { type: String, default: "" },
      description: { type: [String, Number], default: "" },
      link: { type: String, default: "" },
      showCopyButton: { type: Boolean, default: !1 },
      truncateText: { type: Boolean, default: !1 },
      info: { type: String, default: "" },
    },
    setup(e) {
      const i = y(),
        s = e,
        p = () => {
          const c = s.description || s.description;
          (navigator.clipboard.writeText(c),
            i.success("¡Texto copiado al portapapeles!"));
        };
      return (c, S) => {
        const r = m,
          d = h("tooltip");
        return (
          t(),
          o("article", C, [
            g("div", w, a(e.title), 1),
            e.description
              ? (t(),
                o("div", T, [
                  n(r, null, {
                    default: l(() => [
                      e.info
                        ? f((t(), o("button", v, [n(u(k), { size: "18" })])), [
                            [d, e.info],
                          ])
                        : _("", !0),
                    ]),
                    _: 1,
                  }),
                  e.link
                    ? (t(),
                      o(
                        "a",
                        {
                          key: 0,
                          class: b([
                            "card--info__description__text",
                            {
                              "card--info__description__text--truncate":
                                e.truncateText,
                            },
                          ]),
                          href: e.link,
                          title: e.description,
                          target: "_blank",
                          rel: "noopener noreferrer",
                        },
                        a(e.description),
                        11,
                        I,
                      ))
                    : (t(),
                      o(
                        "div",
                        {
                          key: 1,
                          class: b([
                            "card--info__description__text",
                            {
                              "card--info__description__text--truncate":
                                e.truncateText,
                            },
                          ]),
                          title: e.description,
                        },
                        a(e.description),
                        11,
                        B,
                      )),
                  n(r, null, {
                    default: l(() => [
                      e.showCopyButton
                        ? f(
                            (t(),
                            o("button", { key: 0, onClick: p }, [
                              n(u(x), { size: "18" }),
                            ])),
                            [[d, "Copiar al portapapeles"]],
                          )
                        : _("", !0),
                    ]),
                    _: 1,
                  }),
                ]))
              : (t(), o("div", D, "--")),
          ])
        );
      };
    },
  };
export { V as _ };
//# sourceMappingURL=C7SjWCbw.js.map

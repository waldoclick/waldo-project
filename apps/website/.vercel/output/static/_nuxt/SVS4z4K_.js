import {
  aZ as k,
  bm as C,
  a_ as n,
  a$ as r,
  bn as D,
  bo as T,
  b8 as b,
  b9 as I,
  bf as $,
  b5 as A,
  b1 as f,
  bs as B,
  bi as z,
  bS as L,
  b6 as p,
  b0 as _,
  bC as m,
  cR as g,
  bO as y,
  b7 as M,
  cB as N,
  cW as V,
  bB as q,
} from "./BK8sApmn.js";
import { C as K } from "./DmUMncXv.js";
try {
  let a =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    o = new a.Error().stack;
  o &&
    ((a._sentryDebugIds = a._sentryDebugIds || {}),
    (a._sentryDebugIds[o] = "b4f90a29-d72f-46bb-8c67-cdcd393bec65"),
    (a._sentryDebugIdIdentifier =
      "sentry-dbid-b4f90a29-d72f-46bb-8c67-cdcd393bec65"));
} catch {}
const S = {
    class: "accordion",
    role: "region",
    "aria-label": "Acordeón de preguntas",
  },
  W = ["id", "aria-expanded", "aria-controls", "onClick", "onKeydown"],
  E = ["id", "aria-labelledby", "innerHTML"],
  F = k({
    __name: "AccordionDefault",
    props: { questions: {}, titleTag: {} },
    setup(a) {
      const o = a,
        s = b(null),
        l = b(!0),
        v = o.titleTag ?? "h2",
        { sanitizeRich: h } = V(),
        w = I(() =>
          o.questions.map((t) => ({
            ...t,
            text: h(
              t.text.replace(/Waldo\.click®/g, "<strong>Waldo.click®</strong>"),
            ),
          })),
        );
      C(() => {
        o.questions && o.questions.length > 0 && (s.value = 0);
      });
      const c = (t) => {
          ((s.value = s.value === t ? null : t), (l.value = !1));
        },
        i = (t) => s.value === t;
      return (t, H) => (
        n(),
        r("div", S, [
          (n(!0),
          r(
            D,
            null,
            T(
              w.value,
              (d, e) => (
                n(),
                r("div", { key: e, class: "accordion--item" }, [
                  $(
                    "button",
                    {
                      id: `accordion-header-${e}`,
                      class: "accordion--item__head",
                      "aria-expanded": i(e) ? "true" : "false",
                      "aria-controls": `accordion-panel-${e}`,
                      type: "button",
                      onClick: (u) => c(e),
                      onKeydown: [
                        g(
                          y((u) => c(e), ["prevent"]),
                          ["enter"],
                        ),
                        g(
                          y((u) => c(e), ["prevent"]),
                          ["space"],
                        ),
                      ],
                    },
                    [
                      (n(),
                      A(
                        L(p(v)),
                        null,
                        { default: f(() => [B(z(d.title), 1)]), _: 2 },
                        1024,
                      )),
                      _(
                        p(K),
                        {
                          class: m({ rotated: i(e) }),
                          "aria-hidden": "true",
                          size: 20,
                        },
                        null,
                        8,
                        ["class"],
                      ),
                    ],
                    40,
                    W,
                  ),
                  _(
                    N,
                    { name: "accordion" },
                    {
                      default: f(() => [
                        i(e)
                          ? (n(),
                            r(
                              "div",
                              {
                                key: 0,
                                id: `accordion-panel-${e}`,
                                class: m([
                                  "accordion--item__body",
                                  { "no-animation": l.value && e === 0 },
                                ]),
                                role: "region",
                                "aria-labelledby": `accordion-header-${e}`,
                                innerHTML: d.text,
                              },
                              null,
                              10,
                              E,
                            ))
                          : M("", !0),
                      ]),
                      _: 2,
                    },
                    1024,
                  ),
                ])
              ),
            ),
            128,
          )),
        ])
      );
    },
  }),
  j = Object.assign(q(F, [["__scopeId", "data-v-7557754e"]]), {
    __name: "AccordionDefault",
  });
export { j as A };
//# sourceMappingURL=SVS4z4K_.js.map

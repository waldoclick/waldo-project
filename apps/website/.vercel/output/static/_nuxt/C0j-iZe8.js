import {
  aZ as y,
  bm as f,
  be as p,
  a_ as s,
  a$ as b,
  bf as t,
  bG as _,
  cG as g,
  bi as l,
  bs as k,
  b7 as r,
  b5 as u,
  b6 as h,
  bT as v,
  b8 as B,
} from "./BK8sApmn.js";
import { S as w } from "./DrPuZ622.js";
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
    (e._sentryDebugIds[a] = "8cccac9a-71f2-4e2d-9187-34e47826767b"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-8cccac9a-71f2-4e2d-9187-34e47826767b"));
} catch {}
const D = { class: "bar bar--announcement" },
  S = { class: "container container--fluid" },
  x = { class: "bar--announcement__container" },
  T = { class: "bar--announcement__col bar--announcement__col--left" },
  L = ["disabled"],
  C = {
    key: 0,
    class: "bar--announcement__col bar--announcement__col--center",
  },
  I = { class: "bar--announcement__steps" },
  E = { class: "bar--announcement__col bar--announcement__col--right" },
  V = { class: "bar--announcement__actions" },
  $ = ["disabled", "title"],
  A = y({
    __name: "BarAnnouncement",
    props: {
      percentage: { default: 0 },
      currentStep: { default: 1 },
      totalSteps: { default: void 0 },
      showSteps: { type: Boolean, default: !0 },
      summaryText: { default: "" },
      primaryLabel: {},
      primaryDisabled: { type: Boolean, default: !1 },
      primaryLoading: { type: Boolean, default: !1 },
      backDisabled: { type: Boolean, default: !1 },
      showBack: { type: Boolean, default: !0 },
    },
    emits: ["back", "primary"],
    setup(e, { emit: a }) {
      const c = e,
        i = a,
        o = B(null),
        d = () => {
          o.value &&
            o.value.style.setProperty("--progress-width", `${c.percentage}%`);
        };
      return (
        f(d),
        p(
          () => c.percentage,
          () => {
            d();
          },
        ),
        (N, n) => (
          s(),
          b("div", D, [
            t(
              "div",
              {
                ref_key: "progressElement",
                ref: o,
                class: "bar--announcement__percent",
              },
              null,
              512,
            ),
            t("div", S, [
              t("div", x, [
                t("div", T, [
                  _(
                    t(
                      "button",
                      {
                        type: "button",
                        class: "btn btn--secondary btn--block",
                        disabled: e.backDisabled,
                        onClick: n[0] || (n[0] = (m) => i("back")),
                      },
                      [...(n[2] || (n[2] = [t("span", null, "Volver", -1)]))],
                      8,
                      L,
                    ),
                    [[g, e.showBack]],
                  ),
                ]),
                e.showSteps && e.totalSteps
                  ? (s(),
                    b("div", C, [
                      t("div", I, [
                        t("b", null, l(e.currentStep), 1),
                        k(" de " + l(e.totalSteps), 1),
                      ]),
                    ]))
                  : r("", !0),
                t("div", E, [
                  t("div", V, [
                    e.summaryText
                      ? (s(),
                        u(
                          w,
                          {
                            key: 0,
                            title: "Tipo de anuncio",
                            text: e.summaryText,
                          },
                          null,
                          8,
                          ["text"],
                        ))
                      : r("", !0),
                    t(
                      "button",
                      {
                        type: "submit",
                        class: "btn btn--primary btn--block",
                        disabled: e.primaryDisabled,
                        title: e.primaryLabel,
                        onClick: n[1] || (n[1] = (m) => i("primary")),
                      },
                      [
                        e.primaryLoading
                          ? (s(),
                            u(h(v), {
                              key: 0,
                              size: 16,
                              class: "btn__spinner",
                            }))
                          : r("", !0),
                        t("span", null, l(e.primaryLabel), 1),
                      ],
                      8,
                      $,
                    ),
                  ]),
                ]),
              ]),
            ]),
          ])
        )
      );
    },
  }),
  j = Object.assign(A, { __name: "BarAnnouncement" });
export { j as B };
//# sourceMappingURL=C0j-iZe8.js.map

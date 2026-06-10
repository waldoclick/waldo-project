import { _ as I } from "./vgLiQXkW.js";
import {
  d as v,
  C as L,
  a as T,
  L as E,
  P as N,
  b as B,
  p as P,
  c as U,
  e as F,
} from "./DxYj44ZN.js";
import {
  aZ as h,
  b3 as x,
  be as A,
  a_ as i,
  a$ as u,
  bf as o,
  b0 as l,
  b6 as y,
  b$ as z,
  b8 as b,
  b5 as G,
  b9 as $,
  b1 as m,
  bn as O,
  bo as M,
  bi as k,
  bs as R,
  bC as V,
  b7 as D,
} from "./BK8sApmn.js";
import { A as j } from "./BnndAMq3.js";
import { U as Z } from "./CqtSRkqA.js";
import { C as H } from "./-VADgLbk.js";
import { _ as W, a as q } from "./BbtmlxJr.js";
import { _ as J } from "./C4RpNa5i.js";
import { E as K } from "./C3iZdfbl.js";
import "./CNKn_OHC.js";
try {
  let c =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    s = new c.Error().stack;
  s &&
    ((c._sentryDebugIds = c._sentryDebugIds || {}),
    (c._sentryDebugIds[s] = "0a5f8875-0b83-4cd7-94ec-5f949df33ebf"),
    (c._sentryDebugIdIdentifier =
      "sentry-dbid-0a5f8875-0b83-4cd7-94ec-5f949df33ebf"));
} catch {}
const Q = { class: "google-analytics google-analytics--summary" },
  X = { key: 0, class: "google-analytics--summary__kpis" },
  Y = { key: 1, class: "google-analytics--summary__kpis" },
  ee = h({
    __name: "GoogleAnalyticsSummary",
    setup(c) {
      const s = () => ({ current: 0, previous: 0, delta: 0 }),
        d = x(),
        t = b(!0),
        e = b({ sessions: s(), users: s(), bounceRate: s(), avgDuration: s() }),
        p = (a) => new Intl.NumberFormat("es-CL").format(Math.round(a)),
        r = (a) => `${(a * 100).toFixed(1)}%`,
        _ = (a) => {
          const g = Math.floor(a / 60),
            C = Math.round(a % 60);
          return `${g}m ${C}s`;
        },
        n = (a) => `${a >= 0 ? "+" : ""}${a.toFixed(1)}%`;
      return (
        A(
          () => !0,
          async () => {
            try {
              ((t.value = !0),
                (e.value = await d("google-analytics/summary", {
                  method: "GET",
                })));
            } catch {
            } finally {
              t.value = !1;
            }
          },
          { immediate: !0 },
        ),
        (a, g) => (
          i(),
          u("section", Q, [
            t.value
              ? (i(),
                u("div", X, [
                  ...(g[0] || (g[0] = [o("p", null, "Cargando...", -1)])),
                ]))
              : (i(),
                u("div", Y, [
                  l(
                    v,
                    {
                      title: "Sesiones",
                      value: p(e.value.sessions.current),
                      delta: n(e.value.sessions.delta),
                      "delta-positive": e.value.sessions.delta >= 0,
                      icon: y(j),
                      "icon-color": "#2196f3",
                      "icon-bg-color": "#e3f2fd",
                    },
                    null,
                    8,
                    ["value", "delta", "delta-positive", "icon"],
                  ),
                  l(
                    v,
                    {
                      title: "Usuarios",
                      value: p(e.value.users.current),
                      delta: n(e.value.users.delta),
                      "delta-positive": e.value.users.delta >= 0,
                      icon: y(Z),
                      "icon-color": "#7c3aed",
                      "icon-bg-color": "#ede9fe",
                    },
                    null,
                    8,
                    ["value", "delta", "delta-positive", "icon"],
                  ),
                  l(
                    v,
                    {
                      title: "Bounce Rate",
                      value: r(e.value.bounceRate.current),
                      delta: n(e.value.bounceRate.delta),
                      "delta-positive": e.value.bounceRate.delta < 0,
                      icon: y(z),
                      "icon-color": "#ca8a04",
                      "icon-bg-color": "#fef9c3",
                    },
                    null,
                    8,
                    ["value", "delta", "delta-positive", "icon"],
                  ),
                  l(
                    v,
                    {
                      title: "Duración Prom.",
                      value: _(e.value.avgDuration.current),
                      delta: n(e.value.avgDuration.delta),
                      "delta-positive": e.value.avgDuration.delta >= 0,
                      icon: y(H),
                      "icon-color": "#16a34a",
                      "icon-bg-color": "#dcfce7",
                    },
                    null,
                    8,
                    ["value", "delta", "delta-positive", "icon"],
                  ),
                ])),
          ])
        )
      );
    },
  }),
  ae = Object.assign(ee, { __name: "GoogleAnalyticsSummary" }),
  te = { class: "google-analytics google-analytics--chart" },
  oe = { class: "google-analytics--chart__canvas" },
  se = { key: 0, class: "google-analytics--chart__loading" },
  ne = h({
    __name: "GoogleAnalyticsChart",
    setup(c) {
      L.register(T, E, N, B, P, U);
      const s = x(),
        d = b(!0),
        t = b([]),
        e = $(() => ({
          labels: t.value.map((r) => r.date),
          datasets: [
            {
              label: "Sesiones",
              data: t.value.map((r) => r.sessions),
              borderColor: "#2196f3",
              backgroundColor: "rgba(33,150,243,0.1)",
              borderWidth: 2,
              pointRadius: 2,
              tension: 0.3,
              yAxisID: "ySessions",
            },
            {
              label: "Usuarios",
              data: t.value.map((r) => r.users),
              borderColor: "#7c3aed",
              backgroundColor: "rgba(124,58,237,0.05)",
              borderWidth: 2,
              pointRadius: 2,
              tension: 0.3,
              yAxisID: "yUsers",
            },
          ],
        })),
        p = $(() => ({
          responsive: !0,
          maintainAspectRatio: !1,
          interaction: { intersect: !1, mode: "index" },
          plugins: {
            legend: { display: !0, position: "top" },
            tooltip: { enabled: !0 },
          },
          scales: {
            x: {
              grid: { display: !1 },
              ticks: { font: { size: 11 }, maxTicksLimit: 10 },
            },
            ySessions: {
              type: "linear",
              position: "left",
              beginAtZero: !0,
              grid: { color: "rgba(0,0,0,0.06)" },
              ticks: { font: { size: 11 } },
            },
            yUsers: {
              type: "linear",
              position: "right",
              beginAtZero: !0,
              grid: { display: !1 },
              ticks: { font: { size: 11 } },
            },
          },
          animation: { duration: 0 },
        }));
      return (
        A(
          () => !0,
          async () => {
            try {
              ((d.value = !0),
                (t.value = await s("google-analytics/stats", {
                  method: "GET",
                })));
            } catch {
            } finally {
              d.value = !1;
            }
          },
          { immediate: !0 },
        ),
        (r, _) => (
          i(),
          u("section", te, [
            _[1] ||
              (_[1] = o(
                "div",
                { class: "google-analytics--chart__header" },
                [
                  o(
                    "h2",
                    { class: "google-analytics--chart__title" },
                    " Sesiones y Usuarios (últimos 28 días) ",
                  ),
                ],
                -1,
              )),
            o("div", oe, [
              d.value
                ? (i(),
                  u("div", se, [
                    ...(_[0] ||
                      (_[0] = [o("p", null, "Cargando datos...", -1)])),
                  ]))
                : (i(),
                  G(
                    y(F),
                    { key: 1, data: e.value, options: p.value },
                    null,
                    8,
                    ["data", "options"],
                  )),
            ]),
          ])
        )
      );
    },
  }),
  le = Object.assign(ne, { __name: "GoogleAnalyticsChart" }),
  ie = { class: "google-analytics google-analytics--pages" },
  re = { class: "google-analytics--pages__table-wrapper" },
  ce = ["title"],
  ue = { key: 0, class: "google-analytics--pages__empty" },
  ge = { key: 1, class: "google-analytics--pages__loading" },
  de = h({
    __name: "GoogleAnalyticsPages",
    setup(c) {
      const s = [
          { label: "Página" },
          { label: "Sesiones", align: "right" },
          { label: "Bounce Rate", align: "right" },
        ],
        d = x(),
        t = b(!0),
        e = b([]),
        p = (n) => new Intl.NumberFormat("es-CL").format(n),
        r = (n) => `${(n * 100).toFixed(1)}%`,
        _ = (n) =>
          n <= 0.3
            ? "google-analytics--pages__bounce--good"
            : n <= 0.6
              ? "google-analytics--pages__bounce--warning"
              : "google-analytics--pages__bounce--bad";
      return (
        A(
          () => !0,
          async () => {
            try {
              ((t.value = !0),
                (e.value = await d("google-analytics/pages", {
                  method: "GET",
                })));
            } catch {
            } finally {
              t.value = !1;
            }
          },
          { immediate: !0 },
        ),
        (n, a) => {
          const g = q,
            C = W,
            S = J;
          return (
            i(),
            u("section", ie, [
              a[2] ||
                (a[2] = o(
                  "div",
                  { class: "google-analytics--pages__header" },
                  [
                    o(
                      "h2",
                      { class: "google-analytics--pages__title" },
                      "Páginas",
                    ),
                  ],
                  -1,
                )),
              o("div", re, [
                l(
                  S,
                  { columns: s },
                  {
                    default: m(() => [
                      (i(!0),
                      u(
                        O,
                        null,
                        M(
                          e.value,
                          (f, w) => (
                            i(),
                            G(
                              C,
                              { key: w },
                              {
                                default: m(() => [
                                  l(
                                    g,
                                    null,
                                    {
                                      default: m(() => [
                                        o(
                                          "span",
                                          {
                                            class:
                                              "google-analytics--pages__url",
                                            title: f.page,
                                          },
                                          k(f.page),
                                          9,
                                          ce,
                                        ),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  l(
                                    g,
                                    { align: "right" },
                                    {
                                      default: m(() => [
                                        R(k(p(f.sessions)), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  l(
                                    g,
                                    { align: "right" },
                                    {
                                      default: m(() => [
                                        o(
                                          "span",
                                          { class: V(_(f.bounceRate)) },
                                          k(r(f.bounceRate)),
                                          3,
                                        ),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                ]),
                                _: 2,
                              },
                              1024,
                            )
                          ),
                        ),
                        128,
                      )),
                    ]),
                    _: 1,
                  },
                ),
                e.value.length === 0 && !t.value
                  ? (i(),
                    u("div", ue, [
                      ...(a[0] ||
                        (a[0] = [
                          o("p", null, "No hay datos disponibles", -1),
                        ])),
                    ]))
                  : D("", !0),
                t.value
                  ? (i(),
                    u("div", ge, [
                      ...(a[1] || (a[1] = [o("p", null, "Cargando...", -1)])),
                    ]))
                  : D("", !0),
              ]),
            ])
          );
        }
      );
    },
  }),
  _e = Object.assign(de, { __name: "GoogleAnalyticsPages" }),
  pe = {
    href: "https://analytics.google.com",
    target: "_blank",
    rel: "noopener noreferrer",
    class: "btn btn--primary",
  },
  me = { class: "google-analytics google-analytics--page" },
  ye = { class: "google-analytics--page__container" },
  Ge = h({
    __name: "google-analytics",
    setup(c) {
      const s = [
        { label: "Integraciones", to: "/dashboard/integrations" },
        { label: "Google Analytics" },
      ];
      return (d, t) => {
        const e = I;
        return (
          i(),
          u("div", null, [
            l(
              e,
              { title: "Google Analytics", breadcrumbs: s },
              {
                actions: m(() => [
                  o("a", pe, [
                    l(y(K), { size: 16 }),
                    t[0] || (t[0] = R(" Google Analytics ", -1)),
                  ]),
                ]),
                _: 1,
              },
            ),
            o("div", me, [o("div", ye, [l(ae), l(le), l(_e)])]),
          ])
        );
      };
    },
  });
export { Ge as default };
//# sourceMappingURL=SCGVSZJf.js.map

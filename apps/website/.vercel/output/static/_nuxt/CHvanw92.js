import { _ as z } from "./vgLiQXkW.js";
import {
  C as A,
  a as B,
  L as M,
  P as O,
  b as Q,
  p as V,
  c as j,
  d as x,
  e as G,
} from "./DxYj44ZN.js";
import {
  bD as E,
  aZ as $,
  b3 as T,
  be as D,
  a_ as c,
  a$ as _,
  bf as t,
  b0 as s,
  b6 as y,
  c0 as H,
  b5 as w,
  b8 as v,
  b9 as P,
  b1 as i,
  bn as L,
  bo as N,
  bs as g,
  bi as m,
  b7 as S,
} from "./BK8sApmn.js";
import { E as Z } from "./DvfQSOKW.js";
import { _ as F, a as R } from "./BbtmlxJr.js";
import { _ as q } from "./C4RpNa5i.js";
import { E as W } from "./C3iZdfbl.js";
import "./CNKn_OHC.js";
try {
  let p =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    h = new p.Error().stack;
  h &&
    ((p._sentryDebugIds = p._sentryDebugIds || {}),
    (p._sentryDebugIds[h] = "575ec6b6-efc6-44c3-bcc4-9c6d13b90f63"),
    (p._sentryDebugIdIdentifier =
      "sentry-dbid-575ec6b6-efc6-44c3-bcc4-9c6d13b90f63"));
} catch {}
const U = E("hash", [
  ["line", { x1: "4", x2: "20", y1: "9", y2: "9", key: "4lhtct" }],
  ["line", { x1: "4", x2: "20", y1: "15", y2: "15", key: "vyu0kd" }],
  ["line", { x1: "10", x2: "8", y1: "3", y2: "21", key: "1ggp8o" }],
  ["line", { x1: "16", x2: "14", y1: "3", y2: "21", key: "weycgp" }],
]);
const J = E("mouse-pointer-click", [
    ["path", { d: "M14 4.1 12 6", key: "ita8i4" }],
    ["path", { d: "m5.1 8-2.9-.8", key: "1go3kf" }],
    ["path", { d: "m6 12-1.9 2", key: "mnht97" }],
    ["path", { d: "M7.2 2.2 8 5.1", key: "1cfko1" }],
    [
      "path",
      {
        d: "M9.037 9.69a.498.498 0 0 1 .653-.653l11 4.5a.5.5 0 0 1-.074.949l-4.349 1.041a1 1 0 0 0-.74.739l-1.04 4.35a.5.5 0 0 1-.95.074z",
        key: "s0h3yz",
      },
    ],
  ]),
  K = { class: "search-console search-console--stats" },
  X = { class: "search-console--stats__kpis" },
  Y = { class: "search-console--stats__chart" },
  ee = { class: "search-console--stats__chart__canvas" },
  se = { key: 0, class: "search-console--stats__chart__loading" },
  oe = $({
    __name: "SearchConsoleStats",
    setup(p) {
      A.register(B, M, O, Q, V, j);
      const h = T(),
        b = v(!0),
        n = v([]),
        r = P(() => {
          const a = n.value;
          if (a.length === 0)
            return { clicks: 0, impressions: 0, ctr: "0%", position: "0" };
          const e = a.reduce((u, o) => u + o.clicks, 0),
            l = a.reduce((u, o) => u + o.impressions, 0),
            d = a.reduce((u, o) => u + o.ctr, 0) / a.length,
            C = a.reduce((u, o) => u + o.position, 0) / a.length;
          return {
            clicks: e,
            impressions: l,
            ctr: `${(d * 100).toFixed(1)}%`,
            position: C.toFixed(1),
          };
        }),
        f = P(() => ({
          labels: n.value.map((a) => a.date),
          datasets: [
            {
              label: "Clicks",
              data: n.value.map((a) => a.clicks),
              borderColor: "#2196f3",
              backgroundColor: "rgba(33,150,243,0.1)",
              borderWidth: 2,
              pointRadius: 2,
              tension: 0.3,
              yAxisID: "yClicks",
            },
            {
              label: "Impressiones",
              data: n.value.map((a) => a.impressions),
              borderColor: "#7c3aed",
              backgroundColor: "rgba(124,58,237,0.05)",
              borderWidth: 2,
              pointRadius: 2,
              tension: 0.3,
              yAxisID: "yImpressions",
            },
          ],
        })),
        k = P(() => ({
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
            yClicks: {
              type: "linear",
              position: "left",
              beginAtZero: !0,
              grid: { color: "rgba(0,0,0,0.06)" },
              ticks: { font: { size: 11 } },
            },
            yImpressions: {
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
        D(
          () => !0,
          async () => {
            try {
              ((b.value = !0),
                (n.value = await h("search-console/performance", {
                  method: "GET",
                })));
            } catch {
            } finally {
              b.value = !1;
            }
          },
          { immediate: !0 },
        ),
        (a, e) => (
          c(),
          _("section", K, [
            t("div", X, [
              s(
                x,
                {
                  title: "Clicks",
                  value: r.value.clicks,
                  icon: y(J),
                  "icon-color": "#2196f3",
                  "icon-bg-color": "#e3f2fd",
                },
                null,
                8,
                ["value", "icon"],
              ),
              s(
                x,
                {
                  title: "Impressiones",
                  value: r.value.impressions,
                  icon: y(Z),
                  "icon-color": "#7c3aed",
                  "icon-bg-color": "#ede9fe",
                },
                null,
                8,
                ["value", "icon"],
              ),
              s(
                x,
                {
                  title: "CTR Promedio",
                  value: r.value.ctr,
                  icon: y(H),
                  "icon-color": "#16a34a",
                  "icon-bg-color": "#dcfce7",
                },
                null,
                8,
                ["value", "icon"],
              ),
              s(
                x,
                {
                  title: "Posición Promedio",
                  value: r.value.position,
                  icon: y(U),
                  "icon-color": "#ca8a04",
                  "icon-bg-color": "#fef9c3",
                },
                null,
                8,
                ["value", "icon"],
              ),
            ]),
            t("div", Y, [
              e[1] ||
                (e[1] = t(
                  "div",
                  { class: "search-console--stats__chart__header" },
                  [
                    t(
                      "h2",
                      { class: "search-console--stats__chart__title" },
                      " Performance (últimos 28 días) ",
                    ),
                  ],
                  -1,
                )),
              t("div", ee, [
                b.value
                  ? (c(),
                    _("div", se, [
                      ...(e[0] ||
                        (e[0] = [t("p", null, "Cargando datos...", -1)])),
                    ]))
                  : (c(),
                    w(
                      y(G),
                      { key: 1, data: f.value, options: k.value },
                      null,
                      8,
                      ["data", "options"],
                    )),
              ]),
            ]),
          ])
        )
      );
    },
  }),
  te = Object.assign(oe, { __name: "SearchConsoleStats" }),
  ae = { class: "search-console search-console--queries" },
  ne = { class: "search-console--queries__table-wrapper" },
  le = { key: 0, class: "search-console--queries__empty" },
  ie = { key: 1, class: "search-console--queries__loading" },
  re = $({
    __name: "SearchConsoleQueries",
    setup(p) {
      const h = [
          { label: "Consulta" },
          { label: "Clicks", align: "right" },
          { label: "Impressiones", align: "right" },
          { label: "CTR", align: "right" },
          { label: "Posición", align: "right" },
        ],
        b = T(),
        n = v(!0),
        r = v([]),
        f = (e) => new Intl.NumberFormat("es-CL").format(e),
        k = (e) => `${(e * 100).toFixed(1)}%`,
        a = (e) => e.toFixed(1);
      return (
        D(
          () => !0,
          async () => {
            try {
              ((n.value = !0),
                (r.value = await b("search-console/queries", {
                  method: "GET",
                })));
            } catch {
            } finally {
              n.value = !1;
            }
          },
          { immediate: !0 },
        ),
        (e, l) => {
          const d = R,
            C = F,
            u = q;
          return (
            c(),
            _("section", ae, [
              l[2] ||
                (l[2] = t(
                  "div",
                  { class: "search-console--queries__header" },
                  [
                    t(
                      "h2",
                      { class: "search-console--queries__title" },
                      "Queries",
                    ),
                  ],
                  -1,
                )),
              t("div", ne, [
                s(
                  u,
                  { columns: h },
                  {
                    default: i(() => [
                      (c(!0),
                      _(
                        L,
                        null,
                        N(
                          r.value,
                          (o, I) => (
                            c(),
                            w(
                              C,
                              { key: I },
                              {
                                default: i(() => [
                                  s(
                                    d,
                                    null,
                                    {
                                      default: i(() => [g(m(o.keys[0]), 1)]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  s(
                                    d,
                                    { align: "right" },
                                    {
                                      default: i(() => [g(m(f(o.clicks)), 1)]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  s(
                                    d,
                                    { align: "right" },
                                    {
                                      default: i(() => [
                                        g(m(f(o.impressions)), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  s(
                                    d,
                                    { align: "right" },
                                    {
                                      default: i(() => [g(m(k(o.ctr)), 1)]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  s(
                                    d,
                                    { align: "right" },
                                    {
                                      default: i(() => [
                                        g(m(a(o.position)), 1),
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
                r.value.length === 0 && !n.value
                  ? (c(),
                    _("div", le, [
                      ...(l[0] ||
                        (l[0] = [
                          t("p", null, "No hay datos disponibles", -1),
                        ])),
                    ]))
                  : S("", !0),
                n.value
                  ? (c(),
                    _("div", ie, [
                      ...(l[1] || (l[1] = [t("p", null, "Cargando...", -1)])),
                    ]))
                  : S("", !0),
              ]),
            ])
          );
        }
      );
    },
  }),
  ce = Object.assign(re, { __name: "SearchConsoleQueries" }),
  de = { class: "search-console search-console--pages" },
  ue = { class: "search-console--pages__table-wrapper" },
  _e = ["title"],
  pe = { key: 0, class: "search-console--pages__empty" },
  he = { key: 1, class: "search-console--pages__loading" },
  ge = $({
    __name: "SearchConsolePages",
    setup(p) {
      const h = [
          { label: "Página" },
          { label: "Clicks", align: "right" },
          { label: "Impressiones", align: "right" },
          { label: "CTR", align: "right" },
          { label: "Posición", align: "right" },
        ],
        b = T(),
        n = v(!0),
        r = v([]),
        f = (e) => new Intl.NumberFormat("es-CL").format(e),
        k = (e) => `${(e * 100).toFixed(1)}%`,
        a = (e) => e.toFixed(1);
      return (
        D(
          () => !0,
          async () => {
            try {
              ((n.value = !0),
                (r.value = await b("search-console/pages", { method: "GET" })));
            } catch {
            } finally {
              n.value = !1;
            }
          },
          { immediate: !0 },
        ),
        (e, l) => {
          const d = R,
            C = F,
            u = q;
          return (
            c(),
            _("section", de, [
              l[2] ||
                (l[2] = t(
                  "div",
                  { class: "search-console--pages__header" },
                  [t("h2", { class: "search-console--pages__title" }, "Pages")],
                  -1,
                )),
              t("div", ue, [
                s(
                  u,
                  { columns: h },
                  {
                    default: i(() => [
                      (c(!0),
                      _(
                        L,
                        null,
                        N(
                          r.value,
                          (o, I) => (
                            c(),
                            w(
                              C,
                              { key: I },
                              {
                                default: i(() => [
                                  s(
                                    d,
                                    null,
                                    {
                                      default: i(() => [
                                        t(
                                          "span",
                                          {
                                            class: "search-console--pages__url",
                                            title: o.keys[0],
                                          },
                                          m(o.keys[0]),
                                          9,
                                          _e,
                                        ),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  s(
                                    d,
                                    { align: "right" },
                                    {
                                      default: i(() => [g(m(f(o.clicks)), 1)]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  s(
                                    d,
                                    { align: "right" },
                                    {
                                      default: i(() => [
                                        g(m(f(o.impressions)), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  s(
                                    d,
                                    { align: "right" },
                                    {
                                      default: i(() => [g(m(k(o.ctr)), 1)]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  s(
                                    d,
                                    { align: "right" },
                                    {
                                      default: i(() => [
                                        g(m(a(o.position)), 1),
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
                r.value.length === 0 && !n.value
                  ? (c(),
                    _("div", pe, [
                      ...(l[0] ||
                        (l[0] = [
                          t("p", null, "No hay datos disponibles", -1),
                        ])),
                    ]))
                  : S("", !0),
                n.value
                  ? (c(),
                    _("div", he, [
                      ...(l[1] || (l[1] = [t("p", null, "Cargando...", -1)])),
                    ]))
                  : S("", !0),
              ]),
            ])
          );
        }
      );
    },
  }),
  me = Object.assign(ge, { __name: "SearchConsolePages" }),
  be = {
    href: "https://search.google.com/search-console",
    target: "_blank",
    rel: "noopener noreferrer",
    class: "btn btn--primary",
  },
  fe = { class: "search-console search-console--page" },
  ye = { class: "search-console--page__container" },
  Te = $({
    __name: "search-console",
    setup(p) {
      const h = [
        { label: "Integraciones", to: "/dashboard/integrations" },
        { label: "Search Console" },
      ];
      return (b, n) => {
        const r = z;
        return (
          c(),
          _("div", null, [
            s(
              r,
              { title: "Search Console", breadcrumbs: h },
              {
                actions: i(() => [
                  t("a", be, [
                    s(y(W), { size: 16 }),
                    n[0] || (n[0] = g(" Search Console ", -1)),
                  ]),
                ]),
                _: 1,
              },
            ),
            t("div", fe, [t("div", ye, [s(te), s(ce), s(me)])]),
          ])
        );
      };
    },
  });
export { Te as default };
//# sourceMappingURL=CHvanw92.js.map

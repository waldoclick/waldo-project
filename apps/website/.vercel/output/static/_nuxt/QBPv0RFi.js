import { _ as G } from "./vgLiQXkW.js";
import {
  C as A,
  a as L,
  L as F,
  P as O,
  b as W,
  p as I,
  c as N,
  d as $,
  e as Z,
  B as j,
  f as H,
} from "./DxYj44ZN.js";
import {
  bD as K,
  aZ as q,
  b3 as R,
  be as T,
  a_ as n,
  a$ as d,
  bf as t,
  b0 as i,
  b6 as b,
  b5 as E,
  b8 as m,
  b9 as C,
  b1 as y,
  bn as P,
  bo as S,
  bi as k,
  bs as x,
  b7 as D,
  bm as U,
  bR as J,
  bC as V,
} from "./BK8sApmn.js";
import { G as Q } from "./Ch4gmhwv.js";
import { W as X } from "./DJjbGNXS.js";
import { E as Y } from "./DvfQSOKW.js";
import { _ as ee, a as te } from "./BbtmlxJr.js";
import { _ as ae } from "./C4RpNa5i.js";
import { C as se } from "./DmUMncXv.js";
import { E as oe } from "./C3iZdfbl.js";
import "./CNKn_OHC.js";
try {
  let f =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    c = new f.Error().stack;
  c &&
    ((f._sentryDebugIds = f._sentryDebugIds || {}),
    (f._sentryDebugIds[c] = "29016f2c-e816-49b6-8518-15eaaa5730a2"),
    (f._sentryDebugIdIdentifier =
      "sentry-dbid-29016f2c-e816-49b6-8518-15eaaa5730a2"));
} catch {}
const le = K("shield-alert", [
    [
      "path",
      {
        d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
        key: "oel41y",
      },
    ],
    ["path", { d: "M12 8v4", key: "1got3b" }],
    ["path", { d: "M12 16h.01", key: "1drbdi" }],
  ]),
  re = { class: "cloudflare cloudflare--stats" },
  ne = { class: "cloudflare--stats__kpis" },
  ie = { class: "cloudflare--stats__chart" },
  de = { class: "cloudflare--stats__chart__canvas" },
  ce = { key: 0, class: "cloudflare--stats__chart__loading" },
  ue = q({
    __name: "CloudflareStats",
    setup(f) {
      A.register(L, F, O, W, I, N);
      const c = (e) =>
          e >= 1073741824
            ? `${(e / 1073741824).toFixed(1)} GB`
            : e >= 1048576
              ? `${(e / 1048576).toFixed(1)} MB`
              : e >= 1024
                ? `${(e / 1024).toFixed(1)} KB`
                : `${e} B`,
        v = R(),
        r = m(!0),
        l = m([]),
        u = C(() => {
          const e = l.value;
          return e.length === 0
            ? { requests: 0, bytes: "0 B", pageViews: 0, threats: 0 }
            : {
                requests: e.reduce((a, _) => a + _.requests, 0),
                bytes: c(e.reduce((a, _) => a + _.bytes, 0)),
                pageViews: e.reduce((a, _) => a + _.pageViews, 0),
                threats: e.reduce((a, _) => a + _.threats, 0),
              };
        }),
        p = C(() => ({
          labels: l.value.map((e) => e.date),
          datasets: [
            {
              label: "Requests",
              data: l.value.map((e) => e.requests),
              borderColor: "#f38020",
              backgroundColor: "rgba(243,128,32,0.1)",
              borderWidth: 2,
              pointRadius: 2,
              tension: 0.3,
              yAxisID: "yRequests",
            },
            {
              label: "Page Views",
              data: l.value.map((e) => e.pageViews),
              borderColor: "#2196f3",
              backgroundColor: "rgba(33,150,243,0.05)",
              borderWidth: 2,
              pointRadius: 2,
              tension: 0.3,
              yAxisID: "yPageViews",
            },
          ],
        })),
        s = C(() => ({
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
            yRequests: {
              type: "linear",
              position: "left",
              beginAtZero: !0,
              grid: { color: "rgba(0,0,0,0.06)" },
              ticks: { font: { size: 11 } },
            },
            yPageViews: {
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
        T(
          () => !0,
          async () => {
            try {
              ((r.value = !0),
                (l.value = await v("cloudflare/traffic", { method: "GET" })));
            } catch {
            } finally {
              r.value = !1;
            }
          },
          { immediate: !0 },
        ),
        (e, a) => (
          n(),
          d("section", re, [
            t("div", ne, [
              i(
                $,
                {
                  title: "Requests",
                  value: u.value.requests,
                  icon: b(Q),
                  "icon-color": "#f38020",
                  "icon-bg-color": "#fef3e8",
                },
                null,
                8,
                ["value", "icon"],
              ),
              i(
                $,
                {
                  title: "Ancho de Banda",
                  value: u.value.bytes,
                  icon: b(X),
                  "icon-color": "#2196f3",
                  "icon-bg-color": "#e3f2fd",
                },
                null,
                8,
                ["value", "icon"],
              ),
              i(
                $,
                {
                  title: "Page Views",
                  value: u.value.pageViews,
                  icon: b(Y),
                  "icon-color": "#16a34a",
                  "icon-bg-color": "#dcfce7",
                },
                null,
                8,
                ["value", "icon"],
              ),
              i(
                $,
                {
                  title: "Amenazas",
                  value: u.value.threats,
                  icon: b(le),
                  "icon-color": "#dc2626",
                  "icon-bg-color": "#fee2e2",
                },
                null,
                8,
                ["value", "icon"],
              ),
            ]),
            t("div", ie, [
              a[1] ||
                (a[1] = t(
                  "div",
                  { class: "cloudflare--stats__chart__header" },
                  [
                    t(
                      "h2",
                      { class: "cloudflare--stats__chart__title" },
                      " Tráfico (últimos 30 días) ",
                    ),
                  ],
                  -1,
                )),
              t("div", de, [
                r.value
                  ? (n(),
                    d("div", ce, [
                      ...(a[0] ||
                        (a[0] = [t("p", null, "Cargando datos...", -1)])),
                    ]))
                  : (n(),
                    E(
                      b(Z),
                      { key: 1, data: p.value, options: s.value },
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
  _e = Object.assign(ue, { __name: "CloudflareStats" }),
  fe = { class: "cloudflare cloudflare--requests" },
  pe = { class: "cloudflare--requests__table-wrapper" },
  me = ["title"],
  be = { key: 0, class: "cloudflare--requests__empty" },
  he = { key: 1, class: "cloudflare--requests__loading" },
  ge = q({
    __name: "CloudflareRequests",
    setup(f) {
      const c = [
          { label: "Página" },
          { label: "Requests", align: "right" },
          { label: "Ancho de Banda", align: "right" },
        ],
        v = R(),
        r = m(!0),
        l = m([]),
        u = (s) => new Intl.NumberFormat("es-CL").format(s),
        p = (s) =>
          s >= 1073741824
            ? `${(s / 1073741824).toFixed(1)} GB`
            : s >= 1048576
              ? `${(s / 1048576).toFixed(1)} MB`
              : s >= 1024
                ? `${(s / 1024).toFixed(1)} KB`
                : `${s} B`;
      return (
        T(
          () => !0,
          async () => {
            try {
              ((r.value = !0),
                (l.value = await v("cloudflare/requests", { method: "GET" })));
            } catch {
            } finally {
              r.value = !1;
            }
          },
          { immediate: !0 },
        ),
        (s, e) => {
          const a = te,
            _ = ee,
            B = ae;
          return (
            n(),
            d("section", fe, [
              e[2] ||
                (e[2] = t(
                  "div",
                  { class: "cloudflare--requests__header" },
                  [
                    t(
                      "h2",
                      { class: "cloudflare--requests__title" },
                      "Top Páginas (ayer)",
                    ),
                  ],
                  -1,
                )),
              t("div", pe, [
                i(
                  B,
                  { columns: c },
                  {
                    default: y(() => [
                      (n(!0),
                      d(
                        P,
                        null,
                        S(
                          l.value,
                          (h, z) => (
                            n(),
                            E(
                              _,
                              { key: z },
                              {
                                default: y(() => [
                                  i(
                                    a,
                                    null,
                                    {
                                      default: y(() => [
                                        t(
                                          "span",
                                          {
                                            class: "cloudflare--requests__url",
                                            title: h.path,
                                          },
                                          k(h.path),
                                          9,
                                          me,
                                        ),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  i(
                                    a,
                                    { align: "right" },
                                    {
                                      default: y(() => [
                                        x(k(u(h.requests)), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  i(
                                    a,
                                    { align: "right" },
                                    {
                                      default: y(() => [x(k(p(h.bytes)), 1)]),
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
                l.value.length === 0 && !r.value
                  ? (n(),
                    d("div", be, [
                      ...(e[0] ||
                        (e[0] = [
                          t("p", null, "No hay datos disponibles", -1),
                        ])),
                    ]))
                  : D("", !0),
                r.value
                  ? (n(),
                    d("div", he, [
                      ...(e[1] || (e[1] = [t("p", null, "Cargando...", -1)])),
                    ]))
                  : D("", !0),
              ]),
            ])
          );
        }
      );
    },
  }),
  ve = Object.assign(ge, { __name: "CloudflareRequests" }),
  ye = { class: "cloudflare cloudflare--threats" },
  Ce = { class: "cloudflare--threats__header" },
  ke = { class: "cloudflare--threats__period-selector" },
  we = ["onClick"],
  $e = { class: "cloudflare--threats__chart" },
  xe = { key: 0, class: "cloudflare--threats__loading" },
  qe = { key: 1, class: "cloudflare--threats__empty" },
  Be = q({
    __name: "CloudflareThreats",
    setup(f) {
      A.register(L, F, j, I, N);
      const c = [
          { label: "Últimos 7 días", days: 7 },
          { label: "Últimos 30 días", days: 30 },
          { label: "Últimos 90 días", days: 90 },
        ],
        v = R(),
        r = m(!0),
        l = m([]),
        u = m(c[1]),
        p = m(!1),
        s = m(null),
        e = m(null),
        a = (o) => new Intl.NumberFormat("es-CL").format(o),
        _ = () => {
          p.value = !p.value;
        },
        B = (o) => {
          ((u.value = o), (p.value = !1));
        },
        h = (o) => {
          s.value &&
            e.value &&
            !s.value.contains(o.target) &&
            !e.value.contains(o.target) &&
            (p.value = !1);
        };
      (U(() => {
        document.addEventListener("click", h);
      }),
        J(() => {
          document.removeEventListener("click", h);
        }),
        T(
          () => u.value.days,
          async (o) => {
            try {
              ((r.value = !0),
                (l.value = await v("cloudflare/threats", {
                  method: "GET",
                  params: { days: o },
                })));
            } catch {
            } finally {
              r.value = !1;
            }
          },
          { immediate: !0 },
        ));
      const z = C(() => ({
          labels: l.value.map((o) => o.date),
          datasets: [
            {
              label: "Amenazas",
              data: l.value.map((o) => o.threats),
              backgroundColor: "#ff6b6b",
              borderColor: "#ff6b6b",
              borderWidth: 0,
            },
          ],
        })),
        M = C(() => ({
          responsive: !0,
          maintainAspectRatio: !1,
          interaction: { intersect: !1, mode: "index" },
          plugins: {
            legend: { display: !1 },
            tooltip: {
              enabled: !0,
              displayColors: !1,
              backgroundColor: "#fff",
              borderColor: "#ccc",
              borderWidth: 1,
              borderRadius: 4,
              padding: 8,
              titleColor: "#000",
              bodyColor: "#000",
              titleFont: { size: 11, weight: "normal" },
              bodyFont: { size: 11, weight: "normal" },
              callbacks: { label: (o) => `${a(o.parsed.y ?? 0)} amenazas` },
              caretSize: 0,
              cornerRadius: 4,
            },
          },
          scales: {
            x: {
              grid: { display: !1 },
              ticks: { font: { size: 11 }, maxTicksLimit: 10 },
            },
            y: {
              beginAtZero: !0,
              grid: { color: "rgba(0,0,0,0.06)" },
              ticks: { font: { size: 11 }, callback: (o) => a(Number(o)) },
            },
          },
          animation: { duration: 0 },
        }));
      return (o, g) => (
        n(),
        d("section", ye, [
          t("div", Ce, [
            g[0] ||
              (g[0] = t(
                "h2",
                { class: "cloudflare--threats__title" },
                "Días con más amenazas",
                -1,
              )),
            t("div", ke, [
              t(
                "button",
                {
                  ref_key: "dropdownButton",
                  ref: s,
                  class: "cloudflare--threats__period-button",
                  onClick: _,
                },
                [
                  x(k(u.value.label) + " ", 1),
                  i(
                    b(se),
                    {
                      class: V([
                        "cloudflare--threats__period-button__icon",
                        {
                          "cloudflare--threats__period-button__icon--open":
                            p.value,
                        },
                      ]),
                    },
                    null,
                    8,
                    ["class"],
                  ),
                ],
                512,
              ),
              p.value
                ? (n(),
                  d(
                    "div",
                    {
                      key: 0,
                      ref_key: "dropdownMenu",
                      ref: e,
                      class: "cloudflare--threats__period-menu",
                    },
                    [
                      (n(),
                      d(
                        P,
                        null,
                        S(c, (w) =>
                          t(
                            "button",
                            {
                              key: w.days,
                              class: V([
                                "cloudflare--threats__period-menu__item",
                                {
                                  "cloudflare--threats__period-menu__item--active":
                                    w.days === u.value.days,
                                },
                              ]),
                              onClick: (Ee) => B(w),
                            },
                            k(w.label),
                            11,
                            we,
                          ),
                        ),
                        64,
                      )),
                    ],
                    512,
                  ))
                : D("", !0),
            ]),
          ]),
          t("div", $e, [
            r.value
              ? (n(),
                d("div", xe, [
                  ...(g[1] || (g[1] = [t("p", null, "Cargando datos...", -1)])),
                ]))
              : l.value.length === 0
                ? (n(),
                  d("div", qe, [
                    ...(g[2] ||
                      (g[2] = [
                        t("p", null, "No hay amenazas en este período", -1),
                      ])),
                  ]))
                : (n(),
                  E(
                    b(H),
                    { key: 2, data: z.value, options: M.value },
                    null,
                    8,
                    ["data", "options"],
                  )),
          ]),
        ])
      );
    },
  }),
  ze = Object.assign(Be, { __name: "CloudflareThreats" }),
  De = {
    href: "https://dash.cloudflare.com",
    target: "_blank",
    rel: "noopener noreferrer",
    class: "btn btn--primary",
  },
  Re = { class: "cloudflare cloudflare--page" },
  Te = { class: "cloudflare--page__container" },
  We = q({
    __name: "cloudflare",
    setup(f) {
      const c = [
        { label: "Integraciones", to: "/dashboard/integrations" },
        { label: "Cloudflare" },
      ];
      return (v, r) => {
        const l = G;
        return (
          n(),
          d("div", null, [
            i(
              l,
              { title: "Cloudflare", breadcrumbs: c },
              {
                actions: y(() => [
                  t("a", De, [
                    i(b(oe), { size: 16 }),
                    r[0] || (r[0] = x(" Cloudflare ", -1)),
                  ]),
                ]),
                _: 1,
              },
            ),
            t("div", Re, [t("div", Te, [i(_e), i(ve), i(ze)])]),
          ])
        );
      };
    },
  });
export { We as default };
//# sourceMappingURL=QBPv0RFi.js.map

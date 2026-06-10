import { I as S } from "./5Zo0HME0.js";
import { _ as D } from "./vgLiQXkW.js";
import {
  aZ as g,
  a_ as n,
  a$ as o,
  bf as e,
  bC as w,
  bs as m,
  bi as l,
  b7 as f,
  b9 as M,
  b3 as y,
  be as v,
  bn as C,
  bo as $,
  b8 as h,
  b5 as B,
  b0 as d,
  b1 as u,
} from "./BK8sApmn.js";
import { _ as T, a as N } from "./BbtmlxJr.js";
import { _ as A } from "./C4RpNa5i.js";
import "./CNKn_OHC.js";
try {
  let t =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    i = new t.Error().stack;
  i &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[i] = "95aae8e3-5570-45da-9c28-1bc7eb634b1d"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-95aae8e3-5570-45da-9c28-1bc7eb634b1d"));
} catch {}
const L = { class: "card card--monitor" },
  q = { class: "card--monitor__title" },
  V = { class: "card--monitor__value" },
  E = { class: "card--monitor__meta" },
  F = { class: "card--monitor__meta" },
  O = { key: 0 },
  j = g({
    __name: "CardMonitor",
    props: {
      name: {},
      url: {},
      status: {},
      lastCheckedAt: {},
      checkFrequency: {},
    },
    setup(t) {
      const i = t,
        _ = M(
          () =>
            ({
              up: "Operativo",
              down: "Caído",
              paused: "Pausado",
              pending: "Pendiente",
              maintenance: "Mantenimiento",
              validating: "Validando",
            })[i.status],
        ),
        a = (s) =>
          new Date(s).toLocaleString("es-CL", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          });
      return (s, r) => (
        n(),
        o("article", L, [
          e("div", q, [
            e(
              "span",
              {
                class: w([
                  "card--monitor__dot",
                  `card--monitor__dot--${t.status}`,
                ]),
              },
              null,
              2,
            ),
            m(" " + l(t.name), 1),
          ]),
          e("div", V, l(_.value), 1),
          e("div", E, l(t.url), 1),
          e("div", F, [
            m(" Cada " + l(t.checkFrequency / 60) + " min ", 1),
            t.lastCheckedAt
              ? (n(), o("span", O, " · " + l(a(t.lastCheckedAt)), 1))
              : f("", !0),
          ]),
        ])
      );
    },
  }),
  G = Object.assign(j, { __name: "CardMonitor" }),
  H = { class: "better-stack better-stack--monitors" },
  P = { key: 0, class: "better-stack--monitors__loading" },
  R = { key: 1, class: "better-stack--monitors__empty" },
  z = g({
    __name: "BetterStackMonitors",
    setup(t) {
      const i = y(),
        _ = h(!0),
        a = h([]);
      return (
        v(
          () => !0,
          async () => {
            try {
              ((_.value = !0),
                (a.value = await i("better-stack/monitors", {
                  method: "GET",
                })));
            } catch {
            } finally {
              _.value = !1;
            }
          },
          { immediate: !0 },
        ),
        (s, r) => (
          n(),
          o("section", H, [
            _.value
              ? (n(),
                o("div", P, [
                  ...(r[0] || (r[0] = [e("p", null, "Cargando...", -1)])),
                ]))
              : a.value.length === 0
                ? (n(),
                  o("div", R, [
                    ...(r[1] ||
                      (r[1] = [
                        e("p", null, "No hay monitores disponibles", -1),
                      ])),
                  ]))
                : (n(!0),
                  o(
                    C,
                    { key: 2 },
                    $(
                      a.value,
                      (c) => (
                        n(),
                        B(
                          G,
                          {
                            key: c.id,
                            name: c.name,
                            url: c.url,
                            status: c.status,
                            "last-checked-at": c.lastCheckedAt,
                            "check-frequency": c.checkFrequency,
                          },
                          null,
                          8,
                          [
                            "name",
                            "url",
                            "status",
                            "last-checked-at",
                            "check-frequency",
                          ],
                        )
                      ),
                    ),
                    128,
                  )),
          ])
        )
      );
    },
  }),
  Z = Object.assign(z, { __name: "BetterStackMonitors" }),
  J = { class: "better-stack better-stack--incidents" },
  K = { class: "better-stack--incidents__table-wrapper" },
  Q = { key: 0, class: "better-stack--incidents__empty" },
  U = { key: 1, class: "better-stack--incidents__loading" },
  W = g({
    __name: "BetterStackIncidents",
    setup(t) {
      const i = [
          { label: "Monitor" },
          { label: "Causa" },
          { label: "Inicio", align: "right" },
          { label: "Duración", align: "right" },
        ],
        _ = y(),
        a = h(!0),
        s = h([]),
        r = (c) =>
          new Date(c).toLocaleString("es-CL", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
      return (
        v(
          () => !0,
          async () => {
            try {
              ((a.value = !0),
                (s.value = await _("better-stack/incidents", {
                  method: "GET",
                })));
            } catch {
            } finally {
              a.value = !1;
            }
          },
          { immediate: !0 },
        ),
        (c, b) => {
          const p = N,
            I = T,
            x = A;
          return (
            n(),
            o("section", J, [
              b[2] ||
                (b[2] = e(
                  "div",
                  { class: "better-stack--incidents__header" },
                  [
                    e(
                      "h2",
                      { class: "better-stack--incidents__title" },
                      "Incidentes Recientes",
                    ),
                  ],
                  -1,
                )),
              e("div", K, [
                d(
                  x,
                  { columns: i },
                  {
                    default: u(() => [
                      (n(!0),
                      o(
                        C,
                        null,
                        $(
                          s.value,
                          (k) => (
                            n(),
                            B(
                              I,
                              { key: k.id },
                              {
                                default: u(() => [
                                  d(
                                    p,
                                    null,
                                    {
                                      default: u(() => [
                                        m(l(k.monitorName), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  d(
                                    p,
                                    null,
                                    {
                                      default: u(() => [m(l(k.cause), 1)]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  d(
                                    p,
                                    { align: "right" },
                                    {
                                      default: u(() => [
                                        m(l(r(k.startedAt)), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  d(
                                    p,
                                    { align: "right" },
                                    {
                                      default: u(() => [
                                        m(
                                          l(
                                            k.duration !== null
                                              ? `${k.duration} min`
                                              : "—",
                                          ),
                                          1,
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
                s.value.length === 0 && !a.value
                  ? (n(),
                    o("div", Q, [
                      ...(b[0] ||
                        (b[0] = [
                          e("p", null, "No hay incidentes recientes", -1),
                        ])),
                    ]))
                  : f("", !0),
                a.value
                  ? (n(),
                    o("div", U, [
                      ...(b[1] || (b[1] = [e("p", null, "Cargando...", -1)])),
                    ]))
                  : f("", !0),
              ]),
            ])
          );
        }
      );
    },
  }),
  X = Object.assign(W, { __name: "BetterStackIncidents" }),
  Y = {
    href: "https://uptime.betterstack.com",
    target: "_blank",
    rel: "noopener noreferrer",
    class: "btn btn--primary",
  },
  tt = { class: "better-stack better-stack--page" },
  et = { class: "better-stack--page__container" },
  rt = g({
    __name: "better-stack",
    setup(t) {
      const i = [
        { label: "Integraciones", to: "/dashboard/integrations" },
        { label: "Better Stack" },
      ];
      return (_, a) => {
        const s = S,
          r = D;
        return (
          n(),
          o("div", null, [
            d(
              r,
              { title: "Better Stack", breadcrumbs: i },
              {
                actions: u(() => [
                  e("a", Y, [
                    d(s, { style: { width: "16px", height: "16px" } }),
                    a[0] || (a[0] = m(" Better Stack ", -1)),
                  ]),
                ]),
                _: 1,
              },
            ),
            e("div", tt, [e("div", et, [d(Z), d(X)])]),
          ])
        );
      };
    },
  });
export { rt as default };
//# sourceMappingURL=gUpj4Zrw.js.map

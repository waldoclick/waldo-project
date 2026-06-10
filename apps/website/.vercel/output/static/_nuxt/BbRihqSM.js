import {
  aZ as B,
  b3 as P,
  bb as R,
  be as U,
  bE as Z,
  a_ as o,
  a$ as _,
  bf as t,
  b0 as n,
  b6 as f,
  b7 as g,
  b1 as d,
  b5 as x,
  bC as z,
  bs as m,
  bi as b,
  bG as $,
  c1 as j,
  b9 as E,
  b8 as F,
  br as L,
} from "./BK8sApmn.js";
import { _ as J } from "./vgLiQXkW.js";
import { u as K, _ as W, a as X } from "./Bn4ou5Ry.js";
import { _ as Y, a as ee } from "./BbtmlxJr.js";
import { _ as te } from "./D9c01Ql2.js";
import { d as ae, G as se } from "./DDIMZBEx.js";
import { f as le } from "./CjIigZ6h.js";
import { E as ne } from "./DvfQSOKW.js";
import "./CNKn_OHC.js";
import "./DmUMncXv.js";
import "./Cwrq1rl2.js";
try {
  let u =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    l = new u.Error().stack;
  l &&
    ((u._sentryDebugIds = u._sentryDebugIds || {}),
    (u._sentryDebugIds[l] = "dfd8a0ec-9b05-4449-9b3f-d5ed0d7bea0d"),
    (u._sentryDebugIdIdentifier =
      "sentry-dbid-dfd8a0ec-9b05-4449-9b3f-d5ed0d7bea0d"));
} catch {}
const oe = { class: "faqs faqs--default" },
  de = { class: "faqs--default__container" },
  re = { class: "faqs--default__header" },
  _e = { key: 0, class: "faqs--default__drag-note" },
  ie = { class: "faqs--default__table-wrapper" },
  ue = { class: "table table--default" },
  ce = { class: "table--default__table" },
  fe = ["disabled"],
  me = { key: 0, class: "faqs--default__question" },
  be = { key: 1, class: "faqs--default__question" },
  pe = { key: 0, class: "faqs--default__answer" },
  he = { key: 1, class: "faqs--default__answer" },
  ve = { class: "faqs--default__actions" },
  ge = ["onClick"],
  ye = ["onClick"],
  qe = { key: 0, class: "faqs--default__empty" },
  ke = { key: 1, class: "faqs--default__loading" },
  xe = { class: "faqs--default__footer" },
  Fe = { key: 0, class: "faqs--default__count" },
  Te = { key: 1, class: "faqs--default__saving" },
  I = "faqs",
  Ae = B({
    __name: "FaqsDefault",
    setup(u) {
      const l = K(),
        T = E(() => l.getFaqsFilters),
        y = (a) => {
          l.setFilters(I, a);
        },
        q = P(),
        r = F([]),
        p = F(!1),
        k = F(!1),
        h = E(() => !l.faqs.searchTerm),
        A = async () => {
          try {
            p.value = !0;
            const a = { pagination: { pageSize: 200 }, sort: l.faqs.sortBy };
            l.faqs.searchTerm &&
              (a.filters = {
                $or: [
                  { title: { $containsi: l.faqs.searchTerm } },
                  { text: { $containsi: l.faqs.searchTerm } },
                ],
              });
            const e = await q("faqs", { method: "GET", params: a });
            r.value = Array.isArray(e.data) ? e.data : [];
          } catch {
            r.value = [];
          } finally {
            p.value = !1;
          }
        },
        Q = async () => {
          if (h.value) {
            k.value = !0;
            try {
              const a = r.value.map((e, i) => ({
                documentId: e.documentId,
                order: i + 1,
              }));
              (await q("/faqs/reorder", { method: "POST", body: { data: a } }),
                (r.value = r.value.map((e, i) => ({ ...e, order: i + 1 }))));
            } catch {
              await A();
            } finally {
              k.value = !1;
            }
          }
        },
        S = [
          { value: "order:asc", label: "Orden asc." },
          { value: "order:desc", label: "Orden desc." },
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "title:asc", label: "Título A-Z" },
          { value: "title:desc", label: "Título Z-A" },
        ],
        v = (a) => {
          if (!a) return "";
          if (typeof document > "u") return a.replace(/<[^>]*>/g, "").trim();
          const e = document.createElement("DIV");
          return ((e.innerHTML = a), e.textContent || e.innerText || "");
        },
        D = (a, e) => {
          if (!a) return "-";
          const i = v(a);
          return i.length <= e ? i : i.slice(0, Math.max(0, e)) + "...";
        },
        w = R(),
        N = (a) => {
          w.push(`/dashboard/maintenance/faqs/${a}`);
        },
        O = (a) => {
          w.push(`/dashboard/maintenance/faqs/${a}/edit`);
        };
      return (
        U(
          [() => l.faqs.searchTerm, () => l.faqs.sortBy],
          () => {
            A();
          },
          { immediate: !0 },
        ),
        (a, e) => {
          const i = W,
            G = X,
            c = ee,
            C = te,
            H = Y,
            V = Z("tooltip");
          return (
            o(),
            _("section", oe, [
              t("div", de, [
                t("div", re, [
                  n(
                    i,
                    {
                      "model-value": f(l).faqs.searchTerm,
                      placeholder: "Buscar FAQs...",
                      class: "faqs--default__search",
                      "onUpdate:modelValue":
                        e[0] || (e[0] = (s) => f(l).setSearchTerm(I, s)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  n(
                    G,
                    {
                      "model-value": T.value,
                      "sort-options": S,
                      class: "faqs--default__filters",
                      "onUpdate:modelValue": y,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                h.value
                  ? g("", !0)
                  : (o(),
                    _(
                      "p",
                      _e,
                      " El arrastre para reordenar no esta disponible mientras se filtra. ",
                    )),
                t("div", ie, [
                  t("div", ue, [
                    t("table", ce, [
                      e[4] ||
                        (e[4] = t(
                          "thead",
                          { class: "table--default__header" },
                          [
                            t("tr", { class: "table--default__row" }, [
                              t("th", { class: "table--default__head" }),
                              t(
                                "th",
                                { class: "table--default__head" },
                                "Orden",
                              ),
                              t(
                                "th",
                                { class: "table--default__head" },
                                "Pregunta",
                              ),
                              t(
                                "th",
                                { class: "table--default__head" },
                                "Respuesta",
                              ),
                              t(
                                "th",
                                { class: "table--default__head" },
                                "Destacado",
                              ),
                              t(
                                "th",
                                { class: "table--default__head" },
                                "Fecha",
                              ),
                              t(
                                "th",
                                {
                                  class:
                                    "table--default__head table--default__head--right",
                                },
                                " Acciones ",
                              ),
                            ]),
                          ],
                          -1,
                        )),
                      n(
                        f(ae),
                        {
                          modelValue: r.value,
                          "onUpdate:modelValue":
                            e[1] || (e[1] = (s) => (r.value = s)),
                          tag: "tbody",
                          "item-key": "id",
                          handle: ".faqs--default__drag",
                          disabled: !h.value,
                          class: "table--default__body",
                          onEnd: Q,
                        },
                        {
                          item: d(({ element: s }) => [
                            (o(),
                            x(
                              H,
                              { key: s.id },
                              {
                                default: d(() => [
                                  n(c, null, {
                                    default: d(() => [
                                      t(
                                        "button",
                                        {
                                          class: z([
                                            "faqs--default__drag",
                                            {
                                              "faqs--default__drag--disabled":
                                                !h.value,
                                            },
                                          ]),
                                          disabled: !h.value,
                                          title: "Arrastrar para reordenar",
                                        },
                                        [
                                          n(f(se), {
                                            class: "faqs--default__drag__icon",
                                          }),
                                        ],
                                        10,
                                        fe,
                                      ),
                                    ]),
                                    _: 1,
                                  }),
                                  n(
                                    c,
                                    null,
                                    {
                                      default: d(() => [
                                        m(b(s.order ?? "-"), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  n(
                                    c,
                                    null,
                                    {
                                      default: d(() => [
                                        s.title
                                          ? $(
                                              (o(),
                                              _("div", me, [
                                                m(b(D(s.title, 60)), 1),
                                              ])),
                                              [
                                                [
                                                  V,
                                                  v(s.title).length > 60
                                                    ? v(s.title)
                                                    : "",
                                                ],
                                              ],
                                            )
                                          : (o(), _("div", be, "-")),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  n(
                                    c,
                                    null,
                                    {
                                      default: d(() => [
                                        s.text
                                          ? $(
                                              (o(),
                                              _("div", pe, [
                                                m(b(D(s.text, 80)), 1),
                                              ])),
                                              [
                                                [
                                                  V,
                                                  v(s.text).length > 80
                                                    ? v(s.text)
                                                    : "",
                                                ],
                                              ],
                                            )
                                          : (o(), _("div", he, "-")),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  n(
                                    c,
                                    null,
                                    {
                                      default: d(() => [
                                        s.featured
                                          ? (o(),
                                            x(
                                              C,
                                              { key: 0, variant: "default" },
                                              {
                                                default: d(() => [
                                                  ...(e[2] ||
                                                    (e[2] = [
                                                      m(" Destacado ", -1),
                                                    ])),
                                                ]),
                                                _: 1,
                                              },
                                            ))
                                          : (o(),
                                            x(
                                              C,
                                              { key: 1, variant: "outline" },
                                              {
                                                default: d(() => [
                                                  ...(e[3] ||
                                                    (e[3] = [
                                                      m(" No destacado ", -1),
                                                    ])),
                                                ]),
                                                _: 1,
                                              },
                                            )),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  n(
                                    c,
                                    null,
                                    {
                                      default: d(() => [
                                        m(b(f(le)(s.updatedAt)), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  n(
                                    c,
                                    { align: "right" },
                                    {
                                      default: d(() => [
                                        t("div", ve, [
                                          t(
                                            "button",
                                            {
                                              class: "faqs--default__action",
                                              title: "Ver FAQ",
                                              onClick: (M) => N(s.documentId),
                                            },
                                            [
                                              n(f(ne), {
                                                class:
                                                  "faqs--default__action__icon",
                                              }),
                                            ],
                                            8,
                                            ge,
                                          ),
                                          t(
                                            "button",
                                            {
                                              class: "faqs--default__action",
                                              title: "Editar FAQ",
                                              onClick: (M) => O(s.documentId),
                                            },
                                            [
                                              n(f(j), {
                                                class:
                                                  "faqs--default__action__icon",
                                              }),
                                            ],
                                            8,
                                            ye,
                                          ),
                                        ]),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                ]),
                                _: 2,
                              },
                              1024,
                            )),
                          ]),
                          _: 1,
                        },
                        8,
                        ["modelValue", "disabled"],
                      ),
                    ]),
                  ]),
                  r.value.length === 0 && !p.value
                    ? (o(),
                      _("div", qe, [
                        ...(e[5] ||
                          (e[5] = [
                            t("p", null, "No se encontraron FAQs", -1),
                          ])),
                      ]))
                    : g("", !0),
                  p.value
                    ? (o(),
                      _("div", ke, [
                        ...(e[6] ||
                          (e[6] = [t("p", null, "Cargando FAQs...", -1)])),
                      ]))
                    : g("", !0),
                ]),
                t("div", xe, [
                  p.value
                    ? g("", !0)
                    : (o(),
                      _(
                        "p",
                        Fe,
                        b(r.value.length) +
                          " registro" +
                          b(r.value.length !== 1 ? "s" : ""),
                        1,
                      )),
                  k.value ? (o(), _("p", Te, "Guardando orden...")) : g("", !0),
                ]),
              ]),
            ])
          );
        }
      );
    },
  }),
  De = Object.assign(Ae, { __name: "FaqsDefault" }),
  Ge = B({
    __name: "index",
    setup(u) {
      const l = [{ label: "FAQs" }];
      return (T, y) => {
        const q = L,
          r = J;
        return (
          o(),
          _("div", null, [
            n(
              r,
              { title: "FAQs", breadcrumbs: l },
              {
                actions: d(() => [
                  n(
                    q,
                    {
                      class: "btn btn--primary",
                      to: "/dashboard/maintenance/faqs/new",
                    },
                    {
                      default: d(() => [
                        ...(y[0] || (y[0] = [m(" Agregar FAQ ", -1)])),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                _: 1,
              },
            ),
            n(De),
          ])
        );
      };
    },
  });
export { Ge as default };
//# sourceMappingURL=BbRihqSM.js.map

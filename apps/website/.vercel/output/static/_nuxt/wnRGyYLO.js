import {
  aZ as I,
  b3 as M,
  bb as R,
  be as U,
  bE as Z,
  a_ as n,
  a$ as d,
  bf as t,
  b0 as l,
  b6 as b,
  b7 as v,
  b1 as r,
  b5 as q,
  bC as z,
  bs as g,
  bi as h,
  bG as $,
  c1 as j,
  b9 as A,
  b8 as k,
  br as L,
} from "./BK8sApmn.js";
import { _ as J } from "./vgLiQXkW.js";
import { u as K, _ as Q, a as W } from "./Bn4ou5Ry.js";
import { _ as X, a as Y } from "./BbtmlxJr.js";
import { d as ee, G as ae } from "./DDIMZBEx.js";
import { f as te } from "./CjIigZ6h.js";
import { E as se } from "./DvfQSOKW.js";
import "./CNKn_OHC.js";
import "./DmUMncXv.js";
import "./Cwrq1rl2.js";
try {
  let _ =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    o = new _.Error().stack;
  o &&
    ((_._sentryDebugIds = _._sentryDebugIds || {}),
    (_._sentryDebugIds[o] = "0e855b8a-2b22-4f7b-954f-261d9053dc6d"),
    (_._sentryDebugIdIdentifier =
      "sentry-dbid-0e855b8a-2b22-4f7b-954f-261d9053dc6d"));
} catch {}
const oe = { class: "policies policies--dashboard" },
  le = { class: "policies--dashboard__container" },
  ie = { class: "policies--dashboard__header" },
  ne = { key: 0, class: "policies--dashboard__drag-note" },
  de = { class: "policies--dashboard__table-wrapper" },
  re = { class: "table table--default" },
  ce = { class: "table--default__table" },
  _e = ["disabled"],
  ue = { key: 0, class: "policies--dashboard__question" },
  be = { key: 1, class: "policies--dashboard__question" },
  pe = { key: 0, class: "policies--dashboard__answer" },
  he = { key: 1, class: "policies--dashboard__answer" },
  me = { class: "policies--dashboard__actions" },
  fe = ["onClick"],
  ve = ["onClick"],
  ge = { key: 0, class: "policies--dashboard__empty" },
  ye = { key: 1, class: "policies--dashboard__loading" },
  xe = { class: "policies--dashboard__footer" },
  Te = { key: 0, class: "policies--dashboard__count" },
  ke = { key: 1, class: "policies--dashboard__saving" },
  E = "policies",
  we = I({
    __name: "PoliciesDashboard",
    setup(_) {
      const o = K(),
        w = A(() => o.getPoliciesFilters),
        y = (a) => {
          o.setFilters(E, a);
        },
        x = M(),
        i = k([]),
        u = k(!1),
        T = k(!1),
        m = A(() => !o.policies.searchTerm),
        P = async () => {
          try {
            u.value = !0;
            const a = {
              pagination: { pageSize: 200 },
              sort: o.policies.sortBy,
            };
            o.policies.searchTerm &&
              (a.filters = {
                $or: [
                  { title: { $containsi: o.policies.searchTerm } },
                  { text: { $containsi: o.policies.searchTerm } },
                ],
              });
            const e = await x("policies", { method: "GET", params: a });
            i.value = Array.isArray(e.data) ? e.data : [];
          } catch {
            i.value = [];
          } finally {
            u.value = !1;
          }
        },
        S = async () => {
          if (m.value) {
            T.value = !0;
            try {
              const a = i.value.map((e, c) => ({
                documentId: e.documentId,
                order: c + 1,
              }));
              (await x("/policies/reorder", {
                method: "POST",
                body: { data: a },
              }),
                (i.value = i.value.map((e, c) => ({ ...e, order: c + 1 }))));
            } catch {
              await P();
            } finally {
              T.value = !1;
            }
          }
        },
        B = [
          { value: "order:asc", label: "Orden asc." },
          { value: "order:desc", label: "Orden desc." },
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "title:asc", label: "Título A-Z" },
          { value: "title:desc", label: "Título Z-A" },
        ],
        f = (a) => {
          if (!a) return "";
          if (typeof document > "u") return a.replace(/<[^>]*>/g, "").trim();
          const e = document.createElement("DIV");
          return ((e.innerHTML = a), e.textContent || e.innerText || "");
        },
        C = (a, e) => {
          if (!a) return "-";
          const c = f(a);
          return c.length <= e ? c : c.slice(0, Math.max(0, e)) + "...";
        },
        D = R(),
        N = (a) => {
          D.push(`/dashboard/maintenance/policies/${a}`);
        },
        O = (a) => {
          D.push(`/dashboard/maintenance/policies/${a}/edit`);
        };
      return (
        U(
          [() => o.policies.searchTerm, () => o.policies.sortBy],
          () => {
            P();
          },
          { immediate: !0 },
        ),
        (a, e) => {
          const c = Q,
            F = W,
            p = Y,
            G = X,
            V = Z("tooltip");
          return (
            n(),
            d("section", oe, [
              t("div", le, [
                t("div", ie, [
                  l(
                    c,
                    {
                      "model-value": b(o).policies.searchTerm,
                      placeholder: "Buscar Politicas...",
                      class: "policies--dashboard__search",
                      "onUpdate:modelValue":
                        e[0] || (e[0] = (s) => b(o).setSearchTerm(E, s)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  l(
                    F,
                    {
                      "model-value": w.value,
                      "sort-options": B,
                      class: "policies--dashboard__filters",
                      "onUpdate:modelValue": y,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                m.value
                  ? v("", !0)
                  : (n(),
                    d(
                      "p",
                      ne,
                      " El arrastre para reordenar no esta disponible mientras se filtra. ",
                    )),
                t("div", de, [
                  t("div", re, [
                    t("table", ce, [
                      e[2] ||
                        (e[2] = t(
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
                                "Título",
                              ),
                              t(
                                "th",
                                { class: "table--default__head" },
                                "Contenido",
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
                      l(
                        b(ee),
                        {
                          modelValue: i.value,
                          "onUpdate:modelValue":
                            e[1] || (e[1] = (s) => (i.value = s)),
                          tag: "tbody",
                          "item-key": "id",
                          handle: ".policies--dashboard__drag",
                          disabled: !m.value,
                          class: "table--default__body",
                          onEnd: S,
                        },
                        {
                          item: r(({ element: s }) => [
                            (n(),
                            q(
                              G,
                              { key: s.id },
                              {
                                default: r(() => [
                                  l(p, null, {
                                    default: r(() => [
                                      t(
                                        "button",
                                        {
                                          class: z([
                                            "policies--dashboard__drag",
                                            {
                                              "policies--dashboard__drag--disabled":
                                                !m.value,
                                            },
                                          ]),
                                          disabled: !m.value,
                                          title: "Arrastrar para reordenar",
                                        },
                                        [
                                          l(b(ae), {
                                            class:
                                              "policies--dashboard__drag__icon",
                                          }),
                                        ],
                                        10,
                                        _e,
                                      ),
                                    ]),
                                    _: 1,
                                  }),
                                  l(
                                    p,
                                    null,
                                    {
                                      default: r(() => [
                                        g(h(s.order ?? "-"), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  l(
                                    p,
                                    null,
                                    {
                                      default: r(() => [
                                        s.title
                                          ? $(
                                              (n(),
                                              d("div", ue, [
                                                g(h(C(s.title, 60)), 1),
                                              ])),
                                              [
                                                [
                                                  V,
                                                  f(s.title).length > 60
                                                    ? f(s.title)
                                                    : "",
                                                ],
                                              ],
                                            )
                                          : (n(), d("div", be, "-")),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  l(
                                    p,
                                    null,
                                    {
                                      default: r(() => [
                                        s.text
                                          ? $(
                                              (n(),
                                              d("div", pe, [
                                                g(h(C(s.text, 80)), 1),
                                              ])),
                                              [
                                                [
                                                  V,
                                                  f(s.text).length > 80
                                                    ? f(s.text)
                                                    : "",
                                                ],
                                              ],
                                            )
                                          : (n(), d("div", he, "-")),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  l(
                                    p,
                                    null,
                                    {
                                      default: r(() => [
                                        g(h(b(te)(s.updatedAt)), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  l(
                                    p,
                                    { align: "right" },
                                    {
                                      default: r(() => [
                                        t("div", me, [
                                          t(
                                            "button",
                                            {
                                              class:
                                                "policies--dashboard__action",
                                              title: "Ver Politica",
                                              onClick: (H) => N(s.documentId),
                                            },
                                            [
                                              l(b(se), {
                                                class:
                                                  "policies--dashboard__action__icon",
                                              }),
                                            ],
                                            8,
                                            fe,
                                          ),
                                          t(
                                            "button",
                                            {
                                              class:
                                                "policies--dashboard__action",
                                              title: "Editar Politica",
                                              onClick: (H) => O(s.documentId),
                                            },
                                            [
                                              l(b(j), {
                                                class:
                                                  "policies--dashboard__action__icon",
                                              }),
                                            ],
                                            8,
                                            ve,
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
                  i.value.length === 0 && !u.value
                    ? (n(),
                      d("div", ge, [
                        ...(e[3] ||
                          (e[3] = [
                            t("p", null, "No se encontraron politicas", -1),
                          ])),
                      ]))
                    : v("", !0),
                  u.value
                    ? (n(),
                      d("div", ye, [
                        ...(e[4] ||
                          (e[4] = [t("p", null, "Cargando politicas...", -1)])),
                      ]))
                    : v("", !0),
                ]),
                t("div", xe, [
                  u.value
                    ? v("", !0)
                    : (n(),
                      d(
                        "p",
                        Te,
                        h(i.value.length) +
                          " registro" +
                          h(i.value.length !== 1 ? "s" : ""),
                        1,
                      )),
                  T.value
                    ? (n(), d("p", ke, " Guardando orden... "))
                    : v("", !0),
                ]),
              ]),
            ])
          );
        }
      );
    },
  }),
  Pe = Object.assign(we, { __name: "PoliciesDashboard" }),
  Oe = I({
    __name: "index",
    setup(_) {
      const o = [{ label: "Politicas" }];
      return (w, y) => {
        const x = L,
          i = J,
          u = Pe;
        return (
          n(),
          d("div", null, [
            l(
              i,
              { title: "Politicas de Privacidad", breadcrumbs: o },
              {
                actions: r(() => [
                  l(
                    x,
                    {
                      class: "btn btn--primary",
                      to: "/dashboard/maintenance/policies/new",
                    },
                    {
                      default: r(() => [
                        ...(y[0] || (y[0] = [g(" Agregar Politica ", -1)])),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                _: 1,
              },
            ),
            l(u),
          ])
        );
      };
    },
  });
export { Oe as default };
//# sourceMappingURL=wnRGyYLO.js.map

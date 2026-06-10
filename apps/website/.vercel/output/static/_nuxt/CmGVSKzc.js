import {
  aZ as S,
  b3 as M,
  bb as P,
  be as R,
  bE as Z,
  a_ as d,
  a$ as l,
  bf as a,
  b0 as r,
  b6 as m,
  b7 as v,
  b1 as i,
  b5 as q,
  bC as z,
  bs as g,
  bi as h,
  bG as A,
  c1 as j,
  b9 as E,
  b8 as C,
  br as L,
} from "./BK8sApmn.js";
import { _ as J } from "./vgLiQXkW.js";
import { u as K, _ as Q, a as W } from "./Bn4ou5Ry.js";
import { _ as X, a as Y } from "./BbtmlxJr.js";
import { d as ee, G as te } from "./DDIMZBEx.js";
import { f as ae } from "./CjIigZ6h.js";
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
    (_._sentryDebugIds[o] = "3fba5b25-e355-4f43-89cb-e69429f2462b"),
    (_._sentryDebugIdIdentifier =
      "sentry-dbid-3fba5b25-e355-4f43-89cb-e69429f2462b"));
} catch {}
const oe = { class: "terms terms--dashboard" },
  re = { class: "terms--dashboard__container" },
  ne = { class: "terms--dashboard__header" },
  de = { key: 0, class: "terms--dashboard__drag-note" },
  le = { class: "terms--dashboard__table-wrapper" },
  ie = { class: "table table--default" },
  ce = { class: "table--default__table" },
  _e = ["disabled"],
  ue = { key: 0, class: "terms--dashboard__question" },
  me = { key: 1, class: "terms--dashboard__question" },
  be = { key: 0, class: "terms--dashboard__answer" },
  he = { key: 1, class: "terms--dashboard__answer" },
  pe = { class: "terms--dashboard__actions" },
  fe = ["onClick"],
  ve = ["onClick"],
  ge = { key: 0, class: "terms--dashboard__empty" },
  ye = { key: 1, class: "terms--dashboard__loading" },
  Te = { class: "terms--dashboard__footer" },
  xe = { key: 0, class: "terms--dashboard__count" },
  Ce = { key: 1, class: "terms--dashboard__saving" },
  I = "terms",
  ke = S({
    __name: "TermsDashboard",
    setup(_) {
      const o = K(),
        k = E(() => o.getTermsFilters),
        y = (t) => {
          o.setFilters(I, t);
        },
        T = M(),
        n = C([]),
        u = C(!1),
        x = C(!1),
        p = E(() => !o.terms.searchTerm),
        w = async () => {
          try {
            u.value = !0;
            const t = { pagination: { pageSize: 200 }, sort: o.terms.sortBy };
            o.terms.searchTerm &&
              (t.filters = {
                $or: [
                  { title: { $containsi: o.terms.searchTerm } },
                  { text: { $containsi: o.terms.searchTerm } },
                ],
              });
            const e = await T("terms", { method: "GET", params: t });
            n.value = Array.isArray(e.data) ? e.data : [];
          } catch {
            n.value = [];
          } finally {
            u.value = !1;
          }
        },
        B = async () => {
          if (p.value) {
            x.value = !0;
            try {
              const t = n.value.map((e, c) => ({
                documentId: e.documentId,
                order: c + 1,
              }));
              (await T("/terms/reorder", { method: "POST", body: { data: t } }),
                (n.value = n.value.map((e, c) => ({ ...e, order: c + 1 }))));
            } catch {
              await w();
            } finally {
              x.value = !1;
            }
          }
        },
        N = [
          { value: "order:asc", label: "Orden asc." },
          { value: "order:desc", label: "Orden desc." },
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "title:asc", label: "Título A-Z" },
          { value: "title:desc", label: "Título Z-A" },
        ],
        f = (t) => {
          if (!t) return "";
          if (typeof document > "u") return t.replace(/<[^>]*>/g, "").trim();
          const e = document.createElement("DIV");
          return ((e.innerHTML = t), e.textContent || e.innerText || "");
        },
        D = (t, e) => {
          if (!t) return "-";
          const c = f(t);
          return c.length <= e ? c : c.slice(0, Math.max(0, e)) + "...";
        },
        V = P(),
        O = (t) => {
          V.push(`/dashboard/maintenance/terms/${t}`);
        },
        F = (t) => {
          V.push(`/dashboard/maintenance/terms/${t}/edit`);
        };
      return (
        R(
          [() => o.terms.searchTerm, () => o.terms.sortBy],
          () => {
            w();
          },
          { immediate: !0 },
        ),
        (t, e) => {
          const c = Q,
            G = W,
            b = Y,
            U = X,
            $ = Z("tooltip");
          return (
            d(),
            l("section", oe, [
              a("div", re, [
                a("div", ne, [
                  r(
                    c,
                    {
                      "model-value": m(o).terms.searchTerm,
                      placeholder: "Buscar Condiciones...",
                      class: "terms--dashboard__search",
                      "onUpdate:modelValue":
                        e[0] || (e[0] = (s) => m(o).setSearchTerm(I, s)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  r(
                    G,
                    {
                      "model-value": k.value,
                      "sort-options": N,
                      class: "terms--dashboard__filters",
                      "onUpdate:modelValue": y,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                p.value
                  ? v("", !0)
                  : (d(),
                    l(
                      "p",
                      de,
                      " El arrastre para reordenar no esta disponible mientras se filtra. ",
                    )),
                a("div", le, [
                  a("div", ie, [
                    a("table", ce, [
                      e[2] ||
                        (e[2] = a(
                          "thead",
                          { class: "table--default__header" },
                          [
                            a("tr", { class: "table--default__row" }, [
                              a("th", { class: "table--default__head" }),
                              a(
                                "th",
                                { class: "table--default__head" },
                                "Orden",
                              ),
                              a(
                                "th",
                                { class: "table--default__head" },
                                "Título",
                              ),
                              a(
                                "th",
                                { class: "table--default__head" },
                                "Contenido",
                              ),
                              a(
                                "th",
                                { class: "table--default__head" },
                                "Fecha",
                              ),
                              a(
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
                      r(
                        m(ee),
                        {
                          modelValue: n.value,
                          "onUpdate:modelValue":
                            e[1] || (e[1] = (s) => (n.value = s)),
                          tag: "tbody",
                          "item-key": "id",
                          handle: ".terms--dashboard__drag",
                          disabled: !p.value,
                          class: "table--default__body",
                          onEnd: B,
                        },
                        {
                          item: i(({ element: s }) => [
                            (d(),
                            q(
                              U,
                              { key: s.id },
                              {
                                default: i(() => [
                                  r(b, null, {
                                    default: i(() => [
                                      a(
                                        "button",
                                        {
                                          class: z([
                                            "terms--dashboard__drag",
                                            {
                                              "terms--dashboard__drag--disabled":
                                                !p.value,
                                            },
                                          ]),
                                          disabled: !p.value,
                                          title: "Arrastrar para reordenar",
                                        },
                                        [
                                          r(m(te), {
                                            class:
                                              "terms--dashboard__drag__icon",
                                          }),
                                        ],
                                        10,
                                        _e,
                                      ),
                                    ]),
                                    _: 1,
                                  }),
                                  r(
                                    b,
                                    null,
                                    {
                                      default: i(() => [
                                        g(h(s.order ?? "-"), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  r(
                                    b,
                                    null,
                                    {
                                      default: i(() => [
                                        s.title
                                          ? A(
                                              (d(),
                                              l("div", ue, [
                                                g(h(D(s.title, 60)), 1),
                                              ])),
                                              [
                                                [
                                                  $,
                                                  f(s.title).length > 60
                                                    ? f(s.title)
                                                    : "",
                                                ],
                                              ],
                                            )
                                          : (d(), l("div", me, "-")),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  r(
                                    b,
                                    null,
                                    {
                                      default: i(() => [
                                        s.text
                                          ? A(
                                              (d(),
                                              l("div", be, [
                                                g(h(D(s.text, 80)), 1),
                                              ])),
                                              [
                                                [
                                                  $,
                                                  f(s.text).length > 80
                                                    ? f(s.text)
                                                    : "",
                                                ],
                                              ],
                                            )
                                          : (d(), l("div", he, "-")),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  r(
                                    b,
                                    null,
                                    {
                                      default: i(() => [
                                        g(h(m(ae)(s.updatedAt)), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  r(
                                    b,
                                    { align: "right" },
                                    {
                                      default: i(() => [
                                        a("div", pe, [
                                          a(
                                            "button",
                                            {
                                              class: "terms--dashboard__action",
                                              title: "Ver Condicion",
                                              onClick: (H) => O(s.documentId),
                                            },
                                            [
                                              r(m(se), {
                                                class:
                                                  "terms--dashboard__action__icon",
                                              }),
                                            ],
                                            8,
                                            fe,
                                          ),
                                          a(
                                            "button",
                                            {
                                              class: "terms--dashboard__action",
                                              title: "Editar Condicion",
                                              onClick: (H) => F(s.documentId),
                                            },
                                            [
                                              r(m(j), {
                                                class:
                                                  "terms--dashboard__action__icon",
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
                  n.value.length === 0 && !u.value
                    ? (d(),
                      l("div", ge, [
                        ...(e[3] ||
                          (e[3] = [
                            a("p", null, "No se encontraron condiciones", -1),
                          ])),
                      ]))
                    : v("", !0),
                  u.value
                    ? (d(),
                      l("div", ye, [
                        ...(e[4] ||
                          (e[4] = [
                            a("p", null, "Cargando condiciones...", -1),
                          ])),
                      ]))
                    : v("", !0),
                ]),
                a("div", Te, [
                  u.value
                    ? v("", !0)
                    : (d(),
                      l(
                        "p",
                        xe,
                        h(n.value.length) +
                          " registro" +
                          h(n.value.length !== 1 ? "s" : ""),
                        1,
                      )),
                  x.value ? (d(), l("p", Ce, "Guardando orden...")) : v("", !0),
                ]),
              ]),
            ])
          );
        }
      );
    },
  }),
  we = Object.assign(ke, { __name: "TermsDashboard" }),
  Fe = S({
    __name: "index",
    setup(_) {
      const o = [{ label: "Condiciones de Uso" }];
      return (k, y) => {
        const T = L,
          n = J,
          u = we;
        return (
          d(),
          l("div", null, [
            r(
              n,
              { title: "Condiciones de Uso", breadcrumbs: o },
              {
                actions: i(() => [
                  r(
                    T,
                    {
                      class: "btn btn--primary",
                      to: "/dashboard/maintenance/terms/new",
                    },
                    {
                      default: i(() => [
                        ...(y[0] || (y[0] = [g(" Agregar Condicion ", -1)])),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                _: 1,
              },
            ),
            r(u),
          ])
        );
      };
    },
  });
export { Fe as default };
//# sourceMappingURL=CmGVSKzc.js.map

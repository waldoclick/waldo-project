import {
  bD as X,
  aZ as J,
  b3 as K,
  bb as le,
  be as ee,
  bE as oe,
  a_ as u,
  a$ as b,
  bf as e,
  b0 as d,
  b6 as g,
  b1 as y,
  bn as M,
  bo as te,
  b5 as F,
  bs as D,
  bi as B,
  bG as Y,
  c1 as ne,
  b7 as N,
  b9 as P,
  b8 as m,
  bk as ae,
  bJ as ie,
  bC as Q,
  bQ as re,
  bV as Z,
  cP as ce,
  bO as W,
  br as ue,
} from "./BK8sApmn.js";
import { _ as de } from "./vgLiQXkW.js";
import { u as _e, _ as be, a as pe } from "./Bn4ou5Ry.js";
import { _ as fe, a as he } from "./BbtmlxJr.js";
import { _ as ve } from "./D9c01Ql2.js";
import { _ as me } from "./C4RpNa5i.js";
import { _ as ge } from "./BSFPidNw.js";
import { f as ye } from "./CjIigZ6h.js";
import { E as xe } from "./DvfQSOKW.js";
import { u as we } from "./0mH1i9X5.js";
import "./CNKn_OHC.js";
import "./DmUMncXv.js";
import "./Cwrq1rl2.js";
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
    x = new c.Error().stack;
  x &&
    ((c._sentryDebugIds = c._sentryDebugIds || {}),
    (c._sentryDebugIds[x] = "12789b52-6384-48d6-a905-a1cdc78f75ec"),
    (c._sentryDebugIdIdentifier =
      "sentry-dbid-12789b52-6384-48d6-a905-a1cdc78f75ec"));
} catch {}
const ke = X("trash-2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }],
]);
const Ce = X("wand-sparkles", [
    [
      "path",
      {
        d: "m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72",
        key: "ul74o6",
      },
    ],
    ["path", { d: "m14 7 3 3", key: "1r5n42" }],
    ["path", { d: "M5 6v4", key: "ilb8ba" }],
    ["path", { d: "M19 14v4", key: "blhpug" }],
    ["path", { d: "M10 2v2", key: "7u0qdc" }],
    ["path", { d: "M7 8H3", key: "zfb6yr" }],
    ["path", { d: "M21 16h-4", key: "1cnmox" }],
    ["path", { d: "M11 3H9", key: "1obp7u" }],
  ]),
  Te = { class: "articles articles--default" },
  Se = { class: "articles--default__container" },
  $e = { class: "articles--default__header" },
  Ae = { class: "articles--default__table-wrapper" },
  Be = { key: 0, class: "articles--default__title" },
  De = { key: 1, class: "articles--default__title" },
  Ie = { class: "articles--default__actions" },
  Ee = ["onClick"],
  Me = ["onClick"],
  Pe = ["onClick"],
  Oe = { key: 0, class: "articles--default__empty" },
  Le = { key: 1, class: "articles--default__loading" },
  G = "articles",
  Ne = J({
    __name: "ArticlesDefault",
    setup(c, { expose: x }) {
      const o = _e(),
        C = P(() => o.getArticlesFilters),
        w = (n) => {
          o.setFilters(G, n);
        },
        r = m([]),
        i = m(!1),
        T = m(null),
        { Swal: _ } = ae(),
        I = K(),
        O = le(),
        A = async () => {
          try {
            i.value = !0;
            const n = {
              pagination: {
                page: o.articles.currentPage,
                pageSize: o.articles.pageSize,
              },
              sort: o.articles.sortBy,
            };
            o.articles.searchTerm &&
              (n.filters = { title: { $containsi: o.articles.searchTerm } });
            const l = await I("articles", { method: "GET", params: n });
            ((r.value = Array.isArray(l.data) ? l.data : []),
              (T.value = l.meta?.pagination || null));
          } catch {
            r.value = [];
          } finally {
            i.value = !1;
          }
        },
        k = async (n) => {
          if (
            (
              await _.fire({
                title: "¿Eliminar artículo?",
                text: `"${n.title}" será eliminado permanentemente.`,
                icon: "warning",
                showCancelButton: !0,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar",
              })
            ).isConfirmed
          )
            try {
              (await I(`/articles/${n.documentId || n.id}`, {
                method: "DELETE",
              }),
                await A(),
                await _.fire(
                  "Eliminado",
                  "El artículo fue eliminado.",
                  "success",
                ));
            } catch {
              await _.fire(
                "Error",
                "No se pudo eliminar el artículo.",
                "error",
              );
            }
        },
        h = P(() => r.value),
        S = P(() => T.value?.pageCount || 1),
        f = P(() => T.value?.total || 0),
        R = [
          { label: "ID" },
          { label: "Título" },
          { label: "Estado" },
          { label: "Fecha" },
          { label: "Acciones", align: "right" },
        ],
        L = [
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "title:asc", label: "Título A-Z" },
          { value: "title:desc", label: "Título Z-A" },
        ],
        U = (n, l) =>
          n ? (n.length <= l ? n : n.slice(0, Math.max(0, l)) + "...") : "-",
        V = (n) => {
          O.push(`/dashboard/articles/${n.documentId || n.id}`);
        },
        q = (n) => {
          O.push(`/dashboard/articles/${n.documentId || n.id}/edit`);
        };
      return (
        ee(
          [
            () => o.articles.searchTerm,
            () => o.articles.sortBy,
            () => o.articles.pageSize,
            () => o.articles.currentPage,
          ],
          () => {
            A();
          },
          { immediate: !0 },
        ),
        x({ fetchArticles: A }),
        (n, l) => {
          const s = be,
            t = pe,
            a = he,
            v = ve,
            $ = fe,
            E = me,
            z = ge,
            se = oe("tooltip");
          return (
            u(),
            b("section", Te, [
              e("div", Se, [
                e("div", $e, [
                  d(
                    s,
                    {
                      "model-value": g(o).articles.searchTerm,
                      placeholder: "Buscar artículos...",
                      class: "articles--default__search",
                      "onUpdate:modelValue":
                        l[0] || (l[0] = (p) => g(o).setSearchTerm(G, p)),
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                  d(
                    t,
                    {
                      "model-value": C.value,
                      "sort-options": L,
                      "page-sizes": [10, 25, 50, 100],
                      class: "articles--default__filters",
                      "onUpdate:modelValue": w,
                    },
                    null,
                    8,
                    ["model-value"],
                  ),
                ]),
                e("div", Ae, [
                  d(
                    E,
                    { columns: R },
                    {
                      default: y(() => [
                        (u(!0),
                        b(
                          M,
                          null,
                          te(
                            h.value,
                            (p) => (
                              u(),
                              F(
                                $,
                                { key: p.id },
                                {
                                  default: y(() => [
                                    d(
                                      a,
                                      null,
                                      {
                                        default: y(() => [D(B(p.id), 1)]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    d(
                                      a,
                                      null,
                                      {
                                        default: y(() => [
                                          p.title
                                            ? Y(
                                                (u(),
                                                b("div", Be, [
                                                  D(B(U(p.title, 60)), 1),
                                                ])),
                                                [
                                                  [
                                                    se,
                                                    p.title.length > 60
                                                      ? p.title
                                                      : "",
                                                  ],
                                                ],
                                              )
                                            : (u(), b("div", De, "-")),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    d(
                                      a,
                                      null,
                                      {
                                        default: y(() => [
                                          p.publishedAt
                                            ? (u(),
                                              F(
                                                v,
                                                { key: 0, variant: "default" },
                                                {
                                                  default: y(() => [
                                                    ...(l[2] ||
                                                      (l[2] = [
                                                        D(" Publicado ", -1),
                                                      ])),
                                                  ]),
                                                  _: 1,
                                                },
                                              ))
                                            : (u(),
                                              F(
                                                v,
                                                { key: 1, variant: "outline" },
                                                {
                                                  default: y(() => [
                                                    ...(l[3] ||
                                                      (l[3] = [
                                                        D(" Borrador ", -1),
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
                                    d(
                                      a,
                                      null,
                                      {
                                        default: y(() => [
                                          D(B(g(ye)(p.updatedAt)), 1),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    ),
                                    d(
                                      a,
                                      { align: "right" },
                                      {
                                        default: y(() => [
                                          e("div", Ie, [
                                            e(
                                              "button",
                                              {
                                                class:
                                                  "articles--default__action",
                                                title: "Ver artículo",
                                                onClick: (j) => V(p),
                                              },
                                              [
                                                d(g(xe), {
                                                  class:
                                                    "articles--default__action__icon",
                                                }),
                                              ],
                                              8,
                                              Ee,
                                            ),
                                            e(
                                              "button",
                                              {
                                                class:
                                                  "articles--default__action",
                                                title: "Editar artículo",
                                                onClick: (j) => q(p),
                                              },
                                              [
                                                d(g(ne), {
                                                  class:
                                                    "articles--default__action__icon",
                                                }),
                                              ],
                                              8,
                                              Me,
                                            ),
                                            e(
                                              "button",
                                              {
                                                class:
                                                  "articles--default__action articles--default__action--danger",
                                                title: "Eliminar artículo",
                                                onClick: (j) => k(p),
                                              },
                                              [
                                                d(g(ke), {
                                                  class:
                                                    "articles--default__action__icon",
                                                }),
                                              ],
                                              8,
                                              Pe,
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
                              )
                            ),
                          ),
                          128,
                        )),
                      ]),
                      _: 1,
                    },
                  ),
                  h.value.length === 0 && !i.value
                    ? (u(),
                      b("div", Oe, [
                        ...(l[4] ||
                          (l[4] = [
                            e("p", null, "No se encontraron artículos", -1),
                          ])),
                      ]))
                    : N("", !0),
                  i.value
                    ? (u(),
                      b("div", Le, [
                        ...(l[5] ||
                          (l[5] = [e("p", null, "Cargando artículos...", -1)])),
                      ]))
                    : N("", !0),
                ]),
                d(
                  z,
                  {
                    "current-page": g(o).articles.currentPage,
                    "total-pages": S.value,
                    "total-records": f.value,
                    "page-size": g(o).articles.pageSize,
                    class: "articles--default__pagination",
                    onPageChange:
                      l[1] || (l[1] = (p) => g(o).setCurrentPage(G, p)),
                  },
                  null,
                  8,
                  ["current-page", "total-pages", "total-records", "page-size"],
                ),
              ]),
            ])
          );
        }
      );
    },
  }),
  Re = Object.assign(Ne, { __name: "ArticlesDefault" }),
  Ue = ie(
    "search",
    () => {
      const c = m({});
      function x(r) {
        return c.value[r] ?? null;
      }
      function o(r) {
        const i = c.value[r];
        return r in c.value && i !== void 0 && i.results.length > 0;
      }
      function C(r, i) {
        c.value[r] = { results: i, fetchedAt: Date.now() };
      }
      function w(r) {
        r !== void 0 ? delete c.value[r] : (c.value = {});
      }
      return {
        tavily: c,
        getTavily: x,
        hasTavily: o,
        setTavily: C,
        clearTavily: w,
      };
    },
    {
      persist: {
        storage: typeof window < "u" ? localStorage : void 0,
        key: "search",
      },
    },
  ),
  Ve = {
    class: "lightbox--articles__box",
    role: "dialog",
    "aria-modal": "true",
  },
  qe = { class: "lightbox--articles__field" },
  ze = {
    class: "lightbox--articles__actions lightbox--articles__actions--end",
  },
  Fe = ["disabled"],
  Ge = { key: 0, class: "lightbox--articles__table" },
  He = ["onClick"],
  Ye = {
    class:
      "lightbox--articles__table__cell lightbox--articles__table__cell--check",
  },
  Je = ["checked", "onChange"],
  je = {
    class:
      "lightbox--articles__table__cell lightbox--articles__table__cell--title",
  },
  Qe = { class: "lightbox--articles__table__title" },
  Ze = ["href"],
  We = { class: "lightbox--articles__table__date" },
  Xe = { key: 1, class: "lightbox--articles__empty" },
  Ke = { class: "lightbox--articles__actions" },
  et = ["disabled"],
  tt = { class: "lightbox--articles__field" },
  at = { class: "lightbox--articles__actions" },
  st = ["disabled"],
  H = `You are an industrial news editor writing for a blog about industrial assets and productive sectors.

You will receive the title, content, source URL, and publication date of a real news article.

Your task is to rewrite the news as an original article suitable for a professional audience interested in industrial sectors.

Requirements:

1. The article MUST be written in Spanish.

2. Rewrite the information completely in your own words.
   Do NOT copy sentences from the original text.

3. Preserve the main facts and meaning of the news but improve clarity and readability.

4. Structure the article as:

* title
* header (2–3 sentence introduction)
* body (4–6 paragraphs)

5. The body MUST be written using **Markdown only**.

* Use paragraphs separated by line breaks.
* Highlight important keywords using **bold**.
* DO NOT use HTML tags.

6. The response MUST be **valid JSON only**. Do not include explanations, markdown wrappers, or additional text.

JSON format:

{
"title": "string",
"header": "string",
"body": "string",
"seo_title": "string",
"seo_description": "string"
}`,
  lt = 1,
  ot = J({
    __name: "LightBoxArticles",
    props: { isOpen: { type: Boolean } },
    emits: ["close", "created"],
    setup(c, { emit: x }) {
      const o = c,
        C = x,
        w = K(),
        { Swal: r } = ae(),
        i = Ue(),
        T = we(),
        _ = m(1),
        O = new Date().toLocaleString("en-US", {
          month: "long",
          year: "numeric",
        }),
        A = m(`latest industrial machinery Chile mining industry news ${O}`),
        k = m([]),
        h = m(new Set()),
        S = m(H),
        f = m(!1),
        R = P(() => {
          const [s] = h.value;
          return s === void 0 ? null : (k.value[s] ?? null);
        });
      ee(
        () => o.isOpen,
        (s) => {
          s
            ? ((document.body.style.overflow = "hidden"),
              (_.value = 1),
              (k.value = []),
              (h.value = new Set()),
              (S.value = H))
            : (document.body.style.overflow = "");
        },
      );
      function L(s) {
        const t = new Set(h.value);
        if (t.has(s)) t.delete(s);
        else {
          if (t.size >= lt) {
            const [a] = t;
            a !== void 0 && t.delete(a);
          }
          t.add(s);
        }
        h.value = t;
      }
      function U() {
        ((S.value = H), (_.value = 3));
      }
      async function V(s) {
        const a =
          (
            await w("/search/tavily", {
              method: "POST",
              body: { query: s, num: 10 },
            })
          ).news || [];
        return (i.setTavily(s, a), a);
      }
      async function q() {
        const s = A.value.trim();
        if (!(!s || f.value)) {
          if (i.hasTavily(s)) {
            const { isConfirmed: t, isDismissed: a } = await r.fire({
              title: "Resultados guardados",
              text: `Ya tenemos resultados para "${s}". ¿Quieres usar los datos guardados o hacer una nueva búsqueda?`,
              icon: "question",
              showConfirmButton: !0,
              showDenyButton: !0,
              showCancelButton: !1,
              confirmButtonText: "Usar guardados",
              denyButtonText: "Nueva búsqueda",
            });
            if (a) return;
            if (t) {
              ((k.value = i.getTavily(s)?.results ?? []),
                (h.value = new Set()),
                (_.value = 2));
              return;
            }
          }
          f.value = !0;
          try {
            ((k.value = await V(s)), (h.value = new Set()), (_.value = 2));
          } catch {
            ((k.value = []), (_.value = 2));
          } finally {
            f.value = !1;
          }
        }
      }
      async function n() {
        const s = R.value;
        if (!(!s || !S.value.trim() || f.value)) {
          f.value = !0;
          try {
            const t = s.snippet?.trim() ?? "";
            if (!t) {
              (await r.fire({
                title: "Sin contenido",
                text: "Tavily no devolvió contenido para este artículo. Intenta con otra noticia.",
                icon: "error",
              }),
                (f.value = !1));
              return;
            }
            let a = null;
            if (T.hasAICache(s.link)) {
              const { isConfirmed: $, isDismissed: E } = await r.fire({
                title: "Respuesta guardada",
                text: "Ya generamos un artículo para esta noticia. ¿Quieres usar la respuesta guardada o generar una nueva?",
                icon: "question",
                showConfirmButton: !0,
                showDenyButton: !0,
                showCancelButton: !1,
                confirmButtonText: "Usar guardada",
                denyButtonText: "Generar nueva",
              });
              if (E) {
                f.value = !1;
                return;
              }
              $ && (a = T.getAICache(s.link).result);
            }
            if (!a) {
              const $ =
                  S.value.trim() +
                  `

---

Title: ${s.title}
Source URL: ${s.link}
Date: ${s.date ?? ""}
Content:
${t}`,
                z = (
                  await w("/ia/cerebras", {
                    method: "POST",
                    body: { prompt: $ },
                  })
                ).text.trim();
              ((a = JSON.parse(z)), T.setAICache(s.link, a));
            }
            const v = await w("/articles", {
              params: { filters: { source_url: { $eq: s.link } } },
            });
            if (v.data && v.data.length > 0) {
              const $ = v.data[0].documentId;
              (
                await r.fire({
                  title: "Esta noticia ya existe",
                  text: "Ya existe un artículo creado con esta URL de origen.",
                  icon: "warning",
                  showConfirmButton: !0,
                  showCancelButton: !0,
                  confirmButtonText: "Ir al artículo",
                  cancelButtonText: "Cancelar",
                })
              ).isConfirmed && (await ce(`/dashboard/articles/${$}/edit`), l());
              return;
            }
            (await w("/articles", {
              method: "POST",
              body: {
                data: {
                  title: a.title,
                  header: a.header,
                  body: a.body,
                  seo_title: a.seo_title,
                  seo_description: a.seo_description,
                  source_url: s.link,
                  is_published: !1,
                },
              },
            }),
              C("created"),
              l());
          } catch {
            await r.fire(
              "Error",
              "No se pudo generar el artículo. Intenta nuevamente.",
              "error",
            );
          } finally {
            f.value = !1;
          }
        }
      }
      function l() {
        ((document.body.style.overflow = ""), C("close"));
      }
      return (s, t) => (
        u(),
        b(
          "div",
          {
            class: Q([{ "is-open": c.isOpen }, "lightbox lightbox--articles"]),
          },
          [
            e("div", { class: "lightbox--articles__backdrop", onClick: l }),
            e("div", Ve, [
              e(
                "button",
                {
                  title: "Cerrar",
                  type: "button",
                  class: "lightbox__button",
                  onClick: l,
                },
                [d(g(re), { size: 24 })],
              ),
              _.value === 1
                ? (u(),
                  b(
                    M,
                    { key: 0 },
                    [
                      t[7] ||
                        (t[7] = e(
                          "div",
                          { class: "lightbox--articles__header" },
                          [
                            e(
                              "div",
                              { class: "lightbox--articles__header__title" },
                              "Buscar noticias",
                            ),
                            e(
                              "div",
                              { class: "lightbox--articles__header__subtitle" },
                              " Ingresa una consulta para buscar noticias relevantes ",
                            ),
                          ],
                          -1,
                        )),
                      e("div", qe, [
                        t[6] ||
                          (t[6] = e(
                            "label",
                            { for: "lightbox-articles-query" },
                            "Consulta de búsqueda",
                            -1,
                          )),
                        Y(
                          e(
                            "textarea",
                            {
                              id: "lightbox-articles-query",
                              "onUpdate:modelValue":
                                t[0] || (t[0] = (a) => (A.value = a)),
                              rows: "3",
                            },
                            null,
                            512,
                          ),
                          [[Z, A.value]],
                        ),
                      ]),
                      e("div", ze, [
                        e(
                          "button",
                          {
                            class: "btn btn--primary",
                            type: "button",
                            disabled: f.value || !A.value.trim(),
                            onClick: q,
                          },
                          B(f.value ? "Buscando…" : "Siguiente →"),
                          9,
                          Fe,
                        ),
                      ]),
                    ],
                    64,
                  ))
                : _.value === 2
                  ? (u(),
                    b(
                      M,
                      { key: 1 },
                      [
                        t[8] ||
                          (t[8] = e(
                            "div",
                            { class: "lightbox--articles__header" },
                            [
                              e(
                                "div",
                                { class: "lightbox--articles__header__title" },
                                " Seleccionar noticia ",
                              ),
                              e(
                                "div",
                                {
                                  class: "lightbox--articles__header__subtitle",
                                },
                                " Selecciona la noticia que quieres convertir en artículo ",
                              ),
                            ],
                            -1,
                          )),
                        k.value.length > 0
                          ? (u(),
                            b("div", Ge, [
                              (u(!0),
                              b(
                                M,
                                null,
                                te(
                                  k.value,
                                  (a, v) => (
                                    u(),
                                    b(
                                      "div",
                                      {
                                        key: v,
                                        class: Q([
                                          "lightbox--articles__table__row",
                                          { "is-selected": h.value.has(v) },
                                        ]),
                                        onClick: ($) => L(v),
                                      },
                                      [
                                        e("div", Ye, [
                                          e(
                                            "input",
                                            {
                                              type: "checkbox",
                                              checked: h.value.has(v),
                                              onClick:
                                                t[1] ||
                                                (t[1] = W(() => {}, ["stop"])),
                                              onChange: ($) => L(v),
                                            },
                                            null,
                                            40,
                                            Je,
                                          ),
                                        ]),
                                        e("div", je, [
                                          e("span", Qe, B(a.title), 1),
                                          e(
                                            "a",
                                            {
                                              href: a.link,
                                              target: "_blank",
                                              rel: "noopener noreferrer",
                                              class:
                                                "lightbox--articles__table__url",
                                              onClick:
                                                t[2] ||
                                                (t[2] = W(() => {}, ["stop"])),
                                            },
                                            B(a.link),
                                            9,
                                            Ze,
                                          ),
                                          e("span", We, B(a.date), 1),
                                        ]),
                                      ],
                                      10,
                                      He,
                                    )
                                  ),
                                ),
                                128,
                              )),
                            ]))
                          : (u(),
                            b(
                              "div",
                              Xe,
                              " No se encontraron resultados para esta búsqueda. ",
                            )),
                        e("div", Ke, [
                          e(
                            "button",
                            {
                              class: "btn btn--secondary",
                              type: "button",
                              onClick: t[3] || (t[3] = (a) => (_.value = 1)),
                            },
                            " ← Volver ",
                          ),
                          k.value.length > 0
                            ? (u(),
                              b(
                                "button",
                                {
                                  key: 0,
                                  class: "btn btn--primary",
                                  type: "button",
                                  disabled: h.value.size === 0,
                                  onClick: U,
                                },
                                " Siguiente → ",
                                8,
                                et,
                              ))
                            : N("", !0),
                        ]),
                      ],
                      64,
                    ))
                  : _.value === 3
                    ? (u(),
                      b(
                        M,
                        { key: 2 },
                        [
                          t[10] ||
                            (t[10] = e(
                              "div",
                              { class: "lightbox--articles__header" },
                              [
                                e(
                                  "div",
                                  {
                                    class: "lightbox--articles__header__title",
                                  },
                                  "Generar artículo",
                                ),
                                e(
                                  "div",
                                  {
                                    class:
                                      "lightbox--articles__header__subtitle",
                                  },
                                  " Edita el prompt si es necesario y genera el artículo con IA ",
                                ),
                              ],
                              -1,
                            )),
                          e("div", tt, [
                            t[9] ||
                              (t[9] = e(
                                "label",
                                { for: "lightbox-articles-prompt" },
                                "Prompt",
                                -1,
                              )),
                            Y(
                              e(
                                "textarea",
                                {
                                  id: "lightbox-articles-prompt",
                                  "onUpdate:modelValue":
                                    t[4] || (t[4] = (a) => (S.value = a)),
                                  rows: "14",
                                },
                                null,
                                512,
                              ),
                              [[Z, S.value]],
                            ),
                          ]),
                          e("div", at, [
                            e(
                              "button",
                              {
                                class: "btn btn--secondary",
                                type: "button",
                                onClick: t[5] || (t[5] = (a) => (_.value = 2)),
                              },
                              " ← Volver ",
                            ),
                            e(
                              "button",
                              {
                                class: "btn btn--primary",
                                type: "button",
                                disabled: f.value || !S.value.trim(),
                                onClick: n,
                              },
                              B(f.value ? "Generando…" : "Crear"),
                              9,
                              st,
                            ),
                          ]),
                        ],
                        64,
                      ))
                    : N("", !0),
            ]),
          ],
          2,
        )
      );
    },
  }),
  nt = Object.assign(ot, { __name: "LightBoxArticles" }),
  yt = J({
    __name: "index",
    setup(c) {
      const x = [{ label: "Artículos" }],
        o = m(!1),
        C = m(null);
      function w() {
        C.value?.fetchArticles();
      }
      return (r, i) => {
        const T = ue,
          _ = de;
        return (
          u(),
          b("div", null, [
            d(
              _,
              { title: "Artículos", breadcrumbs: x },
              {
                actions: y(() => [
                  e(
                    "button",
                    {
                      class: "btn btn--announcement",
                      type: "button",
                      onClick: i[0] || (i[0] = (I) => (o.value = !0)),
                    },
                    [
                      d(g(Ce), { size: 16 }),
                      i[2] || (i[2] = D(" Generar artículo ", -1)),
                    ],
                  ),
                  d(
                    T,
                    {
                      class: "btn btn--primary",
                      to: "/dashboard/articles/new",
                    },
                    {
                      default: y(() => [
                        ...(i[3] || (i[3] = [D(" Agregar artículo ", -1)])),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                _: 1,
              },
            ),
            d(Re, { ref_key: "articlesRef", ref: C }, null, 512),
            d(
              nt,
              {
                "is-open": o.value,
                onClose: i[1] || (i[1] = (I) => (o.value = !1)),
                onCreated: w,
              },
              null,
              8,
              ["is-open"],
            ),
          ])
        );
      };
    },
  });
export { yt as default };
//# sourceMappingURL=DrD8xDDi.js.map

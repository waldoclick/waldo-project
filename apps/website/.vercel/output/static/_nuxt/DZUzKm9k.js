import {
  bD as M,
  aZ as q,
  bm as Q,
  bI as D,
  be as B,
  a_ as g,
  a$ as I,
  bf as l,
  bn as R,
  bo as N,
  b8 as U,
  b5 as S,
  bS as W,
  b6 as m,
  bT as G,
  b7 as L,
  bi as O,
  bU as X,
  b0 as b,
  bQ as Y,
  bk as P,
  aY as Z,
  bb as J,
  b2 as K,
  b3 as ee,
  bc as te,
  bd as C,
  b1 as ae,
  bg as z,
  bh as T,
  bj as le,
  b9 as j,
} from "./BK8sApmn.js";
import { L as oe } from "./Cwrq1rl2.js";
import { L as se } from "./D6ORICL5.js";
import { C as ie } from "./CNZV9sYn.js";
try {
  let r =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    $ = new r.Error().stack;
  $ &&
    ((r._sentryDebugIds = r._sentryDebugIds || {}),
    (r._sentryDebugIds[$] = "3123c27d-a9bb-40d5-9b25-71b581d4cce9"),
    (r._sentryDebugIdIdentifier =
      "sentry-dbid-3123c27d-a9bb-40d5-9b25-71b581d4cce9"));
} catch {}
const re = M("bold", [
  [
    "path",
    {
      d: "M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8",
      key: "mg9rjx",
    },
  ],
]);
const ne = M("code", [
  ["polyline", { points: "16 18 22 12 16 6", key: "z7tu5w" }],
  ["polyline", { points: "8 6 2 12 8 18", key: "1eg1df" }],
]);
const de = M("heading-2", [
  ["path", { d: "M4 12h8", key: "17cfdx" }],
  ["path", { d: "M4 18V6", key: "1rz3zl" }],
  ["path", { d: "M12 18V6", key: "zqpxq5" }],
  ["path", { d: "M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1", key: "9jr5yi" }],
]);
const ue = M("italic", [
  ["line", { x1: "19", x2: "10", y1: "4", y2: "4", key: "15jd3p" }],
  ["line", { x1: "14", x2: "5", y1: "20", y2: "20", key: "bu0au3" }],
  ["line", { x1: "15", x2: "9", y1: "4", y2: "20", key: "uljnxc" }],
]);
const ce = M("list-ordered", [
  ["path", { d: "M10 12h11", key: "6m4ad9" }],
  ["path", { d: "M10 18h11", key: "11hvi2" }],
  ["path", { d: "M10 6h11", key: "c7qv1k" }],
  ["path", { d: "M4 10h2", key: "16xx2s" }],
  ["path", { d: "M4 6h1v4", key: "cnovpq" }],
  ["path", { d: "M6 18H4c0-1 2-2 2-3s-1-1.5-2-1", key: "m9a95d" }],
]);
const me = M("quote", [
    [
      "path",
      {
        d: "M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z",
        key: "rib7q0",
      },
    ],
    [
      "path",
      {
        d: "M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z",
        key: "1ymkrd",
      },
    ],
  ]),
  pe = { class: "textarea-article" },
  _e = { class: "textarea-article__toolbar" },
  be = ["title", "onClick"],
  fe = ["value"],
  ye = q({
    __name: "TextareaArticle",
    props: { modelValue: {} },
    emits: ["update:modelValue"],
    setup(r, { emit: $ }) {
      const s = r,
        k = $,
        v = U(null),
        V = [
          { name: "bold", title: "Negrita", icon: re, syntax: "bold" },
          { name: "italic", title: "Cursiva", icon: ue, syntax: "italic" },
          { name: "heading", title: "Encabezado", icon: de, syntax: "heading" },
          { name: "ul", title: "Lista", icon: oe, syntax: "ul" },
          { name: "ol", title: "Lista numerada", icon: ce, syntax: "ol" },
          { name: "link", title: "Enlace", icon: se, syntax: "link" },
          { name: "quote", title: "Cita", icon: me, syntax: "quote" },
          { name: "code", title: "Código", icon: ne, syntax: "code" },
        ],
        f = () => {
          const p = v.value;
          p &&
            ((p.style.height = "auto"),
            (p.style.height = `${p.scrollHeight}px`));
        },
        h = (p) => {
          (k("update:modelValue", p.target.value), f());
        };
      (Q(() => {
        D(f);
      }),
        B(
          () => s.modelValue,
          () => {
            D(f);
          },
        ));
      const x = (p) => {
        const y = v.value;
        if (!y) return;
        const t = y.selectionStart,
          u = y.selectionEnd,
          a = y.value.slice(t, u),
          n = y.value.slice(0, t),
          o = y.value.slice(u),
          e = {
            bold: () => ({
              text: `${n}**${a || "texto"}**${o}`,
              cursor: a ? u + 4 : t + 2,
            }),
            italic: () => ({
              text: `${n}_${a || "texto"}_${o}`,
              cursor: a ? u + 2 : t + 1,
            }),
            heading: () => ({
              text: `${n}## ${a || "Encabezado"}${o}`,
              cursor: a ? u + 3 : t + 3,
            }),
            ul: () => ({
              text: `${n}- ${a || "elemento"}${o}`,
              cursor: a ? u + 2 : t + 2,
            }),
            ol: () => ({
              text: `${n}1. ${a || "elemento"}${o}`,
              cursor: a ? u + 3 : t + 3,
            }),
            link: () => ({
              text: `${n}[${a || "texto"}](url)${o}`,
              cursor: a ? u + 7 : t + 1,
            }),
            quote: () => ({
              text: `${n}> ${a || "cita"}${o}`,
              cursor: a ? u + 2 : t + 2,
            }),
            code: () => ({
              text: `${n}\`${a || "código"}\`${o}`,
              cursor: a ? u + 2 : t + 1,
            }),
          }[p]?.();
        e &&
          (k("update:modelValue", e.text),
          D(() => {
            (y.focus(), y.setSelectionRange(e.cursor, e.cursor), f());
          }));
      };
      return (p, y) => (
        g(),
        I("div", pe, [
          l("div", _e, [
            (g(),
            I(
              R,
              null,
              N(V, (t) =>
                l(
                  "button",
                  {
                    key: t.name,
                    type: "button",
                    class: "textarea-article__toolbar__btn",
                    title: t.title,
                    onClick: (u) => x(t.syntax),
                  },
                  [(g(), S(W(t.icon), { size: 15 }))],
                  8,
                  be,
                ),
              ),
              64,
            )),
          ]),
          l(
            "textarea",
            {
              ref_key: "textareaRef",
              ref: v,
              class: "textarea-article__editor",
              value: r.modelValue,
              onInput: h,
            },
            null,
            40,
            fe,
          ),
        ])
      );
    },
  }),
  ve = Object.assign(ye, { __name: "TextareaArticle" }),
  he = { class: "upload upload--media" },
  ge = { class: "upload--media__grid" },
  xe = ["src"],
  $e = ["disabled", "onClick"],
  ke = ["disabled"],
  Ve = { key: 0, class: "upload--media__hint" },
  we = ["multiple"],
  Ie = q({
    __name: "UploadMedia",
    props: { modelValue: {}, maxFiles: { default: 1 }, hint: { default: "" } },
    emits: ["update:modelValue"],
    setup(r, { emit: $ }) {
      const s = r,
        k = $,
        { Swal: v } = P(),
        V = U(null),
        f = U(!1),
        h = Z(),
        x = (a) =>
          a
            ? a.startsWith("http")
              ? a
              : a.startsWith("/uploads/")
                ? h.public.apiDisableProxy
                  ? `${h.public.apiUrl}${a}`
                  : `${h.public.baseUrl}${a.replace("/uploads/", "/api/images/")}`
                : `${h.public.baseUrl}${a}`
            : "",
        p = () => {
          f.value || V.value?.click();
        },
        y = async (a) => {
          const n = a.target,
            o = [...(n.files ?? [])];
          if (((n.value = ""), o.length === 0)) return;
          const d = s.maxFiles - s.modelValue.length,
            e = o.slice(0, d);
          f.value = !0;
          try {
            const w = [];
            for (const _ of e) {
              const c = await t(_);
              c && w.push(c);
            }
            k("update:modelValue", [...s.modelValue, ...w]);
          } catch {
            await v.fire(
              "Error",
              "No se pudo subir la imagen. Intenta de nuevo.",
              "error",
            );
          } finally {
            f.value = !1;
          }
        },
        t = async (a) => {
          const n = X(),
            o = new FormData();
          o.append("files", a);
          const d = h.public.apiDisableProxy
              ? `${h.public.apiUrl}/api/upload`
              : "/api/upload",
            e = await fetch(d, {
              method: "POST",
              body: o,
              headers: { Authorization: `Bearer ${n.value}` },
            });
          if (!e.ok) throw new Error(`Upload failed: ${e.status}`);
          return (await e.json())[0] ?? null;
        },
        u = async (a) => {
          if (
            (
              await v.fire({
                text: "¿Estás seguro de que quieres eliminar esta imagen?",
                icon: "warning",
                showCancelButton: !0,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "No, mantener",
              })
            ).isConfirmed
          ) {
            const o = [...s.modelValue];
            (o.splice(a, 1), k("update:modelValue", o));
          }
        };
      return (a, n) => (
        g(),
        I("div", he, [
          l("div", ge, [
            (g(!0),
            I(
              R,
              null,
              N(
                r.modelValue,
                (o, d) => (
                  g(),
                  I(
                    "div",
                    {
                      key: `media-${o.id ?? d}`,
                      class: "upload--media__item upload--media__item--filled",
                    },
                    [
                      l(
                        "img",
                        {
                          class: "upload--media__item__image",
                          src: x(o.url || o.formats?.thumbnail?.url || ""),
                          alt: "Imagen",
                        },
                        null,
                        8,
                        xe,
                      ),
                      l(
                        "button",
                        {
                          class: "upload--media__item__remove",
                          type: "button",
                          disabled: f.value,
                          onClick: (e) => u(d),
                        },
                        [b(m(Y), { size: 14, "stroke-width": 2.5 })],
                        8,
                        $e,
                      ),
                    ],
                  )
                ),
              ),
              128,
            )),
            r.modelValue.length < r.maxFiles
              ? (g(),
                I(
                  "button",
                  {
                    key: 0,
                    type: "button",
                    class: "upload--media__item upload--media__item--empty",
                    disabled: f.value,
                    onClick: p,
                  },
                  [
                    f.value
                      ? (g(),
                        S(m(G), {
                          key: 0,
                          class: "upload--media__item__spinner",
                          size: 22,
                        }))
                      : (g(),
                        S(m(ie), {
                          key: 1,
                          class: "upload--media__item__icon",
                          size: 22,
                        })),
                  ],
                  8,
                  ke,
                ))
              : L("", !0),
          ]),
          r.hint ? (g(), I("p", Ve, O(r.hint), 1)) : L("", !0),
          l(
            "input",
            {
              ref_key: "fileInput",
              ref: V,
              type: "file",
              accept: "image/jpeg,image/png,image/webp",
              multiple: r.maxFiles > 1,
              class: "upload--media__hidden",
              onChange: y,
            },
            null,
            40,
            we,
          ),
        ])
      );
    },
  }),
  Ce = Object.assign(Ie, { __name: "UploadMedia" }),
  Ue = { class: "form form--article" },
  Me = { class: "form__group" },
  ze = { class: "form__group" },
  Te = { class: "form__group" },
  Se = { class: "form__group form__group--upload" },
  Ee = { class: "form__group form__group--upload" },
  Fe = { class: "form__group" },
  De = { class: "form__group" },
  qe = { class: "form__group" },
  Ae = { class: "form__send" },
  Le = ["disabled"],
  je = q({
    __name: "FormArticle",
    props: { article: {} },
    emits: ["saved"],
    setup(r, { emit: $ }) {
      const s = r,
        k = $,
        { Swal: v } = P(),
        V = J(),
        f = K(),
        h = ee(),
        x = U(!1),
        p = U(null),
        y = te({
          title: C().required("Título es requerido"),
          header: C().optional(),
          body: C().optional(),
          seo_title: C().optional(),
          seo_description: C().optional(),
          source_url: C().url("URL inválida").optional().nullable(),
        }),
        t = U({
          title: "",
          header: "",
          body: "",
          seo_title: "",
          seo_description: "",
          source_url: "",
          cover: [],
          gallery: [],
        }),
        u = j(() => !!(s.article?.documentId || s.article?.id)),
        a = j(() => (u.value ? "Actualizar artículo" : "Crear artículo")),
        n = () => {
          ((t.value = {
            title: s.article?.title || "",
            header: s.article?.header || "",
            body: s.article?.body || "",
            seo_title: s.article?.seo_title || "",
            seo_description: s.article?.seo_description || "",
            source_url: s.article?.source_url || "",
            cover: s.article?.cover || [],
            gallery: s.article?.gallery || [],
          }),
            (p.value = s.article?.id || s.article?.documentId || null));
        },
        o = async (d) => {
          x.value = !0;
          try {
            const e = t.value.cover
                .map((c) => c.id)
                .filter((c) => c !== void 0),
              w = t.value.gallery.map((c) => c.id).filter((c) => c !== void 0),
              _ = {
                title: d.title.trim(),
                header: d.header?.trim() || null,
                body: t.value.body?.trim() || null,
                seo_title: d.seo_title?.trim() || null,
                seo_description: d.seo_description?.trim() || null,
                source_url: t.value.source_url.trim() || null,
                cover: e.length > 0 ? e : null,
                gallery: w.length > 0 ? w : null,
              };
            if (u.value) {
              const c = f.params.id,
                i =
                  s.article?.documentId || (typeof c == "string" ? c : void 0);
              if (!i) {
                (await v.fire(
                  "Error",
                  "No se pudo identificar el artículo para actualizar.",
                  "error",
                ),
                  (x.value = !1));
                return;
              }
              const F = (
                  await h(`/articles/${i}`, {
                    method: "PUT",
                    body: { data: _ },
                  })
                ).data,
                H = { ...s.article, ...F, ..._ };
              ((t.value = {
                title: _.title,
                header: _.header || "",
                body: _.body || "",
                seo_title: _.seo_title || "",
                seo_description: _.seo_description || "",
                source_url: _.source_url || "",
                cover: t.value.cover,
                gallery: t.value.gallery,
              }),
                k("saved", H),
                await v.fire(
                  "Éxito",
                  "Artículo actualizado correctamente.",
                  "success",
                ));
              const A = F?.documentId || F?.id;
              A && V.push(`/dashboard/articles/${A}`);
            } else {
              const i = (
                await h("/articles?status=draft", {
                  method: "POST",
                  body: { data: _ },
                })
              ).data;
              (k("saved", i || {}),
                await v.fire(
                  "Éxito",
                  "Artículo creado correctamente.",
                  "success",
                ));
              const E = i?.documentId || i?.id;
              E
                ? V.push(`/dashboard/articles/${E}/edit`)
                : V.push("/dashboard/articles");
            }
          } catch {
            await v.fire("Error", "No se pudo guardar el artículo.", "error");
          } finally {
            x.value = !1;
          }
        };
      return (
        B(
          () => s.article,
          (d) => {
            if (!d || x.value) return;
            const e = d.id || d.documentId || null;
            (e && e === p.value) || n();
          },
          { immediate: !0 },
        ),
        (d, e) => {
          const w = ve,
            _ = Ce;
          return (
            g(),
            S(
              m(le),
              { "validation-schema": m(y), onSubmit: o },
              {
                default: ae(({ meta: c }) => [
                  l("div", Ue, [
                    l("div", Me, [
                      e[8] ||
                        (e[8] = l(
                          "label",
                          { class: "form__label", for: "title" },
                          "Título",
                          -1,
                        )),
                      b(
                        m(z),
                        {
                          modelValue: t.value.title,
                          "onUpdate:modelValue":
                            e[0] || (e[0] = (i) => (t.value.title = i)),
                          name: "title",
                          type: "text",
                          class: "form__control",
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      b(m(T), { name: "title" }),
                    ]),
                    l("div", ze, [
                      e[9] ||
                        (e[9] = l(
                          "label",
                          { class: "form__label", for: "header" },
                          "Cabecera / Bajada",
                          -1,
                        )),
                      b(
                        m(z),
                        {
                          modelValue: t.value.header,
                          "onUpdate:modelValue":
                            e[1] || (e[1] = (i) => (t.value.header = i)),
                          as: "textarea",
                          name: "header",
                          class: "form__control",
                          rows: "3",
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      b(m(T), { name: "header" }),
                    ]),
                    l("div", Te, [
                      e[10] ||
                        (e[10] = l(
                          "label",
                          { class: "form__label" },
                          "Cuerpo",
                          -1,
                        )),
                      b(
                        w,
                        {
                          modelValue: t.value.body,
                          "onUpdate:modelValue":
                            e[2] || (e[2] = (i) => (t.value.body = i)),
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                    ]),
                    l("div", Se, [
                      e[11] ||
                        (e[11] = l(
                          "label",
                          { class: "form__label" },
                          "Imagen de portada",
                          -1,
                        )),
                      b(
                        _,
                        {
                          modelValue: t.value.cover,
                          "onUpdate:modelValue":
                            e[3] || (e[3] = (i) => (t.value.cover = i)),
                          "max-files": 1,
                          hint: "Imagen principal del artículo (1 imagen)",
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                    ]),
                    l("div", Ee, [
                      e[12] ||
                        (e[12] = l(
                          "label",
                          { class: "form__label" },
                          "Galería",
                          -1,
                        )),
                      b(
                        _,
                        {
                          modelValue: t.value.gallery,
                          "onUpdate:modelValue":
                            e[4] || (e[4] = (i) => (t.value.gallery = i)),
                          "max-files": 10,
                          hint: "Imágenes adicionales del artículo (máximo 10)",
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                    ]),
                    l("div", Fe, [
                      e[13] ||
                        (e[13] = l(
                          "label",
                          { class: "form__label", for: "seo_title" },
                          "Título SEO",
                          -1,
                        )),
                      b(
                        m(z),
                        {
                          modelValue: t.value.seo_title,
                          "onUpdate:modelValue":
                            e[5] || (e[5] = (i) => (t.value.seo_title = i)),
                          name: "seo_title",
                          type: "text",
                          class: "form__control",
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      b(m(T), { name: "seo_title" }),
                    ]),
                    l("div", De, [
                      e[14] ||
                        (e[14] = l(
                          "label",
                          { class: "form__label", for: "seo_description" },
                          "Descripción SEO",
                          -1,
                        )),
                      b(
                        m(z),
                        {
                          modelValue: t.value.seo_description,
                          "onUpdate:modelValue":
                            e[6] ||
                            (e[6] = (i) => (t.value.seo_description = i)),
                          as: "textarea",
                          name: "seo_description",
                          class: "form__control",
                          rows: "3",
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      b(m(T), { name: "seo_description" }),
                    ]),
                    l("div", qe, [
                      e[15] ||
                        (e[15] = l(
                          "label",
                          { class: "form__label", for: "source_url" },
                          "URL de fuente",
                          -1,
                        )),
                      b(
                        m(z),
                        {
                          modelValue: t.value.source_url,
                          "onUpdate:modelValue":
                            e[7] || (e[7] = (i) => (t.value.source_url = i)),
                          name: "source_url",
                          type: "url",
                          class: "form__control",
                          placeholder: "https://...",
                        },
                        null,
                        8,
                        ["modelValue"],
                      ),
                      b(m(T), { name: "source_url" }),
                    ]),
                    l("div", Ae, [
                      l(
                        "button",
                        {
                          disabled: x.value || !c.valid,
                          type: "submit",
                          class: "btn btn--primary",
                        },
                        O(a.value),
                        9,
                        Le,
                      ),
                    ]),
                  ]),
                ]),
                _: 1,
              },
              8,
              ["validation-schema"],
            )
          );
        }
      );
    },
  }),
  Pe = Object.assign(je, { __name: "FormArticle" });
export { Pe as F };
//# sourceMappingURL=DZUzKm9k.js.map

import {
  aZ as T,
  b2 as $,
  b3 as G,
  b4 as N,
  a_ as t,
  a$ as b,
  b0 as u,
  b1 as n,
  br as V,
  b6 as v,
  bs as P,
  b5 as l,
  b7 as a,
  bf as d,
  bi as I,
  b8 as S,
  b9 as m,
  ba as F,
  bB as H,
} from "./BK8sApmn.js";
import { _ as O } from "./vgLiQXkW.js";
import { _ as q } from "./C2l5JNgr.js";
import { _ as z, a as L } from "./RoATBwxO.js";
import { _ as R } from "./yakk9C2s.js";
import { f as A } from "./CjIigZ6h.js";
import "./CNKn_OHC.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
import "./BSW603Mu.js";
try {
  let s =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    i = new s.Error().stack;
  i &&
    ((s._sentryDebugIds = s._sentryDebugIds || {}),
    (s._sentryDebugIds[i] = "277145f4-f60a-4715-9875-cf2c19b2f632"),
    (s._sentryDebugIdIdentifier =
      "sentry-dbid-277145f4-f60a-4715-9875-cf2c19b2f632"));
} catch {}
const Z = { key: 2, class: "card card--info" },
  j = { class: "card--info__description" },
  J = { class: "card--info__description__text article-body-preview" },
  K = { key: 3, class: "card card--info" },
  M = { class: "card--info__description" },
  Q = ["href"],
  U = T({
    __name: "index",
    async setup(s) {
      let i, y;
      const f = $(),
        e = S(null),
        g = G(),
        w = m(() => e.value?.title || "Artículo"),
        C = m(() => [
          { label: "Artículos", to: "/dashboard/articles" },
          ...(e.value?.title ? [{ label: e.value.title }] : []),
        ]),
        { data: E } =
          (([i, y] = N(async () =>
            F(`article-${f.params.id}`, async () => {
              const o = f.params.id;
              if (!o) return null;
              const r = await g("articles", {
                  method: "GET",
                  params: {
                    filters: { documentId: { $eq: o } },
                    populate: ["cover", "gallery"],
                  },
                }),
                _ = Array.isArray(r.data) ? r.data[0] : null;
              return (
                _ ||
                (
                  await g(`articles/${o}`, {
                    method: "GET",
                    params: { populate: ["cover", "gallery"] },
                  })
                ).data ||
                null
              );
            }),
          )),
          (i = await i),
          y(),
          i);
      e.value = E.value ?? null;
      const x = m(() => {
          const o = e.value?.cover;
          return o ? (Array.isArray(o) ? o : [o]) : [];
        }),
        h = m(() => e.value?.gallery ?? []);
      return (o, r) => {
        const _ = V,
          k = O,
          c = q,
          p = z,
          D = R,
          B = L;
        return (
          t(),
          b("div", null, [
            u(
              k,
              { title: w.value, breadcrumbs: C.value },
              {
                actions: n(() => [
                  u(
                    _,
                    {
                      class: "btn btn--primary",
                      to: `/dashboard/articles/${v(f).params.id}/edit`,
                    },
                    {
                      default: n(() => [
                        ...(r[0] || (r[0] = [P(" Editar artículo ", -1)])),
                      ]),
                      _: 1,
                    },
                    8,
                    ["to"],
                  ),
                ]),
                _: 1,
              },
              8,
              ["title", "breadcrumbs"],
            ),
            u(B, null, {
              content: n(() => [
                u(
                  p,
                  { title: "Información", columns: 1 },
                  {
                    default: n(() => [
                      e.value
                        ? (t(),
                          l(
                            c,
                            {
                              key: 0,
                              title: "Título",
                              description: e.value.title,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : a("", !0),
                      e.value
                        ? (t(),
                          l(
                            c,
                            {
                              key: 1,
                              title: "Encabezado",
                              description: e.value.header,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : a("", !0),
                      e.value && e.value.body
                        ? (t(),
                          b("article", Z, [
                            r[1] ||
                              (r[1] = d(
                                "div",
                                { class: "card--info__title" },
                                "Cuerpo",
                                -1,
                              )),
                            d("div", j, [d("div", J, I(e.value.body), 1)]),
                          ]))
                        : a("", !0),
                      e.value
                        ? (t(),
                          l(
                            c,
                            {
                              key: 3,
                              title: "Título SEO",
                              description: e.value.seo_title,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : a("", !0),
                      e.value
                        ? (t(),
                          l(
                            c,
                            {
                              key: 4,
                              title: "Descripción SEO",
                              description: e.value.seo_description,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : a("", !0),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              sidebar: n(() => [
                u(
                  p,
                  { title: "Detalles", columns: 1 },
                  {
                    default: n(() => [
                      e.value
                        ? (t(),
                          l(
                            c,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: v(A)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : a("", !0),
                      e.value
                        ? (t(),
                          l(
                            c,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: v(A)(e.value.updatedAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : a("", !0),
                      e.value
                        ? (t(),
                          l(
                            c,
                            {
                              key: 2,
                              title: "Estado",
                              description: e.value.publishedAt
                                ? "Publicado"
                                : "Borrador",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : a("", !0),
                      e.value && e.value.source_url
                        ? (t(),
                          b("article", K, [
                            r[2] ||
                              (r[2] = d(
                                "div",
                                { class: "card--info__title" },
                                "Fuente",
                                -1,
                              )),
                            d("div", M, [
                              d(
                                "a",
                                {
                                  href: e.value.source_url,
                                  target: "_blank",
                                  rel: "noopener noreferrer",
                                  class: "card--info__description__text",
                                },
                                I(e.value.source_url),
                                9,
                                Q,
                              ),
                            ]),
                          ]))
                        : a("", !0),
                    ]),
                    _: 1,
                  },
                ),
                x.value.length > 0
                  ? (t(),
                    l(
                      p,
                      { key: 0, title: "Portada", columns: 1 },
                      {
                        default: n(() => [
                          u(
                            D,
                            {
                              images: x.value,
                              "alt-prefix": "Portada",
                              columns: 1,
                              onImageDelete: () => {},
                            },
                            null,
                            8,
                            ["images"],
                          ),
                        ]),
                        _: 1,
                      },
                    ))
                  : a("", !0),
                h.value.length > 0
                  ? (t(),
                    l(
                      p,
                      { key: 1, title: "Galería", columns: 1 },
                      {
                        default: n(() => [
                          u(
                            D,
                            {
                              images: h.value,
                              "alt-prefix": "Galería",
                              columns: 2,
                              onImageDelete: () => {},
                            },
                            null,
                            8,
                            ["images"],
                          ),
                        ]),
                        _: 1,
                      },
                    ))
                  : a("", !0),
              ]),
              _: 1,
            }),
          ])
        );
      };
    },
  }),
  se = H(U, [["__scopeId", "data-v-a160930f"]]);
export { se as default };
//# sourceMappingURL=BRWe3ZzU.js.map

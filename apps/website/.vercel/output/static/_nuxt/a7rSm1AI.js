import { _ as S } from "./vgLiQXkW.js";
import { _ as B, a as T } from "./RoATBwxO.js";
import { _ as $ } from "./C2l5JNgr.js";
import {
  aZ as P,
  b2 as F,
  b3 as N,
  b4 as V,
  a_ as s,
  a$ as y,
  b0 as r,
  b1 as i,
  bi as G,
  b7 as d,
  b5 as _,
  b6 as h,
  b8 as A,
  b9 as g,
  bk as H,
  ba as q,
} from "./BK8sApmn.js";
import { F as O } from "./DZUzKm9k.js";
import { f as w } from "./CjIigZ6h.js";
import "./CNKn_OHC.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
import "./Cwrq1rl2.js";
import "./D6ORICL5.js";
import "./CNZV9sYn.js";
try {
  let o =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    l = new o.Error().stack;
  l &&
    ((o._sentryDebugIds = o._sentryDebugIds || {}),
    (o._sentryDebugIds[l] = "5043d5e7-b827-431c-b063-b0ba59ae8379"),
    (o._sentryDebugIdIdentifier =
      "sentry-dbid-5043d5e7-b827-431c-b063-b0ba59ae8379"));
} catch {}
const R = ["disabled"],
  ee = P({
    __name: "edit",
    async setup(o) {
      let l, f;
      const n = F(),
        b = N(),
        { Swal: v } = H(),
        e = A(null),
        p = A(!1),
        k = g(() => e.value?.title || "Artículo"),
        D = g(() => [
          { label: "Artículos", to: "/dashboard/articles" },
          ...(e.value?.title
            ? [
                {
                  label: e.value.title,
                  to: `/dashboard/articles/${n.params.id}`,
                },
              ]
            : []),
          { label: "Editar" },
        ]),
        x = (t) => {
          t && (e.value = t);
        },
        I = async () => {
          if (!e.value) return;
          const t =
            e.value.documentId ||
            (typeof n.params.id == "string" ? n.params.id : void 0);
          if (t) {
            p.value = !0;
            try {
              const a = e.value.publishedAt ? null : new Date().toISOString();
              (await b(`/articles/${t}`, {
                method: "PUT",
                body: { data: { publishedAt: a } },
              }),
                (e.value = { ...e.value, publishedAt: a }),
                await v.fire(
                  "Éxito",
                  a
                    ? "Artículo publicado."
                    : "Artículo guardado como borrador.",
                  "success",
                ));
            } catch {
              await v.fire(
                "Error",
                "No se pudo cambiar el estado del artículo.",
                "error",
              );
            } finally {
              p.value = !1;
            }
          }
        },
        { data: C } =
          (([l, f] = V(async () =>
            q(`article-edit-${n.params.id}`, async () => {
              const t = n.params.id;
              if (!t) return null;
              const a = await b("articles", {
                  method: "GET",
                  params: {
                    filters: { documentId: { $eq: t } },
                    populate: ["cover", "gallery"],
                  },
                }),
                c = Array.isArray(a.data) ? a.data[0] : null;
              return (
                c ||
                (
                  await b(`articles/${t}`, {
                    method: "GET",
                    params: { populate: ["cover", "gallery"] },
                  })
                ).data ||
                null
              );
            }),
          )),
          (l = await l),
          f(),
          l);
      return (
        (e.value = C.value ?? null),
        (t, a) => {
          const c = S,
            u = B,
            m = $,
            E = T;
          return (
            s(),
            y("div", null, [
              r(c, { title: k.value, breadcrumbs: D.value }, null, 8, [
                "title",
                "breadcrumbs",
              ]),
              r(E, null, {
                content: i(() => [
                  r(
                    u,
                    { title: "Editar artículo", columns: 1 },
                    {
                      default: i(() => [
                        r(O, { article: e.value, onSaved: x }, null, 8, [
                          "article",
                        ]),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                sidebar: i(() => [
                  r(
                    u,
                    { title: "Acciones", columns: 1 },
                    {
                      default: i(() => [
                        e.value
                          ? (s(),
                            y(
                              "button",
                              {
                                key: 0,
                                type: "button",
                                class: "btn btn--buy btn--block",
                                disabled: p.value,
                                onClick: I,
                              },
                              G(
                                e.value.publishedAt
                                  ? "Volver a borrador"
                                  : "Publicar",
                              ),
                              9,
                              R,
                            ))
                          : d("", !0),
                      ]),
                      _: 1,
                    },
                  ),
                  r(
                    u,
                    { title: "Detalles", columns: 1 },
                    {
                      default: i(() => [
                        e.value
                          ? (s(),
                            _(
                              m,
                              {
                                key: 0,
                                title: "Estado",
                                description: e.value.publishedAt
                                  ? "Publicado"
                                  : "Borrador",
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : d("", !0),
                        e.value
                          ? (s(),
                            _(
                              m,
                              {
                                key: 1,
                                title: "Fecha de creación",
                                description: h(w)(e.value.createdAt),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : d("", !0),
                        e.value
                          ? (s(),
                            _(
                              m,
                              {
                                key: 2,
                                title: "Última modificación",
                                description: h(w)(e.value.updatedAt),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : d("", !0),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                _: 1,
              }),
            ])
          );
        }
      );
    },
  });
export { ee as default };
//# sourceMappingURL=a7rSm1AI.js.map

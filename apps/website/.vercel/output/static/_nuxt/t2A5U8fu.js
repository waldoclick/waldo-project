import {
  aZ as D,
  b2 as A,
  b3 as B,
  b4 as N,
  a_ as n,
  a$ as $,
  b0 as c,
  b1 as o,
  br as E,
  b6 as p,
  bs as T,
  b5 as r,
  b7 as s,
  bf as V,
  b8 as G,
  b9 as b,
  bt as H,
  ba as P,
} from "./BK8sApmn.js";
import { _ as q } from "./vgLiQXkW.js";
import { _ as F } from "./C2l5JNgr.js";
import { _ as L, a as R } from "./RoATBwxO.js";
import { f as g } from "./CjIigZ6h.js";
import "./CNKn_OHC.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
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
    a = new t.Error().stack;
  a &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[a] = "0f8edfde-04b3-4625-8bb8-7a14996118fd"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-0f8edfde-04b3-4625-8bb8-7a14996118fd"));
} catch {}
const S = ["src"],
  Q = D({
    __name: "index",
    async setup(t) {
      let a, f;
      const m = A(),
        e = G(null),
        { transformUrl: x } = H(),
        y = B(),
        k = b(() => e.value?.name || "Categoría"),
        h = b(() => [
          { label: "Categorías", to: "/dashboard/maintenance/categories" },
          ...(e.value?.name ? [{ label: e.value.name }] : []),
        ]),
        I = b(() => (e.value?.icon?.url ? x(e.value.icon.url) : "")),
        { data: w } =
          (([a, f] = N(async () =>
            P(`category-${m.params.id}`, async () => {
              const u = m.params.id;
              if (!u) return null;
              const l = await y("categories", {
                  method: "GET",
                  params: {
                    filters: { documentId: { $eq: u } },
                    populate: ["icon"],
                  },
                }),
                d = Array.isArray(l.data) ? l.data[0] : null;
              return (
                d ||
                (
                  await y(`categories/${u}`, {
                    method: "GET",
                    params: { populate: ["icon"] },
                  })
                ).data ||
                null
              );
            }),
          )),
          (a = await a),
          f(),
          a);
      return (
        (e.value = w.value ?? null),
        (u, l) => {
          const d = E,
            v = q,
            i = F,
            _ = L,
            C = R;
          return (
            n(),
            $("div", null, [
              c(
                v,
                { title: k.value, breadcrumbs: h.value },
                {
                  actions: o(() => [
                    c(
                      d,
                      {
                        class: "btn btn--primary",
                        to: `/dashboard/maintenance/categories/${p(m).params.id}/edit`,
                      },
                      {
                        default: o(() => [
                          ...(l[0] || (l[0] = [T(" Editar categoría ", -1)])),
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
              c(C, null, {
                content: o(() => [
                  c(
                    _,
                    { title: "Información", columns: 2 },
                    {
                      default: o(() => [
                        e.value
                          ? (n(),
                            r(
                              i,
                              {
                                key: 0,
                                title: "Nombre",
                                description: e.value.name,
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : s("", !0),
                        e.value
                          ? (n(),
                            r(
                              i,
                              {
                                key: 1,
                                title: "Slug",
                                description: e.value.slug,
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : s("", !0),
                        e.value
                          ? (n(),
                            r(
                              i,
                              {
                                key: 2,
                                title: "Color",
                                description: e.value.color,
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : s("", !0),
                      ]),
                      _: 1,
                    },
                  ),
                ]),
                sidebar: o(() => [
                  c(
                    _,
                    { title: "Detalles", columns: 1 },
                    {
                      default: o(() => [
                        e.value
                          ? (n(),
                            r(
                              i,
                              {
                                key: 0,
                                title: "Fecha de creación",
                                description: p(g)(e.value.createdAt),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : s("", !0),
                        e.value
                          ? (n(),
                            r(
                              i,
                              {
                                key: 1,
                                title: "Última modificación",
                                description: p(g)(e.value.updatedAt),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : s("", !0),
                      ]),
                      _: 1,
                    },
                  ),
                  e.value?.icon?.url
                    ? (n(),
                      r(
                        _,
                        { key: 0, title: "Icono", columns: 1 },
                        {
                          default: o(() => [
                            V(
                              "img",
                              { src: I.value, alt: "Icono categoría" },
                              null,
                              8,
                              S,
                            ),
                          ]),
                          _: 1,
                        },
                      ))
                    : s("", !0),
                ]),
                _: 1,
              }),
            ])
          );
        }
      );
    },
  });
export { Q as default };
//# sourceMappingURL=t2A5U8fu.js.map

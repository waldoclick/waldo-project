import {
  aZ as A,
  b2 as C,
  b3 as I,
  b4 as g,
  a_ as n,
  a$ as q,
  b0 as l,
  b1 as o,
  br as T,
  b6 as m,
  bs as $,
  b5 as i,
  b7 as c,
  b8 as B,
  b9 as v,
  ba as E,
} from "./BK8sApmn.js";
import { _ as N } from "./vgLiQXkW.js";
import { _ as F } from "./C2l5JNgr.js";
import { _ as Q, a as V } from "./RoATBwxO.js";
import { f as x } from "./CjIigZ6h.js";
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
    (t._sentryDebugIds[a] = "9a6b8cdc-f65f-40c1-8e19-c7453241e928"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-9a6b8cdc-f65f-40c1-8e19-c7453241e928"));
} catch {}
const J = A({
  __name: "index",
  async setup(t) {
    let a, p;
    const _ = C(),
      e = B(null),
      f = I(),
      k = v(() => e.value?.title || "FAQ"),
      h = v(() => [
        { label: "FAQs", to: "/dashboard/maintenance/faqs" },
        ...(e.value?.title ? [{ label: e.value.title }] : []),
      ]),
      { data: D } =
        (([a, p] = g(async () =>
          E(`faq-${_.params.id}`, async () => {
            const d = _.params.id;
            if (!d) return null;
            const s = await f("faqs", {
                method: "GET",
                params: { filters: { documentId: { $eq: d } } },
              }),
              u = Array.isArray(s.data) ? s.data[0] : null;
            return u || (await f(`faqs/${d}`, { method: "GET" })).data || null;
          }),
        )),
        (a = await a),
        p(),
        a);
    return (
      (e.value = D.value ?? null),
      (d, s) => {
        const u = T,
          b = N,
          r = F,
          y = Q,
          w = V;
        return (
          n(),
          q("div", null, [
            l(
              b,
              { title: k.value, breadcrumbs: h.value },
              {
                actions: o(() => [
                  l(
                    u,
                    {
                      class: "btn btn--primary",
                      to: `/dashboard/maintenance/faqs/${m(_).params.id}/edit`,
                    },
                    {
                      default: o(() => [
                        ...(s[0] || (s[0] = [$(" Editar FAQ ", -1)])),
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
            l(w, null, {
              content: o(() => [
                l(
                  y,
                  { title: "Información", columns: 1 },
                  {
                    default: o(() => [
                      e.value
                        ? (n(),
                          i(
                            r,
                            {
                              key: 0,
                              title: "Título",
                              description: e.value.title,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : c("", !0),
                      e.value
                        ? (n(),
                          i(
                            r,
                            {
                              key: 1,
                              title: "Contenido",
                              description: e.value.text,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : c("", !0),
                      e.value
                        ? (n(),
                          i(
                            r,
                            {
                              key: 2,
                              title: "Destacado",
                              description: e.value.featured ? "Sí" : "No",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : c("", !0),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              sidebar: o(() => [
                l(
                  y,
                  { title: "Detalles", columns: 1 },
                  {
                    default: o(() => [
                      e.value
                        ? (n(),
                          i(
                            r,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: m(x)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : c("", !0),
                      e.value
                        ? (n(),
                          i(
                            r,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: m(x)(e.value.updatedAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : c("", !0),
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
export { J as default };
//# sourceMappingURL=6TEXAtTx.js.map

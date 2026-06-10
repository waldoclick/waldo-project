import { _ as C } from "./vgLiQXkW.js";
import { _ as A, a as I } from "./RoATBwxO.js";
import { _ as k } from "./C2l5JNgr.js";
import {
  aZ as B,
  b2 as E,
  b3 as P,
  b4 as $,
  a_ as r,
  a$ as F,
  b0 as n,
  b1 as l,
  b5 as m,
  b6 as p,
  b7 as _,
  b8 as N,
  b9 as b,
  ba as T,
} from "./BK8sApmn.js";
import { F as H } from "./BQKVS5WP.js";
import { f } from "./CjIigZ6h.js";
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
    (t._sentryDebugIds[a] = "945bfbc0-abb1-4f79-a74a-5925154c676f"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-945bfbc0-abb1-4f79-a74a-5925154c676f"));
} catch {}
const K = B({
  __name: "edit",
  async setup(t) {
    let a, c;
    const i = E(),
      e = N(null),
      y = P(),
      v = b(() => e.value?.title || "Politica"),
      h = b(() => [
        { label: "Politicas", to: "/dashboard/maintenance/policies" },
        ...(e.value?.title
          ? [
              {
                label: e.value.title,
                to: `/dashboard/maintenance/policies/${i.params.id}`,
              },
            ]
          : []),
        { label: "Editar" },
      ]),
      x = (o) => {
        o && (e.value = o);
      },
      { data: D } =
        (([a, c] = $(async () =>
          T(
            `policy-edit-${i.params.id}`,
            async () => {
              const o = i.params.id;
              if (!o) return null;
              const s = await y("policies", {
                method: "GET",
                params: { filters: { id: { $eq: Number(o) } } },
              });
              return Array.isArray(s.data) ? s.data[0] : null;
            },
            { default: () => null },
          ),
        )),
        (a = await a),
        c(),
        a);
    return (
      (e.value = D.value ?? null),
      (o, s) => {
        const w = C,
          d = A,
          u = k,
          g = I;
        return (
          r(),
          F("div", null, [
            n(w, { title: v.value, breadcrumbs: h.value }, null, 8, [
              "title",
              "breadcrumbs",
            ]),
            n(g, null, {
              content: l(() => [
                n(
                  d,
                  { title: "Editar Politica", columns: 1 },
                  {
                    default: l(() => [
                      n(H, { policy: e.value, onSaved: x }, null, 8, [
                        "policy",
                      ]),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              sidebar: l(() => [
                n(
                  d,
                  { title: "Detalles", columns: 1 },
                  {
                    default: l(() => [
                      e.value
                        ? (r(),
                          m(
                            u,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: p(f)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : _("", !0),
                      e.value
                        ? (r(),
                          m(
                            u,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: p(f)(e.value.updatedAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : _("", !0),
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
export { K as default };
//# sourceMappingURL=D_p76vAP.js.map

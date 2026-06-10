import { _ as D } from "./vgLiQXkW.js";
import { _ as k, a as I } from "./RoATBwxO.js";
import { _ as A } from "./C2l5JNgr.js";
import {
  aZ as E,
  b2 as B,
  b3 as $,
  b4 as T,
  a_ as d,
  a$ as F,
  b0 as n,
  b1 as s,
  b5 as p,
  b6 as b,
  b7 as f,
  b8 as G,
  b9 as y,
  ba as H,
} from "./BK8sApmn.js";
import { F as N } from "./6bVI6abF.js";
import { f as g } from "./CjIigZ6h.js";
import "./CNKn_OHC.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
import "./DQVnk6X6.js";
try {
  let a =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    t = new a.Error().stack;
  t &&
    ((a._sentryDebugIds = a._sentryDebugIds || {}),
    (a._sentryDebugIds[t] = "60302e85-b614-46cc-85fa-4851c0df1a4b"),
    (a._sentryDebugIdIdentifier =
      "sentry-dbid-60302e85-b614-46cc-85fa-4851c0df1a4b"));
} catch {}
const M = E({
  __name: "edit",
  async setup(a) {
    let t, u;
    const c = B(),
      e = G(null),
      m = $(),
      v = y(() => e.value?.name || "Categoría"),
      h = y(() => [
        { label: "Categorías", to: "/dashboard/maintenance/categories" },
        ...(e.value?.name
          ? [
              {
                label: e.value.name,
                to: `/dashboard/maintenance/categories/${c.params.id}`,
              },
            ]
          : []),
        { label: "Editar" },
      ]),
      C = (o) => {
        o && (e.value = o);
      },
      { data: w } =
        (([t, u] = T(async () =>
          H(`category-edit-${c.params.id}`, async () => {
            const o = c.params.id;
            if (!o) return null;
            const l = await m("categories", {
                method: "GET",
                params: {
                  filters: { documentId: { $eq: o } },
                  populate: ["icon"],
                },
              }),
              r = Array.isArray(l.data) ? l.data[0] : null;
            return (
              r ||
              (
                await m(`categories/${o}`, {
                  method: "GET",
                  params: { populate: ["icon"] },
                })
              ).data ||
              null
            );
          }),
        )),
        (t = await t),
        u(),
        t);
    return (
      (e.value = w.value ?? null),
      (o, l) => {
        const r = D,
          i = k,
          _ = A,
          x = I;
        return (
          d(),
          F("div", null, [
            n(r, { title: v.value, breadcrumbs: h.value }, null, 8, [
              "title",
              "breadcrumbs",
            ]),
            n(x, null, {
              content: s(() => [
                n(
                  i,
                  { title: "Editar categoría", columns: 1 },
                  {
                    default: s(() => [
                      n(N, { category: e.value, onSaved: C }, null, 8, [
                        "category",
                      ]),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              sidebar: s(() => [
                n(
                  i,
                  { title: "Detalles", columns: 1 },
                  {
                    default: s(() => [
                      e.value
                        ? (d(),
                          p(
                            _,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: b(g)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : f("", !0),
                      e.value
                        ? (d(),
                          p(
                            _,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: b(g)(e.value.updatedAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : f("", !0),
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
export { M as default };
//# sourceMappingURL=shz3F8q3.js.map

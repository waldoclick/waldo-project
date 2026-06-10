import { _ as g } from "./vgLiQXkW.js";
import { _ as k, a as I } from "./RoATBwxO.js";
import { _ as A } from "./C2l5JNgr.js";
import {
  aZ as E,
  b2 as B,
  b3 as $,
  b4 as T,
  a_ as d,
  a$ as F,
  b0 as o,
  b1 as s,
  b5 as f,
  b6 as p,
  b7 as b,
  b8 as G,
  b9 as y,
  ba as H,
} from "./BK8sApmn.js";
import { F as N } from "./aXTW6rfY.js";
import { f as v } from "./CjIigZ6h.js";
import "./CNKn_OHC.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
import "./DQVnk6X6.js";
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
    n = new t.Error().stack;
  n &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[n] = "94859074-e884-431f-8125-fbee54b2f1ef"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-94859074-e884-431f-8125-fbee54b2f1ef"));
} catch {}
const M = E({
  __name: "edit",
  async setup(t) {
    let n, u;
    const r = B(),
      e = G(null),
      m = $(),
      h = y(() => e.value?.name || "Condición"),
      C = y(() => [
        { label: "Condiciones", to: "/dashboard/maintenance/conditions" },
        ...(e.value?.name
          ? [
              {
                label: e.value.name,
                to: `/dashboard/maintenance/conditions/${r.params.id}`,
              },
            ]
          : []),
        { label: "Editar" },
      ]),
      w = (a) => {
        a && (e.value = a);
      },
      { data: x } =
        (([n, u] = T(async () =>
          H(`condition-edit-${r.params.id}`, async () => {
            const a = r.params.id;
            if (!a) return null;
            const l = await m("conditions", {
                method: "GET",
                params: { filters: { documentId: { $eq: a } } },
              }),
              i = Array.isArray(l.data) ? l.data[0] : null;
            return (
              i || (await m(`conditions/${a}`, { method: "GET" })).data || null
            );
          }),
        )),
        (n = await n),
        u(),
        n);
    return (
      (e.value = x.value ?? null),
      (a, l) => {
        const i = g,
          c = k,
          _ = A,
          D = I;
        return (
          d(),
          F("div", null, [
            o(i, { title: h.value, breadcrumbs: C.value }, null, 8, [
              "title",
              "breadcrumbs",
            ]),
            o(D, null, {
              content: s(() => [
                o(
                  c,
                  { title: "Editar condición", columns: 1 },
                  {
                    default: s(() => [
                      o(N, { condition: e.value, onSaved: w }, null, 8, [
                        "condition",
                      ]),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              sidebar: s(() => [
                o(
                  c,
                  { title: "Detalles", columns: 1 },
                  {
                    default: s(() => [
                      e.value
                        ? (d(),
                          f(
                            _,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: p(v)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : b("", !0),
                      e.value
                        ? (d(),
                          f(
                            _,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: p(v)(e.value.updatedAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : b("", !0),
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
//# sourceMappingURL=Ztohev_i.js.map

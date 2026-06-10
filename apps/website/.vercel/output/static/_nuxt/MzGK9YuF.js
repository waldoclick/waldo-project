import { _ as k } from "./vgLiQXkW.js";
import { _ as C, a as I } from "./RoATBwxO.js";
import { _ as A } from "./C2l5JNgr.js";
import {
  aZ as E,
  b2 as B,
  b3 as $,
  b4 as R,
  a_ as c,
  a$ as T,
  b0 as o,
  b1 as s,
  b5 as b,
  b6 as p,
  b7 as f,
  b8 as F,
  b9 as g,
  ba as G,
} from "./BK8sApmn.js";
import { F as H } from "./B9seTQdH.js";
import { f as y } from "./CjIigZ6h.js";
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
    a = new t.Error().stack;
  a &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[a] = "b9f6a0d3-fb74-4b78-ac74-dd51dd4cd955"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-b9f6a0d3-fb74-4b78-ac74-dd51dd4cd955"));
} catch {}
const M = E({
  __name: "edit",
  async setup(t) {
    let a, u;
    const i = B(),
      e = F(null),
      m = $(),
      v = g(() => e.value?.name || "Región"),
      h = g(() => [
        { label: "Regiones", to: "/dashboard/maintenance/regions" },
        ...(e.value?.name
          ? [
              {
                label: e.value.name,
                to: `/dashboard/maintenance/regions/${i.params.id}`,
              },
            ]
          : []),
        { label: "Editar" },
      ]),
      w = (n) => {
        n && (e.value = n);
      },
      { data: x } =
        (([a, u] = R(async () =>
          G(`region-edit-${i.params.id}`, async () => {
            const n = i.params.id;
            if (!n) return null;
            const l = await m("regions", {
                method: "GET",
                params: { filters: { documentId: { $eq: n } } },
              }),
              r = Array.isArray(l.data) ? l.data[0] : null;
            return (
              r || (await m(`regions/${n}`, { method: "GET" })).data || null
            );
          }),
        )),
        (a = await a),
        u(),
        a);
    return (
      (e.value = x.value ?? null),
      (n, l) => {
        const r = k,
          d = C,
          _ = A,
          D = I;
        return (
          c(),
          T("div", null, [
            o(r, { title: v.value, breadcrumbs: h.value }, null, 8, [
              "title",
              "breadcrumbs",
            ]),
            o(D, null, {
              content: s(() => [
                o(
                  d,
                  { title: "Editar región", columns: 1 },
                  {
                    default: s(() => [
                      o(H, { region: e.value, onSaved: w }, null, 8, [
                        "region",
                      ]),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              sidebar: s(() => [
                o(
                  d,
                  { title: "Detalles", columns: 1 },
                  {
                    default: s(() => [
                      e.value
                        ? (c(),
                          b(
                            _,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: p(y)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : f("", !0),
                      e.value
                        ? (c(),
                          b(
                            _,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: p(y)(e.value.updatedAt),
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
//# sourceMappingURL=MzGK9YuF.js.map

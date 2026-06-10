import { _ as D } from "./vgLiQXkW.js";
import { _ as k, a as I } from "./RoATBwxO.js";
import { _ as A } from "./C2l5JNgr.js";
import {
  aZ as E,
  b2 as B,
  b3 as $,
  b4 as T,
  a_ as u,
  a$ as F,
  b0 as o,
  b1 as r,
  b5 as p,
  b6 as b,
  b7 as f,
  b8 as G,
  b9 as y,
  ba as H,
} from "./BK8sApmn.js";
import { F as N } from "./BT44QAAr.js";
import { f as v } from "./CjIigZ6h.js";
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
    (a._sentryDebugIds[t] = "8c35beba-0c66-4c2a-9395-81a73ae0726e"),
    (a._sentryDebugIdIdentifier =
      "sentry-dbid-8c35beba-0c66-4c2a-9395-81a73ae0726e"));
} catch {}
const M = E({
  __name: "edit",
  async setup(a) {
    let t, i;
    const l = B(),
      e = G(null),
      d = $(),
      h = y(() => e.value?.name || "Comuna"),
      C = y(() => [
        { label: "Comunas", to: "/dashboard/maintenance/communes" },
        ...(e.value?.name
          ? [
              {
                label: e.value.name,
                to: `/dashboard/maintenance/communes/${l.params.id}`,
              },
            ]
          : []),
        { label: "Editar" },
      ]),
      g = (n) => {
        n && (e.value = n);
      },
      { data: w } =
        (([t, i] = T(async () =>
          H(`commune-edit-${l.params.id}`, async () => {
            const n = l.params.id;
            if (!n) return null;
            const c = await d("communes", {
                method: "GET",
                params: {
                  filters: { documentId: { $eq: n } },
                  populate: "region",
                },
              }),
              s = Array.isArray(c.data) ? c.data[0] : null;
            return (
              s ||
              (
                await d(`communes/${n}`, {
                  method: "GET",
                  params: { populate: "region" },
                })
              ).data ||
              null
            );
          }),
        )),
        (t = await t),
        i(),
        t);
    return (
      (e.value = w.value ?? null),
      (n, c) => {
        const s = D,
          m = k,
          _ = A,
          x = I;
        return (
          u(),
          F("div", null, [
            o(s, { title: h.value, breadcrumbs: C.value }, null, 8, [
              "title",
              "breadcrumbs",
            ]),
            o(x, null, {
              content: r(() => [
                o(
                  m,
                  { title: "Editar comuna", columns: 1 },
                  {
                    default: r(() => [
                      o(N, { commune: e.value, onSaved: g }, null, 8, [
                        "commune",
                      ]),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              sidebar: r(() => [
                o(
                  m,
                  { title: "Detalles", columns: 1 },
                  {
                    default: r(() => [
                      e.value
                        ? (u(),
                          p(
                            _,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: b(v)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : f("", !0),
                      e.value
                        ? (u(),
                          p(
                            _,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: b(v)(e.value.updatedAt),
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
//# sourceMappingURL=ClLHMWmS.js.map

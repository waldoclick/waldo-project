import { _ as C } from "./vgLiQXkW.js";
import { _ as I } from "./Bjk732Ik.js";
import { _ as A, a as E } from "./RoATBwxO.js";
import { _ as $ } from "./C2l5JNgr.js";
import {
  aZ as B,
  b2 as T,
  b3 as P,
  b4 as F,
  a_ as d,
  a$ as G,
  b0 as o,
  b1 as r,
  b5 as b,
  b6 as f,
  b7 as k,
  b8 as H,
  b9 as y,
  ba as N,
} from "./BK8sApmn.js";
import { f as v } from "./CjIigZ6h.js";
import "./CNKn_OHC.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
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
    (a._sentryDebugIds[t] = "b0236d69-239e-42e6-b399-d658ffd2e7ad"),
    (a._sentryDebugIdIdentifier =
      "sentry-dbid-b0236d69-239e-42e6-b399-d658ffd2e7ad"));
} catch {}
const L = B({
  __name: "edit",
  async setup(a) {
    let t, i;
    const c = T(),
      e = H(null),
      u = P(),
      h = y(() => e.value?.name || "Pack"),
      x = y(() => [
        { label: "Packs", to: "/dashboard/maintenance/packs" },
        ...(e.value?.name
          ? [
              {
                label: e.value.name,
                to: `/dashboard/maintenance/packs/${c.params.id}`,
              },
            ]
          : []),
        { label: "Editar" },
      ]),
      D = (n) => {
        n && (e.value = n);
      },
      { data: w } =
        (([t, i] = F(async () =>
          N(`pack-edit-${c.params.id}`, async () => {
            const n = c.params.id;
            if (!n) return null;
            const l = await u("ad-packs", {
                method: "GET",
                params: { filters: { documentId: { $eq: n } } },
              }),
              s = Array.isArray(l.data) ? l.data[0] : null;
            return (
              s || (await u(`ad-packs/${n}`, { method: "GET" })).data || null
            );
          }),
        )),
        (t = await t),
        i(),
        t);
    return (
      (e.value = w.value ?? null),
      (n, l) => {
        const s = C,
          m = I,
          _ = A,
          p = $,
          g = E;
        return (
          d(),
          G("div", null, [
            o(s, { title: h.value, breadcrumbs: x.value }, null, 8, [
              "title",
              "breadcrumbs",
            ]),
            o(g, null, {
              content: r(() => [
                o(
                  _,
                  { title: "Editar pack", columns: 1 },
                  {
                    default: r(() => [
                      o(m, { pack: e.value, onSaved: D }, null, 8, ["pack"]),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              sidebar: r(() => [
                o(
                  _,
                  { title: "Detalles", columns: 1 },
                  {
                    default: r(() => [
                      e.value
                        ? (d(),
                          b(
                            p,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: f(v)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : k("", !0),
                      e.value
                        ? (d(),
                          b(
                            p,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: f(v)(e.value.updatedAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : k("", !0),
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
export { L as default };
//# sourceMappingURL=COjqkw4J.js.map

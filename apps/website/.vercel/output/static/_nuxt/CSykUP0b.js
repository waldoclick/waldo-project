import {
  aZ as C,
  b2 as D,
  b3 as I,
  b4 as A,
  a_ as s,
  a$ as $,
  b0 as i,
  b1 as a,
  br as B,
  b6 as _,
  bs as E,
  b5 as d,
  b7 as u,
  b8 as N,
  b9 as v,
  ba as T,
} from "./BK8sApmn.js";
import { _ as V } from "./vgLiQXkW.js";
import { _ as G } from "./C2l5JNgr.js";
import { _ as H, a as q } from "./RoATBwxO.js";
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
    n = new t.Error().stack;
  n &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[n] = "38e2a432-ad3a-4836-afb9-c0539e23121e"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-38e2a432-ad3a-4836-afb9-c0539e23121e"));
} catch {}
const K = C({
  __name: "index",
  async setup(t) {
    let n, p;
    const m = D(),
      e = N(null),
      b = I(),
      h = v(() => e.value?.name || "Condición"),
      k = v(() => [
        { label: "Condiciones", to: "/dashboard/maintenance/conditions" },
        ...(e.value?.name ? [{ label: e.value.name }] : []),
      ]),
      { data: g } =
        (([n, p] = A(async () =>
          T(`condition-${m.params.id}`, async () => {
            const r = m.params.id;
            if (!r) return null;
            const o = await b("conditions", {
                method: "GET",
                params: { filters: { documentId: { $eq: r } } },
              }),
              l = Array.isArray(o.data) ? o.data[0] : null;
            return (
              l || (await b(`conditions/${r}`, { method: "GET" })).data || null
            );
          }),
        )),
        (n = await n),
        p(),
        n);
    return (
      (e.value = g.value ?? null),
      (r, o) => {
        const l = B,
          f = V,
          c = G,
          y = H,
          w = q;
        return (
          s(),
          $("div", null, [
            i(
              f,
              { title: h.value, breadcrumbs: k.value },
              {
                actions: a(() => [
                  i(
                    l,
                    {
                      class: "btn btn--primary",
                      to: `/dashboard/maintenance/conditions/${_(m).params.id}/edit`,
                    },
                    {
                      default: a(() => [
                        ...(o[0] || (o[0] = [E(" Editar condición ", -1)])),
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
            i(w, null, {
              content: a(() => [
                i(
                  y,
                  { title: "Información", columns: 2 },
                  {
                    default: a(() => [
                      e.value
                        ? (s(),
                          d(
                            c,
                            {
                              key: 0,
                              title: "Nombre",
                              description: e.value.name,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : u("", !0),
                      e.value
                        ? (s(),
                          d(
                            c,
                            {
                              key: 1,
                              title: "Slug",
                              description: e.value.slug,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : u("", !0),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              sidebar: a(() => [
                i(
                  y,
                  { title: "Detalles", columns: 1 },
                  {
                    default: a(() => [
                      e.value
                        ? (s(),
                          d(
                            c,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: _(x)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : u("", !0),
                      e.value
                        ? (s(),
                          d(
                            c,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: _(x)(e.value.updatedAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : u("", !0),
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
//# sourceMappingURL=CSykUP0b.js.map

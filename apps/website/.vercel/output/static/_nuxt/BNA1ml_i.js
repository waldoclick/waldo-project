import {
  aZ as D,
  b2 as I,
  b3 as C,
  b4 as A,
  a_ as s,
  a$ as $,
  b0 as r,
  b1 as a,
  br as B,
  b6 as _,
  bs as E,
  b5 as d,
  b7 as u,
  b8 as N,
  b9 as g,
  ba as T,
} from "./BK8sApmn.js";
import { _ as R } from "./vgLiQXkW.js";
import { _ as V } from "./C2l5JNgr.js";
import { _ as G, a as H } from "./RoATBwxO.js";
import { f as v } from "./CjIigZ6h.js";
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
    (t._sentryDebugIds[n] = "01dfc4bf-c2fe-4504-8132-323b9096058a"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-01dfc4bf-c2fe-4504-8132-323b9096058a"));
} catch {}
const K = D({
  __name: "index",
  async setup(t) {
    let n, p;
    const m = I(),
      e = N(null),
      b = C(),
      x = g(() => e.value?.name || "Región"),
      h = g(() => [
        { label: "Regiones", to: "/dashboard/maintenance/regions" },
        ...(e.value?.name ? [{ label: e.value.name }] : []),
      ]),
      { data: k } =
        (([n, p] = A(async () =>
          T(`region-${m.params.id}`, async () => {
            const i = m.params.id;
            if (!i) return null;
            const o = await b("regions", {
                method: "GET",
                params: { filters: { documentId: { $eq: i } } },
              }),
              l = Array.isArray(o.data) ? o.data[0] : null;
            return (
              l || (await b(`regions/${i}`, { method: "GET" })).data || null
            );
          }),
        )),
        (n = await n),
        p(),
        n);
    return (
      (e.value = k.value ?? null),
      (i, o) => {
        const l = B,
          f = R,
          c = V,
          y = G,
          w = H;
        return (
          s(),
          $("div", null, [
            r(
              f,
              { title: x.value, breadcrumbs: h.value },
              {
                actions: a(() => [
                  r(
                    l,
                    {
                      class: "btn btn--primary",
                      to: `/dashboard/maintenance/regions/${_(m).params.id}/edit`,
                    },
                    {
                      default: a(() => [
                        ...(o[0] || (o[0] = [E(" Editar región ", -1)])),
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
            r(w, null, {
              content: a(() => [
                r(
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
                r(
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
                              description: _(v)(e.value.createdAt),
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
                              description: _(v)(e.value.updatedAt),
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
//# sourceMappingURL=BNA1ml_i.js.map

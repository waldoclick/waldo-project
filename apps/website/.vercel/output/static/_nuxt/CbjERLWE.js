import {
  aZ as w,
  b2 as C,
  b3 as I,
  b4 as A,
  a_ as a,
  a$ as B,
  b0 as r,
  b1 as o,
  br as N,
  b6 as p,
  bs as T,
  b5 as s,
  b7 as c,
  b8 as $,
  b9 as b,
  ba as E,
} from "./BK8sApmn.js";
import { _ as P } from "./vgLiQXkW.js";
import { _ as V } from "./C2l5JNgr.js";
import { _ as H, a as S } from "./RoATBwxO.js";
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
    n = new t.Error().stack;
  n &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[n] = "e4306711-2053-40f4-9574-9b3e3486ebd2"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-e4306711-2053-40f4-9574-9b3e3486ebd2"));
} catch {}
const z = w({
  __name: "index",
  async setup(t) {
    let n, _;
    const u = C(),
      e = $(null),
      y = I(),
      v = b(() => e.value?.title || "Politica"),
      x = b(() => [
        { label: "Politicas", to: "/dashboard/maintenance/policies" },
        ...(e.value?.title ? [{ label: e.value.title }] : []),
      ]),
      { data: h } =
        (([n, _] = A(async () =>
          E(
            `policy-${u.params.id}`,
            async () => {
              const d = u.params.id;
              if (!d) return null;
              const i = await y("policies", {
                method: "GET",
                params: { filters: { id: { $eq: Number(d) } } },
              });
              return Array.isArray(i.data) ? i.data[0] : null;
            },
            { default: () => null },
          ),
        )),
        (n = await n),
        _(),
        n);
    return (
      (e.value = h.value ?? null),
      (d, i) => {
        const k = N,
          D = P,
          l = V,
          m = H,
          g = S;
        return (
          a(),
          B("div", null, [
            r(
              D,
              { title: v.value, breadcrumbs: x.value },
              {
                actions: o(() => [
                  r(
                    k,
                    {
                      class: "btn btn--primary",
                      to: `/dashboard/maintenance/policies/${p(u).params.id}/edit`,
                    },
                    {
                      default: o(() => [
                        ...(i[0] || (i[0] = [T(" Editar Politica ", -1)])),
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
            r(g, null, {
              content: o(() => [
                r(
                  m,
                  { title: "Información", columns: 1 },
                  {
                    default: o(() => [
                      e.value
                        ? (a(),
                          s(
                            l,
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
                        ? (a(),
                          s(
                            l,
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
                        ? (a(),
                          s(
                            l,
                            {
                              key: 2,
                              title: "Orden",
                              description:
                                e.value.order != null
                                  ? String(e.value.order)
                                  : "Sin orden",
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
                r(
                  m,
                  { title: "Detalles", columns: 1 },
                  {
                    default: o(() => [
                      e.value
                        ? (a(),
                          s(
                            l,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: p(f)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : c("", !0),
                      e.value
                        ? (a(),
                          s(
                            l,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: p(f)(e.value.updatedAt),
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
export { z as default };
//# sourceMappingURL=CbjERLWE.js.map

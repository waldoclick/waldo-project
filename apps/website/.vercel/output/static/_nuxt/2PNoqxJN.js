import {
  aZ as g,
  b2 as w,
  b3 as I,
  b4 as A,
  a_ as a,
  a$ as B,
  b0 as i,
  b1 as o,
  br as N,
  b6 as m,
  bs as T,
  b5 as l,
  b7 as d,
  b8 as $,
  b9 as b,
  ba as E,
} from "./BK8sApmn.js";
import { _ as V } from "./vgLiQXkW.js";
import { _ as H } from "./C2l5JNgr.js";
import { _ as S, a as U } from "./RoATBwxO.js";
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
    (t._sentryDebugIds[n] = "9368e88f-72b7-42ed-aa5f-2e51d263d6cd"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-9368e88f-72b7-42ed-aa5f-2e51d263d6cd"));
} catch {}
const z = g({
  __name: "index",
  async setup(t) {
    let n, _;
    const u = w(),
      e = $(null),
      y = I(),
      v = b(() => e.value?.title || "Condicion de Uso"),
      x = b(() => [
        { label: "Condiciones de Uso", to: "/dashboard/maintenance/terms" },
        ...(e.value?.title ? [{ label: e.value.title }] : []),
      ]),
      { data: C } =
        (([n, _] = A(async () =>
          E(
            `term-${u.params.id}`,
            async () => {
              const c = u.params.id;
              if (!c) return null;
              const r = await y("terms", {
                method: "GET",
                params: { filters: { id: { $eq: Number(c) } } },
              });
              return Array.isArray(r.data) ? r.data[0] : null;
            },
            { default: () => null },
          ),
        )),
        (n = await n),
        _(),
        n);
    return (
      (e.value = C.value ?? null),
      (c, r) => {
        const h = N,
          k = V,
          s = H,
          p = S,
          D = U;
        return (
          a(),
          B("div", null, [
            i(
              k,
              { title: v.value, breadcrumbs: x.value },
              {
                actions: o(() => [
                  i(
                    h,
                    {
                      class: "btn btn--primary",
                      to: `/dashboard/maintenance/terms/${m(u).params.id}/edit`,
                    },
                    {
                      default: o(() => [
                        ...(r[0] || (r[0] = [T(" Editar Condicion ", -1)])),
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
            i(D, null, {
              content: o(() => [
                i(
                  p,
                  { title: "Información", columns: 1 },
                  {
                    default: o(() => [
                      e.value
                        ? (a(),
                          l(
                            s,
                            {
                              key: 0,
                              title: "Título",
                              description: e.value.title,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : d("", !0),
                      e.value
                        ? (a(),
                          l(
                            s,
                            {
                              key: 1,
                              title: "Contenido",
                              description: e.value.text,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : d("", !0),
                      e.value
                        ? (a(),
                          l(
                            s,
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
                        : d("", !0),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              sidebar: o(() => [
                i(
                  p,
                  { title: "Detalles", columns: 1 },
                  {
                    default: o(() => [
                      e.value
                        ? (a(),
                          l(
                            s,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: m(f)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : d("", !0),
                      e.value
                        ? (a(),
                          l(
                            s,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: m(f)(e.value.updatedAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : d("", !0),
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
//# sourceMappingURL=2PNoqxJN.js.map

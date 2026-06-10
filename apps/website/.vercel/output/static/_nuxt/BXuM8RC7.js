import { _ as g } from "./vgLiQXkW.js";
import { _ as A, a as I } from "./RoATBwxO.js";
import { _ as k } from "./C2l5JNgr.js";
import {
  aZ as B,
  b2 as E,
  b3 as T,
  b4 as $,
  a_ as i,
  a$ as F,
  b0 as o,
  b1 as r,
  b5 as m,
  b6 as _,
  b7 as p,
  b8 as N,
  b9 as b,
  ba as U,
} from "./BK8sApmn.js";
import { F as H } from "./D25bJp4A.js";
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
    (t._sentryDebugIds[a] = "7837d98c-7dac-4d7e-b9a6-c2a5e1f3b513"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-7837d98c-7dac-4d7e-b9a6-c2a5e1f3b513"));
} catch {}
const K = B({
  __name: "edit",
  async setup(t) {
    let a, d;
    const s = E(),
      e = N(null),
      y = T(),
      v = b(() => e.value?.title || "Condicion de Uso"),
      h = b(() => [
        { label: "Condiciones de Uso", to: "/dashboard/maintenance/terms" },
        ...(e.value?.title
          ? [
              {
                label: e.value.title,
                to: `/dashboard/maintenance/terms/${s.params.id}`,
              },
            ]
          : []),
        { label: "Editar" },
      ]),
      C = (n) => {
        n && (e.value = n);
      },
      { data: x } =
        (([a, d] = $(async () =>
          U(
            `term-edit-${s.params.id}`,
            async () => {
              const n = s.params.id;
              if (!n) return null;
              const l = await y("terms", {
                method: "GET",
                params: { filters: { id: { $eq: Number(n) } } },
              });
              return Array.isArray(l.data) ? l.data[0] : null;
            },
            { default: () => null },
          ),
        )),
        (a = await a),
        d(),
        a);
    return (
      (e.value = x.value ?? null),
      (n, l) => {
        const D = g,
          c = A,
          u = k,
          w = I;
        return (
          i(),
          F("div", null, [
            o(D, { title: v.value, breadcrumbs: h.value }, null, 8, [
              "title",
              "breadcrumbs",
            ]),
            o(w, null, {
              content: r(() => [
                o(
                  c,
                  { title: "Editar Condicion de Uso", columns: 1 },
                  {
                    default: r(() => [
                      o(H, { term: e.value, onSaved: C }, null, 8, ["term"]),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              sidebar: r(() => [
                o(
                  c,
                  { title: "Detalles", columns: 1 },
                  {
                    default: r(() => [
                      e.value
                        ? (i(),
                          m(
                            u,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: _(f)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : p("", !0),
                      e.value
                        ? (i(),
                          m(
                            u,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: _(f)(e.value.updatedAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : p("", !0),
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
//# sourceMappingURL=BXuM8RC7.js.map

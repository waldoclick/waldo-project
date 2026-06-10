import {
  aZ as C,
  b2 as D,
  b3 as I,
  b4 as A,
  a_ as n,
  a$ as $,
  b0 as l,
  b1 as o,
  br as B,
  b6 as p,
  bs as E,
  b5 as c,
  b7 as i,
  b8 as N,
  b9 as v,
  ba as T,
} from "./BK8sApmn.js";
import { _ as V } from "./vgLiQXkW.js";
import { _ as G } from "./C2l5JNgr.js";
import { _ as H, a as R } from "./RoATBwxO.js";
import { f as g } from "./CjIigZ6h.js";
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
    (t._sentryDebugIds[a] = "e8aacc21-2b9d-4237-bb06-1b1e7cc40f0d"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-e8aacc21-2b9d-4237-bb06-1b1e7cc40f0d"));
} catch {}
const K = C({
  __name: "index",
  async setup(t) {
    let a, _;
    const d = D(),
      e = N(null),
      b = I(),
      x = v(() => e.value?.name || "Comuna"),
      k = v(() => [
        { label: "Comunas", to: "/dashboard/maintenance/communes" },
        ...(e.value?.name ? [{ label: e.value.name }] : []),
      ]),
      { data: h } =
        (([a, _] = A(async () =>
          T(`commune-${d.params.id}`, async () => {
            const u = d.params.id;
            if (!u) return null;
            const s = await b("communes", {
                method: "GET",
                params: {
                  filters: { documentId: { $eq: u } },
                  populate: "region",
                },
              }),
              m = Array.isArray(s.data) ? s.data[0] : null;
            return (
              m ||
              (
                await b(`communes/${u}`, {
                  method: "GET",
                  params: { populate: "region" },
                })
              ).data ||
              null
            );
          }),
        )),
        (a = await a),
        _(),
        a);
    return (
      (e.value = h.value ?? null),
      (u, s) => {
        const m = B,
          f = V,
          r = G,
          y = H,
          w = R;
        return (
          n(),
          $("div", null, [
            l(
              f,
              { title: x.value, breadcrumbs: k.value },
              {
                actions: o(() => [
                  l(
                    m,
                    {
                      class: "btn btn--primary",
                      to: `/dashboard/maintenance/communes/${p(d).params.id}/edit`,
                    },
                    {
                      default: o(() => [
                        ...(s[0] || (s[0] = [E(" Editar comuna ", -1)])),
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
            l(w, null, {
              content: o(() => [
                l(
                  y,
                  { title: "Información", columns: 2 },
                  {
                    default: o(() => [
                      e.value
                        ? (n(),
                          c(
                            r,
                            {
                              key: 0,
                              title: "Nombre",
                              description: e.value.name,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : i("", !0),
                      e.value
                        ? (n(),
                          c(
                            r,
                            {
                              key: 1,
                              title: "Región",
                              description: e.value.region?.name || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : i("", !0),
                      e.value
                        ? (n(),
                          c(
                            r,
                            {
                              key: 2,
                              title: "Slug",
                              description: e.value.slug,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : i("", !0),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              sidebar: o(() => [
                l(
                  y,
                  { title: "Detalles", columns: 1 },
                  {
                    default: o(() => [
                      e.value
                        ? (n(),
                          c(
                            r,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: p(g)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : i("", !0),
                      e.value
                        ? (n(),
                          c(
                            r,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: p(g)(e.value.updatedAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : i("", !0),
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
//# sourceMappingURL=B9jLAhDR.js.map

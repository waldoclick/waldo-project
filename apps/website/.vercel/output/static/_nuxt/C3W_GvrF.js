import {
  aZ as w,
  b2 as C,
  b3 as I,
  b4 as $,
  a_ as t,
  a$ as A,
  b0 as c,
  b1 as r,
  br as T,
  b6 as m,
  bs as B,
  b5 as n,
  b7 as o,
  b8 as E,
  b9 as v,
  ba as N,
} from "./BK8sApmn.js";
import { _ as S } from "./vgLiQXkW.js";
import { _ as L } from "./C2l5JNgr.js";
import { _ as P, a as V } from "./RoATBwxO.js";
import { f as k } from "./CjIigZ6h.js";
import "./CNKn_OHC.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
try {
  let i =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    s = new i.Error().stack;
  s &&
    ((i._sentryDebugIds = i._sentryDebugIds || {}),
    (i._sentryDebugIds[s] = "e7ed40e2-a6e7-4f2b-93c7-828bbc9c75bc"),
    (i._sentryDebugIdIdentifier =
      "sentry-dbid-e7ed40e2-a6e7-4f2b-93c7-828bbc9c75bc"));
} catch {}
const J = w({
  __name: "index",
  async setup(i) {
    let s, _;
    const p = C(),
      e = E(null),
      b = I(),
      x = v(() => e.value?.name || "Pack"),
      D = v(() => [
        { label: "Packs", to: "/dashboard/maintenance/packs" },
        ...(e.value?.name ? [{ label: e.value.name }] : []),
      ]),
      { data: g } =
        (([s, _] = $(async () =>
          N(`pack-${p.params.id}`, async () => {
            const u = p.params.id;
            if (!u) return null;
            const l = await b("ad-packs", {
                method: "GET",
                params: { filters: { documentId: { $eq: u } } },
              }),
              d = Array.isArray(l.data) ? l.data[0] : null;
            return (
              d || (await b(`ad-packs/${u}`, { method: "GET" })).data || null
            );
          }),
        )),
        (s = await s),
        _(),
        s);
    return (
      (e.value = g.value ?? null),
      (u, l) => {
        const d = T,
          f = S,
          a = L,
          y = P,
          h = V;
        return (
          t(),
          A("div", null, [
            c(
              f,
              { title: x.value, breadcrumbs: D.value },
              {
                actions: r(() => [
                  c(
                    d,
                    {
                      class: "btn btn--primary",
                      to: `/dashboard/maintenance/packs/${m(p).params.id}/edit`,
                    },
                    {
                      default: r(() => [
                        ...(l[0] || (l[0] = [B(" Editar pack ", -1)])),
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
            c(h, null, {
              content: r(() => [
                c(
                  y,
                  { title: "Información", columns: 2 },
                  {
                    default: r(() => [
                      e.value
                        ? (t(),
                          n(
                            a,
                            {
                              key: 0,
                              title: "Nombre",
                              description: e.value.name,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (t(),
                          n(
                            a,
                            {
                              key: 1,
                              title: "Descripción",
                              description: e.value.description,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (t(),
                          n(
                            a,
                            {
                              key: 2,
                              title: "Texto",
                              description: e.value.text,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (t(),
                          n(
                            a,
                            {
                              key: 3,
                              title: "Precio",
                              description: `$${e.value.price?.toLocaleString("es-CL") || "--"}`,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (t(),
                          n(
                            a,
                            {
                              key: 4,
                              title: "Duración (días)",
                              description:
                                e.value.total_days?.toString() || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (t(),
                          n(
                            a,
                            {
                              key: 5,
                              title: "Cantidad de anuncios",
                              description:
                                e.value.total_ads?.toString() || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (t(),
                          n(
                            a,
                            {
                              key: 6,
                              title: "Destacados",
                              description:
                                e.value.total_features?.toString() || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              sidebar: r(() => [
                c(
                  y,
                  { title: "Detalles", columns: 1 },
                  {
                    default: r(() => [
                      e.value
                        ? (t(),
                          n(
                            a,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: m(k)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (t(),
                          n(
                            a,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: m(k)(e.value.updatedAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
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
export { J as default };
//# sourceMappingURL=C3W_GvrF.js.map

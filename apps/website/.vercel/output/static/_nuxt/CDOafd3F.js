import { _ as x } from "./vgLiQXkW.js";
import { _ as g } from "./C2l5JNgr.js";
import { _ as C, a as I } from "./RoATBwxO.js";
import {
  aZ as A,
  b2 as $,
  b3 as B,
  b4 as E,
  a_ as a,
  a$ as T,
  b0 as u,
  b1 as c,
  b5 as n,
  b6 as p,
  b7 as r,
  b8 as G,
  b9 as y,
  ba as H,
} from "./BK8sApmn.js";
import { f as N } from "./DFEPOiSh.js";
import { a as V } from "./b4AISZcu.js";
import { f as v } from "./CjIigZ6h.js";
import "./CNKn_OHC.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
try {
  let o =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    s = new o.Error().stack;
  s &&
    ((o._sentryDebugIds = o._sentryDebugIds || {}),
    (o._sentryDebugIds[s] = "cd164e68-a089-48c2-8aed-6dae3e8d530c"),
    (o._sentryDebugIdIdentifier =
      "sentry-dbid-cd164e68-a089-48c2-8aed-6dae3e8d530c"));
} catch {}
const K = A({
  __name: "[id]",
  async setup(o) {
    let s, m;
    const f = $(),
      e = G(null),
      _ = B(),
      D = y(() => (e.value?.id ? `Destacado #${e.value.id}` : "Destacado")),
      k = y(() => [
        { label: "Destacados", to: "/dashboard/featured/free" },
        ...(e.value?.id ? [{ label: `#${e.value.id}` }] : []),
      ]),
      { data: h } =
        (([s, m] = E(async () =>
          H(`featured-${f.params.id}`, async () => {
            const i = f.params.id;
            if (!i) return null;
            try {
              const l = await _("ad-featured-reservations", {
                  method: "GET",
                  params: {
                    filters: { id: { $eq: i } },
                    populate: {
                      user: { fields: ["username"] },
                      ad: { fields: ["name"] },
                    },
                  },
                }),
                d = Array.isArray(l.data) ? l.data[0] : null;
              return (
                d ||
                (
                  await _(`ad-featured-reservations/${i}`, {
                    method: "GET",
                    params: {
                      populate: {
                        user: { fields: ["username"] },
                        ad: { fields: ["name"] },
                      },
                    },
                  })
                ).data ||
                null
              );
            } catch {
              return null;
            }
          }),
        )),
        (s = await s),
        m(),
        s);
    return (
      (e.value = h.value ?? null),
      (i, l) => {
        const d = x,
          t = g,
          b = C,
          w = I;
        return (
          a(),
          T("div", null, [
            u(d, { title: D.value, breadcrumbs: k.value }, null, 8, [
              "title",
              "breadcrumbs",
            ]),
            u(w, null, {
              content: c(() => [
                u(
                  b,
                  { title: "Información", columns: 2 },
                  {
                    default: c(() => [
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 0,
                              title: "ID",
                              description: String(e.value.id),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : r("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 1,
                              title: "Usuario",
                              description: e.value.user?.username || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : r("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 2,
                              title: "Anuncio",
                              description: e.value.ad?.name || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : r("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 3,
                              title: "Precio",
                              description: p(N)(e.value.price),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : r("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 4,
                              title: "Días",
                              description: p(V)(e.value.total_days),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : r("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 5,
                              title: "Descripción",
                              description: e.value.description || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : r("", !0),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              sidebar: c(() => [
                u(
                  b,
                  { title: "Detalles", columns: 1 },
                  {
                    default: c(() => [
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: p(v)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : r("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: p(v)(e.value.updatedAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : r("", !0),
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
//# sourceMappingURL=CDOafd3F.js.map

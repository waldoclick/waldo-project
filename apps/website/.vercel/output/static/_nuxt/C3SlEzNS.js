import { _ as x } from "./vgLiQXkW.js";
import { _ as g } from "./C2l5JNgr.js";
import { _ as C, a as I } from "./RoATBwxO.js";
import {
  aZ as A,
  b2 as $,
  b3 as B,
  b4 as E,
  a_ as a,
  a$ as R,
  b0 as c,
  b1 as d,
  b5 as n,
  b6 as p,
  b7 as r,
  b8 as T,
  b9 as v,
  ba as G,
} from "./BK8sApmn.js";
import { f as H } from "./DFEPOiSh.js";
import { a as N } from "./b4AISZcu.js";
import { f as y } from "./CjIigZ6h.js";
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
    (o._sentryDebugIds[s] = "467c9729-b746-4275-acb6-598d869c4d00"),
    (o._sentryDebugIdIdentifier =
      "sentry-dbid-467c9729-b746-4275-acb6-598d869c4d00"));
} catch {}
const K = A({
  __name: "[id]",
  async setup(o) {
    let s, m;
    const _ = $(),
      e = T(null),
      f = B(),
      k = v(() => (e.value?.id ? `Reserva #${e.value.id}` : "Reserva")),
      D = v(() => [
        { label: "Reservas", to: "/dashboard/reservations/free" },
        ...(e.value?.id ? [{ label: `#${e.value.id}` }] : []),
      ]),
      { data: h } =
        (([s, m] = E(async () =>
          G(`reservation-${_.params.id}`, async () => {
            const i = _.params.id;
            if (!i) return null;
            try {
              const l = await f("ad-reservations", {
                  method: "GET",
                  params: {
                    filters: { id: { $eq: i } },
                    populate: {
                      user: { fields: ["username"] },
                      ad: { fields: ["name"] },
                    },
                  },
                }),
                u = Array.isArray(l.data) ? l.data[0] : null;
              return (
                u ||
                (
                  await f(`ad-reservations/${i}`, {
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
        const u = x,
          t = g,
          b = C,
          w = I;
        return (
          a(),
          R("div", null, [
            c(u, { title: k.value, breadcrumbs: D.value }, null, 8, [
              "title",
              "breadcrumbs",
            ]),
            c(w, null, {
              content: d(() => [
                c(
                  b,
                  { title: "Información", columns: 2 },
                  {
                    default: d(() => [
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
                              description: p(H)(e.value.price),
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
                              description: p(N)(e.value.total_days),
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
              sidebar: d(() => [
                c(
                  b,
                  { title: "Detalles", columns: 1 },
                  {
                    default: d(() => [
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: p(y)(e.value.createdAt),
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
                              description: p(y)(e.value.updatedAt),
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
//# sourceMappingURL=C3SlEzNS.js.map

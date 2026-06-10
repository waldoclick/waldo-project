import { _ as w } from "./vgLiQXkW.js";
import { _ as D } from "./C2l5JNgr.js";
import { _ as I, a as C } from "./RoATBwxO.js";
import {
  aZ as A,
  b2 as B,
  b3 as T,
  b4 as E,
  a_ as o,
  a$ as $,
  b0 as u,
  b1 as c,
  b5 as s,
  b6 as f,
  b7 as r,
  b8 as N,
  b9 as y,
  ba as R,
} from "./BK8sApmn.js";
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
    a = new t.Error().stack;
  a &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[a] = "0b969f7c-d846-48c2-8508-a7852687b259"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-0b969f7c-d846-48c2-8508-a7852687b259"));
} catch {}
const q = A({
  __name: "index",
  async setup(t) {
    let a, p;
    const m = B(),
      e = N(null),
      _ = T(),
      h = y(() => e.value?.user?.email || "Subscripción PRO"),
      k = y(() => [
        {
          label: "Subscripciones PRO",
          to: "/dashboard/users/subscription-pros",
        },
        ...(e.value?.user?.email ? [{ label: e.value.user.email }] : []),
      ]),
      { data: x } =
        (([a, p] = E(async () =>
          R(
            `subscription-pro-${m.params.id}`,
            async () => {
              const i = m.params.id;
              if (!i) return null;
              const d = await _("subscription-pros", {
                  method: "GET",
                  params: {
                    filters: { documentId: { $eq: i } },
                    populate: { user: { fields: ["email", "username"] } },
                  },
                }),
                l = Array.isArray(d.data) ? d.data[0] : null;
              return (
                l ||
                (
                  await _(`subscription-pros/${i}`, {
                    method: "GET",
                    params: {
                      populate: { user: { fields: ["email", "username"] } },
                    },
                  })
                ).data ||
                null
              );
            },
            { default: () => null },
          ),
        )),
        (a = await a),
        p(),
        a);
    return (
      (e.value = x.value ?? null),
      (i, d) => {
        const l = w,
          n = D,
          b = I,
          g = C;
        return (
          o(),
          $("div", null, [
            u(l, { title: h.value, breadcrumbs: k.value }, null, 8, [
              "title",
              "breadcrumbs",
            ]),
            u(g, null, {
              content: c(() => [
                u(
                  b,
                  { title: "Información", columns: 2 },
                  {
                    default: c(() => [
                      e.value
                        ? (o(),
                          s(
                            n,
                            {
                              key: 0,
                              title: "Usuario",
                              description: e.value.user?.email || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : r("", !0),
                      e.value
                        ? (o(),
                          s(
                            n,
                            {
                              key: 1,
                              title: "Tipo de tarjeta",
                              description: e.value.card_type || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : r("", !0),
                      e.value
                        ? (o(),
                          s(
                            n,
                            {
                              key: 2,
                              title: "Últimos 4 dígitos",
                              description: e.value.card_last4 || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : r("", !0),
                      e.value
                        ? (o(),
                          s(
                            n,
                            {
                              key: 3,
                              title: "Factura pendiente",
                              description: e.value.pending_invoice
                                ? "Sí"
                                : "No",
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
                        ? (o(),
                          s(
                            n,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: f(v)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : r("", !0),
                      e.value
                        ? (o(),
                          s(
                            n,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: f(v)(e.value.updatedAt),
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
export { q as default };
//# sourceMappingURL=DwL58EUk.js.map

import { _ as I } from "./vgLiQXkW.js";
import { _ as x } from "./C2l5JNgr.js";
import { _ as A, a as B } from "./RoATBwxO.js";
import {
  aZ as N,
  b2 as $,
  b3 as F,
  b4 as R,
  a_ as n,
  a$ as T,
  b0 as r,
  b1 as i,
  b5 as o,
  b6 as c,
  b7 as a,
  b8 as E,
  b9 as b,
  ba as M,
} from "./BK8sApmn.js";
import { f as O } from "./DFEPOiSh.js";
import { g as S, b as H } from "./b4AISZcu.js";
import { f } from "./CjIigZ6h.js";
import "./CNKn_OHC.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
try {
  let u =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    s = new u.Error().stack;
  s &&
    ((u._sentryDebugIds = u._sentryDebugIds || {}),
    (u._sentryDebugIds[s] = "9d9a208b-b8b5-4f37-bba1-dc33e169003e"),
    (u._sentryDebugIdIdentifier =
      "sentry-dbid-9d9a208b-b8b5-4f37-bba1-dc33e169003e"));
} catch {}
const L = N({
  __name: "[id]",
  async setup(u) {
    let s, v;
    const m = $(),
      p = b(() => String(m.params.id || "")),
      e = E(null),
      y = F(),
      h = b(() => (p.value ? `Orden #${p.value}` : "Orden")),
      k = b(() => [
        { label: "Órdenes", to: "/dashboard/orders" },
        ...(p.value ? [{ label: `#${p.value}` }] : []),
      ]),
      g = (l) => {
        if (!l) return null;
        if (typeof l == "object" && l !== null) {
          if ("data" in l) return l.data;
          if ("order" in l) return l.order;
          if ("id" in l) return l;
        }
        return null;
      },
      { data: D } =
        (([s, v] = R(async () =>
          M(`order-${m.params.id}`, async () => {
            const l = m.params.id;
            if (!l) return null;
            try {
              const _ = await y(`orders/${l}`, {
                method: "GET",
                params: { populate: { user: !0, ad: !0 } },
              });
              return g(_);
            } catch {
              return null;
            }
          }),
        )),
        (s = await s),
        v(),
        s);
    return (
      (e.value = D.value ?? null),
      (l, _) => {
        const w = I,
          t = x,
          d = A,
          C = B;
        return (
          n(),
          T("div", null, [
            r(w, { title: h.value, breadcrumbs: k.value }, null, 8, [
              "title",
              "breadcrumbs",
            ]),
            r(C, null, {
              content: i(() => [
                r(
                  d,
                  { title: "Resumen", columns: 2 },
                  {
                    default: i(() => [
                      e.value
                        ? (n(),
                          o(
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
                        : a("", !0),
                      e.value
                        ? (n(),
                          o(
                            t,
                            {
                              key: 1,
                              title: "Monto",
                              description: c(O)(e.value.amount),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : a("", !0),
                      e.value
                        ? (n(),
                          o(
                            t,
                            {
                              key: 2,
                              title: "Método de pago",
                              description: c(S)(e.value.payment_method),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : a("", !0),
                      e.value
                        ? (n(),
                          o(
                            t,
                            {
                              key: 3,
                              title: "Documento",
                              description: e.value.is_invoice
                                ? "Factura"
                                : "Boleta",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : a("", !0),
                      e.value
                        ? (n(),
                          o(
                            t,
                            {
                              key: 4,
                              title: "Fecha",
                              description: c(f)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : a("", !0),
                    ]),
                    _: 1,
                  },
                ),
                e.value?.user
                  ? (n(),
                    o(
                      d,
                      { key: 0, title: "Cliente", columns: 2 },
                      {
                        default: i(() => [
                          r(
                            t,
                            {
                              title: "Usuario",
                              description: e.value.user?.username || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ),
                          r(
                            t,
                            {
                              title: "Correo electrónico",
                              description: e.value.user?.email || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ),
                          r(
                            t,
                            {
                              title: "Nombre",
                              description: c(H)(
                                e.value.user?.firstname,
                                e.value.user?.lastname,
                              ),
                            },
                            null,
                            8,
                            ["description"],
                          ),
                          r(
                            t,
                            {
                              title: "Teléfono",
                              description: e.value.user?.phone || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ),
                        ]),
                        _: 1,
                      },
                    ))
                  : a("", !0),
                e.value?.ad
                  ? (n(),
                    o(
                      d,
                      { key: 1, title: "Anuncio", columns: 2 },
                      {
                        default: i(() => [
                          r(
                            t,
                            {
                              title: "Nombre",
                              description: e.value.ad?.name || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ),
                          r(
                            t,
                            {
                              title: "Slug",
                              description: e.value.ad?.slug || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ),
                          r(
                            t,
                            {
                              title: "ID",
                              description: e.value.ad?.id || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ),
                        ]),
                        _: 1,
                      },
                    ))
                  : a("", !0),
                e.value?.items || e.value?.payment_response
                  ? (n(),
                    o(
                      d,
                      { key: 2, title: "Detalle de pago", columns: 1 },
                      {
                        default: i(() => [
                          e.value?.items
                            ? (n(),
                              o(
                                t,
                                {
                                  key: 0,
                                  title: "Items",
                                  description: e.value.items,
                                  "show-copy-button": "",
                                },
                                null,
                                8,
                                ["description"],
                              ))
                            : a("", !0),
                          e.value?.payment_response
                            ? (n(),
                              o(
                                t,
                                {
                                  key: 1,
                                  title: "Respuesta de pago",
                                  description: e.value.payment_response,
                                  "show-copy-button": "",
                                },
                                null,
                                8,
                                ["description"],
                              ))
                            : a("", !0),
                        ]),
                        _: 1,
                      },
                    ))
                  : a("", !0),
                e.value?.document_details || e.value?.document_response
                  ? (n(),
                    o(
                      d,
                      { key: 3, title: "Documento tributario", columns: 1 },
                      {
                        default: i(() => [
                          e.value?.document_details
                            ? (n(),
                              o(
                                t,
                                {
                                  key: 0,
                                  title: "Detalle",
                                  description: e.value.document_details,
                                  "show-copy-button": "",
                                },
                                null,
                                8,
                                ["description"],
                              ))
                            : a("", !0),
                          e.value?.document_response
                            ? (n(),
                              o(
                                t,
                                {
                                  key: 1,
                                  title: "Respuesta",
                                  description: e.value.document_response,
                                  "show-copy-button": "",
                                },
                                null,
                                8,
                                ["description"],
                              ))
                            : a("", !0),
                        ]),
                        _: 1,
                      },
                    ))
                  : a("", !0),
              ]),
              sidebar: i(() => [
                r(
                  d,
                  { title: "Detalles", columns: 1 },
                  {
                    default: i(() => [
                      e.value
                        ? (n(),
                          o(
                            t,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: c(f)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : a("", !0),
                      e.value
                        ? (n(),
                          o(
                            t,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: c(f)(e.value.updatedAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : a("", !0),
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
export { L as default };
//# sourceMappingURL=CJL1B_xp.js.map

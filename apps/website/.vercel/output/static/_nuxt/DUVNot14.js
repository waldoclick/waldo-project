import { _ as C } from "./vgLiQXkW.js";
import { _ as w } from "./C2l5JNgr.js";
import { _ as D, a as I } from "./RoATBwxO.js";
import {
  aZ as A,
  b2 as P,
  b3 as $,
  b4 as B,
  a_ as a,
  a$ as E,
  b0 as c,
  b1 as p,
  b5 as n,
  b6 as l,
  b7 as o,
  b8 as T,
  b9 as y,
  ba as z,
} from "./BK8sApmn.js";
import { f as s } from "./CjIigZ6h.js";
import { f as G } from "./DFEPOiSh.js";
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
    r = new i.Error().stack;
  r &&
    ((i._sentryDebugIds = i._sentryDebugIds || {}),
    (i._sentryDebugIds[r] = "1ba09952-9255-4ccf-998b-647ea2a01c20"),
    (i._sentryDebugIdIdentifier =
      "sentry-dbid-1ba09952-9255-4ccf-998b-647ea2a01c20"));
} catch {}
const Z = A({
  __name: "index",
  async setup(i) {
    let r, _;
    const b = P(),
      e = T(null),
      f = $(),
      k = y(() => `Pago #${e.value?.id ?? ""}`),
      h = y(() => [
        {
          label: "Pagos de subscripción",
          to: "/dashboard/users/subscription-payments",
        },
        ...(e.value ? [{ label: `Pago #${e.value.id}` }] : []),
      ]),
      { data: g } =
        (([r, _] = B(async () =>
          z(
            `subscription-payment-${b.params.id}`,
            async () => {
              const u = b.params.id;
              if (!u) return null;
              const m = await f("subscription-payments", {
                  method: "GET",
                  params: {
                    filters: { documentId: { $eq: u } },
                    populate: { user: { fields: ["email", "username"] } },
                  },
                }),
                d = Array.isArray(m.data) ? m.data[0] : null;
              return (
                d ||
                (
                  await f(`subscription-payments/${u}`, {
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
        (r = await r),
        _(),
        r);
    return (
      (e.value = g.value ?? null),
      (u, m) => {
        const d = C,
          t = w,
          v = D,
          x = I;
        return (
          a(),
          E("div", null, [
            c(d, { title: k.value, breadcrumbs: h.value }, null, 8, [
              "title",
              "breadcrumbs",
            ]),
            c(x, null, {
              content: p(() => [
                c(
                  v,
                  { title: "Información", columns: 2 },
                  {
                    default: p(() => [
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 0,
                              title: "Usuario",
                              description: e.value.user?.email || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 1,
                              title: "Monto",
                              description: l(G)(e.value.amount),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 2,
                              title: "Estado",
                              description: e.value.status,
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 3,
                              title: "Parent buy order",
                              description: e.value.parent_buy_order || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 4,
                              title: "Child buy order",
                              description: e.value.child_buy_order || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 5,
                              title: "Código de autorización",
                              description: e.value.authorization_code || "--",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 6,
                              title: "Código de respuesta",
                              description: e.value.response_code ?? "--",
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 7,
                              title: "Intentos de cobro",
                              description: e.value.charge_attempts.toString(),
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
              sidebar: p(() => [
                c(
                  v,
                  { title: "Detalles", columns: 1 },
                  {
                    default: p(() => [
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 0,
                              title: "Período inicio",
                              description: l(s)(e.value.period_start ?? void 0),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 1,
                              title: "Período fin",
                              description: l(s)(e.value.period_end ?? void 0),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 2,
                              title: "Cobrado el",
                              description: l(s)(e.value.charged_at ?? void 0),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 3,
                              title: "Próximo intento",
                              description: l(s)(
                                e.value.next_charge_attempt ?? void 0,
                              ),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 4,
                              title: "Fecha de creación",
                              description: l(s)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : o("", !0),
                      e.value
                        ? (a(),
                          n(
                            t,
                            {
                              key: 5,
                              title: "Última modificación",
                              description: l(s)(e.value.updatedAt),
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
export { Z as default };
//# sourceMappingURL=DUVNot14.js.map

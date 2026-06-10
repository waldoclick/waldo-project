import {
  aZ as C,
  b3 as k,
  bx as P,
  bz as w,
  a_ as a,
  a$ as s,
  b0 as S,
  b6 as t,
  bn as f,
  bf as i,
  b7 as r,
  bs as D,
  bi as l,
  b8 as O,
  b9 as d,
  cP as T,
  bk as B,
} from "./BK8sApmn.js";
import { C as N } from "./DnzrZk1h.js";
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
    c = new o.Error().stack;
  c &&
    ((o._sentryDebugIds = o._sentryDebugIds || {}),
    (o._sentryDebugIds[c] = "f0ec8191-2453-446c-96a6-cf55bb7cb421"),
    (o._sentryDebugIdIdentifier =
      "sentry-dbid-f0ec8191-2453-446c-96a6-cf55bb7cb421"));
} catch {}
const R = { class: "memo memo--pro" },
  A = { class: "memo--pro__text" },
  I = { class: "memo--pro__text__status" },
  z = {
    key: 0,
    class:
      "memo--pro__text__status__badge memo--pro__text__status__badge--active",
  },
  E = {
    key: 1,
    class:
      "memo--pro__text__status__badge memo--pro__text__status__badge--cancelled",
  },
  M = { key: 0, class: "memo--pro__text__card" },
  V = { key: 1, class: "memo--pro__text__date" },
  H = { key: 2, class: "memo--pro__text__date" },
  L = ["disabled"],
  U = C({
    __name: "MemoPro",
    setup(o) {
      const { Swal: c } = B(),
        y = k(),
        e = P(),
        { fetchUser: v } = w(),
        _ = O(!1),
        g = d(
          () =>
            e.value?.pro_status === "active" ||
            e.value?.pro_status === "cancelled",
        ),
        p = (u) =>
          u
            ? new Date(u).toLocaleDateString("es-CL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : null,
        m = d(() => p(e.value?.pro_expires_at ?? null)),
        b = d(() => p(e.value?.pro_expires_at ?? null)),
        x = () => {
          T("/pro/pagar");
        },
        h = async () => {
          if (
            (
              await c.fire({
                title: "Cancelar suscripción PRO",
                text: "¿Está seguro de cancelar su suscripción PRO? Seguirá activo hasta el fin del período.",
                icon: "warning",
                showCancelButton: !0,
                confirmButtonText: "Sí, cancelar",
                cancelButtonText: "No, mantener",
              })
            ).isConfirmed
          ) {
            _.value = !0;
            try {
              (await y("payments/pro-cancel", {
                method: "POST",
                body: { data: {} },
              }),
                await v());
            } catch {
              c.fire("Error", "No se pudo cancelar la suscripción.", "error");
            } finally {
              _.value = !1;
            }
          }
        };
      return (u, n) => (
        a(),
        s("div", R, [
          S(t(N), { size: 40, class: "memo--pro__icon" }),
          g.value
            ? (a(),
              s(
                f,
                { key: 1 },
                [
                  i("div", A, [
                    i("p", I, [
                      t(e)?.pro_status === "active"
                        ? (a(), s("span", z, " Activa "))
                        : r("", !0),
                      t(e)?.pro_status === "cancelled"
                        ? (a(), s("span", E, " Cancelada "))
                        : r("", !0),
                      n[1] || (n[1] = D(" Suscripción PRO ", -1)),
                    ]),
                    t(e)?.pro_card_type && t(e)?.pro_card_last4
                      ? (a(),
                        s(
                          "p",
                          M,
                          l(t(e)?.pro_card_type) +
                            " **** " +
                            l(t(e)?.pro_card_last4),
                          1,
                        ))
                      : r("", !0),
                    t(e)?.pro_status === "active" && m.value
                      ? (a(),
                        s("p", V, " Próxima fecha de cobro: " + l(m.value), 1))
                      : r("", !0),
                    t(e)?.pro_status === "cancelled" && b.value
                      ? (a(), s("p", H, " Activo hasta: " + l(b.value), 1))
                      : r("", !0),
                  ]),
                  t(e)?.pro_status === "active"
                    ? (a(),
                      s(
                        "button",
                        {
                          key: 0,
                          class: "btn btn--cancel",
                          title: "Cancelar suscripción",
                          disabled: _.value,
                          onClick: h,
                        },
                        l(_.value ? "Cancelando..." : "Cancelar"),
                        9,
                        L,
                      ))
                    : r("", !0),
                ],
                64,
              ))
            : (a(),
              s(
                f,
                { key: 0 },
                [
                  n[0] ||
                    (n[0] = i(
                      "div",
                      { class: "memo--pro__text" },
                      [
                        i(
                          "p",
                          null,
                          " ¡Potencia tu experiencia en Waldo.click! Por solo $1.000 mensuales, accede a funciones exclusivas y destaca tu perfil con una cuenta PRO. Únete a nuestra comunidad de usuarios destacados. ",
                        ),
                      ],
                      -1,
                    )),
                  i(
                    "button",
                    { class: "btn btn--buy", title: "Hazte PRO", onClick: x },
                    " Hazte PRO ",
                  ),
                ],
                64,
              )),
        ])
      );
    },
  }),
  F = Object.assign(U, { __name: "MemoPro" });
export { F as M };
//# sourceMappingURL=C6cPP_HD.js.map

import {
  aZ as v,
  a_ as a,
  a$ as d,
  bf as r,
  b0 as o,
  b6 as w,
  cq as I,
  b7 as u,
  bi as g,
  b1 as k,
  bn as O,
  b5 as _,
  bF as M,
  bu as P,
  b2 as R,
  b4 as x,
  cr as A,
  bw as F,
  cs as L,
  ct as T,
  cu as U,
  aY as B,
  b9 as E,
  ba as z,
  cv as h,
} from "./BK8sApmn.js";
import { _ as $ } from "./C7SjWCbw.js";
import { u as S } from "./CwEpj4fO.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
try {
  let e =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    n = new e.Error().stack;
  n &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[n] = "907af63f-dc19-4c6a-8729-99c109f5a935"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-907af63f-dc19-4c6a-8729-99c109f5a935"));
} catch {}
const V = { class: "resume resume--pro" },
  j = { class: "resume--pro__container" },
  H = { key: 0, class: "resume--pro__header" },
  q = { key: 0, class: "resume--pro__header__icon" },
  W = { key: 1, class: "resume--pro__header__title title" },
  G = { key: 2, class: "resume--pro__header__description paragraph" },
  Y = { class: "resume--pro__box" },
  Z = { class: "resume--pro__details" },
  J = { class: "resume--pro__grid" },
  K = { class: "resume--pro__box" },
  Q = { class: "resume--pro__details" },
  X = { class: "resume--pro__grid" },
  D = v({
    __name: "ResumePro",
    props: {
      showIcon: { type: Boolean, default: !0 },
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      summary: { type: Object, default: () => null },
      hidePaymentSection: { type: Boolean, default: !1 },
    },
    setup(e) {
      const n = (i, c = "CLP") =>
          !i && i !== 0
            ? "No especificado"
            : new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: c,
              }).format(i || 0),
        p = (i) =>
          i
            ? new Intl.DateTimeFormat("es-CL", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(i))
            : "-";
      return (i, c) => {
        const s = $,
          f = M;
        return (
          a(),
          d("section", V, [
            r("div", j, [
              e.showIcon || e.title || e.description
                ? (a(),
                  d("div", H, [
                    e.showIcon
                      ? (a(), d("div", q, [o(w(I), { size: 24 })]))
                      : u("", !0),
                    e.title ? (a(), d("h1", W, g(e.title), 1)) : u("", !0),
                    e.description
                      ? (a(), d("p", G, g(e.description), 1))
                      : u("", !0),
                  ]))
                : u("", !0),
              o(f, null, {
                default: k(() => [
                  e.summary
                    ? (a(),
                      d(
                        O,
                        { key: 0 },
                        [
                          r("div", Y, [
                            c[0] ||
                              (c[0] = r(
                                "div",
                                { class: "resume--pro__subtitle" },
                                [
                                  r(
                                    "h2",
                                    { class: "resume--pro__subtitle__title" },
                                    "Comprobante de pago",
                                  ),
                                ],
                                -1,
                              )),
                            r("div", Z, [
                              r("div", J, [
                                o(
                                  s,
                                  {
                                    title: "Monto pagado",
                                    description: n(
                                      e.summary.amount,
                                      e.summary.currency,
                                    ),
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ),
                                o(s, {
                                  title: "Estado del pago",
                                  description: "Pagado",
                                }),
                                e.summary.paymentMethod
                                  ? (a(),
                                    _(
                                      s,
                                      {
                                        key: 0,
                                        title: "Método de pago",
                                        description: e.summary.paymentMethod,
                                      },
                                      null,
                                      8,
                                      ["description"],
                                    ))
                                  : u("", !0),
                                e.summary.receiptNumber
                                  ? (a(),
                                    _(
                                      s,
                                      {
                                        key: 1,
                                        title: "Recibo Webpay",
                                        description: e.summary.receiptNumber,
                                      },
                                      null,
                                      8,
                                      ["description"],
                                    ))
                                  : u("", !0),
                                e.summary.createdAt
                                  ? (a(),
                                    _(
                                      s,
                                      {
                                        key: 2,
                                        title: "Fecha de pago",
                                        description: p(e.summary.createdAt),
                                      },
                                      null,
                                      8,
                                      ["description"],
                                    ))
                                  : u("", !0),
                                o(
                                  s,
                                  {
                                    title: "Código de autorización",
                                    description:
                                      e.summary.authorizationCode ??
                                      "No disponible",
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ),
                                o(
                                  s,
                                  {
                                    title: "Tipo de pago",
                                    description:
                                      e.summary.paymentType ?? "No disponible",
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ),
                                o(
                                  s,
                                  {
                                    title: "Últimos 4 dígitos",
                                    description:
                                      e.summary.cardLast4 ?? "No disponible",
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ),
                              ]),
                            ]),
                          ]),
                          r("div", K, [
                            c[1] ||
                              (c[1] = r(
                                "div",
                                { class: "resume--pro__subtitle" },
                                [
                                  r(
                                    "h2",
                                    { class: "resume--pro__subtitle__title" },
                                    " Información del comprador ",
                                  ),
                                ],
                                -1,
                              )),
                            r("div", Q, [
                              r("div", X, [
                                o(
                                  s,
                                  {
                                    title: "Nombre",
                                    description: e.summary.fullName || "-",
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ),
                                o(
                                  s,
                                  {
                                    title: "Correo electrónico",
                                    description: e.summary.email || "-",
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ),
                              ]),
                            ]),
                          ]),
                        ],
                        64,
                      ))
                    : u("", !0),
                ]),
                _: 1,
              }),
            ]),
          ])
        );
      };
    },
  }),
  ee = Object.assign(D, { __name: "ResumePro" }),
  te = { class: "page" },
  ue = v({
    __name: "gracias",
    async setup(e) {
      let n, p;
      const { $setSEO: i } = P(),
        c = R(),
        s = B(),
        f = (t) => {
          const y = {
              INVALID_URL: {
                message: "Orden inválida",
                statusMessage:
                  "No se recibió un ID de orden válido en la URL. Por favor vuelve e intenta nuevamente.",
              },
              NOT_FOUND: {
                message: "Orden no encontrada",
                statusMessage:
                  "No pudimos encontrar la información de tu pago en nuestro sistema.",
              },
            },
            C = y[t] || y.NOT_FOUND;
          h({ statusCode: 404, ...C });
        },
        {
          data: l,
          pending: se,
          error: m,
        } = (([n, p] = x(async () =>
          z(
            "pro-pagar-gracias",
            async () => {
              const t = c.query.order;
              if (!t) return { error: "INVALID_URL" };
              try {
                return await S(t);
              } catch {
                return { error: "NOT_FOUND" };
              }
            },
            { server: !0, lazy: !1 },
          ),
        )),
        (n = await n),
        p(),
        n),
        b = E(() => (!l.value || "error" in l.value ? null : l.value));
      A(() => {
        if (m.value) {
          h({
            statusCode: m.value.statusCode || 500,
            message: m.value.message || "Error inesperado",
            statusMessage:
              m.value.statusMessage ||
              m.value.message ||
              "Lo sentimos, ha ocurrido un error.",
          });
          return;
        }
        l.value && "error" in l.value && f(l.value.error);
      });
      const N = (t) => {
        if (t)
          return {
            documentId: t.documentId,
            amount: t.amount || t.totalAmount,
            currency: t.currency,
            status: t.status,
            paymentMethod: t.payment_type || t.paymentMethod,
            createdAt: t.paidAt || t.createdAt,
            receiptNumber:
              t.payment_response?.buy_order ||
              t.payment_response?.authorization_code ||
              "",
            email: t.user?.email || "",
            fullName: t.user?.fullName || t.user?.username || "",
            authorizationCode: t.payment_response?.authorization_code ?? void 0,
            paymentType:
              t.payment_response?.payment_type_code ??
              t.payment_type ??
              t.paymentMethod ??
              void 0,
            cardLast4: t.payment_response?.card_detail?.card_number ?? void 0,
            commerceCode: t.payment_response?.commerce_code ?? void 0,
          };
      };
      return (
        i({
          title: "Suscripción PRO Confirmada",
          description:
            "Tu suscripción PRO ha sido activada exitosamente en Waldo.click.",
          imageUrl: `${s.public.baseUrl}/share.jpg`,
          url: `${s.public.baseUrl}/pro/pagar/gracias`,
        }),
        F({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        (t, y) => (
          a(),
          d("div", te, [
            o(L, { "show-search": !0 }),
            o(T),
            b.value
              ? (a(),
                _(
                  ee,
                  {
                    key: 0,
                    title: "¡Pago recibido!",
                    description:
                      "Tu suscripción PRO ha sido activada. Más abajo verás el comprobante de tu pago. Guarda esta información.",
                    "show-icon": !0,
                    summary: N(b.value),
                  },
                  null,
                  8,
                  ["summary"],
                ))
              : u("", !0),
            o(U),
          ])
        )
      );
    },
  });
export { ue as default };
//# sourceMappingURL=CeaEAjFg.js.map

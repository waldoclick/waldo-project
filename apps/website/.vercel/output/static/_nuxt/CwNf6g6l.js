import {
  a_ as o,
  a$ as d,
  bf as r,
  b0 as a,
  b6 as A,
  cq as M,
  b7 as c,
  bi as h,
  b1 as x,
  bn as F,
  b5 as b,
  bF as O,
  aZ as T,
  bu as L,
  b2 as U,
  cF as E,
  bm as P,
  b4 as S,
  be as $,
  cr as B,
  bw as z,
  cs as R,
  ct as W,
  cu as G,
  aY as V,
  b9 as j,
  ba as q,
  cv as v,
  b8 as H,
} from "./BK8sApmn.js";
import { u as Y } from "./CJzzMwWR.js";
import { _ as Z } from "./C7SjWCbw.js";
import { u as J } from "./CwEpj4fO.js";
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
    (e._sentryDebugIds[n] = "27f5a023-6d3e-4a08-b031-d42f3180acd5"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-27f5a023-6d3e-4a08-b031-d42f3180acd5"));
} catch {}
const K = { class: "resume resume--order" },
  Q = { class: "resume--order__container" },
  X = { key: 0, class: "resume--order__header" },
  D = { key: 0, class: "resume--order__header__icon" },
  ee = { key: 1, class: "resume--order__header__title title" },
  te = { key: 2, class: "resume--order__header__description paragraph" },
  se = { class: "resume--order__box" },
  ae = { class: "resume--order__details" },
  re = { class: "resume--order__grid" },
  oe = { class: "resume--order__box" },
  ne = { class: "resume--order__details" },
  ie = { class: "resume--order__grid" },
  ce = {
    __name: "ResumeOrder",
    props: {
      showIcon: { type: Boolean, default: !0 },
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      summary: { type: Object, default: () => null },
      hidePaymentSection: { type: Boolean, default: !1 },
    },
    setup(e) {
      const n = (i, u = "CLP") =>
          !i && i !== 0
            ? "No especificado"
            : new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: u,
              }).format(i || 0),
        y = (i) =>
          i
            ? new Intl.DateTimeFormat("es-CL", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(i))
            : "-";
      return (i, u) => {
        const s = Z,
          l = O;
        return (
          o(),
          d("section", K, [
            r("div", Q, [
              e.showIcon || e.title || e.description
                ? (o(),
                  d("div", X, [
                    e.showIcon
                      ? (o(), d("div", D, [a(A(M), { size: 24 })]))
                      : c("", !0),
                    e.title ? (o(), d("h1", ee, h(e.title), 1)) : c("", !0),
                    e.description
                      ? (o(), d("p", te, h(e.description), 1))
                      : c("", !0),
                  ]))
                : c("", !0),
              a(l, null, {
                default: x(() => [
                  e.summary
                    ? (o(),
                      d(
                        F,
                        { key: 0 },
                        [
                          r("div", se, [
                            u[0] ||
                              (u[0] = r(
                                "div",
                                { class: "resume--order__subtitle" },
                                [
                                  r(
                                    "h2",
                                    { class: "resume--order__subtitle__title" },
                                    " Comprobante de pago ",
                                  ),
                                ],
                                -1,
                              )),
                            r("div", ae, [
                              r("div", re, [
                                a(
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
                                a(s, {
                                  title: "Estado del pago",
                                  description: "Pagado",
                                }),
                                e.summary.paymentMethod
                                  ? (o(),
                                    b(
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
                                  : c("", !0),
                                e.summary.receiptNumber
                                  ? (o(),
                                    b(
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
                                  : c("", !0),
                                e.summary.createdAt
                                  ? (o(),
                                    b(
                                      s,
                                      {
                                        key: 2,
                                        title: "Fecha de pago",
                                        description: y(e.summary.createdAt),
                                      },
                                      null,
                                      8,
                                      ["description"],
                                    ))
                                  : c("", !0),
                                a(
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
                                a(
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
                                a(
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
                          r("div", oe, [
                            u[1] ||
                              (u[1] = r(
                                "div",
                                { class: "resume--order__subtitle" },
                                [
                                  r(
                                    "h2",
                                    { class: "resume--order__subtitle__title" },
                                    " Información del comprador ",
                                  ),
                                ],
                                -1,
                              )),
                            r("div", ne, [
                              r("div", ie, [
                                a(
                                  s,
                                  {
                                    title: "Nombre",
                                    description: e.summary.fullName || "-",
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ),
                                a(
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
                    : c("", !0),
                ]),
                _: 1,
              }),
            ]),
          ])
        );
      };
    },
  },
  ue = { class: "page" },
  fe = T({
    __name: "gracias",
    async setup(e) {
      let n, y;
      const { $setSEO: i, $setStructuredData: u } = L(),
        s = U(),
        l = V();
      l.public.apiUrl;
      const N = E(),
        w = Y(),
        g = H(!1);
      P(() => {
        N.reset();
      });
      const C = (t) => {
          const _ = {
              INVALID_URL: {
                message: "Orden inválida",
                statusMessage:
                  "No se recibió un ID de orden válido en la URL. Por favor vuelve a la tienda e intenta nuevamente.",
              },
              NOT_FOUND: {
                message: "Orden no encontrada",
                statusMessage:
                  "No pudimos encontrar la información de tu pago en nuestro sistema. Es posible que el pago no se haya completado correctamente. Si tienes dudas, contacta a soporte con tu comprobante Webpay.",
              },
            },
            k = _[t] || _.NOT_FOUND;
          v({ statusCode: 404, ...k });
        },
        {
          data: m,
          pending: de,
          error: p,
        } = (([n, y] = S(async () =>
          q(
            "pagar-gracias",
            async () => {
              const t = s.query.order;
              if (!t) return { error: "INVALID_URL" };
              try {
                return await J(t);
              } catch {
                return { error: "NOT_FOUND" };
              }
            },
            { server: !0, lazy: !1 },
          ),
        )),
        (n = await n),
        y(),
        n),
        f = j(() => (!m.value || "error" in m.value ? null : m.value));
      ($(
        f,
        (t) => {
          t && !g.value && ((g.value = !0), w.purchase(t));
        },
        { immediate: !0 },
      ),
        B(() => {
          if (p.value) {
            v({
              statusCode: p.value.statusCode || 500,
              message: p.value.message || "Error inesperado",
              statusMessage:
                p.value.statusMessage ||
                p.value.message ||
                "Lo sentimos, ha ocurrido un error.",
            });
            return;
          }
          m.value && "error" in m.value && C(m.value.error);
        }));
      const I = (t) => {
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
          title: "Gracias por Publicar",
          description:
            "Tu anuncio ha sido publicado con éxito en Waldo.click®. Gracias por confiar en nosotros para conectar con compradores de activos industriales.",
          imageUrl: `${l.public.baseUrl}/share.jpg`,
          url: `${l.public.baseUrl}/pagar/gracias`,
        }),
        z({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        u({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Gracias por Publicar - Waldo.click®",
          url: `${l.public.baseUrl}/pagar/gracias`,
          description:
            "Tu anuncio ha sido publicado con éxito en Waldo.click®. Gracias por confiar en nosotros para conectar con compradores de activos industriales.",
        }),
        (t, _) => (
          o(),
          d("div", ue, [
            a(R, { "show-search": !0 }),
            a(W),
            f.value
              ? (o(),
                b(
                  ce,
                  {
                    key: 0,
                    title: "¡Pago recibido!",
                    description:
                      "Tu pago Webpay fue procesado correctamente. Más abajo verás el comprobante de tu pago. Guarda esta información.",
                    "show-icon": !0,
                    summary: I(f.value),
                  },
                  null,
                  8,
                  ["summary"],
                ))
              : c("", !0),
            a(G),
          ])
        )
      );
    },
  });
export { fe as default };
//# sourceMappingURL=CwNf6g6l.js.map

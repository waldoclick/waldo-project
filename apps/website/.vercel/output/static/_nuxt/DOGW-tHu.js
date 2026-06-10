import {
  aZ as _,
  b2 as v,
  b3 as w,
  cF as A,
  bm as D,
  bw as I,
  b4 as N,
  be as T,
  cr as C,
  a_ as f,
  a$ as L,
  b0 as u,
  cs as k,
  ct as E,
  b6 as p,
  b5 as F,
  b7 as U,
  cu as M,
  b9 as O,
  ba as R,
  cv as i,
  b8 as x,
} from "./BK8sApmn.js";
import { u as S } from "./CJzzMwWR.js";
import { _ as V } from "./CvQWLcgi.js";
import "./C7SjWCbw.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
import "./De8hi3Om.js";
import "./B5cviOR7.js";
try {
  let r =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    t = new r.Error().stack;
  t &&
    ((r._sentryDebugIds = r._sentryDebugIds || {}),
    (r._sentryDebugIds[t] = "135cedf1-4e88-486f-908b-a30a845be53e"),
    (r._sentryDebugIdIdentifier =
      "sentry-dbid-135cedf1-4e88-486f-908b-a30a845be53e"));
} catch {}
const B = { class: "page" },
  J = _({
    __name: "gracias",
    async setup(r) {
      let t, c;
      const d = v(),
        y = w(),
        h = A();
      (D(() => {
        h.reset();
      }),
        I({ meta: [{ name: "robots", content: "noindex, nofollow" }] }));
      const { data: a, error: s } =
          (([t, c] = N(async () =>
            R(
              "anunciar-gracias",
              async () => {
                const e = d.query.ad;
                if (!e) return { error: "INVALID_URL" };
                try {
                  const m = (await y(`ads/thankyou/${e}`, { method: "GET" }))
                    .data;
                  return m || { error: "NOT_FOUND" };
                } catch {
                  return { error: "NOT_FOUND" };
                }
              },
              { server: !0, lazy: !1, default: () => null },
            ),
          )),
          (t = await t),
          c(),
          t),
        o = O(() => (!a.value || "error" in a.value ? null : a.value)),
        b = S(),
        l = x(!1);
      (T(
        o,
        (e) => {
          if (e && !l.value) {
            l.value = !0;
            const n = {
              documentId: e.documentId ?? d.query.ad,
              amount: 0,
              currency: e.currency ?? "CLP",
            };
            b.purchase(n);
          }
        },
        { immediate: !0 },
      ),
        C(() => {
          if (s.value) {
            i({
              statusCode: s.value.statusCode || 500,
              message: s.value.message || "Error inesperado",
              statusMessage:
                s.value.statusMessage ||
                s.value.message ||
                "Lo sentimos, ha ocurrido un error.",
            });
            return;
          }
          a.value &&
            "error" in a.value &&
            (a.value.error === "INVALID_URL"
              ? i({
                  statusCode: 404,
                  message: "URL inválida",
                  statusMessage:
                    "No se recibió un ID de anuncio válido en la URL. Por favor vuelve e intenta nuevamente.",
                })
              : i({
                  statusCode: 404,
                  message: "Anuncio no encontrado",
                  statusMessage:
                    "No pudimos encontrar la información de tu anuncio. Si tienes dudas, contacta a soporte.",
                }));
        }));
      const g = (e) => ({
        showEditLinks: !1,
        title: e.name,
        category: e.category?.id ?? e.category,
        price: e.price,
        currency: e.currency,
        description: e.description,
        email: e.email,
        phone: e.phone,
        commune: e.commune?.id ?? e.commune,
        address: e.address,
        addressNumber: e.address_number,
        condition: e.condition?.id ?? e.condition,
        manufacturer: e.manufacturer,
        model: e.model,
        serialNumber: e.serial_number,
        year: e.year,
        weight: e.weight,
        width: e.width,
        height: e.height,
        depth: e.depth,
        gallery: e.gallery,
        hasToPay: !1,
      });
      return (e, n) => (
        f(),
        L("div", B, [
          u(k, { "show-search": !0 }),
          u(E),
          p(o)
            ? (f(),
              F(
                V,
                {
                  key: 0,
                  "show-icon": !0,
                  "hide-payment-section": !0,
                  title: "¡Anuncio creado!",
                  description:
                    "Tu anuncio ha sido enviado para revisión. Te notificaremos por correo cuando esté publicado.",
                  summary: g(p(o)),
                },
                null,
                8,
                ["summary"],
              ))
            : U("", !0),
          u(M),
        ])
      );
    },
  });
export { J as default };
//# sourceMappingURL=DOGW-tHu.js.map

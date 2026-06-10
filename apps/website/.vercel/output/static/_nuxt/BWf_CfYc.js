import {
  aZ as H,
  cx as F,
  b3 as O,
  bz as M,
  bu as W,
  cF as L,
  bb as j,
  bw as q,
  bm as z,
  a_ as f,
  a$ as G,
  b0 as y,
  cs as Q,
  ct as V,
  b6 as d,
  b5 as h,
  b8 as Y,
  aY as Z,
  b9 as v,
  bk as J,
  bt as K,
  cN as X,
} from "./BK8sApmn.js";
import { u as ee } from "./CJzzMwWR.js";
import { u as ae } from "./CAHpseH1.js";
import { u as te } from "./Bwc9GysH.js";
import { _ as re } from "./CvQWLcgi.js";
import { B as ne } from "./C0j-iZe8.js";
import { u as oe } from "./CsS7OJ1I.js";
import "./C7SjWCbw.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
import "./De8hi3Om.js";
import "./B5cviOR7.js";
import "./DrPuZ622.js";
try {
  let s =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    r = new s.Error().stack;
  r &&
    ((s._sentryDebugIds = s._sentryDebugIds || {}),
    (s._sentryDebugIds[r] = "0f9f10d7-1091-40db-9f70-aa93419d6397"),
    (s._sentryDebugIdIdentifier =
      "sentry-dbid-0f9f10d7-1091-40db-9f70-aa93419d6397"));
} catch {}
const se = { class: "page" },
  we = H({
    __name: "resumen",
    setup(s) {
      const { Swal: r } = J(),
        w = F(),
        u = O(),
        { fetchUser: A } = M(),
        { uploadFiles: _, transformUrl: x } = K(),
        { getPendingFiles: P, clearAll: k } = te(),
        i = Y(!1),
        { $setSEO: C, $setStructuredData: S } = W(),
        l = Z(),
        e = L(),
        b = ee(),
        c = j(),
        {
          packPart: T,
          hasToPay: m,
          totalAmount: B,
          paymentSummaryText: g,
        } = ae(),
        I = () => ({
          showEditLinks: !0,
          pack: e.pack,
          featured: e.featured,
          isInvoice: e.is_invoice,
          paymentSummary: g.value,
          paymentMethod: T.value?.label || null,
          totalAmount: B.value,
          hasToPay: m.value,
          title: e.ad.name,
          category: e.ad.category,
          price: e.ad.price,
          currency: e.ad.currency,
          description: e.ad.description,
          email: e.ad.email,
          phone: e.ad.phone,
          commune: e.ad.commune,
          address: e.ad.address,
          addressNumber: e.ad.address_number,
          condition: e.ad.condition,
          manufacturer: e.ad.manufacturer,
          model: e.ad.model,
          serialNumber: e.ad.serial_number,
          year: e.ad.year,
          weight: e.ad.weight,
          width: e.ad.width,
          height: e.ad.height,
          depth: e.ad.depth,
          gallery: e.ad.gallery,
        }),
        N = v(() =>
          i.value
            ? "Creando…"
            : m.value
              ? "Continuar al pago"
              : "Crear anuncio",
        ),
        p = v(() => ({
          title: "¿Quieres crear el anuncio?",
          text: "Una vez creado el anuncio, no podrás modificarlo.",
          confirm: "Sí, crear el anuncio",
        }));
      (C({
        title: "Resumen del Anuncio",
        description:
          "Consulta los detalles de tu anuncio antes de publicarlo en Waldo.click®. Asegúrate de que todo esté perfecto para destacar en el mercado de activos industriales.",
        imageUrl: `${l.public.baseUrl}/share.jpg`,
        url: `${l.public.baseUrl}/resumen-anuncio`,
      }),
        q({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        S({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Resumen del Anuncio - Waldo.click®",
          url: `${l.public.baseUrl}/resumen-anuncio`,
          description:
            "Consulta los detalles de tu anuncio antes de publicarlo en Waldo.click®. Asegúrate de que todo esté perfecto para destacar en el mercado de activos industriales.",
        }),
        z(async () => {
          const { loadPacks: a } = oe();
          (await a(), b.beginCheckout());
        }));
      const U = async () => {
          const a = P();
          if (a.length === 0) return !0;
          try {
            const t = a.map(({ file: o }) => o),
              R = (await _(t, "gallery")).map((o) => ({
                id: String(o.id),
                url: x(o.formats?.thumbnail?.url || o.url),
                formats: o.formats,
              })),
              D = e.ad.gallery.filter((o) => !o.pending);
            return (e.updateGallery([...D, ...R]), k(), !0);
          } catch {
            return (
              r.fire({
                title: "Error al subir imágenes",
                text: "No pudimos subir una o más imágenes. Por favor, inténtalo de nuevo.",
                icon: "error",
                confirmButtonText: "Aceptar",
              }),
              !1
            );
          }
        },
        $ = async () => {
          (w.info("Publicando tu anuncio..."), (i.value = !0));
          try {
            if (!(await U())) return;
            if (m.value) {
              try {
                const n = await u("ads/save-draft", {
                  method: "POST",
                  body: { data: { ad: e.ad } },
                });
                (e.updateAdId(n.data.id), c.push("/pagar"));
              } catch {
                r.fire({
                  title: "Error",
                  text: "Hubo un problema al guardar el anuncio. Por favor, inténtalo de nuevo.",
                  icon: "error",
                  confirmButtonText: "Aceptar",
                });
              }
              return;
            }
            if (
              (
                await r.fire({
                  title: p.value.title,
                  text: p.value.text,
                  icon: "warning",
                  showCancelButton: !0,
                  confirmButtonText: p.value.confirm,
                  cancelButtonText: "Cancelar",
                })
              ).isConfirmed
            )
              try {
                const n = await u("ads/save-draft", {
                  method: "POST",
                  body: { data: { ad: e.ad } },
                });
                (e.updateAdId(n.data.id), await E());
              } catch {
                r.fire({
                  title: "Error",
                  text: "Hubo un problema al guardar el anuncio. Por favor, inténtalo de nuevo.",
                  icon: "error",
                  confirmButtonText: "Aceptar",
                });
              }
          } finally {
            i.value = !1;
          }
        },
        E = async () => {
          try {
            b.addPaymentInfo();
            const a = await u("payments/free-ad", {
              method: "POST",
              body: { data: { ad_id: e.ad.ad_id, pack: e.pack } },
            });
            await A();
            const t = a.data?.ad?.documentId;
            c.push("/anunciar/gracias?ad=" + (t || e.ad.ad_id));
          } catch (a) {
            let t =
              "Hubo un problema al procesar tu anuncio. Por favor, inténtalo de nuevo.";
            const n = a.response?.data?.message || a.message;
            (n === "No free reservation available"
              ? (t = "No tienes créditos gratuitos disponibles")
              : n === "No paid reservation available" &&
                (t = "No tienes reservas pagadas disponibles"),
              r.fire({
                title: "Error",
                text: t,
                icon: "error",
                confirmButtonText: "Aceptar",
              }));
          }
        };
      return (a, t) => (
        f(),
        G("div", se, [
          y(Q, { "show-search": !0 }),
          y(V),
          !d(e).ad || Object.keys(d(e).ad).length === 0
            ? (f(), h(X, { key: 0 }))
            : (f(),
              h(
                re,
                {
                  key: 1,
                  "show-icon": !1,
                  title: "Revisa y confirma tu publicación",
                  summary: I(),
                },
                null,
                8,
                ["summary"],
              )),
          y(
            ne,
            {
              percentage: 100,
              "show-steps": !1,
              "summary-text": d(g),
              "primary-label": N.value,
              "primary-disabled": i.value,
              "primary-loading": i.value,
              onPrimary: $,
              onBack:
                t[0] ||
                (t[0] = (n) => d(c).push("/anunciar/galeria-de-imagenes")),
            },
            null,
            8,
            [
              "summary-text",
              "primary-label",
              "primary-disabled",
              "primary-loading",
            ],
          ),
        ])
      );
    },
  });
export { we as default };
//# sourceMappingURL=BWf_CfYc.js.map

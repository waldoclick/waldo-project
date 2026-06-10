import {
  a_ as o,
  b5 as l,
  b1 as p,
  b0 as n,
  b6 as u,
  c1 as U,
  bs as A,
  br as q,
  b7 as r,
  cL as G,
  bv as V,
  be as z,
  a$ as c,
  bf as i,
  cq as R,
  bi as m,
  bn as E,
  bo as j,
  cM as O,
  bF as H,
  b8 as w,
  bt as J,
} from "./BK8sApmn.js";
import { _ as K } from "./C7SjWCbw.js";
import { u as Q } from "./De8hi3Om.js";
import { u as W } from "./B5cviOR7.js";
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
    f = new e.Error().stack;
  f &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[f] = "a7313a18-ec08-47ba-9cfc-5608f8f4b803"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-a7313a18-ec08-47ba-9cfc-5608f8f4b803"));
} catch {}
const X = {
    __name: "ButtonEdit",
    props: {
      showEditLinks: { type: Boolean, required: !0 },
      to: { type: String, required: !0 },
      title: { type: String, required: !0 },
    },
    setup(e) {
      return (f, b) => {
        const k = q;
        return e.showEditLinks
          ? (o(),
            l(
              k,
              { key: 0, to: e.to, class: "btn btn--edit", title: e.title },
              {
                default: p(() => [
                  n(u(U), { size: 16, class: "icon-edit" }),
                  b[0] || (b[0] = A(" Editar ", -1)),
                ]),
                _: 1,
              },
              8,
              ["to", "title"],
            ))
          : r("", !0);
      };
    },
  },
  g = G("/images/icon-edit.svg"),
  Y = { class: "resume resume--default" },
  Z = { class: "resume--default__container" },
  ee = { key: 0, class: "resume--default__header" },
  te = { key: 0, class: "resume--default__header__icon" },
  ie = { key: 1, class: "resume--default__header__title title" },
  ne = { key: 2, class: "resume--default__header__description paragraph" },
  se = { key: 0, class: "resume--default__box" },
  oe = { class: "resume--default__subtitle" },
  ae = { class: "resume--default__details" },
  re = { class: "resume--default__grid" },
  ce = { class: "resume--default__box" },
  de = { class: "resume--default__subtitle" },
  le = { class: "resume--default__subtitle__title" },
  ue = { class: "resume--default__details" },
  me = { class: "resume--default__grid" },
  fe = { class: "resume--default__box" },
  he = { class: "resume--default__subtitle" },
  _e = { class: "resume--default__subtitle__title" },
  ye = { class: "resume--default__details" },
  ge = { class: "resume--default__grid" },
  be = { class: "resume--default__box" },
  ke = { class: "resume--default__subtitle" },
  ve = { class: "resume--default__subtitle__title" },
  we = { class: "resume--default__details" },
  Ce = { class: "resume--default__grid" },
  Ee = { key: 1, class: "resume--default__box" },
  pe = { class: "resume--default__subtitle" },
  Ie = { class: "resume--default__subtitle__title" },
  Ne = { class: "resume--default__photos" },
  Pe = {
    __name: "ResumeDefault",
    props: {
      showIcon: { type: Boolean, default: !0 },
      title: { type: String, default: "" },
      description: { type: String, default: "" },
      summary: { type: Object, default: () => null },
      hidePaymentSection: { type: Boolean, default: !1 },
    },
    setup(e) {
      const { transformUrl: f } = J(),
        b = e,
        k = Q(),
        I = V(),
        N = W(),
        h = w(""),
        _ = w(""),
        y = w(""),
        D = (t) =>
          t
            ? t === "free"
              ? "Usar uno de mis anuncios gratuitos"
              : t === "paid"
                ? "Usar uno de mis anuncios de pago"
                : "Comprando un pack de anuncios"
            : "No especificado",
        L = (t) =>
          t
            ? t.paymentMethod
              ? t.paymentMethod
              : D(t.pack)
            : "No especificado",
        x = (t) =>
          t == null
            ? "No especificado"
            : t === "free"
              ? "Usar uno de mis destacados gratuitos"
              : t === !1
                ? "Anuncio sin destacar"
                : t === !0
                  ? "Destacar mi anuncio por $10.000"
                  : "No especificado",
        C = (t, a = "CLP") =>
          !t && t !== 0
            ? "No especificado"
            : new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: a,
              }).format(t || 0),
        S = (t) =>
          t
            ? !t.hasToPay || !t.totalAmount
              ? "Sin pago"
              : C(t.totalAmount, "CLP")
            : "No especificado",
        P = (t, a) => (!t && !a ? "No especificada" : `${t}, ${a}`.trim()),
        B = (t) =>
          !t.width && !t.height && !t.depth
            ? "No especificadas"
            : `${t.width} x ${t.height} x ${t.depth} (m)`,
        $ = (t) => (t ? f(t) : "");
      return (
        z(
          () => b.summary,
          async (t) => {
            if (t)
              try {
                if (t.category) {
                  h.value = "Cargando categoría...";
                  const a = await k.getCategoryById(t.category);
                  h.value = a?.name || "Categoría no encontrada";
                }
                if (t.commune) {
                  _.value = "Cargando ubicación...";
                  const a = await I.getCommuneById(t.commune),
                    d = a?.region;
                  _.value = d
                    ? `${a.name}, ${d.name}`
                    : a?.name || "Ubicación no encontrada";
                }
                if (t.condition) {
                  y.value = "Cargando condición...";
                  const a = await N.getConditionById(t.condition);
                  y.value = a?.name || "Condición no encontrada";
                }
              } catch {
                (h.value === "Cargando categoría..." &&
                  (h.value = "Error al cargar categoría"),
                  _.value === "Cargando ubicación..." &&
                    (_.value = "Error al cargar ubicación"),
                  y.value === "Cargando condición..." &&
                    (y.value = "Error al cargar condición"));
              }
          },
          { immediate: !0 },
        ),
        (t, a) => {
          const d = X,
            s = K,
            F = O,
            T = H;
          return (
            o(),
            c("section", Y, [
              i("div", Z, [
                e.showIcon || e.title || e.description
                  ? (o(),
                    c("div", ee, [
                      e.showIcon
                        ? (o(), c("div", te, [n(u(R), { size: 24 })]))
                        : r("", !0),
                      e.title ? (o(), c("h1", ie, m(e.title), 1)) : r("", !0),
                      e.description
                        ? (o(), c("p", ne, m(e.description), 1))
                        : r("", !0),
                    ]))
                  : r("", !0),
                n(T, null, {
                  default: p(() => [
                    e.summary
                      ? (o(),
                        c(
                          E,
                          { key: 0 },
                          [
                            e.hidePaymentSection
                              ? r("", !0)
                              : (o(),
                                c("div", se, [
                                  i("div", oe, [
                                    a[0] ||
                                      (a[0] = i(
                                        "h2",
                                        {
                                          class:
                                            "resume--default__subtitle__title",
                                        },
                                        " 1. Método de pago ",
                                        -1,
                                      )),
                                    e.summary.showEditLinks
                                      ? (o(),
                                        l(
                                          d,
                                          {
                                            key: 0,
                                            "show-edit-links":
                                              e.summary.showEditLinks,
                                            to: "/anunciar",
                                            title: "Editar Información general",
                                            "icon-edit": u(g),
                                          },
                                          null,
                                          8,
                                          ["show-edit-links", "icon-edit"],
                                        ))
                                      : r("", !0),
                                  ]),
                                  i("div", ae, [
                                    i("div", re, [
                                      n(
                                        s,
                                        {
                                          title: "Tipo de anuncio",
                                          description: L(e.summary),
                                        },
                                        null,
                                        8,
                                        ["description"],
                                      ),
                                      n(
                                        s,
                                        {
                                          title: "Destacado",
                                          description: x(e.summary.featured),
                                        },
                                        null,
                                        8,
                                        ["description"],
                                      ),
                                      n(
                                        s,
                                        {
                                          title: "Factura",
                                          description: e.summary.isInvoice
                                            ? "Sí"
                                            : "No",
                                        },
                                        null,
                                        8,
                                        ["description"],
                                      ),
                                      e.summary.hasToPay
                                        ? (o(),
                                          l(
                                            s,
                                            {
                                              key: 0,
                                              title: "Total",
                                              description: S(e.summary),
                                            },
                                            null,
                                            8,
                                            ["description"],
                                          ))
                                        : r("", !0),
                                    ]),
                                  ]),
                                ])),
                            i("div", ce, [
                              i("div", de, [
                                i(
                                  "h2",
                                  le,
                                  m(e.hidePaymentSection ? "1" : "2") +
                                    ". General ",
                                  1,
                                ),
                                e.summary.showEditLinks
                                  ? (o(),
                                    l(
                                      d,
                                      {
                                        key: 0,
                                        "show-edit-links":
                                          e.summary.showEditLinks,
                                        to: "/anunciar/datos-del-producto",
                                        title: "Editar General",
                                        "icon-edit": u(g),
                                      },
                                      null,
                                      8,
                                      ["show-edit-links", "icon-edit"],
                                    ))
                                  : r("", !0),
                              ]),
                              i("div", ue, [
                                i("div", me, [
                                  n(
                                    s,
                                    {
                                      title: "Título",
                                      description: e.summary.title,
                                    },
                                    null,
                                    8,
                                    ["description"],
                                  ),
                                  n(
                                    s,
                                    {
                                      title: "Categoría",
                                      description: h.value,
                                    },
                                    null,
                                    8,
                                    ["description"],
                                  ),
                                  n(
                                    s,
                                    {
                                      title: "Precio",
                                      description: C(
                                        e.summary.price,
                                        e.summary.currency,
                                      ),
                                    },
                                    null,
                                    8,
                                    ["description"],
                                  ),
                                  n(
                                    s,
                                    {
                                      class: "resume--default__grid__full",
                                      title: "Descripción",
                                      description: e.summary.description,
                                    },
                                    null,
                                    8,
                                    ["description"],
                                  ),
                                ]),
                              ]),
                            ]),
                            i("div", fe, [
                              i("div", he, [
                                i(
                                  "h2",
                                  _e,
                                  m(e.hidePaymentSection ? "2" : "3") +
                                    ". Información personal ",
                                  1,
                                ),
                                e.summary.showEditLinks
                                  ? (o(),
                                    l(
                                      d,
                                      {
                                        key: 0,
                                        "show-edit-links":
                                          e.summary.showEditLinks,
                                        to: "/anunciar/datos-personales",
                                        title: "Editar Información personal",
                                        "icon-edit": u(g),
                                      },
                                      null,
                                      8,
                                      ["show-edit-links", "icon-edit"],
                                    ))
                                  : r("", !0),
                              ]),
                              i("div", ye, [
                                i("div", ge, [
                                  n(
                                    s,
                                    {
                                      title: "Correo eléctronico",
                                      description: e.summary.email,
                                    },
                                    null,
                                    8,
                                    ["description"],
                                  ),
                                  n(
                                    s,
                                    {
                                      title: "Teléfono",
                                      description: e.summary.phone,
                                    },
                                    null,
                                    8,
                                    ["description"],
                                  ),
                                  n(
                                    s,
                                    {
                                      title: "Ubicación",
                                      description: _.value,
                                    },
                                    null,
                                    8,
                                    ["description"],
                                  ),
                                  n(
                                    s,
                                    {
                                      title: "Dirección",
                                      description: P(
                                        e.summary.address,
                                        e.summary.addressNumber,
                                      ),
                                    },
                                    null,
                                    8,
                                    ["description"],
                                  ),
                                ]),
                              ]),
                            ]),
                            i("div", be, [
                              i("div", ke, [
                                i(
                                  "h2",
                                  ve,
                                  m(e.hidePaymentSection ? "3" : "4") +
                                    ". Ficha del producto ",
                                  1,
                                ),
                                e.summary.showEditLinks
                                  ? (o(),
                                    l(
                                      d,
                                      {
                                        key: 0,
                                        "show-edit-links":
                                          e.summary.showEditLinks,
                                        to: "/anunciar/ficha-de-producto",
                                        title: "Editar Ficha del producto",
                                        "icon-edit": u(g),
                                      },
                                      null,
                                      8,
                                      ["show-edit-links", "icon-edit"],
                                    ))
                                  : r("", !0),
                              ]),
                              i("div", we, [
                                i("div", Ce, [
                                  n(
                                    s,
                                    {
                                      title: "Condición",
                                      description: y.value,
                                    },
                                    null,
                                    8,
                                    ["description"],
                                  ),
                                  n(
                                    s,
                                    {
                                      title: "Fabricante",
                                      description: e.summary.manufacturer,
                                    },
                                    null,
                                    8,
                                    ["description"],
                                  ),
                                  n(
                                    s,
                                    {
                                      title: "Modelo",
                                      description: e.summary.model,
                                    },
                                    null,
                                    8,
                                    ["description"],
                                  ),
                                  n(
                                    s,
                                    {
                                      title: "Número de serie",
                                      description: e.summary.serialNumber,
                                    },
                                    null,
                                    8,
                                    ["description"],
                                  ),
                                  n(
                                    s,
                                    {
                                      title: "Año",
                                      description: e.summary.year,
                                    },
                                    null,
                                    8,
                                    ["description"],
                                  ),
                                  n(
                                    s,
                                    {
                                      title: "Peso",
                                      description: `${e.summary.weight} (kg)`,
                                    },
                                    null,
                                    8,
                                    ["description"],
                                  ),
                                  n(
                                    s,
                                    {
                                      title: "Medidas",
                                      description: B(e.summary),
                                    },
                                    null,
                                    8,
                                    ["description"],
                                  ),
                                ]),
                              ]),
                            ]),
                            e.summary.gallery?.length
                              ? (o(),
                                c("div", Ee, [
                                  i("div", pe, [
                                    i(
                                      "h2",
                                      Ie,
                                      m(e.hidePaymentSection ? "4" : "5") +
                                        ". Galería de imágenes ",
                                      1,
                                    ),
                                    e.summary.showEditLinks
                                      ? (o(),
                                        l(
                                          d,
                                          {
                                            key: 0,
                                            "show-edit-links":
                                              e.summary.showEditLinks,
                                            to: "/anunciar/galeria-de-imagenes",
                                            title: "Editar Galería de imágenes",
                                            "icon-edit": u(g),
                                          },
                                          null,
                                          8,
                                          ["show-edit-links", "icon-edit"],
                                        ))
                                      : r("", !0),
                                  ]),
                                  i("div", Ne, [
                                    (o(!0),
                                    c(
                                      E,
                                      null,
                                      j(
                                        e.summary.gallery,
                                        (v, M) => (
                                          o(),
                                          l(
                                            F,
                                            {
                                              key: M,
                                              src: $(v.url),
                                              alt: v.url,
                                              title: v.url,
                                              loading: "lazy",
                                              class:
                                                "resume--default__subtitle__img",
                                              remote: "",
                                            },
                                            null,
                                            8,
                                            ["src", "alt", "title"],
                                          )
                                        ),
                                      ),
                                      128,
                                    )),
                                  ]),
                                ]))
                              : r("", !0),
                          ],
                          64,
                        ))
                      : r("", !0),
                  ]),
                  _: 1,
                }),
              ]),
            ])
          );
        }
      );
    },
  };
export { Pe as _ };
//# sourceMappingURL=CvQWLcgi.js.map

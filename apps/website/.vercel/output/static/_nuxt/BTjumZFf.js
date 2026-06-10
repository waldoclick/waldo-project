import { _ as q } from "./BQLSJJto.js";
import {
  bD as F,
  aZ as x,
  bb as N,
  b3 as P,
  bx as j,
  bc as A,
  bd as f,
  db as M,
  bm as U,
  b8 as h,
  a_ as u,
  a$ as g,
  bO as O,
  b6 as n,
  bf as a,
  b0 as t,
  bg as b,
  bh as _,
  b1 as z,
  cI as H,
  cJ as W,
  bi as B,
  b7 as C,
  bk as L,
  b9 as R,
  cO as J,
  bs as y,
  bu as Y,
  b5 as Z,
  aY as G,
} from "./BK8sApmn.js";
import { M as K } from "./DlM_smgl.js";
import { F as Q, L as X } from "./DJPzpk2M.js";
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
    c = new r.Error().stack;
  c &&
    ((r._sentryDebugIds = r._sentryDebugIds || {}),
    (r._sentryDebugIds[c] = "3d820529-5978-437a-9948-f0c2b689e384"),
    (r._sentryDebugIdIdentifier =
      "sentry-dbid-3d820529-5978-437a-9948-f0c2b689e384"));
} catch {}
const ee = F("instagram", [
    [
      "rect",
      {
        width: "20",
        height: "20",
        x: "2",
        y: "2",
        rx: "5",
        ry: "5",
        key: "2e1cvw",
      },
    ],
    [
      "path",
      { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z", key: "9exkf1" },
    ],
    ["line", { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5", key: "r4j83e" }],
  ]),
  ae = { class: "form-group" },
  se = { class: "form-group" },
  oe = { class: "form-group" },
  te = { class: "form-group" },
  ne = { class: "form-group contact-textarea" },
  re = { class: "form-msg" },
  le = { class: "form__send" },
  ie = ["disabled"],
  ce = { key: 0 },
  de = { key: 1 },
  me = x({
    __name: "FormContact",
    props: { maxChars: {} },
    setup(r) {
      const { Swal: c } = L(),
        s = N(),
        p = P(),
        d = j(),
        w = A({
          email: f()
            .email("Correo electrónico no válido")
            .required("Correo electrónico es requerido"),
          name: f()
            .max(30, "Nombre no puede exceder 30 caracteres")
            .required("Nombre es requerido"),
          company: f().max(50, "Empresa no puede exceder 50 caracteres"),
          phone: f()
            .max(20, "Teléfono no puede exceder 20 caracteres")
            .matches(
              /^\+?[\d\s-()]+$/,
              "El teléfono solo puede contener números, espacios, guiones, paréntesis y el signo +",
            ),
          message: f().required("Mensaje es requerido"),
        }),
        { handleSubmit: E, resetForm: Te } = M({ validationSchema: w }),
        o = h({ email: "", name: "", company: "", phone: "", message: "" });
      U(() => {
        d.value &&
          ((o.value.email = d.value.email || ""),
          (o.value.name =
            `${d.value.firstname || ""} ${d.value.lastname || ""}`.trim()),
          (o.value.company = d.value.business_name || ""),
          (o.value.phone = d.value.phone || ""));
      });
      const k = r.maxChars || 300,
        S = R(() => k - o.value.message.length),
        V = h(null),
        D = h(80),
        T = (i) => {
          const e = i.target;
          if (!e || !e.style) return;
          e.style.setProperty("height", "80px");
          const v = Math.max(80, e.scrollHeight);
          (e.style.setProperty("height", v + "px"),
            (D.value = v),
            o.value.message.length > k &&
              (o.value.message = o.value.message.slice(0, k)));
        },
        I = async (i) => {
          try {
            (await p("/contacts", {
              method: "POST",
              body: {
                data: {
                  fullname: i.name,
                  email: i.email,
                  company: i.company,
                  phone: i.phone,
                  message: i.message,
                },
              },
            }),
              (m.value = !1),
              J().setContactFormSent(),
              s.push("/contacto/gracias"));
          } catch {
            ((m.value = !1),
              c.fire(
                "Error",
                "Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.",
                "error",
              ));
          }
        },
        $ = E(async (i) => {
          m.value = !0;
          try {
            await I(i);
          } catch {
            ((m.value = !1),
              c.fire(
                "Error",
                "Hubo un problema al enviar el formulario. Por favor, inténtalo de nuevo.",
                "error",
              ));
          }
        }),
        m = h(!1);
      return (i, e) => {
        const v = q;
        return (
          u(),
          g(
            "form",
            {
              onSubmit:
                e[4] || (e[4] = O((...l) => n($) && n($)(...l), ["prevent"])),
            },
            [
              a("div", ae, [
                e[5] ||
                  (e[5] = a(
                    "label",
                    { class: "form-label", for: "email" },
                    "Correo electrónico",
                    -1,
                  )),
                t(
                  n(b),
                  {
                    modelValue: o.value.email,
                    "onUpdate:modelValue":
                      e[0] || (e[0] = (l) => (o.value.email = l)),
                    name: "email",
                    as: "input",
                    type: "email",
                    placeholder: "Ej: contacto@Waldo.click",
                    class: "form-control",
                  },
                  null,
                  8,
                  ["modelValue"],
                ),
                t(n(_), { name: "email" }),
              ]),
              a("div", se, [
                e[6] ||
                  (e[6] = a(
                    "label",
                    { class: "form-label", for: "name" },
                    "Nombre",
                    -1,
                  )),
                t(
                  n(b),
                  {
                    modelValue: o.value.name,
                    "onUpdate:modelValue":
                      e[1] || (e[1] = (l) => (o.value.name = l)),
                    name: "name",
                    as: "input",
                    type: "text",
                    placeholder: "Nombre completo",
                    class: "form-control",
                    maxlength: "30",
                  },
                  null,
                  8,
                  ["modelValue"],
                ),
                t(n(_), { name: "name" }),
              ]),
              a("div", oe, [
                e[7] ||
                  (e[7] = a(
                    "label",
                    { class: "form-label", for: "company" },
                    "Empresa (opcional)",
                    -1,
                  )),
                t(
                  n(b),
                  {
                    modelValue: o.value.company,
                    "onUpdate:modelValue":
                      e[2] || (e[2] = (l) => (o.value.company = l)),
                    name: "company",
                    as: "input",
                    type: "text",
                    placeholder: "Nombre de la empresa",
                    class: "form-control",
                    maxlength: "50",
                  },
                  null,
                  8,
                  ["modelValue"],
                ),
                t(n(_), { name: "company" }),
              ]),
              a("div", te, [
                e[8] ||
                  (e[8] = a(
                    "label",
                    { class: "form-label", for: "phone" },
                    "Teléfono (opcional)",
                    -1,
                  )),
                t(
                  n(b),
                  { name: "phone" },
                  {
                    default: z(({ field: l }) => [t(v, H(W(l)), null, 16)]),
                    _: 1,
                  },
                ),
                t(n(_), { name: "phone" }),
              ]),
              a("div", ne, [
                e[9] ||
                  (e[9] = a(
                    "label",
                    { class: "form-label", for: "message" },
                    "Mensaje",
                    -1,
                  )),
                t(
                  n(b),
                  {
                    ref_key: "messageTextarea",
                    ref: V,
                    modelValue: o.value.message,
                    "onUpdate:modelValue":
                      e[3] || (e[3] = (l) => (o.value.message = l)),
                    name: "message",
                    as: "textarea",
                    class: "form-control",
                    placeholder: "Escribe tu mensaje",
                    onInput: T,
                  },
                  null,
                  8,
                  ["modelValue"],
                ),
                t(n(_), { name: "message" }),
                a("p", re, B(S.value) + " caracteres", 1),
              ]),
              a("div", le, [
                a(
                  "button",
                  {
                    disabled:
                      !o.value.email && !o.value.name && !o.value.message,
                    title: "Enviar",
                    type: "submit",
                    class: "btn btn--primary",
                  },
                  [
                    m.value ? C("", !0) : (u(), g("span", ce, "Enviar")),
                    m.value ? (u(), g("span", de, "Enviando…")) : C("", !0),
                  ],
                  8,
                  ie,
                ),
              ]),
            ],
            32,
          )
        );
      };
    },
  }),
  ue = Object.assign(me, { __name: "FormContact" }),
  pe = { class: "address address--default" },
  fe = { class: "address--default__wrapper" },
  be = { class: "address--default__email" },
  _e = { href: "mailto:contacto@waldo.click", class: "email" },
  ge = { class: "address--default__rrss" },
  ve = { class: "address--default__rrss__links" },
  he = {
    target: "_blank",
    rel: "noopener noreferrer",
    href: "https://www.facebook.com/profile.php?id=100070086861335",
  },
  ye = {
    target: "_blank",
    rel: "noopener noreferrer",
    href: "https://www.instagram.com/waldo.click",
  },
  xe = {
    target: "_blank",
    rel: "noopener noreferrer",
    href: "https://www.linkedin.com/company/waldoclick",
  },
  ke = x({
    __name: "AddressDefault",
    setup(r) {
      return (c, s) => (
        u(),
        g("div", pe, [
          a("div", fe, [
            a("div", be, [
              s[1] ||
                (s[1] = a(
                  "label",
                  { class: "address--default__label" },
                  "Correo eléctronico",
                  -1,
                )),
              a("a", _e, [
                t(n(K), { size: 16, class: "icon-mail" }),
                s[0] || (s[0] = y(" contacto@waldo.click ", -1)),
              ]),
            ]),
            a("div", ge, [
              s[5] ||
                (s[5] = a(
                  "label",
                  { class: "address--default__label" },
                  "Redes sociales",
                  -1,
                )),
              a("span", ve, [
                a("a", he, [
                  t(n(Q), { size: 16, class: "icon-facebook" }),
                  s[2] || (s[2] = y(" Facebook ", -1)),
                ]),
                a("a", ye, [
                  t(n(ee), { size: 16, class: "icon-instagram" }),
                  s[3] || (s[3] = y(" Instagram ", -1)),
                ]),
                a("a", xe, [
                  t(n(X), { size: 16, class: "icon-linkedin" }),
                  s[4] || (s[4] = y(" LinkedIn ", -1)),
                ]),
              ]),
            ]),
          ]),
        ])
      );
    },
  }),
  we = Object.assign(ke, { __name: "AddressDefault" }),
  $e = { class: "contact contact--default" },
  Ce = { class: "contact--default__container" },
  Ee = { class: "contact--default__form" },
  Se = { class: "contact--default__address" },
  Ve = x({
    __name: "ContactDefault",
    setup(r) {
      return (c, s) => (
        u(),
        g("section", $e, [
          a("div", Ce, [
            s[0] ||
              (s[0] = a(
                "div",
                { class: "contact--default__header" },
                [
                  a(
                    "h1",
                    { class: "contact--default__title title" },
                    "Escríbenos tus dudas",
                  ),
                  a(
                    "div",
                    { class: "contact--default__description paragraph" },
                    " ¿Tienes preguntas sobre cómo publicar, comprar o vender equipos industriales en Waldo.click®? Completa el formulario y nuestro equipo te responderá a la brevedad. ",
                  ),
                ],
                -1,
              )),
            a("div", Ee, [t(ue)]),
            a("div", Se, [t(we)]),
          ]),
        ])
      );
    },
  }),
  De = Object.assign(Ve, { __name: "ContactDefault" }),
  je = x({
    __name: "index",
    setup(r) {
      const { $setSEO: c, $setStructuredData: s } = Y(),
        p = G();
      return (
        c({
          title: "Contacto y Soporte",
          description:
            "¿Tienes dudas sobre anuncios de activos industriales o necesitas ayuda? Escríbenos en Waldo.click® y nuestro equipo te responderá pronto.",
          imageUrl: `${p.public.baseUrl}/contact-share.jpg`,
          url: `${p.public.baseUrl}/contacto`,
        }),
        s({
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Waldo.click - Página de Contacto",
          url: `${p.public.baseUrl}/contacto`,
          description:
            "¿Tienes dudas sobre anuncios de activos industriales o necesitas ayuda? Escríbenos en Waldo.click® y nuestro equipo te responderá pronto.",
        }),
        (d, w) => (u(), Z(De))
      );
    },
  });
export { je as default };
//# sourceMappingURL=BTjumZFf.js.map

import {
  bD as y,
  bx as $,
  a_ as _,
  a$ as m,
  bf as o,
  bs as u,
  b0 as t,
  b1 as g,
  b6 as s,
  br as x,
  b7 as N,
  b9 as d,
  aZ as E,
  bu as C,
  bw as D,
  aY as k,
} from "./BK8sApmn.js";
import { _ as w } from "./C7SjWCbw.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
try {
  let a =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    e = new a.Error().stack;
  e &&
    ((a._sentryDebugIds = a._sentryDebugIds || {}),
    (a._sentryDebugIds[e] = "c87d9cac-deb6-4dd2-9324-9c3f6d7e807c"),
    (a._sentryDebugIdIdentifier =
      "sentry-dbid-c87d9cac-deb6-4dd2-9324-9c3f6d7e807c"));
} catch {}
const v = y("square-pen", [
    [
      "path",
      {
        d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
        key: "1m0v6g",
      },
    ],
    [
      "path",
      {
        d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
        key: "ohrbg2",
      },
    ],
  ]),
  I = { class: "account account--profile" },
  P = { class: "account--profile__box" },
  S = { class: "account--profile__heading" },
  T = { class: "account--profile__grid" },
  A = { key: 0, class: "account--profile__box" },
  R = { class: "account--profile__heading" },
  z = { class: "account--profile__grid" },
  U = { class: "account--profile__box" },
  B = { class: "account--profile__grid" },
  V = {
    __name: "AccountProfile",
    setup(a) {
      const e = $(),
        p = d(() =>
          e.value.address
            ? `${e.value.address}${e.value.address_number ? `, ${e.value.address_number}` : ""}`.trim()
            : "",
        ),
        r = d(() =>
          e.value.business_address
            ? `${e.value.business_address}${e.value.business_address_number ? `, ${e.value.business_address_number}` : ""}`.trim()
            : "",
        ),
        f = d(() => {
          if (!e.value.birthdate) return "--";
          const l = new Date(e.value.birthdate);
          if (Number.isNaN(l.getTime())) return "--";
          const n = l.getDate().toString().padStart(2, "0"),
            c = (l.getMonth() + 1).toString().padStart(2, "0"),
            i = l.getFullYear();
          return `${n}/${c}/${i}`;
        }),
        b = d(
          () => e.value.region?.name || e.value.commune?.region?.name || "--",
        ),
        h = d(
          () =>
            e.value.business_region?.name ||
            e.value.business_commune?.region?.name ||
            "--",
        );
      return (l, n) => {
        const c = x,
          i = w;
        return (
          _(),
          m("section", I, [
            n[5] ||
              (n[5] = o(
                "div",
                { class: "account--profile__title title" },
                "Datos personales",
                -1,
              )),
            o("div", P, [
              o("div", S, [
                n[1] || (n[1] = u(" Información personal ", -1)),
                t(
                  c,
                  { to: "/cuenta/perfil/editar", title: "Editar" },
                  {
                    default: g(() => [
                      t(s(v), { size: "16", class: "icon-edit" }),
                      n[0] || (n[0] = u(" Editar ", -1)),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              o("div", T, [
                t(
                  i,
                  { title: "Nombres", description: s(e).firstname || "--" },
                  null,
                  8,
                  ["description"],
                ),
                t(
                  i,
                  { title: "Apellidos", description: s(e).lastname || "--" },
                  null,
                  8,
                  ["description"],
                ),
                t(i, { title: "Rut", description: s(e).rut }, null, 8, [
                  "description",
                ]),
                t(i, { title: "Región", description: b.value }, null, 8, [
                  "description",
                ]),
                t(
                  i,
                  { title: "Comuna", description: s(e).commune?.name || "--" },
                  null,
                  8,
                  ["description"],
                ),
                t(i, { title: "Dirección", description: p.value }, null, 8, [
                  "description",
                ]),
                t(i, { title: "Teléfono", description: s(e).phone }, null, 8, [
                  "description",
                ]),
                t(
                  i,
                  { title: "Correo electrónico", description: s(e).email },
                  null,
                  8,
                  ["description"],
                ),
                t(
                  i,
                  { title: "Código Postal", description: s(e).postal_code },
                  null,
                  8,
                  ["description"],
                ),
                t(
                  i,
                  { title: "Fecha de Nacimiento", description: f.value },
                  null,
                  8,
                  ["description"],
                ),
              ]),
            ]),
            s(e).is_company
              ? (_(),
                m("div", A, [
                  o("div", R, [
                    n[3] || (n[3] = u(" Información de la Empresa ", -1)),
                    t(
                      c,
                      { to: "/cuenta/perfil/editar", title: "Editar" },
                      {
                        default: g(() => [
                          t(s(v), { size: "16", class: "icon-edit" }),
                          n[2] || (n[2] = u(" Editar ", -1)),
                        ]),
                        _: 1,
                      },
                    ),
                  ]),
                  o("div", z, [
                    t(
                      i,
                      {
                        title: "Razón Social",
                        description: s(e).business_name,
                      },
                      null,
                      8,
                      ["description"],
                    ),
                    t(
                      i,
                      { title: "Giro", description: s(e).business_type },
                      null,
                      8,
                      ["description"],
                    ),
                    t(
                      i,
                      { title: "RUT Empresa", description: s(e).business_rut },
                      null,
                      8,
                      ["description"],
                    ),
                    t(i, { title: "Región", description: h.value }, null, 8, [
                      "description",
                    ]),
                    t(
                      i,
                      {
                        title: "Comuna",
                        description: s(e).business_commune?.name || "",
                      },
                      null,
                      8,
                      ["description"],
                    ),
                    t(
                      i,
                      { title: "Dirección Empresa", description: r.value },
                      null,
                      8,
                      ["description"],
                    ),
                    t(
                      i,
                      {
                        title: "Código Postal Empresa",
                        description: s(e).business_postal_code,
                      },
                      null,
                      8,
                      ["description"],
                    ),
                  ]),
                ]))
              : N("", !0),
            o("div", U, [
              n[4] ||
                (n[4] = o(
                  "div",
                  { class: "account--profile__heading" },
                  "Como te ven los compradores",
                  -1,
                )),
              o("div", B, [
                t(
                  i,
                  {
                    title: "Tipo de perfil",
                    description:
                      s(e).pro_status === "active" ? "Pro" : "Estándar",
                  },
                  null,
                  8,
                  ["description"],
                ),
                t(
                  i,
                  {
                    title: "Tipo de usuario",
                    description: s(e).is_company
                      ? "Empresa"
                      : "Persona Natural",
                  },
                  null,
                  8,
                  ["description"],
                ),
              ]),
            ]),
          ])
        );
      };
    },
  },
  G = { class: "page" },
  H = E({
    __name: "index",
    setup(a) {
      const { $setSEO: e, $setStructuredData: p } = C(),
        r = k();
      return (
        e({
          title: "Perfil",
          description:
            "Gestiona tu perfil en Waldo.click®. Actualiza tu información personal y mantén tus datos al día.",
          imageUrl: `${r.public.baseUrl}/share.jpg`,
          url: `${r.public.baseUrl}/cuenta/perfil`,
        }),
        D({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        p({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Perfil",
          url: `${r.public.baseUrl}/cuenta/perfil`,
          description:
            "Gestiona tu perfil en Waldo.click®. Actualiza tu información personal y mantén tus datos al día.",
        }),
        (f, b) => (_(), m("div", G, [t(V)]))
      );
    },
  });
export { H as default };
//# sourceMappingURL=D7yc5Xfy.js.map

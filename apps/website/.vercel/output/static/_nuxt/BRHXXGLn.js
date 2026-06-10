import { _ as ee } from "./vgLiQXkW.js";
import { _ as te } from "./C2l5JNgr.js";
import { _ as ae, a as ne } from "./RoATBwxO.js";
import { _ as q, a as G } from "./BbtmlxJr.js";
import { _ as j } from "./C4RpNa5i.js";
import { _ as M } from "./BSFPidNw.js";
import {
  aZ as B,
  b3 as E,
  bb as O,
  be as H,
  a_ as t,
  a$ as g,
  bf as b,
  b0 as s,
  b1 as c,
  bn as L,
  bo as Z,
  b7 as n,
  b8 as h,
  b9 as C,
  b5 as i,
  bi as F,
  bs as z,
  b6 as m,
  bt as se,
  b2 as re,
  b4 as le,
  ba as oe,
} from "./BK8sApmn.js";
import { f as V, a as ue } from "./CjIigZ6h.js";
import { E as J } from "./DvfQSOKW.js";
import { f as ie } from "./DFEPOiSh.js";
import { b as ce, f as K, c as Q } from "./b4AISZcu.js";
import { u as de } from "./BWjFl-iO.js";
import "./CNKn_OHC.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
try {
  let y =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    l = new y.Error().stack;
  l &&
    ((y._sentryDebugIds = y._sentryDebugIds || {}),
    (y._sentryDebugIds[l] = "78f6a3de-5e02-4363-a9a0-a3c65d14a1c4"),
    (y._sentryDebugIdIdentifier =
      "sentry-dbid-78f6a3de-5e02-4363-a9a0-a3c65d14a1c4"));
} catch {}
const _e = { class: "users users--announcements" },
  pe = { class: "users--announcements__table-wrapper" },
  me = { class: "users--announcements__gallery" },
  ve = ["src", "alt"],
  fe = { key: 1, class: "users--announcements__gallery__placeholder" },
  ge = { class: "users--announcements__name" },
  be = ["onClick"],
  ye = { key: 0, class: "users--announcements__empty" },
  he = { key: 1, class: "users--announcements__loading" },
  W = 10,
  ke = B({
    __name: "UserAnnouncements",
    props: { userId: {} },
    setup(y) {
      const l = y,
        N = E(),
        p = h(1),
        e = h([]),
        f = h(!1),
        v = h(null),
        D = [
          { label: "Galería" },
          { label: "Anuncio" },
          { label: "Fecha" },
          { label: "Acciones", align: "right" },
        ],
        I = C(() => e.value),
        k = C(() => v.value?.pageCount || 1),
        w = C(() => v.value?.total || 0),
        { transformUrl: x } = se(),
        o = (a) => {
          if (!a) return "";
          const d = a.formats?.thumbnail?.url || a.url;
          return d ? x(d) : "";
        },
        R = O(),
        T = (a) => {
          R.push(`/dashboard/ads/${a}`);
        },
        r = (a) => {
          p.value = a;
        },
        _ = () => {
          if (typeof l.userId == "number") return l.userId;
          const a = Number(l.userId);
          return Number.isNaN(a) ? l.userId : a;
        },
        u = async () => {
          const a = _();
          if (!a) {
            ((e.value = []), (v.value = null));
            return;
          }
          try {
            f.value = !0;
            const d = await N("ads", {
              method: "GET",
              params: {
                filters: { user: { id: { $eq: a } } },
                pagination: { page: p.value, pageSize: W },
                sort: "createdAt:desc",
                populate: { gallery: { fields: ["url", "formats"] } },
              },
            });
            ((e.value = Array.isArray(d.data) ? d.data : []),
              (v.value = d.meta?.pagination || null));
          } catch {
            ((e.value = []), (v.value = null));
          } finally {
            f.value = !1;
          }
        };
      return (
        H(
          () => [l.userId, p.value],
          () => {
            u();
          },
          { immediate: !0 },
        ),
        (a, d) => {
          const $ = G,
            S = q,
            U = j,
            P = M;
          return (
            t(),
            g("section", _e, [
              b("div", pe, [
                s(
                  U,
                  { columns: D },
                  {
                    default: c(() => [
                      (t(!0),
                      g(
                        L,
                        null,
                        Z(
                          I.value,
                          (A) => (
                            t(),
                            i(
                              S,
                              { key: A.id },
                              {
                                default: c(() => [
                                  s(
                                    $,
                                    null,
                                    {
                                      default: c(() => [
                                        b("div", me, [
                                          A.gallery &&
                                          A.gallery.length > 0 &&
                                          A.gallery[0]
                                            ? (t(),
                                              g(
                                                "img",
                                                {
                                                  key: 0,
                                                  src: o(A.gallery[0]),
                                                  alt: A.name,
                                                  class:
                                                    "users--announcements__gallery__image",
                                                },
                                                null,
                                                8,
                                                ve,
                                              ))
                                            : (t(), g("span", fe, "-")),
                                        ]),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  s(
                                    $,
                                    null,
                                    {
                                      default: c(() => [
                                        b("div", ge, F(A.name), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  s(
                                    $,
                                    null,
                                    {
                                      default: c(() => [
                                        z(F(m(V)(A.createdAt)), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  s(
                                    $,
                                    { align: "right" },
                                    {
                                      default: c(() => [
                                        b(
                                          "button",
                                          {
                                            class:
                                              "users--announcements__action",
                                            title: "Ver anuncio",
                                            onClick: (Ve) => T(A.id),
                                          },
                                          [
                                            s(m(J), {
                                              class:
                                                "users--announcements__action__icon",
                                            }),
                                          ],
                                          8,
                                          be,
                                        ),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                ]),
                                _: 2,
                              },
                              1024,
                            )
                          ),
                        ),
                        128,
                      )),
                    ]),
                    _: 1,
                  },
                ),
                I.value.length === 0 && !f.value
                  ? (t(),
                    g("div", ye, [
                      ...(d[0] ||
                        (d[0] = [
                          b("p", null, "No se encontraron anuncios", -1),
                        ])),
                    ]))
                  : n("", !0),
                f.value
                  ? (t(),
                    g("div", he, [
                      ...(d[1] ||
                        (d[1] = [b("p", null, "Cargando anuncios...", -1)])),
                    ]))
                  : n("", !0),
              ]),
              s(
                P,
                {
                  "current-page": p.value,
                  "total-pages": k.value,
                  "total-records": w.value,
                  "page-size": W,
                  class: "users--announcements__pagination",
                  onPageChange: r,
                },
                null,
                8,
                ["current-page", "total-pages", "total-records"],
              ),
            ])
          );
        }
      );
    },
  }),
  Ce = Object.assign(ke, { __name: "UserAnnouncements" }),
  Ie = { class: "users users--reservations" },
  $e = { class: "users--reservations__table-wrapper" },
  Ae = ["onClick"],
  Re = { key: 0, class: "users--reservations__empty" },
  Ue = { key: 1, class: "users--reservations__loading" },
  X = 10,
  Ne = B({
    __name: "UserReservations",
    props: { userId: {}, userName: {} },
    setup(y) {
      const l = y,
        N = E(),
        p = h(1),
        e = h([]),
        f = h(!1),
        v = h(null),
        D = [
          { label: "ID" },
          { label: "Fecha" },
          { label: "Acciones", align: "right" },
        ],
        I = C(() => e.value),
        k = C(() => v.value?.pageCount || 1),
        w = C(() => v.value?.total || 0),
        x = O(),
        o = (u) => {
          x.push(`/dashboard/reservations/${u}`);
        },
        R = (u) => {
          p.value = u;
        },
        T = () => {
          if (typeof l.userId == "number") return l.userId;
          const u = Number(l.userId);
          return Number.isNaN(u) ? l.userId : u;
        },
        r = (u, a) => {
          const d = [
            { user: { id: { $eq: u } } },
            { user: { documentId: { $eq: u } } },
          ];
          return (a && d.push({ user: { username: { $eq: a } } }), d);
        },
        _ = async () => {
          const u = T();
          if (!u) {
            ((e.value = []), (v.value = null));
            return;
          }
          try {
            f.value = !0;
            const a = await N("ad-reservations", {
              method: "GET",
              params: {
                filters: { $or: r(u, l.userName) },
                pagination: { page: p.value, pageSize: X },
                sort: "createdAt:desc",
              },
            });
            ((e.value = Array.isArray(a.data) ? a.data : []),
              (v.value = a.meta?.pagination || null));
          } catch {
            ((e.value = []), (v.value = null));
          } finally {
            f.value = !1;
          }
        };
      return (
        H(
          () => [l.userId, l.userName, p.value],
          () => {
            _();
          },
          { immediate: !0 },
        ),
        (u, a) => {
          const d = G,
            $ = q,
            S = j,
            U = M;
          return (
            t(),
            g("section", Ie, [
              b("div", $e, [
                s(
                  S,
                  { columns: D },
                  {
                    default: c(() => [
                      (t(!0),
                      g(
                        L,
                        null,
                        Z(
                          I.value,
                          (P) => (
                            t(),
                            i(
                              $,
                              { key: P.id },
                              {
                                default: c(() => [
                                  s(
                                    d,
                                    null,
                                    { default: c(() => [z(F(P.id), 1)]), _: 2 },
                                    1024,
                                  ),
                                  s(
                                    d,
                                    null,
                                    {
                                      default: c(() => [
                                        z(F(m(V)(P.createdAt)), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  s(
                                    d,
                                    { align: "right" },
                                    {
                                      default: c(() => [
                                        b(
                                          "button",
                                          {
                                            class:
                                              "users--reservations__action",
                                            title: "Ver reserva",
                                            onClick: (A) => o(P.id),
                                          },
                                          [
                                            s(m(J), {
                                              class:
                                                "users--reservations__action__icon",
                                            }),
                                          ],
                                          8,
                                          Ae,
                                        ),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                ]),
                                _: 2,
                              },
                              1024,
                            )
                          ),
                        ),
                        128,
                      )),
                    ]),
                    _: 1,
                  },
                ),
                I.value.length === 0 && !f.value
                  ? (t(),
                    g("div", Re, [
                      ...(a[0] ||
                        (a[0] = [
                          b("p", null, "No se encontraron reservas libres", -1),
                        ])),
                    ]))
                  : n("", !0),
                f.value
                  ? (t(),
                    g("div", Ue, [
                      ...(a[1] ||
                        (a[1] = [b("p", null, "Cargando reservas...", -1)])),
                    ]))
                  : n("", !0),
              ]),
              s(
                U,
                {
                  "current-page": p.value,
                  "total-pages": k.value,
                  "total-records": w.value,
                  "page-size": X,
                  class: "users--reservations__pagination",
                  onPageChange: R,
                },
                null,
                8,
                ["current-page", "total-pages", "total-records"],
              ),
            ])
          );
        }
      );
    },
  }),
  De = Object.assign(Ne, { __name: "UserReservations" }),
  we = { class: "users users--featured" },
  xe = { class: "users--featured__table-wrapper" },
  Te = ["onClick"],
  Pe = { key: 0, class: "users--featured__empty" },
  Fe = { key: 1, class: "users--featured__loading" },
  Y = 10,
  ze = B({
    __name: "UserFeatured",
    props: { userId: {} },
    setup(y) {
      const l = y,
        N = E(),
        p = h(1),
        e = h([]),
        f = h(!1),
        v = h(null),
        D = [
          { label: "ID" },
          { label: "Precio" },
          { label: "Fecha" },
          { label: "Acciones", align: "right" },
        ],
        I = C(() => e.value),
        k = C(() => v.value?.pageCount || 1),
        w = C(() => v.value?.total || 0),
        x = O(),
        o = (_) => {
          x.push(`/dashboard/featured/${_}`);
        },
        R = (_) => {
          p.value = _;
        },
        T = () => {
          if (typeof l.userId == "number") return l.userId;
          const _ = Number(l.userId);
          return Number.isNaN(_) ? l.userId : _;
        },
        r = async () => {
          const _ = T();
          if (!_) {
            ((e.value = []), (v.value = null));
            return;
          }
          try {
            f.value = !0;
            const u = await N("ad-featured-reservations", {
              method: "GET",
              params: {
                filters: {
                  user: { id: { $eq: _ } },
                  ad: { $null: !0 },
                  price: { $eq: "0" },
                },
                pagination: { page: p.value, pageSize: Y },
                sort: "createdAt:desc",
              },
            });
            ((e.value = Array.isArray(u.data) ? u.data : []),
              (v.value = u.meta?.pagination || null));
          } catch {
            ((e.value = []), (v.value = null));
          } finally {
            f.value = !1;
          }
        };
      return (
        H(
          () => [l.userId, p.value],
          () => {
            r();
          },
          { immediate: !0 },
        ),
        (_, u) => {
          const a = G,
            d = q,
            $ = j,
            S = M;
          return (
            t(),
            g("section", we, [
              b("div", xe, [
                s(
                  $,
                  { columns: D },
                  {
                    default: c(() => [
                      (t(!0),
                      g(
                        L,
                        null,
                        Z(
                          I.value,
                          (U) => (
                            t(),
                            i(
                              d,
                              { key: U.id },
                              {
                                default: c(() => [
                                  s(
                                    a,
                                    null,
                                    { default: c(() => [z(F(U.id), 1)]), _: 2 },
                                    1024,
                                  ),
                                  s(
                                    a,
                                    null,
                                    {
                                      default: c(() => [
                                        z(F(m(ie)(U.price)), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  s(
                                    a,
                                    null,
                                    {
                                      default: c(() => [
                                        z(F(m(V)(U.createdAt)), 1),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                  s(
                                    a,
                                    { align: "right" },
                                    {
                                      default: c(() => [
                                        b(
                                          "button",
                                          {
                                            class: "users--featured__action",
                                            title: "Ver destacado",
                                            onClick: (P) => o(U.id),
                                          },
                                          [
                                            s(m(J), {
                                              class:
                                                "users--featured__action__icon",
                                            }),
                                          ],
                                          8,
                                          Te,
                                        ),
                                      ]),
                                      _: 2,
                                    },
                                    1024,
                                  ),
                                ]),
                                _: 2,
                              },
                              1024,
                            )
                          ),
                        ),
                        128,
                      )),
                    ]),
                    _: 1,
                  },
                ),
                I.value.length === 0 && !f.value
                  ? (t(),
                    g("div", Pe, [
                      ...(u[0] ||
                        (u[0] = [
                          b(
                            "p",
                            null,
                            "No se encontraron destacados libres",
                            -1,
                          ),
                        ])),
                    ]))
                  : n("", !0),
                f.value
                  ? (t(),
                    g("div", Fe, [
                      ...(u[1] ||
                        (u[1] = [b("p", null, "Cargando destacados...", -1)])),
                    ]))
                  : n("", !0),
              ]),
              s(
                S,
                {
                  "current-page": p.value,
                  "total-pages": k.value,
                  "total-records": w.value,
                  "page-size": Y,
                  class: "users--featured__pagination",
                  onPageChange: R,
                },
                null,
                8,
                ["current-page", "total-pages", "total-records"],
              ),
            ])
          );
        }
      );
    },
  }),
  Se = Object.assign(ze, { __name: "UserFeatured" }),
  Ye = B({
    __name: "[id]",
    async setup(y) {
      let l, N;
      const p = re(),
        e = h(null),
        { formatRut: f } = de(),
        v = E(),
        D = C(() => e.value?.username || "Usuario"),
        I = C(() => [
          { label: "Usuarios", to: "/dashboard/users" },
          ...(e.value?.username ? [{ label: e.value.username }] : []),
        ]),
        k = (o) =>
          o
            ? typeof o == "string"
              ? o
              : o.name
                ? o.name
                : o.data?.attributes?.name
                  ? o.data.attributes.name
                  : o.data?.name
                    ? o.data.name
                    : "--"
            : "--",
        w = (o) => {
          if (!o) return null;
          if (typeof o == "object" && o !== null) {
            if ("data" in o) return o.data;
            if ("id" in o) return o;
          }
          return null;
        },
        { data: x } =
          (([l, N] = le(async () =>
            oe(`user-${p.params.id}`, async () => {
              const o = p.params.id;
              if (!o) return null;
              try {
                const R = await v(`users/${o}`, {
                  method: "GET",
                  params: {
                    populate: {
                      role: { fields: ["name"] },
                      region: { fields: ["name"] },
                      commune: { fields: ["name"] },
                      business_region: { fields: ["name"] },
                      business_commune: { fields: ["name"] },
                    },
                  },
                });
                return w(R);
              } catch {
                return null;
              }
            }),
          )),
          (l = await l),
          N(),
          l);
      return (
        (e.value = x.value ?? null),
        (o, R) => {
          const T = ee,
            r = te,
            _ = ae,
            u = Ce,
            a = De,
            d = Se,
            $ = ne;
          return (
            t(),
            g("div", null, [
              s(T, { title: D.value, breadcrumbs: I.value }, null, 8, [
                "title",
                "breadcrumbs",
              ]),
              s($, null, {
                content: c(() => [
                  s(
                    _,
                    { title: "Información de usuario", columns: 2 },
                    {
                      default: c(() => [
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 0,
                                title: "Usuario",
                                description: e.value.username,
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 1,
                                title: "Correo electrónico",
                                description: e.value.email,
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 2,
                                title: "Nombre completo",
                                description: m(ce)(
                                  e.value.firstname,
                                  e.value.lastname,
                                ),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 3,
                                title: "RUT",
                                description: m(f)(e.value.rut),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 4,
                                title: "Teléfono",
                                description: e.value.phone || "--",
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 5,
                                title: "Fecha de nacimiento",
                                description: m(ue)(e.value.birthdate),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 6,
                                title: "Dirección",
                                description: m(K)(
                                  e.value.address,
                                  e.value.address_number,
                                ),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 7,
                                title: "Región",
                                description: k(e.value.region),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 8,
                                title: "Comuna",
                                description: k(e.value.commune),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 9,
                                title: "Código postal",
                                description: e.value.postal_code || "--",
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 10,
                                title: "Rol",
                                description: k(e.value.role),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 11,
                                title: "Pro",
                                description: e.value.pro_status ?? "inactive",
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 12,
                                title: "Confirmado",
                                description: m(Q)(e.value.confirmed),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 13,
                                title: "Bloqueado",
                                description: m(Q)(e.value.blocked),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                      ]),
                      _: 1,
                    },
                  ),
                  s(
                    _,
                    { title: "Anuncios", columns: 1 },
                    {
                      default: c(() => [
                        s(u, { "user-id": String(m(p).params.id) }, null, 8, [
                          "user-id",
                        ]),
                      ]),
                      _: 1,
                    },
                  ),
                  s(
                    _,
                    { title: "Reservas libres", columns: 1 },
                    {
                      default: c(() => [
                        s(
                          a,
                          {
                            "user-id": String(m(p).params.id),
                            "user-name": e.value?.username,
                          },
                          null,
                          8,
                          ["user-id", "user-name"],
                        ),
                      ]),
                      _: 1,
                    },
                  ),
                  s(
                    _,
                    { title: "Destacados libres", columns: 1 },
                    {
                      default: c(() => [
                        s(d, { "user-id": String(m(p).params.id) }, null, 8, [
                          "user-id",
                        ]),
                      ]),
                      _: 1,
                    },
                  ),
                  e.value?.is_company
                    ? (t(),
                      i(
                        _,
                        { key: 0, title: "Información de empresa", columns: 2 },
                        {
                          default: c(() => [
                            e.value
                              ? (t(),
                                i(
                                  r,
                                  {
                                    key: 0,
                                    title: "Razón social",
                                    description: e.value.business_name || "--",
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ))
                              : n("", !0),
                            e.value
                              ? (t(),
                                i(
                                  r,
                                  {
                                    key: 1,
                                    title: "Giro",
                                    description: e.value.business_type || "--",
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ))
                              : n("", !0),
                            e.value
                              ? (t(),
                                i(
                                  r,
                                  {
                                    key: 2,
                                    title: "RUT empresa",
                                    description: e.value.business_rut
                                      ? m(f)(e.value.business_rut)
                                      : "--",
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ))
                              : n("", !0),
                            e.value
                              ? (t(),
                                i(
                                  r,
                                  {
                                    key: 3,
                                    title: "Dirección empresa",
                                    description: m(K)(
                                      e.value.business_address,
                                      e.value.business_address_number,
                                    ),
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ))
                              : n("", !0),
                            e.value
                              ? (t(),
                                i(
                                  r,
                                  {
                                    key: 4,
                                    title: "Región empresa",
                                    description: k(e.value.business_region),
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ))
                              : n("", !0),
                            e.value
                              ? (t(),
                                i(
                                  r,
                                  {
                                    key: 5,
                                    title: "Comuna empresa",
                                    description: k(e.value.business_commune),
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ))
                              : n("", !0),
                            e.value
                              ? (t(),
                                i(
                                  r,
                                  {
                                    key: 6,
                                    title: "Código postal empresa",
                                    description:
                                      e.value.business_postal_code || "--",
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ))
                              : n("", !0),
                          ]),
                          _: 1,
                        },
                      ))
                    : n("", !0),
                ]),
                sidebar: c(() => [
                  s(
                    _,
                    { title: "Detalles", columns: 1 },
                    {
                      default: c(() => [
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 0,
                                title: "Fecha de creación",
                                description: m(V)(e.value.createdAt),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              r,
                              {
                                key: 1,
                                title: "Última modificación",
                                description: m(V)(e.value.updatedAt),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
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
export { Ye as default };
//# sourceMappingURL=BRHXXGLn.js.map

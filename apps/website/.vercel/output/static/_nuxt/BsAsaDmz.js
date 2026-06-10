import { _ as Z } from "./vgLiQXkW.js";
import { _ as J } from "./C2l5JNgr.js";
import { _ as K, a as ee } from "./RoATBwxO.js";
import { _ as ae } from "./yakk9C2s.js";
import {
  aZ as M,
  b8 as x,
  be as te,
  a_ as t,
  a$ as h,
  bC as ne,
  bf as u,
  b0 as s,
  b6 as p,
  bQ as oe,
  bi as B,
  b7 as n,
  bG as ie,
  bV as re,
  b9 as k,
  b2 as le,
  aY as se,
  b3 as ce,
  bm as ue,
  cy as de,
  b1 as d,
  b5 as i,
  bS as be,
  cz as pe,
  cq as me,
  bk as fe,
} from "./BK8sApmn.js";
import { f as ve } from "./DFEPOiSh.js";
import { f as _e } from "./b4AISZcu.js";
import { f as E } from "./CjIigZ6h.js";
import { T as he, O as ye } from "./D2SV-Ukv.js";
import { B as ge, C as xe } from "./Bj3T-MQP.js";
import { C as ke } from "./-VADgLbk.js";
import "./CNKn_OHC.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
import "./BSW603Mu.js";
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
    m = new r.Error().stack;
  m &&
    ((r._sentryDebugIds = r._sentryDebugIds || {}),
    (r._sentryDebugIds[m] = "c05f536f-45f4-4e82-be07-22ae28defacf"),
    (r._sentryDebugIdIdentifier =
      "sentry-dbid-c05f536f-45f4-4e82-be07-22ae28defacf"));
} catch {}
const Ce = {
    class: "lightbox--razon__box",
    role: "dialog",
    "aria-modal": "true",
  },
  we = { class: "lightbox--razon__title" },
  ze = { key: 0, class: "lightbox--razon__text" },
  Re = { class: "form__group lightbox--razon__field" },
  De = ["placeholder"],
  Be = { class: "lightbox--razon__actions" },
  Ee = ["disabled"],
  Ie = M({
    __name: "LightboxRazonDashboard",
    props: {
      isOpen: { type: Boolean },
      title: {},
      description: { default: "" },
      placeholder: { default: "Escribe la razón..." },
      submitLabel: { default: "Enviar" },
      cancelLabel: { default: "Cancelar" },
      initialReason: { default: "" },
      loading: { type: Boolean, default: !1 },
    },
    emits: ["close", "submit"],
    setup(r, { emit: m }) {
      const e = r,
        y = m,
        v = x(e.initialReason),
        R = `lightbox-razon-${Math.random().toString(36).slice(2)}`;
      te(
        () => e.isOpen,
        (C) => {
          C && (v.value = e.initialReason || "");
        },
      );
      const b = k(() => e.loading || v.value.trim().length === 0);
      function l() {
        y("close");
      }
      function I() {
        b.value || y("submit", v.value.trim());
      }
      return (C, w) => (
        t(),
        h(
          "div",
          { class: ne([{ "is-open": r.isOpen }, "lightbox lightbox--razon"]) },
          [
            u("div", { class: "lightbox--razon__backdrop", onClick: l }),
            u("div", Ce, [
              u(
                "button",
                {
                  title: "Cerrar",
                  type: "button",
                  class: "lightbox__button",
                  onClick: l,
                },
                [s(p(oe), { size: 24 })],
              ),
              u("div", we, B(r.title), 1),
              r.description
                ? (t(), h("div", ze, B(r.description), 1))
                : n("", !0),
              u("div", Re, [
                u("label", { class: "form__label", for: R }, "Razón"),
                ie(
                  u(
                    "textarea",
                    {
                      id: R,
                      "onUpdate:modelValue":
                        w[0] || (w[0] = (A) => (v.value = A)),
                      class: "form__control",
                      placeholder: r.placeholder,
                      rows: "4",
                    },
                    null,
                    8,
                    De,
                  ),
                  [[re, v.value]],
                ),
              ]),
              u("div", Be, [
                u(
                  "button",
                  { class: "btn btn--secondary", type: "button", onClick: l },
                  B(r.cancelLabel),
                  1,
                ),
                u(
                  "button",
                  {
                    class: "btn btn--primary",
                    type: "button",
                    disabled: b.value,
                    onClick: I,
                  },
                  B(r.submitLabel),
                  9,
                  Ee,
                ),
              ]),
            ]),
          ],
          2,
        )
      );
    },
  }),
  Ae = Object.assign(Ie, { __name: "LightboxRazonDashboard" }),
  je = ["href"],
  Se =
    "Su anuncio fue rechazado porque no cumple con las políticas y términos de uso de Waldo.click®.",
  Le =
    "Su anuncio fue baneado porque no cumple con las políticas y términos de uso de Waldo.click®.",
  Ye = M({
    __name: "[id]",
    setup(r) {
      const m = le(),
        e = x(null),
        y = (a) => (!a || typeof a == "number" ? "--" : a.name || "--"),
        { public: v } = se(),
        R = v.websiteUrl || "http://localhost:3000",
        b = ce(),
        { Swal: l } = fe(),
        I = k(() => e.value?.name || "Anuncio"),
        C = {
          pending: ke,
          active: me,
          archived: xe,
          banned: ge,
          rejected: pe,
          abandoned: ye,
        },
        w = {
          pending: { label: "Pendientes", to: "/dashboard/ads/pending" },
          active: { label: "Activos", to: "/dashboard/ads/active" },
          archived: { label: "Expirados", to: "/dashboard/ads/expired" },
          banned: { label: "Baneados", to: "/dashboard/ads/banned" },
          rejected: { label: "Rechazados", to: "/dashboard/ads/rejected" },
          abandoned: { label: "Borradores", to: "/dashboard/ads/abandoned" },
        },
        A = k(() => {
          const a = e.value?.status,
            c = a && a in w ? a : "pending",
            g = w[c];
          return [
            { label: "Anuncios", to: "/dashboard/ads/pending" },
            { label: g.label, to: g.to },
            ...(e.value?.name ? [{ label: e.value.name }] : []),
          ];
        }),
        N = k(() => {
          const a = e.value?.status;
          return a && a in C ? C[a] : null;
        }),
        V = {
          pending: "Pendiente",
          active: "Activo",
          archived: "Expirado",
          banned: "Baneado",
          rejected: "Rechazado",
          abandoned: "Abandonado",
        },
        q = (a) => (a?.status ? V[a.status] || a.status : "--"),
        P = k(() => e.value?.status === "pending"),
        G = k(() => e.value?.status === "active"),
        j = x(!1),
        S = x(!1),
        L = x(!1),
        T = x(!1),
        F = () => {
          j.value = !0;
        },
        O = () => {
          j.value = !1;
        },
        X = () => {
          S.value = !0;
        },
        U = () => {
          S.value = !1;
        },
        H = async () => {
          const a = e.value?.id ?? m.params.id;
          if (a)
            try {
              (await b(`/ads/${a}/approve`, { method: "PUT" }),
                await z(),
                l.fire("Éxito", "Anuncio aprobado correctamente.", "success"));
            } catch {}
        },
        W = async (a) => {
          if (e.value?.id) {
            L.value = !0;
            try {
              (await b(`/ads/${e.value.id}/reject`, {
                method: "PUT",
                body: { reason_rejected: a },
              }),
                await z(),
                O(),
                l.fire("Éxito", "Anuncio rechazado correctamente.", "success"));
            } catch {
              l.fire("Error", "No se pudo rechazar el anuncio.", "error");
            } finally {
              L.value = !1;
            }
          }
        },
        Q = async (a) => {
          if (e.value?.id) {
            T.value = !0;
            try {
              (await b(`/ads/${e.value.id}/banned`, {
                method: "PUT",
                body: { reason_for_ban: a },
              }),
                await z(),
                U(),
                l.fire("Éxito", "Anuncio baneado correctamente.", "success"));
            } catch {
              l.fire("Error", "No se pudo banear el anuncio.", "error");
            } finally {
              T.value = !1;
            }
          }
        },
        Y = async ({ image: a }) => {
          if (!e.value?.id) return;
          if (!a?.id) {
            await l.fire(
              "Error",
              "No se pudo identificar la imagen para eliminar.",
              "error",
            );
            return;
          }
          if (
            (
              await l.fire({
                title: "¿Está seguro de eliminar la imagen?",
                text: "Esta acción eliminará la imagen del anuncio.",
                icon: "warning",
                showCancelButton: !0,
                confirmButtonText: "Eliminar",
                cancelButtonText: "Cancelar",
              })
            ).isConfirmed
          )
            try {
              const o =
                  e.value?.gallery
                    ?.map((f) => f.id)
                    .filter((f) => f !== void 0) || [],
                _ = Number(a.id),
                $ = o.filter((f) => f !== _),
                D =
                  e.value?.documentId || m.params.id || e.value?.id?.toString();
              if (!D) {
                await l.fire(
                  "Error",
                  "No se pudo identificar el anuncio para actualizar.",
                  "error",
                );
                return;
              }
              (await b(`/ads/${D}`, {
                method: "PUT",
                body: { data: { gallery: $ } },
              }),
                await b(`/upload/files/${a.id}`, { method: "DELETE" }),
                await z(),
                await l.fire(
                  "Éxito",
                  "Imagen eliminada correctamente.",
                  "success",
                ));
            } catch {
              await l.fire("Error", "No se pudo eliminar la imagen.", "error");
            }
        },
        z = async () => {
          const a = m.params.id;
          if (a)
            try {
              const c = await b(`ads/${a}`, {
                method: "GET",
                params: {
                  populate: {
                    category: !0,
                    condition: !0,
                    commune: !0,
                    gallery: !0,
                  },
                },
              });
              c.data && (e.value = c.data);
            } catch {}
        };
      return (
        ue(async () => {
          await z();
        }),
        (a, c) => {
          const g = Z,
            o = J,
            _ = K,
            $ = ae,
            D = ee,
            f = Ae;
          return (
            t(),
            h("div", null, [
              s(
                g,
                { title: I.value, breadcrumbs: A.value },
                de(
                  {
                    actions: d(() => [
                      P.value
                        ? (t(),
                          h(
                            "button",
                            {
                              key: 0,
                              type: "button",
                              class: "btn btn--buy",
                              onClick: H,
                            },
                            " Aprobar ",
                          ))
                        : n("", !0),
                      P.value
                        ? (t(),
                          h(
                            "button",
                            {
                              key: 1,
                              type: "button",
                              class: "btn btn--secondary",
                              onClick: F,
                            },
                            " Rechazar ",
                          ))
                        : n("", !0),
                      e.value?.slug
                        ? (t(),
                          h(
                            "a",
                            {
                              key: 2,
                              href: `${p(R)}/anuncios/${e.value.slug}`,
                              target: "_blank",
                              rel: "noopener noreferrer",
                              class: "btn btn--secondary",
                            },
                            " Ver en web ",
                            8,
                            je,
                          ))
                        : n("", !0),
                      G.value
                        ? (t(),
                          h(
                            "button",
                            {
                              key: 3,
                              type: "button",
                              class: "btn btn--secondary",
                              onClick: X,
                            },
                            " Banear ",
                          ))
                        : n("", !0),
                    ]),
                    _: 2,
                  },
                  [
                    N.value
                      ? {
                          name: "titlePrefix",
                          fn: d(() => [
                            (t(), i(be(N.value), { "aria-hidden": "true" })),
                          ]),
                          key: "0",
                        }
                      : void 0,
                  ],
                ),
                1032,
                ["title", "breadcrumbs"],
              ),
              s(D, null, {
                content: d(() => [
                  e.value?.reason_for_ban
                    ? (t(),
                      i(
                        _,
                        { key: 0, title: "Razón del baneo", columns: 1 },
                        {
                          titlePrefix: d(() => [
                            s(p(he), { "aria-hidden": "true" }),
                          ]),
                          default: d(() => [
                            e.value?.banned_at
                              ? (t(),
                                i(
                                  o,
                                  {
                                    key: 0,
                                    title: "Fecha",
                                    description: p(E)(e.value.banned_at),
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ))
                              : n("", !0),
                            s(
                              o,
                              {
                                title: "Detalle",
                                description: e.value.reason_for_ban,
                              },
                              null,
                              8,
                              ["description"],
                            ),
                          ]),
                          _: 1,
                        },
                      ))
                    : n("", !0),
                  e.value?.reason_for_rejection
                    ? (t(),
                      i(
                        _,
                        { key: 1, title: "Razón del rechazo", columns: 1 },
                        {
                          default: d(() => [
                            e.value?.rejected_at
                              ? (t(),
                                i(
                                  o,
                                  {
                                    key: 0,
                                    title: "Fecha",
                                    description: p(E)(e.value.rejected_at),
                                  },
                                  null,
                                  8,
                                  ["description"],
                                ))
                              : n("", !0),
                            s(
                              o,
                              {
                                title: "Detalle",
                                description: e.value.reason_for_rejection,
                              },
                              null,
                              8,
                              ["description"],
                            ),
                          ]),
                          _: 1,
                        },
                      ))
                    : n("", !0),
                  s(
                    _,
                    { title: "Información", columns: 2 },
                    {
                      default: d(() => [
                        e.value
                          ? (t(),
                            i(
                              o,
                              {
                                key: 0,
                                title: "Nombre",
                                description: e.value.name,
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              o,
                              {
                                key: 1,
                                title: "Slug",
                                description: e.value.slug,
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              o,
                              {
                                key: 2,
                                title: "Precio",
                                description: p(ve)(e.value.price, {
                                  currency: e.value.currency,
                                }),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              o,
                              {
                                key: 3,
                                title: "Categoría",
                                description: y(e.value.category),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              o,
                              {
                                key: 4,
                                title: "Condición",
                                description: y(e.value.condition),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              o,
                              {
                                key: 5,
                                title: "Comuna",
                                description: y(e.value.commune),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              o,
                              {
                                key: 6,
                                title: "Dirección",
                                description: p(_e)(
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
                              o,
                              {
                                key: 7,
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
                              o,
                              {
                                key: 8,
                                title: "Email",
                                description: e.value.email || "--",
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              o,
                              {
                                key: 9,
                                title: "Duración",
                                description: `${e.value.duration_days} días`,
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              o,
                              {
                                key: 10,
                                title: "Días Restantes",
                                description: `${e.value.remaining_days} días`,
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              o,
                              {
                                key: 11,
                                title: "Moneda",
                                description: e.value.currency || "--",
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              o,
                              {
                                key: 12,
                                class: "box--information__description__full",
                                title: "Descripción",
                                description: e.value.description || "--",
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
                  e.value?.gallery && e.value.gallery.length > 0
                    ? (t(),
                      i(
                        _,
                        { key: 2, title: "Galería de imágenes", columns: 1 },
                        {
                          default: d(() => [
                            s(
                              $,
                              {
                                images: e.value.gallery,
                                "alt-prefix": e.value.name,
                                columns: 6,
                                onImageDelete: Y,
                              },
                              null,
                              8,
                              ["images", "alt-prefix"],
                            ),
                          ]),
                          _: 1,
                        },
                      ))
                    : n("", !0),
                ]),
                sidebar: d(() => [
                  s(
                    _,
                    { title: "Detalles", columns: 1 },
                    {
                      default: d(() => [
                        e.value
                          ? (t(),
                            i(
                              o,
                              {
                                key: 0,
                                title: "Estado",
                                description: q(e.value),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              o,
                              {
                                key: 1,
                                title: "Fecha de creación",
                                description: p(E)(e.value.createdAt),
                              },
                              null,
                              8,
                              ["description"],
                            ))
                          : n("", !0),
                        e.value
                          ? (t(),
                            i(
                              o,
                              {
                                key: 2,
                                title: "Última modificación",
                                description: p(E)(e.value.updatedAt),
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
              s(
                f,
                {
                  "is-open": j.value,
                  title: "Razón del rechazo",
                  description:
                    "Esta razón se enviará al usuario y quedará registrada en el anuncio.",
                  "initial-reason": Se,
                  loading: L.value,
                  onClose: O,
                  onSubmit: W,
                },
                null,
                8,
                ["is-open", "loading"],
              ),
              s(
                f,
                {
                  "is-open": S.value,
                  title: "Razón del baneo",
                  description: "Esta razón quedará registrada en el anuncio.",
                  "initial-reason": Le,
                  loading: T.value,
                  onClose: U,
                  onSubmit: Q,
                },
                null,
                8,
                ["is-open", "loading"],
              ),
            ])
          );
        }
      );
    },
  });
export { Ye as default };
//# sourceMappingURL=BsAsaDmz.js.map

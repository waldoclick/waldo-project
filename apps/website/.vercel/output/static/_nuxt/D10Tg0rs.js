import {
  bx as x,
  b3 as T,
  bm as B,
  a_ as i,
  a$ as s,
  bf as t,
  bC as S,
  bO as $,
  b6 as v,
  b8 as m,
  bt as E,
  bk as D,
  bz as y,
  aZ as w,
  b0 as b,
  b9 as O,
  bu as L,
  bw as N,
  aY as R,
} from "./BK8sApmn.js";
import { a as h, i as W } from "./DSMxzyTa.js";
import { M as j } from "./DuRm081T.js";
import { C as q } from "./DnzrZk1h.js";
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
    e = new r.Error().stack;
  e &&
    ((r._sentryDebugIds = r._sentryDebugIds || {}),
    (r._sentryDebugIds[e] = "d97f2913-27ae-410e-b0ad-8fc43c7fed17"),
    (r._sentryDebugIdIdentifier =
      "sentry-dbid-d97f2913-27ae-410e-b0ad-8fc43c7fed17"));
} catch {}
const F = { class: "upload upload--avatar" },
  M = { class: "upload--avatar__grid" },
  V = ["src"],
  G = ["src"],
  H = ["src"],
  J = { class: "upload--avatar__information" },
  Y = ["src"],
  Z = {
    __name: "UploadAvatar",
    setup(r) {
      const { Swal: e } = D(),
        l = x(),
        { transformUrl: n, uploadFile: d } = E(),
        _ = T(),
        g = m({ file: void 0 }),
        f = m(null),
        c = m(!1),
        u = m(null);
      B(() => {
        (l.value?.avatar && (u.value = n(l.value.avatar.url)),
          f.value && f.value.style.setProperty("visibility", "hidden"));
      });
      const A = () => {
          c.value || f.value.click();
        },
        I = (o) => {
          const a = o.target.files[0];
          if (!["image/jpeg", "image/png", "image/webp"].includes(a.type)) {
            e.fire({
              text: "Solo se permiten imágenes en formato JPG, PNG o WebP.",
              icon: "error",
              confirmButtonText: "Aceptar",
            });
            return;
          }
          const p = new Image();
          ((p.src = URL.createObjectURL(a)),
            p.addEventListener("load", () => {
              if (p.width < 200 || p.height < 200) {
                e.fire({
                  text: "La imagen debe tener al menos 200x200 píxeles.",
                  icon: "error",
                  confirmButtonText: "Aceptar",
                });
                return;
              }
              ((g.value.file = a), P());
            }));
        },
        P = async () => {
          ((c.value = !0), (document.body.style.cursor = "wait"));
          try {
            const o = await d(g.value.file, "avatar");
            (await z(o),
              (u.value = n(o.url)),
              (f.value.value = ""),
              e.fire({
                text: "Avatar subido y actualizado correctamente",
                icon: "success",
                confirmButtonText: "Aceptar",
              }));
          } catch {
            e.fire({
              text: "¡Error al subir la imagen! Por favor, intenta nuevamente.",
              icon: "error",
              confirmButtonText: "Aceptar",
            });
          } finally {
            ((c.value = !1), (document.body.style.cursor = "default"));
          }
        },
        z = async (o) => {
          try {
            await _("users/avatar", { method: "PUT", body: { avatar: o.id } });
            const { fetchUser: a } = y();
            await a();
          } catch {
            e.fire({
              text: "¡Error al actualizar el avatar! Por favor, intenta nuevamente.",
              icon: "error",
              confirmButtonText: "Aceptar",
            });
          }
        },
        C = (o) => {
          c.value ||
            e
              .fire({
                text: "¿Estás seguro de eliminar tu foto de perfil?",
                icon: "warning",
                showCancelButton: !0,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "No",
              })
              .then((a) => {
                a.isConfirmed && U();
              });
        },
        U = async (o) => {
          ((c.value = !0), (document.body.style.cursor = "wait"));
          try {
            await _("users/avatar", {
              method: "PUT",
              body: { avatarId: null },
            });
            const { fetchUser: a } = y();
            (await a(),
              (u.value = null),
              window.location.reload(),
              e.fire({
                text: "Foto de perfil eliminada exitosamente",
                icon: "success",
                confirmButtonText: "Aceptar",
              }));
          } catch {
            e.fire({
              text: "¡Error al eliminar la foto de perfil! Por favor, intenta nuevamente.",
              icon: "error",
              confirmButtonText: "Aceptar",
            });
          } finally {
            ((c.value = !1), (document.body.style.cursor = "default"));
          }
        };
      return (o, a) => (
        i(),
        s("div", F, [
          t("div", M, [
            t(
              "div",
              {
                class: S([{ "is-active": u.value }, "upload--avatar__input"]),
                onClick: A,
              },
              [
                t(
                  "img",
                  {
                    class: "upload--images__input__image",
                    src: o.image?.url || "",
                    alt: "Imagen",
                  },
                  null,
                  8,
                  V,
                ),
                u.value
                  ? (i(),
                    s(
                      "button",
                      {
                        key: 0,
                        class: "upload--avatar__input__button",
                        type: "button",
                        onClick:
                          a[0] || (a[0] = $((k) => C(u.value), ["stop"])),
                      },
                      [
                        t(
                          "img",
                          {
                            loading: "lazy",
                            src: v(h),
                            alt: "Eliminar avatar",
                            title: "Eliminar avatar",
                          },
                          null,
                          8,
                          G,
                        ),
                      ],
                    ))
                  : (i(),
                    s(
                      "img",
                      {
                        key: 1,
                        loading: "lazy",
                        src: v(h),
                        alt: "Subir avatar",
                        title: "Subir avatar",
                      },
                      null,
                      8,
                      H,
                    )),
              ],
              2,
            ),
          ]),
          t("div", J, [
            t(
              "img",
              {
                loading: "lazy",
                decoding: "async",
                src: v(W),
                alt: "Icon Info",
                title: "Icon Info",
              },
              null,
              8,
              Y,
            ),
            a[1] ||
              (a[1] = t(
                "p",
                null,
                "Sube una foto de perfil para personalizar tu cuenta.",
                -1,
              )),
          ]),
          t(
            "input",
            {
              ref_key: "fileInput",
              ref: f,
              type: "file",
              name: "avatar",
              accept: "image/*",
              onChange: I,
            },
            null,
            544,
          ),
        ])
      );
    },
  },
  K = {
    class: "account account--edit",
    "aria-labelledby": "profile-photo-title",
  },
  Q = {
    key: 0,
    class: "account--edit__form",
    "aria-describedby": "profile-photo-title",
  },
  X = { key: 1, class: "account--edit__form" },
  ee = w({
    __name: "AccountAvatar",
    setup(r) {
      const e = x(),
        l = O(() => e.value?.pro_status === "active");
      return (n, d) => (
        i(),
        s("section", K, [
          d[0] ||
            (d[0] = t(
              "div",
              { class: "account--edit__header" },
              [
                t(
                  "h1",
                  {
                    id: "profile-photo-title",
                    class: "account--edit__title title",
                  },
                  " Elige tu foto de perfil ",
                ),
                t("div", { class: "account--edit__text paragraph" }, [
                  t(
                    "p",
                    null,
                    " ¡Haz que tu perfil destaque! Un avatar personalizado ayuda a crear confianza y hace que tu presencia en Waldo.click® sea más memorable. Sube una foto que te represente y ayuda a otros usuarios a reconocerte fácilmente. ",
                  ),
                ]),
              ],
              -1,
            )),
          l.value
            ? (i(), s("div", Q, [b(Z)]))
            : (i(),
              s("div", X, [
                b(
                  j,
                  {
                    icon: v(q),
                    text: "Destaca tu presencia con un avatar personalizado. Las cuentas PRO pueden subir su propia imagen de perfil para generar más confianza y reconocimiento en la comunidad.",
                    link: "/cuenta",
                    "button-text": "Volver a mi cuenta",
                  },
                  null,
                  8,
                  ["icon"],
                ),
              ])),
        ])
      );
    },
  }),
  ae = Object.assign(ee, { __name: "AccountAvatar" }),
  te = { class: "page" },
  se = w({
    __name: "avatar",
    setup(r) {
      const { $setSEO: e, $setStructuredData: l } = L(),
        n = R();
      return (
        e({
          title: "Personalizar Avatar",
          description:
            "Personaliza tu avatar en Waldo.click®. Crea una presencia única y profesional en la plataforma.",
          imageUrl: `${n.public.baseUrl}/share.jpg`,
          url: `${n.public.baseUrl}/cuenta/avatar`,
        }),
        N({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        l({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Personalizar Avatar",
          url: `${n.public.baseUrl}/cuenta/avatar`,
          description:
            "Personaliza tu avatar en Waldo.click®. Crea una presencia única y profesional en la plataforma.",
        }),
        (d, _) => (i(), s("div", te, [b(ae)]))
      );
    },
  });
export { se as default };
//# sourceMappingURL=D10Tg0rs.js.map

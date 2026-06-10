import {
  bx as x,
  b3 as A,
  bm as B,
  a_ as i,
  a$ as s,
  bf as t,
  bC as S,
  bO as $,
  b6 as f,
  b8 as m,
  bt as D,
  bk as E,
  bz as y,
  aZ as w,
  b0 as b,
  b9 as L,
  bu as q,
  bw as O,
  aY as W,
} from "./BK8sApmn.js";
import { a as h, i as j } from "./DSMxzyTa.js";
import { M } from "./DuRm081T.js";
import { C as N } from "./DnzrZk1h.js";
try {
  let n =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    e = new n.Error().stack;
  e &&
    ((n._sentryDebugIds = n._sentryDebugIds || {}),
    (n._sentryDebugIds[e] = "214d2ec5-47da-4f68-a871-8ba1cbfcf11a"),
    (n._sentryDebugIdIdentifier =
      "sentry-dbid-214d2ec5-47da-4f68-a871-8ba1cbfcf11a"));
} catch {}
const R = { class: "upload upload--cover" },
  F = { class: "upload--cover__grid" },
  V = ["src"],
  G = ["src"],
  H = ["src"],
  J = { class: "upload--cover__information" },
  Y = ["src"],
  Z = {
    __name: "UploadCover",
    setup(n) {
      const { Swal: e } = E(),
        c = x(),
        { transformUrl: r, uploadFile: d } = D(),
        v = A(),
        g = m({ file: void 0 }),
        _ = m(null),
        l = m(!1),
        u = m(null);
      B(() => {
        c.value?.cover && (u.value = r(c.value.cover.url));
      });
      const P = () => {
          l.value || _.value.click();
        },
        C = (o) => {
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
              if (p.width < 1200 || p.height < 400) {
                e.fire({
                  text: "La imagen debe tener al menos 1200x400 píxeles.",
                  icon: "error",
                  confirmButtonText: "Aceptar",
                });
                return;
              }
              ((g.value.file = a), I());
            }));
        },
        I = async () => {
          ((l.value = !0), document.body.classList.add("cursor-wait"));
          try {
            const o = await d(g.value.file, "cover");
            (await k(o),
              (u.value = r(o.url)),
              (_.value.value = ""),
              e.fire({
                text: "Portada subida y actualizada correctamente",
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
            ((l.value = !1), document.body.classList.remove("cursor-wait"));
          }
        },
        k = async (o) => {
          try {
            await v("users/cover", { method: "PUT", body: { cover: o.id } });
            const { fetchUser: a } = y();
            await a();
          } catch {
            e.fire({
              text: "¡Error al actualizar la portada! Por favor, intenta nuevamente.",
              icon: "error",
              confirmButtonText: "Aceptar",
            });
          }
        },
        U = (o) => {
          l.value ||
            e
              .fire({
                text: "¿Estás seguro de eliminar tu imagen de portada?",
                icon: "warning",
                showCancelButton: !0,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "No",
              })
              .then((a) => {
                a.isConfirmed && z();
              });
        },
        z = async (o) => {
          ((l.value = !0), document.body.classList.add("cursor-wait"));
          try {
            await v("users/cover", { method: "PUT", body: { coverId: null } });
            const { fetchUser: a } = y();
            (await a(),
              (u.value = null),
              window.location.reload(),
              e.fire({
                text: "Imagen de portada eliminada exitosamente",
                icon: "success",
                confirmButtonText: "Aceptar",
              }));
          } catch {
            e.fire({
              text: "¡Error al eliminar la imagen de portada! Por favor, intenta nuevamente.",
              icon: "error",
              confirmButtonText: "Aceptar",
            });
          } finally {
            ((l.value = !1), document.body.classList.remove("cursor-wait"));
          }
        };
      return (o, a) => (
        i(),
        s("div", R, [
          t("div", F, [
            t(
              "div",
              {
                class: S([{ "is-active": u.value }, "upload--cover__input"]),
                onClick: P,
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
                        class: "upload--cover__input__button",
                        type: "button",
                        onClick:
                          a[0] || (a[0] = $((T) => U(u.value), ["stop"])),
                      },
                      [
                        t(
                          "img",
                          {
                            loading: "lazy",
                            src: f(h),
                            alt: "Eliminar portada",
                            title: "Eliminar portada",
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
                        src: f(h),
                        alt: "Subir portada",
                        title: "Subir portada",
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
                src: f(j),
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
                "Sube una imagen de portada para personalizar tu perfil.",
                -1,
              )),
          ]),
          t(
            "input",
            {
              ref_key: "fileInput",
              ref: _,
              type: "file",
              name: "cover",
              accept: "image/*",
              class: "upload--hidden",
              onChange: C,
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
    "aria-labelledby": "cover-photo-title",
  },
  Q = {
    key: 0,
    class: "account--edit__form",
    "aria-describedby": "cover-photo-title",
  },
  X = { key: 1, class: "account--edit__form" },
  ee = w({
    __name: "AccountCover",
    setup(n) {
      const e = x(),
        c = L(() => e.value?.pro_status === "active");
      return (r, d) => (
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
                    id: "cover-photo-title",
                    class: "account--edit__title title",
                  },
                  " Personaliza tu portada ",
                ),
                t("div", { class: "account--edit__text paragraph" }, [
                  t(
                    "p",
                    null,
                    " ¡Dale un toque único a tu perfil! Una portada personalizada es la primera impresión que otros usuarios tendrán de ti en Waldo.click®. Sube una imagen que represente tu actividad o negocio y haz que tu perfil sea más atractivo y profesional. ",
                  ),
                ]),
              ],
              -1,
            )),
          c.value
            ? (i(), s("div", Q, [b(Z)]))
            : (i(),
              s("div", X, [
                b(
                  M,
                  {
                    icon: f(N),
                    text: "Mejora tu experiencia en Waldo.click® con una cuenta PRO y personaliza tu perfil con una portada única. Destaca entre los demás vendedores y aumenta la visibilidad de tus anuncios.",
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
  ae = Object.assign(ee, { __name: "AccountCover" }),
  te = { class: "page" },
  se = w({
    __name: "cover",
    setup(n) {
      const { $setSEO: e, $setStructuredData: c } = q(),
        r = W();
      return (
        e({
          title: "Personalizar Portada",
          description:
            "Personaliza tu portada en Waldo.click®. Dale un toque único a tu perfil y destaca tus anuncios.",
          imageUrl: `${r.public.baseUrl}/share.jpg`,
          url: `${r.public.baseUrl}/cuenta/cover`,
        }),
        O({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        c({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Personalizar Portada",
          url: `${r.public.baseUrl}/cuenta/cover`,
          description:
            "Personaliza tu portada en Waldo.click®. Dale un toque único a tu perfil y destaca tus anuncios.",
        }),
        (d, v) => (i(), s("div", te, [b(ae)]))
      );
    },
  });
export { se as default };
//# sourceMappingURL=CYzhWIwj.js.map

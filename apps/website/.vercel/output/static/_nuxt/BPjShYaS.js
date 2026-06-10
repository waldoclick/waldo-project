import {
  cF as $,
  cx as R,
  b3 as V,
  a_ as l,
  a$ as c,
  bf as s,
  bn as B,
  bo as F,
  bC as A,
  bO as j,
  b0 as u,
  b6 as h,
  bQ as z,
  b9 as f,
  b8 as L,
  bk as P,
  bc as M,
  b5 as H,
  b1 as D,
  bj as W,
  aZ as J,
  bb as Q,
  bu as X,
  bw as Z,
  bm as K,
  cs as Y,
  bF as ee,
} from "./BK8sApmn.js";
import { u as E } from "./Bwc9GysH.js";
import { C as ae } from "./CNZV9sYn.js";
import { I as se } from "./BZsGLQuR.js";
import { u as ne } from "./CAHpseH1.js";
import { B as te } from "./C0j-iZe8.js";
import { u as oe } from "./CJzzMwWR.js";
import "./CsS7OJ1I.js";
import "./DrPuZ622.js";
try {
  let o =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    i = new o.Error().stack;
  i &&
    ((o._sentryDebugIds = o._sentryDebugIds || {}),
    (o._sentryDebugIds[i] = "f976159c-c45d-40a1-9c1e-d29bd03392ed"),
    (o._sentryDebugIdIdentifier =
      "sentry-dbid-f976159c-c45d-40a1-9c1e-d29bd03392ed"));
} catch {}
const ie = { class: "upload upload--images" },
  re = ["src"],
  le = ["onClick"],
  ce = { class: "upload--images__information" },
  ue = { key: 0 },
  de = { key: 1 },
  me = {
    __name: "UploadImages",
    setup(o) {
      const { Swal: i } = P(),
        d = $(),
        e = R(),
        v = V(),
        { pendingGalleryItems: y, addPending: S, removePending: I } = E(),
        m = L(null),
        r = L(!1),
        p = f(() => d.pack === "free"),
        x = f(() => {
          const a = d.ad.gallery;
          return Array.isArray(a) ? a : [];
        }),
        g = f(() => [...x.value, ...y.value]),
        b = f(() => (p.value ? 4 : 12)),
        T = f(() => Math.max(0, b.value - g.value.length)),
        U = () => {
          r.value || m.value.click();
        },
        N = (a) =>
          new Promise((_) => {
            const t = URL.createObjectURL(a),
              n = new Image();
            ((n.src = t),
              n.addEventListener("load", () => {
                (URL.revokeObjectURL(t), _(n.width >= 750 && n.height >= 420));
              }));
          }),
        G = async (a) => {
          const _ = [...a.target.files];
          m.value.value = "";
          const t = new Set(["image/jpeg", "image/png", "image/webp"]),
            n = b.value - g.value.length;
          if (n <= 0) {
            e.warning(
              `Ups, ya tienes ${b.value} imágenes. No puedes agregar más.`,
            );
            return;
          }
          const C = _.slice(0, n);
          _.length > n &&
            e.warning(
              `Solo puedes agregar ${n} imagen(es) más. Se procesarán las primeras ${n}.`,
            );
          const w = [];
          for (const k of C) {
            if (!t.has(k.type)) {
              e.error(
                `"${k.name}" no es un formato válido. Solo aceptamos JPG, PNG o WebP.`,
              );
              continue;
            }
            if (!(await N(k))) {
              e.error(
                `"${k.name}" es muy pequeña. Necesitamos al menos 750x420 píxeles.`,
              );
              continue;
            }
            w.push(k);
          }
          w.length > 0 &&
            (S(w),
            e.success(
              w.length === 1
                ? "¡Imagen lista! Se subirá al confirmar."
                : `¡${w.length} imágenes listas! Se subirán al confirmar.`,
            ));
        },
        q = (a) => {
          r.value ||
            i
              .fire({
                text: "¿Estás seguro de que quieres eliminar esta imagen?",
                icon: "warning",
                showCancelButton: !0,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "No, mantener",
              })
              .then((_) => {
                _.isConfirmed &&
                  (a.pending
                    ? (I(a.url), e.success("¡Listo! La imagen fue eliminada"))
                    : O(a));
              });
        },
        O = async (a) => {
          ((r.value = !0), (document.body.style.cursor = "wait"));
          try {
            (await v(`/ads/upload/${a.id}`, { method: "DELETE" }),
              d.removeFromGallery(a),
              e.success("¡Listo! La imagen fue eliminada"));
          } catch {
            e.error(
              "¡Ups! No pudimos eliminar la imagen. ¿Podrías intentarlo de nuevo?",
            );
          } finally {
            ((r.value = !1), (document.body.style.cursor = ""));
          }
        };
      return (a, _) => (
        l(),
        c("div", ie, [
          s(
            "div",
            {
              class: A([
                {
                  "upload--images__grid--is-free": p.value,
                  "upload--images__grid--disabled": r.value,
                },
                "upload--images__grid",
              ]),
            },
            [
              (l(!0),
              c(
                B,
                null,
                F(
                  g.value,
                  (t, n) => (
                    l(),
                    c(
                      "div",
                      {
                        key: `${t.id}-${n}`,
                        class: A([
                          { "is-active": !0 },
                          "upload--images__input",
                        ]),
                      },
                      [
                        s(
                          "img",
                          {
                            class: "upload--images__input__image",
                            src: t.url || "",
                            alt: "Imagen",
                          },
                          null,
                          8,
                          re,
                        ),
                        s(
                          "button",
                          {
                            class: "upload--images__input__button",
                            type: "button",
                            onClick: j((C) => q(t), ["stop"]),
                          },
                          [u(h(z), { stroke: 2, size: 16 })],
                          8,
                          le,
                        ),
                      ],
                    )
                  ),
                ),
                128,
              )),
              (l(!0),
              c(
                B,
                null,
                F(
                  T.value,
                  (t) => (
                    l(),
                    c(
                      "div",
                      {
                        key: `upload-image-${t}`,
                        class: "upload--images__input",
                        onClick: U,
                      },
                      [
                        u(h(ae), {
                          class: "upload--images__input__icon",
                          size: 24,
                        }),
                      ],
                    )
                  ),
                ),
                128,
              )),
            ],
            2,
          ),
          s("div", ce, [
            u(h(se), { size: 24 }),
            p.value
              ? (l(),
                c(
                  "p",
                  de,
                  " Si usas un anuncio de pago puedes subir hasta 12 imágenes. Buenas fotos es clave para hacer destacar tu producto y tener una publicación de calidad. ",
                ))
              : (l(),
                c(
                  "p",
                  ue,
                  " Buenas fotos es clave para hacer destacar tu producto y tener una publicación de calidad. ",
                )),
          ]),
          s(
            "input",
            {
              ref_key: "fileInput",
              ref: m,
              type: "file",
              name: "image",
              multiple: "",
              class: "upload--hidden",
              onChange: G,
            },
            null,
            544,
          ),
        ])
      );
    },
  },
  pe = { class: "form__field" },
  _e = {
    __name: "FormCreateFive",
    emits: ["formSubmitted", "formBack"],
    setup(o, { emit: i }) {
      const { Swal: d } = P(),
        e = i,
        v = $(),
        { paymentSummaryText: y } = ne(),
        { pendingGalleryItems: S } = E(),
        I = M({}),
        m = f(() => v.ad.gallery.length + S.value.length),
        r = f(() => m.value === 0),
        p = async (g) => {
          if (m.value === 0) {
            await d.fire({
              icon: "error",
              title: "Error",
              text: "Debes añadir al menos una imagen a tu anuncio.",
            });
            return;
          }
          e("formSubmitted", g);
        },
        x = async () => {
          e("formBack");
        };
      return (g, b) => (
        l(),
        H(
          h(W),
          {
            "validation-schema": h(I),
            class: "form form--create",
            onSubmit: p,
          },
          {
            default: D(() => [
              b[0] ||
                (b[0] = s(
                  "div",
                  { class: "form__field" },
                  [
                    s(
                      "h2",
                      { class: "form__title" },
                      "Añade imágenes a tu anuncio",
                    ),
                    s("div", { class: "form__description" }, [
                      s(
                        "p",
                        null,
                        " Las imágenes son clave para destacar tu anuncio. Elige fotos claras y relevantes que muestren lo que ofreces, con un tamaño mínimo de 750x420 píxeles para que se vean bien en todas las pantallas. ",
                      ),
                    ]),
                  ],
                  -1,
                )),
              s("div", pe, [u(me)]),
              u(
                te,
                {
                  percentage: 100,
                  "current-step": 5,
                  "total-steps": 5,
                  "show-steps": !0,
                  "summary-text": h(y),
                  "primary-label": "Continuar",
                  "primary-disabled": r.value,
                  onBack: x,
                },
                null,
                8,
                ["summary-text", "primary-disabled"],
              ),
            ]),
            _: 1,
          },
          8,
          ["validation-schema"],
        )
      );
    },
  },
  fe = { class: "page" },
  ge = { class: "create create--announcement" },
  be = { class: "create--announcement__container" },
  he = { class: "create--announcement__steps" },
  ve = { class: "step step--5" },
  Ae = J({
    __name: "galeria-de-imagenes",
    setup(o) {
      const i = Q(),
        d = oe(),
        e = $(),
        { $setSEO: v } = X();
      (v({
        title: "Crear Anuncio - Galería de Imágenes",
        description:
          "Sube las imágenes de tu producto para completar la publicación de tu anuncio en Waldo.click®.",
      }),
        Z({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        K(() => {
          (e.updateStep(5), d.stepView(5, "Image Gallery"));
        }));
      function y() {
        (e.updateStep(5), i.push("/anunciar/resumen"));
      }
      function S() {
        (e.updateStep(4), i.push("/anunciar/ficha-de-producto"));
      }
      return (I, m) => {
        const r = _e,
          p = ee;
        return (
          l(),
          c("div", fe, [
            u(Y),
            s("section", ge, [
              s("div", be, [
                u(p, null, {
                  default: D(() => [
                    s("div", he, [
                      s("div", ve, [
                        u(r, { onFormSubmitted: y, onFormBack: S }),
                      ]),
                    ]),
                  ]),
                  _: 1,
                }),
              ]),
            ]),
          ])
        );
      };
    },
  });
export { Ae as default };
//# sourceMappingURL=BPjShYaS.js.map

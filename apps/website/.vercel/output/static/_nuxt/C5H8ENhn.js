import {
  bM as N,
  bx as U,
  bu as $,
  bz as P,
  bc as T,
  bd as V,
  a_ as u,
  b5 as y,
  b1 as w,
  b0 as m,
  bF as R,
  bf as c,
  b6 as d,
  bg as q,
  a$ as i,
  bi as I,
  bh as j,
  b7 as x,
  bj as F,
  b9 as p,
  b8 as C,
  bk as W,
  aZ as k,
  bw as O,
  aY as H,
} from "./BK8sApmn.js";
import { R as L } from "./CeZ3CHNS.js";
import { M as Y } from "./DuRm081T.js";
import { C as Z } from "./DnzrZk1h.js";
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
    e = new s.Error().stack;
  e &&
    ((s._sentryDebugIds = s._sentryDebugIds || {}),
    (s._sentryDebugIds[e] = "57a3f1cf-0825-4590-97f9-1ef62c832336"),
    (s._sentryDebugIdIdentifier =
      "sentry-dbid-57a3f1cf-0825-4590-97f9-1ef62c832336"));
} catch {}
const G = { class: "form form--profile" },
  J = { class: "form-group" },
  K = { key: 0, class: "alert" },
  Q = ["disabled"],
  X = { key: 0 },
  ee = { key: 1 },
  ae = {
    __name: "FormUsername",
    setup(s) {
      const { Swal: e } = W(),
        r = C(!1),
        l = N(),
        n = U(),
        { $recaptcha: g } = $(),
        { fetchUser: D } = P(),
        h = n.value?.username || "",
        f = C({ username: h }),
        E = p(() => f.value.username !== h),
        b = p(() => {
          if (!n.value?.last_username_change) return !0;
          const a = new Date(n.value.last_username_change),
            o = new Date() - a;
          return Math.ceil(o / (1e3 * 60 * 60 * 24)) >= 90;
        }),
        v = p(() => {
          if (!n.value?.last_username_change) return 0;
          const a = new Date(n.value.last_username_change),
            o = new Date() - a,
            _ = Math.ceil(o / (1e3 * 60 * 60 * 24));
          return Math.max(90 - _, 0);
        }),
        S = T({
          username: V()
            .required("El nombre de usuario es requerido")
            .matches(
              /^[\w.]+$/,
              "Solo se permiten letras, números, puntos y guiones bajos",
            )
            .test(
              "reserved",
              "Este nombre de usuario no está disponible",
              (a) => !L.includes(a?.toLowerCase() ?? ""),
            ),
        }),
        z = (a) => {
          const t =
            a?.error?.message ||
            "Hubo un error al actualizar el nombre de usuario. Por favor, inténtalo de nuevo.";
          return t.includes("protected brand terms")
            ? "No puedes usar términos de marca protegidos en tu nombre de usuario. Por favor, elige otro nombre."
            : t;
        },
        A = async (a) => {
          if (!b.value) {
            e.fire(
              "Error",
              `Debes esperar ${v.value} días para poder cambiar tu nombre de usuario`,
              "error",
            );
            return;
          }
          if (
            (
              await e.fire({
                title: "¿Estás seguro?",
                html: `
      <p>Vas a cambiar tu nombre de usuario a: <strong>${a.username}</strong></p>
      <p>Ten en cuenta que después de este cambio, deberás esperar 90 días para poder modificarlo nuevamente.</p>
    `,
                icon: "warning",
                showCancelButton: !0,
                confirmButtonText: "Sí, cambiar nombre",
                cancelButtonText: "Cancelar",
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
              })
            ).isConfirmed
          ) {
            r.value = !0;
            try {
              const o = await g.execute("submit");
              (await l.saveUsername({ ...a, recaptchaToken: o }),
                await D(),
                e.fire({
                  text: "Nombre de usuario actualizado correctamente",
                  icon: "success",
                  confirmButtonText: "Aceptar",
                }));
            } catch (o) {
              e.fire("Error", z(o), "error");
            } finally {
              r.value = !1;
            }
          }
        };
      return (a, t) => {
        const o = R;
        return (
          u(),
          y(
            d(F),
            { "validation-schema": d(S), onSubmit: A },
            {
              default: w(({ errors: _, meta: B }) => [
                m(
                  o,
                  null,
                  {
                    default: w(() => [
                      c("div", G, [
                        c("div", J, [
                          t[1] ||
                            (t[1] = c(
                              "label",
                              { class: "form-label", for: "username" },
                              "Nombre de Usuario",
                              -1,
                            )),
                          m(
                            d(q),
                            {
                              modelValue: f.value.username,
                              "onUpdate:modelValue":
                                t[0] || (t[0] = (M) => (f.value.username = M)),
                              name: "username",
                              type: "text",
                              class: "form-control",
                              readonly: !b.value,
                            },
                            null,
                            8,
                            ["modelValue", "readonly"],
                          ),
                          b.value
                            ? (u(), y(d(j), { key: 1, name: "username" }))
                            : (u(),
                              i(
                                "span",
                                K,
                                " Debes esperar " +
                                  I(v.value) +
                                  " días para poder cambiar tu nombre de usuario nuevamente ",
                                1,
                              )),
                        ]),
                        c(
                          "button",
                          {
                            disabled:
                              !B.valid || r.value || !E.value || !b.value,
                            title: "Actualizar",
                            type: "submit",
                            class: "btn btn--block btn--buy",
                          },
                          [
                            r.value
                              ? x("", !0)
                              : (u(), i("span", X, "Actualizar")),
                            r.value
                              ? (u(), i("span", ee, "Actualizando..."))
                              : x("", !0),
                          ],
                          8,
                          Q,
                        ),
                      ]),
                    ]),
                    _: 2,
                  },
                  1024,
                ),
              ]),
              _: 1,
            },
            8,
            ["validation-schema"],
          )
        );
      };
    },
  },
  te = { class: "account account--edit" },
  se = { key: 0, class: "account--edit__form" },
  re = { key: 1, class: "account--edit__form" },
  ne = k({
    __name: "AccountUsername",
    setup(s) {
      const e = U(),
        r = p(() => e.value?.pro_status === "active");
      return (l, n) => (
        u(),
        i("section", te, [
          n[0] ||
            (n[0] = c(
              "div",
              { class: "account--edit__header" },
              [
                c(
                  "h1",
                  { class: "account--edit__title title" },
                  "Elige tu nombre de usuario",
                ),
                c("div", { class: "account--edit__text paragraph" }, [
                  c(
                    "p",
                    null,
                    " Tu nombre de usuario es tu identidad en Waldo.click®. Elige uno que sea fácil de recordar y que represente bien tu actividad o negocio. Recuerda que una vez que lo cambies, no podrás modificarlo por 90 días. ",
                  ),
                ]),
              ],
              -1,
            )),
          r.value
            ? (u(), i("div", se, [m(ae)]))
            : (u(),
              i("div", re, [
                m(
                  Y,
                  {
                    icon: d(Z),
                    text: "Personaliza tu nombre de usuario y construye tu marca personal con una cuenta PRO. Crea una identidad única y memorable para tus compradores potenciales.",
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
  oe = Object.assign(ne, { __name: "AccountUsername" }),
  ue = { class: "page" },
  me = k({
    __name: "username",
    setup(s) {
      const { $setSEO: e, $setStructuredData: r } = $(),
        l = H();
      return (
        e({
          title: "Personalizar Nombre de Usuario",
          description:
            "Personaliza tu nombre de usuario en Waldo.click®. Crea una identidad única y memorable para tu negocio.",
          imageUrl: `${l.public.baseUrl}/share.jpg`,
          url: `${l.public.baseUrl}/cuenta/username`,
        }),
        O({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
        r({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Personalizar Nombre de Usuario",
          url: `${l.public.baseUrl}/cuenta/username`,
          description:
            "Personaliza tu nombre de usuario en Waldo.click®. Crea una identidad única y memorable para tu negocio.",
        }),
        (n, g) => (u(), i("div", ue, [m(oe)]))
      );
    },
  });
export { me as default };
//# sourceMappingURL=C5H8ENhn.js.map

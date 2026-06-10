import {
  b3 as U,
  cT as K,
  bm as B,
  cP as b,
  bI as S,
  bR as H,
  a_ as l,
  a$ as c,
  bf as a,
  bn as z,
  bo as F,
  b7 as x,
  cU as O,
  b8 as v,
  bz as j,
  bx as q,
  bM as G,
  cO as J,
  b9 as y,
  bk as Q,
  b0 as R,
  b1 as W,
  b6 as X,
  br as Y,
  bs as Z,
  bi as ee,
} from "./BK8sApmn.js";
import { I as te, m as oe } from "./Cg1cJ9QQ.js";
import { u as se } from "./CMM48BjM.js";
import { u as ae } from "./CJzzMwWR.js";
import "./DeJqzbk_.js";
try {
  let u =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    _ = new u.Error().stack;
  _ &&
    ((u._sentryDebugIds = u._sentryDebugIds || {}),
    (u._sentryDebugIds[_] = "bca84cff-6100-4a7f-95c8-1cc8d0b2629b"),
    (u._sentryDebugIdIdentifier =
      "sentry-dbid-bca84cff-6100-4a7f-95c8-1cc8d0b2629b"));
} catch {}
const ne = { class: "form form--verify" },
  ie = { class: "form--verify__digits" },
  re = ["value", "autocomplete", "onInput", "onKeydown"],
  le = ["disabled"],
  ce = { key: 0 },
  ue = { key: 1 },
  de = {
    __name: "FormVerifyCode",
    setup(u, { expose: _ }) {
      const { Swal: d } = Q(),
        { logInfo: m } = se(),
        h = U(),
        { login: w } = ae(),
        p = K("pendingToken"),
        r = v(["", "", "", "", "", ""]),
        s = v([]),
        f = v(!1),
        I = v(!1),
        T = y(() => r.value.join("")),
        A = y(() => /^\d{6}$/.test(T.value)),
        $ = (t, e) => {
          t instanceof HTMLInputElement && (s.value[e] = t);
        },
        L = (t, e) => {
          const n = e.target,
            o = n.value.replace(/\D/g, "").slice(0, 1);
          ((r.value[t] = o),
            (n.value = o),
            o && t < 5 && s.value[t + 1]?.focus(),
            r.value.every((i) => i !== "") && D());
        },
        P = (t, e) => {
          if (e.key === "Backspace") {
            r.value[t] === "" && t > 0 && s.value[t - 1]?.focus();
            return;
          }
          if (e.key === "ArrowLeft") {
            (e.preventDefault(), t > 0 && s.value[t - 1]?.focus());
            return;
          }
          if (e.key === "ArrowRight") {
            (e.preventDefault(), t < 5 && s.value[t + 1]?.focus());
            return;
          }
          ["Delete", "Tab", "Home", "End"].includes(e.key) ||
            ((e.ctrlKey || e.metaKey) &&
              ["a", "c", "v", "x"].includes(e.key)) ||
            /^\d$/.test(e.key) ||
            e.preventDefault();
        },
        E = (t) => {
          t.preventDefault();
          const e = (t.clipboardData?.getData("text") ?? "")
            .replace(/\D/g, "")
            .slice(0, 6);
          for (let o = 0; o < 6; o++) r.value[o] = e[o] ?? "";
          const n = Math.min(e.length, 5);
          (s.value[n]?.focus(), e.length === 6 && D());
        },
        k = v(60);
      let g = null;
      const V = () => {
        ((k.value = 60),
          (g = O(() => {
            (k.value--, k.value <= 0 && (clearInterval(g), (g = null)));
          }, 1e3)));
      };
      (B(async () => {
        if (!p.value) {
          await b("/login", { replace: !0 });
          return;
        }
        (V(),
          S(() => {
            s.value[0]?.focus();
          }));
      }),
        H(() => {
          g && clearInterval(g);
        }));
      const D = async () => {
        f.value = !0;
        try {
          const t = await h("/auth/verify-code", {
              method: "POST",
              body: { pendingToken: p.value, code: T.value.trim() },
            }),
            { setToken: e, fetchUser: n } = j();
          if (
            (e(t.jwt),
            await n(),
            q().value?.role?.name?.toLowerCase() === "manager")
          ) {
            await b("/dashboard");
            return;
          }
          ((p.value = ""),
            m("User logged in successfully via 2-step verification."),
            w("email"));
          const i = G();
          i.reset();
          const M = await i.isProfileComplete(),
            C = J();
          if ((C.closeLoginLightbox(), !M)) {
            await b("/onboarding");
            return;
          }
          const N = C.getReferer || "/anuncios";
          (C.clearReferer(), await b(N));
        } catch (t) {
          const e = t?.data?.error?.message ?? t?.error?.message ?? "",
            n = e.includes("Maximum attempts") || e.includes("expired"),
            o = n
              ? "Demasiados intentos fallidos o código expirado. Por favor inicia sesión nuevamente."
              : "El código ingresado es incorrecto. Inténtalo de nuevo.";
          (d.fire("Error de verificación", o, "error"),
            n
              ? await b("/login")
              : ((r.value = ["", "", "", "", "", ""]),
                await S(),
                s.value[0]?.focus()));
        } finally {
          f.value = !1;
        }
      };
      return (
        _({
          handleResend: async () => {
            I.value = !0;
            try {
              (await h("/auth/resend-code", {
                method: "POST",
                body: { pendingToken: p.value },
              }),
                V());
            } catch (t) {
              const e =
                t?.data?.error?.message ??
                t?.error?.message ??
                "No se pudo reenviar el código. Inténtalo de nuevo.";
              d.fire("Error", e, "error");
            } finally {
              I.value = !1;
            }
          },
          resendCooldown: k,
          resending: I,
        }),
        (t, e) => (
          l(),
          c("div", ne, [
            e[0] ||
              (e[0] = a(
                "label",
                { class: "form--verify__label" },
                "Código de verificación",
                -1,
              )),
            a("div", ie, [
              (l(!0),
              c(
                z,
                null,
                F(
                  r.value,
                  (n, o) => (
                    l(),
                    c(
                      "input",
                      {
                        key: o,
                        ref_for: !0,
                        ref: (i) => $(i, o),
                        value: r.value[o],
                        type: "text",
                        inputmode: "numeric",
                        maxlength: "1",
                        autocomplete: o === 0 ? "one-time-code" : "off",
                        class: "form--verify__digits__input",
                        onInput: (i) => L(o, i),
                        onKeydown: (i) => P(o, i),
                        onPaste: E,
                      },
                      null,
                      40,
                      re,
                    )
                  ),
                ),
                128,
              )),
            ]),
            a(
              "button",
              {
                disabled: !A.value || f.value,
                type: "button",
                class: "btn btn--block btn--primary",
                onClick: D,
              },
              [
                f.value ? x("", !0) : (l(), c("span", ce, "Verificar")),
                f.value ? (l(), c("span", ue, "Verificando...")) : x("", !0),
              ],
              8,
              le,
            ),
          ])
        )
      );
    },
  },
  fe = { class: "page" },
  _e = { class: "auth" },
  pe = { class: "auth__introduce" },
  ve = { class: "auth__form" },
  me = { class: "auth__form__inner" },
  ge = ["src"],
  be = { class: "auth__form__fields" },
  ye = { class: "auth__form__help" },
  he = ["disabled"],
  we = { key: 0 },
  ke = { key: 1 },
  Ie = { key: 2 },
  De = "Accede y gestiona tus anuncios en waldo.click®",
  Ce = "Con tu cuenta en waldo.click® podrás:",
  $e = {
    __name: "verificar",
    setup(u) {
      const _ = [
          "Ver los datos de contacto de los anuncios.",
          "Publicar anuncios con nuestros planes disponibles.",
          "Disfrutar de hasta 3 anuncios gratis renovables.",
          "Recibir notificaciones de nuevos anuncios en tu correo periódicamente.",
        ],
        d = v(null),
        m = y(() => d.value?.resendCooldown ?? 60),
        h = y(() => (m.value ?? 0) > 0),
        w = y(() => d.value?.resending ?? !1),
        p = () => d.value?.handleResend();
      return (r, s) => {
        const f = Y;
        return (
          l(),
          c("div", fe, [
            a("div", _e, [
              a("div", pe, [R(te, { title: De, subtitle: Ce, list: _ })]),
              a("div", ve, [
                a("div", me, [
                  R(
                    f,
                    {
                      to: "/login",
                      class: "auth__form__back",
                      title: "Volver al inicio de sesión",
                    },
                    {
                      default: W(() => [
                        a(
                          "img",
                          {
                            loading: "lazy",
                            decoding: "async",
                            src: X(oe),
                            alt: "volver",
                            title: "volver",
                          },
                          null,
                          8,
                          ge,
                        ),
                        s[0] || (s[0] = a("span", null, "Volver", -1)),
                      ]),
                      _: 1,
                    },
                  ),
                  s[2] ||
                    (s[2] = a(
                      "h1",
                      { class: "auth__form__title title" },
                      "Verificación en dos pasos",
                      -1,
                    )),
                  s[3] ||
                    (s[3] = a(
                      "div",
                      { class: "auth__form__description" },
                      " Hemos enviado un código de 6 dígitos a tu correo electrónico. Ingrésalo a continuación para continuar. ",
                      -1,
                    )),
                  a("div", be, [
                    R(de, { ref_key: "formRef", ref: d }, null, 512),
                  ]),
                  a("div", ye, [
                    a("p", null, [
                      s[1] || (s[1] = Z(" ¿No recibiste el código? ", -1)),
                      a(
                        "button",
                        {
                          disabled: h.value || w.value,
                          type: "button",
                          class: "auth__form__help__link",
                          onClick: p,
                        },
                        [
                          m.value > 0
                            ? (l(),
                              c(
                                "span",
                                we,
                                "Reenviar en " + ee(m.value) + "s",
                                1,
                              ))
                            : w.value
                              ? (l(), c("span", ke, "Reenviando..."))
                              : (l(),
                                c("span", Ie, "Haz clic aquí para reenviarlo")),
                        ],
                        8,
                        he,
                      ),
                    ]),
                  ]),
                ]),
              ]),
            ]),
          ])
        );
      };
    },
  };
export { $e as default };
//# sourceMappingURL=C1ALILnG.js.map

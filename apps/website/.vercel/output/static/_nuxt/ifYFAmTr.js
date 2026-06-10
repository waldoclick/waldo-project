import {
  aZ as k,
  bw as C,
  c$ as I,
  cT as R,
  b3 as x,
  bm as D,
  bR as N,
  a_ as i,
  a$ as l,
  bf as e,
  b0 as _,
  b1 as V,
  b6 as f,
  br as E,
  bs as d,
  bi as b,
  b8 as v,
  cU as S,
  bk as T,
} from "./BK8sApmn.js";
import { I as A, m as B } from "./Cg1cJ9QQ.js";
import "./DeJqzbk_.js";
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
    a = new n.Error().stack;
  a &&
    ((n._sentryDebugIds = n._sentryDebugIds || {}),
    (n._sentryDebugIds[a] = "4224a449-5968-4e07-8353-c3c5ae1b1fad"),
    (n._sentryDebugIdIdentifier =
      "sentry-dbid-4224a449-5968-4e07-8353-c3c5ae1b1fad"));
} catch {}
const z = { class: "page" },
  H = { class: "auth" },
  M = { class: "auth__introduce" },
  P = { class: "auth__form" },
  U = { class: "auth__form__inner" },
  $ = ["src"],
  j = { class: "auth__form__description" },
  L = { class: "auth__form__help" },
  O = ["disabled"],
  Z = { key: 0 },
  q = { key: 1 },
  F = { key: 2 },
  G = "Crea tu cuenta en waldo.click®",
  J = "Con tu cuenta en waldo.click® podrás:",
  X = k({
    __name: "confirmar",
    setup(n) {
      C({ meta: [{ name: "robots", content: "noindex, nofollow" }] });
      const a = [
          "Ver los datos de contacto de los anuncios.",
          "Publicar anuncios con nuestros planes disponibles.",
          "Disfrutar de hasta 3 anuncios gratis renovables.",
          "Recibir notificaciones de nuevos anuncios en tu correo periódicamente.",
        ],
        m = I(),
        c = R("registrationEmail", () => ""),
        p = x(),
        { Swal: h } = T(),
        o = v(60),
        r = v(!1);
      let s = null;
      const u = () => {
        ((o.value = 60),
          (s = S(() => {
            (o.value--, o.value <= 0 && (clearInterval(s), (s = null)));
          }, 1e3)));
      };
      (D(() => {
        if (!c.value) {
          m.replace("/registro");
          return;
        }
        u();
      }),
        N(() => {
          s && clearInterval(s);
        }));
      const y = async () => {
        r.value = !0;
        try {
          (await p("/auth/send-email-confirmation", {
            method: "POST",
            body: { email: c.value },
          }),
            u());
        } catch {
          h.fire(
            "Error",
            "No se pudo reenviar el correo. Inténtalo de nuevo.",
            "error",
          );
        } finally {
          r.value = !1;
        }
      };
      return (g, t) => {
        const w = E;
        return (
          i(),
          l("div", z, [
            e("div", H, [
              e("div", M, [_(A, { title: G, subtitle: J, list: a })]),
              e("div", P, [
                e("div", U, [
                  _(
                    w,
                    {
                      to: "/registro",
                      class: "auth__form__back",
                      title: "Volver al registro",
                    },
                    {
                      default: V(() => [
                        e(
                          "img",
                          {
                            loading: "lazy",
                            decoding: "async",
                            src: f(B),
                            alt: "volver",
                            title: "volver",
                          },
                          null,
                          8,
                          $,
                        ),
                        t[0] || (t[0] = e("span", null, "Volver", -1)),
                      ]),
                      _: 1,
                    },
                  ),
                  t[4] ||
                    (t[4] = e(
                      "h1",
                      { class: "auth__form__title title" },
                      " Confirma tu correo electrónico ",
                      -1,
                    )),
                  e("div", j, [
                    t[1] ||
                      (t[1] = d(
                        " Hemos enviado un enlace de confirmación a ",
                        -1,
                      )),
                    e("strong", null, b(f(c)), 1),
                    t[2] ||
                      (t[2] = d(
                        ". Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta. ",
                        -1,
                      )),
                  ]),
                  e("div", L, [
                    e("p", null, [
                      t[3] || (t[3] = d(" ¿No recibiste el correo? ", -1)),
                      e(
                        "button",
                        {
                          disabled: o.value > 0 || r.value,
                          type: "button",
                          class: "auth__form__help__link",
                          onClick: y,
                        },
                        [
                          o.value > 0
                            ? (i(),
                              l(
                                "span",
                                Z,
                                "Reenviar en " + b(o.value) + "s",
                                1,
                              ))
                            : r.value
                              ? (i(), l("span", q, "Reenviando..."))
                              : (i(), l("span", F, "Reenviar enlace")),
                        ],
                        8,
                        O,
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
  });
export { X as default };
//# sourceMappingURL=ifYFAmTr.js.map

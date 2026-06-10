import {
  aZ as u,
  bw as l,
  c_ as f,
  b3 as d,
  b4 as m,
  bm as b,
  cP as _,
  a_ as p,
  a$ as y,
  b0 as w,
  cN as h,
  bk as v,
  ba as g,
} from "./BK8sApmn.js";
try {
  let e =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    a = new e.Error().stack;
  a &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[a] = "f898950a-6a74-42ce-85bf-8af22e506bae"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-f898950a-6a74-42ce-85bf-8af22e506bae"));
} catch {}
const k = { class: "page page--provider" },
  x = u({
    __name: "activar",
    async setup(e) {
      let a, o;
      l({ meta: [{ name: "robots", content: "noindex, nofollow" }] });
      const i = f(),
        s = d(),
        { Swal: t } = v(),
        r = i.query.confirmation,
        { data: c } =
          (([a, o] = m(async () =>
            g(
              "activar-email-confirmation",
              async () => {
                if (!r) return { error: !0 };
                try {
                  return (
                    await s(`/auth/email-confirmation?confirmation=${r}`, {
                      method: "GET",
                    })
                  )?.resent
                    ? { resent: !0 }
                    : { ok: !0 };
                } catch {
                  return { error: !0 };
                }
              },
              { default: () => ({ error: !0 }) },
            ),
          )),
          (a = await a),
          o(),
          a);
      return (
        b(async () => {
          const n = c.value;
          (n && "ok" in n
            ? await t.fire(
                "¡Cuenta confirmada!",
                "Tu correo electrónico ha sido verificado. Ya puedes iniciar sesión.",
                "success",
              )
            : n && "resent" in n
              ? await t.fire(
                  "Te hemos enviado un nuevo correo",
                  "El enlace anterior ya había sido utilizado. Revisa tu correo electrónico para confirmar tu cuenta.",
                  "info",
                )
              : await t.fire(
                  "Enlace inválido",
                  "El enlace es inválido o ha expirado. Solicita un nuevo correo de confirmación.",
                  "error",
                ),
            await _("/login"));
        }),
        (n, E) => (p(), y("div", k, [w(h)]))
      );
    },
  });
export { x as default };
//# sourceMappingURL=CDjFWUKz.js.map

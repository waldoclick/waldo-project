try {
  let e =
      "undefined" != typeof global
        ? global
        : "undefined" != typeof globalThis
          ? globalThis
          : "undefined" != typeof self
            ? self
            : {},
    t = new e.Error().stack;
  t &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[t] = "6a4acd09-3201-48d8-b7e5-304dd47675af"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-6a4acd09-3201-48d8-b7e5-304dd47675af"));
} catch (e) {}
import { d as e, r as t, c as o, u as r, e as s } from "../../nitro/nitro.mjs";
import "@unocss/core";
import "@unocss/preset-wind3";
import "devalue";
import "node:crypto";
import "consola";
import "node:http";
import "node:https";
import "node:events";
import "node:buffer";
import "lru-cache";
import "node:fs";
import "node:path";
import "@sentry/core";
import "vue";
import "xss";
import "unhead/server";
import "unhead/plugins";
import "unhead/utils";
import "vue-bundle-renderer/runtime";
import "vue/server-renderer";
import "node:url";
import "ipx";
const a = e(async (e) => {
  try {
    const a = await t(e),
      { username: n, password: d } = a;
    if (!n || !d)
      throw o({
        statusCode: 400,
        statusMessage: "Usuario y contraseña son requeridos",
      });
    const i = r(),
      c = i.devUsername,
      u = i.devPassword;
    if (n === c && d === u) {
      const t = crypto.randomUUID();
      return (
        console.log("🍪 Estableciendo cookie devmode:", t),
        s(e, "devmode", t, {
          maxAge: 604800,
          httpOnly: !1,
          secure: !0,
          sameSite: "strict",
          path: "/",
        }),
        console.log("✅ Cookie establecida correctamente"),
        { success: !0, message: "Autenticación exitosa" }
      );
    }
    throw o({ statusCode: 401, statusMessage: "Credenciales incorrectas" });
  } catch (e) {
    if (e.statusCode) throw e;
    throw o({ statusCode: 500, statusMessage: "Error interno del servidor" });
  }
});
export { a as default };
//# sourceMappingURL=dev-login.post.mjs.map

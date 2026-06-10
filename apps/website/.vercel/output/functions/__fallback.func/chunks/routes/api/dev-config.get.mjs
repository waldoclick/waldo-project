try {
  let e =
      "undefined" != typeof global
        ? global
        : "undefined" != typeof globalThis
          ? globalThis
          : "undefined" != typeof self
            ? self
            : {},
    r = new e.Error().stack;
  r &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[r] = "b9f4ac86-1cb0-4b04-a9bd-b5ad9047aa46"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-b9f4ac86-1cb0-4b04-a9bd-b5ad9047aa46"));
} catch (e) {}
import { d as e, u as r } from "../../nitro/nitro.mjs";
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
const t = e(async (e) => {
  const t = r();
  return {
    devMode: t.public.devMode,
    devUsername: t.devUsername ? "CONFIGURADO" : "NO CONFIGURADO",
    devPassword: t.devPassword ? "CONFIGURADO" : "NO CONFIGURADO",
    timestamp: new Date().toISOString(),
  };
});
export { t as default };
//# sourceMappingURL=dev-config.get.mjs.map

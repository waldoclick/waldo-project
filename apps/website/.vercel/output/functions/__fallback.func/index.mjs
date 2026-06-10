import e from "node:process";
globalThis._importMeta_ = { url: import.meta.url, env: e.env };
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
    (e._sentryDebugIds[r] = "14f00958-92f8-40fb-a106-58c32a16b025"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-14f00958-92f8-40fb-a106-58c32a16b025"));
} catch (e) {}
export { aI as default } from "./chunks/nitro/nitro.mjs";
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
//# sourceMappingURL=index.mjs.map

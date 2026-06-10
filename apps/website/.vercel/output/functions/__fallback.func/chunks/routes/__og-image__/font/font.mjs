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
    (e._sentryDebugIds[r] = "509aab46-335a-418a-9bb4-a98debcd38e5"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-509aab46-335a-418a-9bb4-a98debcd38e5"));
} catch (e) {}
import { d as e } from "../../../nitro/nitro.mjs";
import { f as r } from "../../../_/eventHandlers.mjs";
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
import "unhead";
const t = e(r);
export { t as default };
//# sourceMappingURL=font.mjs.map

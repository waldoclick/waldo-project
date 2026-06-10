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
    (e._sentryDebugIds[r] = "bab8f93e-0835-4d20-9557-7fe3ae5f3493"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-bab8f93e-0835-4d20-9557-7fe3ae5f3493"));
} catch (e) {}
import { d as e, u as r, g as o, b as t } from "../../../nitro/nitro.mjs";
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
const n = e(async (e) => {
  var n;
  const s =
      (null == (n = e.node.req.url) ? void 0 : n.replace("/api/images/", "")) ||
      "",
    i = `${r().public.apiUrl}/uploads/${s}`,
    p = o(e),
    a = new URLSearchParams(p);
  a.has("format") || a.set("format", "webp");
  const d = a.toString(),
    l = d ? `${i}?${d}` : `${i}?format=webp`,
    m = {
      "Cache-Control": "no-cache",
      "Access-Control-Allow-Origin": process.env.BASE_URL || "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    };
  return t(e, l, { headers: m });
});
export { n as default };
//# sourceMappingURL=_..._.mjs.map

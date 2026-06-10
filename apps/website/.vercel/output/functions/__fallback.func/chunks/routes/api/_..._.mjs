try {
  let e =
      "undefined" != typeof global
        ? global
        : "undefined" != typeof globalThis
          ? globalThis
          : "undefined" != typeof self
            ? self
            : {},
    o = new e.Error().stack;
  o &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[o] = "f9827866-dae1-41e0-a3b9-a2c735aa86f1"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-f9827866-dae1-41e0-a3b9-a2c735aa86f1"));
} catch (e) {}
import {
  d as e,
  u as o,
  g as t,
  s as r,
  i as n,
  a,
  v as s,
  p as c,
  b as i,
} from "../../nitro/nitro.mjs";
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
const l = e(async (e) => {
  var l, p;
  const d = o(e),
    u = process.env.API_URL || "http://localhost:1337",
    m = process.env.BASE_URL || "http://localhost:3000",
    h = (null == (l = e.node.req.url) ? void 0 : l.replace("/api/", "")) || "";
  if (
    [
      "connect/google",
      "connect/google/callback",
      "connect/facebook",
      "connect/facebook/callback",
    ].some((e) => h.startsWith(e))
  ) {
    const o = `${u}/api/${h}`,
      n = t(e);
    h.includes("connect/google") &&
      ((n.frontend_url = m),
      (n.redirect_url = `${m}/api/connect/google/callback`));
    const a = new URLSearchParams(n).toString();
    return r(e, a ? `${o}?${a}` : o, 302);
  }
  if (d.recaptchaEnabled && n(h, null != (p = e.method) ? p : "")) {
    const o = a(e, "x-recaptcha-token");
    await s(o, d.recaptchaSecretKey);
  }
  const f = `${u}/api/${h}`,
    b = {
      "Access-Control-Allow-Origin": process.env.BASE_URL || "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
    g = a(e, "authorization");
  g && (b.Authorization = g);
  const y = a(e, "content-type");
  y && (b["Content-Type"] = y);
  const v = c(e).waldo_jwt;
  return (v && (b.Cookie = `waldo_jwt=${v}`), i(e, f, { headers: b }));
});
export { l as default };
//# sourceMappingURL=_..._.mjs.map

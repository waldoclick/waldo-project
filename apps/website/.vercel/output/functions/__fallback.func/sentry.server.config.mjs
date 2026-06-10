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
    t = new e.Error().stack;
  t &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[t] = "55ec01ec-c2cd-4281-8195-65dcd73a2e88"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-55ec01ec-c2cd-4281-8195-65dcd73a2e88"));
} catch (e) {}
import { u as t } from "./chunks/nitro/nitro.mjs";
import * as n from "node:path";
import {
  applySdkMetadata as r,
  getGlobalScope as o,
  vercelWaitUntil as i,
  debug as s,
  flush as u,
} from "@sentry/core";
import {
  init as a,
  getDefaultIntegrations as c,
  httpIntegration as l,
} from "@sentry/node";
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
import "vue";
import "xss";
import "unhead/server";
import "unhead/plugins";
import "unhead/utils";
import "vue-bundle-renderer/runtime";
import "vue/server-renderer";
import "node:url";
import "ipx";
const d = "undefined" == typeof __SENTRY_DEBUG__ || __SENTRY_DEBUG__;
function getNuxtDefaultIntegrations(e) {
  return [
    ...c(e).filter((e) => "Http" !== e.name),
    l({
      instrumentation: {
        responseHook: () => {
          i(
            (async function () {
              try {
                (d && s.log("Flushing events..."),
                  await u(2e3),
                  d && s.log("Done flushing events"));
              } catch (e) {
                d && s.log("Error while flushing events:\n", e);
              }
            })(),
          );
        },
      },
    }),
  ];
}
const p = t();
!(function (e) {
  const t = { ...e, defaultIntegrations: getNuxtDefaultIntegrations(e) };
  r(t, "nuxt", ["nuxt", "node"]);
  const i = a(t);
  (o().addEventProcessor(
    (function (e) {
      return Object.assign(
        (t) => {
          if ("transaction" !== t.type || !t.transaction) return t;
          return /\/:[^(/\s]*(\([^)]*\))?[^/\s]*/.test(t.transaction)
            ? t
            : n.extname(t.transaction)
              ? (e.debug &&
                  d &&
                  s.log(
                    "NuxtLowQualityTransactionsFilter filtered transaction: ",
                    t.transaction,
                  ),
                null)
              : t;
        },
        { id: "NuxtLowQualityTransactionsFilter" },
      );
    })(e),
  ),
    o().addEventProcessor(
      (function (e) {
        return Object.assign(
          (t) => {
            const n = t.exception?.values?.[0]?.value;
            return n?.match(
              /^ENOENT: no such file or directory, open '.*\/_nuxt\/.*\.js\.map'/,
            )
              ? (e.debug &&
                  d &&
                  s.log("NuxtClientSourceMapErrorFilter filtered error: ", n),
                null)
              : t;
          },
          { id: "NuxtClientSourceMapErrorFilter" },
        );
      })(e),
    ));
})({
  dsn: p.public.sentryDsn,
  environment: "production",
  tracesSampleRate: 1,
  profilesSampleRate: 1,
  debug: p.public.sentryDebug,
});
//# sourceMappingURL=sentry.server.config.mjs.map

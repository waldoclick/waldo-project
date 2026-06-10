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
    (e._sentryDebugIds[t] = "e1f18ddb-074c-46db-8f6e-c774a0f645ab"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-e1f18ddb-074c-46db-8f6e-c774a0f645ab"));
} catch (e) {}
import {
  getRequestDependencies as e,
  getPreloadLinks as t,
  getPrefetchLinks as r,
} from "vue-bundle-renderer/runtime";
import {
  j as s,
  k as o,
  l as n,
  m as a,
  n as d,
  o as i,
  q as u,
  t as l,
  w as p,
  x as c,
  y as h,
  z as m,
  A as f,
  B as y,
  C as b,
  D as g,
  E as _,
  F as x,
  G as T,
  N as A,
} from "../nitro/nitro.mjs";
import { stringify as C, uneval as w } from "devalue";
import { propsToString as R, renderSSRHead as j } from "unhead/server";
import "@unocss/core";
import "@unocss/preset-wind3";
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
import "unhead/plugins";
import "unhead/utils";
import "vue/server-renderer";
import "node:url";
import "ipx";
function renderPayloadJsonScript(e) {
  const t = {
    type: "application/json",
    innerHTML: e.data
      ? C(e.data, e.ssrContext["~payloadReducers"]).replaceAll("/", "\\u002F")
      : "",
    "data-nuxt-data": s,
    "data-ssr": !e.ssrContext.noSSR,
    id: "__NUXT_DATA__",
  };
  e.src && (t["data-src"] = e.src);
  return [
    t,
    {
      innerHTML: `window.__NUXT__={};window.__NUXT__.config=${w(e.ssrContext.config)}`,
    },
  ];
}
const k = { omitLineBreaks: !0 },
  v = [];
((globalThis.__buildAssetsURL = n), (globalThis.__publicAssetsURL = a));
const S = !!i.id,
  $ = S ? `<${d}${R(i)}>` : "",
  P = S ? `</${d}>` : "",
  D = o((s) => {
    const o = s.path.startsWith("/__nuxt_error") ? u(s) : null;
    if (o && !("__unenv__" in s.node.req))
      throw l({
        status: 404,
        statusText: "Page Not Found: /__nuxt_error",
        message: "Page Not Found: /__nuxt_error",
      });
    return (async function (s, o) {
      const n = T(),
        a = p(s),
        d = { mode: "server" };
      if ((a.head.push(c, d), o)) {
        const e = o.status || o.statusCode;
        if (
          (e && (o.status = o.statusCode = Number.parseInt(e)),
          "string" == typeof o.data)
        )
          try {
            o.data = h(o.data);
          } catch {}
        m(a, o);
      }
      const u = f(s);
      !1 === u.ssr && (a.noSSR = !0);
      a.noSSR;
      const l = await y(a);
      for (const e of v) a.modules.add(e);
      const A = await l.renderToString(a).catch(async (e) => {
          if (
            (a["~renderResponse"] || a._renderResponse) &&
            "skipping render" === e.message
          )
            return {};
          const t = (!o && a.payload?.error) || e;
          throw (await a.nuxt?.hooks.callHook("app:error", t), t);
        }),
        C =
          a["~renderResponse"] || a._renderResponse
            ? []
            : await b(a.modules ?? []);
      if (
        (await a.nuxt?.hooks.callHook("app:rendered", {
          ssrContext: a,
          renderResult: A,
        }),
        a["~renderResponse"] || a._renderResponse)
      )
        return a["~renderResponse"] || a._renderResponse;
      if (a.payload?.error && !o) throw a.payload.error;
      const w = u.noScripts,
        { styles: R, scripts: D } = e(a, l.rendererContext);
      C.length && a.head.push({ style: C });
      const H = [];
      for (const e of Object.values(R))
        H.push({
          rel: "stylesheet",
          href: l.rendererContext.buildAssetsURL(e.file),
          crossorigin: "",
        });
      H.length && a.head.push({ link: H }, d);
      if (!w) {
        if (a["~lazyHydratedModules"])
          for (const e of a["~lazyHydratedModules"]) a.modules?.delete(e);
        (a.head.push({ link: t(a, l.rendererContext) }, d),
          a.head.push({ link: r(a, l.rendererContext) }, d),
          a.head.push(
            {
              script: renderPayloadJsonScript({
                ssrContext: a,
                data: a.payload,
              }),
            },
            { ...d, tagPosition: "bodyClose", tagPriority: "high" },
          ));
      }
      if (!u.noScripts) {
        const e = "head";
        a.head.push(
          {
            script: Object.values(D).map((t) => ({
              type: t.module ? "module" : null,
              src: l.rendererContext.buildAssetsURL(t.file),
              defer: !t.module || null,
              tagPosition: e,
              crossorigin: "",
            })),
          },
          d,
        );
      }
      const {
          headTags: L,
          bodyTags: N,
          bodyTagsOpen: M,
          htmlAttrs: U,
          bodyAttrs: z,
        } = await j(a.head, k),
        I = {
          htmlAttrs: U ? [U] : [],
          head: normalizeChunks([L]),
          bodyAttrs: z ? [z] : [],
          bodyPrepend: normalizeChunks([M, a.teleports?.body]),
          body: [
            g(a, A.html),
            $ + (S ? joinTags([a.teleports?.[`#${i.id}`]]) : "") + P,
          ],
          bodyAppend: [N],
        };
      return (
        await n.hooks.callHook("render:html", I, { event: s }),
        {
          body: renderHTMLDocument(I),
          statusCode: x(s),
          statusMessage: _(s),
          headers: {
            "content-type": "text/html;charset=utf-8",
            "x-powered-by": "Nuxt",
          },
        }
      );
    })(s, o);
  });
function normalizeChunks(e) {
  const t = [];
  for (const r of e) {
    const e = r?.trim();
    e && t.push(e);
  }
  return t;
}
function joinTags(e) {
  return e.join("");
}
function joinAttrs(e) {
  return 0 === e.length ? "" : " " + e.join(" ");
}
function renderHTMLDocument(e) {
  return `<!DOCTYPE html><html${joinAttrs(e.htmlAttrs)}><head>${joinTags(e.head)}</head><body${joinAttrs(e.bodyAttrs)}>${joinTags(e.bodyPrepend)}${joinTags(e.body)}${joinTags(e.bodyAppend)}</body></html>`;
}
export { D as default };
//# sourceMappingURL=renderer.mjs.map

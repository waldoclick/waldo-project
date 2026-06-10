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
    (e._sentryDebugIds[t] = "46a15ac6-de68-423a-83ba-9609990803a6"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-46a15ac6-de68-423a-83ba-9609990803a6"));
} catch (e) {}
import {
  aC as e,
  aD as t,
  J as s,
  aE as r,
  Y as o,
  M as i,
  aF as a,
  L as n,
  a2 as p,
  P as l,
  aG as c,
  O as d,
  aH as h,
} from "../nitro/nitro.mjs";
import { a as f, l as m } from "./eventHandlers.mjs";
import { html as u } from "satori-html";
import y from "image-size";
import { createConsola as g } from "consola";
import "@unocss/core";
import "@unocss/preset-wind3";
import "devalue";
import "node:crypto";
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
const w = { instance: void 0 },
  v = { instance: void 0 },
  b = { instance: void 0 };
async function useSatori() {
  return (
    (b.instance =
      b.instance || (await import("./node2.mjs").then((e) => e.default))),
    await b.instance.initWasmPromise,
    b.instance.satori
  );
}
function walkSatoriTree(e, t, s) {
  const r = [];
  if (!t.props?.children || !Array.isArray(t.props.children)) return r;
  if (0 === t.props.children.length) return (delete t.props.children, r);
  for (const o of t.props.children || [])
    if (o) {
      for (const t of s.flat()) t.filter(o) && r.push(t.transform(o, e));
      r.push(...walkSatoriTree(e, o, s));
    }
  return r;
}
const S = [
  {
    filter: (e) => !!e.props?.class && !e.props?.tw,
    transform(e) {
      ((e.props.tw = e.props.class),
        (e.props.tw = e.props.tw.replace(/icon|inline-style/g, "")));
    },
  },
  {
    filter: (e) => !!e.props?.style?.display,
    transform(e) {
      ["inline-block", "inline"].includes(e.props.style.display) &&
        delete e.props.style.display;
    },
  },
];
function isEmojiFilter(e) {
  return "svg" === e.type && void 0 !== e.props?.["data-emoji"];
}
const x = [
    {
      filter: (e) =>
        ["div", "p"].includes(e.type) &&
        Array.isArray(e.props?.children) &&
        e.props.children.some(isEmojiFilter),
      transform: (e) => {
        ((e.props.style = e.props.style || {}),
          (e.props.style.display = "flex"),
          (e.props.style.alignItems = "center"),
          (e.props.children = e.props.children.map((e) =>
            "string" == typeof e
              ? { type: "div", props: { children: e } }
              : (e.props.class?.includes("emoji") && delete e.props.class, e),
          )));
      },
    },
  ],
  j = [
    {
      filter: (e) => e.props?.["data-v-inspector"],
      transform: (e) => {
        delete e.props["data-v-inspector"];
      },
    },
    {
      filter: (e) => "string" == typeof e.props?.children,
      transform: (t) => {
        t.props.children = e(t.props.children);
      },
    },
  ],
  k = ["div", "p", "ul", "ol", "li", "blockquote", "pre", "hr", "table", "dl"],
  $ = [
    "span",
    "a",
    "b",
    "i",
    "u",
    "em",
    "strong",
    "code",
    "abbr",
    "del",
    "ins",
    "mark",
    "sub",
    "sup",
    "small",
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
  ],
  I = {
    filter: (e) =>
      [...$, "div"].includes(e.type) &&
      Array.isArray(e.props?.children) &&
      e.props?.children.length >= 1 &&
      !e.props?.class?.includes("hidden"),
    transform: (e) => {
      if (
        ((e.props.style = e.props.style || {}),
        e.props.style?.display && "flex" !== e.props.style?.display)
      )
        return;
      if (
        "div" === e.type &&
        ((e.props.style.display = "flex"),
        !e.props?.class?.includes("flex-") &&
          Array.isArray(e.props.children) &&
          e.props.children.some((e) => k.includes(e.type)))
      )
        return void (e.props.style.flexDirection = "column");
      let t = e.props?.class?.includes("flex-wrap");
      (e.props?.class?.includes("flex-") ||
        ((e.props.style.flexWrap = "wrap"), (t = !0)),
        t && !e.props?.class?.includes("gap") && (e.props.style.gap = "0.2em"));
    },
  },
  P = [
    {
      filter: (e) => "img" === e.type && e.props?.src,
      transform: async (
        i,
        { e: a, publicStoragePath: n, runtimeConfig: p },
      ) => {
        let l = i.props.src;
        const c = l.startsWith("/");
        let d, h;
        if (
          (l.endsWith(".webp") &&
            t.warn(
              "Using WebP images with Satori is not supported. Please consider switching image format or use the chromium renderer.",
              l,
            ),
          c)
        ) {
          if (
            (h ||
              ((h = await a
                .$fetch(l, { responseType: "arrayBuffer" })
                .catch(() => {})),
              h ||
                (h = await a
                  .$fetch(l, { baseURL: s(a), responseType: "arrayBuffer" })
                  .catch(() => {}))),
            h)
          ) {
            const e = h instanceof ArrayBuffer ? h : h.buffer;
            i.props.src = r(e);
          }
        } else
          l.startsWith("data:") ||
            ((l = e(l)),
            (i.props.src = l),
            (h = await $fetch(l, { responseType: "arrayBuffer" }).catch(
              () => {},
            )));
        if (h && (!i.props.width || !i.props.height)) {
          try {
            const e = y(h);
            d = { width: e.width, height: e.height };
          } catch {}
          if (d?.width && d?.height) {
            const e = d.width / d.height;
            i.props.width && !i.props.height
              ? (i.props.height = Math.round(i.props.width / e))
              : i.props.height && !i.props.width
                ? (i.props.width = Math.round(i.props.height * e))
                : i.props.width ||
                  i.props.height ||
                  ((i.props.width = d.width), (i.props.height = d.height));
          }
        }
        if ("string" == typeof i.props.src && i.props.src.startsWith("/"))
          if (h) {
            const e = h instanceof ArrayBuffer ? h : h.buffer;
            i.props.src = r(e);
          } else i.props.src = `${o(l, `${s(a)}`)}?${Date.now()}`;
      },
    },
    {
      filter: (e) => e.props?.style?.backgroundImage?.includes("url("),
      transform: async (
        e,
        { e: t, publicStoragePath: r, runtimeConfig: i },
      ) => {
        const a = e.props.style.backgroundImage
            .replace(/^url\(['"]?/, "")
            .replace(/['"]?\)$/, ""),
          n = a?.startsWith("/");
        n &&
          (e.props.style.backgroundImage = `url(${o(a, `${s(t)}`)}?${Date.now()})`);
      },
    },
  ],
  W = [
    {
      filter: (e) => "span" === e.type && e.props?.class?.includes("iconify"),
      transform: (e, t) => {},
    },
    {
      filter: (e) => "svg" === e.type && e.props?.class?.includes("iconify"),
      transform: (e) => {
        e.props.class = String(e.props.class)
          .split(" ")
          .filter((e) => !e.startsWith("iconify"))
          .join(" ");
      },
    },
  ];
function safeSplit(e) {
  const [t, s] = e.split(":");
  return [String(t || "").trim(), String(s || "").trim()];
}
const T = {
  filter: (e) => !!e.props?.class,
  transform: async (e, t) => {
    const s = e.props.class || "",
      r = e.props.style || {},
      o = new Set();
    for (const e of s.split(" ").filter((e) => e.trim())) {
      const s = await t.unocss.parseToken(e);
      if (s) {
        const t = String(s?.[0]?.[2])
            .split(";")
            .filter((e) => !!e?.trim()),
          i = {
            "--color-gray-50": "249 250 251",
            "--color-gray-100": "243 244 246",
            "--color-gray-200": "229 231 235",
            "--color-gray-300": "209 213 219",
            "--color-gray-400": "156 163 175",
            "--color-gray-500": "107 114 128",
            "--color-gray-600": "75 85 99",
            "--color-gray-700": "55 65 81",
            "--color-gray-800": "31 41 55",
            "--color-gray-900": "17 24 39",
            "--color-gray-950": "3 7 18",
          };
        (t
          .filter((e) => e.startsWith("--"))
          .forEach((e) => {
            const [t, s] = safeSplit(e);
            i[t] = s;
          }),
          t
            .filter((e) => !e.startsWith("--"))
            .forEach((e) => {
              const [t, s] = safeSplit(e),
                o = t.replace(/-([a-z])/g, (e, t) => t.toUpperCase());
              if (
                (r[o] ||
                  (r[o] = s.replace(/var\((.*?)\)/g, (e, t) => i[t.trim()])),
                r[o] && r[o].includes("/"))
              ) {
                const [e, t] = r[o].split("/");
                e &&
                  t &&
                  ("1)" === t.trim()
                    ? (r[o] = e.replace(
                        /(\d+) (\d+) (\d+).*/,
                        (e, t, s, r) => `${t}, ${s}, ${r})`,
                      ))
                    : (r[o] =
                        `${e.replace("rgb", "rgba").replaceAll(" ", ", ")}${t.trim()}`));
              }
            }),
          o.add(e));
      }
    }
    ((e.props.class = s
      .split(" ")
      .filter((e) => !o.has(e))
      .join(" ")),
      (e.props.tw = s
        .split(" ")
        .filter((e) => !o.has(e))
        .join(" ")),
      (e.props.style = r));
  },
};
async function applyInlineCss(e, t) {
  const { e: s } = e;
  let r = t.html,
    o =
      t.head.style
        ?.map((e) => e.innerHTML)
        .filter(Boolean)
        .join("\n") || "";
  const i =
    t.head.link?.filter(
      (t) =>
        t.href.startsWith("/_nuxt/components") &&
        t.href.replaceAll("/", "").includes(e.options.component),
    ) || [];
  if (!i.length) return !1;
  if (!o.trim().length) return !1;
  const a = await (async function () {
    return (
      (w.instance =
        w.instance || (await import("./empty.mjs").then((e) => e.default))),
      await w.instance.initWasmPromise,
      w.instance.cssInline
    );
  })();
  if (!a || a?.__mock__) {
    if (i.length) {
      g()
        .withTag("Nuxt OG Image")
        .warn(
          "To have inline styles applied you need to install either the `@css-inline/css-inline` or `@css-inline/css-inline-wasm` package.",
        );
    }
    return !1;
  }
  r = a.inline(t.html, { loadRemoteStylesheets: !1, extraCss: o });
  const n = o.match(/\.([\w-]+)/g)?.map((e) => e.replace(".", ""));
  return (
    n && (r = r.replace(new RegExp(`class="(${n.join("|")})"`, "g"), "")),
    (t.html = r),
    !0
  );
}
async function createVNodes(e) {
  let t = e.options.html;
  if (!t) {
    const s = await i(
      e.e,
      e.options.component,
      void 0 !== e.options.props ? e.options.props : e.options,
    );
    ((s.html = a(s.html)),
      await applyInlineCss(e, s),
      await f(e, s),
      (t = s.html),
      t?.includes("<body>") &&
        (t = t.match(/<body>([\s\S]*)<\/body>/)?.[1] || ""));
  }
  const s = `<div style="position: relative; display: flex; margin: 0 auto; width: ${e.options.width}px; height: ${e.options.height}px; overflow: hidden;">${t}</div>`,
    r = u(s);
  return (
    walkSatoriTree(e, r, [x, S, I, j, W]),
    await Promise.all(walkSatoriTree(e, r, [T, P])),
    r
  );
}
const A = {};
async function resolveFonts(e) {
  const { fonts: t } = n(),
    s = d([...(e.options.fonts || []), ...t]),
    r = [],
    o = [];
  if (h)
    for (const t of s)
      (await h.hasItem(t.cacheKey))
        ? ((t.data = (await h.getItemRaw(t.cacheKey)) || void 0), o.push(t))
        : (A[t.cacheKey] ||
            (A[t.cacheKey] = m(e, t).then(
              async (e) => (
                e?.data && (await h?.setItemRaw(e.cacheKey, e.data)),
                e
              ),
            )),
          r.push(A[t.cacheKey]));
  const i = await Promise.all(r);
  return [...o, ...i].map((e) => ({
    name: e.name,
    data: e.data,
    style: e.style,
    weight: Number(e.weight),
  }));
}
async function createSvg(e) {
  const { options: t } = e,
    { satoriOptions: s } = n(),
    [r, o, i] = await Promise.all([
      useSatori(),
      createVNodes(e),
      resolveFonts(e),
    ]);
  await e._nitro.hooks.callHook("nuxt-og-image:satori:vnodes", o, e);
  return r(
    o,
    p(t.satori, s, {
      fonts: i,
      tailwindConfig: { theme: l },
      embedFont: !0,
      width: t.width,
      height: t.height,
    }),
  ).catch((t) => c(e.e, t));
}
async function createPng(e) {
  const { resvgOptions: t } = n(),
    s = await createSvg(e);
  if (!s) throw new Error("Failed to create SVG");
  return new (await (async function () {
    return (
      (v.instance =
        v.instance || (await import("./node.mjs").then((e) => e.default))),
      await v.instance.initWasmPromise,
      v.instance.Resvg
    );
  })())(s, p(e.options.resvg, t))
    .render()
    .asPng();
}
const _ = {
  name: "satori",
  supportedFormats: ["png", "jpeg", "jpg", "json"],
  async createImage(e) {
    switch (e.extension) {
      case "png":
        return createPng(e);
      case "jpeg":
      case "jpg":
        return (async function (e) {
          const { sharpOptions: t } = n();
          return (
            console.error(
              "Sharp dependency is not accessible. Please check you have it installed and are using a compatible runtime. Falling back to png.",
            ),
            createPng(e)
          );
        })(e);
    }
  },
  async debug(e) {
    const [t, s] = await Promise.all([createVNodes(e), createSvg(e)]);
    return { vnodes: t, svg: s };
  },
};
export { createSvg, _ as default };
//# sourceMappingURL=renderer.mjs.map

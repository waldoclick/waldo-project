import {
  bD as A,
  a_ as t,
  a$ as n,
  b0 as c,
  b1 as D,
  b6 as f,
  bF as T,
  bf as d,
  b7 as w,
  bn as F,
  bo as H,
  bi as R,
  b8 as L,
  b9 as s,
  bt as S,
  aZ as I,
  d7 as B,
  cx as E,
  b2 as M,
  bE as W,
  bG as h,
} from "./BK8sApmn.js";
import { F as X } from "./BSW603Mu.js";
import { F as z, L as Z } from "./DJPzpk2M.js";
import { L as j } from "./D6ORICL5.js";
try {
  let a =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    e = new a.Error().stack;
  e &&
    ((a._sentryDebugIds = a._sentryDebugIds || {}),
    (a._sentryDebugIds[e] = "8bac19a5-55f6-4b81-ad54-9870b84575c6"),
    (a._sentryDebugIdIdentifier =
      "sentry-dbid-8bac19a5-55f6-4b81-ad54-9870b84575c6"));
} catch {}
const N = A("share-2", [
    ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }],
    ["circle", { cx: "6", cy: "12", r: "3", key: "w7nqdw" }],
    ["circle", { cx: "18", cy: "19", r: "3", key: "1xt0gg" }],
    [
      "line",
      { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49", key: "47mynk" },
    ],
    [
      "line",
      { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49", key: "1n3mei" },
    ],
  ]),
  O = { class: "gallery gallery--default" },
  V = { key: 0, class: "gallery--default__main" },
  q = ["src"],
  G = { key: 1, class: "gallery--default__thumbnails" },
  P = ["onClick"],
  J = ["src"],
  K = { key: 0, class: "gallery--default__image--count" },
  fe = {
    __name: "GalleryDefault",
    props: { media: { type: Array, default: () => [] } },
    setup(a) {
      const e = a,
        { transformUrl: r } = S(),
        m = L(0),
        p = L(!1),
        _ = s(() => e.media[0] || null),
        l = s(() => (Array.isArray(e.media) ? e.media.slice(1, 4) : [])),
        g = s(() => Array.isArray(e.media) && e.media.length > 0),
        y = s(() => l.value.length > 0),
        b = s(() => {
          if (!_.value) return "";
          const o = _.value.formats.large?.url || _.value.url;
          return r(o);
        }),
        k = s(() =>
          l.value.map((o) => {
            const i = o.formats.medium?.url || o.url;
            return r(i);
          }),
        ),
        u = s(() =>
          Array.isArray(e.media)
            ? e.media.map((o) => {
                const i = o.formats.large?.url || o.url;
                return r(i);
              })
            : [],
        ),
        x = s(() => (e.media.length > 4 ? e.media.length - 4 : 0)),
        $ = (o) => {
          ((m.value = o), (p.value = !0));
        };
      return (o, i) => {
        const U = T;
        return (
          t(),
          n("div", O, [
            c(U, null, {
              default: D(() => [
                c(
                  f(X),
                  {
                    visible: p.value,
                    imgs: u.value,
                    index: m.value,
                    "move-disabled": !0,
                    onHide: i[0] || (i[0] = (C) => (p.value = !1)),
                  },
                  null,
                  8,
                  ["visible", "imgs", "index"],
                ),
              ]),
              _: 1,
            }),
            g.value
              ? (t(),
                n("div", V, [
                  d(
                    "div",
                    {
                      class: "gallery--default__image",
                      onClick: i[1] || (i[1] = (C) => $(0)),
                    },
                    [
                      d(
                        "img",
                        {
                          loading: "lazy",
                          decoding: "async",
                          src: b.value,
                          alt: "Imagen principal",
                          title: "Imagen principal",
                        },
                        null,
                        8,
                        q,
                      ),
                    ],
                  ),
                ]))
              : w("", !0),
            y.value
              ? (t(),
                n("div", G, [
                  (t(!0),
                  n(
                    F,
                    null,
                    H(
                      k.value,
                      (C, v) => (
                        t(),
                        n(
                          "div",
                          {
                            key: v,
                            class: "gallery--default__image",
                            onClick: (de) => $(v + 1),
                          },
                          [
                            d(
                              "img",
                              {
                                loading: "lazy",
                                decoding: "async",
                                src: C,
                                alt: "Imagen secundaria",
                                title: "Imagen secundaria",
                              },
                              null,
                              8,
                              J,
                            ),
                            v === 2 && x.value > 0
                              ? (t(),
                                n(
                                  "span",
                                  K,
                                  " +" + R(x.value) + " imágenes ",
                                  1,
                                ))
                              : w("", !0),
                          ],
                          8,
                          P,
                        )
                      ),
                    ),
                    128,
                  )),
                ]))
              : w("", !0),
          ])
        );
      };
    },
  },
  Q = {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  },
  Y = I({
    name: "IconX",
    __name: "IconX",
    setup(a) {
      return (e, r) => (
        t(),
        n("svg", Q, [
          ...(r[0] ||
            (r[0] = [
              d(
                "path",
                {
                  d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
                  fill: "currentColor",
                },
                null,
                -1,
              ),
            ])),
        ])
      );
    },
  }),
  ee = Object.assign(Y, { __name: "IconsIconX" }),
  te = {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  },
  ne = I({
    name: "IconWhatsApp",
    __name: "IconWhatsApp",
    setup(a) {
      return (e, r) => (
        t(),
        n("svg", te, [
          ...(r[0] ||
            (r[0] = [
              d(
                "path",
                {
                  d: "M20.4054 3.4875C18.1607 1.2375 15.1714 0 11.9946 0C5.4375 0 0.101786 5.33571 0.101786 11.8929C0.101786 13.9875 0.648214 16.0339 1.6875 17.8393L0 24L6.30536 22.3446C8.04107 23.2875 9.99643 23.7857 11.9893 23.7857H11.9946C18.5464 23.7857 24 18.45 24 11.8929C24 8.71607 22.65 5.7375 20.4054 3.4875ZM11.9946 21.7875C10.2161 21.7875 8.475 21.3107 6.95893 20.4107L6.6 20.1964L2.86071 21.1768L3.85714 17.5286L3.62143 17.1536C2.63036 15.5786 2.10536 13.7625 2.10536 11.8929C2.10536 6.44464 6.54643 2.00357 12 2.00357C14.6411 2.00357 17.1214 3.0375 18.9857 4.90714C20.85 6.77679 21.9964 9.25714 21.9911 11.8929C21.9911 17.3464 17.4429 21.7875 11.9946 21.7875ZM17.4161 14.3839C17.1321 14.2393 15.6643 13.5214 15.4018 13.4304C15.1393 13.3339 14.9464 13.2857 14.7536 13.575C14.5607 13.8643 13.9929 14.5339 13.8214 14.7321C13.6554 14.925 13.4839 14.9518 13.2 14.8071C11.3839 13.8991 10.2054 13.1893 9.02143 11.1375C8.7375 10.6607 9.33214 10.6929 9.88393 9.58929C9.975 9.39643 9.92679 9.22500 9.85179 9.08036C9.77679 8.93571 9.19821 7.46786 8.95714 6.89464C8.72143 6.33751 8.48036 6.42321 8.30357 6.41250C8.1375 6.40179 7.94464 6.40179 7.75179 6.40179C7.55893 6.40179 7.24821 6.47679 6.98571 6.76071C6.72321 7.04464 5.95714 7.76786 5.95714 9.23571C5.95714 10.7036 7.02857 12.1179 7.165 12.3107C7.30714 12.5036 9.19286 15.4071 12.0804 16.7036C14.1214 17.6357 14.8607 17.7054 15.8036 17.5554C16.3607 17.4643 17.5554 16.8268 17.7964 16.1571C18.0375 15.4875 18.0375 14.9143 17.9625 14.7857C17.8929 14.6464 17.7 14.5714 17.4161 14.3839Z",
                  fill: "currentColor",
                },
                null,
                -1,
              ),
            ])),
        ])
      );
    },
  }),
  ae = Object.assign(ne, { __name: "IconsIconWhatsApp" }),
  re = { class: "share share--default" },
  se = ["href"],
  oe = ["href"],
  le = ["href"],
  ie = ["href"],
  ce = "https://waldo.click",
  ue = I({
    __name: "ShareDefault",
    props: { url: {}, title: {} },
    setup(a) {
      const e = a,
        { copy: r } = B(),
        m = E(),
        p = M(),
        _ = s(() => (e.url ? e.url : `${ce}${p.fullPath}`)),
        l = s(() => _.value),
        g = s(() => e.title || ""),
        y = async () => {
          if (!(typeof window > "u"))
            try {
              (await r(l.value), m.success("¡Enlace copiado al portapapeles!"));
            } catch {
              m.error("Error al copiar el enlace");
            }
        };
      return (b, k) => {
        const u = W("tooltip");
        return (
          t(),
          n("div", re, [
            d("span", null, [c(f(N))]),
            h(
              (t(),
              n(
                "a",
                {
                  href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(l.value)}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                [c(f(z))],
                8,
                se,
              )),
              [[u, "Compartir en Facebook"]],
            ),
            h(
              (t(),
              n(
                "a",
                {
                  href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(l.value)}&text=${encodeURIComponent(g.value)}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                [c(ee)],
                8,
                oe,
              )),
              [[u, "Compartir en X (Twitter)"]],
            ),
            h(
              (t(),
              n(
                "a",
                {
                  href: `https://wa.me/?text=${encodeURIComponent(g.value + " " + l.value)}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                [c(ae)],
                8,
                le,
              )),
              [[u, "Compartir en WhatsApp"]],
            ),
            h(
              (t(),
              n(
                "a",
                {
                  href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(l.value)}`,
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
                [c(f(Z))],
                8,
                ie,
              )),
              [[u, "Compartir en LinkedIn"]],
            ),
            h((t(), n("button", { onClick: y }, [c(f(j))])), [
              [u, "Copiar enlace"],
            ]),
          ])
        );
      };
    },
  }),
  ge = Object.assign(ue, { __name: "ShareDefault" });
export { ge as S, fe as _ };
//# sourceMappingURL=MqP1_NXX.js.map

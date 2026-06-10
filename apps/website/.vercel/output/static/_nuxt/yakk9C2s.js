import {
  aZ as C,
  a_ as i,
  a$ as d,
  b0 as c,
  bF as x,
  b1 as w,
  b6 as _,
  bf as u,
  bn as D,
  bo as $,
  bC as U,
  b8 as y,
  b9 as A,
  bO as B,
  bQ as E,
  bt as F,
} from "./BK8sApmn.js";
import { F as N } from "./BSW603Mu.js";
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
    s = new a.Error().stack;
  s &&
    ((a._sentryDebugIds = a._sentryDebugIds || {}),
    (a._sentryDebugIds[s] = "99ede0f9-b54d-452e-979d-3461419455c4"),
    (a._sentryDebugIdIdentifier =
      "sentry-dbid-99ede0f9-b54d-452e-979d-3461419455c4"));
} catch {}
const P = { class: "gallery gallery--dashboard" },
  z = ["onClick"],
  G = ["src", "alt", "onClick"],
  O = C({
    __name: "GalleryDashboard",
    props: {
      images: { type: Array, required: !0, default: () => [] },
      altPrefix: { type: String, default: "Imagen" },
      columns: { type: Number, default: 4 },
    },
    emits: ["image-click", "image-delete"],
    setup(a, { emit: s }) {
      const b = a,
        m = s,
        { transformUrl: g } = F(),
        f = y(0),
        r = y(!1),
        o = A(() =>
          Array.isArray(b.images)
            ? b.images.map((e) => {
                const t = e?.formats?.large?.url || e?.url || "";
                return g(t);
              })
            : [],
        ),
        h = (e) => {
          if (!e) return "";
          const t = e.formats?.thumbnail?.url || e.url;
          return t ? g(t) : "";
        },
        p = (e) => {
          if ((m("image-click", e), o.value.length === 0)) return;
          const t = e >= 0 && e < o.value.length ? e : 0;
          ((f.value = t), (r.value = !0));
        },
        v = (e, t) => {
          m("image-delete", { image: e, index: t });
        };
      return (e, t) => {
        const k = x;
        return (
          i(),
          d("div", P, [
            c(k, null, {
              default: w(() => [
                c(
                  _(N),
                  {
                    visible: r.value,
                    imgs: o.value,
                    index: f.value,
                    "move-disabled": !0,
                    onHide: t[0] || (t[0] = (l) => (r.value = !1)),
                  },
                  null,
                  8,
                  ["visible", "imgs", "index"],
                ),
              ]),
              _: 1,
            }),
            u(
              "div",
              {
                class: U([
                  "gallery--dashboard__container",
                  `gallery--dashboard__container--cols-${a.columns}`,
                ]),
              },
              [
                (i(!0),
                d(
                  D,
                  null,
                  $(
                    a.images,
                    (l, n) => (
                      i(),
                      d(
                        "div",
                        { key: l.id ?? n, class: "gallery--dashboard__item" },
                        [
                          u(
                            "button",
                            {
                              type: "button",
                              class: "gallery--dashboard__delete",
                              "aria-label": "Eliminar imagen",
                              onClick: B((I) => v(l, n), ["stop"]),
                            },
                            [c(_(E), { stroke: "2", size: 16 })],
                            8,
                            z,
                          ),
                          u(
                            "img",
                            {
                              src: h(l),
                              alt: `${a.altPrefix} - Imagen ${n + 1}`,
                              class: "gallery--dashboard__image",
                              onClick: (I) => p(n),
                            },
                            null,
                            8,
                            G,
                          ),
                        ],
                      )
                    ),
                  ),
                  128,
                )),
              ],
              2,
            ),
          ])
        );
      };
    },
  }),
  j = Object.assign(O, { __name: "GalleryDashboard" });
export { j as _ };
//# sourceMappingURL=yakk9C2s.js.map

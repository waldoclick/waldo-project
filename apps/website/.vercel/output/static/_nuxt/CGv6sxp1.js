import { u as O, _ as W, a as j } from "./Bn4ou5Ry.js";
import { _ as Y, a as q } from "./BbtmlxJr.js";
import { _ as H } from "./C4RpNa5i.js";
import { _ as J } from "./BSFPidNw.js";
import {
  aZ as K,
  aY as Q,
  b3 as X,
  bb as ee,
  be as ae,
  a_ as i,
  a$ as u,
  bC as a,
  bf as c,
  b0 as l,
  b6 as d,
  b1 as _,
  bn as se,
  bo as te,
  b5 as C,
  b7 as v,
  bs as k,
  bi as y,
  b9 as g,
  b8 as T,
  bt as ne,
  bB as le,
} from "./BK8sApmn.js";
import { f as oe } from "./CjIigZ6h.js";
import { S as re } from "./BZT4iOTd.js";
import { E as ce } from "./DvfQSOKW.js";
import { E as ie } from "./C3iZdfbl.js";
try {
  let o =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    e = new o.Error().stack;
  e &&
    ((o._sentryDebugIds = o._sentryDebugIds || {}),
    (o._sentryDebugIds[e] = "c9de0c22-c134-4571-9f32-ad1c45a515f1"),
    (o._sentryDebugIdIdentifier =
      "sentry-dbid-c9de0c22-c134-4571-9f32-ad1c45a515f1"));
} catch {}
const ue = ["src", "alt"],
  de = ["onClick"],
  _e = ["href"],
  me = K({
    __name: "AdsTable",
    props: {
      endpoint: {},
      section: {},
      emptyMessage: { default: "No se encontraron anuncios" },
      showWebLink: { type: Boolean, default: !1 },
    },
    setup(o) {
      const e = o,
        { public: w } = Q(),
        S = w.websiteUrl,
        f = O(),
        x = X(),
        r = g(() => f[e.section]),
        z = g(() => ({ sortBy: r.value.sortBy, pageSize: r.value.pageSize })),
        B = (s) => {
          f.setFilters(e.section, s);
        },
        h = T([]),
        b = T(!1),
        $ = T(null),
        D = async () => {
          try {
            b.value = !0;
            const s = r.value,
              n = {
                pagination: { page: s.currentPage, pageSize: s.pageSize },
                sort: s.sortBy,
                populate: {
                  user: { fields: ["username"] },
                  gallery: { fields: ["url", "formats"] },
                },
              };
            s.searchTerm &&
              (n.filters = {
                $or: [
                  { name: { $containsi: s.searchTerm } },
                  { description: { $containsi: s.searchTerm } },
                  { "user.username": { $containsi: s.searchTerm } },
                  { "user.email": { $containsi: s.searchTerm } },
                ],
              });
            const m = await x(e.endpoint, { method: "GET", params: n });
            ((h.value = Array.isArray(m.data) ? m.data : []),
              ($.value = m.meta?.pagination ? m.meta.pagination : null));
          } catch {
            h.value = [];
          } finally {
            b.value = !1;
          }
        },
        A = g(() => h.value),
        P = g(() => $.value?.pageCount || 1),
        V = g(() => $.value?.total || 0),
        I = [
          { label: "Galería" },
          { label: "Anuncio" },
          { label: "Usuario" },
          { label: "Fecha" },
          { label: "Acciones", align: "right" },
        ],
        U = [
          { value: "createdAt:desc", label: "Más recientes" },
          { value: "createdAt:asc", label: "Más antiguos" },
          { value: "name:asc", label: "Título A-Z" },
          { value: "name:desc", label: "Título Z-A" },
        ],
        { transformUrl: E } = ne(),
        F = (s) => {
          if (!s) return "";
          const n = s.formats?.thumbnail?.url || s.url;
          return n ? E(n) : "";
        },
        M = ee(),
        N = (s) => {
          M.push(`/dashboard/ads/${s}`);
        };
      return (
        ae(
          [
            () => r.value.searchTerm,
            () => r.value.sortBy,
            () => r.value.pageSize,
            () => r.value.currentPage,
          ],
          () => {
            D();
          },
          { immediate: !0 },
        ),
        (s, n) => {
          const m = W,
            L = j,
            p = q,
            R = Y,
            Z = H,
            G = J;
          return (
            i(),
            u(
              "section",
              { class: a(["ads", `ads--${e.section}`]) },
              [
                c(
                  "div",
                  { class: a(`ads--${e.section}__container`) },
                  [
                    c(
                      "div",
                      { class: a(`ads--${e.section}__header`) },
                      [
                        l(
                          m,
                          {
                            "model-value": r.value.searchTerm,
                            placeholder: "Buscar anuncios...",
                            class: a(`ads--${e.section}__search`),
                            "onUpdate:modelValue":
                              n[0] ||
                              (n[0] = (t) => d(f).setSearchTerm(e.section, t)),
                          },
                          null,
                          8,
                          ["model-value", "class"],
                        ),
                        l(
                          L,
                          {
                            "model-value": z.value,
                            "sort-options": U,
                            "page-sizes": [10, 25, 50, 100],
                            class: a(`ads--${e.section}__filters`),
                            "onUpdate:modelValue": B,
                          },
                          null,
                          8,
                          ["model-value", "class"],
                        ),
                      ],
                      2,
                    ),
                    c(
                      "div",
                      { class: a(`ads--${e.section}__table-wrapper`) },
                      [
                        l(
                          Z,
                          { columns: I },
                          {
                            default: _(() => [
                              (i(!0),
                              u(
                                se,
                                null,
                                te(
                                  A.value,
                                  (t) => (
                                    i(),
                                    C(
                                      R,
                                      { key: t.id },
                                      {
                                        default: _(() => [
                                          l(
                                            p,
                                            null,
                                            {
                                              default: _(() => [
                                                c(
                                                  "div",
                                                  {
                                                    class: a(
                                                      `ads--${e.section}__gallery`,
                                                    ),
                                                  },
                                                  [
                                                    t.gallery &&
                                                    t.gallery.length > 0 &&
                                                    t.gallery[0]
                                                      ? (i(),
                                                        u(
                                                          "img",
                                                          {
                                                            key: 0,
                                                            src: F(
                                                              t.gallery[0],
                                                            ),
                                                            alt: t.name,
                                                            class: a(
                                                              `ads--${e.section}__gallery__image`,
                                                            ),
                                                          },
                                                          null,
                                                          10,
                                                          ue,
                                                        ))
                                                      : (i(),
                                                        u(
                                                          "span",
                                                          {
                                                            key: 1,
                                                            class: a(
                                                              `ads--${e.section}__gallery__placeholder`,
                                                            ),
                                                          },
                                                          "-",
                                                          2,
                                                        )),
                                                  ],
                                                  2,
                                                ),
                                              ]),
                                              _: 2,
                                            },
                                            1024,
                                          ),
                                          l(
                                            p,
                                            null,
                                            {
                                              default: _(() => [
                                                c(
                                                  "div",
                                                  {
                                                    class: a(
                                                      `ads--${e.section}__name`,
                                                    ),
                                                  },
                                                  [
                                                    t.featured
                                                      ? (i(),
                                                        C(
                                                          d(re),
                                                          {
                                                            key: 0,
                                                            class: a(
                                                              `ads--${e.section}__featured-icon`,
                                                            ),
                                                            size: 14,
                                                            fill: "#ffd699",
                                                            color: "#ffd699",
                                                          },
                                                          null,
                                                          8,
                                                          ["class"],
                                                        ))
                                                      : v("", !0),
                                                    k(y(t.name), 1),
                                                  ],
                                                  2,
                                                ),
                                              ]),
                                              _: 2,
                                            },
                                            1024,
                                          ),
                                          l(
                                            p,
                                            null,
                                            {
                                              default: _(() => [
                                                c(
                                                  "div",
                                                  {
                                                    class: a(
                                                      `ads--${e.section}__user`,
                                                    ),
                                                  },
                                                  y(t.user?.username || "-"),
                                                  3,
                                                ),
                                              ]),
                                              _: 2,
                                            },
                                            1024,
                                          ),
                                          l(
                                            p,
                                            null,
                                            {
                                              default: _(() => [
                                                k(y(d(oe)(t.createdAt)), 1),
                                              ]),
                                              _: 2,
                                            },
                                            1024,
                                          ),
                                          l(
                                            p,
                                            { align: "right" },
                                            {
                                              default: _(() => [
                                                c(
                                                  "div",
                                                  {
                                                    class: a(
                                                      `ads--${e.section}__actions`,
                                                    ),
                                                  },
                                                  [
                                                    c(
                                                      "button",
                                                      {
                                                        class: a(
                                                          `ads--${e.section}__action`,
                                                        ),
                                                        title: "Ver anuncio",
                                                        onClick: (pe) =>
                                                          N(t.id),
                                                      },
                                                      [
                                                        l(
                                                          d(ce),
                                                          {
                                                            class: a(
                                                              `ads--${e.section}__action__icon`,
                                                            ),
                                                          },
                                                          null,
                                                          8,
                                                          ["class"],
                                                        ),
                                                      ],
                                                      10,
                                                      de,
                                                    ),
                                                    o.showWebLink && t.slug
                                                      ? (i(),
                                                        u(
                                                          "a",
                                                          {
                                                            key: 0,
                                                            href: `${d(S)}/anuncios/${t.slug}`,
                                                            class: a(
                                                              `ads--${e.section}__action`,
                                                            ),
                                                            target: "_blank",
                                                            rel: "noopener noreferrer",
                                                            title: "Ver en web",
                                                          },
                                                          [
                                                            l(
                                                              d(ie),
                                                              {
                                                                class: a(
                                                                  `ads--${e.section}__action__icon`,
                                                                ),
                                                              },
                                                              null,
                                                              8,
                                                              ["class"],
                                                            ),
                                                          ],
                                                          10,
                                                          _e,
                                                        ))
                                                      : v("", !0),
                                                  ],
                                                  2,
                                                ),
                                              ]),
                                              _: 2,
                                            },
                                            1024,
                                          ),
                                        ]),
                                        _: 2,
                                      },
                                      1024,
                                    )
                                  ),
                                ),
                                128,
                              )),
                            ]),
                            _: 1,
                          },
                        ),
                        A.value.length === 0 && !b.value
                          ? (i(),
                            u(
                              "div",
                              { key: 0, class: a(`ads--${e.section}__empty`) },
                              [c("p", null, y(o.emptyMessage), 1)],
                              2,
                            ))
                          : v("", !0),
                        b.value
                          ? (i(),
                            u(
                              "div",
                              {
                                key: 1,
                                class: a(`ads--${e.section}__loading`),
                              },
                              [
                                ...(n[2] ||
                                  (n[2] = [
                                    c("p", null, "Cargando anuncios...", -1),
                                  ])),
                              ],
                              2,
                            ))
                          : v("", !0),
                      ],
                      2,
                    ),
                    l(
                      G,
                      {
                        "current-page": r.value.currentPage,
                        "total-pages": P.value,
                        "total-records": V.value,
                        "page-size": r.value.pageSize,
                        class: a(`ads--${e.section}__pagination`),
                        onPageChange:
                          n[1] ||
                          (n[1] = (t) => d(f).setCurrentPage(e.section, t)),
                      },
                      null,
                      8,
                      [
                        "current-page",
                        "total-pages",
                        "total-records",
                        "page-size",
                        "class",
                      ],
                    ),
                  ],
                  2,
                ),
              ],
              2,
            )
          );
        }
      );
    },
  }),
  Ce = Object.assign(le(me, [["__scopeId", "data-v-30a47867"]]), {
    __name: "AdsTable",
  });
export { Ce as A };
//# sourceMappingURL=CGv6sxp1.js.map

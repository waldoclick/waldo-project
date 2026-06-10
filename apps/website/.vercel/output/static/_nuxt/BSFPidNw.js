import {
  bD as b,
  aZ as y,
  a_ as i,
  a$ as o,
  bf as r,
  bi as l,
  bC as u,
  b0 as c,
  b6 as d,
  bn as f,
  bo as m,
  b7 as k,
  b9 as g,
} from "./BK8sApmn.js";
import { C as v } from "./CNKn_OHC.js";
try {
  let t =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    e = new t.Error().stack;
  e &&
    ((t._sentryDebugIds = t._sentryDebugIds || {}),
    (t._sentryDebugIds[e] = "57ac1242-fb8d-4e1c-9c5c-1271af1f12ef"),
    (t._sentryDebugIdIdentifier =
      "sentry-dbid-57ac1242-fb8d-4e1c-9c5c-1271af1f12ef"));
} catch {}
const C = b("chevron-left", [["path", { d: "m15 18-6-6 6-6", key: "1wnfg3" }]]);
const R = b("ellipsis", [
    ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
    ["circle", { cx: "19", cy: "12", r: "1", key: "1wjl8i" }],
    ["circle", { cx: "5", cy: "12", r: "1", key: "1pcz8c" }],
  ]),
  D = { class: "pagination pagination--default" },
  w = { class: "pagination--default__info" },
  x = { key: 0 },
  z = { key: 1 },
  S = { key: 0, class: "pagination--default__controls" },
  $ = ["disabled"],
  I = { key: 0, class: "pagination--default__ellipsis" },
  V = ["onClick"],
  N = ["disabled"],
  B = y({
    __name: "PaginationDefault",
    props: { currentPage: {}, totalPages: {}, totalRecords: {}, pageSize: {} },
    emits: ["pageChange"],
    setup(t) {
      const e = t,
        p = g(() =>
          !e.totalRecords || !e.pageSize
            ? 0
            : (e.currentPage - 1) * e.pageSize + 1,
        ),
        _ = g(() => {
          if (!e.totalRecords || !e.pageSize) return 0;
          const n = e.currentPage * e.pageSize;
          return n > e.totalRecords ? e.totalRecords : n;
        }),
        P = g(() => {
          if (e.totalPages <= 1) return [];
          const n = [];
          if (e.totalPages <= 5)
            for (let a = 1; a <= e.totalPages; a++) n.push(a);
          else if (e.currentPage <= 3) {
            for (let a = 1; a <= 4; a++) n.push(a);
            (n.push("ellipsis"), n.push(e.totalPages));
          } else if (e.currentPage >= e.totalPages - 2) {
            (n.push(1), n.push("ellipsis"));
            for (let a = e.totalPages - 3; a <= e.totalPages; a++) n.push(a);
          } else {
            (n.push(1), n.push("ellipsis"));
            for (let a = e.currentPage - 1; a <= e.currentPage + 1; a++)
              n.push(a);
            (n.push("ellipsis"), n.push(e.totalPages));
          }
          return n;
        });
      return (n, s) => (
        i(),
        o("div", D, [
          r("div", w, [
            t.totalRecords !== void 0
              ? (i(),
                o(
                  "span",
                  x,
                  " Mostrando " +
                    l(p.value) +
                    " - " +
                    l(_.value) +
                    " de " +
                    l(t.totalRecords) +
                    " registros ",
                  1,
                ))
              : (i(),
                o(
                  "span",
                  z,
                  " Página " + l(t.currentPage) + " de " + l(t.totalPages),
                  1,
                )),
          ]),
          t.totalPages > 1
            ? (i(),
              o("div", S, [
                r(
                  "button",
                  {
                    class: u([
                      "pagination--default__button",
                      {
                        "pagination--default__button--disabled":
                          t.currentPage === 1,
                      },
                    ]),
                    disabled: t.currentPage === 1,
                    onClick:
                      s[0] ||
                      (s[0] = (a) => n.$emit("pageChange", t.currentPage - 1)),
                  },
                  [
                    c(d(C), { class: "pagination--default__button__icon" }),
                    s[2] ||
                      (s[2] = r(
                        "span",
                        { class: "pagination--default__button__text" },
                        "Anterior",
                        -1,
                      )),
                  ],
                  10,
                  $,
                ),
                (i(!0),
                o(
                  f,
                  null,
                  m(
                    P.value,
                    (a, h) => (
                      i(),
                      o(
                        f,
                        { key: h },
                        [
                          a === "ellipsis"
                            ? (i(),
                              o("div", I, [
                                c(d(R), {
                                  class: "pagination--default__ellipsis__icon",
                                }),
                              ]))
                            : (i(),
                              o(
                                "button",
                                {
                                  key: 1,
                                  class: u([
                                    "pagination--default__button pagination--default__button--page",
                                    {
                                      "pagination--default__button--active":
                                        t.currentPage === a,
                                    },
                                  ]),
                                  onClick: (E) => n.$emit("pageChange", a),
                                },
                                l(a),
                                11,
                                V,
                              )),
                        ],
                        64,
                      )
                    ),
                  ),
                  128,
                )),
                r(
                  "button",
                  {
                    class: u([
                      "pagination--default__button",
                      {
                        "pagination--default__button--disabled":
                          t.currentPage === t.totalPages,
                      },
                    ]),
                    disabled: t.currentPage === t.totalPages,
                    onClick:
                      s[1] ||
                      (s[1] = (a) => n.$emit("pageChange", t.currentPage + 1)),
                  },
                  [
                    s[3] ||
                      (s[3] = r(
                        "span",
                        { class: "pagination--default__button__text" },
                        "Siguiente",
                        -1,
                      )),
                    c(d(v), { class: "pagination--default__button__icon" }),
                  ],
                  10,
                  N,
                ),
              ]))
            : k("", !0),
        ])
      );
    },
  }),
  T = Object.assign(B, { __name: "PaginationDefault" });
export { T as _ };
//# sourceMappingURL=BSFPidNw.js.map

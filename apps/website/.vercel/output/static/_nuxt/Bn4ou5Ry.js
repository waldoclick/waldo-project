import {
  bD as ye,
  aZ as E,
  a_ as g,
  a$ as p,
  bf as m,
  b0 as k,
  b6 as w,
  bP as Se,
  bQ as me,
  b7 as F,
  bm as _e,
  bR as Be,
  bi as I,
  bO as j,
  bn as R,
  bo as T,
  b8 as t,
  b9 as a,
  bC as q,
  bJ as be,
} from "./BK8sApmn.js";
import { C as x } from "./DmUMncXv.js";
import { L as ze } from "./Cwrq1rl2.js";
try {
  let e =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    u = new e.Error().stack;
  u &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[u] = "3a40cf77-526e-43f3-96df-87862ddd5975"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-3a40cf77-526e-43f3-96df-87862ddd5975"));
} catch {}
const he = ye("arrow-up-down", [
    ["path", { d: "m21 16-4 4-4-4", key: "f6ql7i" }],
    ["path", { d: "M17 20V4", key: "1ejh1v" }],
    ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
    ["path", { d: "M7 4v16", key: "1glfcx" }],
  ]),
  ke = { class: "search search--dashboard" },
  we = { class: "search--dashboard__wrapper" },
  Fe = ["value", "placeholder"],
  Ce = E({
    __name: "SearchDashboard",
    props: { modelValue: {}, placeholder: {} },
    emits: ["update:modelValue"],
    setup(e) {
      return (u, n) => (
        g(),
        p("div", ke, [
          m("div", we, [
            k(w(Se), { class: "search--dashboard__icon" }),
            m(
              "input",
              {
                value: e.modelValue,
                placeholder: e.placeholder,
                maxlength: "40",
                class: "search--dashboard__input",
                onInput:
                  n[0] ||
                  (n[0] = (v) =>
                    u.$emit("update:modelValue", v.target.value.slice(0, 40))),
              },
              null,
              40,
              Fe,
            ),
            e.modelValue
              ? (g(),
                p(
                  "button",
                  {
                    key: 0,
                    type: "button",
                    class: "search--dashboard__clear",
                    title: "Limpiar búsqueda",
                    onClick:
                      n[1] || (n[1] = (v) => u.$emit("update:modelValue", "")),
                  },
                  [k(w(me), { class: "search--dashboard__clear__icon" })],
                ))
              : F("", !0),
          ]),
        ])
      );
    },
  }),
  Te = Object.assign(Ce, { __name: "SearchDashboard" }),
  Pe = { class: "filter filter--default" },
  Ve = { class: "filter--default__wrapper" },
  Ae = { key: 0, class: "filter--default__sort" },
  De = ["onClick"],
  $e = { key: 1, class: "filter--default__pagesize" },
  Oe = ["onClick"],
  Le = E({
    __name: "FilterDefault",
    props: { modelValue: {}, sortOptions: {}, pageSizes: {} },
    emits: ["update:modelValue"],
    setup(e, { emit: u }) {
      const n = e,
        v = u,
        f = t(!1),
        y = t(!1),
        _ = a(
          () =>
            n.sortOptions?.find((o) => o.value === n.modelValue.sortBy)
              ?.label || n.modelValue.sortBy,
        ),
        B = (c) => {
          (v("update:modelValue", { ...n.modelValue, sortBy: c }),
            (f.value = !1));
        },
        b = (c) => {
          (v("update:modelValue", { ...n.modelValue, pageSize: c }),
            (y.value = !1));
        },
        S = (c) => {
          c.target.closest(".filter--default") ||
            ((f.value = !1), (y.value = !1));
        };
      return (
        _e(() => {
          document.addEventListener("click", S);
        }),
        Be(() => {
          document.removeEventListener("click", S);
        }),
        (c, o) => (
          g(),
          p("div", Pe, [
            m("div", Ve, [
              e.sortOptions && e.sortOptions.length > 0
                ? (g(),
                  p("div", Ae, [
                    m(
                      "button",
                      {
                        class: "filter--default__button",
                        onClick: o[0] || (o[0] = (r) => (f.value = !f.value)),
                      },
                      [
                        k(w(he), { class: "filter--default__button__icon" }),
                        m("span", null, I(_.value), 1),
                        k(w(x), { class: "filter--default__button__arrow" }),
                      ],
                    ),
                    f.value
                      ? (g(),
                        p(
                          "div",
                          {
                            key: 0,
                            class: "filter--default__dropdown",
                            onClick: o[1] || (o[1] = j(() => {}, ["stop"])),
                          },
                          [
                            (g(!0),
                            p(
                              R,
                              null,
                              T(
                                e.sortOptions,
                                (r) => (
                                  g(),
                                  p(
                                    "button",
                                    {
                                      key: r.value,
                                      class: q([
                                        "filter--default__dropdown__item",
                                        {
                                          "filter--default__dropdown__item--active":
                                            e.modelValue.sortBy === r.value,
                                        },
                                      ]),
                                      onClick: (z) => B(r.value),
                                    },
                                    I(r.label),
                                    11,
                                    De,
                                  )
                                ),
                              ),
                              128,
                            )),
                          ],
                        ))
                      : F("", !0),
                  ]))
                : F("", !0),
              e.pageSizes && e.pageSizes.length > 0
                ? (g(),
                  p("div", $e, [
                    m(
                      "button",
                      {
                        class: "filter--default__button",
                        onClick: o[2] || (o[2] = (r) => (y.value = !y.value)),
                      },
                      [
                        k(w(ze), { class: "filter--default__button__icon" }),
                        m("span", null, I(e.modelValue.pageSize) + " pag.", 1),
                        k(w(x), { class: "filter--default__button__arrow" }),
                      ],
                    ),
                    y.value
                      ? (g(),
                        p(
                          "div",
                          {
                            key: 0,
                            class: "filter--default__dropdown",
                            onClick: o[3] || (o[3] = j(() => {}, ["stop"])),
                          },
                          [
                            (g(!0),
                            p(
                              R,
                              null,
                              T(
                                e.pageSizes,
                                (r) => (
                                  g(),
                                  p(
                                    "button",
                                    {
                                      key: r,
                                      class: q([
                                        "filter--default__dropdown__item",
                                        {
                                          "filter--default__dropdown__item--active":
                                            e.modelValue.pageSize === r,
                                        },
                                      ]),
                                      onClick: (z) => b(r),
                                    },
                                    I(r) + " pag. ",
                                    11,
                                    Oe,
                                  )
                                ),
                              ),
                              128,
                            )),
                          ],
                        ))
                      : F("", !0),
                  ]))
                : F("", !0),
            ]),
          ])
        )
      );
    },
  }),
  qe = Object.assign(Le, { __name: "FilterDefault" }),
  s = {
    searchTerm: "",
    sortBy: "createdAt:desc",
    pageSize: 25,
    currentPage: 1,
  },
  xe = be(
    "settings",
    () => {
      const e = t({ ...s }),
        u = t({ ...s }),
        n = t({ ...s }),
        v = t({ ...s }),
        f = t({ ...s }),
        y = t({ ...s }),
        _ = t({ ...s }),
        B = t({ ...s }),
        b = t({ ...s }),
        S = t({ ...s }),
        c = t({ ...s }),
        o = t({ ...s }),
        r = t({ ...s }),
        z = t({ ...s, sortBy: "order:asc" }),
        C = t({ ...s, sortBy: "order:asc" }),
        P = t({ ...s, sortBy: "order:asc" }),
        V = t({ ...s }),
        A = t({ ...s }),
        D = t({ ...s }),
        $ = t({ ...s }),
        O = t({ ...s }),
        L = t({ ...s }),
        M = a(() => ({ sortBy: e.value.sortBy, pageSize: e.value.pageSize })),
        U = a(() => ({ sortBy: u.value.sortBy, pageSize: u.value.pageSize })),
        N = a(() => ({ sortBy: n.value.sortBy, pageSize: n.value.pageSize })),
        J = a(() => ({ sortBy: v.value.sortBy, pageSize: v.value.pageSize })),
        Q = a(() => ({ sortBy: f.value.sortBy, pageSize: f.value.pageSize })),
        X = a(() => ({ sortBy: y.value.sortBy, pageSize: y.value.pageSize })),
        Z = a(() => ({ sortBy: _.value.sortBy, pageSize: _.value.pageSize })),
        G = a(() => ({ sortBy: B.value.sortBy, pageSize: B.value.pageSize })),
        H = a(() => ({ sortBy: b.value.sortBy, pageSize: b.value.pageSize })),
        K = a(() => ({ sortBy: S.value.sortBy, pageSize: S.value.pageSize })),
        W = a(() => ({ sortBy: c.value.sortBy, pageSize: c.value.pageSize })),
        Y = a(() => ({ sortBy: o.value.sortBy, pageSize: o.value.pageSize })),
        ee = a(() => ({ sortBy: r.value.sortBy, pageSize: r.value.pageSize })),
        te = a(() => ({ sortBy: z.value.sortBy, pageSize: z.value.pageSize })),
        se = a(() => ({ sortBy: C.value.sortBy, pageSize: C.value.pageSize })),
        ae = a(() => ({ sortBy: P.value.sortBy, pageSize: P.value.pageSize })),
        oe = a(() => ({ sortBy: V.value.sortBy, pageSize: V.value.pageSize })),
        re = a(() => ({ sortBy: D.value.sortBy, pageSize: D.value.pageSize })),
        ne = a(() => ({ sortBy: $.value.sortBy, pageSize: $.value.pageSize })),
        le = a(() => ({ sortBy: A.value.sortBy, pageSize: A.value.pageSize })),
        ie = a(() => ({ sortBy: O.value.sortBy, pageSize: O.value.pageSize })),
        ue = a(() => ({ sortBy: L.value.sortBy, pageSize: L.value.pageSize }));
      function ce(l, d) {
        const i = h(l);
        ((i.value.searchTerm = d), (i.value.currentPage = 1));
      }
      function de(l, d) {
        const i = h(l);
        ((i.value.sortBy = d), (i.value.currentPage = 1));
      }
      function ge(l, d) {
        const i = h(l);
        ((i.value.pageSize = d), (i.value.currentPage = 1));
      }
      function pe(l, d) {
        const i = h(l);
        i.value.currentPage = d;
      }
      function ve(l, d) {
        const i = h(l);
        ((i.value.sortBy = d.sortBy),
          (i.value.pageSize = d.pageSize),
          (i.value.currentPage = 1));
      }
      function fe(l) {
        const d = h(l);
        d.value = { ...s };
      }
      function h(l) {
        switch (l) {
          case "orders":
            return e;
          case "adsPendings":
            return u;
          case "adsActives":
            return n;
          case "adsArchived":
            return v;
          case "adsBanned":
            return f;
          case "adsRejected":
            return y;
          case "adsAbandoned":
            return _;
          case "adsDraft":
            return B;
          case "users":
            return b;
          case "reservations":
            return S;
          case "featured":
            return c;
          case "categories":
            return o;
          case "conditions":
            return r;
          case "faqs":
            return z;
          case "policies":
            return C;
          case "terms":
            return P;
          case "packs":
            return V;
          case "regions":
            return A;
          case "subscriptionPayments":
            return D;
          case "subscriptionPros":
            return $;
          case "communes":
            return O;
          case "articles":
            return L;
          default:
            throw new Error(`Unknown section: ${l}`);
        }
      }
      return {
        orders: e,
        adsPendings: u,
        adsActives: n,
        adsArchived: v,
        adsBanned: f,
        adsRejected: y,
        adsAbandoned: _,
        adsDraft: B,
        users: b,
        reservations: S,
        featured: c,
        categories: o,
        conditions: r,
        faqs: z,
        policies: C,
        terms: P,
        packs: V,
        regions: A,
        communes: O,
        articles: L,
        subscriptionPayments: D,
        subscriptionPros: $,
        getOrdersFilters: M,
        getAdsPendingsFilters: U,
        getAdsActivesFilters: N,
        getAdsArchivedFilters: J,
        getAdsBannedFilters: Q,
        getAdsRejectedFilters: X,
        getAdsAbandonedFilters: Z,
        getAdsDraftFilters: G,
        getUsersFilters: H,
        getReservationsFilters: K,
        getFeaturedFilters: W,
        getCategoriesFilters: Y,
        getConditionsFilters: ee,
        getFaqsFilters: te,
        getPoliciesFilters: se,
        getTermsFilters: ae,
        getPacksFilters: oe,
        getSubscriptionPaymentsFilters: re,
        getSubscriptionProsFilters: ne,
        getRegionsFilters: le,
        getCommunesFilters: ie,
        getArticlesFilters: ue,
        setSearchTerm: ce,
        setSortBy: de,
        setPageSize: ge,
        setCurrentPage: pe,
        setFilters: ve,
        resetSection: fe,
      };
    },
    {
      persist: {
        storage: typeof window < "u" ? localStorage : void 0,
        key: "settings",
      },
    },
  );
export { Te as _, qe as a, xe as u };
//# sourceMappingURL=Bn4ou5Ry.js.map

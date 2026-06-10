import { _ as D } from "./vgLiQXkW.js";
import { _ as g, a as k } from "./RoATBwxO.js";
import { _ as C } from "./C2l5JNgr.js";
import {
  aZ as I,
  b2 as F,
  b3 as E,
  b4 as B,
  a_ as c,
  a$ as $,
  b0 as o,
  b1 as l,
  b5 as _,
  b6 as p,
  b7 as b,
  b8 as T,
  b9 as y,
  ba as Q,
} from "./BK8sApmn.js";
import { F as G } from "./CP9GxK4v.js";
import { f as v } from "./CjIigZ6h.js";
import "./CNKn_OHC.js";
import "./BZsGLQuR.js";
import "./Db0x1g0W.js";
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
    t = new a.Error().stack;
  t &&
    ((a._sentryDebugIds = a._sentryDebugIds || {}),
    (a._sentryDebugIds[t] = "9ce873de-6f0a-4ef8-a0a7-61255da4b772"),
    (a._sentryDebugIdIdentifier =
      "sentry-dbid-9ce873de-6f0a-4ef8-a0a7-61255da4b772"));
} catch {}
const K = I({
  __name: "edit",
  async setup(a) {
    let t, u;
    const r = F(),
      e = T(null),
      m = E(),
      h = y(() => e.value?.title || "FAQ"),
      q = y(() => [
        { label: "FAQs", to: "/dashboard/maintenance/faqs" },
        ...(e.value?.title
          ? [
              {
                label: e.value.title,
                to: `/dashboard/maintenance/faqs/${r.params.id}`,
              },
            ]
          : []),
        { label: "Editar" },
      ]),
      w = (n) => {
        n && (e.value = n);
      },
      { data: x } =
        (([t, u] = B(async () =>
          Q(`faq-edit-${r.params.id}`, async () => {
            const n = r.params.id;
            if (!n) return null;
            const i = await m("faqs", {
                method: "GET",
                params: { filters: { documentId: { $eq: n } } },
              }),
              s = Array.isArray(i.data) ? i.data[0] : null;
            return s || (await m(`faqs/${n}`, { method: "GET" })).data || null;
          }),
        )),
        (t = await t),
        u(),
        t);
    return (
      (e.value = x.value ?? null),
      (n, i) => {
        const s = D,
          d = g,
          f = C,
          A = k;
        return (
          c(),
          $("div", null, [
            o(s, { title: h.value, breadcrumbs: q.value }, null, 8, [
              "title",
              "breadcrumbs",
            ]),
            o(A, null, {
              content: l(() => [
                o(
                  d,
                  { title: "Editar FAQ", columns: 1 },
                  {
                    default: l(() => [
                      o(G, { faq: e.value, onSaved: w }, null, 8, ["faq"]),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              sidebar: l(() => [
                o(
                  d,
                  { title: "Detalles", columns: 1 },
                  {
                    default: l(() => [
                      e.value
                        ? (c(),
                          _(
                            f,
                            {
                              key: 0,
                              title: "Fecha de creación",
                              description: p(v)(e.value.createdAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : b("", !0),
                      e.value
                        ? (c(),
                          _(
                            f,
                            {
                              key: 1,
                              title: "Última modificación",
                              description: p(v)(e.value.updatedAt),
                            },
                            null,
                            8,
                            ["description"],
                          ))
                        : b("", !0),
                    ]),
                    _: 1,
                  },
                ),
              ]),
              _: 1,
            }),
          ])
        );
      }
    );
  },
});
export { K as default };
//# sourceMappingURL=BP2oAf8e.js.map

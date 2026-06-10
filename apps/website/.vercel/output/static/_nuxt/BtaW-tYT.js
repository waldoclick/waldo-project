import { cZ as c, bJ as p } from "./BK8sApmn.js";
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
    s = new e.Error().stack;
  s &&
    ((e._sentryDebugIds = e._sentryDebugIds || {}),
    (e._sentryDebugIds[s] = "2da28297-24a8-403b-9c1b-ce319acd2ad3"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-2da28297-24a8-403b-9c1b-ce319acd2ad3"));
} catch {}
const r = () => {
    const e = c();
    return {
      find: (a, t, n) => e(`/${a}`, { method: "GET", params: t, ...n }),
      findOne: (a, t, n, o) => {
        const d = [a, t].filter(Boolean).join("/");
        return e(d, { method: "GET", params: n, ...o });
      },
      create: (a, t, n = {}) =>
        e(`/${a}`, { method: "POST", body: { data: t }, params: n }),
      update: (a, t, n, o = {}) => {
        typeof t == "object" && ((n = t), (t = void 0));
        const d = [a, t].filter(Boolean).join("/");
        return e(d, { method: "PUT", body: { data: n }, params: o });
      },
      delete: (a, t, n) => {
        const o = [a, t].filter(Boolean).join("/");
        return e(o, { method: "DELETE", params: n });
      },
    };
  },
  y = p("packs", {
    state: () => ({ packs: [] }),
    actions: {
      async loadPacks() {
        const s = await r().find("ad-packs", { populate: "*" });
        this.packs = s.data;
      },
      async getPackById(e) {
        return (
          await r().find("ad-packs", {
            filters: { documentId: { $eq: e } },
            populate: "*",
          })
        ).data?.[0];
      },
    },
  });
export { r as a, y as u };
//# sourceMappingURL=BtaW-tYT.js.map

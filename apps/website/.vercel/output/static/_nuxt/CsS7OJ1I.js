import { b3 as t, cH as d, b8 as o } from "./BK8sApmn.js";
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
    (e._sentryDebugIds[s] = "956da7b8-df31-4814-976b-8abdbb737f08"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-956da7b8-df31-4814-976b-8abdbb737f08"));
} catch {}
const a = o([]),
  r = () => {
    const e = t(),
      s = async () => {
        const n = await e("ad-packs", {
          method: "GET",
          params: { populate: "*" },
        });
        a.value = n.data;
      };
    return { packs: d(a), loadPacks: s };
  };
export { r as u };
//# sourceMappingURL=CsS7OJ1I.js.map

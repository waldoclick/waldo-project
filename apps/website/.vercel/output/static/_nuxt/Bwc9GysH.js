import { b9 as a, b8 as s } from "./BK8sApmn.js";
try {
  let n =
      typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof globalThis < "u"
            ? globalThis
            : typeof self < "u"
              ? self
              : {},
    r = new n.Error().stack;
  r &&
    ((n._sentryDebugIds = n._sentryDebugIds || {}),
    (n._sentryDebugIds[r] = "4de8d87b-1048-48e3-aa7e-a093ffcfa820"),
    (n._sentryDebugIdIdentifier =
      "sentry-dbid-4de8d87b-1048-48e3-aa7e-a093ffcfa820"));
} catch {}
const l = s([]);
function c() {
  const n = (e) => {
      const t = Array.isArray(e) ? e : [e];
      for (const o of t)
        l.value.push({ file: o, blobUrl: URL.createObjectURL(o) });
    },
    r = (e) => {
      const t = l.value.findIndex((o) => o.blobUrl === e);
      if (t !== -1) {
        const o = l.value[t];
        (o && URL.revokeObjectURL(o.blobUrl), l.value.splice(t, 1));
      }
    },
    d = a(() =>
      l.value.map((e) => ({
        id: e.blobUrl,
        url: e.blobUrl,
        pending: !0,
        formats: { thumbnail: { url: e.blobUrl } },
      })),
    ),
    i = a(() => l.value.length);
  return {
    pendingGalleryItems: d,
    pendingCount: i,
    addPending: n,
    removePending: r,
    clearAll: () => {
      for (const e of l.value) URL.revokeObjectURL(e.blobUrl);
      l.value = [];
    },
    getPendingFiles: () =>
      l.value.map((e) => ({ file: e.file, blobUrl: e.blobUrl })),
  };
}
export { c as u };
//# sourceMappingURL=Bwc9GysH.js.map

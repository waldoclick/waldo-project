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
    (e._sentryDebugIds[t] = "12e2a2e2-c8db-44c2-967c-1c4a7726e617"),
    (e._sentryDebugIdIdentifier =
      "sentry-dbid-12e2a2e2-c8db-44c2-967c-1c4a7726e617"));
} catch (e) {}
function base64ToUint8Array(e) {
  const t = atob(e),
    n = t.length,
    r = new Uint8Array(n);
  for (let e = 0; e < n; e++) r[e] = t.charCodeAt(e);
  return r;
}
export { base64ToUint8Array as b };
//# sourceMappingURL=_raw-helpers.mjs.map
